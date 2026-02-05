# 1. Thorough Assessment
> **Note:** This document represents an initial assessment of the prototype. Some features described as "missing" or "issues" have since been implemented or refactored. Character names have been updated to match the current build (Julia, Miguel, Rebus).

## 1.1. What’s already working really well

### Aesthetic & Presentation

The Parasite Eve / PS1 UI vibe is nailed:

*   Multi-window PC-like layout (SQUADRON, TACTICS, MINIMAP, SYSTEM LOG, OPTICAL FEED).
*   CRT/screen-fx overlay, scanlines, vignette, tiny mono font – all coherent.

The 3D map:

*   Instanced floor and wall tiles.
*   Soft fog, low-res render (320×180) scaled up with image-rendering: pixelated.
*   Animated player octahedron + pulsing enemies + spinning loot cubes.

Cinematic touches:

*   Floor 1 intro cutscene overlay with click-to-advance dialog.
*   Ascend animation: zoom-in dolly then rocket-up “soul leaving body” stair flight.
*   Hit sparks, particle bursts, camera shakes, floating damage digits.

### Game Loop & Feel

You’ve got a functioning roguelike-ish floor crawl:

*   Randomly generated rooms + tunnels, with a stairs room and start room.
*   Enemies seeded across the floor, loot sprinkled from a robust loot table.
*   Stairs advance to a harder floor; floor config scales size, enemies, loot.

Turn structure is clear:

*   Player action → party rotates → enemies get a move → visuals update.
*   Enemies only move when the player takes a turn (classic roguelike tempo).

Combat feel:

*   Bump-to-attack in 3D with lunge, hit flash, particles, camera shake, numbers.
*   Damage formula uses ATK vs DEF with random variation, minimum 1.
*   Enemies can also hit back during their phase, targeting the active actor.

### Party & Progression

Three clearly distinct characters in data:

*   **Julia (Agent)**: mid HP, higher PE, ranged skills (rapid, scan, snipe).
*   **Miguel (Analyst)**: tankier, lower PE, explosive / barrier kit (blast, barrier, stun).
*   **Rebus (Entity)**: glass cannon PE monster (combust, drain, nuke, heal).

Leveling works:

*   EXP awarded on enemy death (exp per enemy).
*   The active member gets full EXP, others get 50% if alive.
*   Level up: +1 ATK, +5 max HP, refill HP, nextExp scales.

Loot & inventory:

*   Weapons, armors, and items pulled from a data-driven loot table.
*   Prefix system for weapons (Rusty, Polished, Ancient, etc.) with ATK mods.
*   Shared inventory with max capacity & auto “Got X” logging.
*   Gear comparison preview (ATK/DEF diff color-coded in target select).
*   Equipping swaps old gear back into inventory.

### UI/UX Systems

SQUADRON window:

*   HP bar (color-coded by health), PE bar, EXP strip.
*   Active member highlighted, clickable to open detailed Status modal.

TACTICS window:

*   Wait, Item, and dynamic skill list for current active member.
*   Skill buttons show cost, hover tooltip, and live range highlights on the map.

MINIMAP:

*   Drawn from actual map tiles: walls, stairs, enemies, player.

SYSTEM LOG:

*   Scroll of recent events, with fadeout of older lines.

Overall: this build already feels like a real game slice, not a toy. The fantasy (Parasite Eve-style tactical crawl with PE powers) is communicated through data, UI, and camera behavior.

## 1.2. Design gaps / incomplete features (addressed in recent updates)

*The following features have been implemented or refactored since the initial assessment:*

**Skills:**
*   `scan`, `barrier`, `heal`, and `stun` (state) are now fully implemented in `BattleManager` and `src/data.js`.

**Item types:**
*   Items with type `cure` are now handled in `Window_Inventory`.
*   Status effect system (Poison, Stun, Barrier) is implemented.

**Enemy data:**
*   Enemy HP is still formula-driven (`10 + floor * 2`), but `aiConfig` now drives behavior properly.
*   Turrets and other behaviors utilize `decideAction` to perform ranged attacks and skills.

## 1.3. Mechanical / feel issues (addressed in recent updates)

**Party rotation semantics:**
*   The "cycle every turn" mechanic has been removed. Rotation is now either manual (`Q`/`E`) or forced upon Exhaustion/Death, allowing for more strategic positioning.

**Skill timing:**
*   `Game_Map.processTurn` and `BattleManager.executeSkill` interactions have been synchronized via `await` in the async turn loop.

## 1.4. Technical & architectural notes

The codebase has been refactored into a modular structure (`src/objects.js`, `src/managers.js`, `src/ui/`, etc.) to address previous monolithic concerns.

*   **Data:** `src/data.js`
*   **Model:** `src/objects.js`
*   **Logic:** `src/managers.js`
*   **View:** `src/sprites.js` and `src/ui/`
