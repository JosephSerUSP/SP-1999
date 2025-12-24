# Stillnight: Eve of the Stack - Master Design Document

## 1. Executive Summary

**Stillnight: Eve of the Stack** is a browser-based, turn-based RPG set in a cyberpunk dystopia ("São Paulo, 1999"). The game features a "Logic-First" architecture, separating simulation from visualization, allowing for a robust and scalable turn-based tactical combat system.

It is currently a **playable prototype** featuring:
*   Three-character party with manual switching (Tag Team mechanic).
*   Grid-based tactical combat with skills, items, and range mechanics.
*   Procedural dungeon generation (BSP and Cellular Automata).
*   3D visualization using Three.js with a retro "pixelated" aesthetic.
*   Modular, event-driven JavaScript codebase.

## 2. Current Architecture

The codebase has been refactored from a monolithic script into a modern, modular architecture.

### 2.1. Module Structure
*   **`src/data.js`**: Static configuration (Skills, Enemies, Classes, Loot).
*   **`src/core.js`**: Core utilities (`EventBus`, `Geometry`, `ConditionSystem`).
*   **`src/managers.js`**: High-level controllers (`SceneManager`, `BattleManager`, `ItemManager`, `BanterManager`).
*   **`src/objects.js`**: Game logic entities (`Game_Map`, `Game_Actor`, `Game_Enemy`).
*   **`src/sprites.js`**: Visualization layer (`Renderer3D` - Three.js).
*   **`src/windows.js`**: Legacy UI Orchestration (`UIManager`).
*   **`src/ui/`**: New Component-based UI Framework (`UIComponent`, `Window_Base`).

### 2.2. Key Patterns
*   **Event-Driven Communication**: `Game_Map` and `BattleManager` emit events (e.g., `play_animation`, `log_updated`, `sync_enemies`) via `EventBus`. `Renderer3D` and `UIManager` subscribe to these events. This ensures logic never directly touches the DOM or Canvas.
*   **Data-Driven Design**: Skills, States, and Enemy AI are defined in `src/data.js`. The logic engine (`BattleManager.applyEffect`, `Game_Enemy.decideAction`) processes these definitions generically.
*   **Unified Map Architecture**: The game uses a single `Game_Map` engine for all 3D environments.

## 3. Gameplay Systems

### 3.1. Combat
*   **Tag Team System**: The player controls a party of 3, but only one is active on the grid at a time. Swapping is a core mechanic (Manual Swap or Forced Swap on Exhaustion).
*   **Stamina (PE)**: Actions cost PE. Inactive members regenerate PE.
*   **Skills**: Defined in `$dataSkills`. Supports various shapes (Line, Cone, Circle) and effects (Damage, Heal, Buff/Debuff).
*   **Enemy AI**: Defined via `aiConfig` in `$dataEnemies`. Supports "Hunter", "Patrol", "Turret", and "Tactical" behaviors.

### 3.2. Exploration
*   **Procedural Generation**: Floors are generated using strategies registered in `$generatorRegistry` (Dungeon/BSP, Cave/Cellular Automata).
*   **Interaction**: "Bumping" into enemies triggers combat. "Bumping" into loot collects it.

### 3.3. User Interface
*   **Hybrid Architecture**: Moving towards a declarative, component-based system (`src/ui/`) while maintaining legacy imperative managers where necessary.
*   **Responsive**: The UI scales to fit the screen while maintaining a fixed internal resolution (960x540).

## 4. Future Development Roadmap

The following features are planned to transition the prototype into a full Campaign RPG.

### 4.1. The "Game Mode" System (Planned)
To support a Narrative Hub and World Map, `SceneManager` will be updated to support distinct modes:
*   **MODE_DUNGEON**: Existing roguelike loop.
*   **MODE_HUB**: "Safe" 3D exploration with NPC interaction.
*   **MODE_WORLD_MAP**: Menu-driven travel system.

### 4.2. Mission System (Planned)
A `$dataMissions` structure will be introduced to define discrete objectives, separating the narrative flow from the procedural generation logic.
*   **Missions**: Will define location parameters, required party members, and cutscene triggers.
*   **Global State**: `$gameSwitches` and `$gameVariables` will track campaign progress.

### 4.3. Narrative Features (Planned)
*   **Visual Novel Interface**: For Hub conversations.
*   **Dynamic VELDT**: Dungeon generation parameters will react to global story flags (e.g., getting harder as the story progresses).

## 5. Coding Standards

*   **Documentation**: All functions and classes must have JSDoc comments.
*   **Verification**: Always use `read_file` to verify changes.
*   **Style**: Use `src/ui/` components for new UI features. Avoid inline styles; use `style.css`.
*   **Logic-First**: Never implement game logic in `src/sprites.js` or `src/ui/`. Logic must reside in `src/objects.js` or `src/managers.js`.
