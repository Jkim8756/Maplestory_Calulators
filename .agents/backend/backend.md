# Backend Agent

## Role
Implement all calculation logic, data utilities, and the localStorage hook. Own the math layer between raw game data and UI display. Do not write JSX/TSX component files.

## Owns
- `src/Backend/lib/bossCalc.ts`
- `src/Backend/lib/expCalc.ts`
- `src/Backend/lib/symbolCalc.ts`
- `src/Backend/lib/liberationCalc.ts`
- `src/Backend/lib/format.ts`
- `src/Backend/lib/storage.ts`
- `src/Backend/hooks/useLocalStorage.ts`

## Does NOT Touch
- `src/components/` — UI (Frontend)
- `src/data/` — game data constants (Data Engineer)
- `src/types/` — type definitions (Data Engineer)
- `.env*` — environment files (DevOps)

---

## Session Start Checklist
1. Read `.agents/qa-qc/QA_REPORT.md` — resolve any `backend` open issues before new work
2. Read `PLAN.md` §5 (formulas) and §8 (Verification Checklist)
3. Run `npx tsc --noEmit` before starting work

---

## Formulas (from PLAN.md)

### Boss Crystals
- Each boss = 1 crystal
- Per-character cap: **14 crystals/week**
- Account/world cap: **180 crystals/week**
- Meso income: `meso / partySize` per boss
- `calcAccountSummary()` returns: per-character breakdowns + account totals + `crystalsUsed` + `isOverLimit`

### EXP Calculator
- Coupon category: mutually exclusive — only highest multiplier applies
- All other buff categories stack multiplicatively
- `totalMultiplier = couponMult × saunaMult × boosterMult × trainingMult × eventMult`
- Session mode: `expGained = baseExpPerHour × totalMultiplier × (durationMin / 60)`
- Progress mode: `newPct = (currentExpFlat + gainedExpFlat) / expTable[currentLevel]`
- `pctOfLevel = expGained / expTable[currentLevel]`

### Symbol Calculator
- Arcane cost: `symbolsNeeded = level² + 11` (0-indexed: `ARCANE_COST[0]` = cost for lv1→2)
- Sacred cost: `symbolsNeeded = (9 × level²) + (20 × level)`
- `effectiveDailySymbols = dailyQuest + (weeklyDungeonSymbols × clears / 7)`
- `daysToMax = ceil(symbolsToMax / effectiveDailySymbols)`
- `finishDate = addDays(today, daysToMax)`

### Liberation Calculator
- Monthly mode: 1 kill per monthly reset, traces carry over to next stage
- Weekly mode: `weeksLeft = ceil(remainingTraces / weeklyTraces)`
- Party size divides traces: `tracesEarned = fullTraces / partySize`
- Max holdable: 3,000 traces (overflow carries to next stage)

---

## format.ts Exports

```ts
formatMeso(n: number): string     // 1234567890 → "1.23B" · 450000000 → "450M"
formatPct(n: number): string      // 0.1234 → "12.3%"
formatDate(d: Date): string       // → "Jun 2026"
formatNumber(n: number): string   // comma-separated integer
```

## storage.ts Notes

- `Set<string>` serializes as `string[]` — use `Array.from()` on save, `new Set()` on load
- All save/load functions are typed with generics: `loadState<T>`, `saveState<T>`
- LocalStorage keys prefixed `ms_calc_` to avoid collisions
- `loadState` catches JSON parse errors and returns `defaultValue`

## useLocalStorage.ts

Generic hook: `useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void]`
Supports functional updater pattern to avoid stale closures.
