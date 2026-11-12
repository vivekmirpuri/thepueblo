<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Team rules (3 people, hackathon)

Read before editing: `CONTEXT.md` (what and why), `ARCHITECTURE.md` (how), `PLAN.md` (tasks and track ownership), and the user's `team/<name>.md`.

- Only edit folders owned by the current user's track (ARCHITECTURE → Routes and folders). Shared files (`package.json`, `src/app/layout.tsx`, `globals.css`, `src/lib/*` outside `src/lib/ai`, `src/components/ui`, `src/components/shared`, configs, workflows) need the user's explicit OK.
- Branch from `develop`, PR into `develop`. Never commit to `main` or `develop` directly.
- Static export only: no API routes, server actions, request-time server APIs, or dynamic route segments (`[id]`); use `?id=` query params.
- Keep the contracts in `PLAN.md` stable; if one must change, say so before changing it.
- Never commit service-account keys or read them into the conversation.
