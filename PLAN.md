# MapleStory GMS Reboot Local Calculator App — Unified Implementation Plan

**Generated:** May 02, 2026  
**Source Plans:** PLAN.codex.md (high-level features) + PLAN.claude.md (detailed blueprint)  
**Status:** Synthesized & Ready for Development

---

## 1. Executive Summary

Build a **local-first, offline-only** React + Vite + TypeScript web application for GMS Reboot/Heroic players.

The app provides **four powerful calculators** in a clean tabbed interface:

1. **Boss Crystals** — Weekly income tracker with party-size splitting and hard caps
2. **EXP** — Session estimator + progress-to-next-level calculator with buff stacking
3. **Symbols** — Arcane & Sacred farming timeline with finish dates
4. **Liberation (AFL)** — Trace farming timeline with monthly/weekly modes and gated stages

**Core Principles**
- Everything saved in `localStorage` (no backend, no accounts)
- Multiple named characters supported across all tools
- Game data is **editable locally** (JSON editor) so future patches never require code changes
- Modern dark UI with violet/gold/teal accents
- Fully responsive but desktop-optimized

---

## 2. Tech Stack (Identical in Both Plans)

| Package              | Version          | Purpose                              |
|----------------------|------------------|--------------------------------------|
| Vite + React 18      | Latest           | Fast HMR, zero-config                |
| TypeScript           | Bundled          | Type-safe game data & calculations   |
| Tailwind CSS         | v3 (explicit)    | Styling (v4 has breaking changes)    |
| date-fns             | v3+              | Date math for finish dates           |

**Theme Colors**
```js
bg:      "#0f0e1a"
surface: "#1a1829"
border:  "#2e2a4a"
accent:  "#7c3aed"   // violet
gold:    "#f59e0b"
teal:    "#14b8a6"
muted:   "#94a3b8"
```

---

## 3. Key Differences Between Source Plans & Resolutions

| Feature                  | PLAN.codex.md                          | PLAN.claude.md                              | Final Decision |
|--------------------------|----------------------------------------|---------------------------------------------|----------------|
| Crystal Caps             | 14 per char / **180 world**            | 60/week account                             | Use **180 world cap** (2026 data) |
| EXP Model                | Current level + **EXP %** + flat gains | Base EXP/hr + 30-min buff session           | **Hybrid**: Session mode + Progress mode |
| Symbol Schedules         | Fixed defaults                         | Detailed per-area + weekly clears           | Claude UI + fixed defaults (Codex preference) |
| Liberation               | Weekly traces + weeks left (ceil)      | 8-stage monthly timeline + carry-over       | Claude timeline + optional Weekly mode toggle |
| Data Editability         | **Core requirement** (local JSON)      | Hardcoded TS constants                      | Add **Game Data Editor** modal (Codex priority) |
| Implementation Detail    | High-level + test plan                 | Full file manifest + step-by-step           | Use Claude structure + Codex requirements |

---

## 4. Application Architecture

### 4.1 Dependency Graph (Build Order)

```
Scaffold (Vite + Tailwind + date-fns)
  └─ Types (boss.ts, exp.ts, symbol.ts, liberation.ts)
       └─ Data (bosses.ts, symbols.ts, liberation.ts, expTable.ts + local JSON overrides)
            └─ Lib (format.ts, storage.ts, bossCalc.ts, expCalc.ts, symbolCalc.ts, liberationCalc.ts)
                 └─ Hooks (useLocalStorage.ts)
                      └─ UI Primitives (Card, Input, NumberInput, Select, Toggle, Badge, Button)
                           └─ Layout (TopTabBar, Layout, App)
                                ├─ BossCalculator
                                ├─ ExpCalculator
                                ├─ SymbolCalculator
                                └─ LiberationCalculator
```

### 4.2 File Structure (Final)

