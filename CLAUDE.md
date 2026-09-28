# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is the source for farukgurbuz.com. It was modernized from a Vite + React + Tailwind site to **Next.js (App Router, TypeScript, Tailwind CSS, `src/` layout)**.

- **`src/app/`** — App Router pages/layouts (`layout.tsx`, `page.tsx`, `globals.css`).
- **`public/`** — static assets.

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

- The pre-migration Vite repository that used to be preserved under `_old_archive/` has been removed — all content has been migrated into `src/`. It's still recoverable from git history if ever needed.
- The repo's remote is `gurbuzf/farukgurbuz.com` on GitHub, `main` branch (a `gh-pages` branch also exists from the old deploy setup — check whether it's still needed once the new hosting/deploy approach is decided).

- **SEO**: build every page's metadata with `pageMetadata()` from `src/lib/seo.ts`. Next.js merges metadata shallowly, so a page that sets its own `openGraph`/`twitter` loses the site name and preview image unless it goes through the helper. Structured data: site-wide Person/WebSite in `src/components/seo/json-ld.tsx`; per-route schema (ProfilePage, LearningResource, ScholarlyArticle list, breadcrumbs) in each route's `page.tsx`/`layout.tsx` via `<StructuredData>`. Google Search Console ownership is already verified outside the codebase (no meta tag needed); other consoles' codes would go in `metadata.verification` in `src/app/layout.tsx`.

## Content status

- **CV — Skills (`src/content/cv.ts`, `src/components/cv/skills-rail.tsx`)**: skill entries are name-only (`{ label }`). There is no proficiency-level indicator (no bars, no Expert/Proficient legend) — don't reintroduce a `level` field or the legend row without an explicit request.
- **Travels (`src/content/trips.ts`)**: only one entry (`istanbul`) exists right now as a placeholder. The other five trips (Iowa City, Houston, Erzurum, Bonn → The Hague, Bozkurt) were intentionally removed until real trip content/photos are ready — see `CONTENT-GUIDE.md` (git-ignored, local-only) for how to add trips back.
- **Hydrology Lab (`src/app/lab/page.tsx`, `src/components/lab/`)**: built as guided teaching lessons, not free-form playgrounds. Each lab is a sequence of chapters (one concept each) rendered through `LessonPanel` (idea → controls → try this → what you see) with a `ChangeNote` that reports cause → effect (before/after numbers) and an optional `math` section; the reservoir lesson's governing equations live in `src/components/lab/equations.tsx` and must match the constants in `dam-routing.ts` / `reservoir-lesson.ts`. Keep this pattern when adding content. Models: `src/lib/watershed-dem.ts` (+ `watershed.ts` D8 utils) and `src/lib/reservoir-lesson.ts` (wraps the level-pool engine in `dam-routing.ts`, fixed-step RK4). Charts use `lab-chart.tsx` (single y-axis only — split two quantities into two charts) and the `--viz-*` / `--map-*` color tokens in `globals.css`. All lab text is bilingual via `useTx()`.
