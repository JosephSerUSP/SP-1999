# Architectural Analysis: Stillnight - Eve of the Stack

## 1. Executive Summary

"Stillnight: Eve of the Stack" is a browser-based, turn-based RPG currently implemented as a monolithic single-file application (`index.html`). While the project demonstrates a functional game loop, 3D rendering, and UI interaction, the current architecture suffers from significant tight coupling, scalability issues, and "spaghetti code" patterns.

This document provides a deep analysis of the current codebase, identifying critical flaws ("Frankenstein" code, redundancies), and outlines a strategic plan to refactor the application into a scalable, maintainable architecture.

## 2. Current Architecture Assessment

The application follows a loose Model-View-Controller (MVC) pattern but lacks strict boundaries.

*   **Model (Data/Logic):** `Game_System`, `Game_Party`, `Game_Map`, `Game_Actor`, `Game_Enemy`.
*   **View (Presentation):** `Renderer3D` (Three.js), `UIManager` (DOM), `ParticleSystem`.
*   **Controller (Input/Orchestration):** `SceneManager`, `BattleManager`.

### 2.1. Critical Flaws & Code Smells

#### A. The "Single-File" Monolith
*   **Issue:** All logic, data, styling, and markup exist in `index.html`.
*   **Impact:** Navigation is difficult. Version control diffs are noisy. Separation of concerns is enforced only by discipline, not file structure.

#### B. Tight Coupling & Circular Dependencies
*   **Issue:** Game logic classes directly manipulate the UI and Renderer.
    *   `Game_Map.processTurn` calls `Renderer.playAnimation` and `UI.refresh()`.
    *   `UI` event handlers directly call `$gameMap.processTurn` and `BattleManager.executeSkill`.
*   **Impact:** You cannot modify or test the Game Logic without breaking or involving the View layer. Changing the UI implementation would require rewriting core game logic.

#### C. Global State Abuse
*   **Issue:** The system relies on global variables: `$gameSystem`, `$gameParty`, `$gameMap`, `Renderer`, `UI`.
*   **Impact:** Any function can modify any part of the system state. Tracking bugs related to state mutations (e.g., when `isBusy` is set or cleared) is difficult.

#### D. Hardcoded Logic ("Spaghetti Code")
*   **Issue:** `BattleManager.executeSkill` contains a large `if/else if` block checking for specific skill IDs (`rapid`, `scan`, `blast`, `drain`).
*   **Impact:** The "Data Layer" (`$dataSkills`) is not truly driving the behavior. Adding a new skill requires modifying the code in `BattleManager`, not just adding an entry to `$dataSkills`. This violates the Open/Closed Principle.

#### E. Redundancies & Dead Code
*   **Redundancy:** `Game_Actor` initializes `this.inventory = []`, but the game uses a shared inventory in `Game_Party`.
*   **Inconsistency:** `Game_Battler` handles `states`, but `Game_Map` and `BattleManager` both contain snippets of logic for handling specific state effects (e.g., `stun` logic scattered in `executeSkill` and `processTurn`).

#### F. UI/Logic Leakage
*   **Issue:** `UIManager` generates HTML strings with inline styles and onclick handlers that reach into global scope.
*   **Impact:** The UI code is fragile and hard to maintain. Styling is mixed with logic.

## 3. Detailed Component Analysis

### 3.1. Game_Map & Movement
The `processTurn` method is a "God Method". It handles:
1.  Input validation (`isInputBlocked`).
2.  Movement logic.
3.  Collision detection.
4.  Interaction (Looting).
5.  Rendering triggers (`Renderer.playAnimation`).
6.  Level transition (Ascending).
7.  Turn scheduling (`processTurnEnd`, `updateEnemies`).

This makes the method incredibly fragile. A change to animation timing breaks turn logic.

### 3.2. BattleManager
The `BattleManager` is not generic. It acts as a hardcoded script interpreter for specific skills.
*   **Code Smell:** Strings like `"rapid"`, `"scan"`, `"drain"` are hardcoded in the logic.
*   **Refactoring Need:** A generic "Effect System" is needed where skills define *effects* (e.g., `DAMAGE`, `HEAL`, `ADD_STATE`) and the manager processes these effects data-driven.

### 3.3. Renderer3D
The `Renderer3D` class manages the Three.js scene.
*   **Coupling:** It knows too much about game data structure. It reads `userData.uid` to find enemies.
*   **State:** It holds animation state variables (`moveLerpProgress`, `isAnimating`) that tightly lock with `Game_Map` logic.

## 4. Strategic Plan for Improvement

To evolve "Stillnight" from a prototype to a scalable game, we must refactor towards a modular, event-driven architecture.

### Phase 1: Decoupling via Event Bus (High Priority)
**Goal:** Remove direct calls from Logic to View.
1.  Introduce a global `EventBus`.
2.  **Refactor `Game_Map`:** Instead of calling `Renderer.playAnimation(...)`, emit `EventBus.emit('player_move', { from, to })`.
3.  **Refactor `Renderer` & `UI`:** Subscribe to these events to update the display.
4.  **Benefit:** Logic becomes testable and independent of the visual representation.

### Phase 2: Data-Driven Skill System (Medium Priority)
**Goal:** Remove hardcoded skill IDs from `BattleManager`.
1.  **Refactor `$dataSkills`:** Add an `effects` array to skill definitions.
    *   Example: `effects: [{ code: 'DAMAGE', value: 1.2 }, { code: 'ADD_STATE', id: 'stun', chance: 0.5 }]`.
2.  **Refactor `BattleManager`:** Create a generic `applyEffect` method that iterates through the effects array.
3.  **Benefit:** Content creators can add complex skills without writing code.

### Phase 3: File Modularization (High Priority)
**Goal:** Break the monolith.
1.  Split `index.html` into:
    *   `src/data.js`
    *   `src/core.js` (System, Input)
    *   `src/model.js` (Actor, Enemy, Map)
    *   `src/view.js` (Renderer, UI)
    *   `src/main.js` (Bootstrapper)
2.  (Optional) Use ES Modules (`<script type="module">`) to enforce imports/exports.

### Phase 4: UI Separation
**Goal:** Clean up UIManager.
1.  Move inline CSS to a `<style>` block or separate CSS file (Tailwind classes are fine, but inline `style="..."` should be minimized).
2.  Create a strict API for the UI to request actions (Command Pattern) rather than calling global methods directly.

## 5. Conclusion

The current codebase is a functional prototype but is brittle ("Glass Cannon"). The tight coupling between game rules and visual feedback is the primary bottleneck for adding new features (like new skills, complex AI, or different level types). By implementing an Event Bus and a Data-Driven Effect system, we can untangle the "spaghetti" and create a robust foundation for future expansion.
