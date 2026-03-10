---
title: "Lumix"
date: 2026-03-01
tags: ["Python", "Tauri", "Rust"]
repoUrl: "https://github.com/0png/lumix"
status: active
excerpt: "Your screen, ambient."
---

## Overview
Lumix is a lightweight, all-in-one Minecraft server manager built with Electron and React. It provides a seamless GUI for managing multiple server instances, supporting various cores like Vanilla, Paper, Fabric, and Forge. Designed for efficiency, it handles Java detection, memory allocation, and real-time console monitoring, making server administration effortless for both beginners and power users.

---

## Stack
* **Desktop Framework:** Electron + Vite
* **Frontend:** React + TypeScript
* **UI Components:** Tailwind CSS + shadcn/ui
* **Build System:** pnpm workspace monorepo

---

## Features

### Server Management
* **Multi-Core Support:** Native support for Vanilla, Paper, Fabric, and Forge.
* **Instance Control:** Easily create, start, stop, and delete server instances.
* **Properties Editor:** Built-in GUI editor to modify `server.properties` without touching raw text files.

### Monitoring & Interaction
* **Real-time Console:** Monitor server logs in real-time and send commands directly through the integrated console panel.
* **Auto Java Detection:** Automatically identifies and configures installed Java versions.

### User Experience
* **Customization:** Full support for Light/Dark themes (system-synced or manual) and multi-language support (English / Traditional Chinese(zhTW)).
* **Flexible Configuration:** Adjustable default memory settings and custom Java path configuration.

---

## Requirements
* **OS:** Windows 10 or later
* **Runtime:** Java 8+ (auto-detected)
* **Memory:** 4GB RAM minimum

---

## Usage
1. **Create Server:** Click the "+" button, enter a name, select the core/version, and set memory allocation.
2. **Control:** Select a server from your list and use the Start/Stop controls.
3. **Manage:** Use the console panel to view logs or send commands to the server.
