2. Game Design Document — “Stillnight: Eve of the Stack” (Current Build)
2.1. Overview

Title: Stillnight: Eve of the Stack
Platform: Browser (HTML/JS, Three.js)
Genre:

Floor-based dungeon crawler

Turn-based roguelike movement (1 step = 1 “turn”)

Inline bump-combat with active skills and PE resource

Aesthetic & Mood:

Late-90s Atlus / Parasite Eve-style techno-occult.

Dark industrial “stack” of subterranean sectors.

UI is a PC-98 / Windows-like control center with multiple monitors and logs.

Combat and exploration are integrated into a single 3D tactical view.

2.2. Core Fantasy & Pillars

Core Fantasy

You command a small squad descending into a hostile underground complex (“the stack”), using bio-energy (“PE”) and improvised weapons to survive swarms of mutants and abominations. You navigate in tight corridors, read a tactical HUD, and make deliberate moves knowing the enemy acts every time you do.

Pillars

Tactical Step-Based Exploration
Every move is deliberate. Enemies advance only when you act.

Three-Member PE Squad
Aya, Kyle, and Eve each bring distinct stats and skills, and the active frontliner rotates with every action.

PE-Powered Skills vs Scarcity
Skills are powerful but consume a shared PE resource per character; items are limited, making resource management central.

Data-Driven Combat & Loot
Skills, enemies, loot, and floors are defined in data tables, enabling expansion of the content without rewriting core systems.

Atmosphere Through UI & Camera
The experience leans heavily on UI framing, logs, minimap, and cinematic camera movements to sell mood.

2.3. Player Role & Party

Player Role:

Commander of the squad; decides movement direction, waits, uses items, and triggers skills for the current active member.

Party

Aya Brea (“Aya”)

Job: Detective

Role: Mid-range attacker, PE utility.

Base stats: HP 45, ATK 4, DEF 2, PE 40.

Skills: rapid (Rapid Fire), scan (intel), snipe (high-power single shot).

Kyle

Job: Trooper

Role: Frontliner / bruiser.

Base stats: HP 70, ATK 3, DEF 4, PE 20.

Skills: blast (Grenade), barrier (def buff), stun (melee baton).

Eve

Job: Subject

Role: Glass cannon PE caster.

Base stats: HP 35, ATK 6, DEF 1, PE 80.

Skills: combust (AoE fire), drain (damage + self heal), nuke (massive AoE), heal (self heal – currently not implemented).

Each member has:

Level, EXP, nextExp.

Max HP (mhp) and current HP (hp).

Max PE (mpe), current PE (pe).

Equipment: one weapon, one armor.

Color used for UI and the player 3D mesh when they’re active.

2.4. Controls

Keyboard

Arrow keys or WASD: Move one tile (up/down/left/right).

Space bar: Wait (advance time without moving).

Mouse

Click party member in the SQUADRON window: open status modal.

TACTICS window:

Click “WAIT”: Wait one turn (same as Space).

Click “ITEM”: Open shared inventory.

Click a skill: Trigger that skill for the currently displayed actor.

Hover shows tooltip with description.

Hover also shows range overlay in 3D view.

In modals:

Clicking items, actors, buttons etc. as indicated.

2.5. Core Loop

Floor-Level Loop

Spawn on a randomly generated floor with:

Rooms and corridors.

Enemies placed in floor tiles.

Loot piles placed in floor tiles.

Stairs up (exit to next floor).

Explore by moving tile-to-tile:

Every step rotates the active party member.

Enemies that have detected you (distance < 7) may advance toward you.

Interact:

Bump into an enemy: melee attack.

Step onto a loot tile: auto-pickup item or gear.

Use skills to damage enemies (AoE, targeted, etc.) at a PE cost.

Use items to heal or restore PE.

Reach the stairs:

Step on stairs tile to ascend.

Cinematic ascend animation; game loads next floor with increased parameters.

Continue until:

All three party members die (Game Over → reload).

(No defined “run complete” condition yet.)

2.6. Turn & Combat Model

Turn Structure

Player turn (one of the following):

Move in one of four directions.

Wait.

Use skill (currently treated as a “wait” plus separate skill effect).

Use an item (consumes a turn).

On each turn:

The action is processed (movement/combat/rotation).

The party active index rotates to the next member (skipping dead ones).

Enemies update (AI step and possible attacks).

Basic Melee Combat

Trigger: Player moves into a tile occupied by an enemy.

Resolution:

dmg = max(1, floor((atk*2 - def) * rand(0.8 – 1.2)))

Player attack uses Game_Actor.getAtk() (base ATK + weapon).

Enemy defense uses enemy.def (currently 0).

Enemy’s HP reduced by dmg, with float text, hit effect, log message.

If enemy HP ≤ 0:

