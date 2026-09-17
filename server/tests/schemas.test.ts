import test from "node:test";
import assert from "node:assert/strict";
import {
  VerificationRequestSchema,
  CorrectRequestSchema,
  ResubmitRequestSchema,
  TelegramUpdateSchema,
  normalizeVerificationRequest,
} from "../types/schemas.ts";

test("Schemas: VerificationRequestSchema validates standard request format", () => {
  const valid = {
    task: "Send 5 USDC to GCEYAU...",
    worker: {
      id: "agent_01",
      output: "Sent 5 USDC via tx 1088...",
    },
    telegramUserId: 12345,
  };

  const result = VerificationRequestSchema.safeParse(valid);
  assert.equal(result.success, true);
  if (result.success) {
    const normalized = normalizeVerificationRequest(result.data);
    assert.equal(normalized.task, valid.task);
    assert.equal(normalized.worker.output, valid.worker.output);
    assert.equal(normalized.telegramUserId, 12345);
  }
});

test("Schemas: VerificationRequestSchema supports legacy { taskSpec, workerOutput }", () => {
  const legacy = {
    taskSpec: {
      description: "Send 5 USDC to GCEYAU...",
    },
    workerOutput: {
      rawOutput: "Sent 5 USDC via tx 1088...",
    },
  };

  const result = VerificationRequestSchema.safeParse(legacy);
  assert.equal(result.success, true);
  if (result.success) {
    const normalized = normalizeVerificationRequest(result.data);
    assert.equal(normalized.task, legacy.taskSpec.description);
    assert.equal(normalized.worker.output, legacy.workerOutput.rawOutput);
  }
});

test("Schemas: VerificationRequestSchema rejects empty or missing task", () => {
  const invalid = {
    worker: {
      output: "Some worker output",
    },
  };

  const result = VerificationRequestSchema.safeParse(invalid);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((i) => i.path.includes("task")));
  }
});

test("Schemas: VerificationRequestSchema rejects empty worker output", () => {
  const invalid = {
    task: "Some task description",
    worker: {
      output: "   ",
    },
  };

  const result = VerificationRequestSchema.safeParse(invalid);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((i) => i.path.includes("output")));
  }
});

test("Schemas: CorrectRequestSchema and ResubmitRequestSchema validate cleanly", () => {
  const correct = {
    instruction: "Please transfer exact amount",
    telegramUserId: "tg_999",
  };
  const correctRes = CorrectRequestSchema.safeParse(correct);
  assert.equal(correctRes.success, true);

  const resubmit = {
    correctedWorkerOutput: "Sent 5 USDC via tx 6225...",
    supplementalTxHash: "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
  };
  const resubmitRes = ResubmitRequestSchema.safeParse(resubmit);
  assert.equal(resubmitRes.success, true);
});

test("Schemas: TelegramUpdateSchema validates valid updates and rejects malformed payloads", () => {
  const validUpdate = {
    update_id: 1001,
    message: {
      message_id: 42,
      from: { id: 555, first_name: "John", username: "john_doe" },
      chat: { id: 555, type: "private" },
      date: 1710000000,
      text: "/start",
    },
  };

  const validRes = TelegramUpdateSchema.safeParse(validUpdate);
  assert.equal(validRes.success, true);

  const malformedUpdate = {
    // missing update_id
    message: {
      text: "hello",
    },
  };

  const invalidRes = TelegramUpdateSchema.safeParse(malformedUpdate);
  assert.equal(invalidRes.success, false);
});
