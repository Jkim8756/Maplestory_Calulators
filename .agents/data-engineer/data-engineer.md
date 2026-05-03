# Data Engineer Agent

## Role
Own all game data constants, TypeScript type definitions, and the data layer architecture. Ensure data is accurate, well-typed, and designed for future migration from localStorage to a database + REST API.

## Owns
- `src/data/bosses.ts`
- `src/data/symbols.ts`
- `src/data/liberation.ts`
- `src/data/expTable.ts`
- `src/types/boss.ts`
- `src/types/exp.ts`
- `src/types/symbol.ts`
- `src/types/liberation.ts`

## Does NOT Touch
- `src/components/` — UI (Frontend)
- `src/lib/` — calculation logic (Backend)
- `.env*` — environment files (DevOps)

---

## Session Start Checklist
1. Read `.agents/qa-qc/QA_REPORT.md` — resolve any `data-engineer` open issues before new work
2. Verify game data against source wikis when updating values (digitaltq.com, maplestorywiki.net)
3. Read `PLAN.md` §9 (Assumptions & Notes) for data source references

---

## Data Contracts

### Boss (`src/types/boss.ts`)
```ts
interface Boss {
  id: string;                               // UUID-style for future DB compat
  name: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Chaos' | 'Extreme';
  frequency: 'daily' | 'weekly' | 'monthly';
  mesoReboot: number;                       // raw mesos (Reboot = base × 5)
}
```
Key values (from PLAN.md research):
- Hard Lucid: ~127,197,800 · Hard Will: ~140,594,200 · Chaos Gloom: ~151,576,200
- Hard Verus Hilla: ~180,241,400 · Chaos Kalos: ~2,000,000,000 · Hard Chosen Seren: ~3,025,000,000
- Kalos Extreme: ~4,000,000,000 · Kaling Extreme: ~4,600,000,000

### Symbol (`src/types/symbol.ts`)
```ts
interface SymbolArea {
  id: string;
  name: string;
  type: 'arcane' | 'sacred';
  minLevel: number;
  maxLevel: number;                         // arcane: 20 · sacred: 11
  dailyQuestSymbols: number;
  weeklyDungeonSymbols: number;             // per clear
  weeklyDungeonMaxClears: number;           // 3 for arcane, 0 for most sacred
  released: boolean;                        // false = show "Coming Soon"
}
```

### Symbol cost arrays (`src/data/symbols.ts`)
- `ARCANE_COST: number[]` — 19 entries, index 0 = cost to go lv1→2 = 12
- `SACRED_COST: number[]` — 10 entries, index 0 = cost to go lv1→2 = 29
- Pre-compute from formulas: arcane = `level² + 11`, sacred = `(9 × level²) + (20 × level)`

### Liberation (`src/types/liberation.ts`)
```ts
interface LiberationStage {
  order: number;                            // 1–8
  bossName: string;
  bossMode: string;
  tracesRequired: number;
  finalDamageReduction: number;            // percentage e.g. 90 = 90% FDR
}
```

### EXP Table (`src/data/expTable.ts`)
- `EXP_TABLE: number[]` — index = level (1-based), value = EXP required for that level
- Covers levels 1–300
- Source: MapleStory Wiki Experience table

---

## LocalStorage Override System

Each data file must export:
1. Default hardcoded constants (e.g. `DEFAULT_BOSSES`)
2. A `loadWithOverride()` function that checks `localStorage` for user-edited JSON first, then falls back to defaults

This is the mechanism for the Game Data Editor modal (see `PLAN.md` §6).

---

## Future DB Architecture (Design With This in Mind)

- All types use `id: string` for UUID compatibility — no numeric auto-increment IDs
- Separate game data (boss list, symbol areas) from user data (character progress, selections) in the type system
- User data types should be normalized: `CharacterBossConfig` references `Boss.id`, not the full boss object
- When migrating, game data becomes DB tables with admin-editable rows; user data becomes per-account rows
- API contract: `GET /api/bosses` returns `Boss[]`; `POST /api/characters/:id/bosses` saves selections
