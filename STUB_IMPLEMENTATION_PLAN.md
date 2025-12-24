# Stub Mechanics Implementation Plan

## Overview
This document previously outlined areas identified as "stub mechanics".
As of the latest maintenance pass, the critical identified stubs have been implemented.

## Completed Implementations

### 1. Enemy AI Behaviors
**Location:** `src/objects.js` - `Game_Map.updateEnemies`

*   `turret`: Implemented. Checks line of sight and range to attack from distance.
*   `patrol`: Implemented. Wanders randomly when not alerted.
*   `flee`: Implemented. Moves away from player when HP < threshold (if configured).

### 2. Skill Logic & Targeting
**Location:** `src/objects.js` - `Game_Map.playerAttack`

*   `playerAttack` method correctly handles `self` and `all_enemies` skill types.

### 3. Death Handling in Turn Processing
**Location:** `src/objects.js` - `Game_Map.processTurnEnd`

*   `processTurnEnd` correctly checks `$gameParty.active().isDead()` and triggers `$gameParty.rotate()` or Game Over.

## Remaining / Future Work

*   **Swarm/Explode AI:** Mentioned in early design docs but not currently prioritized.
*   **Complex Mission System:** Full mission structure (Objectives, Rewards) is still a prototype in `MissionManager`.
