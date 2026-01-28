# 3. Code Architecture Document — “Eve of the Stack”

This section describes how the game is structured as code.

## 3.1. High-Level Architecture

The codebase utilizes a **Modular Architecture** within the `src/` directory.

### Module Structure (`src/`)

*   **`data.js`**: Data Layer. Contains static configuration (`CONFIG`), database objects (`$dataSkills`, `$dataClasses`, `$dataEnemies`, `$dataLootTable`, `$dataFloors`, `$dataCutscenes`), and constants.
*   **`core.js`**: Core Utilities. Contains `EventBus` (messaging), `ConditionSystem` (logic evaluation), `Sequencer` (async helpers), and `Geometry` (grid math).
*   **`managers.js`**: Systems Logic. Contains static managers for specific domains: `BattleManager`, `ItemManager`, `CutsceneManager`, and `BanterManager`.
*   **`objects.js`**: Game Logic Layer (Model). Classes representing stateful entities: `Game_System`, `Game_Party`, `Game_Actor`, `Game_Enemy`, `Game_Map`, `Game_Item`.
*   **`sprites.js`**: Rendering Layer (View). Contains `Renderer3D` (Three.js scene) and `ParticleSystem`.
*   **`windows.js`**: UI Bridge. Contains `UIManager` which initializes the UI and handles high-level window management.
*   **`ui/`**: Component Framework. Contains the component-based UI system (`UIComponent`, `UIContainer`, `Window_Base`) and specific window implementations (`Window_Status`, `Window_Tactics`, etc.).
*   **`main.js`**: Entry Point. Contains `SceneManager` which bootstraps the game loop and input.

### Key Globals

*   `$gameSystem`: Global meta-state (logs, floor index).
*   `$gameParty`: Party state (members, inventory).
*   `$gameMap`: Grid state, enemies, and loot.
*   `$gameBanter`: Manages dynamic dialogue.
*   `Renderer`: The 3D renderer instance.
*   `UI`: The UI Manager instance.

## 3.2. Data Layer

**`src/data.js`**

*   **Config**: `CONFIG.colors` defines the palette.
*   **Skills**: `$dataSkills` (keyed by ID). Defines costs, ranges, shapes (`line`, `cone`, `circle`, `target`), and effects (`EFFECT_*`).
*   **Classes**: `$dataClasses`. Defines base stats, colors, and the `banter` configuration list for dynamic dialogue.
*   **Enemies**: `$dataEnemies`. Defines stats and `aiConfig` (behavior trees).
*   **Loot**: `$dataLootTable`. Prefixes, weapons, armors, and items.
*   **Floors**: `$dataFloors`. Generation config (dimensions, generator type, density).

## 3.3. Runtime Game Objects

**`src/objects.js`**

### `Game_System`
*   **`isBusy`**: Lock flag. Prevents input during attack animations or blocking actions.
*   **`isInputBlocked`**: Lock flag. Used for cutscenes and modals to freeze the game.
*   **`ui`**: Reference to the `UIManager` instance.
*   **`log(text, type)`**: Pushes to `logHistory` and emits `log_updated`.

### `Game_Actor`
*   **Stats**: `hp`/`mhp`, `pe`/`mpe` (Power Energy), `stamina`/`mstamina`.
*   **Stamina System**:
    *   Max 1000.
    *   **Costs**: Move (10), Action/Skill (20).
    *   **Exhaustion**: At 0 Stamina, the actor is `isExhausted` and forced to swap.
    *   **Regen**: Inactive members regenerate 50% of the active member's expenditure.
*   **PE**: Does **not** regenerate automatically. Restored via Items (Stims) or specific Effects.

### `Game_Enemy`
*   **AI**: Driven by `aiConfig`.
    *   **Decide Action**: Evaluates a priority list of `actions`.
    *   **Conditions**: Checks range, cooldowns, custom states (e.g., `meleeMode`), and turn intervals.
    *   **Behaviors**: `hunter`, `patrol`, `ambush`, `turret` (implemented via stationary logic and ranged actions).

