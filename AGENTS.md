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
- UI: use the components in `src/components/ui/` (shadcn/ui, preset `base-nova`, built on Base UI — no `asChild`, use the `render` prop). Add missing ones with `npx shadcn@latest add <name>`. Icons: `lucide-react`. Animation: `motion/react`, sparingly. Toasts: `sonner`. Map: `react-map-gl/maplibre`. Style with theme tokens (`bg-background`, `text-muted-foreground`), never hex colours. Do not add another UI kit.
- Files marked PLACEHOLDER start with a comment that says what to build and with which libraries; follow it, and delete the PLACEHOLDER word when the file is real. Functions that call `todo()` are not built yet.
- Pages (`src/app/**/page.tsx`) are containers that load data and hold state; components in `src/components/` only receive props; only `src/lib/` talks to Firebase or the model.
- shadcn component reference: https://ui.shadcn.com/docs/components
- Keep the contracts in `PLAN.md` stable; if one must change, say so before changing it.
- Never commit service-account keys or read them into the conversation.
