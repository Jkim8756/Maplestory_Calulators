# Session Protocol

## `/next_session`

When the user says `/next_session`, Codex must:

1. Work in `C:\Users\jonat\Desktop\Projects\Maplestory_Calulators-Codex`.
2. Find the highest numbered file matching `sessions/session-###.md`.
3. Create the next file with the next incremented number.
4. Summarize the completed work in agent order:
   - Frontend
   - Backend
   - Data Engineer
   - DevOps
   - QA/QC
5. Include verification results, known issues, active dev server status, and exact next steps.
6. Tell the user the session handoff file path.
7. Prepare for context reset.

Codex cannot directly execute the UI slash command `/compact` from inside tool calls. After creating the handoff file, Codex should provide a compact-ready summary and the user can run `/compact` in the chat UI if needed.

## Beginning a Session

At the beginning of each new session, every agent must read:

1. The highest numbered `sessions/session-###.md` file.
2. `QA_REPORT.md`.
3. `PLAN.md`.

Agents then continue from the latest session handoff rather than restarting from older context.

## File Naming

Session handoff files live under:

```text
sessions/session-###.md
```

Examples:

- `sessions/session-001.md`
- `sessions/session-002.md`
- `sessions/session-003.md`
