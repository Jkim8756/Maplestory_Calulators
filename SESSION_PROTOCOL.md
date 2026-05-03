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
4. Its own `.agents/<agent-name>/AGENT.md` file.
5. `.agents/README.md`.

Agents then continue from the latest session handoff rather than restarting from older context.

## `/new_agent`

When the user says `/new_agent <name>` or asks to create another agent, Codex must follow `.agents/README.md` and `.agents/AGENT_TEMPLATE.md`.

Each agent must have one folder and one canonical file:

```text
.agents/<agent-name>/AGENT.md
```

Every `AGENT.md` must include:

1. `Current Session Summary`
2. `General Skills`
3. `Project-Specific Skills`
4. `Do Not`
5. `Owned Files`
6. `Coordination Notes`

Do not create separate `OWNED_FILES.md` files. Put owned files directly in `AGENT.md`.

## File Naming

Session handoff files live under:

```text
sessions/session-###.md
```

Examples:

- `sessions/session-001.md`
- `sessions/session-002.md`
- `sessions/session-003.md`
