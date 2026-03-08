---
title: "0PNG Portfolio"
date: 2026-03-07
tags: ["Astro", "GSAP", "TypeScript", "Tailwind"]
repoUrl: "https://github.com/0png/0png-portfolio"
demoUrl: "https://0png.github.io"
status: active
excerpt: "The site you're looking at right now."
---

## Overview

Personal portfolio website built with Astro, GSAP, and Tailwind CSS v4. Features a sticky horizontal-scroll projects section with parallax depth effects, smooth Lenis scroll, an infinite CSS marquee for the tech stack, and an immersive full-viewport footer.

## Stack

- **Framework**: Astro 5 (static output)
- **Animations**: GSAP 3 + ScrollTrigger, Lenis 2
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Language**: TypeScript (strict mode)
- **Deployment**: GitHub Pages via GitHub Actions

## Features

- Horizontal scroll projects section with GSAP pin + scrub
- Per-card parallax depth effect using `containerAnimation`
- Infinite CSS marquee with `prefers-reduced-motion` support
- Monochromatic design system with CSS custom properties
- Fully static — no server, no runtime API calls

## What I Learned

Building the horizontal scroll section taught me a lot about how GSAP ScrollTrigger's `containerAnimation` reference works — using a parent tween as the scrub timeline for child animations means the parallax stays perfectly in sync with the horizontal position rather than the page scroll position.

The Lenis + GSAP ticker handoff (`gsap.ticker.add`) is subtle but critical: Lenis owns the RAF loop, and GSAP consumes it. Getting `lagSmoothing(0)` right prevents jitter on heavy paint frames.
