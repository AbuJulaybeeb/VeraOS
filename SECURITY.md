# Security Policy

## Supported Versions

VeraOS takes security and reliability seriously, especially as a verification layer responsible for evaluating financial, onchain, and autonomous agent actions.

| Version | Supported          | Security Fixes |
| :---    | :---               | :---           |
| 0.2.x   | :white_check_mark: | Active         |
| < 0.2.0 | :x:                | Deprecated     |

---

## Core Security Architecture & Principles

1. **Independent Evidence Principle**:
   - VeraOS **never** treats an AI worker's output as evidence. All verification checks require independent data retrieved directly from the Stellar RPC/Horizon network or verified cryptographic sources.
2. **Zero Hardcoded Secrets**:
   - No private keys, secret seeds, bot tokens, or webhook secrets may ever be committed to the repository.
   - All loggers strictly redact sensitive values.
   - `.env` and `.env.*` are ignored by git.
3. **Dual-Mode Telegram Protection**:
   - Webhook ingress validates `X-Telegram-Bot-Api-Secret-Token` (returning HTTP 403 on mismatch).
   - Long-polling mode (`getUpdates`) calls `deleteWebhook` prior to listening to prevent update hijacking.
   - In-memory rate limiting enforces a maximum of 30 commands per minute per user/chat.
   - Session authorization ensures operators can only query or correct verifications they initiated.
4. **Deterministic Evaluation**:
   - Financial amounts (USDC/XLM) are checked with strict mathematical bounds, never relying on LLM interpretations for numerical truths.

---

## Reporting a Vulnerability

If you discover a potential security vulnerability in VeraOS, please report it responsibly:

- **Do NOT create a public GitHub issue** for undisclosed security vulnerabilities.
- **GitHub Private Vulnerability Reporting**: Submit a private advisory via [GitHub Security Advisories](https://github.com/k-deejah/VeraOS/security/advisories/new).
- **Direct Contact**: Email the security maintainers at `security@veraos.network` (or open a confidential inquiry with maintainers via GitHub).

### What to Include in Your Report:
- A clear description of the vulnerability.
- Steps to reproduce or proof-of-concept (PoC) code.
- Potential impact (e.g. bypass of verification, denial of service, data leakage).
- Any proposed remediation or patch.

### Response SLA:
- **Initial Acknowledgement**: Within 24 hours.
- **Triage & Assessment**: Within 48 hours.
- **Patch & Advisory Release**: Coordinated with the reporter before public disclosure.
