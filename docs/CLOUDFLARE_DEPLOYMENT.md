# Cloudflare Deployment Guide for VeraOS

This guide covers deploying the VeraOS platform (Frontend + Cloudflare Pages Functions + Telegram Webhook) to Cloudflare.

---

## 1. Architecture Overview

```
[ User Browser ] ----------> Cloudflare Pages CDN (Static Assets: dist/)
                                      │
[ Telegram App ] ----(Webhook)------> Cloudflare Pages Functions (functions/telegram/webhook.ts)
                                      │
                                      ├──> Stellar Horizon & Soroban RPC (Testnet)
                                      └──> Telemetry & Invariant Kernel
```

- **Frontend**: Single Page Application built with Vite & Tailwind CSS, hosted on Cloudflare Pages global edge CDN with instant cache invalidation.
- **Serverless Edge Functions**:
  - `functions/health.ts` -> `GET /health` operational heartbeat.
  - `functions/telegram/webhook.ts` -> `POST /telegram/webhook` handles incoming Telegram messages from `@Vera_Of_bot`.
  - `functions/v1/verify.ts` -> `GET /v1/verify` & `POST /v1/verify` handles programmatic verification requests.
- **Bot**: Telegram Bot `@Vera_Of_bot` operates serverlessly via Cloudflare Webhooks (no long-running server required).

---

## 2. Deploying via Cloudflare Dashboard (Recommended)

### Step 1: Log in to Cloudflare
1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) and create or log into your account.
2. In the left navigation, select **Compute (Workers & Pages)** > **Create application** > **Pages** tab > **Connect to Git**.

### Step 2: Connect Your GitHub Repository
1. Select your GitHub account (`k-deejah`).
2. Choose repository: `VeraOS` (or `k-deejah/VeraOS`).
3. Click **Begin setup**.

### Step 3: Configure Build Settings
Fill in the following fields:
- **Project name**: `veraos-bot` (or your preferred name, e.g. `veraos`)
- **Production branch**: `main`
- **Framework preset**: `Vite` (or `None`)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

### Step 4: Add Environment Variables
Under **Environment variables (advanced)**, add:

| Variable Name | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `TELEGRAM_BOT_TOKEN` | `8398164925:AAHdxpRwoIOvBocQyEaJEGhb-FuVJ58O7Dk` |
| `STELLAR_NETWORK` | `testnet` |
| `STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `STELLAR_HORIZON_URL` | `https://horizon-testnet.stellar.org` |

Click **Save and Deploy**. Cloudflare will build and deploy your project to `https://<project-name>.pages.dev`.

---

## 3. Configure Telegram Bot Webhook

Once your Cloudflare Pages URL is live (e.g. `https://veraos-bot.pages.dev`), run the webhook configuration script:

```powershell
node scripts/set-telegram-webhook.mjs 8398164925:AAHdxpRwoIOvBocQyEaJEGhb-FuVJ58O7Dk https://veraos-bot.pages.dev
```

Alternatively, open this URL in your web browser:
```
https://api.telegram.org/bot8398164925:AAHdxpRwoIOvBocQyEaJEGhb-FuVJ58O7Dk/setWebhook?url=https://veraos-bot.pages.dev/telegram/webhook&drop_pending_updates=true
```

You will see:
```json
{"ok": true, "result": true, "description": "Webhook was set"}
```

---

## 4. Deploying via Wrangler CLI (Optional)

If you prefer deploying from your local terminal:

1. Install Wrangler globally or use local:
   ```powershell
   npm.cmd install -g wrangler
   ```
2. Log in to Cloudflare:
   ```powershell
   wrangler login
   ```
3. Build the production bundle:
   ```powershell
   npm.cmd run build
   ```
4. Deploy to Cloudflare Pages:
   ```powershell
   wrangler pages deploy dist --project-name veraos-bot
   ```

---

## 5. Verification & Testing

1. **Verify Health Endpoint**:
   ```
   GET https://veraos-bot.pages.dev/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "version": "0.2.0",
     "runtime": "cloudflare-pages",
     "telegram": { "configured": true, "webhookEnabled": true, "botUsername": "@Vera_Of_bot" },
     "stellar": { "network": "testnet" }
   }
   ```

2. **Verify Telegram Bot**:
   - Open Telegram and search for `@Vera_Of_bot`.
   - Send `/start`.
   - Send `/verify Send 5 USDC to GCEYAU... | Payment complete tx 622560...`
   - Observe instant edge response!
