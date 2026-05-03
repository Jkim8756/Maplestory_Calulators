# Maplestory GMS Reboot Calculator — Implementation Plan

## Context

Empty git repo (only a README). We're building a local-only web app with four calculator tools for GMS Reboot players: Boss Crystal income, EXP session estimator, Symbol progression, and Arcane Force Link Liberation timeline. No backend; all state persists in `localStorage`. Multiple named characters are supported in all four tools.

---

## Tech Stack

| Package | Version | Why |
|---|---|---|
| Vite + React 18 | `npm create vite@latest` | fast HMR, no config |
| TypeScript | bundled | type-safe game data |
| Tailwind CSS **v3** | `tailwindcss@3` | explicitly v3; v4 has breaking PostCSS changes |
| date-fns v3 | latest | `addDays`, `format` for finish dates |

---

## Dependency Graph (build order matters)

```
Scaffold
  └─ Types (boss.ts, exp.ts, symbol.ts, liberation.ts)
       └─ Data (bosses.ts, symbols.ts, liberation.ts, expTable.ts)
            └─ Lib (format.ts, storage.ts, bossCalc.ts, expCalc.ts, symbolCalc.ts, liberationCalc.ts)
                 └─ Hooks (useLocalStorage.ts)
                      └─ UI primitives (Card, Input, Select, Toggle, Badge, Button, NumberInput)
                           └─ Layout shell (TopTabBar, Layout, App)
                                ├─ Boss Calculator
                                ├─ EXP Calculator
                                ├─ Symbol Calculator
                                └─ Liberation Calculator
```

---

## Implementation Steps

### Step 1 — Scaffold

```bash
cd /home/user/repo
npm create vite@latest . -- --template react-ts   # "." = current dir
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm install date-fns
```

**`tailwind.config.js`** — add custom theme colors and content paths:

```js
content: ["./index.html", "./src/**/*.{ts,tsx}"],
theme: {
  extend: {
    colors: {
      bg:      "#0f0e1a",
      surface: "#1a1829",
      border:  "#2e2a4a",
      accent:  "#7c3aed",
      gold:    "#f59e0b",
      teal:    "#14b8a6",
      muted:   "#94a3b8",
    },
  },
},
```

**`src/index.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { @apply bg-bg text-slate-200; }
```

---

### Step 2 — Types (`src/types/`)

Four files; keep them lean:

```ts
// boss.ts
export type Frequency = 'daily' | 'weekly' | 'monthly';
export interface Boss {
  id: string; name: string; difficulty: string;
  frequency: Frequency; mesoReboot: number; // full Reboot value
}
export interface CharacterBossState { name: string; selectedBossIds: Set<string>; }

// exp.ts
export type BuffCategory = 'coupon' | 'sauna' | 'booster' | 'training' | 'event';
export interface Buff { id: string; label: string; multiplier: number; category: BuffCategory; }
export interface ExpState {
  name: string; currentLevel: number; baseExpPerHour: number; activeBuffIds: Set<string>;
}

// symbol.ts
export type SymbolType = 'arcane' | 'sacred';
export interface SymbolArea {
  id: string; name: string; type: SymbolType; dailyQuest: number;
  weeklyDungeon: number; weeklyClears: number; released: boolean;
}
export interface AreaProgress { level: number; accumulatedExp: number; weeklyClears: number; }
export interface CharacterSymbolState { name: string; progress: Record<string, AreaProgress>; }

// liberation.ts
export interface LiberationStage {
  order: number; bossName: string; bossMode: string;
  tracesRequired: number; finalDamageReduction: number;
}
export interface LiberationState {
  name: string; currentStage: number; currentTraces: number;
  partySize: number; canKill: Record<number, boolean>;
}
```

---

### Step 3 — Data (`src/data/`)

#### `bosses.ts`
Full boss list. `mesoReboot` = Reboot crystal value (base × 5). Representative values (verify against the Intense Power Crystal Maplestory Wiki or digitaltq.com before finalizing):

