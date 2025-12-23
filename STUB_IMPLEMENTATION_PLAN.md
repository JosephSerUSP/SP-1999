# Stub Mechanics Implementation Plan

## Overview
This document outlines the areas identified as "stub mechanics" (incomplete or missing implementations) within the codebase and the plan to address them.

## Identified Stubs

### 1. Enemy AI Behaviors
**Location:** `src/objects.js` - `Game_Map.updateEnemies`

*   **Current State:** `hunter`, `ambush`, `turret`, `patrol`, and `flee` behaviors are implemented.
    *   **Turret:** Checks line of sight and range (5) to attack from distance.
    *   **Patrol:** Wanders randomly when not alerted.
    *   **Flee:** Moves away from player when HP < threshold (if configured).
*   **Missing Implementations:**
    *   **Swarm/Explode:** Mentioned in memory but not critical for this pass.

### 2. Skill Logic & Targeting
**Location:** `src/objects.js` - `Game_Map.playerAttack`

*   **Current State:** The `playerAttack` method correctly handles `self` and `all_enemies` skill types by bypassing the directional target search.
*   **Issue:** Resolved.

### 3. Death Handling in Turn Processing
**Location:** `src/objects.js` - `Game_Map.processTurnEnd`

*   **Current State:** A comment explicitly asks `// Handle death if active actor dies?`.
*   **Issue:** If the active actor dies (e.g., from poison damage at end of turn), the game might leave them as the "active" actor until the next user input triggers a rotate, or it might crash/glitch.
*   **Fix:** Check `actor.isDead()` after processing states/poison. If dead, trigger `Game_Party.rotate()` or `SceneManager.gameOver()` immediately.

## Implementation Plan

1.  **Fix `Game_Map.playerAttack`**:
    *   Add check for `skill.type`.
    *   Allow execution without a specific `target` for non-targeted skills.
2.  **Enhance `Game_Map.updateEnemies`**:
    *   Implement `patrol`: Simple random walk if valid move available.
    *   Implement `turret`: Check distance to player. If <= range (e.g. 5), trigger attack animation/damage.
    *   Implement `flee`: If `hp < mhp * 0.3`, invert movement vector.
3.  **Fix Death Handling**:
    *   In `processTurnEnd`, if `actor.isDead()`, force a check for Game Over or Rotation.
