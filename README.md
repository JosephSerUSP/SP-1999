# Stillnight: Eve of the Stack

## Overview

**Stillnight: Eve of the Stack** is a browser-based, turn-based dungeon crawler RPG. Players control a squad of three specialized characters—Julia (Agent), Miguel (Analyst), and Rebus (Entity)—as they navigate through procedurally generated sectors of a mysterious "stack". The game features tactical combat, resource management, and a unique 3D visual representation built with Three.js.

## Getting Started

### Prerequisites

*   A modern web browser (Chrome, Firefox, Safari, Edge).
*   An internet connection is required to load external libraries (Three.js and Tailwind CSS).

### Installation & Usage

1.  **Download:** Clone or download this repository.
2.  **Run:** Open `index.html` in your web browser. No build process or local server is strictly required, though a local server (e.g., VS Code Live Server) is recommended for best performance.

## Game Controls

*   **Arrow Keys** or **W/A/S/D**: Move the character.
*   **Space**, **Enter**, or **Z**: Confirm / Open Command Menu.
*   **Esc**, **X**, or **Backspace**: Cancel / Close Menu.
*   **C**: Open Status Menu.
*   **Tab** or **M**: Toggle Minimap.
*   **Q/E**: Swap active character.
*   **Shift** or **V**: Cycle targets (in targeting mode).
*   **Mouse**: Interact with the UI (select skills, manage inventory, view tooltips).

## Architecture

The codebase has been refactored from a monolithic prototype into a modular architecture inspired by RPG Maker MZ's structure, with a modern UI component framework.

### Module Structure (`src/`)

*   **`data.js`**: Contains static configuration data (`CONFIG`), game database objects (`$dataSkills`, `$dataClasses`, `$dataEnemies`), and constant definitions (`EFFECT_*`, `TRAIT_*`).
*   **`core.js`**: Contains core utility classes that define the engine's backbone, such as `EventBus` (for decoupling logic and view), `ConditionSystem`, and `Sequencer`.
*   **`managers.js`**: Static classes that manage high-level game logic and systems (`BattleManager`, `ItemManager`, `CutsceneManager`).
*   **`objects.js`**: The "Model" layer. Classes representing game entities (`Game_Actor`, `Game_Enemy`, `Game_Map`, `Game_System`). These hold state and business logic.
*   **`sprites.js`**: The "View" layer for the 3D world. Contains `Renderer3D` (Three.js logic) and `ParticleSystem`.
*   **`windows.js`**: The legacy UI manager and wrappers. Contains `UIManager`.
*   **`ui/`**: The new UI component framework. Contains `Window_Base` and specific window implementations (`Window_Inventory`, `Window_Tactics`, etc.).
*   **`main.js`**: The entry point. Bootstraps the application, handles window resizing, and contains the `SceneManager`.
*   **`input.js`**: Handles keyboard and gamepad input mapping.

### Key Design Patterns

*   **Event-Driven Architecture**: The Game Logic (Objects/Managers) is decoupled from the Presentation (Sprites/Windows) using an `EventBus`. The logic layer emits events (e.g., `play_animation`, `refresh_ui`) which the view layer subscribes to.
*   **Data-Driven Skills**: Skills are defined in `$dataSkills` using a generic `effects` array, processed by `BattleManager.applyEffect`, allowing for flexible skill creation without hardcoding logic.
*   **Component-Based UI**: The user interface is built using a lightweight component system in `src/ui/`, allowing for modular and reusable UI elements.

## Development

To modify the game:
1.  Edit the files in `src/`.
2.  Refresh `index.html` to see changes.
3.  Ensure you follow the established module dependencies (Data -> Core -> Managers -> Objects -> Sprites -> Windows -> Main).

## Game Mechanics

*   **Exploration**: Navigate grid-based levels. Movement consumes **Stamina**.
*   **Combat**: Turn-based. Bump enemies to attack (consumes **Stamina**). Use skills from the menu (consumes **PE** and **Stamina**).
*   **Squad System**: Rotate between three characters with unique stats and skills.
    *   **Julia**: High speed/utility (Agent).
    *   **Miguel**: Defense/crowd control (Analyst).
    *   **Rebus**: High damage magic/PE consumer (Entity).
*   **Progression**: Gain EXP to level up. Find loot to equip.
