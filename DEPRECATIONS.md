# Deprecations and Removals

As the project evolves from a prototype to a modular architecture, certain systems and methods have been deprecated or removed. This document tracks these changes to aid in auditing and refactoring.

## Removed Systems

*   **Imperative Modals:** The `UIManager` methods `showTargetSelectModal` and `showConfirmModal` are legacy remnants. New UI development should utilize the component-based system in `src/ui/` (e.g., `Window_Inventory` managing its own state).
*   **Legacy AI Data:** The `ai` property in `$dataEnemies` is no longer used. Enemy behavior is exclusively defined via `aiConfig`.
*   **Game_Map.playerAttack:** Replaced by `BattleManager.executeSkill` (using the 'melee' skill).

## Deprecated Methods

### `src/objects.js`

*   **`Game_Actor.regenPE()`**: PE generation is no longer automatic. This method is unused.
*   **`Game_Party.rotate()`**: Party rotation is now manual (`cycleActive`). This method is reserved only for forced rotation upon character death.

### `src/ui/core.js`

*   **`Window_Base.content`**: Use `Window_Base.contentEl` to access the DOM element directly.

### `src/windows.js`

*   **`UIManager.showTargetSelectModal`**: Use component internal state or new Window classes.
*   **`UIManager.showConfirmModal`**: Use component internal state or new Window classes.

## Documentation Drift Corrections

*   **Characters:** Updated to Julia, Miguel, and Rebus (previously Aya, Kyle, Eve).
*   **Controls:** Updated to reflect `InputManager` mappings (Space/Enter/Z for OK).
*   **Architecture:** Updated to include `src/ui/` and correct file locations.
*   **Mechanics:** Clarified Stamina vs PE usage.
