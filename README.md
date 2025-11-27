# Stillnight: Eve of the Stack

## Overview

**Stillnight: Eve of the Stack** is a browser-based, turn-based dungeon crawler RPG. Players control a squad of three specialized characters—Aya (Detective), Kyle (Trooper), and Eve (Subject)—as they navigate through procedurally generated sectors of a mysterious "stack". The game features tactical combat, resource management, and a 3D visual representation built with Three.js.

## Getting Started

### Prerequisites

*   A modern web browser (Chrome, Firefox, Safari, Edge).
*   An internet connection is required to load external libraries (Three.js and Tailwind CSS).

### Installation

No installation is required. This is a standalone web application contained within a single HTML file.

1.  Clone or download this repository.
2.  Locate the `index.html` file.

### Usage

1.  Open `index.html` in your web browser.
2.  The game will load and initialize automatically.

## Game Controls

*   **Arrow Keys** or **W/A/S/D**: Move the character.
*   **Spacebar**: Wait / Skip turn.
*   **Mouse**: Interact with the UI (select skills, manage inventory, view tooltips).

## Game Mechanics

*   **Exploration**: Navigate through grid-based levels, uncovering the map and finding loot.
*   **Combat**: Turn-based combat. Bump into enemies to attack or use skills from the "TACTICS" menu.
*   **Squad System**: You have three characters with unique stats and skills. Characters rotate automatically or manually.
    *   **Aya**: High speed/utility.
    *   **Kyle**: Defense/crowd control.
    *   **Eve**: High damage magic/PE consumer.
*   **Progression**: Gain EXP to level up, increasing stats. Find better weapons and armor to equip.

## Development

The entire codebase is located in `index.html`. It uses:
*   **Three.js**: For 3D rendering.
*   **Tailwind CSS**: For UI styling.
*   **Vanilla JavaScript**: For game logic.

To modify the game, edit the script section within `index.html`.
