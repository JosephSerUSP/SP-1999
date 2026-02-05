# Documentation Audit Report

## Executive Summary
This report summarizes the findings of a documentation audit performed on the *Stillnight: Eve of the Stack* repository. The audit compared existing documentation (README, Design Docs, Architecture Docs) against the actual codebase (`src/`).

## 1. Character Name Inconsistencies
**Status:** Resolved
**Details:**
*   **Documentation:** `README.md` and `Documents/Design Document.md` were verified to correctly refer to the squad members as "Julia", "Miguel", and "Rebus". `Documents/Initial Assessment.md` and `Documents/ARCHITECTURAL_DEEP_DIVE.md` were updated in this pass to match.
*   **Code:** `src/data.js` and `src/objects.js` implement these characters as "Julia" (Agent), "Miguel" (Analyst), and "Rebus" (Entity).

## 2. Deprecated API
**Status:** Resolved
**Details:**
*   The legacy imperative modals (`showTargetSelectModal`, `showConfirmModal`) were verified as removed from `src/windows.js`.
*   `Documents/Architecture Document.md` was verified to already contain a note reflecting this removal.

## 3. Architectural Drift
**Status:** Resolved
**Details:**
*   **Party Rotation:** `Documents/Architecture Document.md` was verified to accurately describe `Game_Party.rotate()` (forced on death) and `cycleActive()` (manual swapping).
*   **Game Modes:** `Documents/ARCHITECTURAL_DEEP_DIVE.md` was updated to include a proposal/roadmap disclaimer.
*   **Content:** `Documents/Architecture Document.md` was updated to clarify that `$dataEnemies.hp` is overridden by a floor-scaled value at spawn.

## 4. File Structure & Language
**Status:** Verified
**Details:**
*   The project structure (`src/`) and language (JavaScript) match the descriptions in `README.md`.
