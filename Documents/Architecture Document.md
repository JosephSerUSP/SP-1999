# Code Architecture Document — “Eve of the Stack”

This document describes the codebase structure, classes, and systems of the game.

## 1. High-Level Architecture

The codebase utilizes a modular architecture inspired by RPG Maker MZ, residing in the `src/` directory.

### Module Structure (`src/`)

*   **`data.js`**: Contains static configuration data (`CONFIG`), game database objects (`$dataSkills`, `$dataClasses`, `$dataEnemies`), and constant definitions.
*   **`core.js`**: Core utility classes (`EventBus`, `ConditionSystem`, `Sequencer`, `Geometry`).
*   **`managers.js`**: Static classes managing high-level systems (`BattleManager`, `ItemManager`, `CutsceneManager`, `BanterManager`).
*   **`objects.js`**: The Model layer. Game entities (`Game_System`, `Game_Actor`, `Game_Enemy`, `Game_Map`, `Game_Party`).
*   **`sprites.js`**: The 3D View layer (`Renderer3D`, `ParticleSystem`).
*   **`windows.js`**: The UI Manager and top-level window layout (`UIManager`).
*   **`ui/`**: Component-based UI framework and specific window implementations (e.g., `Window_Party`, `Window_Tactics`).
*   **`generators/`**: Procedural generation logic (`GeneratorRegistry`, `DungeonGenerator`).
*   **`main.js`**: Entry point (`SceneManager`).

### Global Singletons

*   `$gameSystem`: Global meta-state (floor, logs).
*   `$gameParty`: Party management.
*   `$gameMap`: Current level state.
*   `$gameBanter`: Banter system instance.
*   `UI`: The UIManager instance.
*   `Renderer`: The Renderer3D instance.
*   `Cutscene`: The CutsceneManager instance.

## 2. Data Layer

*   **CONFIG**: Base colors and settings.
*   **$dataSkills**: Skill definitions (costs, ranges, effects).
*   **$dataClasses**: Character definitions for "Julia", "Miguel", and "Rebus".
*   **$dataEnemies**: Enemy definitions (`aiConfig` defines behavior).
*   **$dataLootTable**: Probabilities for items, weapons, and armors.
*   **$dataFloors**: Configuration for each floor level.

## 3. Runtime Game Objects (`src/objects.js`)

### Game_System
Acts as the central data object for system state.
*   `floor`: Current floor index.
*   `logHistory`: Array of log strings.
*   `isBusy`: Locks input during actions.
*   `isInputBlocked`: Locks input during cutscenes/modals.

### Game_Actor
Represents a party member (Julia, Miguel, Rebus).
*   **Stamina System**:
    *   `stamina`: Current stamina (max 1000).
    *   `payStamina(amount)`: Consumes stamina (Movement: 10, Skill: 20). Triggers exhaustion at 0.
    *   `gainStamina(amount)`: Recovers stamina.
    *   `checkExhaustionSwap()`: Forces a swap if the active actor becomes exhausted.
*   **PE (Parapsychic Emission)**:
    *   Resource for skills. Does *not* regenerate automatically. Restored via items/effects.
*   **Methods**: `isDead()`, `takeDamage()`, `heal()`, `gainExp()`.

### Game_Party
*   `members`: Array of 3 `Game_Actor` instances.
*   `active()`: Returns the current actor.
*   `cycleActive(dir)`: Manual character swap (Q/E).
*   `rotate()`: Forced rotation upon character death.
*   `distributeExp(amount)`: Splits EXP (active gets full, others get 50%).

### Game_Enemy
*   `aiConfig`: logic definition for behavior (replacing legacy `ai` tag).
*   `decideAction()`: Evaluates `aiConfig` to return a move or skill action.
*   `cooldowns`: Tracks skill cooldowns.

### Game_Map
Encapsulates grid state, entities, and turn processing.
*   **Methods**:
    *   `processTurn(dx, dy, action)`: Async. Handles movement or external actions. Applies `isBusy` lock.
    *   `updateEnemies()`: Async. 3-Phase update (Planning, Visualization, Execution).
    *   `startTargeting(skill, callback)`: Enters targeting mode for skills.
    *   `updateTargeting()`: Handles input during targeting (cursor/cycling).
    *   `killEnemy(enemy)`: Handles enemy death sequence.

## 4. Managers (`src/managers.js`)

### BattleManager
*   `calcDamage(source, target)`: Standard damage formula.
*   `executeSkill(actor, key, target)`: Async. Handles PE cost, animation, and effect application.
*   `applyEffect(effect, source, target)`: Handles specific effects (DAMAGE, HEAL, ADD_STATE, RECOVER_PE).

### BanterManager
Manages floating text banter with a priority queue system.
*   `trigger(type, context)`: Attempts to trigger banter based on events (kill, walk, start, etc.).
*   `queue`: Priority-based queue for lines.
*   `cooldowns`: Global, per-actor, and per-trigger cooldowns.

### ItemManager
Generates loot based on floor difficulty.

### CutsceneManager
Handles scripted cutscenes, blocking input and displaying dialog overlays.

## 5. UI Layer (`src/windows.js`, `src/ui/`)

### UIManager
Top-level manager.
*   `windows`: Collection of persistent windows (`status`, `cmd`, `log`, `minimap`, `view`).
*   `refresh()`: Updates all windows.
*   `showInventoryModal()`: Opens inventory.
*   `showStatusModal(actor)`: Opens status.
*   **Note**: Legacy imperative modals (`showTargetSelectModal`, `showConfirmModal`) have been removed in favor of component-based or inline logic.

### Components
*   **Window_Tactics**: Command menu.
*   **Window_Party**: Squad status.
*   **Window_Log**: Message log.
*   **Window_Minimap**: Canvas-based minimap.

## 6. Rendering Layer (`src/sprites.js`)

### Renderer3D
Manages Three.js scene.
*   `playAnimation(type, data)`: Handles visual FX (move_switch, hit, projectile).
*   `syncEnemies()`: Updates 3D meshes to match `Game_Map` state.

## 7. Procedural Generation (`src/generators/`)

### GeneratorRegistry
Factory for creating dungeon generators based on configuration.
