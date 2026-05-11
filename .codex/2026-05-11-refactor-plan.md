# 0PNG Website Refactor Plan

**Goal:** Reduce maintenance risk in the largest UI files without changing the site's visual direction or route structure.

**Current judgment:** The repo structure is mostly fine. The main problem is not folder layout, but a few oversized files mixing page markup, style, client-side behavior, and data helpers in one place.

## Refactor Targets

### Priority 1: `src/components/TerminalPalette.tsx`

**Current issue**
- Nearly 1000 lines.
- Mixes virtual filesystem data, command registry, parser/executor logic, keyboard handling, GSAP transitions, and JSX rendering in one file.

**Why it should be refactored**
- Highest cognitive load in the repo.
- Hardest file to safely extend with new commands or behaviors.
- Current tests are mostly string-content checks, so internal cleanup has room as long as behavior stays stable.

**Proposed split**
- `src/components/terminal/TerminalPalette.tsx`
  - Modal shell, React state, keyboard events, render tree.
- `src/components/terminal/TerminalOutput.tsx`
  - Output line rendering.
- `src/lib/terminal/types.ts`
  - `Line`, `LineKind`, command result/context types.
- `src/lib/terminal/content.ts`
  - Help sections, command keys, project-derived path content.
- `src/lib/terminal/pathing.ts`
  - `normalizePath`, `formatCwd`, `navHrefForPath`, directory helpers.
- `src/lib/terminal/commands.ts`
  - `resolveCommand`, command map, file listing/read helpers.

**Verification**
- `npm run test -- tests/integration/terminal-palette.test.ts`
- Full `npm run test`
- Quick manual smoke: open palette, `help`, `cd /projects`, `cat /about/about_me.txt`, `xdg-open .`

## Priority 2: `src/pages/projects/index.astro`

**Current issue**
- Over 1000 lines.
- Combines data shaping, page markup, a large local style block, and all page interaction logic.
- The page has custom reveal, filter, and pseudo-3D depth behavior, so future edits are harder than they need to be.

**Why it should be refactored**
- This is the largest page-level maintenance hotspot.
- It already has a clear conceptual split between hero, filters, cards, and page behavior.

**Proposed split**
- `src/pages/projects/index.astro`
  - Route entry, data prep, composition only.
- `src/components/projects/ProjectsHero.astro`
  - Back link, title, description, stats, filters.
- `src/components/projects/ProjectStackCard.astro`
  - Single project card + callout.
- `src/components/projects/ProjectsAtmosphere.astro`
  - Decorative fixed layers.
- `src/lib/projects-page.ts`
  - Shared constants or small helpers if needed.
- `src/scripts/projects-page.ts`
  - Reveal observer, filter behavior, depth transform logic.

**Verification**
- `npm run test -- tests/integration/projects-page.test.ts`
- `npm run build`
- Optional manual smoke on `/projects`: filter chips, visible count, mobile layout, reduced-motion fallback

## Priority 3: `src/layouts/BlogLayout.astro`

**Current issue**
- Layout file is acting as layout, component bundle, and browser behavior module.
- TOC, reading progress, copy-link, and adjacent navigation are tightly packed.

**Why it should be refactored**
- The route file `src/pages/projects/[slug].astro` is already clean.
- This is a good candidate for extracting reusable devlog primitives without changing behavior.

**Proposed split**
- `src/layouts/BlogLayout.astro`
  - Main page shell and composition only.
- `src/components/devlog/DevlogMetaPanel.astro`
  - Status, tags, links, read time.
- `src/components/devlog/DevlogToc.astro`
  - Mobile and desktop TOC rendering.
- `src/components/devlog/DevlogAdjacentNav.astro`
  - Prev/next cards.
- `src/scripts/devlog-layout.ts`
  - Reading progress, active heading state, copy-link behavior.

**Verification**
- `npm run test -- tests/integration/project-devlog-layout.test.ts`
- `npm run build`

## Priority 4: `src/pages/changelog.astro`

**Current issue**
- Large page with both data classification helpers and fairly rich client interaction.
- Search/filter/expand/scroll/GSAP logic all live inline with the page.

**Why it should be refactored**
- Not as urgent as the first three, but it will become painful once more controls or visual states are added.

**Proposed split**
- `src/pages/changelog.astro`
  - Route entry, data prep, composition.
- `src/components/changelog/ChangelogHero.astro`
  - Header and metrics.
- `src/components/changelog/ChangelogControls.astro`
  - Search/filter/expand controls.
- `src/components/changelog/CommitEntry.astro`
  - Single row rendering.
- `src/lib/changelog.ts`
  - `formatDate`, `cleanBody`, `getType`, `stripPrefix`.
- `src/scripts/changelog-page.ts`
  - Search/filter/expand logic, hover effects, ScrollTrigger setup.

**Verification**
- `npm run test -- tests/integration/changelog-page.test.ts`
- `npm run build`

## Suggested Execution Order

### Phase 1: Low-risk internal extraction
- Refactor `TerminalPalette.tsx` first.
- Keep public behavior and command text unchanged.
- Update tests only if imports or structure require it; avoid changing user-visible commands.

### Phase 2: Route-level cleanup
- Refactor `/projects` page next.
- Move browser logic into a dedicated script module.
- Keep selectors and data attributes stable where possible to preserve tests and styling.

### Phase 3: Shared devlog cleanup
- Split `BlogLayout.astro`.
- Keep `src/pages/projects/[slug].astro` thin.

### Phase 4: Changelog cleanup
- Extract helpers and client script last.
- Do not change filtering semantics during the structural pass.

## Risk Assessment

### Overall risk
- **Moderate if done in one big pass**
- **Low to moderate if done phase-by-phase**

### Main failure modes
- Client scripts stop binding after selector or attribute drift.
- Astro component extraction accidentally changes layout or slot structure.
- Inline styles/scripts moved out of page files may load in a different order.
- Existing integration tests may miss real interaction regressions because many tests assert source content, not runtime behavior.

### What would make the website "unusable"
- Terminal palette no longer opens or routes correctly.
- `/projects` depth/filter script breaks and hides cards incorrectly.
- Devlog TOC/copy-link logic stops working.
- Changelog filters stop rendering visible entries.

### Why risk is still manageable
- The critical surfaces already have integration tests.
- Most proposed work is structural extraction, not behavior redesign.
- The route boundaries are already clear; the cleanup can preserve existing APIs, selectors, and data attributes.

## Return On Investment

### Worth it?
- **Yes, but only if done surgically.**

### High-value outcomes
- Faster future iteration on new pages/features.
- Lower chance of breaking unrelated behavior while editing one surface.
- Easier testing because helpers and scripts become isolated.
- Better readability for future design work on `/projects`, `/changelog`, and project devlogs.

### When it is not worth it
- If the near-term goal is only shipping new content/pages quickly.
- If the refactor turns into a visual rewrite instead of a structural pass.
- If multiple large files are rewritten at once without intermediate verification.

## Recommendation

If only one refactor is approved now, do this:

1. Extract `TerminalPalette.tsx` into `src/components/terminal/*` + `src/lib/terminal/*`
2. Verify tests and behavior
3. Stop and reassess before touching `/projects`

That gives the best balance of low blast radius and long-term payoff.
