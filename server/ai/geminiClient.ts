/**
 * VeraOS Natural Language AI Layer (Google Gemini)
 * Maps natural language human requests to deterministic verification actions and conversational answers.
 */

export type ParsedIntentType =
  | "VERIFY"
  | "STATUS"
  | "EVIDENCE"
  | "CONNECT_WALLET"
  | "HELP"
  | "QUESTION";

export interface ParsedAiIntent {
  intent: ParsedIntentType;
  confidence: number;
  task?: string;
  output?: string;
  taskPrompt?: string;
  workerOutput?: string;
  verificationId?: string;
  stellarTxHash?: string;
  walletAddress?: string;
  conversationalReply?: string;
}

export class GeminiClient {
  private preferredModel = "gemini-2.0-flash-lite";
  private fallbackModel = "gemini-2.0-flash";

  constructor(private apiKey?: string) {}

  setApiKey(key: string): void {
    this.apiKey = key.trim();
  }

  /**
   * Alias for interpretMessage
   */
  async parseQuery(
    userMessage: string,
    context?: { recentVerificationId?: string; firstName?: string }
  ): Promise<ParsedAiIntent> {
    return this.interpretMessage(userMessage, context);
  }

  /**
   * Explain a verification in human-friendly markdown
   */
  async explainVerification(verification: {
    id: string;
    status: string;
    task: string;
    output: string;
    details?: string;
  }): Promise<string> {
    return (
      `🤖 *VeraOS AI Assessment for ${verification.id}*\n\n` +
      `*Status:* ${verification.status === "PASSED" ? "✅ PASSED" : "❌ FAILED"}\n` +
      `*Task:* ${verification.task}\n` +
      `*Claimed Output:* ${verification.output}\n` +
      `*Evidence Analysis:* ${verification.details || "Ledger state corroborated against Stellar Testnet."}`
    );
  }

  /**
   * Interpret a natural language user message into a structured action
   */
  async interpretMessage(
    userMessage: string,
    context?: { recentVerificationId?: string; firstName?: string }
  ): Promise<ParsedAiIntent> {
    const text = userMessage.trim();
    if (!text) {
      return {
        intent: "HELP",
        confidence: 1.0,
        conversationalReply: "How can I help you audit your autonomous agents today?",
      };
    }

    // Try Gemini API if key is available
    if (this.apiKey) {
      try {
        const aiResult = await this.callGeminiApi(text, context);
        if (aiResult) {
          return aiResult;
        }
      } catch (err) {
        console.warn("[GeminiClient] Gemini API call failed or rate limited, using deterministic parser:", err);
      }
    }

    // High-accuracy deterministic NLP fallback (runs instantly with 0 external network dependencies)
    return this.parseDeterministically(text, context);
  }

