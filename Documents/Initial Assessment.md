1. Thorough Assessment
1.1. What’s already working really well

Aesthetic & Presentation

The Parasite Eve / PS1 UI vibe is nailed:

Multi-window PC-like layout (SQUADRON, TACTICS, MINIMAP, SYSTEM LOG, OPTICAL FEED).

CRT/screen-fx overlay, scanlines, vignette, tiny mono font – all coherent.

The 3D map:

Instanced floor and wall tiles.

Soft fog, low-res render (320×180) scaled up with image-rendering: pixelated.

Animated player octahedron + pulsing enemies + spinning loot cubes.

Cinematic touches:

Floor 1 intro cutscene overlay with click-to-advance dialog.

Ascend animation: zoom-in dolly then rocket-up “soul leaving body” stair flight.

Hit sparks, particle bursts, camera shakes, floating damage digits.

Game Loop & Feel

You’ve got a functioning roguelike-ish floor crawl:

Randomly generated rooms + tunnels, with a stairs room and start room.

Enemies seeded across the floor, loot sprinkled from a robust loot table.

Stairs advance to a harder floor; floor config scales size, enemies, loot.

Turn structure is clear:

Player action → party rotates → enemies get a move → visuals update.

Enemies only move when the player takes a turn (classic roguelike tempo).

Combat feel:

Bump-to-attack in 3D with lunge, hit flash, particles, camera shake, numbers.

Damage formula uses ATK vs DEF with random variation, minimum 1.

Enemies can also hit back during their phase, targeting the active actor.

Party & Progression

Three clearly distinct characters in data:

Aya: mid HP, higher PE, ranged skills (rapid, scan, snipe).

Kyle: tankier, lower PE, explosive / barrier kit (blast, barrier, stun).

Eve: glass cannon PE monster (combust, drain, nuke, heal).

Leveling works:

EXP awarded on enemy death (exp per enemy).

The active member gets full EXP, others get 50% if alive.

Level up: +1 ATK, +5 max HP, refill HP, nextExp scales.

Loot & inventory:

Weapons, armors, and items pulled from a data-driven loot table.

Prefix system for weapons (Rusty, Polished, Ancient, etc.) with ATK mods.

Shared inventory with max capacity & auto “Got X” logging.

Gear comparison preview (ATK/DEF diff color-coded in target select).

Equipping swaps old gear back into inventory.

UI/UX Systems

SQUADRON window:

HP bar (color-coded by health), PE bar, EXP strip.

Active member highlighted, clickable to open detailed Status modal.

TACTICS window:

Wait, Item, and dynamic skill list for current active member.

Skill buttons show cost, hover tooltip, and live range highlights on the map.

MINIMAP:

Drawn from actual map tiles: walls, stairs, enemies, player.

SYSTEM LOG:

Scroll of recent events, with fadeout of older lines.

Overall: this build already feels like a real game slice, not a toy. The fantasy (Parasite Eve-style tactical crawl with PE powers) is communicated through data, UI, and camera behavior.

1.2. Design gaps / incomplete features (from code)

These are features hinted at in data or UI that aren’t fully wired mechanically yet:

Skills not fully implemented:

scan (type: self, intended to “reveal map/sector layout”) has no behavior in BattleManager.executeSkill.

barrier (DEF buff) also has no behavior.

heal is defined as type: "self", fixed: true, power: 30 but executeSkill does not handle self-target skills – so it currently just consumes PE and does nothing.

stun mentions “Chance to stun” but there is no status system or stun logic.

Item types not fully used:

Items with type: "cure" (Antidote) are never handled in useConsumable.

There’s no poison or status effect system yet.

Enemy data not fully used:

$dataEnemies[*].hp exists but spawn uses 10 + floor*2, overriding that value. Enemy HP is generic per floor, not per enemy type.

AI variants (hunter, patrol, ambush, turret) are mostly cosmetic:

Only hunter and ambush get directional movement toward the player.

patrol & turret effectively just stand still and attack if overlapped; no patrol pattern or turret range/LOS logic yet.

So from a player expectation vs reality standpoint: the UI text is promising more depth than the underlying systems currently provide.

1.3. Mechanical / feel issues

Skill timing vs turns

Skill use flow right now:

Clicking a skill:

Calls $gameMap.processTurn(0,0) (a “wait” step: party rotates and enemies act).

Then as a separate thing calls BattleManager.executeSkill(actor, k) without setting isBusy or blocking movement.

processTurn doesn’t use the callback that’s passed.

Result:

Using a skill advances the global turn (party rotates, enemies can step/attack),

Then the skill fires slightly “out of band”.

While the skill animates, you can still move because input is gated by isBusy (false here) and Renderer.isAnimating (only tied to movement, not skill animations).

It works visually, but from a systemic perspective skills are half outside the turn system. That’s important if you later want rigorous roguelike timing.

Party rotation semantics

Every action – movement, bump attack, wait, using an item via inventory – rotates the active slot.

However, skill casting uses the actor captured at UI build time:

When you click a skill, processTurn(0,0) rotates the party, but the skill still uses the previous front character as caster (the captured actor variable).

So the SQUADRON highlight may shift before/while the skill plays, but the original actor is actually performing it.

This is subtle, but can feel odd once formation / tactical positioning is more visible.

Enemies & pressure

Enemy AI:

Move straight toward the player when within Manhattan distance < 7 (for hunter/ambush).

They attack only when they step into the player’s tile.

Combined with map generation:

It creates basic but not especially varied pressure: “kiting” and door play isn’t formalized, and there are no distinct enemy behaviors beyond “walk at you and bonk”.

There’s no concept of enemy skills, telegraphs, or ranged attacks yet.

Run structure

Floors increase in size, enemy count, loot count, and enemy HP via floor parameter.

There’s no:

Bosses.

Clear “goal” floor.

Meta-progress (runs just advance indefinitely until party wipes).

So the current build is a solid dungeon-crawl sandbox, not yet a full “run” structure.

1.4. Technical & architectural notes (very short; full doc below)

The file is monolithic but conceptually split:

Data tables ($dataSkills, $dataClasses, $dataEnemies, loot/floor/cutscene tables).

Core game model (Game_Actor, Game_Enemy, Game_Party, Game_Map).

Managers (BattleManager, ItemManager, CutsceneManager, SceneManager).

Presentation (Renderer3D, ParticleSystem, window UI system).

Good signs:

Data is already mostly declarative.

Renderer is 3D-only and doesn’t know about UI.

UI manipulates $gameParty, $gameMap, $gameSystem, but not Three.js directly.

Rough edges:

Global singletons everywhere ($gameSystem, $gameParty, $gameMap, Renderer, UI, Cutscene).

No explicit scene stack or window manager stack – you’re manually managing overlays with z-index and flags.

Turn logic is distributed between SceneManager.loop, Game_Map.processTurn, BattleManager.executeSkill, UIManager.

The next two sections formalize this into two clean docs you can reuse.

1.5. Current Status (Audited)

Recent audits have addressed several issues identified in the initial assessment:

*   **Character Names**: Standardized to Julia, Miguel, and Rebus across all data and documentation.
*   **Skill Implementation**: `scan`, `barrier`, and `heal` are now fully implemented via `BattleManager.applyEffect` and `$dataSkills`.
*   **Status Effects**: Basic support for Barrier, Stun, and Poison has been implemented.
*   **Turn Logic**: `Game_Map.processTurn` now correctly awaits action callbacks, fixing the "out of band" skill execution and synchronization issues.
