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
| QA-001 | Verified | Medium | QA/QC | Tests | Initial automated calculator tests were added. | Focused unit tests cover boss caps, EXP percent/session behavior, symbol remaining/income, and liberation weekly estimates. | `npm.cmd run test:run` passes with 7 tests in `src/lib/calculators.test.ts`. | 2026-05-02 | 2026-05-02 |
| QA-002 | Verified | Medium | Data Engineer | Boss drops | Boss hover popup is implemented, and per-difficulty drop lists are populated from individual MapleStory Wiki boss pages where reward sections exist. | Add verified drop data per boss difficulty or document source gaps explicitly. | `node .\scripts\extract-maplestorywiki-bosses.mjs` extracted drop lists into `src/data/wiki/bosses.snapshot.json`; UI reads `dropsByDifficulty` into `Boss.drops`. | 2026-05-02 | 2026-05-02 |
| QA-003 | Verified | Medium | Data Engineer | Wiki snapshot | Bosses page information and assets should be stored locally without replacing unverified crystal prices. | Local JSON includes source metadata, boss page links, difficulty level requirements, local boss image paths, and item assets. | `node .\scripts\extract-maplestorywiki-bosses.mjs` stored 36 bosses and 4 item assets from MapleStory Wiki revision 531290. | 2026-05-02 | 2026-05-02 |

## Verified This Session

| Check | Result | Evidence |
|-------|--------|----------|
| Production build | Passed | `npm.cmd run build` completed successfully after esbuild spawn approval. |
| Test runner | Passed | `npm.cmd run test:run` completed successfully with 9 passing calculator tests. |
| Root path | Verified | Work performed in `C:\Users\jonat\Desktop\Projects\Maplestory_Calulators-Codex`. |
| Boss tab refresh | Passed | Light theme, summary-left layout, unique boss rows, difficulty buttons, sort controls, number format switch, newer bosses, thumbnails, and per-boss party size implemented. |
| Boss tab controls | Passed | Added reset checked, account edit mode, remove/reorder/rename controls, row pin/order controls, column sorting ASC/DESC, daily/weekly separation, daily clear counts, and crystal icons. |
| Boss tab second pass | Passed | Replaced arrow controls with drag handles, added collapsible reset sections, removed sort dropdown, separated same-name daily/weekly bosses, capped party size for 3-person bosses, and verified screenshot-sourced crystal prices for newer bosses. |
| Boss tab drag/drop and hover pass | Passed | `npm.cmd run build` completed successfully; `npm.cmd run test:run` passed with 10 tests. Added drag highlight states, account reset, tier stars, unified difficulty box grid, crystal icon alignment, 3-person party cap fallback, and hover detail popup. |
| Wiki asset/layout pass | Passed | `npm.cmd run build` completed successfully; `npm.cmd run test:run` passed with 10 tests. Added local MapleStory Wiki boss snapshot/assets, wired local boss images and difficulty-specific level requirements, changed weekly cap to 12, centered table columns, stacked tier stars in groups of 5, replaced ASC/DESC with arrows, and used the local meso icon for split/account meso totals. |
| Boss drops and icon pass | Passed | `npm.cmd run build` completed successfully; `npm.cmd run test:run` passed with 10 tests. Extended wiki snapshot with boss-page drops, used Intense Power Crystal page crystal images, changed difficulty boxes to show difficulty normally and crystal value on hover, removed boss icon initials, removed selected-character padding, and kept GMS weekly character cap at 14 based on the Intense Power Crystal page note. |
| Boss table compact layout pass | Passed | `npm.cmd run build` completed successfully; `npm.cmd run test:run` passed with 10 tests. Reduced table gaps and cell text sizes, gave Split right padding, made unselected rows show no crystal and zero split, added account crystal progress percentage, kept Account Summary sticky, padded summary character rows, and moved Daily clears into the Tier column slot. |
| Monthly/drop popup/tier pass | Passed | `npm.cmd run build` completed successfully; `npm.cmd run test:run` passed with 11 tests. Monthly bosses no longer add weekly meso or account/character crystal counts, monthly split potential is shown as gray parenthetical text, drop popups render in a fixed overlay, drop lists filter out general consumables, and boss tiers were filled from the provided tier reference. |
