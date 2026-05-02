# MapleStory GMS Reboot Local Calculator App

## Summary
Build a local-first React + Vite web app for GMS Reboot/Heroic planning. Use researched defaults, save data in the browser, and keep MapleStory tables editable locally so patch changes do not require code edits.

## Key Changes
- Create a multi-tool app shell with tabs for `Boss Crystals`, `EXP`, `Symbols`, and `Liberation`.
- Add browser persistence for characters, selected bosses, EXP inputs, symbol state, and liberation setup.
- Store researched game data as editable local JSON-style tables: boss crystal values, EXP-to-next-level, event EXP point values, AFK/VIP Sauna values, symbol costs, and liberation trace values.
- Boss Crystal MVP first: per-character weekly boss checklist, party-size split, `14` weekly crystal cap per character, and account/world `180` crystal cap summary.
- EXP calculator: for each item/event, calculate `flat EXP` and `% toward next level` from current level and current EXP percent. Include Advanced EXP Vouchers, EXP Points, VIP Sauna/AFK tables, and manual-entry event items.
- Symbol estimator: fixed default daily/weekly sources, current level + current symbol EXP, finish date, days remaining, and total remaining symbols.
- Liberation estimator: boss checkboxes, party-size input per boss, weekly trace total, accumulated traces, remaining traces, and weeks left if the same weekly setup repeats.

## Test Plan
- Verify boss crystal totals respect party-size division, per-character `14` weekly cap, and world `180` cap.
- Verify EXP percent equals `flat EXP / EXP required for current level`.
- Verify symbol remaining totals match Arcane/Sacred cumulative cost tables.
- Verify liberation weekly traces divide by party size and weeks left uses `ceil(remaining / weeklyTotal)`.
- Verify browser refresh preserves saved local data.

## Assumptions
- Target server is GMS Reboot/Heroic.
- Data defaults come from MapleStory Wiki pages researched on May 2, 2026.
- VIP Booster uses manual observed EXP input because no fixed public EXP table was found.
- Symbol estimator uses fixed defaults, not editable schedules, per your preference.
