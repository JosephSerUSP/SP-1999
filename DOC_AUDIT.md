# Documentation Audit Report

## Overview
This document summarizes the inconsistencies found between the project documentation and the codebase as of the latest audit.

## Discrepancies & Updates

### 1. Code Architecture & Module Structure
*   **Documentation**: `Documents/Architecture Document.md` listed `SceneManager` under `src/managers.js`.
*   **Codebase**: `SceneManager` is defined in `src/main.js`.
*   **Action**: Updated documentation to reflect accurate location.

### 2. Game Objects (`src/objects.js`)
*   **Game_Actor**:
    *   **Logic**: `mpe` (Max PE) is hardcoded to `100` in the constructor, ignoring any potential data-driven values from `$dataClasses`.
    *   **Action**: Documented this behavior in `Architecture Document.md` and inline comments.
*   **Game_Map**:
    *   **Logic**: `processTurn(dx, dy, action)` allows `dx` and `dy` to be `0` when an external `action` is provided.
    *   **Action**: Clarified this flexibility in inline documentation.

### 3. Managers (`src/managers.js`)
*   **BanterManager**:
    *   **Logic**: `trigger()` is strictly inhibited when `$gameSystem.isInputBlocked` is true.
    *   **Triggers**: The code utilizes the following triggers: `kill`, `walk`, `surrounded`, `loot`, `hurt`, `low_hp`, `level_up`, `start`.
    *   **Action**: Updated documentation to include the full list of triggers and the input blocking condition.

### 4. Sprites & Rendering (`src/sprites.js`)
*   **Renderer3D**:
    *   **Logic**: `playAnimation` for type `move_switch` expects a data object containing `nextColor` to handle visual swapping.
    *   **Action**: Added detail to inline documentation and Architecture document.

### 5. Core Utilities (`src/core.js`)
*   **Geometry**:
    *   **Logic**: `getCone` uses Euclidean distance checks (`Math.sqrt`) rather than Manhattan distance for range verification.
    *   **Action**: Specified this in the Architecture document.

### 6. UI (`src/windows.js` & `src/ui/`)
*   **Deprecation**: Legacy imperative modals `showTargetSelectModal` and `showConfirmModal` have been removed in favor of component-based approaches or inline targeting logic.
*   **Status**: Confirmed removal and ensured documentation reflects the current component-based `UIManager`.

## Recommendations
*   Consider refactoring `Game_Actor` to respect `mpe` from `$dataClasses` if data-driven design is a priority.
*   Maintain `DOC_AUDIT.md` as a living document for future audits.
