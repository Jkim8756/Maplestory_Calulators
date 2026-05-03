# Agent Team Charter — Maplestory GMS Reboot Calculators

## The 5-Agent Team

| Agent | Responsibility | Role File |
|-------|---------------|-----------|
| Frontend | UI components, display logic, user interactions | `.agents/frontend/frontend.md` |
| Backend | Calculation logic, hooks, data utilities | `.agents/backend/backend.md` |
| Data Engineer | Game data constants, TypeScript types, future DB/API architecture | `.agents/data-engineer/data-engineer.md` |
| DevOps | Scaffold, build config, env vars, SaaS CLI connections | `.agents/devops/devops.md` |
| QA/QC | Reviews, tests, bug tracking via QA_REPORT.md | `.agents/qa-qc/qa-qc.md` |

---

## Session Protocol (All Agents)

1. **Read `.agents/qa-qc/QA_REPORT.md`** — check for open issues assigned to your role
2. **Read your role file** (`.agents/<role>/<role>.md`)
3. **Read `PLAN.md`** for current feature specs
4. Only touch files in your ownership domain (see table below)
5. After completing work, note any new issues for QA/QC to log

---

## File Ownership

| Domain | Owner | Paths |
|--------|-------|-------|
| Build Config & Scaffold | DevOps | `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `.gitignore` |
| Secrets & Env Vars | DevOps (exclusive) | `.env`, `.env.local`, `.env.*`, `.env.example` |
| Types | Data Engineer | `src/types/**` |
| Game Data | Data Engineer | `src/data/**` |
| Calculations & Utils | Backend | `Backend/lib/**`, `Backend/hooks/**` |
| UI Components | Frontend | `Frontend/components/**`, `Frontend/App.tsx`, `Frontend/main.tsx`, `Frontend/index.css` |
| QA Report | QA/QC | `.agents/qa-qc/QA_REPORT.md` |
| Agent Docs | (shared read) | `.agents/**`, `CLAUDE.md`, `PLAN.md`, `README.md` |

---

## Cross-Agent Contracts

- **Types** (`src/types/`) are owned by Data Engineer. Backend and Frontend import but do not modify.
- **Shared utilities** (`format.ts`, `storage.ts`) are Backend-owned. Frontend imports but does not modify.
- **No agent writes `.env*` except DevOps.** If a secret or config value is needed, ask DevOps to add it.
- **QA/QC is read-only on all code.** Raises issues in QA_REPORT.md — never modifies source files.
- All meso/number display goes through `formatMeso()` from `src/lib/format.ts` (Backend-owned).
- All dates display through `formatDate()` from `src/lib/format.ts` (Backend-owned).

---

## Build Dependency Order

Scaffold → Types → Data → Lib/Hooks → UI Primitives → Layout Shell → Tools → QA Review

DevOps must scaffold before any other agent can work.
Data Engineer (types + data) must complete before Backend.
Backend must complete before Frontend.
QA/QC reviews after each agent's phase.
