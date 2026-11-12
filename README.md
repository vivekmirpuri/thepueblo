# The Pueblo — hackathon

Next.js (React + TypeScript + Tailwind) → static export → Firebase Hosting.

- **Live:** https://thepueblo-6f94e.web.app (auto-deploys on every push to `main`)
- **Previews:** every pull request gets its own temporary URL, posted as a PR comment.

## Setup (once)

```bash
git clone https://github.com/vivekmirpuri/thepueblo.git && cd thepueblo
npm install
npm run dev   # http://localhost:3000
```

Firebase is ready to use from `src/lib/firebase.ts` (`auth`, `db`, `storage`).

## How 3 of us work without colliding

1. **One branch each, never push to `main`.** `git switch -c <name>/<feature>` → push → open a PR → check the preview URL → squash-merge. `main` is protected: a PR and green CI are required.
2. **Own your folders.** Each person writes what they own in their `team/<name>.md` and only edits those folders: `src/app/<area>/`, `src/components/<area>/`.
3. **Shared files = tiny PRs, announce in chat first:** `package.json`, `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/*`, `next.config.ts`, `firebase.json`.
4. **Pull often:** `git pull --rebase origin main` before you start and before you open a PR. Small PRs merge fast and rarely conflict.
5. **Keep your `team/<name>.md` current** — what you're doing, what's done, what you need. Read the other two before starting something new.

## Rules of the static site

This is a static export (`output: "export"`): no API routes, no server actions, no `cookies()`/`headers()`. Talk to Firebase from the browser (`"use client"` components). If we ever need server code, use Cloud Functions or switch to Firebase App Hosting.

## Secrets

The deploy uses the GitHub secret `FIREBASE_SERVICE_ACCOUNT`. **Never commit a service-account `.json` key** (they're gitignored). The web config in `src/lib/firebase.ts` is public by design — protect data with Firestore security rules.