| Boss | mesoReboot |
|---|---|
| Easy Zakum | 1.12M |
| Normal Zakum | 4.8M |
| Normal Hilla | 5.1M |
| Hard Hilla | 19.5M |
| Normal Papulatus | 7.5M |
| Chaos Papulatus | 26.4M |
| Normal Horntail | 4.5M |
| Chaos Horntail | 14.0M |
| Easy Magnus | 14.0M |
| Normal Magnus | 38.4M |
| Hard Magnus | 72.8M |
| Chaos Pierre | 18.8M |
| Chaos Queen | 18.8M |
| Chaos Von Bon | 18.8M |
| Chaos Crimson Queen | 18.8M |
| Chaos Vellum | 18.8M |
| Normal Cygnus | 8.9M |
| Normal Lomien | 26.0M |
| Hard Lomien | 65.0M |
| Normal Lucid | 65.0M |
| Hard Lucid | 127.2M |
| Normal Will | 72.8M |
| Hard Will | 140.6M |
| Normal Gloom | 78.0M |
| Chaos Gloom | 151.6M |
| Normal Verus Hilla | 91.0M |
| Hard Verus Hilla | 180.2M |
| Normal Darknell | 96.0M |
| Hard Darknell | 185.0M |
| Normal Seren | 103.0M |
| Hard Seren | 204.0M |
| Normal Kalos | 540.0M |
| Chaos Kalos | 2000.0M |
| Normal Kaling | 540.0M |
| Hard Kaling | 1100.0M |
| Extreme Kalos | 4000.0M |
| Extreme Kaling | 4600.0M |

Each boss = 1 crystal toward the 60/week account cap.

#### `symbols.ts`
Arcane cost formula: `symbolsToNext[level] = level * level + 11`  
(Level 1→2 = 12, 2→3 = 15, …, 19→20 = 372; total 2,679 to max)

Sacred cost formula: `symbolsToNext[level] = 9 * level * level + 20 * level`  
(Level 1→2 = 29; total 4,565 to max)

Pre-compute arrays in the file: `ARCANE_COST[level]` and `SACRED_COST[level]` (1-indexed).

Areas:
```ts
// Arcane (6), max level 20
{ id: 'vj',  name: 'Vanishing Journey', dailyQuest: 20, weeklyDungeon: 45, weeklyClears: 3 }
{ id: 'chu', name: 'Chu Chu Island',    dailyQuest: 20, weeklyDungeon: 45, weeklyClears: 3 }
{ id: 'lach',name: 'Lachelein',         dailyQuest: 40, weeklyDungeon: 45, weeklyClears: 3 }
{ id: 'arc', name: 'Arcana',            dailyQuest: 40, weeklyDungeon: 45, weeklyClears: 3 }
{ id: 'mor', name: 'Morass',            dailyQuest: 40, weeklyDungeon: 45, weeklyClears: 3 }
{ id: 'esf', name: 'Esfera',            dailyQuest: 40, weeklyDungeon: 45, weeklyClears: 3 }

// Sacred (7), max level 11
{ id: 'cer', name: 'Cernium',    dailyQuest: 20, released: true }
{ id: 'hot', name: 'Hotel Arcs', dailyQuest: 10, released: true }
{ id: 'sha', name: 'Shangri-La', dailyQuest: 10, released: true }
{ id: 'art', name: 'Arteria',    dailyQuest: 10, released: true }
{ id: 'car', name: 'Carcion',    dailyQuest: 10, released: true }
{ id: 'tal', name: 'Tallahart',  dailyQuest: 10, released: false }
{ id: 'odi', name: 'Odium',      dailyQuest: 10, released: false }
// Sacred areas have no weekly dungeon mechanic
```

