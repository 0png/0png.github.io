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

Personal portfolio website built with Astro 5, GSAP 3, and Tailwind CSS v4. The design leans into a developer-first aesthetic — monochromatic palette, CLI-style typography, and a terminal command palette as the primary navigation interface. Every section has its own scroll-driven animation choreography.

---

## Stack

- **Framework**: Astro 5 (static output, content collections)
- **Animations**: GSAP 3 + ScrollTrigger, Lenis 2 (smooth scroll)
- **Styling**: Tailwind CSS v4, `@tailwindcss/typography`
- **UI**: shadcn/ui-inspired components, Radix UI primitives
- **Language**: TypeScript 5 (strict mode)
- **Deployment**: GitHub Pages via GitHub Actions

--

## Pages

- **Home** — hero, about, tech stack marquee, projects preview, changelog preview, footer
- **Projects** — full responsive grid of all projects with cover images and tags
- **Projects / [slug]** — individual project devlogs rendered from markdown content collections
- **Changelog** — full commit history timeline pulled from `changelog.json`

--

## Features

### Terminal Command Palette
Global `Ctrl+K` palette built as a React island. Supports 13 commands including `whoami`, `cat about_me.txt`, `ls`, `cd /projects`, and `sudo rm -rf /` (with a proper sudoers error). Has tab autocomplete with ghost-text preview, arrow-key command history, and color-coded output types (`success`, `info`, `warn`, `err`, `link`). Opens and closes with GSAP opacity + y-offset transitions.

### Hero Section
Full-viewport entry with a staggered GSAP timeline: status badge → per-word clip reveal on the headline → horizontal rule → terminal trigger button → scroll indicator. Three floating orbs animate on independent keyframe loops (14–20s). A GSAP-powered mouse-tracking spotlight follows the cursor with a 0.75s ease. A dot-grid background is drawn with a repeating radial gradient.

### About Section (HUD Overlay)
Desktop-only heads-up display showing a real-time Hong Kong clock (updates every 1s), hardcoded geo coordinates, and a visitor IP fetched from the ipify API. A macOS-chrome terminal window renders fake shell output with syntax-colored prompts, commands, and responses — complete with a blinking cursor. The avatar card and terminal window have independent GSAP parallax offsets (−8% and −4%) on scroll.

### Smart Sticky Navbar
Hides on downward scroll past 80px and reappears on upward scroll. Glassmorphism styling (`backdrop-blur-md`). GSAP entrance animation fires on page load. Mobile breakpoint collapses to a hamburger with an animated bars → X transform.

### Changelog Timeline
Zigzag alternating layout with a central spine and pulsing timeline nodes. Commit entries show type badges (feat/fix/refactor/chore), dates, short descriptions, and hash links to GitHub. The full-page version adds an atmospheric background with fractal noise and radial vignettes.

### Footer
Full-viewport footer with a 3D perspective grid floor (`rotateX(60deg)`), animated grid drift, a pulsing conic-gradient light beam, and a large orb behind the display text. Display type scales from `3rem` to `14rem` with `clamp`.

### Tech Stack Marquee
Infinite CSS marquee via `translateX(-50%)` keyframe. Respects `prefers-reduced-motion` — falls back to `animation-duration: 0.01ms`.

