# VeraOS Demo Walkthrough & Video Script

This script provides a 2-to-3 minute end-to-end demonstration flow for project judges, reviewers, and video recording.

---

## Demo Setup & Prerequisites
1. Open VeraOS Web Dashboard at `http://localhost:5173`.
2. Ensure the dev server (`npm run dev`) or bot runner (`npm run bot`) is active.
3. Open Telegram and open your configured bot chat (`@VeraOSBot`).
4. Prepare the Stellar Testnet Explorer links for the live artifacts:
   - Deceptive Tx (0.5 USDC): `108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759`
   - Correct Tx (5.0 USDC): `62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf`

---

## Video Script & Step-by-Step Flow

### Act 1: The Problem (0:00 – 0:35)
- **Visual**: Screen on VeraOS landing page hero (`http://localhost:5173`).
- **Narration**:
  > *"Autonomous AI agents are being delegated financial actions on the Stellar network—dispatching bounties, paying for compute, and interacting with Soroban smart contracts. But how do you know the agent actually did what it claimed? Right now, systems simply trust the agent's text output. If an agent hallucinates a transaction hash or underpays a bounty, the system accepts it blindly. VeraOS solves this. VeraOS is the independent verification layer for AI agents. Our mantra: Verify before you trust."*

### Act 2: Interactive Verification & Deceptive Worker Catch (0:35 – 1:20)
- **Visual**: Scroll to "Verify a Task" on the landing page or click "Verify" on the interactive widget. Select the "Deceptive Stellar Payment" scenario.
- **Task Prompt**:
  `Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L.`
- **Worker Claim**:
  `Payment completed. I sent 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L via tx 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759.`
- **Click**: "Run Verification"
- **Visual**: The UI transitions to the structured verdict card:
  - **Verdict**: `❌ VERIFICATION FAILED`
  - **Expected**: `5.00 USDC`
  - **Observed**: `0.50 USDC`
  - **Difference**: `-4.50 USDC`
  - **Checks**:
    - `✗ Amount (0.50 USDC transferred, deficit -4.50 USDC)`
    - `✓ Transaction exists on Stellar Testnet`
    - `✓ Recipient matched`
    - `✓ Asset is USDC`
- **Narration**:
  > *"Watch what happens. The agent claims it sent 5 USDC. But VeraOS never trusts the agent's words. It queries the Stellar Soroban RPC directly, decodes the signed envelope XDR, and discovers that the transaction only transferred 0.50 USDC. VeraOS instantly rejects the claim, flags the exact 4.50 USDC deficit, and issues a remediation directive."*

### Act 3: Evidence Triangulation & Stellar Explorer (1:20 – 1:50)
- **Visual**: Click "View Evidence" on the card.
- **Narration**:
  > *"Clicking into Evidence Explorer reveals the independent proof. We see the real Stellar Testnet ledger receipt, confirmed on ledger #4688142, with a direct link to Stellar.Expert. Anyone can verify this onchain receipt independently."*

### Act 4: Self-Correction Loop to VERIFIED (1:50 – 2:20)
- **Visual**: Click "Request Correction", enter the corrected transaction hash:
  `62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf`
- **Click**: "Resubmit Verification"
- **Visual**: The status switches to:
  `✅ VERIFIED — Status: VERDICT_CONFIRMED`
  Zero deficit, 5.00 USDC confirmed on Stellar.
- **Narration**:
  > *"The worker self-corrects, broadcasts the required 5.0 USDC transaction, and resubmits. VeraOS re-evaluates against Stellar RPC in real-time, confirms the ledger transfer, and marks the task VERIFIED."*

### Act 5: Telegram Bot Interface (2:20 – 2:50)
- **Visual**: Switch to Telegram app.
- **Actions**:
  1. Send `/start` -> Show VeraOS brand intro and commands.
  2. Send `/verify Send 5 USDC to GCEYAU... | Sent 5 USDC via tx 108822f6...`
  3. Bot immediately replies with the progress card, then the `❌ VERIFICATION FAILED` card with inline buttons for "View Evidence" and "Request Correction".
- **Narration**:
  > *"The exact same deterministic verification engine powers the VeraOS Telegram bot. Operators on Telegram get instant verification cards, delta checks, and Stellar explorer links without needing to touch a terminal."*

### Act 6: Summary & Conclusion (2:50 – 3:10)
- **Visual**: Return to dashboard with verified agent metrics.
- **Narration**:
  > *"VeraOS is live on Stellar Testnet today. Built with TypeScript, Node.js, and @stellar/stellar-sdk, with a full test suite and CI pipeline. Check out our open-source repository on GitHub, try the live demo, and join us in building the verification layer for AI agents."*
