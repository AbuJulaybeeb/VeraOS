import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import handler from "../../api/entry.ts";

function createMockReqRes(options: {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  const req: any = new EventEmitter();
  req.method = options.method || "GET";
  req.url = options.url;
  req.headers = options.headers || {};

  const res: any = new EventEmitter();
  let statusCode = 200;
  let headers: Record<string, string> = {};
  let responseData = "";

  res.statusCode = statusCode;
  res.headersSent = false;
  res.setHeader = (k: string, v: string) => {
    headers[k.toLowerCase()] = v;
  };
  res.writeHead = (code: number, hdrs?: Record<string, string>) => {
    statusCode = code;
    res.statusCode = code;
    if (hdrs) {
      Object.entries(hdrs).forEach(([k, v]) => {
        headers[k.toLowerCase()] = v;
      });
    }
  };
  res.end = (data?: string) => {
    if (data) responseData += data;
    res.emit("finish");
  };

  return {
    req,
    res,
    send: () => {
      if (options.body) {
        req.emit("data", Buffer.from(JSON.stringify(options.body)));
      }
      req.emit("end");
    },
    getResult: () => ({
      status: res.statusCode || statusCode,
      headers,
      body: responseData ? JSON.parse(responseData) : null,
    }),
  };
}

test("Vercel Gateway: GET /health via URL parameter rewrite", async () => {
  const { req, res, send, getResult } = createMockReqRes({
    method: "GET",
    url: "/api/entry?url=/health",
  });

  const promise = handler(req, res);
  send();
  await promise;

  const result = getResult();
  assert.equal(result.status, 200);
  assert.equal(result.body.status, "ok");
  assert.equal(result.body.version, "0.2.0");
});

test("Vercel Gateway: GET /v1/agents via x-matched-path header", async () => {
  const { req, res, send, getResult } = createMockReqRes({
    method: "GET",
    url: "/api/entry",
    headers: { "x-matched-path": "/v1/agents" },
  });

  const promise = handler(req, res);
  send();
  await promise;

  const result = getResult();
  assert.equal(result.status, 200);
  assert.ok(Array.isArray(result.body));
  assert.ok(result.body.length > 0);
});

test("Vercel Gateway: Direct /api/v1/agents path strip", async () => {
  const { req, res, send, getResult } = createMockReqRes({
    method: "GET",
    url: "/api/v1/agents",
  });

  const promise = handler(req, res);
  send();
  await promise;

  const result = getResult();
  assert.equal(result.status, 200);
  assert.ok(Array.isArray(result.body));
});

test("Vercel Gateway: Unknown endpoint returns 404", async () => {
  const { req, res, send, getResult } = createMockReqRes({
    method: "GET",
    url: "/api/entry?url=/unknown-path",
  });

  const promise = handler(req, res);
  send();
  await promise;

  const result = getResult();
  assert.equal(result.status, 404);
  assert.equal(result.body.error, "Endpoint not found");
});
