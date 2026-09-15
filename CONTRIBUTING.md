# Contributing to VeraOS

Thank you for your interest in contributing to **VeraOS — The verification layer for AI agents**!

VeraOS is an active open-source project participating in the **Stellar Wave Program** on [Drips](https://drips.network). We welcome contributions from developers, researchers, and agent creators across the ecosystem.

---

## 1. Development Setup

### Prerequisites
- **Node.js**: v20.x or higher (v22+ recommended)
- **npm**: v10.x or higher
- **Git**

### Clone & Install
```bash
# Clone repository
git clone https://github.com/k-deejah/VeraOS.git
cd VeraOS

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
```

### Running Locally
```bash
# Run web dashboard and API (Vite development server)
npm run dev

# Run standalone API server (port 3001)
npm run server

# Run Telegram bot runner (long-polling)
npm run bot
```

The web dashboard is served at `http://localhost:5173`.
The system health check is available at `http://localhost:5173/health`.

---

## 2. Architecture Quick Reference

Before making changes, understand where your code belongs:

- `server/verification/`: Core verification engine.
  - `requirementExtractor.ts`: Extracts invariants from task descriptions.
  - `claimExtractor.ts`: Parses worker output claims.
  - `checkEngine.ts`: Executes deterministic evaluations.
  - `evidenceProviders/`:
    - `stellarRpcProvider.ts`: Authoritative Stellar RPC & Horizon queries, Envelope XDR decoding.
    - `deterministicProvider.ts`: Local deterministic kernel for counts, bounds, and payment delegation.
  - `verdictEngine.ts`: Synthesizes final `VERIFIED` or `FAILED` structured verdict.
  - `remediationEngine.ts`: Generates precise correction directives for failed runs.
- `server/telegram/`:
  - `bot.ts`: Telegram bot command router, session management, and long-polling engine.
  - `runner.ts`: Standalone process runner.
- `src/`: React 19 + Tailwind CSS frontend (Landing page, Verify widget, Evidence explorer, Correction loop).

---

## 3. Testing & Quality Standards

Every contribution must maintain full automated test coverage and pass all lint and typecheck checks:

```bash
# Run the automated test suite (28+ tests)
npm test

# Run linter
npm run lint

# Run TypeScript typecheck
npx tsc -b

# Verify production build
npm run build
```

---

## 4. Git & Pull Request Guidelines

We enforce a clean, disciplined Git history:

### Branch Naming
- `feat/<feature-name>` for new capabilities.
- `fix/<bug-description>` for bug fixes.
- `docs/<topic>` for documentation updates.
- `wave/<issue-number>-<task-name>` for Drips Wave backlog issues.

### Commit Conventions
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```text
type(scope): description

Examples:
feat(stellar): add multi-operation payment inspection
fix(telegram): handle rate-limit retry backoff gracefully
docs(readme): document live testnet transaction explorer links
```

### Critical Rules
- **DO NOT** use `git add .`. Stage specific modified files only.
- **DO NOT** commit secrets, private keys, or `.env` files.
- Ensure all CI checks pass before requesting review.

---

## 5. Drips Wave Contributors

If you are working on a task for the **Drips Stellar Wave Program**:

1. **Find an Issue**: Browse open issues tagged [`wave-task`](https://github.com/k-deejah/VeraOS/issues?q=label%3Awave-task) or check [`docs/CONTRIBUTOR_ROADMAP.md`](./docs/CONTRIBUTOR_ROADMAP.md).
2. **Comment to Claim**: Post a comment requesting assignment so other contributors know the task is active.
3. **Link Your PR**: Ensure your Pull Request description explicitly links the issue (`Fixes #<number>`).
4. **Acceptance Criteria**: Verify every item in the issue's Acceptance Criteria checklist is fully satisfied and tested.
