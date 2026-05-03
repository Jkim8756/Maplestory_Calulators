# Frontend Agent

## Current Session Summary

The active product focus is the Boss Crystals tab for the MapleStory GMS Heroic/Reboot calculator app. The app is a local Vite + React + TypeScript UI running at `http://127.0.0.1:5173/`.

Recent UI work concentrated on making the boss crystal calculator closer to the in-game and Maplescouter-style workflow:

- Lightened the visual theme toward white while keeping MapleStory-style dense tables.
- Moved Account Summary to the left and made it the primary control surface.
- Added character edit mode, character removal, rename, and reorder controls.
- Added Reset All behavior for checked bosses and account selections.
- Grouped bosses by Daily, Weekly, and Monthly with collapsible table sections.
- Replaced global party size with per-boss party size.
- Added per-row drag ordering, pinned bosses, persisted ordering, and row drag highlighting.
- Changed sorting to column-triggered sorting with compact arrow indicators.
- Added one row per boss family with horizontal difficulty buttons.
- Changed difficulty buttons to show difficulty normally and crystal value on hover without resizing.
- Added boss thumbnails, tier stars, and a portal-based hover popup for drops so the popup can escape table clipping.
- Changed Monthly bosses so they are displayed for reference but do not add to weekly meso, weekly crystal count, or account totals.
- Added progress display for the 180 account crystal cap using a green progress bar.

## General Skills

- Read `sessions/session-001.md`, `QA_REPORT.md`, and this file at the start of each session.
- Ask the user before making visual or interaction choices that are ambiguous.
- Keep UI changes consistent with a dense utility app. Avoid marketing-page layouts.
- Format large numbers with readable separators by default. When multiple number formats exist, make the format switch affect text only, not layout size.
- Prevent text and numbers from being cut off. Reduce font size, truncate with a tooltip, or adjust spacing before allowing overflow.
- Preserve stable row heights and fixed control sizing. Similar controls should use unified dimensions, especially repeated boxes in tables.
- Keep hover states, selected states, drag states, and edit states visually distinct without shifting alignment.
- Use centered table alignment when requested, but keep numeric values easy to scan and consistently aligned.
- For popovers, render outside clipping containers with `createPortal` or an equivalent pattern.
- Run `npm.cmd run build` after meaningful UI changes. Run `npm.cmd run test:run` when UI changes affect calculations, selected state, or totals.

## Project-Specific Skills

- Keep the Account Summary visible and efficient; it is the main workflow for the Boss Crystals tab.
- Maintain the current lighter white theme unless the user requests a new color direction.
- Keep the MapleStory boss table dense, scannable, and close to the Maplescouter/in-game reference style.
- Difficulty boxes should show the difficulty label normally and the crystal value on hover without resizing.
- Daily, Weekly, and Monthly boss sections should remain collapsible.
- Monthly bosses should be displayed for reference only and should not add to weekly meso, weekly crystal count, or account totals.
- Use meso icons for split and account summary meso totals.
- Use crystal icons from the local wiki assets for crystal values.
- Do not invent boss data, tiers, drops, prices, or assets. If data is uncertain, coordinate with Data Engineer and show blanks or safe placeholders.

## Do Not

- Do not judge, correct, or research the quality of MapleStory data. Data quality belongs to Data Engineer.
- Do not work on MCP setup, SaaS connections, `.env` files, API credentials, deployment, or external service problems. Those belong to DevOps.
- Do not block prototype UI work because verified data is missing. Pull from local data first and use clearly labeled placeholders when needed.
- Do not invent final data to make the UI look complete. If data is missing or wrong, notify QA/QC and use safe placeholders.
- Do not change formulas or calculator business logic in `src/lib/**` unless explicitly assigned with Backend coordination.
- Do not move runtime source files into `.agents/`; keep app files in `src/` so imports and build tooling stay intact.
- Do not create layouts where numbers or labels are cut off, overflow their boxes, or shift alignment when selected or hovered.

## Owned Files

These files are owned by the Frontend agent. They stay in their runtime locations so the app import graph does not break.

- `src/App.tsx`
- `src/main.tsx`
- `src/index.css`
- `src/components/BossCrystals.tsx`
- `src/components/ExpCalculator.tsx`
- `src/components/GameDataModal.tsx`
- `src/components/LiberationCalculator.tsx`
- `src/components/Shell.tsx`
- `src/components/SymbolsCalculator.tsx`
- `src/components/ui.tsx`
- `src/components/boss/.gitkeep`
- `src/components/exp/.gitkeep`
- `src/components/layout/.gitkeep`
- `src/components/liberation/.gitkeep`
- `src/components/symbols/.gitkeep`
- `src/components/ui/.gitkeep`

## Coordination Notes

- Coordinate with Data Engineer before changing `src/data/**`, `src/types/**`, or wiki asset paths.
- Coordinate with Backend before changing formulas in `src/lib/**`.
- Coordinate with QA/QC after table layout, drag/drop, account summary, or popover changes.
