# Documentation Drift Audit Report

## Summary of Changes

The following documentation files were audited against the codebase:
- `README.md`
- `GAME_DESIGN.md`
- `src/ui/windows/Window_Log.js` (Inline documentation)

### Discrepancies Found

1.  **Character Names**: Documentation referred to "Aya", "Kyle", and "Eve". Codebase uses "Julia", "Miguel", and "Rebus".
2.  **Controls**: Documentation for Spacebar was "Wait", but actual mapping is "OK". "Enter" is also "OK". "Tab" is "Minimap", not just "Menu".
3.  **Module Structure**: `README.md` listed `src/windows.js` as the UI view layer. The actual architecture uses `src/ui/` for a component-based UI system.
4.  **Mechanics**:
    - "Bump to attack" is implemented via `BattleManager.executeSkill`.
    - `Game_Actor.regenPE` is largely unused; PE is recovered via items or specific effects.
    - Updated Stamina vs PE usage descriptions.
5.  **Visuals**: `Window_Log` displays the newest entry at the top. Documentation was missing or ambiguous.

## Diffs

### README.md

```markdown
<<<<<<< SEARCH
*   **Spacebar**: Wait / Skip turn.
*   **Enter**: Melee Attack.
*   **Mouse**: Interact with the UI (select skills, manage inventory, view tooltips).

## Architecture

The codebase has been refactored from a monolithic prototype into a modular architecture inspired by RPG Maker MZ's structure.

### Module Structure (`src/`)

*   **`data.js`**: Contains static configuration data (`CONFIG`), game database objects (`$dataSkills`, `$dataClasses`, `$dataEnemies`), and constant definitions (`EFFECT_*`, `TRAIT_*`).
*   **`core.js`**: Contains core utility classes that define the engine's backbone, such as `EventBus` (for decoupling logic and view), `ConditionSystem`, and `Sequencer`.
*   **`managers.js`**: Static classes that manage high-level game logic and systems (`SceneManager`, `BattleManager`, `ItemManager`).
*   **`objects.js`**: The "Model" layer. Classes representing game entities (`Game_Actor`, `Game_Enemy`, `Game_Map`). These hold state and business logic but do not handle rendering.
*   **`sprites.js`**: The "View" layer for the 3D world. Contains `Renderer3D` (Three.js logic) and `ParticleSystem`.
*   **`windows.js`**: The "View" layer for the UI. Contains `UIManager` and `UI_Window`.
*   **`main.js`**: The entry point. Bootstraps the application, handles window resizing, and initializes the `SceneManager`.
=======
*   **Spacebar / Enter / Z**: Confirm / Interact.
*   **Arrow Keys / WASD**: Move / Navigate Menu.
*   **Tab / M**: Toggle Minimap.
*   **C**: Open Command Menu.
*   **Q / E**: Swap Character.
*   **Mouse**: Interact with the UI (select skills, manage inventory, view tooltips).

## Architecture

The codebase has been refactored from a monolithic prototype into a modular architecture inspired by RPG Maker MZ's structure.

### Module Structure (`src/`)

*   **`data.js`**: Contains static configuration data (`CONFIG`), game database objects (`$dataSkills`, `$dataClasses`, `$dataEnemies`), and constant definitions (`EFFECT_*`, `TRAIT_*`).
*   **`core.js`**: Contains core utility classes that define the engine's backbone, such as `EventBus` (for decoupling logic and view), `ConditionSystem`, and `Sequencer`.
*   **`managers.js`**: Static classes that manage high-level game logic and systems (`SceneManager`, `BattleManager`, `ItemManager`).
*   **`objects.js`**: The "Model" layer. Classes representing game entities (`Game_Actor`, `Game_Enemy`, `Game_Map`). These hold state and business logic but do not handle rendering.
*   **`sprites.js`**: The "View" layer for the 3D world. Contains `Renderer3D` (Three.js logic) and `ParticleSystem`.
*   **`ui/`**: The "View" layer for the User Interface. Contains the component-based UI framework (`core.js`, `components.js`, `layouts.js`) and window implementations (`windows/*.js`).
*   **`windows.js`**: Contains the `UIManager` which bridges the game loop and the UI system.
*   **`main.js`**: The entry point. Bootstraps the application, handles window resizing, and initializes the `SceneManager`.
>>>>>>> REPLACE
```

```markdown
<<<<<<< SEARCH
*   **Squad System**: Rotate between three characters with unique stats and skills.
    *   **Aya**: High speed/utility.
    *   **Kyle**: Defense/crowd control.
    *   **Eve**: High damage magic/PE consumer.
*   **Progression**: Gain EXP to level up. Find loot to equip.
=======
*   **Squad System**: Rotate between three characters with unique stats and skills.
    *   **Julia**: High speed/utility.
    *   **Miguel**: Defense/crowd control.
    *   **Rebus**: High damage magic/PE consumer.
*   **Progression**: Gain EXP to level up. Find loot to equip.
>>>>>>> REPLACE
```

### GAME_DESIGN.md

```markdown
<<<<<<< SEARCH
    *   **Exhaustion:** If a character's PE reaches 0, they become **Exhausted** and are forcibly swapped out. They cannot be swapped back in until their PE recovers to 50%.

### 2.2. Combat
Combat is seamless (no separate battle screen) and takes place on the dungeon grid.

*   **Turn Structure:** Player Phase -> Enemy Phase.
*   **Actions:**
    *   **Move:** WASD / D-Pad. Consumes 10 PE.
    *   **Bump Attack:** Moving into an enemy triggers a basic melee attack. Consumes 0 PE (uses weapon stats).
    *   **Skills:** Selected from the menu. Can target single enemies, shapes (Line, Cone, Circle), or Self. Consumes PE.
        *   **Targeting:** Starts at the active character (or first valid target for inspection).
=======
    *   **Exhaustion:** If a character's Stamina reaches 0, they become **Exhausted** and are forcibly swapped out. They cannot be swapped back in until their Stamina recovers to 50%.

### 2.2. Combat
Combat is seamless (no separate battle screen) and takes place on the dungeon grid.

*   **Turn Structure:** Player Phase -> Enemy Phase.
*   **Actions:**
    *   **Move:** WASD / D-Pad. Consumes 10 Stamina.
    *   **Bump Attack:** Moving into an enemy triggers a basic melee attack. Consumes 20 Stamina.
    *   **Skills:** Selected from the menu. Can target single enemies, shapes (Line, Cone, Circle), or Self. Consumes PE (Power Energy) and 20 Stamina.
        *   **Targeting:** Starts at the active character (or first valid target for inspection).
>>>>>>> REPLACE
```

### src/ui/windows/Window_Log.js

```javascript
<<<<<<< SEARCH
// WINDOW: LOG
// ============================================================================

class Window_Log extends Window_Base {
    constructor(mmW) {
=======
// WINDOW: LOG
// ============================================================================

/**
 * Window for displaying game logs.
 * Displays messages in reverse chronological order (newest at the top).
 */
class Window_Log extends Window_Base {
    constructor(mmW) {
>>>>>>> REPLACE
```
