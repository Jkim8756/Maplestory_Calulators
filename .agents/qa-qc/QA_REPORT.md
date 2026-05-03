# QA/QC Issue Log

Every agent must read this file at the start of each session before taking new work.
QA/QC updates this file after each review cycle. Each issue row must have exactly one owner.

## Status Values

- Open
- In Progress
- Blocked
- Ready for QA
- Verified
- Won't Fix

## Severity Values

- Critical: blocks app usage or causes incorrect core calculator output
- High: major feature broken, bad persistence, wrong formula, or serious UX issue
- Medium: partial feature issue, unclear validation, edge-case failure
- Low: polish, copy, layout, minor accessibility, maintainability

## Agent Ownership

- Frontend: display bugs, layout, tabs, controls, accessibility, visual clarity, responsive behavior
- Backend: formulas, calculator logic, validation behavior, derived totals, date math
- Data Engineer: default data tables, local override shape, migration path toward DB/API, import/export schema
- DevOps: CLI setup, MCP/SaaS connections, environment variables, build/test scripts, `.env` access
- QA/QC: test gaps, unclear acceptance criteria, regression tracking, issue log maintenance

## Open Issues

| ID | Status | Severity | Owner Agent | Area | Summary | Acceptance Criteria | Evidence / Steps | Created | Updated |
|----|--------|----------|-------------|------|---------|---------------------|------------------|---------|---------|
| QA-001 | Open | Medium | QA/QC | Tests | No automated calculator tests exist yet. | Add focused unit tests for boss caps, EXP percent, symbol remaining, liberation weekly estimate, and storage fallback behavior. | `npm.cmd run test:run -- --passWithNoTests` passes because no test files are present. | 2026-05-02 | 2026-05-02 |
| QA-002 | Verified | High | Frontend | ExpCalculator | `pctOfLevel30min` is already a 0–100 percentage but is multiplied by 100 again before being passed to `ProgressBar`. | `ProgressBar` receives the raw percentage value (e.g. 45.2 for 45.2%). Bar should fill to 45.2%, not clamp to 100% for any gain above 1% of level. | Fixed in `ExpCalculator.tsx`: removed `* 100` from ProgressBar value prop. tsc passes. | 2026-05-02 | 2026-05-02 |
| QA-003 | Verified | High | Frontend | ExpCalculator | `formatPct` is called with `pctOfLevel30min` (already a % value), causing a 100x over-display in the fine-print label. | Fine-print label reads e.g. "45.20%" for a 45.2% session gain. | Fixed in `ExpCalculator.tsx`: replaced `formatPct(...)` with inline `.toFixed(2)%`. Removed unused `formatPct` import. tsc passes. | 2026-05-02 | 2026-05-02 |

## Verified This Session

| Check | Result | Evidence |
|-------|--------|----------|
| Production build | Passed | `npm.cmd run build` completed successfully after esbuild spawn approval. |
| Test runner | Passed with no tests | `npm.cmd run test:run -- --passWithNoTests` completed successfully and reported no test files. |
| Root path | Verified | Work performed in `C:\Users\jonat\Desktop\Projects\Maplestory_Calulators-Codex`. |
| TypeScript check (`npx tsc --noEmit`) | PASS | Exit code 0, no type errors across all source files. |
| Boss caps: 14/char and 180/account constants | PASS | `bossCalc.ts` exports `CRYSTALS_PER_CHARACTER_CAP = 14` and `CRYSTALS_ACCOUNT_CAP = 180`. `calcAccountSummary` sums all character crystal counts and sets `isOverAccountCap` when total > 180. |
| Party-size division | PASS | `calcCharacterIncome` in `bossCalc.ts` line 59 applies `Math.floor(boss.mesoReboot / partySize)` to every boss. Account total is the sum of all per-character `weeklyMeso`. |
| EXP formula: `pctOfLevel30min = expGained30min / expTable[level]` | PASS (formula) / FAIL (display) | Formula in `expCalc.ts` line 80 is correct. Two display bugs found (QA-002, QA-003) in `ExpCalculator.tsx`. |
| Coupon exclusivity (highest wins, others disabled) | PASS | `expCalc.ts` `resolveBuffs`: exclusive-group map keeps the highest `multiplier` buff active, adds lower ones to `disabledBuffIds`. `ExpCalculator.tsx` applies `buff-card-muted` class to disabled IDs. |
| Other buff categories stack multiplicatively | PASS | `resolveBuffs` reduces `effectiveBuffs` with `product * buff.multiplier`, including `eventMult` applied on top in `calcExpSession`. |
| ARCANE_COST: 19 entries, sum = 2,679 | PASS | Verified by script: `[12,15,20,27,36,47,60,75,92,111,132,155,180,207,236,267,300,335,372]` → count=19, sum=2679. |
| SACRED_COST: 10 entries, sum = 4,565 | PASS | Verified by script: `[29,76,141,224,325,444,581,736,909,1100]` → count=10, sum=4565. |
| Symbol cost table indexing | PASS | `symbolCalc.ts` uses `costTable[lv - 1]` in a loop from `level` to `maxLevel - 1`, correctly credits current-level partial progress. Manual verification for levels 1, 2, 5 matches expected totals. |
| Symbol `daysToMax` formula | PASS | `symbolCalc.ts` line 74: `daysToMax = dailyRate > 0 ? Math.ceil(toMax / dailyRate) : Infinity`. Correct ceiling division. |
| Liberation data: 8 stages, correct trace amounts | PASS | `liberation.ts` defines exactly 8 stages with traces 500/500/600/700/800/900/1000/1500 and FDR 90/75/60/50/40/30/20/0 matching PLAN.md §5.4. |
| Liberation monthly mode: 1 kill per reset, carry-over | PASS | `liberationCalc.ts`: each stage uses `Math.ceil(needed / tracesPerKill)` months, then carry-over = `carryTraces + tracesPerKill * monthsNeeded - tracesRequired`. Verified by script: stage-1 solo produces carryTraces=2500 into stage-2. |
| Liberation weekly mode: `ceil(remaining / weeklyTotal)` | PASS | `liberationCalc.ts` line 79: `weeksLeft = needed <= 0 ? 0 : Math.ceil(needed / weeklyTraces)`. Correct. |
| `formatMeso` B/M/K thresholds | PASS | Thresholds at 1T/1B/1M/1K with correct `.toFixed` precision. Negative and NaN inputs clamped to 0. |
| No hardcoded game data in component files | PASS | All meso values, trace amounts, and cost tables are received as props from `App.tsx`, which reads from `src/data/`. Component files contain only UI logic and display formatting. |

*Last updated: 2026-05-02 · Updated by: qa-qc · Session: Full verification pass — PLAN.md §8 checklist, all four lib files, all data files, TypeScript check, and component audit. Two High-severity EXP display bugs found (QA-002, QA-003); all other checks passed.*
