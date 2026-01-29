3. Code Architecture Document — “Eve of the Stack” (Modular Build)

This section describes how the game is structured as code.

3.1. High-Level Architecture

The codebase is modularized into the `src/` directory.

Data Layer (configuration & content):

`src/data.js`: CONFIG, $dataSkills, $dataClasses, $dataEnemies, $dataLootTable, $dataFloors, $dataCutscenes.

Game Logic Layer (systems & state):

`src/objects.js`: Core state classes (Game_System, Game_Party, Game_Actor, Game_Enemy, Game_Map).

`src/managers.js`: Static managers (BattleManager, ItemManager, CutsceneManager, BanterManager).

`src/core.js`: Utilities (EventBus, ConditionSystem, Sequencer, Geometry).

Global singletons: $gameSystem, $gameParty, $gameMap, Cutscene.

Presentation Layer:

`src/sprites.js`: 3D renderer (Renderer3D, ParticleSystem).

`src/windows.js` & `src/ui/`: UI system (UIManager, Window_Base, and specific Window classes).

Orchestrating all of it:

`src/main.js`: SceneManager (bootstraps the game and drives the input loop).

3.2. Data Layer

Config

CONFIG.colors defines base color palette used by Renderer3D.

Skill Data ($dataSkills)

Plain object keyed by skill id.

Each skill has:

Display data: name, desc(actor).

Mechanics data: cost, range, type, power, optional fixed, count.

Class / Actor Data ($dataClasses)

Keyed by character name ("Julia", "Miguel", "Rebus").

Defines: job, base hp, atk, def, pe, color, and starting skills array.

Enemy Data ($dataEnemies)

Array of enemies with: id, name, hp, atk, exp, color, scale, aiConfig.

Loot Table ($dataLootTable)

prefixes: modifiers for weapons (name + atk delta).

weapons: base weapon entries with name, baseAtk, icon, desc.

armors: armor entries with name, baseDef, icon, desc.

items: consumables with name, type, val, icon, desc.

Floors ($dataFloors)

Floor configs: width/height, room count, base enemies & loot, optional cutscene.

Cutscenes ($dataCutscenes)

Keyed by ID, each is a list of commands:

{ type: 'wait' | 'dialog' | 'log', ... }.

3.3. Runtime Game Objects
Game_System

Global meta-state:

floor: current floor index.

logHistory: array of recent log strings.

isBusy: prevents input during certain actions (e.g., melee attack).

isInputBlocked: used for cutscenes and modals to disable movement.

log(text):

Pushes to logHistory and trims size.

Triggers UI.refreshLog().

Game_Actor

Represents a party member.

Construction:

Takes name, looks up $dataClasses[name].

Copies stat fields via Object.assign.

Sets mhp = base hp, hp from data, mpe=100, pe=class pe.

Sets equipment defaults (Julia starts with basic handgun, Miguel with armor).

Initializes level, exp, nextExp, inventory (per-actor, currently unused).

Methods:

isDead(), takeDamage(v), heal(v).

payStamina(amount): Consumes stamina. If 0, marks exhausted and triggers forced swap. Inactive members regen stamina.

gainExp(v):

Levels up when exp >= nextExp.

On level up: level++, exp=0, nextExp *= 1.5 (floored), mhp += 5, hp = mhp, atk++.

Logs level up.

getAtk(): base ATK + equipped weapon ATK.

getDef(): base DEF + equipped armor DEF.

getAtkWith(item), getDefWith(item): preview stats if item were equipped.

Game_Enemy

Represents a single enemy instance.

Construction:

Copies data fields from $dataEnemies entry.

Sets x, y, uid, hp, mhp, alerted, def = 0, equip = {}.

Clones aiConfig for behavior logic.

Methods:

takeDamage(v), isDead().

decideAction(): Evaluates aiConfig conditions to choose Skill or Move action.

getAtk(): returns this.atk.

Game_Party

Holds members (array of 3 Game_Actor), index (current active), shared inventory, maxInventory.

Core methods:

active(): returns current active member.

nextActive(): returns next member in cycle (without mutating index).

rotate():

Used for forced rotation on death.

Advance index, skip dead members.

If after at most 3 checks the active is still dead → SceneManager.gameOver().

cycleActive(dir):

Manually cycles the active party member.

distributeExp(amount):

Active member gets full amount.

Other living members get floor(amount * 0.5).

gainItem(item):

Adds to shared inventory if space; logs success or “Inv Full!”.

Game_Map

Encapsulates the grid and its entities.

Properties:

width, height.

tiles: 2D array (1 = wall, 0 = floor, 3 = stairs).

enemies: array of Game_Enemy.

loot: array of { x, y, item }.

playerX, playerY, stairsX, stairsY.

Methods:

setup(floor):

Reads $dataFloors[floor] or default.

Generates rooms and corridors, sets tiles.

Sets spawn and stairs positions.

Spawns enemies and loot using Game_Enemy and ItemManager.generateLoot.

Calls Renderer.rebuildLevel().

Plays floor cutscene via Cutscene.play if defined.

Refreshes minimap.

