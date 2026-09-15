# VeraOS Telegram Bot Integration

The VeraOS Telegram Bot provides a lightweight, conversational interface to the VeraOS verification engine, allowing operators and developers to verify AI agent work, check evidence, and issue remediation directives directly inside Telegram.

---

## 1. Operating Modes

The VeraOS Telegram integration supports two runtime architectures:

### Mode A: Long Polling (`npm run bot`) — Recommended for Development
- Uses Telegram's `getUpdates` HTTP API with a 25-second long-polling timeout.
- Automatically calls `deleteWebhook(false)` on startup to clear conflicting webhook registrations.
- Requires no public IP, external domain, or HTTPS certificate; runs directly on localhost.
- Implemented in `server/telegram/runner.ts` and `server/telegram/bot.ts`.

### Mode B: Webhook Mode (`/telegram/webhook`) — For Production Ingress
- Listens for incoming HTTP POST payloads at `/telegram/webhook` or `/v1/telegram/webhook`.
- Validates the `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_WEBHOOK_SECRET` (returning HTTP 403 Forbidden on invalid or missing tokens).
- Suitable for serverless or containerized environments behind a reverse proxy (e.g. Nginx, Cloudflare).

---

## 2. Supported Commands

| Command | Arguments | Description |
| :--- | :--- | :--- |
| `/start` | None | Welcomes the user, displays positioning, and lists commands |
| `/help` | None | Displays quick command reference |
| `/verify` | `[task \| output]` | Starts verification. If no args provided, prompts conversationally |
| `/status` | `<verification_id>` | Displays status card with current verdict state (`VERIFIED` / `FAILED`) |
| `/evidence` | `<verification_id>` | Renders evidence card with onchain details and Stellar.Expert explorer link |
| `/correct` | `<verification_id> [note]`| Issues self-correction directive to the worker |
| `/resubmit`| `<verification_id> [tx]` | Re-runs verification with updated worker output or supplemental transaction |

---

## 3. Conversational Session State Machine

When commands are invoked without arguments, the bot enters a conversational state:

```text
User: /verify
Bot:  "What should be verified?"
User: "Send 5 USDC to GCEYAU... | Sent 5 USDC via tx 108822f6..."
Bot:  [Runs Verification Pipeline] -> Returns Progress Card -> Returns Verdict Card
```

Session states are maintained in-memory per chat ID:
- `IDLE`: Default listening state.
- `AWAITING_VERIFY_INPUT`: Prompts user for verification prompt.
- `AWAITING_CORRECT_INPUT`: Prompts user for correction instructions.
- `AWAITING_RESUBMIT_INPUT`: Prompts user for supplemental transaction hash.

---

## 4. Security & Safety

1. **Authorization**:
   Verifications initiated by user A cannot be queried or manipulated by user B. The engine verifies `telegramUserId` ownership.
2. **Rate Limiting**:
   Enforces a strict threshold of 30 commands per minute per user/chat to prevent API abuse.
3. **Redacted Logging**:
   The bot runner logs update events and command executions, but strictly redacts bot tokens, private keys, and secrets.

---

## 5. Quick Start Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram and create a bot (`/newbot`).
2. Copy the bot token into your `.env` file:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
   VERAOS_API_URL=http://localhost:5173
   ```
3. Start the bot runner:
   ```bash
   npm run bot
   ```
4. Open your bot in Telegram and send `/start`!
