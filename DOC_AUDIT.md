# Documentation Audit Report

## Executive Summary
This report summarizes the findings of a documentation audit performed on the *Stillnight: Eve of the Stack* repository. The audit compared existing documentation (`README.md`, `GAME_DESIGN.md`, `Documents/`) against the actual codebase (`src/`).

## 1. Documentation vs. Code Inconsistencies

### 1.1. AI Configuration
*   **Documentation:** Memory/Prior Audits suggested `$dataEnemies` used an `ai` property.
*   **Code:** `src/data.js` and `src/objects.js` (`Game_Enemy`) use `aiConfig` exclusively.
*   **Action:** Verified code uses `aiConfig`. No update needed in `GAME_DESIGN.md` as it correctly refers to `$dataEnemies` behavior trees.

### 1.2. UIManager & Window_Inventory
*   **Documentation:** Older docs implied `UIManager` handled item usage (`useConsumable`, `equipGear`).
*   **Code:** This logic has moved to `Window_Inventory.js` within the `src/ui/` component framework.
*   **Action:** Updated `src/windows.js` and `src/ui/windows/Window_Inventory.js` inline documentation to reflect this ownership change.

### 1.3. BattleManager Targeting
*   **Documentation:** Some references implied `BattleManager.executeSkill` supports array targeting directly.
*   **Code:** `executeSkill` accepts a single `Game_Battler` or `null`. If `null`, it internally resolves targets (single or array) based on skill data, but the method signature strictly expects a single target override.
*   **Action:** Updated JSDoc in `src/managers.js` to clarify the `target` parameter behavior.

### 1.4. Character Names
*   **Documentation:** `Documents/ARCHITECTURAL_DEEP_DIVE.md` referred to "Eve". `Documents/Initial Assessment.md` refers to "Aya", "Kyle", "Eve".
*   **Code:** Characters are consistently "Julia", "Miguel", "Rebus".
*   **Action:** Updated `Documents/ARCHITECTURAL_DEEP_DIVE.md` to use "Rebus". Left "Initial Assessment" as historical record.

### 1.5. Architectural Future vs. Present
*   **Documentation:** `Documents/ARCHITECTURAL_DEEP_DIVE.md` outlines "Game Modes", "Missions", and "Hub" which do not exist in the code.
*   **Code:** `src/main.js` and `src/objects.js` implement a single-loop dungeon crawler.
*   **Action:** Added a disclaimer to `Documents/ARCHITECTURAL_DEEP_DIVE.md` stating it is a design proposal.

## 2. Updates Performed

The following files were updated to resolve drift:

1.  **`Documents/ARCHITECTURAL_DEEP_DIVE.md`**: Added proposal disclaimer; corrected character names.
2.  **`src/windows.js`**: Clarified `UIManager` documentation regarding `showStatusModal` and legacy status.
3.  **`src/objects.js`**: Clarified `Game_Map.processTurn` accepts action callbacks; clarified `Game_System` role.
4.  **`src/managers.js`**: Clarified `BattleManager.executeSkill` targeting logic.
5.  **`src/ui/windows/Window_Inventory.js`**: Documented ownership of `useConsumable`/`equipGear`.

## 3. Deprecation Status

*   **Legacy Modals:** `UIManager` methods for imperative modals are deprecated, replaced by `src/ui/` components, with `showStatusModal` remaining as a bridge.
*   **Game_Party.rotate:** Used only for death logic; `cycleActive` is used for player input.
