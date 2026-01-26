# Documentation Audit

## Overview
This document tracks inconsistencies between the documentation and the actual codebase, specifically targeting `Documents/Architecture Document.md` and inline comments.

## Discrepancies Identified

### 1. Architectural Structure
*   **Documentation (`Architecture Document.md`):** claims "All code lives in one <script> in the HTML" (Single-File Build).
*   **Codebase:** The project is modular, organized into `src/` with files like `core.js`, `managers.js`, `objects.js`, `windows.js`, and `ui/`.
*   **Action:** Update documentation to reflect the modular architecture.

### 2. Runtime Game Objects
*   **Game_Actor:**
    *   **Doc:** Mentions `regenPE()` and `nextExp *= 1.5`.
    *   **Code:** `regenPE` is removed. PE is restored via items or specific effects. `nextExp` uses `Math.floor(this.nextExp*1.5)`. The code also includes a Stamina system (`payStamina`, `checkExhaustionSwap`) which is not documented.
    *   **Action:** Remove `regenPE`, correct `nextExp`, and document the Stamina/Exhaustion system.
*   **Game_Map:**
    *   **Doc:** `processTurn` description implies a simpler synchronous flow. `updateEnemies` is described as "async but currently synchronous".
    *   **Code:** `processTurn` handles async actions, stamina costs, and targeting states. `updateEnemies` is fully async (awaits `BattleManager.executeSkill` and `Sequencer.sleep`).
    *   **Action:** Update descriptions to reflect async nature and complexity.
*   **Game_Party:**
    *   **Doc:** `rotate` used for forced rotation.
    *   **Code:** `rotate` is indeed used for forced rotation on death, but `cycleActive` is used for manual rotation.
    *   **Action:** Clarify the distinction.

### 3. Managers & Utilities
*   **BattleManager:**
    *   **Doc:** Does not explicitly state `executeSkill` is async.
    *   **Code:** `executeSkill` is async and handles animations/pauses.
    *   **Action:** Mark methods as async.
*   **BanterManager:**
    *   **Doc:** Not detailed.
    *   **Code:** Features a complex system with priority queues, cooldowns (global, trigger, actor), and conversational threads (replies).
    *   **Action:** Add a section detailing `BanterManager`.

### 4. UI Layer
*   **Architecture:**
    *   **Doc:** Describes a legacy imperative modal system and claims UI uses "CSS + DOM (no canvas)".
    *   **Code:** Uses a Component-Based UI Framework (`UIComponent`, `UIContainer`, `Window_Base`). `Window_Minimap` uses an HTML Canvas.
    *   **Action:** Rewrite UI section to describe the component system and correct the canvas usage.
*   **Modals:**
    *   **Doc:** Describes `showInventoryModal` and `equipGear` as standalone methods with specific logic.
    *   **Code:** `showInventoryModal` instantiates a `Window_Inventory` which handles its own logic.
    *   **Action:** Update to refer to Window classes.

### 5. Scene & Input Management
*   **Game Loop:**
    *   **Doc:** Simplified loop description.
    *   **Code:** `SceneManager.loop` includes `BanterManager.update()` and specific input priority (UI -> Targeting -> Gameplay).
    *   **Action:** detailed loop description.

## Deprecations Flagged
*   **Imperative UI Construction:** The documentation describes creating modals imperatively (e.g., `createModal`). The codebase uses class-based windows (`Window_Base`).
*   **Single-File Build:** The entire concept of a single-file build is deprecated and replaced by the modular `src/` structure.
*   **Synchronous Enemy Updates:** The concept of synchronous enemy updates is obsolete.

## Summary of Changes
The `Architecture Document.md` will be significantly rewritten to align with the current modular, async, and component-based architecture of the engine. Inline comments in `src/objects.js` will be updated to reflect the async reality of `updateEnemies`.
