/**
 * VeraOS Frontend Configuration
 * Uses environment variables prefixed with VITE_ or defaults.
 */

// Configured Telegram bot URL (opened across all Telegram CTAs)
export const TELEGRAM_BOT_URL: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_TELEGRAM_BOT_URL)
    ? (import.meta.env.VITE_TELEGRAM_BOT_URL as string)
    : "https://t.me/Vera_Of_bot";

// Permanent invite code and deep-link for website visitors
export const TELEGRAM_BOT_INVITE_CODE = "VERA-OFFICIAL";
export const TELEGRAM_PERMANENT_INVITE_URL = `${TELEGRAM_BOT_URL}?start=invite_${TELEGRAM_BOT_INVITE_CODE}`;

// Real GitHub repository link
export const GITHUB_REPO_URL = "https://github.com/k-deejah/VeraOS";

// Default API base url
export const VERAOS_API_URL: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_VERAOS_API_URL)
    ? (import.meta.env.VITE_VERAOS_API_URL as string)
    : "";
