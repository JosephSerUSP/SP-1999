# Documentation Audit Report

## Executive Summary
This audit compares the current codebase state against existing documentation (`README.md`, `GAME_DESIGN.md`, `ARCHITECTURAL_DEEP_DIVE.md`). Several discrepancies were found regarding resource management terminology (PE vs. Stamina), module organization, and architectural states.

## Inconsistencies & Drift

### 1. Resource Management Terminology (`GAME_DESIGN.md`)
*   **Documentation Claim:** "Every action (Move, Attack, Skill) costs **PE** (Power Energy)... If a character's PE reaches 0, they become Exhausted."
*   **Code Reality (`src/objects.js`):** The game implements **two separate resources**:
    *   **Stamina (Max 1000):** Consumed by movement (10) and actions (20). Reaching 0 triggers "Exhaustion" and forced swapping.
    *   **PE (Power Energy, Max ~100):** Consumed specifically by Skills. Does *not* trigger exhaustion.
*   **Impact:** The design document fundamentally misrepresents the core swap mechanic by conflating the "Mana" stat (PE) with the "Fatigue" stat (Stamina).

### 2. Module Structure (`README.md`)
*   **Documentation Claim:** Lists `SceneManager` under `managers.js`.
*   **Code Reality:** `SceneManager` is located in `main.js`.
*   **Documentation Claim:** Does not list `Game_System` location.
*   **Code Reality:** `Game_System` resides in `objects.js` but acts as a global state manager.

### 3. Turn Structure (`GAME_DESIGN.md`)
*   **Documentation Claim:** Simple "Player Phase -> Enemy Phase" loop.
*   **Code Reality (`Game_Map.updateEnemies`):** Implements a distinct **Three-Phase** enemy turn:
    1.  **Planning:** All enemies decide actions and moves simultaneously.
    2.  **Visualization:** Enemy movement animations play in sync (`sync_enemies`).
    3.  **Execution:** Attacks and skills execute sequentially.

### 4. Architectural Status (`ARCHITECTURAL_DEEP_DIVE.md`)
*   **Observation:** This document outlines features (`Game_Mode`, `Mission` system, `Hub` logic) that are **not present** in the codebase.
*   **Verdict:** This is a Roadmap/Proposal document, but it is not labeled as such, creating confusion about the current feature set.

## Deprecations Flagged

*   **`Game_Map.playerAttack`**: Deprecated and removed. Logic is now handled inline within `Game_Map.processTurn` via `BattleManager.executeSkill`.
*   **Legacy AI (`turret`)**: Code contains `// LEGACY MOVEMENT MAPPING` comments in `Game_Map.updateEnemies`, indicating the `turret` behavior is a holdover.

## Action Plan
1.  **Correction:** Rewrite `GAME_DESIGN.md` "Tag Team Mechanic" section to accurately distinguish Stamina and PE.
2.  **Correction:** Update `README.md` module descriptions.
3.  **Clarification:** Add a "Roadmap/Proposal" disclaimer header to `ARCHITECTURAL_DEEP_DIVE.md`.
