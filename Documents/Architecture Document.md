3. Code Architecture Document — “Eve of the Stack”

This section describes how the game is structured as code.

3.1. High-Level Architecture

The codebase handles three conceptual layers:

**Data Layer (configuration & content):**
`CONFIG`, `$dataSkills`, `$dataClasses`, `$dataEnemies`, `$dataLootTable`, `$dataFloors`, `$dataCutscenes`.

**Game Logic Layer (systems & state):**
*   **Core state:** `Game_System`, `Game_Party`, `Game_Actor`, `Game_Enemy`, `Game_Map`.
*   **Managers:** `BattleManager`, `ItemManager`, `CutsceneManager`, `BanterManager`, `Sequencer`.
*   **Global singletons:** `$gameSystem`, `$gameParty`, `$gameMap`, `Cutscene`, `$gameBanter`.

**Presentation Layer:**
*   **3D renderer:** `Renderer3D`, `ParticleSystem`, `Renderer` singleton.
*   **UI:** `UIManager` (singleton `UI`), Component-Based Framework (`UIComponent`, `UIContainer`, `Window_Base`).
*   **Screen FX:** HTML overlays handled via CSS and DOM manipulation.

**Orchestration:**
*   **SceneManager:** bootstraps the game, handles the main loop, and manages input delegation.

3.2. Data Layer

*   **Config:** `CONFIG.colors` defines base color palette used by Renderer3D.
*   **Skill Data ($dataSkills):** Plain object keyed by skill id. Includes display data and mechanics data (cost, range, type, effects).
*   **Class / Actor Data ($dataClasses):** Defines job, base stats, color, and starting skills.
*   **Enemy Data ($dataEnemies):** Array of enemies with stats, AI config, and visual properties.
*   **Loot Table ($dataLootTable):** Definitions for weapons, armors, and items.
*   **Floors ($dataFloors):** Configuration for procedural generation (dimensions, enemies, loot, cutscenes).
*   **Cutscenes ($dataCutscenes):** Scripted sequences of commands (dialog, wait, log).

3.3. Runtime Game Objects

**Game_System**
*   **Global meta-state:** `floor`, `logHistory`, `isBusy`, `isInputBlocked`.
*   **log(text):** Pushes to logHistory, trims size, and emits `log_updated`.

**Game_Actor**
*   Represents a party member.
*   **Stats:** HP, PE (Power Energy), Stamina.
*   **Stamina System:**
    *   Max Stamina: 1000.
    *   Actions cost stamina (Move: 10, Skill: 20).
    *   **Exhaustion:** If stamina reaches 0, the actor becomes exhausted and the party attempts to swap to a fresh member.
    *   **Regen:** Inactive members regenerate stamina when the active member spends it.
*   **Progression:** `gainExp(v)` triggers level up when `exp >= nextExp`. `nextExp` scales via `Math.floor(nextExp * 1.5)`.
*   **Methods:** `takeDamage`, `heal`, `payStamina`, `gainItem`.

**Game_Enemy**
*   Represents a single enemy instance.
*   **AI:** Uses `decideAction` based on `aiConfig` (support for ranges, cooldowns, state checks).
*   **Methods:** `takeDamage`, `isDead`, `onActionTaken`.

**Game_Party**
*   Holds members (array of 3 `Game_Actor`) and shared inventory.
*   **Rotation:**
    *   `cycleActive(dir)`: Manual rotation by player.
    *   `rotate()`: Forced rotation when active member dies.
    *   `checkExhaustionSwap()`: Auto-swap when active member is exhausted.
*   **Methods:** `active()`, `distributeExp()`, `gainItem()`.

**Game_Map**
*   Encapsulates the grid, entities, and turn logic.
*   **Properties:** `width`, `height`, `tiles`, `enemies`, `loot`, `targetingState`.
*   **setup(floor):** Generates level via `Generator` registry, spawns entities, triggers start cutscene/banter.
*   **processTurn(dx, dy, action) (Async):**
    *   Handles input blocking and `isBusy` checks.
    *   **Movement:** Checks collisions, consumes stamina, updates position, picks up loot, triggers map events (stairs).
    *   **Combat:** If moving into enemy, executes melee attack (via `BattleManager`).
    *   **Actions:** If `action` callback provided, executes it (e.g. Skill).
    *   **Updates:** Calls `updateEnemies()` and `processTurnEnd()` after player action.
