# Stellar Network Integration & Evidence Verification

VeraOS uses the Stellar network as its primary source of cryptographic truth for agent payments, settlements, and onchain operations.

---

## Technical Integration Overview

```text
AI Worker Claim ──► VeraOS Engine ──► StellarRpcProvider
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
             Stellar Soroban RPC                            Stellar Horizon
   (https://soroban-testnet.stellar.org)         (https://horizon-testnet.stellar.org)
                       │                                             │
             JSON-RPC: getTransaction                      REST: /transactions/{hash}
                       │                                             │
                       ▼                                             ▼
           Envelope XDR Decoded                          Operation Details Decoded
  (TransactionBuilder.fromXDR)                  (Amount, Asset, Destination)
                       │                                             │
                       └──────────────────────┬──────────────────────┘
                                              ▼
                                Deterministic Check Verdict
                         (Exists? Success? Amount? Recipient?)
```

---

## 1. Authoritative Evidence Gathering

### Primary Source: Soroban RPC (`getTransaction`)
When a worker claims a Stellar transaction, `StellarRpcProvider` sends a JSON-RPC 2.0 `getTransaction` call to the Soroban RPC endpoint:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTransaction",
  "params": {
    "hash": "<64_char_hex_hash>"
  }
}
```

The response returns the transaction execution status (`SUCCESS` or `FAILED`), the confirmed ledger number, the timestamp, and the **Envelope XDR**.

### Envelope XDR Parsing (`@stellar/stellar-sdk`)
Rather than relying on unvalidated metadata, VeraOS directly parses the signed transaction envelope XDR using `@stellar/stellar-sdk`:

```typescript
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk";

const parsedTx = TransactionBuilder.fromXDR(envelopeXdr, Networks.TESTNET);
const tx = "innerTransaction" in parsedTx ? parsedTx.innerTransaction : parsedTx;

// Inspect payments inside operations
for (const op of tx.operations) {
  if (op.type === "payment") {
    const destination = op.destination;
    const amount = parseFloat(op.amount);
    const assetCode = op.asset.isNative() ? "XLM" : op.asset.getCode();
    // Deterministically verify against required bounds
  }
}
```

### Secondary Fallback: Stellar Horizon
If a transaction has aged beyond the immediate Soroban RPC memory cache, the provider automatically falls back to the authoritative Stellar Horizon REST API (`/transactions/{hash}/operations`) to ensure long-term verifiability.

---

## 2. Real Stellar Testnet Verification Artifacts

VeraOS was verified against live, active transactions on the **Stellar Testnet**:

| Role | Stellar Account / Hash | Description |
| :--- | :--- | :--- |
| **Recipient (`ADDRESS_X`)** | `GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L` | Expected recipient for task bounties |
| **Worker (Sender)** | `GA2SOFSTFQWU2XIETN6DIGSYCYERV5LFS46IUMIAQQQETTRLDAUBGEQD` | Autonomous agent executing payout |
| **USDC Issuer** | `GB56WGL27MVE46Z4V3BNDW6H77WNYH3D4N5V5FBLU4D4Q63V7XQ737X5` | Custom testnet asset issuer |
| **Deceptive Transaction** | [`108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759`](https://stellar.expert/explorer/testnet/tx/108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759) | Worker claims 5.0 USDC, but tx transferred only **0.50 USDC** |
| **Correct Transaction** | [`62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf`](https://stellar.expert/explorer/testnet/tx/62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf) | Correct payout transferring exactly **5.00 USDC** |

---

## 3. The Critical Acceptance Scenario

The core reason VeraOS exists is illustrated by this benchmark test (implemented in `server/tests/stellarRpc.test.ts`):

1. **Task**: *"Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L."*
2. **Worker Claim**: *"Payment completed. I sent 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L via tx 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759."*
3. **VeraOS Evaluation**:
   - Queries Stellar RPC for hash `108822f6...`.
   - Discovers actual ledger payment operation is only `0.50 USDC`.
   - **Verdict**: `FAILED`.
   - **Structured Delta Check**:
     ```text
     Expected: 5 USDC
     Observed: 0.5 USDC
     Difference: -4.5 USDC
     Payment mismatch: Expected 5 USDC, but observed receipt shows 0.5 USDC (Deficit: 4.50 USDC).
     ```
   - **Remediation Directive**: Emits mandatory directive instructing worker to broadcast supplemental 4.50 USDC transfer.
