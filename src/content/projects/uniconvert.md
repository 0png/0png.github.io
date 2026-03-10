---
title: "Uniconvert"
date: 2026-01-10
tags: ["JavaScript", "React", "Electron"]
repoUrl: "https://github.com/0png/uniconverter"
status: active
excerpt: "Seamless conversions, zero friction."
---

## Overview
Uniconvert is a powerful, cross-platform file conversion tool built with Electron and React. Designed for efficiency and ease of use, it bundles FFmpeg to provide a seamless, all-in-one solution for common media and document conversion tasks. With its intuitive interface, Uniconvert handles everything from batch image processing to video transcoding without requiring any external software installations.

---

## Stack
* **Desktop Framework:** Electron
* **Frontend:** React
* **Build System:** pnpm workspace monorepo
* **Conversion Engine:** Bundled FFmpeg
* **Language:** TypeScript
* **Styling:** Tailwind CSS

---

## Features

### Smart Task Queue & Workflow
* **Automatic Grouping:** Automatically categorizes imported files into images, videos, audio, and documents for better organization.
* **Intelligent Recommendations:** Provides smart action suggestions tailored to the specific file type detected.
* **Flexible Batch Processing:** Ability to process multiple different file types in a single session, with options to run them individually or via a "Start All" command.

### Image Processing
* **Format Versatility:** Batch convert files to PNG, JPG, WEBP, ICO, BMP, GIF, and TIFF.
* **Advanced Support:** Native support for HEIC/HEIF input formats.
* **Document Merging:** Seamlessly merge multiple images into a single PDF document.

### Document Conversion
* **PDF Extraction:** Efficiently extract PDF pages and convert them into high-quality PNG or JPG images.

### Video & Audio Transcoding
* **Video Handling:** Batch convert video files between MP4 and MOV formats.
* **Audio Extraction:** One-click extraction of audio tracks from video files into MP3.
* **Audio Processing:** Batch convert audio files across major formats, including MP3, WAV, and M4A.

### User Experience
* **Drag-and-Drop:** Simple, fast input method via drag-and-drop or manual selection.
* **Customizable Settings:** Multi-language support (English, Traditional Chinese(zhTW), System), Light/Dark/System theme options, and flexible output location management with auto-open capabilities after task completion.
* **No Dependencies:** Zero external software required; FFmpeg is bundled natively for a true "plug-and-play" experience.
