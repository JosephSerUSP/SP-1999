# Documentation Audit Report

## Executive Summary
This report summarizes the findings of a documentation audit performed on the *Stillnight: Eve of the Stack* repository. The audit compared existing documentation (README, Design Docs, Architecture Docs) against the actual codebase (`src/`).

## 1. Character Name Inconsistencies
**Status:** Drift Identified
**Details:**
*   **Documentation:** `README.md`, `Documents/Architecture Document.md`, and `Documents/Design Document.md` frequently refer to the squad members as "Aya" (Detective), "Kyle" (Trooper), and "Eve" (Subject).
*   **Code:** `src/data.js` and `src/objects.js` implement these characters as "Julia" (Agent), "Miguel" (Analyst), and "Rebus" (Entity).
*   **Action:** Documentation will be updated to use the implementation names (Julia, Miguel, Rebus).

## 2. Deprecated API
**Status:** Deprecation Flagged
**Details:**
*   The following methods in `src/windows.js` are marked as `@deprecated` in the code but listed as standard methods in `Documents/Architecture Document.md`:
    *   `UIManager.showTargetSelectModal`
    *   `UIManager.showConfirmModal`
*   **Action:** `Documents/Architecture Document.md` will be updated to mark these as deprecated legacy modals.

## 3. Architectural Drift
**Status:** Inconsistencies Identified
**Details:**
*   **Party Rotation:** `Documents/Architecture Document.md` describes `Game_Party.rotate()` as the primary method for cycling characters. In the current code (`src/objects.js`), `rotate()` is exclusively used for forced rotation upon death, while `cycleActive()` handles manual swapping.
*   **Game Modes:** `Documents/ARCHITECTURAL_DEEP_DIVE.md` outlines a "Multi-Modal State Machine" (Dungeon vs. Hub). This is a proposal/roadmap document; the current `src/main.js` implements a single-mode game loop.
*   **Content:** `Documents/Architecture Document.md` claims `$dataEnemies.hp` is not used at spawn. This is partially correct (it uses a floor-scaled value), but the phrasing could be clearer.

## 4. File Structure & Language
**Status:** Accurate
**Details:**
*   The project structure (`src/`) and language (JavaScript) match the descriptions in `README.md`.
