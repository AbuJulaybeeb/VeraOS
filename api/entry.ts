import type { IncomingMessage, ServerResponse } from "node:http";
import { handleApiRequest } from "../server/api/routes.ts";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Endpoint not found" }));
    }
  } catch (error: any) {
    console.error("[Vercel API Gateway Error]:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Internal server error",
          message: error?.message || "Unknown error",
        })
      );
    }
  }
}
