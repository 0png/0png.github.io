---
title: "Upmods"
date: 2026-02-14
tags: ["Electron", "TypeScript", "Node.js"]
repoUrl: "https://github.com/0png/upmods"
status: active
excerpt: "Keep your mods current, automatically."
---

## Overview

A desktop mod manager and update tracker for PC games. Upmods monitors installed mods across multiple titles and notifies you when upstream updates are available on Nexus Mods or GitHub.

## Stack

- **Shell**: Electron
- **Language**: TypeScript
- **UI**: React + Tailwind CSS
- **APIs**: Nexus Mods API, GitHub Releases API

## Features

- Auto-detects installed mods from common game directories
- Polls for updates on a configurable schedule
- One-click update with automatic backup of the previous version
- Conflict detection between installed mods