startTargeting(skill, callback):

Initiates targeting mode (cursor or cycle) for skill usage.

processTurn(dx, dy, action) (async):

Early exits if input blocked or Renderer.isAnimating during move animation.

If action (skill callback): Executes action, pays stamina, updates stats, calls updateEnemies.

Else (Movement):

Calculates target tile:

If wall (tile 1): abort.

If enemy: resolves melee attack flow:

Set isBusy, calculate damage, apply VFX, call killEnemy if needed, refresh UI, call await updateEnemies(), clear isBusy.

Else:

Trigger Renderer.playAnimation('move_switch', ...) to animate “color swap move”.

Update playerX/Y.

Pick up loot if present (gainItem, Renderer.playAnimation('itemGet')).

If stairs tile: log, play ascend animation, block input, wait, then call setup(next floor).

Refresh UI, call updateEnemies().

updateEnemies() (async):

For each enemy:

If distance < 7 → alerted = true.

If alerted:

Decides action via decideAction() (Skill or Move).

If Move: Moves towards player (A* or simple Manhattan) or patrols.

If Skill: Queues skill execution.

Executes pending actions (moves first, then skills/attacks).

killEnemy(enemy):

Plays death animation.

Removes enemy from list.

Distributes EXP, logs.

Calls Renderer.syncEnemies().

Map is the core of the roguelike loop: grid state, enemy list, loot list.

3.4. Managers & Utilities
BattleManager

Static helper for combat calculations.

calcDamage(source, target):

Uses source.getAtk()/source.atk and target.getDef()/target.def.

executeSkill(actor, key) (async):

Checks PE cost; if not enough → logs “No PE.” and returns.

Deducts PE, logs skill usage, screen flash.

Computes baseDmg based on skill data.

Branches:

'rapid': custom logic for 2 random shots within range.

type: 'all_enemies': apply damage to all enemies, VFX + shake.

type: 'target': first enemy in range; with special case for 'drain'.

type: 'self': applies effects to user.

Handles geometric shapes (cone, line, circle).

Applies effects (damage, heal, state, PE recover) via applyEffect.

Does not set isBusy or interact with turn flow; is triggered from UI.

ItemManager

generateLoot(floor):

Randomly returns consumable, weapon, or armor based on probabilities.

Uses prefixes & floor number to scale weapon ATK.

CutsceneManager

Maintains a queue of commands and an active flag.

play(script):

Copies script, sets active, sets $gameSystem.isInputBlocked = true.

Calls next().

next() pops next command and passes to processCommand.

processCommand(cmd):

dialog: fills #cutscene-overlay, shows it, waits for click to advance.

wait: simple timeout.

log: writes to system log.

end():

Clears active, unblocks input, logs “Command restored.”

BanterManager

Manages floating text "banter" triggered by game events.

Maintains a priority queue of lines.

Handles cooldowns (Global, Per-Trigger, Per-Actor).

Sequencer

Utility with sleep(ms) returning a promise for await usage inside async flows.

ConditionSystem

Evaluates conditions (ranges, stats, states) for AI and Banter logic.

3.5. Rendering Layer
ParticleSystem

Preallocates ~50 plane meshes for particles.

Two main emitters:

spawnBurst(x, y, color, count): radial burst used for hits/deaths.

spawnSparkle(x, y): upward sparkle trail used for loot.

update() called every frame to integrate velocities and fade particles.

Renderer3D (singleton instance Renderer)

Responsibilities:

Owns Three.js scene, camera, renderer, lights, and object groups:

mapGroup (instanced floor/walls + stairs meshes).

enemyGroup (enemy meshes).

lootGroup (loot meshes).

rangeGroup (2D range markers).

Owns the player mesh and lighting:

Player is an octahedron (OctahedronGeometry).

Player color (matPlayer.color) is changed to the active party member’s color.

Player point light follows player.

Key methods:

init(container):

Configures camera (Perspective 50°, 16:9), renderer (320×180 internal res).

Creates player mesh and groups, attaches canvas to UI view window.

Starts animate() loop.

rebuildLevel():

Rebuilds mapGroup using instanced meshes:

Floor tiles: plane geometry rotated flat.

Walls: box geometry for wall segments adjacent to floor.

Stairs: custom stack of box slices to form a stepped ramp.

Positions player mesh and camera look target on Game_Map.playerX/Y.

Calls syncEnemies() and syncLoot().

syncEnemies():

Ensures each Game_Enemy has a corresponding Three.js mesh in enemyGroup.

Maintains enemyTargets map of desired positions.

syncLoot():

Clears lootGroup, re-adds a small box mesh at each loot tile.

playAnimation(type, data):

move_switch: sets up interpolated movement from start to end; sets isAnimating = true and handles color swap halfway.

ascend: triggers a special camera + player vertical motion mode.

lunge / enemyLunge: temporary target positions for tweening.

shake: shakes the whole game-view-wrapper div.

hit: per-target shake + particle burst.

itemGet: sparkle particles at loot position.

flash: full-screen color flash via #screen-fx.

die: spawn burst particles at enemy position.

