import { IncomingMessage, ServerResponse } from "node:http";
import { verificationPipeline } from "../verification/pipeline.ts";
import { defaultRepository } from "../storage/memoryRepository.ts";
import { veraTelegramBot } from "../telegram/bot.ts";
import type { VerificationRecord } from "../types/domain.ts";
import {
  VerificationRequestSchema,
  CorrectRequestSchema,
  ResubmitRequestSchema,
  normalizeVerificationRequest,
} from "../types/schemas.ts";



// Helper to parse JSON body from incoming request
async function parseJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data.trim()) {
        resolve({} as T);
        return;
      }
      try {
        resolve(JSON.parse(data) as T);
      } catch {
        reject(new Error("Malformed JSON payload"));
      }
    });
    req.on("error", reject);
  });
}

// Helper to send JSON responses
function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  const jsonStr = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(jsonStr);
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  if (!req.url) {
    return false;
  }
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const isVerify = url.pathname.startsWith("/v1/verify");
  const isWebhook = url.pathname.startsWith("/telegram/webhook") || url.pathname.startsWith("/v1/telegram/webhook");
  const isHealth = url.pathname === "/health" || url.pathname === "/v1/health";
  if (!isVerify && !isWebhook && !isHealth) {
    return false;
  }

  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return true;
  }

  const pathname = url.pathname;

  try {
    // ----------------------------------------------------
    // GET /health or /v1/health
    // ----------------------------------------------------
    if ((pathname === "/health" || pathname === "/v1/health") && req.method === "GET") {
      const isTelegramConfigured = veraTelegramBot.isConfigured();
      const isPolling = veraTelegramBot.isPollingActive();
      const botUsername = veraTelegramBot.getBotUsername();

      sendJson(res, 200, {
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "0.2.0",
        telegram: {
          configured: isTelegramConfigured,
          polling: isPolling,
          botUsername: botUsername ? `@${botUsername}` : null,
          webhookEnabled: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET || process.env.TELEGRAM_WEBHOOK_URL),
        },
        stellar: {
          network: process.env.STELLAR_NETWORK || "testnet",
          rpcUrl: process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
          horizonUrl: process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org",
        },
      });
      return true;
    }

    // ----------------------------------------------------
    // POST /telegram/webhook or /v1/telegram/webhook
    // ----------------------------------------------------
    if ((pathname === "/telegram/webhook" || pathname === "/v1/telegram/webhook") && req.method === "POST") {
      const handler = veraTelegramBot.createWebhookHandler();
      return handler(req, res);
    }

    // ----------------------------------------------------
    // POST /v1/verify
    // ----------------------------------------------------
    if (pathname === "/v1/verify" && req.method === "POST") {
      const body = await parseJsonBody<unknown>(req);
      const parseResult = VerificationRequestSchema.safeParse(body);

      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        sendJson(res, 400, {
          error: "Invalid request",
          message: firstIssue?.message || "Invalid verification request payload",
          issues: parseResult.error.issues,
        });
        return true;
      }

      const normalizedRequest = normalizeVerificationRequest(parseResult.data);

      // Execute real deterministic verification pipeline
      const record: VerificationRecord = await verificationPipeline.run(normalizedRequest);

      // Persist in repository
      await defaultRepository.create(record);

      // Return structured response matching Section 14
      const responsePayload = {
        verificationId: record.displayId || record.id,
        id: record.id,
        status: record.verdict.status,
        task: record.task,
        worker: record.worker,
        requirements: record.requirements,
        claims: record.claims,
        evidence: record.evidence,
        checks: record.checks,
        verdict: record.verdict,
        remediation: record.remediation,
        attempt: record.attempt,
        maxAttempts: record.maxAttempts,
        createdAt: record.createdAt,
        record, // complete record for frontend consumption
      };

      sendJson(res, 201, responsePayload);
      return true;
    }

    // ----------------------------------------------------
    // GET /v1/verify (List)
    // ----------------------------------------------------
    if (pathname === "/v1/verify" && req.method === "GET") {
      const statusFilter = url.searchParams.get("status") || undefined;
      const searchFilter = url.searchParams.get("search") || undefined;

      const list = await defaultRepository.list({
        status: statusFilter,
        search: searchFilter,
      });

      sendJson(res, 200, { verifications: list });
      return true;
    }

    // ----------------------------------------------------
    // GET /v1/verify/:verificationId
    // ----------------------------------------------------
    const singleMatch = pathname.match(/^\/v1\/verify\/([^/]+)$/);
    if (singleMatch && req.method === "GET") {
      const id = decodeURIComponent(singleMatch[1]);
      const record = await defaultRepository.get(id);

      if (!record) {
        sendJson(res, 404, {
          error: "Not Found",
          message: `Verification with ID '${id}' was not found.`,
        });
        return true;
      }

      sendJson(res, 200, record);
      return true;
    }

    // ----------------------------------------------------
    // GET /v1/verify/:verificationId/evidence
    // ----------------------------------------------------
    const evidenceMatch = pathname.match(/^\/v1\/verify\/([^/]+)\/evidence$/);
    if (evidenceMatch && req.method === "GET") {
      const id = decodeURIComponent(evidenceMatch[1]);
      const record = await defaultRepository.get(id);

      if (!record) {
        sendJson(res, 404, {
          error: "Not Found",
          message: `Verification with ID '${id}' was not found.`,
        });
        return true;
      }

      sendJson(res, 200, {
        verificationId: record.displayId || record.id,
        id: record.id,
        evidence: record.evidence,
      });
      return true;
    }

    // ----------------------------------------------------
    // GET /v1/verify/:verificationId/checks
    // ----------------------------------------------------
    const checksMatch = pathname.match(/^\/v1\/verify\/([^/]+)\/checks$/);
    if (checksMatch && req.method === "GET") {
      const id = decodeURIComponent(checksMatch[1]);
      const record = await defaultRepository.get(id);

      if (!record) {
        sendJson(res, 404, {
          error: "Not Found",
          message: `Verification with ID '${id}' was not found.`,
        });
        return true;
      }

      sendJson(res, 200, {
        verificationId: record.displayId || record.id,
        id: record.id,
        checks: record.checks,
      });
      return true;
    }

    // ----------------------------------------------------
    // POST /v1/verify/:verificationId/correct
    // ----------------------------------------------------
    const correctMatch = pathname.match(/^\/v1\/verify\/([^/]+)\/correct$/);
    if (correctMatch && req.method === "POST") {
      const id = decodeURIComponent(correctMatch[1]);
      const record = await defaultRepository.get(id);

      if (!record) {
        sendJson(res, 404, {
          error: "Not Found",
          message: `Verification with ID '${id}' was not found.`,
        });
        return true;
      }

      const body = await parseJsonBody<unknown>(req);
      const parseResult = CorrectRequestSchema.safeParse(body);

      if (!parseResult.success) {
        sendJson(res, 400, {
          error: "Invalid request",
          message: parseResult.error.issues[0]?.message || "Invalid correction payload",
          issues: parseResult.error.issues,
        });
        return true;
      }

      const instruction = parseResult.data.instruction || parseResult.data.note || "Please correct the output according to requirements.";

      const directive = {
        id: `dir_custom_${Date.now().toString(36)}`,
        type: "CORRECT_TRANSACTION" as const,
        requirementId: record.requirements[0]?.id || "req_1",
        directive: instruction,
        reason: instruction,
        required: instruction,
      };

      if (!record.remediation) {
        record.remediation = {
          status: "FAIL",
          retryable: true,
          attempt: record.attempt,
          maxAttempts: record.maxAttempts,
          directives: [directive],
        };
      } else {
        record.remediation.directives = [directive, ...(record.remediation.directives || [])];
      }

      await defaultRepository.update(record);
      sendJson(res, 200, record);
      return true;
    }

    // ----------------------------------------------------
    // POST /v1/verify/:verificationId/resubmit
    // ----------------------------------------------------
    const resubmitMatch = pathname.match(/^\/v1\/verify\/([^/]+)\/resubmit$/);
    if (resubmitMatch && req.method === "POST") {
      const id = decodeURIComponent(resubmitMatch[1]);
      const record = await defaultRepository.get(id);

      if (!record) {
        sendJson(res, 404, {
          error: "Not Found",
          message: `Verification with ID '${id}' was not found.`,
        });
        return true;
      }

      if (record.attempt >= record.maxAttempts) {
        sendJson(res, 400, {
          error: "Max Attempts Exceeded",
          message: `Verification '${id}' has reached maximum attempt limit (${record.maxAttempts}).`,
        });
        return true;
      }

      const body = await parseJsonBody<unknown>(req);
      const parseResult = ResubmitRequestSchema.safeParse(body);

      if (!parseResult.success) {
        sendJson(res, 400, {
          error: "Invalid request",
          message: parseResult.error.issues[0]?.message || "Invalid resubmission payload",
          issues: parseResult.error.issues,
        });
        return true;
      }

      let newOutput = parseResult.data.correctedWorkerOutput || parseResult.data.workerOutput;
      if (!newOutput) {
        newOutput = record.worker.output;
        const hashToAdd = parseResult.data.supplementalTxHash || parseResult.data.txHash;
        if (hashToAdd) {
          if (/\b(?:txhash|tx|hash):\s*[0-9a-fA-Fx]+/i.test(newOutput)) {
            newOutput = newOutput.replace(/\b(?:txhash|tx|hash):\s*[0-9a-fA-Fx]+/i, `TxHash: ${hashToAdd}`);
          } else {
            newOutput = `${newOutput}\nTxHash: ${hashToAdd}`;
          }
        }
      }

      const nextAttempt = record.attempt + 1;

      // Re-run verification pipeline with updated output and advanced attempt number
      const updatedRecord = await verificationPipeline.run(
        {
          task: record.task,
          worker: {
            ...record.worker,
            output: newOutput,
          },
          options: {
            maxAttempts: record.maxAttempts,
          },
        },
        nextAttempt
      );

      // Preserve persistent ID and merge attempt histories
      updatedRecord.id = record.id;
      updatedRecord.displayId = record.displayId;
      updatedRecord.createdAt = record.createdAt;
      updatedRecord.telegramUserId = record.telegramUserId;
      updatedRecord.telegramChatId = record.telegramChatId;
      updatedRecord.attempts = [
        ...(record.attempts || []),
        ...(updatedRecord.attempts || []),
      ];

      await defaultRepository.update(updatedRecord);
      sendJson(res, 200, updatedRecord);
      return true;
    }

    return false;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal verification engine error";
    sendJson(res, 500, {
      error: "Internal Error",
      message,
    });
    return true;
  }
}