Enemy dies (killEnemy): death particles, XP distribution, logging.

Party rotates to the next member.

Enemies then update (move/attack).

Enemy Attacks

If after AI movement an enemy’s intended tile is the player position:

Damage is computed:

Attacker: enemy’s atk.

Defender: active actor’s getDef() (base DEF + armor).

Damage applied to the active actor, hit VFX, float text.

If the final active actor after rotation is dead, gameOver() triggers.

2.7. Skills System (as implemented now)

PE Resource

Each skill costs PE (cost).

If caster’s PE < cost → action fails ("No PE." in log).

Skill Data Fields

name, cost, type (targeting category), range, power, optional fixed, count, desc.

Implemented categories:

target: Single target within Manhattan distance range.

all_enemies: All enemies on the map.

Special case: rapid uses target type but custom logic.

Implemented Skill Behaviors

Rapid Fire (rapid)

2 random shots against enemies within range.

Each shot: base damage = 1.2× ATK (non-fixed).

Visual: projectile from player to enemy, hit effect, float damage text.

Drain (drain)

Single target within range.

Damage = fixed 10.

Self-heal equal to damage dealt.

AoE (blast, combust, nuke)

type: "all_enemies", fixed damage.

Apply same damage to all enemies, float numbers, hit VFX.

Camera shake.

Not-Yet-Implemented Behaviors

Scan (scan): No mechanic yet; likely intended to reveal minimap or tiles.

Barrier (barrier): No buff or status system yet.

Heal (heal): No self-heal logic for type: "self".

Stun (stun): No stun or status system.

2.8. Enemies

Represented in $dataEnemies and spawned with generic HP scaled by floor.

Examples:

Sewer Rat

Low HP, low ATK, early-floor fodder.

AI: hunter.

Ooze

Higher HP, mid ATK, “chunky” enemy.

AI: patrol (currently static).

Stalker

High HP, higher ATK.

AI: ambush (uses hunter logic).

Watcher

Lower HP, high ATK, turret concept (currently static).

Abomination

Boss-like stats (in data), but actual HP is determined by floor formula.

In practice, the main difference is attack power and color/scale. AI tags are mostly stubbed for future behaviors.

2.9. Floors & Progression

Floor Data ($dataFloors)

For each floor: width, height, rooms, enemies, loot, optional cutscene.

Floor 1:

Smaller, fewer rooms, 6 + floor enemies, 5 loot.

Plays “intro” cutscene.

Higher floors:

Larger map, more rooms, more enemies and loot.

Map Generation

Start with all walls (1).

Random rectangular rooms carved out, non-overlapping.

Corridors (“tunnels”) connect room centers with L-shaped paths.

Player spawn at first room’s center; stairs at last room’s center (tile type 3).

2.10. Items & Inventory

Categories

item (consumables)

heal: restore HP (30 or 60).

pe: restore PE (20).

cure: not implemented yet.

weapon

Base weapon + prefix system; influences ATK.

armor

Vests, kevlar, combat suits, etc.; influences DEF.

Inventory Rules

Shared inventory size: 20.

If full, new pickups are refused with log "Inv Full!".

Using a consumable:

Choose target actor.

Apply effect (heal / restore PE).

Remove item from inventory.

Consume a turn (party rotate + enemy update).

Equipping gear:

Choose target actor.

Slot determined by item category (weapon/armor).

Old item (if any) returned to inventory (if space).

2.11. UI & Feedback

Persistent UI Windows

SQUADRON: Party listing + short HP/PE/EXP bars, active highlight.

TACTICS: Turn commands (Wait, Item, Skills).

MINIMAP: Tile view of walls/stairs enemies/player.

SYSTEM LOG: Rolling text log of events.

OPTICAL FEED: 3D renders of dungeon, enemies, player, VFX.

Modals

Status modal per actor.

Inventory modal with:

Item list.

Right column showing each member’s stats and equipment.

Target selection modal for items/equipment.

Confirm modal for consumable usage.

Cutscene overlay for story moments.

Feedback

Float digits for damage/heals.

Camera shakes on big hits.

Particles on hit/death/item pickup.

Screen flash on PE skill use.

Color coding for health status and stat comparisons.

2.12. Current Scope & Open Design Space

Currently implemented scope:

Core roguelike exploration and bump-combat.

Three protagonists with distinct stats and kits.

Floor generation and progression.

Loot, equipment, and basic inventory.

Visual and UI presentation that conveys the fantasy strongly.

Design space already hinted at but not yet realized:

Map intel (scan) and more tactical map systems.

Status effects and buffs/debuffs (barrier, stun, cure item).

True enemy AI variants (patrol routes, turret behavior, ambushers).

Run structure:

Boss floors, victory state, failure state beyond just “all dead”.

Potential meta progression (not present yet).

Party formation and deeper out-of-combat agency.