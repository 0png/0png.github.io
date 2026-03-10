---
title: "Upmods"
date: 2026-02-14
tags: ["Electron", "TypeScript", "Node.js"]
repoUrl: "https://github.com/0png/upmods"
status: active
excerpt: "Keep your mods current, automatically."
---

## Overview
upmods is a full-screen terminal application designed to keep your Minecraft mods updated effortlessly. By scanning your local mods directory and leveraging the Modrinth API, it identifies your current mods, checks for compatibility with any target Minecraft version, and safely manages updates with integrity validation.

---

## Stack
* **Language:** TypeScript
* **Runtime:** Node.js (v20+)
* **Build System:** pnpm workspace monorepo
* **UI Framework:** Ink (React for CLI)
* **Logic Engine:** Headless Core (via TypedEmitter)

---

## Features

### Smart Update Engine
* **Automatic Identification:** Batch-scans `.jar` files via SHA-1 hashes against the Modrinth database.
* **Intelligent Resolution:** Identifies the best version for your target Minecraft release.
* **Integrity Validation:** Verifies every download against SHA-512 checksums.
* **Zero Destructive Writes:** Updates are staged to `./mods-updated/`, ensuring your original files are never altered without success.

### TUI & Workflow
* **Full-screen Terminal:** Features virtual-scrolling tables, live progress indicators, and an adaptive layout.
* **Interactive Controls:** Easily toggle individual mods with `Space`, confirm with `Enter`, and switch languages with `L`.
* **Smart Migration:** Automatically migrates compatible mods in-place to save download time.

---

## Architecture
The project follows a strict separation of concerns within a monorepo structure:
* `packages/core/`: Headless business logic, IO operations, and API client.
* `packages/cli/`: Presentation layer using Ink for state orchestration and rendering.

---

## Usage
1. **Scan:** Computes SHA-1 for all mods in the directory.
2. **Identify:** Batch-requests metadata from Modrinth.
3. **Select:** Pick your target Minecraft version from a live list.
4. **Review:** Inspect the update status for each mod in a TUI table.
5. **Download:** Perform updates and integrity checks.
6. **Summary:** Review success and failure counts.
