# Maplestory GMS Reboot Calculators — Project Instructions

## Source of Truth
- **Plan**: `PLAN.md` — unified Ultraplan output (May 2, 2026). This is the canonical spec.
- **Game data**: defaults sourced from MapleStory Wiki / DigitalTQ as of May 2026.

## Agent Team Protocol

This project is built by 5 specialized agents. **Every agent must follow this at the start of every session:**

1. Read `.agents/qa-qc/QA_REPORT.md` — check for open issues assigned to your role and resolve them before new work
2. Read your own role file in `.agents/<role>/<role>.md`
3. Read `PLAN.md` for current specs and decisions

See `.agents/AGENTS.md` for the full team charter and file ownership table.

**Dev server runs on port 3000** (`npm run dev` → `http://localhost:3000`)

## Agent Roles

| Agent | Role File | File Ownership |
|-------|-----------|----------------|
| Frontend | `.agents/frontend/frontend.md` | `src/components/`, `src/App.tsx`, `src/main.tsx`, `src/index.css` |
| Backend | `.agents/backend/backend.md` | `src/lib/`, `src/hooks/` |
| Data Engineer | `.agents/data-engineer/data-engineer.md` | `src/data/`, `src/types/` |
| DevOps | `.agents/devops/devops.md` | `package.json`, config files, `.env*` (exclusive) |
| QA/QC | `.agents/qa-qc/qa-qc.md` | `.agents/qa-qc/QA_REPORT.md` (primary), read-only on all code |

## Critical Data Decisions (from PLAN.md §3 conflict resolution)

- **Crystal cap**: 180/week account-wide · 14/week per character (2026 GMS Reboot values)
- **EXP calculator**: Hybrid — Session Estimator (30-min EXP + % of level) + Progress Mode (flat EXP → new level%)
- **Liberation**: Monthly mode (default) + Weekly mode toggle
- **Game Data Editor**: All tools read localStorage overrides first, then fall back to hardcoded defaults. A gear-icon modal lets users edit game data without code changes.
- **Tailwind**: v3 explicitly (v4 has breaking changes — do not upgrade)

## Tech Stack

React 18 · Vite 5 · TypeScript (strict) · Tailwind CSS v3 · date-fns v3
No backend · No router · localStorage persistence · No state management library
