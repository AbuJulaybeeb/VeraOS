# VeraOS REST API Reference

The VeraOS Verification API provides programmatic access to execute deterministic verifications, retrieve status and evidence, and trigger remediation loops.

**Base URL**: `http://localhost:5173` (or configured deployment URL)

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check (Stellar RPC, Telegram status, version) |
| `POST` | `/v1/verify` | Submit a task and worker output for independent verification |
| `GET` | `/v1/verify` | List verification records with status and search filters |
| `GET` | `/v1/verify/:id` | Retrieve complete verification record and attempt history |
| `GET` | `/v1/verify/:id/evidence` | Retrieve raw evidence items for a verification |
| `GET` | `/v1/verify/:id/checks` | Retrieve deterministic checks evaluated for a verification |
| `POST` | `/v1/verify/:id/correct` | Record remediation instructions for an incomplete verification |
| `POST` | `/v1/verify/:id/resubmit` | Resubmit corrected worker output or supplemental transaction |

---

## 1. System Health Check

### `GET /health`
Returns operational status of the server and attached services.

#### Response `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-09-15T13:25:05.311Z",
  "version": "0.2.0",
  "telegram": {
    "configured": true,
    "polling": true,
    "botUsername": "@VeraOSBot",
    "webhookEnabled": false
  },
  "stellar": {
    "network": "testnet",
    "rpcUrl": "https://soroban-testnet.stellar.org",
    "horizonUrl": "https://horizon-testnet.stellar.org"
  }
}
```

---

## 2. Execute Verification

### `POST /v1/verify`
Runs the complete deterministic verification engine against a task and worker output.

#### Request Body
```json
{
  "task": "Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L.",
  "worker": {
    "id": "agent-alpha-09",
    "name": "Autonomous Settler",
    "output": "Payment completed. I sent 5 USDC via tx 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759."
  }
}
```

#### Response `201 Created`
```json
{
  "verificationId": "V-4676",
  "id": "v_run_km39x_abc",
  "status": "FAILED",
  "task": "Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L.",
  "verdict": {
    "status": "FAILED",
    "passedCount": 0,
    "failedCount": 1,
    "unverifiableCount": 0,
    "summary": "VERIFICATION FAILED: 1 of 1 invariants breached.",
    "failureReasons": [
      "Payment deficit: -4.50 USDC"
    ]
  },
  "checks": [
    {
      "id": "check_req_1",
      "requirementId": "req_1",
      "method": "deterministic",
      "status": "failed",
      "expected": "5 USDC",
      "observed": "0.5 USDC",
      "explanation": "Expected: 5 USDC\nObserved: 0.5 USDC\nDifference: -4.5 USDC\nPayment mismatch: Expected 5 USDC, but observed receipt shows 0.5 USDC (Deficit: 4.50 USDC)."
    }
  ],
  "evidence": [
    {
      "id": "ev_stellar_tx_req_1",
      "type": "blockchain",
      "source": "stellar_rpc",
      "claim": "Payment transaction 108822f6...",
      "value": {
        "txHash": "108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759",
        "amount": 0.5,
        "asset": "USDC",
        "successful": true,
        "destinationAccount": "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
        "explorerUrl": "https://stellar.expert/explorer/testnet/tx/108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759"
      }
    }
  ],
  "remediation": {
    "attempt": 1,
    "maxAttempts": 3,
    "directives": [
      {
        "id": "rem_1",
        "type": "CORRECT_TRANSACTION",
        "directive": "Worker must execute a supplemental transfer of 4.50 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L."
      }
    ]
  }
}
```

---

## 3. Resubmission & Self-Correction

### `POST /v1/verify/:id/resubmit`
Resubmits work for verification after an agent applies remediation directives.

#### Request Body
```json
{
  "correctedWorkerOutput": "Sent 5 USDC via tx 62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf."
}
```

#### Response `200 OK`
Returns the updated `VerificationRecord` with `verdict.status: "VERIFIED"`.
