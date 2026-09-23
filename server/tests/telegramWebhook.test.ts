import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleApiRequest } from "../api/routes.ts";
import { veraTelegramBot } from "../telegram/bot.ts";

function createMockReqRes(options: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  const req = new EventEmitter() as unknown as IncomingMessage;
  (req as any).method = options.method;
  (req as any).url = options.url;
  (req as any).headers = options.headers || {};

  const resChunks: Buffer[] = [];
  const resHeaders: Record<string, string> = {};
  let statusCode = 200;

  const res = {
    get statusCode() {
      return statusCode;
    },
    set statusCode(val: number) {
      statusCode = val;
    },
    writeHead(code: number, headers?: Record<string, string>) {
      statusCode = code;
      if (headers) Object.assign(resHeaders, headers);
      return this;
    },
    setHeader(name: string, value: string) {
      resHeaders[name.toLowerCase()] = value;
      return this;
    },
    end(chunk?: any) {
      if (chunk) resChunks.push(Buffer.from(chunk));
    },
    get bodyJson() {
      const raw = Buffer.concat(resChunks).toString("utf-8");
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    },
  } as unknown as ServerResponse & { bodyJson: any };

  process.nextTick(() => {
    if (options.body !== undefined) {
      const payload = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
      req.emit("data", Buffer.from(payload));
    }
    req.emit("end");
  });

  return { req, res };
}

test("Telegram Webhook Gateway: GET /telegram/webhook returns health info", async () => {
  const { req, res } = createMockReqRes({
    method: "GET",
    url: "/telegram/webhook",
  });

  const handled = await handleApiRequest(req, res);
  assert.equal(handled, true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.bodyJson.ok, true);
  assert.equal(res.bodyJson.service, "VeraOS Telegram Webhook Gateway");
});

test("Telegram Webhook Gateway: POST /telegram/webhook processes valid update", async () => {
  const updatePayload = {
    update_id: 888001,
    message: {
      message_id: 1,
      from: { id: 998877, first_name: "TestUser", username: "testuser" },
      chat: { id: 998877, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: "/help",
    },
  };

  const { req, res } = createMockReqRes({
    method: "POST",
    url: "/telegram/webhook",
    body: updatePayload,
  });

  const handled = await handleApiRequest(req, res);
  assert.equal(handled, true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.bodyJson.ok, true);
});

test("Telegram Webhook Gateway: POST /v1/telegram/webhook validates secret token when configured", async () => {
  const previousSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  try {
    process.env.TELEGRAM_WEBHOOK_SECRET = "super_secret_token_123";

    const invalid = createMockReqRes({
      method: "POST",
      url: "/v1/telegram/webhook",
      headers: { "x-telegram-bot-api-secret-token": "wrong_token" },
      body: { update_id: 1 },
    });

    const handledInvalid = await handleApiRequest(invalid.req, invalid.res);
    assert.equal(handledInvalid, true);
    assert.equal(invalid.res.statusCode, 403);
    assert.equal(invalid.res.bodyJson.error, "Forbidden");

    const valid = createMockReqRes({
      method: "POST",
      url: "/v1/telegram/webhook",
      headers: { "x-telegram-bot-api-secret-token": "super_secret_token_123" },
      body: {
        update_id: 888002,
        message: {
          message_id: 2,
          from: { id: 998877, first_name: "TestUser" },
          chat: { id: 998877, type: "private" },
          date: Math.floor(Date.now() / 1000),
          text: "/help",
        },
      },
    });

    const handledValid = await handleApiRequest(valid.req, valid.res);
    assert.equal(handledValid, true);
    assert.equal(valid.res.statusCode, 200);
    assert.equal(valid.res.bodyJson.ok, true);
  } finally {
    process.env.TELEGRAM_WEBHOOK_SECRET = previousSecret;
  }
});