*   **updateEnemies() (Async):**
    *   **Phase 1 (Planning):** All enemies decide actions. Moves are processed immediately for collision resolution.
    *   **Phase 2 (Visuals):** Syncs enemy meshes.
    *   **Phase 3 (Execution):** Executes attacks/skills sequentially with delays for visual clarity.
*   **Targeting:**
    *   `startTargeting(skill)`: Enters targeting mode (Cursor, Direction, or Cycle).
    *   `updateTargeting()`: Handles input for cursor movement or target selection.

3.4. Managers & Utilities

**BattleManager**
*   Static helper for combat logic.
*   **calcDamage(source, target):** Standard damage formula with variation.
*   **executeSkill(actor, key, target) (Async):**
    *   Checks PE cost.
    *   Resolves targets based on skill type/shape (Cone, Line, Circle, All).
    *   Applies effects (Damage, Heal, State, etc.).
    *   Handles visual FX (projectiles, flashes).

**BanterManager**
*   Manages floating dialogue text.
*   **Systems:**
    *   **Priority Queue:** Higher priority lines (Story/Reply) preempt generic ones.
    *   **Cooldowns:** Tracks Global, Per-Trigger, and Per-Actor cooldowns to prevent spam.
    *   **Chains:** Supports reply chains for conversational depth.

**ItemManager**
*   Generates loot based on floor difficulty and loot tables.

**CutsceneManager**
*   Handles blocking cutscenes.
*   **processCommand:** Supports `dialog` (with blocking input poll), `wait`, `log`.

3.5. Rendering Layer

**Renderer3D**
*   Uses Three.js to render the game world.
*   **Methods:** `init`, `rebuildLevel`, `syncEnemies`, `playAnimation` (move, hit, shake, etc.).
*   **Animation Lock:** `isAnimating` flag prevents input during movement transitions.

3.6. UI Layer

**Architecture**
*   **Component-Based:** Uses `UIComponent`, `UIContainer`, and `Window_Base` to build modular UI elements.
*   **UIManager:** Singleton managing all windows and input focus.
*   **Windows:**
    *   `Window_Party`, `Window_Tactics`, `Window_Log`, `Window_View`, `Window_Help`.
    *   `Window_Minimap`: Renders map state to an HTML Canvas.
    *   `Window_Inventory`: dynamic window for item management.
    *   `Window_Status`: dynamic window for detailed actor stats.

**Interaction**
*   **Focus System:** `UIManager` tracks `focusedWindow` and `focusableElements`, handling keyboard navigation (Arrows, OK, Cancel).

3.7. Scene & Input Management

**SceneManager**
*   **init():** Bootstraps all systems, initializes Renderer and UI.
*   **loop():** Main game loop.
    *   Updates `InputManager`, `BanterManager`, `UIManager`.
    *   **Input Priority:**
        1.  **Global UI:** (e.g., Minimap toggle).
        2.  **UI Navigation:** If a window/modal is focused.
        3.  **Targeting:** If `$gameMap.isTargeting()`.
        4.  **Gameplay:** Player movement/actions (calls `$gameMap.processTurn`).

3.8. Cross-Cutting Flags & Global State

*   `$gameSystem.isBusy`: Locks input during turn processing.
*   `$gameSystem.isInputBlocked`: Locks input during cutscenes/modals.
*   `Renderer.isAnimating`: Throttles movement during visual transitions.

3.9. Known Technical Limitations / Debt

*   **Scene Stack:** No formal scene stack (Menu, Map, Title are not separate scenes), though `UIManager` handles focus effectively.
*   **Content:** Some data fields (e.g., full status effect implementations) are partial.
*   **State Management:** High coupling between global singletons (`$gameMap`, `$gameParty`, `UI`).