projectToScreen(x, y, z):

Projects a 3D point in world space to 2D screen space (for float text).

showRange(skill) & clearRange():

Builds range overlay meshes in rangeGroup based on skill.range and skill.type.

animate():

Called every frame via requestAnimationFrame.

Handles:

Player movement lerp and color swap for move_switch.

Ascend animation (zoom then vertical flight).

Camera following logic (smooth follow + lookAt).

Enemy mesh pulsing and rotation.

Loot spinning.

Particle updates.

Render call.

Input gating tie-in:
Renderer.isAnimating is used by SceneManager.loop and Game_Map.processTurn to temporarily prevent new moves while the player is mid-step, but it’s not used for skills, cutscenes, or other animations.

3.6. UI Layer
UI_Window

Small helper class:

Creates a .pe-window div at a given position/size.

Adds a .pe-header (title) and .pe-content container.

UIManager (singleton UI)

On construction (createLayout()), builds the main window layout:

status, cmd, minimap, log, view.

Attaches minimap canvas to minimap.

Registers view.content as the container for the 3D renderer.

Core methods:

refresh():

Calls refreshStatus(), refreshCmd(), refreshLog(), refreshMinimap().

refreshStatus():

Rebuilds SQUADRON window from $gameParty.members.

Uses inner HTML to create health/PE/EXP bars.

Adds click handlers to open showStatusModal(actor).

refreshCmd():

Rebuilds TACTICS window for current active actor.

Adds WAIT and ITEM commands.

Lists skills, enabling/disabling based on PE.

Skill buttons:

On click: call $gameMap.processTurn(0,0) (wait) then BattleManager.executeSkill.

On hover: show tooltip and Renderer.showRange(skill).

refreshMinimap():

Draws tile types, enemies, and player on the minimap canvas.

refreshLog():

Populates system log with recent entries, most recent at top, fading older ones.

floatText(t, x, y, color):

Uses Renderer.projectToScreen to place damage/heal digits in the floating-text-layer.

Each digit animates with a bounce and fades out.

Modals & overlays:

showInventoryModal():

Blocks input.

Builds a modal window listing items and showing per-actor gear.

Uses `Window_Inventory` from `src/ui/windows/`.

showStatusModal(actor):

Opens a modal with actor stats.

Uses `Window_Status` from `src/ui/windows/`.

createModal(title, build, onClose) / closeModal():

Generic window builder with header + closable content.

UI uses CSS + DOM (no canvas) and interacts directly with Renderer, $gameMap, $gameParty, $gameSystem.

3.7. Scene & Input Management
SceneManager

Global orchestrator for bootstrapping and input.

init():

Instantiates $gameSystem, $gameParty, $gameMap.

Instantiates UIManager, Renderer3D, CutsceneManager.

Calls Renderer.init(view container) and $gameMap.setup(1) to build the first floor.

Calls UI.refresh() to initialize windows.

Logs “System initialized.”

Sets up keyboard event listeners:

keydown: sets this.keys[e.key] = true.

keyup: sets this.keys[e.key] = false.

Starts the main loop: this.loop().

loop():

requestAnimationFrame recursive call.

Each frame:

If not busy / input blocked / animating:

Checks for directional keys or space.

On first match, calls $gameMap.processTurn(dx, dy).

gameOver():

Simple alert("FAILURE."); location.reload();.

Because movement is only processed in loop() when keys are pressed, and enemies only act from inside Game_Map.processTurn, the whole game is effectively player-clocked.

3.8. Cross-Cutting Flags & Global State

There are three key booleans used for gating:

$gameSystem.isBusy:

Set true during melee attack turn resolution.

Prevents new inputs until attack animation and enemy update finish.

$gameSystem.isInputBlocked:

Used by cutscenes and UI modals to freeze movement and commands.

Renderer.isAnimating:

Used to throttle per-step movement while the move_switch animation is in progress.

Global singletons:

$gameSystem, $gameParty, $gameMap, Renderer, UI, Cutscene, managed at the top script scope.

This gives you a working but tightly coupled state graph: every system talks to every global directly, which is convenient now but will be a refactoring target if you move to a multi-file engine.

3.9. Known Technical Limitations / Debt

From the current architecture:

No formal scene stack:

SceneManager only has SceneManager.init() and loop(); no Scene_Map, Scene_Menu, etc.

All UI overlays (inventory, status, cutscene) are ad-hoc modals layered over a single “scene”.

No window manager stack:

UI windows don’t know about z-order or interaction blocking; modals rely on isInputBlocked plus z-index, but there’s no centralized “top window” logic.

Timing inconsistencies:

Skills are not integrated into the same turn resolution path as movement/bump combat.

Some actions set isBusy, others don’t; only movement uses Renderer.isAnimating gating.

Partial system implementations:

Skill data includes many non-operational skills (scan, barrier, heal, stun).

Status effects, buffs, and debuffs are absent.

Some data fields (enemy hp, AI types, item types) are unused or only partially used.

Despite this, the architecture is already trending toward the Data / Systems / Presentation separation you want, just without the file/module scaffolding and manager abstractions yet.
