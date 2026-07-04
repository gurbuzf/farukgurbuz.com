# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is the source for farukgurbuz.com. It was modernized from a Vite + React + Tailwind site to **Next.js (App Router, TypeScript, Tailwind CSS, `src/` layout)**.

- **`src/app/`** — App Router pages/layouts (`layout.tsx`, `page.tsx`, `globals.css`).
- **`public/`** — static assets.
- **`_old_archive/`** — the entire pre-migration repository (old Vite site, its `README.md`, `.gitignore`, `package.json`, `src/`, `public/`, etc.), preserved as-is for reference/content migration. Not part of the active app; don't import from it.

Important: this project was scaffolded with a recent/pre-release Next.js version (currently 16.x on Turbopack) that has breaking changes vs. older Next.js conventions in training data. Per `AGENTS.md` at the repo root: **check `node_modules/next/dist/docs/` for the current API/conventions before writing Next.js code**, and heed any deprecation notices.

## Commands

```
npm run dev      # start dev server (Turbopack)
npm run build    # production build — must pass with no errors before committing
npm run start    # run the production build
npm run lint     # eslint
```

There is no test suite configured yet.

## Notes

- Content/copy/assets for the actual site still lives in `_old_archive/src` and `_old_archive/public` from the old Vite version — migrate it into `src/app` incrementally rather than assuming the new app already has it.
- The repo's remote is `gurbuzf/farukgurbuz.com` on GitHub, `main` branch (a `gh-pages` branch also exists from the old deploy setup — check whether it's still needed once the new hosting/deploy approach is decided).

## Content status

- **CV — Skills (`src/content/cv.ts`, `src/components/cv/skills-rail.tsx`)**: skill entries are name-only (`{ label }`). There is no proficiency-level indicator (no bars, no Expert/Proficient legend) — don't reintroduce a `level` field or the legend row without an explicit request.
- **Travels (`src/content/trips.ts`)**: only one entry (`istanbul`) exists right now as a placeholder. The other five trips (Iowa City, Houston, Erzurum, Bonn → The Hague, Bozkurt) were intentionally removed until real trip content/photos are ready — see `CONTENT-GUIDE.md` (git-ignored, local-only) for how to add trips back.
