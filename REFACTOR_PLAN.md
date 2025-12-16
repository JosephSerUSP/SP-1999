# Deep Refactor Plan: Stillnight Engine

## Executive Summary
This document outlines the strategic refactoring plan to transform "Stillnight: Eve of the Stack" into a powerful, data-driven dungeon crawler engine. The focus is on decoupling procedural content generation, narrative logic, and entity behaviors from the core game loop, enabling rapid content expansion and robust storytelling capabilities.

## Phase 1: Procedural Content Engine (PCG)

**Goal:** Decouple map generation from `Game_Map` state management to support multiple generation algorithms (Dungeon, Cavern, Prefab) driven by data.

### 1.1. Architecture
*   **`MapGenerator` Interface:** A strategy pattern for generating tile grids, entity placements, and interactables.
*   **`GeneratorRegistry`:** A factory to retrieve generators by ID (e.g., 'bsp_dungeon', 'cellular_caves').
*   **Data Structure:** Extend `$dataFloors` to include generation config:
    ```javascript
    {
        generator: "bsp_dungeon",
        width: 60,
        height: 60,
        biomes: ["industrial_hall", "maintenance_tunnel"],
        density: 0.4
    }
    ```

### 1.2. Implementation Steps
1.  Extract current `setup` logic from `src/objects.js` into `src/generators/StandardDungeon.js`.
2.  Create `Game_Map.generate(floorId)` which delegates to the configured generator.
3.  Implement a `CellularAutomataGenerator` for organic "Cave" levels (e.g., "The Sewers").

## Phase 2: Narrative Event System

**Goal:** Replace the simple `BanterManager` with a robust `StoryEngine` capable of complex event chains, quests, and state persistence.

### 2.1. Architecture
*   **`StoryManager`:** Manages global flags (`$gameVariables`, `$gameSwitches`) and evaluates event triggers.
*   **Event Definition Schema:** JSON-based event definitions.
    ```javascript
    "event_001": {
        trigger: "enter_region",
        region: { x: 10, y: 10, r: 5 },
        condition: "var.intro_complete == true",
        sequence: [
            { type: "dialog", speaker: "Kyle", text: "Watch out!" },
            { type: "spawn_enemy", id: "boss_rat", x: 12, y: 12 },
            { type: "set_switch", id: "boss_fight_active", value: true }
        ]
    }
    ```
*   **Interaction System:** Standardize "Interactions" (Loot, NPCs, Terminals) into a unified interface handled by `StoryManager`.

### 2.2. Implementation Steps
1.  Create `src/story/StoryManager.js`.
2.  Define `Game_Event` class for map objects that aren't enemies or simple loot.
3.  Migrate `CutsceneManager` logic into the new generalized `StoryManager`.

## Phase 3: Modular Entity AI (Hybrid ECS)

**Goal:** Decouple Enemy AI from `Game_Map.updateEnemies` to allow for complex, composable behaviors defined in data.

### 3.1. Architecture
*   **`BehaviorSystem`:** A system that processes entities with `AIComponent`.
*   **Components:**
    *   `AIComponent`: Defines behavior tree or state machine (e.g., `{ type: "aggressor", range: 5 }`).
    *   `StatsComponent`: HP, PE, ATK, DEF.
*   **Data Definition:**
    ```javascript
    "drone_mk2": {
        name: "Attack Drone",
        components: {
            ai: { type: "flank", preferred_dist: 3 },
            stats: { hp: 20, atk: 5 }
        }
    }
    ```

### 3.2. Implementation Steps
1.  Refactor `Game_Enemy` to hold an `ai` property that references a behavior function/object, not just a string.
2.  Create `src/ai/Behaviors.js` containing logic for `Hunt`, `Flee`, `Patrol`, `Turret`.
3.  Update `Game_Map` to delegate enemy updates to `BehaviorSystem.update(enemy)`.

## Phase 4: Data Centralization & Modding API

**Goal:** Move hardcoded data from `src/data.js` into distinct JSON structures (simulated or real) and create a `DataManager` to handle loading and referencing.

### 4.1. Architecture
*   **`DataManager`:** Handles loading, parsing, and caching of game data.
*   **Resource Management:** Support for dynamic asset loading (even if simulated via separate JS files for now).

### 4.2. Implementation Steps
1.  Split `src/data.js` into `data/items.js`, `data/enemies.js`, `data/skills.js`.
2.  Implement ID-based lookups (`$dataItems.get('m92f')`) instead of array indexing where appropriate.

## Roadmap

1.  **Phase 1 (Immediate):** Refactor Map Generation to establish the pattern.
2.  **Phase 2:** Implement Story Engine basics to replace current Cutscene hardcoding.
3.  **Phase 3:** Refactor AI when adding new enemy types.
4.  **Phase 4:** Continuous migration of data.
