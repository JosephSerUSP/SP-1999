# Documentation Audit Report

## Executive Summary
A comprehensive audit was conducted to align documentation (`README.md`, `GAME_DESIGN.md`) and inline comments with the actual codebase logic. Several discrepancies were identified regarding character names, resource management (Stamina vs PE), and architectural structure.

## Summary of Changes

### 1. `README.md` Updates
*   **Characters:** Updated obsolete references (Aya, Kyle, Eve) to current roster (**Julia, Miguel, Rebus**) with correct roles.
*   **Controls:** Corrected input mappings to match `InputManager` logic (Space/Enter opens Menu, not Wait; added Map toggle).
*   **Architecture:**
    *   Corrected `SceneManager` location (from `managers.js` to `main.js`).
    *   Added documentation for `src/ui/` (New Component Framework).
    *   Clarified `windows.js` role as legacy/wrapper.

### 2. `GAME_DESIGN.md` Updates
*   **Resource Systems:** Clarified the strict separation between **Stamina** (Movement/Actions, regenerates) and **PE** (Skills, does not auto-regenerate).
*   **Action Costs:** Updated costs to reflect `Game_Map.processTurn` logic:
    *   Move: 10 Stamina.
    *   Action/Bump: 20 Stamina.
    *   Skills: PE Cost + 20 Stamina.
*   **Regeneration:** Corrected the claim that inactive members regenerate PE; they only regenerate Stamina.

### 3. Code Annotation & Deprecations
*   **`src/objects.js`**: Marked `Game_Actor.regenPE()` as `@deprecated` (unused/dead code).
*   **`src/windows.js`**: Updated comments for `showTargetSelectModal` and `showConfirmModal` to explicitly warn against use in favor of the Component Framework.
*   **`src/data.js`**: Added a note to `$dataFloors` clarifying that `boss` and `texture` properties are defined in design but not currently implemented in the generator.

## Identified Inconsistencies (No Action Taken)
*   **Cutscene Styling:** Documentation/Memory suggests `CutsceneManager` uses CSS classes (`.cutscene-header`, etc.), but actual code uses inline styles. This represents a technical debt item rather than a documentation error.
*   **Default Attack Skill:** Memory references a default skill ID of `'attack'`, but the codebase uses `'melee'`.
*   **Turret Logic:** `Game_Enemy` uses hardcoded legacy logic for 'turret' behavior despite `aiConfig` architectural goals.

## Status
Documentation is now aligned with the current state of the repository.