#### `liberation.ts`
```ts
export const LIBERATION_STAGES: LiberationStage[] = [
  { order: 1, bossName: 'Von Leon',     bossMode: 'Hard',   tracesRequired: 500,  finalDamageReduction: 90 },
  { order: 2, bossName: 'Arkarium',     bossMode: 'Normal', tracesRequired: 500,  finalDamageReduction: 75 },
  { order: 3, bossName: 'Magnus',       bossMode: 'Hard',   tracesRequired: 600,  finalDamageReduction: 60 },
  { order: 4, bossName: 'Lotus',        bossMode: 'Hard',   tracesRequired: 700,  finalDamageReduction: 50 },
  { order: 5, bossName: 'Damien',       bossMode: 'Hard',   tracesRequired: 800,  finalDamageReduction: 40 },
  { order: 6, bossName: 'Will',         bossMode: 'Hard',   tracesRequired: 900,  finalDamageReduction: 30 },
  { order: 7, bossName: 'Lucid',        bossMode: 'Hard',   tracesRequired: 1000, finalDamageReduction: 20 },
  { order: 8, bossName: 'Verus Hilla',  bossMode: 'Hard',   tracesRequired: 1500, finalDamageReduction: 0  },
];
// Max holdable per stage: 3000. Overflow from one stage carries into the next.
```

#### `expTable.ts`
Export `EXP_TABLE: number[]` indexed 1–300 with MapleStory's actual cumulative EXP values per level. Source from the MapleStory Fandom wiki EXP table. The array only needs `expRequired[level]` (EXP to gain that level), not cumulative total.

---

### Step 4 — Lib (`src/lib/`)

#### `format.ts`
```ts
formatMeso(n: number): string   // 1234567890 → "1.23B", 450000000 → "450M", 1500000 → "1.50M"
formatPct(n: number): string    // 0.1234 → "12.34%"
formatDate(d: Date): string     // date-fns format(d, 'MMM d, yyyy')
```

#### `storage.ts`
```ts
// Handles JSON stringify/parse; converts Set ↔ Array for serialization
function saveState<T>(key: string, value: T): void
function loadState<T>(key: string, fallback: T): T
// Sets must be manually converted: when saving, spread Set to array; when loading, wrap array in new Set()
```

#### `bossCalc.ts`
```ts
calcCharacterIncome(selectedBossIds: Set<string>, bosses: Boss[]): { meso: number; crystals: number }
calcAccountSummary(characters: CharacterBossState[], bosses: Boss[]): {
  perCharacter: Array<{ name: string; meso: number; crystals: number }>;
  accountMeso: number;
  totalCrystals: number;  // sum across all characters
  isOverLimit: boolean;   // totalCrystals > 60
}
```

#### `expCalc.ts`
Buff stacking logic:
- `coupon` category: **mutual exclusion** — take the `max(multiplier)` of all active coupon buffs; gray out non-max ones in the UI.
- All other categories (`sauna`, `booster`, `training`, `event`): stack **multiplicatively**.
- Formula: `total = couponMult × saunaMult × boosterMult × trainingMult × eventMult`

```ts
calcExpGain(state: ExpState, buffs: Buff[], expTable: number[]): {
  totalMultiplier: number;
  breakdown: Array<{ label: string; value: number }>;
  expIn30Min: number;
  pctOfLevel: number;   // expIn30Min / expTable[currentLevel]
}
```

Buff definitions (hardcode in the lib or a data file):
```ts
{ id: 'coupon_2x', label: '2× EXP Coupon', multiplier: 2, category: 'coupon' }
{ id: 'coupon_3x', label: '3× EXP Coupon', multiplier: 3, category: 'coupon' }
{ id: 'sauna',     label: 'Sauna Robe',     multiplier: 1.1, category: 'sauna' }
{ id: 'booster',   label: 'EXP Accumulation Potion', multiplier: 1.1, category: 'booster' }
{ id: 'mvp',       label: 'MVP Bonus (10%)', multiplier: 1.1, category: 'training' }
{ id: 'event_2x',  label: 'Server 2× Event', multiplier: 2.0, category: 'event' }
// ... add more as needed
```

