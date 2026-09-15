import { createServer } from "node:http";
import { handleApiRequest } from "./routes.ts";


const PORT = parseInt(process.env.PORT || "3001", 10);

export function startServer(port = PORT) {
  const server = createServer(async (req, res) => {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Endpoint not found" }));
    }
  });

  server.listen(port, () => {
    console.log(`[VeraOS API] Verification Engine Server active on http://localhost:${port}`);
  });

  return server;
}

// Start immediately if executed directly
if (process.argv[1] && process.argv[1].endsWith("server.ts")) {
  startServer();
}
