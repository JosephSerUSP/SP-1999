# Documentation Audit Report

## Executive Summary
This report summarizes the findings of a documentation audit performed on the *Stillnight: Eve of the Stack* repository. The audit compared existing documentation (README, Design Docs, Architecture Docs) against the actual codebase (`src/`).

## 1. Character Name Inconsistencies
**Status:** Resolved
**Details:**
*   **Documentation:** Previous documentation referred to "Aya", "Kyle", and "Eve".
*   **Code:** `src/data.js` and `src/objects.js` implement "Julia", "Miguel", and "Rebus".
*   **Action:** Documentation has been updated to consistently use Julia, Miguel, and Rebus.

## 2. Deprecated API
**Status:** Resolved
**Details:**
*   Legacy imperative modals (`UIManager.showTargetSelectModal`, `UIManager.showConfirmModal`) have been removed from the codebase.
*   **Action:** `Documents/Architecture Document.md` has been updated to explicitly note the removal of these legacy methods.

## 3. Server Requirement
**Status:** Corrected
**Details:**
*   **Documentation:** `README.md` previously stated that no local server was required.
*   **Code:** The use of Three.js texture loading requires a server to avoid CORS issues.
*   **Action:** `README.md` has been updated to mandate the use of a local server.

## 4. Status Effects & Skills
**Status:** Updated
**Details:**
*   **Documentation:** `Documents/Design Document.md` listed Status Effects and skills like Scan/Barrier/Heal as "Planned" or "Future Scope".
*   **Code:** Basic status effects (Barrier, Stun, Poison) and these skills are implemented in `src/managers.js` and `src/data.js`.
*   **Action:** `Documents/Design Document.md` and `Documents/Initial Assessment.md` have been updated to reflect their implemented status.

## 5. Architectural Clarifications
**Status:** Updated
**Details:**
*   **Party Rotation:** `Documents/Architecture Document.md` clarified that `rotate()` is for forced death swaps, while `cycleActive()` is for manual swaps.
*   **Turn Logic:** `Documents/Architecture Document.md` updated to reflect the asynchronous nature of `Game_Map.processTurn` and its correct awaiting of action callbacks.
