import { IncomingMessage, ServerResponse } from "node:http";
import { verificationPipeline } from "../verification/pipeline.ts";
import { defaultRepository } from "../storage/memoryRepository.ts";
import type { VerificationRequest, VerificationRecord } from "../types/domain.ts";



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
  const url = req.url ? new URL(req.url, `http://${req.headers.host || "localhost"}`) : null;
  if (!url || !url.pathname.startsWith("/v1/verify")) {
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
    // POST /v1/verify
    // ----------------------------------------------------
    if (pathname === "/v1/verify" && req.method === "POST") {
      const body = await parseJsonBody<VerificationRequest>(req);

      // Support both { task, worker } and { taskSpec, workerOutput }
      const rawBody = body as any;
      const taskStr = typeof rawBody.task === "string" 
        ? rawBody.task 
        : (rawBody.taskSpec?.description || rawBody.taskSpec?.title || (typeof rawBody.taskSpec === "string" ? rawBody.taskSpec : null));
      const workerOutputStr = typeof rawBody.worker?.output === "string"
        ? rawBody.worker.output
        : (rawBody.workerOutput?.rawOutput || (typeof rawBody.workerOutput === "string" ? rawBody.workerOutput : null));

      if (!taskStr) {
        sendJson(res, 400, {
          error: "Invalid request",
          message: "Field 'task' (or 'taskSpec.description') is required and must be a string.",
        });
        return true;
      }

      if (!workerOutputStr) {
        sendJson(res, 400, {
          error: "Invalid request",
          message: "Field 'worker.output' (or 'workerOutput.rawOutput') is required and must be a string.",
        });
        return true;
      }

      const normalizedRequest: VerificationRequest = {
        task: taskStr,
        worker: {
          output: workerOutputStr,
          workerId: rawBody.worker?.workerId || rawBody.workerOutput?.workerId || "worker-agent",
        },
        metadata: rawBody.metadata || rawBody.taskSpec?.metadata,
      };

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
    // POST /v1/verify/:verificationId/correct
    // POST /v1/verify/:verificationId/resubmit
    // ----------------------------------------------------
    const correctMatch =
      pathname.match(/^\/v1\/verify\/([^/]+)\/correct$/) ||
      pathname.match(/^\/v1\/verify\/([^/]+)\/resubmit$/);
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

      if (record.attempt >= record.maxAttempts) {
        sendJson(res, 400, {
          error: "Max Attempts Exceeded",
          message: `Verification '${id}' has reached maximum attempt limit (${record.maxAttempts}).`,
        });
        return true;
      }

      const body = await parseJsonBody<{
        correctedWorkerOutput?: string;
        workerOutput?: string;
        supplementalTxHash?: string;
        txHash?: string;
      }>(req);

      let newOutput = body.correctedWorkerOutput || body.workerOutput;
      if (!newOutput) {
        newOutput = record.worker.output;
        const hashToAdd = body.supplementalTxHash || body.txHash;
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
