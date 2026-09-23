#!/usr/bin/env node

/**
 * Utility script to configure Telegram Bot Webhook pointing to Cloudflare Pages / Workers
 * Usage:
 *   node scripts/set-telegram-webhook.mjs [BOT_TOKEN] [DOMAIN_URL]
 * Example:
 *   node scripts/set-telegram-webhook.mjs 8989264156:AAGOcGNgV83w3rt5jIMpq-kErxdCHAK-P2c https://veraos-bot.pages.dev
 */

const token = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN || "8989264156:AAGOcGNgV83w3rt5jIMpq-kErxdCHAK-P2c";
let domain = process.argv[3] || process.env.CLOUDFLARE_URL || "https://veraos-bot.pages.dev";

if (!domain.startsWith("http")) {
  domain = `https://${domain}`;
}
domain = domain.replace(/\/+$/, "");

const webhookUrl = `${domain}/telegram/webhook`;

console.log(`Setting Telegram Bot Webhook:`);
console.log(`  Bot Token:   ${token.slice(0, 10)}...${token.slice(-5)}`);
console.log(`  Webhook URL: ${webhookUrl}`);

async function configureWebhook() {
  try {
    const url = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(
      webhookUrl
    )}&drop_pending_updates=true`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.ok) {
      console.log(`\n✓ SUCCESS! Telegram Webhook configured successfully:`);
      console.log(`  ${data.description || "Webhook was set"}`);
    } else {
      console.error(`\n✗ ERROR setting webhook:`, data);
    }
  } catch (err) {
    console.error(`\n✗ FAILED to set webhook:`, err);
  }
}

configureWebhook();
