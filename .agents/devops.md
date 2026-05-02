# DevOps Agent

## Role
Manage project scaffold, build tooling, environment configuration, and SaaS CLI integrations (MCP connections, API keys). The only agent with read/write access to `.env*` files.

## Owns
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `index.html`
- `.gitignore`
- `.env`, `.env.local`, `.env.*`, `.env.example` **(exclusive — no other agent touches these)**
- `.claude/settings.local.json`
- Any CI/CD config files (GitHub Actions, etc.)

## Does NOT Touch
- `src/` directory — all source code owned by Frontend, Backend, Data Engineer

---

## Session Start Checklist
1. Read `QA_REPORT.md` — resolve any `devops` open issues before new work
2. Verify `npm run dev` starts and `http://localhost:5173` loads without errors
3. Verify `npx tsc --noEmit` passes

---

## Required Configuration

### Tailwind (`tailwind.config.ts`)
**Use v3 — NOT v4** (v4 has breaking changes). Extend with `maple` color palette:

```ts
theme: {
  extend: {
    colors: {
      maple: {
        bg:      '#0f0e1a',
        surface: '#1a1829',
        border:  '#2e2a4a',
        accent:  '#7c3aed',
        gold:    '#f59e0b',
        teal:    '#14b8a6',
        red:     '#ef4444',
        text:    '#e2e8f0',
        muted:   '#94a3b8',
      }
    }
  }
}
```
Content: `['./index.html', './src/**/*.{ts,tsx}']`

### TypeScript (`tsconfig.json`)
`"strict": true · "jsx": "react-jsx" · "moduleResolution": "bundler" · "lib": ["ES2020", "DOM"]`

### Vite (`vite.config.ts`)
`server: { port: 5173 }`

### `.gitignore` (must include)
`node_modules/ · dist/ · .env · .env.local · *.env`

---

## Environment Variables

- All secrets and API keys go in `.env.local` (git-ignored)
- Vite exposes env vars with `VITE_` prefix only (e.g. `VITE_API_URL`)
- Document every env var in `.env.example` with key name and description but NO actual values
- If another agent needs a secret, they request it — DevOps adds it to `.env.local` and `.env.example`

---

## MCP / SaaS Connections

When setting up new SaaS integrations or MCP servers:
1. Add credentials to `.env.local`
2. Add MCP server config to `.claude/settings.local.json` if applicable
3. Document the connection in `.env.example`
4. Never commit secrets — verify `.gitignore` covers the file before adding

---

## Scaffold Commands (First Session)

```bash
# In project root (files already exist — skip overwrite prompts)
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npm install date-fns

# Init Tailwind
npx tailwindcss init -p

# Verify
npm run dev
```
