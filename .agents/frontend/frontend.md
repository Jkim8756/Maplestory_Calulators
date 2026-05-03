# Frontend Agent

## Role
Design and implement all UI components. Responsible for how data is displayed, user interactions, layout, and visual correctness. Consume calculation results from `src/lib/` — do not re-implement math in components.

## Owns
- `Frontend/components/**/*.tsx`
- `Frontend/App.tsx`
- `Frontend/main.tsx`
- `Frontend/index.css`

## Does NOT Touch
- `src/lib/` — calculation logic (Backend)
- `src/data/` — game data (Data Engineer)
- `src/types/` — type definitions (Data Engineer)
- `.env*` — environment files (DevOps)

---

## Session Start Checklist
1. Read `.agents/qa-qc/QA_REPORT.md` — resolve any `frontend` open issues before new work
2. Read `PLAN.md` §5 (Tool Specifications) and §4.2 (File Structure)
3. Confirm `npm run dev` works and there are no TypeScript errors (`npx tsc --noEmit`)

---

## UI Conventions

**Theme** — use only `maple-*` Tailwind colors:
- `maple-bg` (#0f0e1a) — page background
- `maple-surface` (#1a1829) — card/panel backgrounds
- `maple-border` (#2e2a4a) — borders and dividers
- `maple-accent` (#7c3aed) — active tabs, primary buttons
- `maple-gold` (#f59e0b) — meso values
- `maple-teal` (#14b8a6) — EXP / positive results
- `maple-red` (#ef4444) — warnings, over-limit states
- `maple-text` (#e2e8f0) — primary text
- `maple-muted` (#94a3b8) — secondary / placeholder text

**Formatting** — always use lib utilities, never format inline:
- Meso values → `formatMeso()` from `src/lib/format.ts` (outputs `1.2B`, `450M`, etc.)
- Dates → `formatDate()` from `src/lib/format.ts`
- Percentages → `formatPct()` from `src/lib/format.ts`

**No hardcoded game data in components.** Import from `src/data/` only.

---

## Navigation Layout

Top tab bar with 4 tabs: `[Boss Crystals] [EXP] [Symbols] [Liberation]`
- Active tab: underlined with `maple-accent`, bold text
- Below the main tabs: horizontal scrollable character tabs shared across all 4 tools
- Character tabs: `+ Add` button at end, `×` delete on hover

---

## Tool Layouts

### Boss Crystals
- Boss list in left/main area grouped by Daily / Weekly / Monthly sections
- Each row: checkbox · boss name · difficulty Badge · meso value (gold)
- Per-boss party size input (1–6)
- Right sticky panel: crystal usage bar (X / 180), total weekly meso
- Red warning banner when character exceeds 14 crystals or account exceeds 180

### EXP Calculator
- Two mode tabs: **Session Estimator** · **Progress Mode**
- Session: left col = base EXP/hr + current level + buff grid; right col = results breakdown
- Progress: current level + current EXP% + flat EXP sources → new level%
- Buff cards: toggleable, mutually-exclusive coupons gray out when a stronger one is selected

### Symbol Calculator
- Sub-tabs: **Arcane** · **Sacred**
- Table rows per area: Area name · Level stepper · Current symbol EXP · Daily ✓ · Weekly clears (0–3) · Extra/day · Finish Date
- Finish date color: red < 30 days · yellow 30–90 days · muted > 90 days
- "Coming Soon" badge for unreleased Sacred areas (`released: false`)

### Liberation Calculator
- Left panel: stage selector (1–8), current traces, party size, "Can Kill?" toggles per future stage
- Right panel: vertical 8-step timeline stepper
  - Completed → green checkmark
  - Current → amber with trace progress bar
  - Future → gray + estimated month
  - Gear-gated → red label
- Mode toggle: Monthly · Weekly

### Game Data Editor (gear icon in top bar)
- Modal with JSON editor for all game data overrides
- Import / Export buttons
- "Reset to Defaults" button
- Changes write to localStorage and immediately re-render calculators
