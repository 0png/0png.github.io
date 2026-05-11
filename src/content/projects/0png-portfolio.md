---
title: "0PNG Portfolio"
date: 2026-03-07
tags: ["Astro", "GSAP", "TypeScript", "Tailwind"]
repoUrl: "https://github.com/0png/0png.github.io"
demoUrl: "https://0png.github.io"
status: active
excerpt: "The site you're looking at right now."
---

## Overview

Personal portfolio website built with Astro 5, GSAP 3, and Tailwind CSS v4. The current shipped version is less of a static showcase and more of a navigable system surface: terminal-first navigation, a dedicated `/projects` command-space, dossier-style project devlogs, and a changelog layer that exposes real git history instead of placeholder content.

---

## Stack

- **Framework**: Astro 5 (static output, content collections)
- **Animations**: GSAP 3 + ScrollTrigger, Lenis 2 (smooth scroll)
- **Styling**: Tailwind CSS v4, `@tailwindcss/typography`
- **UI**: Astro-first sections with focused React islands where interactivity is actually needed
- **Language**: TypeScript 5 (strict mode)
- **Deployment**: GitHub Pages via GitHub Actions, with changelog data generated from git history during build

---

## Pages

- **Home** — hero, about HUD, horizontal projects preview, terminal-style changelog preview, contact dashboard, footer
- **Projects** — standalone `/projects` route built as a stacked command-gallery with filters, depth motion, and devlog entry points
- **Projects / [slug]** — markdown-backed project devlogs rendered inside a dossier layout rather than a plain blog shell
- **Changelog** — standalone `/changelog` terminal HUD backed by generated git history

---

## Features

### Terminal Command Palette
Global `Ctrl+K` palette built as a React island and modeled like a small virtual filesystem. It supports real route-oriented commands such as `pwd`, `ls`, `cd`, `tree`, `cat`, `find`, `grep`, `xdg-open`, `history`, `date`, `uname -a`, `echo`, plus identity shortcuts like `whoami`, `cat about_me.txt`, `stack`, and the joke `sudo rm -rf /` sudoers denial. The shell understands virtual locations like `/about`, `/projects`, `/projects/<slug>`, `/changelog`, and `/contact`, can open matching site routes, and exposes project-specific `README.md` / `metadata.json` views. It also ships tab autocomplete, ghost-text suggestions, command history, and GSAP-driven open/close motion.

### Standalone `/projects`
The project index is no longer a plain card grid. It is a dedicated command-space with its own hero panel, live tag filters, depth lines, sticky stack cards, reversed alternating layouts, and node callouts that expand around each project. Each entry behaves like a featured dossier preview: metadata, generated visual treatment, excerpt, tags, and a direct link into the matching project devlog.

### `/projects/[slug]` Dossier Layout
Each project devlog is rendered from the content collection but framed as a dossier rather than a default article page. The layout adds a reading progress bar, mission-brief hero, metadata cards, read-time chip, copy-link action, mobile and desktop section index, and prev/next navigation derived from `src/data/projects.ts`. That makes the markdown content feel like part of the product surface instead of detached documentation.

### Changelog Surfaces
There are now two distinct changelog experiences. The homepage keeps a bounded preview: a terminal-style feed showing the latest public commits with type chips, hash links, scanline motion, and an `open /changelog` CTA. The standalone `/changelog` route expands that into a full HUD with generated git history, grep-style search, type filters, expand/collapse controls, animated spine progress, hash scrambling, and commit bodies that can be inspected inline.

### Hero Section
Full-viewport entry with a staggered GSAP timeline: status badge → per-word clip reveal on the headline → horizontal rule → terminal trigger button → scroll indicator. Three floating orbs animate on independent keyframe loops (14–20s). A GSAP-powered mouse-tracking spotlight follows the cursor with a 0.75s ease. A dot-grid background is drawn with a repeating radial gradient.

### About Section (HUD Overlay)
Desktop-only heads-up display showing a real-time Hong Kong clock (updates every 1s), hardcoded geo coordinates, and a visitor IP fetched from the ipify API. A macOS-chrome terminal window renders fake shell output with syntax-colored prompts, commands, and responses — complete with a blinking cursor. The avatar card and terminal window have independent GSAP parallax offsets (−8% and −4%) on scroll.

### Smart Sticky Navbar
Hides on downward scroll past 80px and reappears on upward scroll. Glassmorphism styling (`backdrop-blur-md`). GSAP entrance animation fires on page load. Mobile breakpoint collapses to a hamburger with an animated bars → X transform.

### Footer
Full-viewport footer with a 3D perspective grid floor (`rotateX(60deg)`), animated grid drift, a pulsing conic-gradient light beam, and a large orb behind the display text. Display type scales from `3rem` to `14rem` with `clamp`.

### Tech Stack Marquee
Infinite CSS marquee via `translateX(-50%)` keyframe. Respects `prefers-reduced-motion` — falls back to `animation-duration: 0.01ms`.