### `Game_Map`
*   **`setup(floor)`**: Generates the level using `$generatorRegistry`.
*   **`processTurn(dx, dy, action)`** (Async):
    *   Accepts movement (`dx`, `dy`) OR a direct `action` callback.
    *   **Phase 1: Player**: Updates player position/action. Consumes Stamina.
    *   **Phase 2: Enemy Update**: Calls `updateEnemies()`.
    *   **Phase 3: Turn End**: Processes DOTs, buffs, and cooldowns.
*   **`updateEnemies()`** (Async):
    *   **Phase 1: Planning**: All enemies decide actions and move (if applicable).
    *   **Phase 2: Sync**: Emits `sync_enemies` to update 3D visuals.
    *   **Phase 3: Execution**: Enemies execute skills or attacks sequentially with visual delays.
*   **Targeting**: `startTargeting(skill)` / `updateTargeting()` handles cursor/cycle modes for skill usage.

## 3.4. Managers & Utilities

**`src/managers.js` & `src/core.js`**

### `BattleManager`
*   **`calcDamage(source, target)`**: `(ATK * 2 - DEF) * variation`.
*   **`applyEffect(effect, source, target)`**: Handles `EFFECT_DAMAGE`, `EFFECT_HEAL`, `EFFECT_ADD_STATE`, `EFFECT_RECOVER_PE`, `EFFECT_SCAN_MAP`.
*   **`executeSkill(user, skillKey, target = null)`** (Async):
    *   Checks PE cost.
    *   Resolves targets based on shape (`line`, `cone`, `circle`) if no specific `target` is provided.
    *   Emits animation events and applies effects.

### `BanterManager`
*   **System**: Priority-based dialogue queue.
*   **Triggers**: `kill`, `walk`, `surrounded`, `loot`, `hurt`, `low_hp`, `start`.
*   **Cooldowns**: Global (3s), Per-Trigger (10s), Per-Actor (5s).
*   **Flow**: Checks conditions -> Adds to Queue -> Displays floating text.

### `Core Utilities`
*   **`EventBus`**: Decouples logic and view. `emit(topic, data)` / `on(topic, callback)`.
*   **`ConditionSystem`**: Evaluates complex logic (e.g., `enemy_count_range`, `hp_below_pct`) for Banter/AI.
*   **`Geometry`**: Helper for grid shapes (`getLine`, `getCircle`, `getCone`).

## 3.5. Rendering Layer

**`src/sprites.js`**

### `Renderer3D`
*   Uses **Three.js**.
*   **`mapGroup`**: Instanced meshes for floor/walls.
*   **`playAnimation(type, data)`**: Handles visual FX (`move_switch`, `hit`, `ascend`, `projectile`).
*   **`animate()`**: Main render loop.

## 3.6. UI Layer

**`src/ui/` & `src/windows.js`**

### Component Framework (`src/ui/`)
*   **`UIComponent`**: Base class for DOM-based UI elements.
*   **`Window_Base`**: Standard window shell with header/content.
*   **Implementations**: `Window_Status`, `Window_Tactics`, `Window_Log`, `Window_Minimap`, `Window_View`.

### `UIManager` (`src/windows.js`)
*   Bootstraps the UI.
*   Manages focus (`focusWindow`, `activeModal`).
*   Bridges `InputManager` to UI components.

## 3.7. Scene & Input Management

**`src/main.js`**

### `SceneManager`
*   **`init()`**: Instantiates globals and starts the loop.
*   **`loop()`**: Drives `InputManager`, `BanterManager`, and delegates input:
    1.  **Global UI** (Minimap).
    2.  **UI Navigation** (if modal/focused).
    3.  **Targeting** (if `$gameMap.isTargeting()`).
    4.  **Map Gameplay** (Movement/Menu).

## 3.8. Cross-Cutting Flags

*   **`$gameSystem.isBusy`**: Blocks new map inputs while actions resolve.
*   **`$gameSystem.isInputBlocked`**: Hard freeze for cutscenes/modals.
*   **`Renderer.isAnimating`**: Throttles movement speed for visuals.
