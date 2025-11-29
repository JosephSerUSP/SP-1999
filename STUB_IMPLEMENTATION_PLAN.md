# Stub Mechanics Implementation Plan

## Overview
This document outlines the areas identified as "stub mechanics" (incomplete or missing implementations) within the codebase and the plan to address them.

## Identified Stubs

### 1. Enemy AI Behaviors
**Location:** `src/objects.js` - `Game_Map.updateEnemies`

*   **Current State:** Only `hunter` and `ambush` AI types are implemented. They share identical logic (move towards player if alerted).
*   **Missing Implementations:**
    *   **Turret:** Defined in `$dataEnemies` (e.g., "Watcher"). Should be stationary but attack from a distance. Currently does nothing.
    *   **Patrol:** Defined in `$dataEnemies` (e.g., "Ooze"). Should wander or move between points when not alerted. Currently does nothing.
    *   **Flee:** Logic mentioned in memory (`flee_if_hurt`) but not present. Enemies should retreat when HP is critical.
    *   **Swarm/Explode:** Mentioned in memory but not critical for this pass.

### 2. Skill Logic & Targeting
**Location:** `src/objects.js` - `Game_Map.playerAttack`

*   **Current State:** The `playerAttack` method assumes a directional attack (melee or line). It attempts to find a target *before* executing the skill.
*   **Issue:** Skills with `type: 'self'` (e.g., Heal, Scan) or `type: 'all_enemies'` (e.g., Blast, Combust) fail because `playerAttack` looks for a target in the facing direction. If none is found, it logs a "miss" and aborts, preventing the skill from triggering `BattleManager.executeSkill`.
*   **Fix:** Refactor `playerAttack` to check `skill.type`. If it is `self` or `all_enemies`, bypass the target search and call `BattleManager` directly.

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
