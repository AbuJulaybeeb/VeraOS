import { veraTelegramBot } from "./bot.ts";

// Attempt to load environment variables from .env if present
try {
  process.loadEnvFile?.();
} catch {
  // .env file might not exist, which is fine
}

const token = process.env.TELEGRAM_BOT_TOKEN;

console.log("=========================================");
console.log("       VeraOS Telegram Bot Runner        ");
console.log("=========================================");

if (!token || !token.trim()) {
  console.error("[Telegram Bot] Error: TELEGRAM_BOT_TOKEN is not configured.");
  console.error("[Telegram Bot] Set TELEGRAM_BOT_TOKEN in your environment or .env file.");
  console.log("Telegram cannot yet be verified because TELEGRAM_BOT_TOKEN is not configured.");
  process.exit(1);
}

veraTelegramBot.setBotToken(token.trim());

async function resolveAndCheckApiTarget(): Promise<string> {
  const explicitUrl = process.env.VERAOS_API_URL || process.env.VERA_API_URL;
  const candidates = explicitUrl
    ? [explicitUrl.replace(/\/$/, "")]
    : ["http://localhost:5173", "http://localhost:3001"];

  for (const candidate of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${candidate}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        console.log(`[Telegram Bot] Connected to VeraOS Verification Engine at ${candidate}`);
        return candidate;
      }
    } catch {
      // Try next candidate
    }
  }

  const fallback = candidates[0];
  console.warn(`[Telegram Bot] Notice: Verification backend is not currently responding at ${fallback}.`);
  console.warn(`[Telegram Bot] Start your backend via 'npm run dev' (5173) or 'npm run server' (3001) to process verifications.`);
  return fallback;
}

async function main() {
  const apiUrl = await resolveAndCheckApiTarget();
  veraTelegramBot.setApiBaseUrl(apiUrl);
  console.log(`[Telegram Bot] Configured API target: ${apiUrl}`);

  const started = await veraTelegramBot.startPolling();
  if (!started) {
    console.error("[Telegram Bot] Failed to start long polling loop.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[Telegram Bot] Fatal runner error:", err);
  process.exit(1);
});

const shutdown = () => {
  console.log("\n[Telegram Bot] Received termination signal. Shutting down gracefully...");
  veraTelegramBot.stopPolling();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