```
src/
├── types/
│   ├── boss.ts
│   ├── exp.ts
│   ├── symbol.ts
│   └── liberation.ts
├── data/
│   ├── bosses.ts          # default + localStorage override
│   ├── symbols.ts
│   ├── liberation.ts
│   └── expTable.ts
├── lib/
│   ├── format.ts
│   ├── storage.ts
│   ├── bossCalc.ts
│   ├── expCalc.ts
│   ├── symbolCalc.ts
│   └── liberationCalc.ts
├── hooks/
│   └── useLocalStorage.ts
├── components/
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── NumberInput.tsx
│   │   ├── Toggle.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── TopTabBar.tsx
│   │   └── Layout.tsx
│   ├── boss/
│   │   ├── BossCalculator.tsx
│   │   ├── CharacterTabs.tsx
│   │   ├── BossRow.tsx
│   │   └── CrystalSummary.tsx
│   ├── exp/
│   │   ├── ExpCalculator.tsx
│   │   ├── BuffGrid.tsx
│   │   └── ExpResults.tsx
│   ├── symbols/
│   │   ├── SymbolCalculator.tsx
│   │   ├── ArcanePanel.tsx
│   │   └── SacredPanel.tsx
│   └── liberation/
│       ├── LiberationCalculator.tsx
│       ├── LiberationForm.tsx
│       └── LiberationTimeline.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## 5. Detailed Tool Specifications

### 5.1 Boss Crystals Tool (MVP Priority)

**Features**
- Character tabs (shared across app)
- Boss list grouped by frequency (Daily / Weekly / Monthly)
- Toggle per boss + difficulty Badge + formatted meso value
- Per-boss or global **Party Size** input (1–6)
- Real-time character income (meso + crystals)
- Account summary with **180 crystal cap** progress bar (red when exceeded)
- Sticky right panel showing total weekly meso

**Calculation Rules**
- Each boss = 1 crystal
- Party-size division applied to meso
- Per-character weekly cap: **14 crystals**
- World/account cap: **180 crystals**

**State**
```ts
interface CharacterBossState {
  name: string;
  selectedBossIds: Set<string>;
  partySize: number;           // default 1
}
```

---

### 5.2 EXP Calculator Tool

**Two Modes (Hybrid Approach)**

**Mode A — Session Estimator (Claude)**
- Base EXP per hour input
- Current Level (1–299)
- Buff grid with smart stacking:
  - Coupons: mutually exclusive (highest wins, others grayed)
  - All other buffs: multiplicative
- 30-minute EXP gain + % of current level

**Mode B — Progress to Next Level (Codex)**
- Current Level + Current EXP %
- Add flat EXP from any source (vouchers, events, sauna, manual)
- Shows new % and levels gained

**Buff Examples**
- 2× / 3× EXP Coupons
- Sauna Robe (1.1×)
- EXP Accumulation Potion (1.1×)
- MVP Bonus (1.1×)
- Server 2× Events, etc.

---

### 5.3 Symbols Tool

**Layout**
- Character tabs
- Sub-tabs: **Arcane** | **Sacred**

**Per-Area Row**
- Area Name
- Level (stepper 1–20 / 1–11)
- Current Symbol EXP (NumberInput)
- Daily Quest toggle
- Weekly Clears (0–3 stepper)
- Finish Date (color-coded):
  - < 30 days → red
  - 30–90 days → yellow
  - > 90 days → muted
- Days Remaining
- Total Symbols Remaining (summary)

**Data**
- Pre-computed cost arrays (`ARCANE_COST`, `SACRED_COST`)
- Fixed daily/weekly values (per Codex preference)
- Unreleased Sacred areas show "Coming Soon" badge

---

### 5.4 Liberation (AFL) Tool

**Left Panel — Form**
- Current Stage selector (1–8)
- Current Traces (0–3000)
- Party Size (1–6)
- "Can Kill?" toggles for future stages

**Right Panel — Timeline**
Vertical 8-step stepper:
- Completed stages → green checkmark
- Current stage → amber progress bar (`currentTraces / tracesRequired`)
- Future stages → gray + estimated month
- Gated stages → red "Gear-gated"

**Modes**
- **Monthly Mode** (default): Assumes 1 kill per monthly reset + trace carry-over
- **Weekly Mode** (toggle): Uses weekly trace total + `ceil(remaining / weeklyTotal)`

**Stages (Final Data)**
1. Von Leon (Hard) — 500 traces — 90% FDR
2. Arkarium (Normal) — 500 — 75%
3. Magnus (Hard) — 600 — 60%
4. Lotus (Hard) — 700 — 50%
5. Damien (Hard) — 800 — 40%
6. Will (Hard) — 900 — 30%
7. Lucid (Hard) — 1000 — 20%
8. Verus Hilla (Hard) — 1500 — 0%

---

## 6. Game Data Editability (Critical Codex Requirement)

Add a **"Game Data"** button (gear icon in top bar) that opens a modal with:

- JSON editor for:
  - Boss crystal values
  - EXP table & buff multipliers
  - Symbol daily/weekly values & costs
  - Liberation trace requirements & FDR
- Import / Export buttons
- "Reset to Defaults" button

All calculators read from localStorage override first, then fall back to hardcoded defaults.

---

## 7. Implementation Roadmap (12 Steps)

1. **Scaffold** — Vite + Tailwind v3 + date-fns
2. **Types** — All four domain types
3. **Data Layer** — Default values + localStorage override system
4. **Lib Functions** — All calc utilities (`bossCalc`, `expCalc`, etc.)
5. **Storage Hook** — `useLocalStorage` with Set support + validation
6. **UI Primitives** — Reusable components
7. **Layout Shell** — TopTabBar + Layout + App.tsx
8. **Boss Calculator** — Full implementation + summary panel
9. **EXP Calculator** — Hybrid session + progress modes
10. **Symbol Calculator** — Arcane + Sacred panels
11. **Liberation Calculator** — Timeline + weekly toggle
12. **Polish** — Empty states, edge cases, Game Data Editor modal, testing

---

## 8. Verification Checklist

- [ ] Boss totals respect 14/char and 180 world caps
- [ ] Party-size division works correctly
- [ ] EXP % calculations match `expTable[currentLevel]`
- [ ] Symbol remaining totals match cumulative cost tables
- [ ] Liberation weeks left uses `ceil(remaining / weeklyTotal)` in weekly mode
- [ ] All data survives full page refresh
- [ ] Game Data Editor successfully overrides values
- [ ] No console errors on any tab or character action

---

## 9. Assumptions & Notes

- Target server: **GMS Reboot / Heroic**
- All default values researched as of **May 02, 2026**
- VIP Booster / AFK Sauna use manual observed values (no fixed public table)
- Symbol schedules are intentionally **fixed** (user preference)
- Crystal cap of **180/week** is the current 2026 value (updated from older 60 cap)

---

**This unified plan is now the single source of truth for development.**

Ready to begin scaffolding.