# The Pueblo — hackathon

Next.js (React + TypeScript + Tailwind) → static export → Firebase Hosting.

- **Live** (`main`): https://thepueblo-6f94e.web.app
- **Staging** (`develop`): https://thepueblo-6f94e--develop-1ttzfnbg.web.app
- **Previews:** every pull request gets its own temporary URL, posted as a PR comment.

| Read this | For |
|---|---|
| [CONTEXT.md](CONTEXT.md) | What we are building and why |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, packages, data model, local AI, hosting |
| [PLAN.md](PLAN.md) | Phases, the three tracks, demo script |
| [team/](team/) | Who owns what, and what each person is doing now |

## Setup (once)

```bash
git clone https://github.com/vivekmirpuri/thepueblo.git && cd thepueblo
npm install
npm run dev   # http://localhost:3000
```

Firebase is ready to use from `src/lib/firebase.ts` (`auth`, `db`, `storage`).

## How 3 of us work without colliding

1. **Branch from `develop`, never push to `main` or `develop`.** `git switch develop && git pull && git switch -c <name>/<feature>` → push → open a PR into `develop` → check the preview URL → squash-merge. When staging works, `develop` goes to `main` through a PR (merge commit, not squash). Both branches require a PR and a green build.
2. **Own your folders.** Each track owns the folders listed in its `team/<name>.md` and only edits those.
3. **Shared files = tiny PRs, announce in chat first:** `package.json`, `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/*`, `src/components/ui/`, `src/components/shared/`, `next.config.ts`, `firebase.json`.
4. **Pull often:** `git pull --rebase origin develop` before you start and before you open a PR. Small PRs merge fast and rarely conflict.
5. **Keep your `team/<name>.md` current** — what you're doing, what's done, what you need. Read the other two before starting something new.

## Useful commands

```bash
npm run dev                      # local site
npm run lint && npm run build    # what CI runs
node scripts/rules-check.mjs     # test the deployed security rules
```

Security rules are deployed by hand by the project owner, never by CI: `firebase deploy --only firestore,storage`.

## Rules of the static site

This is a static export (`output: "export"`): no API routes, no server actions, no `cookies()`/`headers()`, no dynamic route segments like `[id]` (use `?id=`). Talk to Firebase from the browser (`"use client"` components). If we ever need server code, use Cloud Functions or switch to Firebase App Hosting.

## Secrets

The deploy uses the GitHub secret `FIREBASE_SERVICE_ACCOUNT`. **Never commit a service-account `.json` key** (they're gitignored). The web config in `src/lib/firebase.ts` is public by design — protect data with Firestore security rules.
