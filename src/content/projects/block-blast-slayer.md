---
title: "BlockBlastSlayer"
date: 2025-12-05
tags: ["Python", "OpenCV", "AI"]
repoUrl: "https://github.com/0png/block-blast-slayer"
status: archived
excerpt: "AI that plays Block Blast so you don't have to."
---

## Overview

An AI agent that plays Block Blast puzzles autonomously. Uses computer vision to read the current board state from a screen capture and a greedy solver to find the optimal piece placements to maximise score and avoid game-over.

## Stack

- **Language**: Python
- **Vision**: OpenCV (board detection, piece segmentation)
- **Input**: PyAutoGUI (simulates taps/clicks)
- **Solver**: Custom greedy algorithm with lookahead

## How It Works

1. Screen capture is taken every 500ms
2. OpenCV detects the grid bounds and segments each cell's colour
3. The solver receives the board state and available pieces, generates candidate placements, scores them by lines cleared and board density, picks the best move
4. PyAutoGUI executes the drag-and-drop gesture on the detected piece position

## Why Archived

Achieved the intended goal (consistent top-1% scores). The greedy solver hits a ceiling without beam search or MCTS for multi-step lookahead — a proper upgrade would require a full rewrite of the solver.
