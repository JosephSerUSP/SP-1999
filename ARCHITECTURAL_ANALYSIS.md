# Architectural Analysis: Stillnight - Eve of the Stack

## 1. Executive Summary

"Stillnight: Eve of the Stack" is a browser-based, turn-based RPG. Originally implemented as a monolithic single-file application, it has been successfully refactored into a modular, event-driven architecture.

## 2. Current Architecture Assessment (Post-Refactor)

The application now follows a strict modular structure inspired by RPG Maker MZ, ensuring separation of concerns and maintainability.

*   **Objects (Model):** `Game_System`, `Game_Party`, `Game_Map`, `Game_Actor`, `Game_Enemy`. Located in `src/objects.js`.
*   **Sprites (View):** `Renderer3D` (Three.js) in `src/sprites.js`.
*   **UI (View):** `UIManager` in `src/windows.js` (Orchestration), with components and layouts in `src/ui/`.
*   **Managers (Controller):** `SceneManager`, `BattleManager`, `ItemManager`. Located in `src/managers.js`.
*   **Core:** `EventBus`, `ConditionSystem`. Located in `src/core.js`.

### 2.1. Resolved Critical Flaws

#### A. The "Single-File" Monolith
*   **Resolution:** Codebase split into 7 distinct files within `src/` directory. CSS extracted to `style.css`.

#### B. Tight Coupling & Circular Dependencies
*   **Resolution:** Implemented `EventBus`. Game logic no longer calls `Renderer` or `UI` directly. All visual updates are triggered via events (`play_animation`, `log_updated`, etc.).

#### C. Global State Abuse
*   **Resolution:** Global variables (`$gameSystem`, etc.) are now clearly defined in `src/main.js` and act as the distinct runtime state, separate from static configuration data.

#### D. Hardcoded Logic
*   **Resolution:** `BattleManager` uses a generic `applyEffect` system. `$dataSkills` uses an `effects` array, allowing data-driven skill creation.

## 3. Strategic Plan Execution Log

### Phase 1: Decoupling via Event Bus (Completed)
*   Introduced `EventBus` class.
*   Refactored `Game_Map` and `BattleManager` to emit events.
*   Updated `Renderer3D` and `UIManager` to subscribe to events.

### Phase 2: Data-Driven Skill System (Completed)
*   Refactored `$dataSkills` to use `effects` array structure.
*   Implemented generic `BattleManager.applyEffect` method.
*   Verified support for complex skills (Multi-hit, Drain).

### Phase 3: File Modularization (Completed)
*   Split code into `src/data.js`, `src/core.js`, `src/managers.js`, `src/objects.js`, `src/sprites.js`, `src/windows.js`, `src/main.js`.
*   Updated `index.html` to load modules in dependency order.

### Phase 4: Documentation & UI Cleanup (Completed)
*   Added comprehensive JSDoc to all source files.
*   Updated `README.md` with complete developer guide.
*   Performed minor UI inline style cleanup where appropriate.

## 4. Conclusion

The refactoring has transformed the codebase from a fragile prototype into a robust engine foundation. The architecture is now scalable, allowing for easier addition of features, content, and visual improvements without risking regression in core logic.
