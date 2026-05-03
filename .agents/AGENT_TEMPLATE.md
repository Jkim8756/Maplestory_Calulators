# <Agent Name> Agent

## Current Session Summary

Summarize only the current project state relevant to this agent.

- What this agent is currently responsible for.
- What changed recently in this agent's area.
- Any active blockers, known issues, or handoff notes.

## General Skills

List reusable skills or standards that should apply across projects.

Examples:

- Format large numbers with readable separators by default.
- Prevent text and numbers from being cut off.
- Keep repeated UI controls a unified size.
- Prefer local data first for prototypes.
- Use placeholders only when they are clearly labeled.
- Verify data against source material before treating it as final.

## Project-Specific Skills

List rules that are specific to this project, product, game, domain, color theme, feature, data source, or user request.

Examples:

- Keep the Boss Crystals Account Summary visible because it is the main workflow.
- Use MapleStory Wiki as the preferred boss-data source.
- Treat Monthly bosses as reference-only for weekly totals.
- Use the current lighter white theme unless the user requests a new color direction.

## Do Not

List things this agent must not do. Include ownership boundaries and repeated user corrections.

Examples:

- Do not work outside this agent's ownership unless explicitly assigned.
- Do not invent missing data.
- Do not work on `.env`, MCP setup, API credentials, or SaaS connections unless this agent owns DevOps.
- Do not block prototype work when a safe placeholder is enough.
- Do not hide uncertain data issues. Report them to QA/QC.

## Owned Files

List files or globs owned by this agent. Runtime files should usually stay in their working app locations rather than being moved into `.agents/`.

- `path/to/file`
- `path/to/folder/**`

## Coordination Notes

List which agents must be notified before changing shared boundaries.

- Coordinate with `<Agent>` before changing `<boundary>`.
- Notify QA/QC when `<type of issue>` is found.