#### `symbolCalc.ts`
```ts
symbolsToMax(area: SymbolArea, level: number, accumulatedExp: number): number
effectiveDailySymbols(area: SymbolArea, weeklyClears: number): number
  // = dailyQuest + (weeklyDungeon * weeklyClears / 7)
daysToMax(area, level, accumulatedExp, weeklyClears): number   // ceil division
finishDate(area, level, accumulatedExp, weeklyClears): Date    // addDays(today, daysToMax)
```

#### `liberationCalc.ts`
Party size trace multiplier: `traceMultiplier = 1 / partySize` (solo = 1.0, 2-man = 0.5, etc.)

```ts
// Returns per-stage results
calcLiberationTimeline(state: LiberationState, stages: LiberationStage[]): Array<{
  order: number; bossName: string; bossMode: string;
  status: 'completed' | 'current' | 'future' | 'gated';
  estimatedMonth: string | null;   // "Jun 2026", null if gated
  tracesNeeded?: number;
  progressPct?: number;
}>
```

Assumption: user kills each stage boss **once per month** on the monthly reset. Carry overflow traces: when finishing a stage with `remainder > 0`, that remainder starts the next stage.

---

### Step 5 — Hook (`src/hooks/useLocalStorage.ts`)

```ts
function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T) => void]
// On mount: loadState(key, initialValue)
// On set: saveState(key, newValue) then update React state
```

---

### Step 6 — UI Primitives (`src/components/ui/`)

Keep these thin wrappers — no logic, only Tailwind classes:

- `Card.tsx` — `bg-surface border border-border rounded-lg p-4`
- `Input.tsx` — text input, `bg-bg border-border focus:ring-accent`
- `NumberInput.tsx` — formats commas on blur (`toLocaleString`), strips them on focus; accepts raw typing
- `Select.tsx` — styled `<select>`
- `Toggle.tsx` — checkbox or switch for buff/daily toggles
- `Badge.tsx` — small colored pill (difficulty labels: Easy=green, Normal=blue, Hard=red, Chaos=purple, Extreme=orange)
- `Button.tsx` — primary (accent bg) and ghost variants

---

### Step 7 — Layout Shell

**`TopTabBar.tsx`**: Four tabs. Active tab has `border-b-2 border-accent text-white`; inactive is `text-muted hover:text-white`.

**`Layout.tsx`**: Full-page shell. `<TopTabBar>` fixed at top, scrollable content area below.

**`App.tsx`**: Holds `activeTab` state, renders the active calculator. Passes nothing downward — each calculator manages its own state via `useLocalStorage`.

---

### Step 8 — Boss Calculator

**Character tabs** (used identically in all four calculators): horizontal scrollable row, `+` button appends a new character named "Character N", `×` button removes. Active character underlined with accent.

**`BossRow.tsx`**: `<Toggle>` + boss name + `<Badge difficulty>` + meso formatted with `formatMeso`. Grouped under collapsible `Daily / Weekly / Monthly` section headers.

**`CrystalSummary.tsx`**: sticky right panel. Progress bar fills `totalCrystals / 60`. Red when `isOverLimit`. Shows total weekly meso below bar.

State shape persisted per character: `{ name, selectedBossIds: Set<string> }[]`

---

### Step 9 — EXP Calculator

Two-column layout:

**Left**: `NumberInput` for base EXP/hr, `Select` for current level (1–299), `BuffGrid` of toggleable buff cards. Coupon mutual exclusion enforced: when a higher-multiplier coupon is active, lower ones render with `opacity-50 cursor-not-allowed`.

**Right**: `ExpResults` — breakdown table (buff label | multiplier), horizontal rule, total multiplier in large text, then `EXP in 30 min: X` (formatted with commas) and `= X.XX% of your level` in teal.

