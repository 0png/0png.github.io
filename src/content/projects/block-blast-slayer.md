---
title: "BlockBlast Slayer"
date: 2025-11-27
tags: ["HTML", "JavaScript", "CSS", "PWA"]
repoUrl: "https://github.com/0png/blockblast"
demoUrl: "https://0png.github.io/blockblast/"
status: archived
excerpt: "A JavaScript-based solver for Block Blast–style puzzles."
---

## Overview
A JavaScript-based solver for Block Blast–style puzzles.

The solver analyses the current **8×8 board** and the **three available pieces**, then performs a **depth-first search (DFS)** to determine the best placement order that maximises score and board space.

---

## Stack
**Frontend:** HTML, CSS  
**Solver:** JavaScript

---

## How It Works

### 1. Piece Parsing
Each piece is converted from a grid format into relative coordinates.  
This normalises the shape and allows it to be placed at any valid position on the board.

### 2. Move Generation
For each piece, the solver scans the entire board to determine all valid placements.

A placement is valid if:
- The piece stays within the board boundaries
- None of its cells overlap existing blocks

### 3. Recursive Search
The solver explores all possible placement orders of the available pieces using **depth-first search (DFS)**.

For each move:
- The piece is placed on a cloned board
- Completed rows and columns are cleared
- The resulting board is passed recursively to evaluate the next piece

### 4. Scoring
Moves are evaluated based on:

- **Lines cleared** (high reward)
- **Remaining empty space** (encourages open boards)

The solver selects the sequence of moves with the highest total score.

### 5. Final Output
The algorithm returns:

- The optimal placement sequence
- The predicted score of the resulting board state

---

## Example Decision Factors
The solver prefers moves that:

- Clear multiple lines
- Maintain board openness
- Avoid creating isolated blocked regions

---

## Limitations
The solver performs a full search of possible placements for the given pieces.

While this works efficiently for an **8×8 board with three pieces**, the approach scales poorly with larger boards or more pieces due to **exponential growth in possible states**.

---

## Future Improvements
Potential improvements include:

- Alpha-beta style pruning
- Beam search
- Monte Carlo Tree Search (MCTS)
- Improved heuristic evaluation

---

## Why Archived
The project has achieved its intended functionality and is considered complete.  
Further development is not planned.