---
title: "Lumix"
date: 2026-03-01
tags: ["Electron", "React", "TypeScript"]
repoUrl: "https://github.com/0png/lumix"
status: active
excerpt: "Minecraft server launcher and manager."
---

## Overview
Lumix is a Windows-first Minecraft server launcher and manager built as an Electron desktop app. It covers the core server workflow end to end: creating servers, importing existing folders, starting and stopping instances, editing `server.properties`, monitoring live console output, managing backups, and checking connectivity. The current product focus is practical local server operations rather than generic cross-platform positioning.

---

## Stack
* **Desktop Framework:** Electron + Vite
* **Frontend:** React + TypeScript
* **UI Components:** Tailwind CSS + shadcn/ui
* **Architecture:** Electron main/preload/renderer with IPC contracts
* **Build System:** pnpm workspace monorepo

---

## Features

### Server Management
* **Multi-Core Support:** Supports Vanilla, PaperMC, Fabric, and Forge server setups.
* **Lifecycle Control:** Create, import, start, stop, and delete managed server instances.
* **Properties Editor:** Built-in GUI editing for `server.properties`.
* **Folder Access:** Open the managed server directory directly from the app.

### Operations & Safety
* **Java Detection:** Detects installed Java runtimes and helps match them to Minecraft version requirements.
* **Backups and Restore:** Supports manual and scheduled backups, restore preflight checks, and pre-restore safety backups.
* **Connection Diagnostics:** Shows localhost, LAN, and WAN guidance so users can distinguish local and network access scenarios.

### User Experience
* **Real-time Console:** Streams server logs live and supports command input from the desktop UI.
* **First-Run Guidance:** Newly created servers can surface onboarding and quick actions for the next operational steps.
* **Customization:** Supports light/dark themes and bilingual UI (English / Traditional Chinese).

---

## Requirements
* **OS:** Windows 10 or later
* **Runtime:** Java 8 / 17 / 21 / 25 depending on the selected Minecraft version
* **Memory:** 4GB RAM minimum

---

## Usage
1. **Create or Import:** Add a new server or import an existing server folder into Lumix management.
2. **Configure:** Select the core and Minecraft version, review Java compatibility, and adjust memory or settings as needed.
3. **Operate:** Start or stop the server, monitor the console, edit properties, and open the server folder when needed.
4. **Maintain:** Use backups, restore checks, update detection, and connection diagnostics as part of ongoing server management.
