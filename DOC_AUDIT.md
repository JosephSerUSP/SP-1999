# Documentation Audit Report

## Executive Summary

An audit of the documentation (`README.md`, `Documents/*.md`) against the codebase (`src/*.js`) was performed. Significant discrepancies were found regarding the Core Gameplay Loop (Turn Rotation vs Stamina System) and the UI Architecture. These have been corrected to reflect the current implementation.

## Key Discrepancies & Actions Taken

### 1. Core Gameplay Loop: Rotation vs. Stamina
- **Issue:** Documentation claimed that the active party member rotates automatically after every action ("The active member cycles with every action").
- **Reality:** The codebase implements a **Stamina System**. Characters spend Stamina to move or act. Swapping only occurs manually by the player or automatically upon **Exhaustion** (Stamina = 0) or Death.
- **Action:** Updated `Documents/Design Document.md`, `Documents/Architecture Document.md`, and `README.md` to describe the Stamina/Exhaustion mechanic accurately.

### 2. UI Architecture & Deprecations
- **Issue:** Documentation referred to deprecated imperative methods in `UIManager` (`showTargetSelectModal`, `showConfirmModal`) and lacked detail on the Component-Based Architecture.
- **Reality:** The project has moved to a component system in `src/ui/`. Windows like `Window_Inventory` and `Window_Status` handle their own logic. `Window_Minimap` renders via Canvas.
- **Action:** Updated `Documents/Architecture Document.md` to remove deprecated methods and point to `src/ui/windows/` for specific window implementations.

### 3. File Structure & Module Locations
- **Issue:** Minor inaccuracies regarding where specific classes lived (e.g., `ConditionSystem`, `BanterManager`).
- **Reality:** `ConditionSystem` is in `src/core.js`. `BanterManager` is in `src/managers.js`.
- **Action:** Updated the "Module Structure" sections in `README.md` and `Architecture Document.md`.

### 4. Feature Implementation Status
- **Issue:** `Documents/Design Document.md` listed features like Scan, Heal, and Stun as "Stubbed".
- **Reality:** These features are implemented via `BattleManager.applyEffect`, `EFFECT_SCAN_MAP`, and `TRAIT_RESTRICTION`.
- **Action:** Updated the status to "Implemented".

## Diffs & Files Modified

*   `Documents/Architecture Document.md`: Major rewrite of Game_Map logic and UIManager section.
*   `Documents/Design Document.md`: Adjusted "Core Gameplay Loop", "Turn Structure", and "Implemented Behaviors".
*   `README.md`: Updated "Squad System" description.
