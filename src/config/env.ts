/**
 * VeraOS Frontend Configuration
 * Uses environment variables prefixed with VITE_ or defaults.
 */

// Configured Telegram bot URL (opened across all Telegram CTAs)
export const TELEGRAM_BOT_URL: string =
  (import.meta.env.VITE_TELEGRAM_BOT_URL as string) || "https://t.me/Vera_Of_bot";

// Real GitHub repository link
export const GITHUB_REPO_URL = "https://github.com/k-deejah/VeraOS";

// Default API base url
export const VERAOS_API_URL: string =
  (import.meta.env.VITE_VERAOS_API_URL as string) || "";
