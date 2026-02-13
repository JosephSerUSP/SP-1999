# Architectural Flaw Analysis: Stillnight - Eve of the Stack

## 1. Executive Summary

This document provides a deep architectural analysis of the "Stillnight: Eve of the Stack" codebase following its initial refactoring. While the move from a single-file monolith to a modular structure resolved the most critical initial flaws, this subsequent review has identified several remaining architectural issues that compromise the project's long-term maintainability, testability, and scalability.

The flaws are categorized into three levels of severity:
- **Grave Flaws:** Fundamental issues that violate core architectural principles and create tight coupling across the entire application.
- **Structural Flaws:** Problems related to the organization and responsibilities of major classes, leading to code that is difficult to maintain and extend.
- **Moderate Flaws:** Issues that, while less critical, introduce inconsistencies and make the codebase harder to configure and reason about.

The following sections detail each flaw, explain its impact, and propose a concrete solution based on established software engineering principles.

---

## 2. Grave Flaws

### 2.1. Pervasive Global State and Service Location
**Problem:**
Despite the previous analysis claiming resolution, the application relies heavily on globally accessible variables (`$gameSystem`, `$gameParty`, `$gameMap`, `Renderer`, `UI`, `Cutscene`, `$gameBanter`) initialized in `main.js`. Modules across the entire codebase directly access these globals, creating a web of implicit, undeclared dependencies.

*   `core.js` (`ConditionSystem`) directly reads from `$gameMap`.
*   `objects.js` (`Game_Battler`) directly calls methods on `$gameBanter`.
*   `managers.js` (`BattleManager`) directly accesses `$gameSystem` and `$gameMap`.
*   `windows.js` (`UIManager`) directly accesses the global `Renderer` instance to perform 3D-to-2D projections.

**Impact:**
- **Tight Coupling:** The entire codebase is coupled to the existence and state of these global objects. Replacing any single system (e.g., swapping the `Renderer3D` for a 2D one) would require finding and changing references throughout the application.
- **Untestability:** Modules cannot be tested in isolation. To test a simple function like `ConditionSystem.check`, a developer must construct and manage a global `$gameMap` object, making unit testing nearly impossible.
- **Unpredictable Data Flow:** State can be modified by any part of the application at any time, making it extremely difficult to debug issues related to state corruption or race conditions.

**Solution: Dependency Injection (DI)**
Refactor the architecture to use dependency injection. Instead of modules reaching into the global scope, their required dependencies should be passed into their constructors.

*   A central `SceneManager` or `Game` class should be responsible for instantiating and "wiring up" all major services (`Game_Map`, `UIManager`, `BattleManager`, etc.).
*   Classes should declare their dependencies in their constructor.
    *   *Example:* `new ConditionSystem($gameMap)` instead of `ConditionSystem` accessing the global `$gameMap`.
    *   *Example:* `new UIManager(renderer)` instead of `UIManager` accessing the global `Renderer`.

### 2.2. View Logic Bleeding into Model & Controller Layers
**Problem:**
The core game logic layers (`objects.js`, `managers.js`) contain explicit knowledge of the presentation layer. The `EventBus` is used, but the events emitted are overly specific and tied to the current view implementation.

*   `BattleManager.applyEffect` emits `'float_text'` and `'play_animation'`, including view-specific data like hex color codes (`#f00`) and animation names (`'hit'`).
*   `Game_Map.processTurn` emits `'play_animation'` with a specific animation name (`'move_switch'`).

