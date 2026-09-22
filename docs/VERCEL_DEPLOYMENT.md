# Vercel Deployment Guide for VeraOS

This guide covers deploying the entire **VeraOS** ecosystem (Web Application + Serverless REST API + Telegram Bot Webhook) to **Vercel**.

---

## 1. Architecture on Vercel

```
[ User Browser ] ----------> Vercel Edge Network CDN (React 19 + Vite SPA: dist/)
                                      │
[ Telegram App ] ----(Webhook)------> Vercel Serverless Function (api/entry.ts)
                                      │
[ External Agents / SDK ] -----------> Vercel REST API Gateway (/v1/*)
                                      │
                                      ├──> Stellar Horizon & Soroban RPC (Testnet)
                                      ├──> Google Gemini 2.0 Flash Lite Engine
                                      └──> Telemetry & Invariant Kernel
```

- **Frontend**: Vite Single Page App built and deployed across Vercel’s global Edge Network. `vercel.json` provides client-side SPA routing (`/dashboard`, `/account`, `/verify/:id`, `/docs`, etc.).
- **Serverless API**: Handled seamlessly by `api/entry.ts` via Vercel Serverless Functions (`/v1/*`, `/health`, `/telegram/*`).
- **Telegram Bot (`@Vera_Of_bot`)**: Operates serverlessly via Telegram Webhooks. Every message sent to the bot triggers the Vercel function and returns an instant response.

---

## 2. Deploying via Vercel Dashboard (Recommended)

### Step 1: Push Repository to GitHub
Ensure your latest changes are pushed to your GitHub repository:
```bash
git push origin main
```
Repository: `https://github.com/k-deejah/VeraOS`

### Step 2: Import into Vercel
1. Go to [https://vercel.com](https://vercel.com) and log into your account.
2. Click **"Add New..."** > **"Project"**.
3. Under **Import Git Repository**, choose your `VeraOS` repository (or search for `k-deejah/VeraOS`).
4. Click **Import**.

### Step 3: Configure Build & Output Settings
Vercel will automatically detect `vercel.json` and Vite, but verify the following settings:
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Configure Environment Variables
Under **Environment Variables**, add the following keys:

| Variable Name | Recommended Value | Purpose |
|---|---|---|
| `STELLAR_NETWORK` | `testnet` | Target Stellar consensus network |
| `STELLAR_HORIZON_URL` | `https://horizon-testnet.stellar.org` | Live Horizon RPC endpoint |
| `STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` | Live Soroban smart contract RPC |
| `TELEGRAM_BOT_TOKEN` | `8398164925:AAHdxpRwoIOvBocQyEaJEGhb-FuVJ58O7Dk` | Authentication token for `@Vera_Of_bot` |
| `TELEGRAM_MODE` | `webhook` | Enables serverless webhook processing |
| `GEMINI_API_KEY` | *(Your Gemini API Key)* | Natural language extraction & audit analysis |
| `NODE_VERSION` | `20` | LTS Node runtime |

### Step 5: Click "Deploy"
Click **Deploy**. Vercel will build and assign your live production URL (e.g., `https://vera-os.vercel.app`).

---

## 3. Configure Telegram Bot Webhook

After deployment finishes, point your Telegram Bot to your new Vercel domain:

### Option A: Using Web Browser
Replace `YOUR_VERCEL_DOMAIN` with your actual Vercel domain (e.g., `vera-os.vercel.app`):
```
https://api.telegram.org/bot8398164925:AAHdxpRwoIOvBocQyEaJEGhb-FuVJ58O7Dk/setWebhook?url=https://YOUR_VERCEL_DOMAIN/telegram/webhook&drop_pending_updates=true
```

You should see:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### Option B: Using cURL or Terminal
```bash
curl -X POST "https://api.telegram.org/bot8398164925:AAHdxpRwoIOvBocQyEaJEGhb-FuVJ58O7Dk/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_VERCEL_DOMAIN/telegram/webhook", "drop_pending_updates": true}'
```

---

## 4. Verification Checklist

1. **Verify Health Endpoint**:
   Open `https://YOUR_VERCEL_DOMAIN/health` in your browser. It should return HTTP 200 with operational telemetry:
   ```json
   {
     "status": "ok",
     "version": "0.2.0",
     "runtime": "operational",
     "telegram": {
       "configured": true,
       "botUsername": "@Vera_Of_bot"
     },
     "stellar": {
       "network": "testnet"
     }
   }
   ```

2. **Verify Frontend**:
   - Visit `https://YOUR_VERCEL_DOMAIN/`.
   - Test navigating to `/dashboard`, `/account`, and `/docs`.
   - Test Google sign-in and Stellar wallet connection.

3. **Verify Telegram Bot**:
   - Open Telegram and launch `@Vera_Of_bot`.
   - Send:
     ```
     https://t.me/Vera_Of_bot?start=invite_VERA-OFFICIAL
     ```
   - Send `/verify` or test a task verification.
