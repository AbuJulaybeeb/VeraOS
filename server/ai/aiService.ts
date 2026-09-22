import type { VerificationRecord } from "../types/domain.ts";

export interface ParsedVerificationPrompt {
  isVerification: boolean;
  task?: string;
  workerOutput?: string;
  confidence?: number;
}

export class AiService {
  private geminiApiKey?: string;
  private openaiApiKey?: string;
  private geminiModel: string;
  private openaiModel: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    this.openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  isConfigured(): boolean {
    return Boolean(
      (this.geminiApiKey && this.geminiApiKey.trim().length > 0) ||
      (this.openaiApiKey && this.openaiApiKey.trim().length > 0)
    );
  }

  getActiveProvider(): "gemini" | "openai" | "deterministic" {
    if (this.geminiApiKey && this.geminiApiKey.trim()) return "gemini";
    if (this.openaiApiKey && this.openaiApiKey.trim()) return "openai";
    return "deterministic";
  }

  /**
   * Parses natural language into structured task and workerOutput.
   * If AI is not configured or fails, falls back to deterministic rule extraction.
   */
  async parseVerificationPrompt(text: string): Promise<ParsedVerificationPrompt> {
    const trimmed = text.trim();
    if (!trimmed) {
      return { isVerification: false };
    }

    // 1. Check if user already formatted with standard pipe syntax "task | output"
    if (trimmed.includes("|")) {
      const parts = trimmed.split("|").map((p) => p.trim());
      return {
        isVerification: true,
        task: parts[0],
        workerOutput: parts[1] || parts[0],
        confidence: 1.0,
      };
    }

    // 2. If AI is configured, invoke LLM intent parser
    if (this.isConfigured()) {
      try {
        const prompt =
          "You are an AI intent parser for VeraOS, the verification layer for autonomous AI agents.\n" +
          "Analyze the user message and determine if they want to verify an AI agent's task or payment.\n" +
          "Extract the intended task (what was required) and the worker's reported output (what was claimed or done, including tx hash).\n\n" +
          `User Message: """${trimmed}"""\n\n` +
          "Respond strictly in valid JSON format with this exact structure:\n" +
          "{\n" +
          '  "isVerification": true or false,\n' +
          '  "task": "extracted required task prompt",\n' +
          '  "workerOutput": "extracted worker claim and transaction details"\n' +
          "}\n";

        const rawJson = await this.callLlm(prompt);
        if (rawJson) {
          const cleaned = rawJson.replace(/```(?:json)?/gi, "").trim();
          const parsed = JSON.parse(cleaned) as {
            isVerification?: boolean;
            task?: string;
            workerOutput?: string;
          };

          if (parsed.isVerification && parsed.task && parsed.workerOutput) {
            return {
              isVerification: true,
              task: parsed.task,
              workerOutput: parsed.workerOutput,
              confidence: 0.95,
            };
          }
        }
      } catch (err) {
        console.warn("[VeraOS AI] Error in AI prompt parsing, falling back to deterministic extraction:", (err as Error).message);
      }
    }

    // 3. Deterministic heuristic fallback
    const hasTxHash = /\b(?:txhash|tx|hash):\s*[0-9a-fA-Fx]+|\b0x[0-9a-fA-F]{16,66}\b|\b[0-9a-fA-F]{64}\b/i.test(trimmed);
    const hasPaymentKeywords = /\b(?:send|sent|pay|paid|transfer|transferred|usdc|xlm)\b/i.test(trimmed);

    if (hasTxHash || hasPaymentKeywords) {
      return {
        isVerification: true,
        task: trimmed,
        workerOutput: trimmed,
        confidence: 0.7,
      };
    }

    return {
      isVerification: false,
    };
  }

  /**
   * Generates a conversational explanation of a deterministic VerificationRecord.
   */
  async explainVerdict(record: VerificationRecord, userQuestion?: string): Promise<string> {
    const isVerified = record.verdict.status === "VERIFIED";
    const statusText = record.verdict.status;
    const checks = record.checks || [];
    const checkSummaries = checks
      .map((c) => `- ${c.status.toUpperCase()}: ${c.explanation || `${c.expected} vs ${c.observed}`}`)
      .join("\n");

    const remediation =
      record.remediation?.directives
        ?.map((d) => d.reason || `${d.type}${d.required ? `: ${String(d.required)}` : ""}`)
        .join("; ") || "None required";

    // 1. If AI is configured, provide natural language conversational synthesis
    if (this.isConfigured()) {
      try {
        const prompt =
          "You are the VeraOS AI Assistant inside Telegram. VeraOS independently verifies AI agent work against authoritative primary sources (like Stellar Testnet blockchain).\n" +
          "Here is the authoritative, deterministic verification record from the ledger:\n\n" +
          `Verification ID: ${record.displayId || record.id}\n` +
          `Verdict Status: ${statusText}\n` +
          `Task Required: ${record.task}\n` +
          `Worker Output: ${record.worker.output}\n` +
          `Deterministic Checks:\n${checkSummaries}\n` +
          `Remediation Directives: ${remediation}\n\n` +
          (userQuestion ? `User Question: "${userQuestion}"\n\n` : "") +
          "Instructions:\n" +
          "1. Explain the verification outcome in clear, concise, friendly language.\n" +
          "2. The math and blockchain checks above are authoritative facts. Never contradict the verdict status.\n" +
          "3. If FAILED, clearly explain the difference/deficit (e.g. expected amount vs observed amount) and advise what the worker needs to correct.\n" +
          "4. Keep the message well-formatted with concise bullets and emoji suitable for Telegram.";

        const response = await this.callLlm(prompt);
        if (response && response.trim()) {
          return response.trim();
        }
      } catch (err) {
        console.warn("[VeraOS AI] Error in AI verdict explanation, falling back to deterministic template:", (err as Error).message);
      }
    }

    // 2. Deterministic Fallback Template
    if (isVerified) {
      return (
        `✅ Verification ${record.displayId || record.id} is VERIFIED.\n\n` +
        `All invariant checks passed against the Stellar Testnet ledger.\n\n` +
        `Summary of Checks:\n${checkSummaries || "✓ All requirements corroborated onchain."}`
      );
    }

    return (
      `❌ Verification ${record.displayId || record.id} FAILED.\n\n` +
      `The worker's reported claim did not match independent ledger evidence.\n\n` +
      `Checks:\n${checkSummaries}\n\n` +
      `Required Remediation:\n${remediation}`
    );
  }

  /**
   * Internal dispatcher for LLM API calls (Gemini or OpenAI).
   */
  private async callLlm(prompt: string): Promise<string | null> {
    if (this.geminiApiKey) {
      return this.callGemini(prompt);
    }
    if (this.openaiApiKey) {
      return this.callOpenAi(prompt);
    }
    return null;
  }

  private async callGemini(prompt: string): Promise<string | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.text();
        console.warn(`[VeraOS AI] Gemini API returned status ${res.status}:`, errData);
        return null;
      }

      const json = (await res.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("[VeraOS AI] Network error calling Gemini API:", (err as Error).message);
      return null;
    }
  }

  private async callOpenAi(prompt: string): Promise<string | null> {
    const url = "https://api.openai.com/v1/chat/completions";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.text();
        console.warn(`[VeraOS AI] OpenAI API returned status ${res.status}:`, errData);
        return null;
      }

      const json = (await res.json()) as {
        choices?: Array<{
          message?: { content?: string };
        }>;
      };

      return json.choices?.[0]?.message?.content || null;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("[VeraOS AI] Network error calling OpenAI API:", (err as Error).message);
      return null;
    }
  }
}

export const aiService = new AiService();
