# AGENTS.md

## Project Overview

This repository is the source for the `0PNG` personal portfolio website, deployed as a static Astro site at `https://0png.github.io`.

The site presents 0PNG as a secondary school student, AI developer, and runner. It is primarily a high-interaction developer portfolio with a terminal-inspired visual style, project showcase, changelog, contact dashboard, and project devlog pages.

## Tech Stack

- Astro 5 with static output
- TypeScript
- React islands via `@astrojs/react`
- Tailwind CSS v4 through the Vite plugin
- GSAP and ScrollTrigger for animations
- Lenis for smooth scrolling
- Vitest for tests
- GitHub Actions for CI, changelog generation, and GitHub Pages deployment

## Important Files

- `src/pages/index.astro` - homepage composition.
- `src/layouts/BaseLayout.astro` - global layout, metadata, navbar, smooth scroll, terminal palette mount, mobile notice.
- `src/components/Hero.astro` - animated hero and terminal trigger.
- `src/components/TerminalPalette.tsx` - global Ctrl/Cmd+K terminal-style command palette.
- `src/components/About.astro` - about section with HUD-style details.
- `src/components/ProjectsSection.astro` and `src/components/ProjectCard.astro` - homepage project display.
- `src/components/ContactSection.astro` and `src/components/ContactDashboard.tsx` - contact section, contribution activity chart, HKT clock, Discord copy action.
- `src/data/siteConfig.ts` - site identity, headline, bio, GitHub URL, year.
- `src/data/projects.ts` - project cards and homepage/project listing metadata.
- `src/content/projects/*.md` - project devlog content rendered at `/projects/[slug]`.
- `src/data/changelog.json` - generated changelog data used by changelog pages/sections.
- `scripts/generate-changelog.js` - generates changelog JSON from git history.
- `scripts/fetch-github-stats.js` - bakes GitHub contribution activity into `src/data/github-stats.json`.
- `.github/workflows/ci.yml` - lint, test, and build checks.
- `.github/workflows/deploy.yml` - GitHub Pages deployment.
- `.github/workflows/generate-changelog.yml` - updates changelog JSON on pushes to `main`.

## Common Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run bake:stats
```

## Content Model

There are two project data sources:

- `src/data/projects.ts` drives project cards and project ordering.
- `src/content/projects/*.md` drives the individual project devlog pages.

When adding or renaming a project, keep `devlogSlug` in `src/data/projects.ts` aligned with the corresponding markdown filename under `src/content/projects/`.

Project markdown schema is defined in `src/content/config.ts` and requires:

- `title`
- `date`
- `tags`
- `repoUrl`
- optional `demoUrl`
- `status`
- `excerpt`

## Environment

The site can build without secrets.

`GITHUB_TOKEN` is optional and is used by `npm run bake:stats` to fetch real public GitHub contribution data for the contact activity chart. Without it, the project has a generated fallback contribution dataset.

## Style And Implementation Notes

- Preserve the terminal/HUD-inspired visual language: monospace labels, dark neutral surfaces, subtle borders, glass/backdrop effects, and restrained green/blue terminal accents.
- Prefer Astro components for static sections and React islands only where client interactivity is needed.
- Keep global interactive behavior in well-scoped components such as `TerminalPalette.tsx` and `src/lib/scroll.ts`.
- The homepage is animation-heavy; verify changes visually on desktop and mobile when touching layout, GSAP animation, scroll behavior, or responsive sections.
- Do not hand-edit `src/data/changelog.json` for normal changelog updates; it is generated from git history.
- Avoid unrelated rewrites of generated or automation-managed files unless the task specifically calls for them.

## Deployment Notes

The production site is static and published through GitHub Pages from `main`.

CI expects:

```bash
npm run lint
npm run test
npm run build
```

Run these before claiming broad changes are complete, especially for layout, data schema, or route changes.
