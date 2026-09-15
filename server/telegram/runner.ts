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

const apiUrl = process.env.VERAOS_API_URL || process.env.VERA_API_URL || "http://localhost:5173";
veraTelegramBot.setApiBaseUrl(apiUrl);
console.log(`[Telegram Bot] Configured API target: ${apiUrl}`);

veraTelegramBot.startPolling().then((started) => {
  if (!started) {
    console.error("[Telegram Bot] Failed to start long polling loop.");
    process.exit(1);
  }
});

const shutdown = () => {
  console.log("\n[Telegram Bot] Received termination signal. Shutting down gracefully...");
  veraTelegramBot.stopPolling();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
