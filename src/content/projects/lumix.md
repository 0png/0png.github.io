---
title: "Lumix"
date: 2026-03-01
tags: ["Python", "Tauri", "Rust"]
repoUrl: "https://github.com/0png/lumix"
status: active
excerpt: "Your screen, ambient."
---

## Overview

A minimal ambient lighting app that samples colours along the edges of your screen in real time and syncs them to Philips Hue or WLED smart bulbs, extending the on-screen image into the room around you.

## Stack

- **UI shell**: Tauri (Rust backend, minimal webview frontend)
- **Screen capture**: Python + `mss` for cross-platform screen sampling
- **Light control**: Philips Hue API, WLED HTTP API
- **IPC**: Tauri commands bridge Python subprocess to the frontend

## How It Works

1. A Python process captures a strip of pixels along each screen edge at ~60fps
2. Each strip is averaged into a single representative colour per edge
3. Colours are mapped to bulb zones and sent over the local network via HTTP
4. Tauri frontend provides a system tray icon and settings panel
