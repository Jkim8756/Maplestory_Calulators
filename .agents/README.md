# Agent Structure Protocol

This folder stores project agent instructions.

## Required Agent File

Each agent gets one folder and one canonical file:

```text
.agents/<agent-name>/AGENT.md
```

Do not create separate ownership files. Owned files must be listed inside `AGENT.md`.

## Required Sections

Every `AGENT.md` must use this section order:

1. `# <Agent Name> Agent`
2. `## Current Session Summary`
3. `## General Skills`
4. `## Project-Specific Skills`
5. `## Do Not`
6. `## Owned Files`
7. `## Coordination Notes`

Use `.agents/AGENT_TEMPLATE.md` when creating a new agent.

## `/new_agent` Convention

When the user says `/new_agent <name>` or asks to create another agent, Codex must:

1. Create `.agents/<normalized-agent-name>/AGENT.md`.
2. Use `.agents/AGENT_TEMPLATE.md` as the structure.
3. Separate reusable skills into `General Skills`.
4. Separate project/domain-specific instructions into `Project-Specific Skills`.
5. Add a `Do Not` section with ownership boundaries and explicit user corrections.
6. List owned files inside `AGENT.md`.
7. Do not create `OWNED_FILES.md`.
8. Do not move runtime source files into `.agents/` unless the user explicitly asks for a codebase refactor and approves import updates.

This is a project-level command convention, not a registered Codex UI slash command.
