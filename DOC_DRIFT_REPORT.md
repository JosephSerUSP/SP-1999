# Documentation Drift Audit Report

## Executive Summary
This report details discrepancies identified between the project documentation and the actual codebase. Updates have been applied to align the documentation with the current implementation.

## Inconsistencies & Updates

### 1. CutsceneManager Input Handling
*   **Drift:** Documentation claimed `CutsceneManager` used an `update()` loop for input checking.
*   **Reality:** The implementation uses `setInterval` polling within the `processCommand` method to check for input during blocking states.
*   **Action:** Updated `Documents/Architecture Document.md` and inline comments in `src/managers.js` to reflect the polling mechanism.

### 2. Game_Actor PE & MPE
*   **Drift:** `mpe` (Max PE) was implied to be data-driven or derived.
*   **Reality:** `mpe` is hardcoded to `100` in the `Game_Actor` constructor, independent of class data. Initial `pe` is loaded from data.
*   **Action:** Updated `Documents/Architecture Document.md` and `src/objects.js` to explicitly note the hardcoded limit.

### 3. Game_Party Rotation
*   **Drift:** `rotate()` was described as a general rotation method.
*   **Reality:** `rotate()` is specifically used for forced rotation upon death. `cycleActive()` is used for manual rotation, and `checkExhaustionSwap()` handles exhaustion.
*   **Action:** Clarified method roles in `Documents/Architecture Document.md`.

### 4. Game_Enemy AI Configuration
*   **Drift:** Documentation mentioned `aiConfig` but omitted internal state tracking.
*   **Reality:** Enemies use `customState` for AI flags (e.g., 'meleeMode') and `cooldowns`.
*   **Action:** Added `customState` and `cooldowns` to the `Game_Enemy` section in `Documents/Architecture Document.md`.

### 5. BattleManager Targeting
*   **Drift:** Documentation implied `executeSkill` requires a specific target.
*   **Reality:** `executeSkill` handles internal targeting resolution (Shape/AoE) if the target argument is null.
*   **Action:** Updated `Documents/Architecture Document.md`.

### 6. Design Document Status
*   **Drift:** Features like Scan, Barrier, and Heal were marked as "(Planned)".
*   **Reality:** These skills are implemented in `$dataSkills` and `BattleManager`.
*   **Action:** Removed "(Planned)" status in `Documents/Design Document.md`. Updated Future Scope to focus on advanced systems.

## Deprecations Flagged
*   **CutsceneManager.update()**: Does not exist. Use `processCommand` flow.
*   **Game_Actor.regenPE**: Does not exist. PE is finite resource.