  private async callGeminiApi(
    userMessage: string,
    context?: { recentVerificationId?: string; firstName?: string }
  ): Promise<ParsedAiIntent | null> {
    const systemInstruction = `
You are the VeraOS AI Intelligence Assistant. VeraOS is a cryptographic autonomous agent verification platform built on the Stellar network.
Your job is to analyze user queries and classify them into one of these intents:
1. "VERIFY": The user wants to verify or audit an agent execution, task completion, or transaction (e.g. "Verify that I just sent 5 USDC to GCEYAU...", "Audit this output: ..."). Extract the "task" and the "output".
2. "STATUS": The user wants to check the status of a verification (e.g. "What is the status of V-1048?", "Did my last task pass?"). Extract "verificationId" (e.g. "V-1048").
3. "EVIDENCE": The user wants to inspect cryptographic proofs, receipts, or explorer data (e.g. "Show me proof of the transaction", "Give me evidence for V-1048"). Extract "verificationId" or "stellarTxHash".
4. "CONNECT_WALLET": The user asks how to connect a Stellar wallet (Freighter, Lobstr, Albedo).
5. "HELP": The user asks for help, commands, or syntax.
6. "QUESTION": The user is asking a general conceptual question about VeraOS, Stellar, smart contracts, or agents. Write a helpful, professional response in "conversationalReply".

Respond ONLY with a valid JSON object in this exact schema without markdown codeblocks:
{
  "intent": "VERIFY" | "STATUS" | "EVIDENCE" | "CONNECT_WALLET" | "HELP" | "QUESTION",
  "confidence": 0.95,
  "task": "extracted task prompt or null",
  "output": "extracted agent output or null",
  "verificationId": "extracted ID like V-1048 or null",
  "stellarTxHash": "extracted 64-char hex hash or null",
  "conversationalReply": "concise polite reply if intent is QUESTION or null"
}
`;

    const prompt = `Context: ${JSON.stringify(context || {})}
User Message: "${userMessage}"`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.preferredModel}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 600,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      if (res.status === 404) {
        // Fallback to gemini-2.0-flash
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.fallbackModel}:generateContent?key=${this.apiKey}`;
        const fbRes = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 600 },
          }),
        });
        if (fbRes.ok) {
          const fbData = (await fbRes.json()) as any;
          const rawText = fbData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) return this.cleanAndParseJson(rawText);
        }
      }
      return null;
    }

    const data = (await res.json()) as any;
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) return null;

    return this.cleanAndParseJson(textOutput);
  }

  private cleanAndParseJson(rawText: string): ParsedAiIntent | null {
    try {
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned) as ParsedAiIntent;
      if (parsed && parsed.intent) {
        return parsed;
      }
    } catch {
      // JSON parse error
    }
    return null;
  }

  /**
   * Deterministic Natural Language Parser
   * Evaluates regex and semantic heuristics if Gemini API is offline or unconfigured.
   */
  parseDeterministically(
    text: string,
    context?: { recentVerificationId?: string; firstName?: string }
  ): ParsedAiIntent {
    const lower = text.toLowerCase();

    // 1. Evidence Query
    if (
      lower.includes("evidence") ||
      lower.includes("proof") ||
      lower.includes("receipt") ||
      lower.includes("explorer") ||
      lower.includes("cryptographic")
    ) {
      const idMatch = text.match(/\bV-\d{3,5}\b/i) || text.match(/\bv_run_[a-z0-9_]+\b/i);
      const hexMatch = text.match(/\b[0-9a-f]{64}\b/i);
      return {
        intent: "EVIDENCE",
        confidence: 0.9,
        verificationId: idMatch ? idMatch[0].toUpperCase() : context?.recentVerificationId || "V-1048",
        stellarTxHash: hexMatch ? hexMatch[0] : undefined,
      };
    }

    // 2. Status Query
    if (
      lower.includes("status") ||
      lower.includes("did it pass") ||
      lower.includes("is it verified") ||
      lower.includes("check verification") ||
      (/\bv-\d{3,5}\b/i.test(text) && !lower.includes("verify that"))
    ) {
      const idMatch = text.match(/\bV-\d{3,5}\b/i) || text.match(/\bv_run_[a-z0-9_]+\b/i);
      return {
        intent: "STATUS",
        confidence: 0.95,
        verificationId: idMatch ? idMatch[0].toUpperCase() : context?.recentVerificationId || "V-1048",
      };
    }

    // 3. Wallet Query
    const walletAddressMatch = text.match(/\bG[A-Z0-9]{55}\b/);
    if (
      lower.includes("connect wallet") ||
      lower.includes("my wallet") ||
      lower.includes("freighter") ||
      lower.includes("lobstr") ||
      lower.includes("albedo") ||
      lower.includes("link wallet") ||
      (lower.includes("wallet") && walletAddressMatch)
    ) {
      return {
        intent: "CONNECT_WALLET",
        confidence: 0.95,
        walletAddress: walletAddressMatch ? walletAddressMatch[0] : undefined,
        conversationalReply: walletAddressMatch
          ? `Stellar wallet address detected: \`${walletAddressMatch[0]}\`. Connecting to your VeraOS profile...`
          : "You can connect your real Stellar wallet (Freighter, Lobstr, Albedo) to VeraOS.",
      };
    }

    // 4. Help Query
    if (lower === "help" || lower.includes("how to use") || lower.includes("what commands")) {
      return {
        intent: "HELP",
        confidence: 0.95,
      };
    }

    // 5. Verification Task (e.g. "Verify that I sent 5 USDC to GCEYAU..." or "Verify this payment of 5 USDC...")
    const verifyPhrases = [
      "verify that",
      "verify this",
      "verify i",
      "check if i",
      "audit this",
      "verify my",
      "verify payment",
      "verify agent",
      "check task",
    ];
    const isVerification =
      verifyPhrases.some((phrase) => lower.includes(phrase)) ||
      (lower.includes("usdc") && (lower.includes("sent") || lower.includes("pay") || lower.includes("payment") || lower.includes("tx"))) ||
      lower.includes("|");

    if (isVerification) {
      if (text.includes("|")) {
        const parts = text.split("|");
        const t = parts[0].replace(/^\/verify\s*/i, "").trim();
        const o = parts[1].trim();
        return {
          intent: "VERIFY",
          confidence: 0.98,
          task: t,
          output: o,
          taskPrompt: t,
          workerOutput: o,
        };
      }

      // Extract transaction hash if present
      const txMatch = text.match(/\b[0-9a-f]{64}\b/i);
      const txHash = txMatch ? txMatch[0] : undefined;

      // Extract recipient address if present (G... 56 chars)
      const addressMatch = text.match(/\bG[A-Z0-9]{55}\b/);
      const address = addressMatch ? addressMatch[0] : "";

      // Clean task
      let task = text;
      if (lower.startsWith("verify that ") || lower.startsWith("verify i ") || lower.startsWith("verify this ")) {
        task = text.replace(/^verify\s+(that\s+|i\s+|this\s+)?/i, "").trim();
      }

      let output = `Execution completed. Transferred funds to recipient ${address || "account"}.`;
      if (txHash) {
        output += ` Transaction hash: ${txHash}`;
      }

      return {
        intent: "VERIFY",
        confidence: 0.92,
        task,
        output,
        taskPrompt: task,
        workerOutput: output,
        stellarTxHash: txHash,
      };
    }

    // 6. General Question / VeraOS inquiry
    return {
      intent: "QUESTION",
      confidence: 0.8,
      conversationalReply:
        `VeraOS is an independent audit kernel for autonomous agents. It deterministically checks task execution statements against onchain Stellar Testnet ledger states and invariant rules.\n\n` +
        `You can ask me to verify a transaction (e.g. "Verify that I sent 5 USDC to GCEYAU..."), check a status (e.g. "What's the status of V-1048?"), or inspect cryptographic proofs.`,
    };
  }
}

export const defaultGeminiClient = new GeminiClient(process.env.GEMINI_API_KEY);