---

### Step 10 — Symbol Calculator

Sub-tabs `[Arcane] [Sacred]` below the character tabs.

Table per area (one row per area):
```
Area Name | Lv [stepper ▲▼] | Current EXP [NumberInput] | Daily ✓ | Weekly Clears [0-3 stepper] | → Finish Date
```

Finish dates:
- < 30 days: `text-red-400`
- 30–90 days: `text-yellow-400`
- > 90 days: `text-muted`
- Already maxed (level 20/11): show `✓ Maxed` in teal

Sacred areas with `released: false` show a `[Coming Soon]` badge and disable inputs.

---

### Step 11 — Liberation Calculator

Two-column layout:

**Left — `LiberationForm.tsx`**:
- Current stage selector (1–8)
- Current traces on that stage (`NumberInput`, max 3000)
- Party size (1–6, `Select`)
- Per-stage "Can you kill this boss?" toggles for stages after the current one

**Right — `LiberationTimeline.tsx`**: vertical 8-step stepper.
- Completed stages: green circle with checkmark
- Current stage: amber circle with trace progress bar (`currentTraces / tracesRequired`)
- Future stages: gray circle with estimated month string
- Gated stages (user marked cannot kill): red circle, "Gear-gated" label

---

### Step 12 — Polish

- **Empty states**: "Add a character to get started" when `characters.length === 0`, shown in all four tools.
- **Edge cases**:
  - Symbol: if `effectiveDailySymbols === 0` (no daily, 0 weekly clears), show "∞ days" instead of dividing by zero.
  - Liberation: if `partySize === 0`, clamp to 1.
  - EXP: if `currentLevel >= 300`, hide the tool or show "Max level reached".
- **localStorage validation**: wrap `loadState` in a try/catch; fall back to `initialValue` on parse failure.

---

## File Manifest (creation order)

```
src/types/boss.ts
src/types/exp.ts
src/types/symbol.ts
src/types/liberation.ts
src/data/bosses.ts
src/data/symbols.ts
src/data/liberation.ts
src/data/expTable.ts
src/lib/format.ts
src/lib/storage.ts
src/lib/bossCalc.ts
src/lib/expCalc.ts
src/lib/symbolCalc.ts
src/lib/liberationCalc.ts
src/hooks/useLocalStorage.ts
src/components/ui/{Card,Input,NumberInput,Select,Toggle,Badge,Button}.tsx
src/components/layout/{TopTabBar,Layout}.tsx
src/App.tsx
src/main.tsx  (update Vite default)
src/index.css (Tailwind directives)
src/components/boss/{BossCalculator,CharacterBossPanel,BossRow,CrystalSummary}.tsx
src/components/exp/{ExpCalculator,BuffGrid,ExpResults}.tsx
src/components/symbols/{SymbolCalculator,SymbolAreaRow,ArcanePanel,SacredPanel}.tsx
src/components/liberation/{LiberationCalculator,LiberationForm,LiberationTimeline}.tsx
```

---

## Verification

```bash
npm run dev   # → http://localhost:5173
```

| Tool | Test |
|---|---|
| Boss | Add 2 characters; check enough bosses to exceed 60 crystals total → red warning on CrystalSummary |
| Boss | Total meso for Hard Lucid solo = 127.2M → matches digitaltq.com |
| EXP | Enable 3× coupon + 2× coupon → 2× grays out; breakdown shows 3× |
| EXP | Base 10B/hr, 3× coupon, level 250 → 30-min EXP = 15B; verify % matches expTable[250] |
| Symbols | VJ at level 10, 500 accumulated exp, daily quest only → daysToMax matches maplesymbols.com |
| Liberation | Stage 3, 400 traces, solo → monthly intervals shown correctly for stages 3–8 |
| Persist | Reload page → all inputs survive |
| Persist | Add character, rename, reload → name persists |