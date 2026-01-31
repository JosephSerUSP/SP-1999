# Documentation Audit Report

## Executive Summary
This report summarizes the findings of a documentation audit performed on the *Stillnight: Eve of the Stack* repository. The audit compared existing documentation (README, Design Docs, Architecture Docs) against the actual codebase (`src/`).

## 1. Character Name Consistency
**Status:** Resolved
**Details:**
*   Previous reports flagged inconsistencies between "Aya/Kyle/Eve" and "Julia/Miguel/Rebus".
*   **Action:** `Documents/ARCHITECTURAL_DEEP_DIVE.md` (roadmap) and `Documents/Initial Assessment.md` have been updated to use the implemented names: **Julia**, **Miguel**, and **Rebus**.
*   **Verification:** `README.md`, `Documents/Design Document.md`, and `Documents/Architecture Document.md` were verified to be consistent with the code.

## 2. Deprecated API Documentation
**Status:** Resolved
**Details:**
*   Legacy imperative modals (`UIManager.showTargetSelectModal`, `showConfirmModal`) are removed from the codebase.
*   **Verification:** `Documents/Architecture Document.md` correctly notes these as deprecated/removed.

## 3. Architectural Drift: Party Rotation
**Status:** Verified
**Details:**
*   Previous reports flagged a drift regarding `Game_Party.rotate()` vs `cycleActive()`.
*   **Verification:** `Documents/Architecture Document.md` correctly describes `rotate()` as forced rotation (death) and `cycleActive()` as manual swapping. This matches `src/objects.js`.

## 4. Architectural Drift: Content & HP
**Status:** Verified
**Details:**
*   Previous reports flagged that `$dataEnemies.hp` might be unused/overwritten.
*   **Verification:** `Documents/Architecture Document.md` describes `$dataEnemies` generically. `Documents/Initial Assessment.md` (historical) noted the overwrite behavior (`10 + floor*2`).
*   **Code State:** `src/objects.js` confirms `Game_Enemy` uses the passed `hp` argument, which `Game_Map` calculates dynamically. The documentation does not incorrectly claim otherwise.

## 5. Mechanic Implementation Details
**Status:** Noted
**Details:**
*   **PE (Parapsychic Emission):** `Documents/Design Document.md` implies Rebus has "Very High" PE compared to others.
*   **Code:** In `src/objects.js`, `Game_Actor` hardcodes `mpe` (Max PE) to 100 for all characters, though `pe` (starting value) varies (Rebus: 80, others: 20/40).
*   **Action:** A comment has been added to `src/objects.js` to clarify that `mpe` is currently a fixed constant.

## 6. Roadmap Clarification
**Status:** Clarified
**Details:**
*   `Documents/ARCHITECTURAL_DEEP_DIVE.md` describes features not yet implemented.
*   **Action:** A disclaimer was added to the document header.
