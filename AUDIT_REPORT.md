# Documentation Audit Report

## Executive Summary
An audit of the `Stillnight: Eve of the Stack` codebase has revealed discrepancies between the documentation (`README.md`, `GAME_DESIGN.md`) and the actual implementation in `src/`. The primary areas of drift are Game Controls and AI Architecture.

## Discrepancies

### 1. Game Controls (`README.md`)
The `README.md` lists controls that do not align with `src/input.js` and `src/main.js`.

| Action | Documentation Claim | Actual Implementation | Notes |
| :--- | :--- | :--- | :--- |
| **Wait / Skip** | Spacebar | **None** | Spacebar maps to 'OK', which opens the Command Menu. There is no dedicated 'Wait' button in the main map loop. |
| **Melee Attack** | Enter | **Context-Sensitive** | Enter maps to 'OK'. Melee attacks are triggered by bumping into enemies or selecting 'ATTACK' from the menu. |
| **Menu** | (Not Listed) | Tab / C / Button 2 | `InputManager` maps these to 'MENU'. |
| **Swap Actor** | (Not Listed) | Q / E / L2 / R2 | `InputManager` maps these to 'PREV_ACTOR' / 'NEXT_ACTOR'. |

### 2. AI Architecture (`GAME_DESIGN.md`)
The design document describes a behavior tree system where "Turret" is a distinct behavior type.
*   **Actual**: `Game_Enemy.decideAction` handles "Hunter", "Flee", and "Patrol", but "Turret" logic is hardcoded as a legacy check in `Game_Map.updateEnemies` ("Phase 1: Planning & Movement").

### 3. Feature Scope
*   **Demon Negotiation**: Referenced in design context/memory but not implemented.
*   **Planned Features**: `GAME_DESIGN.md` serves as a living document; some features (like Exit Locking/Bosses) are noted as disabled, which is accurate.

## Code Rot & Deprecations

### Dead Code
*   **`Game_Actor.regenPE()`** (`src/objects.js`): This method is never called. `Window_Inventory` implements its own logic for PE restoration items inline.

### Deprecated Methods
*   **`UIManager.showTargetSelectModal`** (`src/windows.js`): Marked `@deprecated`. Replaced by `Window_Tactics` targeting flow.
*   **`UIManager.showConfirmModal`** (`src/windows.js`): Marked `@deprecated`.

## Recommended Actions
1.  **Update README**: Correct the Control Scheme section.
2.  **Flag Dead Code**: Add `@deprecated` to `Game_Actor.regenPE`.
3.  **Future Refactor**: Unify Enemy AI logic into `decideAction` to remove the legacy block in `Game_Map`.