**Impact:**
- **Decoupling Failure:** The "logic" is not truly decoupled from the "view." If a designer wants to change an animation name or a text color, a programmer must modify the core `BattleManager` or `Game_Map` classes.
- **Poor Scalability:** Adding a new presentation layer (e.g., a simplified 2D renderer, or a combat log that doesn't use floating text) would require adding conditional logic (`if (is3D) { ... }`) inside the core game systems.

**Solution: Semantic, High-Level Events**
The logic layers should emit abstract, semantic events that describe *what happened*, not *how it should be displayed*. The view layers are then responsible for subscribing to these events and translating them into specific visual effects.

*   **Before:** `EventBus.emit('float_text', dmg, target.x, target.y, "#f00");`
*   **After:** `EventBus.emit('damage_dealt', { source, target, amount: dmg, type: 'physical' });`

The `Renderer3D` and `UIManager` would then listen for the `'damage_dealt'` event and decide to play a `'hit'` animation and show red floating text. This fully separates the concerns of the two layers.

---

## 3. Structural Flaws

### 3.1. Monolithic Classes Violating Single Responsibility
**Problem:**
Several key classes have grown into "god objects" that handle far too many responsibilities, violating the Single Responsibility Principle.

*   **`Game_Map`:** This class is responsible for map generation, entity (enemy/loot) management, player movement processing, turn sequencing, and all enemy AI logic.
*   **`BattleManager`:** A single static class that handles damage calculation, complex skill targeting logic, and the application of all status effects.
*   **`UIManager`:** Manages all UI windows, handles keyboard focus, and also contains imperative logic for creating, showing, and handling interactions within multiple different modals (Inventory, Target Select, Confirm).

**Impact:**
- **Low Cohesion:** Code related to disparate features (e.g., map generation and AI) exists in the same file, making it hard to navigate and understand.
- **High Complexity:** Methods like `Game_Map.updateEnemies` and `Game_Map.processTurn` are excessively long and complex, increasing the likelihood of bugs.
- **Difficult to Maintain:** Adding a new feature, such as a new AI behavior, requires modifying a massive, unrelated class, increasing the risk of introducing regressions.

**Solution: Decompose into Smaller, Focused Classes**
Break these monolithic classes down into smaller components with clearly defined responsibilities.

*   **`Game_Map` should be decomposed into:**
    *   `MapGenerator`: Handles the procedural generation of the level layout.
    *   `EntityManager`: Manages collections of enemies and loot on the map.
    *   `TurnManager`: Controls the sequence of turns and calls the appropriate actors.
    *   `AIManager`: Contains different AI strategy classes (`HunterAI`, `PatrolAI`) that can be attached to `Game_Enemy` instances.
*   **`UIManager` should be decomposed into:**
    *   `FocusManager`: Handles keyboard navigation and focus state.
    *   `ModalManager`: A dedicated service for creating and managing modals, preferably using a declarative approach and returning Promises instead of using callbacks.
    *   Individual `Window_` classes should fully encapsulate their own rendering and event handling.

### 3.2. Direct DOM Manipulation in Managers
**Problem:**
Several manager-level classes (`CutsceneManager`, `BanterManager`, `UIManager`) directly create and manipulate HTML DOM elements. The logic for *what* the UI should show is entangled with the logic for *how* it is constructed.

**Impact:**
- **Brittle UI:** The UI is constructed imperatively, making it difficult to refactor, restyle with CSS, or transition to a more robust view framework (like React, Svelte, or Vue) in the future.
- **Mixed Concerns:** `UIManager`'s methods for showing modals mix state management, data formatting, and raw HTML string/element creation, making them hard to test and debug.

**Solution: Adopt a Declarative UI Approach**
Refactor the UI to be more declarative, separating state management from rendering.

*   Enforce the pattern that `Window_` classes are solely responsible for rendering their own view based on the game state.
*   Managers like `UIManager` should only be responsible for managing the state and visibility of these window components.
*   For modals, create a `ModalManager` that can accept a configuration object defining the modal's content and buttons, and it handles the rendering and lifecycle, returning a `Promise` that resolves or rejects based on user interaction.

---

## 4. Moderate Flaws

### 4.1. Inconsistent Class Patterns (Static vs. Instantiated)
**Problem:**
The codebase inconsistently uses static classes and instantiated classes for its "manager" or "service" layers. `BattleManager` and `ItemManager` are static, while `CutsceneManager` and `BanterManager` are instantiated. There is no clear architectural principle guiding this choice.

**Impact:**
- **Architectural Inconsistency:** This makes the overall design pattern of the application unclear and can be confusing for developers.
- **Reduced Testability:** Static classes are harder to mock or replace in a testing environment, which ties back to the global state problem.

**Solution: Standardize on Instantiated Classes**
Adopt a consistent pattern of using instantiable classes for all services. This aligns perfectly with the proposed Dependency Injection solution, as instances of these services can be created by a central initializer and passed as dependencies to the objects that need them.

### 4.2. Hardcoded Configuration and "Magic Numbers"
**Problem:**
Numerous configuration values and magic numbers are hardcoded directly within the logic.

*   `Renderer3D`: Animation timings, camera offsets, and movement speeds are hardcoded in the `animate` method.
*   `Game_Actor`: Starting equipment is hardcoded in the constructor.
*   `Game_Map`: The `sleep` duration for ascending stairs is hardcoded.
*   `ParticleSystem`: Particle counts and life spans are hardcoded.

**Impact:**
- **Difficult to Tune:** Adjusting the game's feel, balance, or presentation requires searching for and changing values scattered across multiple files and complex methods.
- **Code Duplication:** The same value (e.g., an animation duration) might be used in multiple places, requiring multiple changes for a single logical adjustment.

**Solution: Externalize Configuration**
Move all such values into the `CONFIG` object in `data.js` or a new dedicated `config.js` file. This centralizes all tunable parameters, making it easy for a developer or designer to adjust the game's behavior without modifying its core logic.
*   *Example:* `CONFIG.camera.defaultDistance`, `CONFIG.animation.playerMoveDuration`, `CONFIG.actors.Aya.startingWeapon`.
