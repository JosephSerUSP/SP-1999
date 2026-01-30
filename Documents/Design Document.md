2. Game Design Document — “Stillnight: SP1999 / Eve of the Stack”
2.1. Overview

Title: Stillnight: SP1999 – Eve of the Stack
Platform: Browser (HTML/JS, Three.js)
Genre:

Floor-based dungeon crawler

Turn-based roguelike movement (1 step = 1 “turn”)

Inline bump-combat with active skills and a finite parapsychic resource

Mission-based “case file” structure over a longer campaign

Setting & Premise

São Paulo, 1999.
The world is buzzing with Y2K panic, apocalyptic prophecies and election talk; Brazil sits under FHC, with Lula still “only” a candidate. New metro stations are rumored, half-built, or missing. Reality feels unstable—not because time is glitching, but because who gets to define reality is up for grabs.

You work with INTRA (Instituto de Rastreamento de Anomalias), a small, underfunded, anti-government organization that investigates anomalies across São Paulo and Santos. These anomalies are manifestations of cognitive conflicts made real—where official narratives, personal trauma, and collective fears collide so violently they produce literal monsters.

The Police and State institutions are not neutral: they are systemic antagonists. They produce sanitized “truths” in official records, raid favelas, ignore domestic violence, and enforce racism, homophobia, and transphobia. INTRA’s work directly threatens their monopoly on “what really happened.”

Aesthetic & Mood

Parasite Eve meets PSX Persona in São Paulo / Santos.

David Lynch and Junji Ito flavored cognitive horror more than simple gore.

X-Files / SCP Foundation structure: “case of the week” anomalies with a long running mega-case.

UI is a PC-98 / late-90s Windows-style control center: multiple windows, minimap, logs, and cutscene overlays.

Combat and exploration share a single 3D tactical feed, framed as INTRA’s “optical” surveillance of the mission. 

Design Document

2.2. Core Fantasy & Pillars

Core Fantasy

You command a small INTRA field squad investigating dangerous anomalies in real São Paulo/Santos locations (Santa Casa, USP, subway lines, harbor, etc.). Every step forward advances time, every action rotates the front-liner, and every decision you make—what you record, what you omit, what you believe—quietly shapes how the anomaly manifests.

You aren’t just killing monsters; you’re fighting for control over the case file itself, against a State that wants to erase, distort, or bury what you find.

Pillars

Tactical Step-Based Infiltration

Movement is grid-based and turn-based; enemies advance only when you act.

Bump-combat and tight corridors create constant micro-tension.

Three-Member INTRA Squad

A small team with distinct roles: hardened investigator, anxious analyst, unstable “pattern” being.

The active member cycles with every action, so you’re always thinking about who will be “on point” when enemies retaliate. 

Design Document

Cognition → Reality

Anomalies are born from conflicting narratives (police reports vs community testimonies vs INTRA analysis).

Skills, items, and case-file choices reflect knowledge as a weapon.

Anti-State Horror

The State and Police are structurally violent; they are not the cavalry.

Many anomalies originate where state violence meets denial: unrecorded raids, erased addresses, buried hospital cases.

Atmosphere Through UI & Camera

3D combat/exploration is always framed inside the INTRA control UI.

Logs, minimap, and a cinematic camera sell the mood more than high poly counts. 

Design Document

Data-Driven Systems

Skills, enemies, loot, floors, and missions are defined in data tables.

Narrative descriptors (case tags, anomaly categories, floor themes) live alongside mechanical stats, so the engine can scale without hard-coding content. 

Design Document

2.3. Narrative Premise
INTRA & the State

INTRA is an informal, semi-illegal anomaly tracking institute with connections to activists, academics, and a few disillusioned civil servants. Its purpose is to collect, cross-reference, and preserve the truths that official channels try to erase.

The Police and State are defined as:

Bureaucratic, but selectively brutal.

Agents of structural oppression (raids in favelas, ignored domestic abuse, disappearances).

Producers of sanitized documents that re-label atrocities as “drug-related” or “gang conflict.”

INTRA’s work is dangerous precisely because writing a different file can be an act of rebellion.

Anomalies

Anomalies in SP1999 are cognitive knots turned physical:

Conflicting records about the same event.

Collective urban legends and superstitions.

Traumas and injustices that were never properly acknowledged.

When these contradictions reach a critical point, reality buckles: corridors loop, morgue drawers lead to nowhere, subway stations that “don’t exist” appear between regular stops, and non-human abominations emerge that you can safely fight without human-on-human combat.

1999 & the Apocalypse

1999 acts as a pressure cooker:

NPCs mention Y2K, televangelist doomsayers, and election talk (FHC vs Lula).

People joke about “the world ending,” but for many, the world has been ending slowly for decades.

The “end of the world” is ultimately more about meaning collapse than literal cosmic annihilation.

2.4. Player Role & Core Cast

Player Role

You’re effectively the tactical layer of an INTRA field team:

Decide movement, waiting, skill usage, and item usage.

Interpret logs and case file notes between missions.

Choose how to frame each anomaly in reports, influencing endings and 3’s evolution.

Party Members (Active Squad)

Names for 2 and 3 can remain codenames in-world; INTRA treats them as entries before they are people.

Julia dos Santos (23, F)

Background:

Saw her older brother killed in a police raid at age 8.

Mother became a shut-in.

High school best friend is now a devout evangelical police officer; she misses him but refuses contact.

Attachment Style: Dismissive-avoidant

Manages intimacy with sarcasm, distance, and competence.

Role in party:

The practical spearhead; plays close to the old Aya role but rooted in SP1999.

Mid-range attacker with tactical skills (intel, precision strikes).

Mechanics (initial mapping):

HP: mid, ATK: mid+, DEF: low+, Parapsychic Energy (PE): moderate.

Example skills:

Rapid Fire → short-range repeated shots.

Scan → reveals minimap sectors / enemy positions / anomaly clues.

Snipe → high-power, single-target shot with good range. 

Design Document

Miguel (“Analyst”, 36, M)

Background:

Soft, gentle, and quirky; a late bloomer who has lived sheltered.

Childhood friend of Olavo, harbors a long-running, mostly unspoken crush on him.

Tends to crush on other men easily; Julia teases him about it.

Attachment Style: Anxious

Hyper-sensitive to tone shifts, fears abandonment, eager to please.

Role in party:

Support/control unit; reads anomalies, stabilizes the team.

Mechanics:

HP: high, ATK: mid-, DEF: high, PE: low+.

Example skill mapping (from existing kit):

Grenade → wide AoE, physical “stop gap” solution.

Barrier → defensive buff once status systems exist.

Stun Baton → melee with possible stun status. 

Design Document

Rebus (“Pattern”, ??, M)

Ontology:

Not a normal person but a recurring pattern that reappears in official records, testimonies, and morgue data across decades.

The more INTRA investigates him—cross-referencing unknown victims, mugshots, and witness sketches—the more solid and “real” he becomes.

Personality:

Androgynous, beautiful, outwardly gentle, but with flashes of something old and alienated.

Feels both guilty and resentful about existing only as others’ idea of him.

Role in party:

Glass cannon parapsychic unit; his powers are strongest where reality is weakest.

Mechanics:

HP: low, ATK: high, DEF: low, PE: very high.

Existing skills mapped:

Combust / Nuke / Drain / Heal as manifestations of cognitive stress in the environment rather than generic magic. 

Design Document

Key NPC

Olavo (35, M) – Mission Handler

Childhood friend of Miguel; INTRA’s mission coordinator.

Public face of INTRA, always on the phone, juggling favors and covering tracks.

Often has to decide which truths are “safe” to put in writing, putting him in direct conflict with the party in the True Ending route.

2.5. Campaign Structure & Missions

The campaign is structured as a mix of base segments, VR training, and real-world missions:

Base (INTRA HQ)

Narrative hub: talk to Olavo and other staff, read case files, update equipment, manage party development.

Mechanical hub: shops, skill unlocks, gear upgrades, and story progression.

VELDT – VR Simulation

A procedurally generated simulation built from existing case data.

Always replayable; updates as new anomalies are logged.

Used for training, grinding, and experimenting with builds.

The point is not “corrupted VR” but “the data itself is warped,” which may cause the VELDT to reflect emerging anomalies before INTRA realizes it.

Field Missions (Real-World Dungeons)

Each mission is framed as an INTRA case file with a code (e.g., SP-1999-03).

Most missions are in real locations:

Santa Casa da Misericórdia de Santos (body horror, pregnancy, loss).

USP campus buildings (knowledge production and ethics).

Subway lines and unfinished stations (liminal spaces and disappearances).

Favela hills, harbor areas, etc.

Each mission has:

An entry (briefing, flavor text, tags like “State Violence”, “Medical Negligence”).

A dungeon (floors with enemies, loot, anomaly “rules”).

An exit (containment, partial escape, or catastrophic failure).

Endgame & Endings

Missions and case decisions lead toward four outcomes:

Bad Ending: Mystery never really unfolds; final boss is just another “monster of the week.”

Normal Ending: Rebus becomes an apparent apocalyptic threat; Julia and Miguel kill him.

True Ending: Rebus wipes the party, becomes playable, and leads a final mission where the party reunites to confront the machinery that decides what is real.

Joke Ending (NG+): A playful, UFO-style parody outcome unlocked by absurd play patterns.

2.6. Core Gameplay Loop

Floor-Level Loop (Per Mission)

Insertion:

Squad spawns near the mission’s “entry point” (e.g., hospital entrance, station platform).

Floor layout is procedurally generated within parameters themed around the location. 

Design Document

Exploration (Turn-Based):

Arrow keys / WASD: move one tile.

Space / WAIT command: pass a turn.

Each step:

Rotates the active member (Julia → Miguel → Rebus → …).

Advances enemies (only those alerted or within “cognitive radius”).

Interaction:

Bump into an enemy: melee attack.

Step onto loot tile: auto-pickup item or gear, log entry.

Use skills from the TACTICS window:

Spend PE to execute ranged or AoE attacks.

Display skill range overlay in the 3D view.

Use items via inventory:

Heal HP, restore PE, cure statuses (once implemented).

Escalation & Exit:

Reach anomaly hotspots / bosses deeper in the mission.

Reach stairs or final node to exit to the next floor or conclude the mission.

Cinematic ascend/exit animation, logs, and potential cutscenes. 

Design Document

Return to Base:

Update case file with findings (including player-choice tags).

Level up, manage gear, unlock new narrative beats and missions.

2.7. Turn & Combat Model

Turn Structure

Player Phase:

Choose exactly one: move, wait, use skill, or use item.

The action resolves immediately.

Rotation:

Active member index moves to the next living squadmate.

Enemy Phase:

Alerted enemies update their AI:

Move towards player (hunter / ambush types).

Attack if they step into the player tile.

Damage is resolved using ATK vs DEF with light randomness. 

Design Document

Combat is meant to feel:

Simple numerically (HP, ATK, DEF, PE) but

Tense tactically, because:

Rotation means you can’t always choose who takes the hit.

Turn economy is tight; every step matters.

2.8. Skills & Parapsychic Energy (PE)

PE is re-interpreted as Parapsychic Emission:

A mix of latent psychic potential and ambient anomaly “pressure.”

Each agent has a personal PE pool; Rebus’s pool is unusually high because he is an anomaly.

Skill Data (existing implementation)

name, cost, type (targeting), range, power, fixed, count, desc.

Types currently used:

target (single enemy within range).

all_enemies (all enemies currently on the field).

self (self-targeted abilities like healing/buffing, to be fully implemented). 

Design Document

Current Implemented Behaviors (Re-themed)

Rapid Fire (Julia)

2 shots against enemies in line-of-sight; models a trained agent emptying a clip under pressure.

Drain (Rebus)

Fixed damage + self-heal: Rebus momentarily aligns others’ bodily patterns to his own, “siphoning” order.

Blast / Combust / Nuke (Miguel + Rebus)

AoE attacks: grenades and large-scale anomaly discharges.

Scan / Barrier / Heal / Stun

Mechanically stubbed and planned to be expanded into:

Map intel/reveal systems.

Buff/debuff/status effect systems.

2.9. Enemies & Anomaly Taxonomy

Enemies are non-human manifestations that embody specific conflicts:

Infestation Types (e.g., rat-like things in sewers and hospital basements):

Represent decay, neglect, and “filth narratives” used to dehumanize residents.

Ooze / Slime Types:

Bodies that won’t stay categorized: medical waste, unrecorded miscarriages, mixed samples.

Stalker / Watcher / Drone Types:

Surveillance and predation; linked to records, cameras, and institutional gaze.

Abomination Types:

Collective trauma that has been layered and layered until it erupts as a boss-class being.

Mechanically, they are:

Defined in $dataEnemies with base HP, ATK, EXP, color, scale, and AI tag.

Spawned onto floors with HP scaled by floor.

Tagged with AI: hunter, patrol, turret, ambush, etc., which can be expanded into richer behaviors later. 

Design Document

2.10. Floors, Real Locations & Progression

Each floor in $dataFloors defines: width, height, rooms, enemies, loot, and optional cutscene identifier. The generator carves rooms and tunnels from a solid grid, then places spawn, exits, enemies, and loot. 

Design Document

Thematic Layer on Top of Floor Data

Base & VELDT

Smaller, training-oriented layouts.

Santa Casa da Misericórdia de Santos:

Morgue and maternity wards as layered floors, with body horror and grief themes.

USP Campus:

Faculties turned into mazes of labs and libraries.

Floors reflect layered knowledge production—papers, experiments, scandals.

Subway & Unfinished Stations:

Long corridors, platforms, maintenance tunnels.

“Stations that don’t exist” as optional branches.

Optional Sites (3 out of 9 total dungeons):

Favela hillside where streets disappear from maps.

Harbor containers with impossible interior volumes.

Administrative buildings where records are altered mid-mission.

Higher floors and later missions:

Increase density and aggression of anomalies.

Reveal deeper layers of the core mega-case (3’s pattern + State cover-ups).

2.11. Items, Gear & Inventory

Categories

Items (Consumables)

HP recovery (medicines).

PE recovery (stimulants).

Status cures (antidotes, anti-panic, etc., once status exists).

Weapons

Pistols, batons, shotguns, knives, etc.

Prefix system (“Rusty”, “Standard”, “Ancient”) modifies base ATK.

Armor

Vests, tactical gear, coats, etc.

Modify DEF and possibly status resistances later.

Inventory Rules

Shared inventory size capped at 20 slots.

New pickups are refused when full.

Using an item:

Select target.

Apply effect.

Remove item.

Consume a turn.

Equipment Management

Equipping gear is done through modals (inventory → select target → confirm).

Swapping gear may return previously equipped item to inventory if there’s space. 

Design Document

Items and gear will be increasingly tied to narrative:

Some items only drop in certain neighborhoods or institutions.

Certain gear may be “evidence” as well as equipment, affecting case files.

2.12. UI, Case Files & Knowledge as a System

Persistent Windows (INTRA Control Center)

SQUADRON: Party info, HP/PE/EXP bars, active highlight.

TACTICS: Commands (Wait, Item, Skills), with skill tooltips and range preview.

MINIMAP: Grid of explored tiles, walls, stairs, enemies, and player.

SYSTEM LOG: Scrolling event log, from combat results to flavor messages.

OPTICAL FEED: Full-screen 3D view of the current floor, enemies, and VFX. 

Design Document

Modals & Overlays

Actor status panels.

Inventory and equipment management.

Target selection and confirmations.

Cutscene overlay for briefings, mid-mission events, and narrative beats.

Planned: Case File UI Layer (Narrative System)

Over the existing UI, the campaign will add:

Case File Viewer at base:

Read and scroll through past missions.

See how each incident is categorized (tags, notes, cause).

Case Decisions:

After missions, choose how to frame an incident:

“Cause: unexplained structural defect” vs “Cause: police incursion” vs “Cause: anomaly SP1999-XX.”

These decisions:

Affect future enemy behavior and appearance.

Alter how NPCs talk about INTRA.

Gate access to the True Ending and Rebus’s evolution.

The UI thus reinforces the central theme: knowledge production as battleground.

2.13. Current Scope & Open Design Space

Currently Implemented / Near-Term Scope

Core roguelike exploration and bump-combat.

Three distinct squad members with unique stats and skills (implemented as Julia, Miguel, and Rebus).

Design Document

Procedural floor generation and progression by floor index.

Loot, equipment, inventory, and basic equipment management.

Strong UI framing (multiple windows, logs, minimap, 3D tactical feed).

Next Design Steps Aligned with New Narrative

Fully Re-skin Data Layer to SP1999 Cast & Locations

Ensure all enemies and items match the São Paulo/Santos settings.

Implement Scan / Intel Systems

Expand scan into a genuine intel tool (map reveal, enemy tags, anomaly hints).

Status Effects & Buffs

Realize barrier, stun, and cure items as proper mechanics.

Mission / Case Structure

Add mission selection at base.

Add mission metadata and case files to data layer.

Endings & Flags

Introduce campaign flags (pattern fragments found, case choices) that lead to Bad, Normal, True, and Joke endings.

Optional Dungeons

Design 3 thematic optional dungeons that deepen the political and cognitive themes while rewarding exploration.

This document should act as the narrative-aligned spine: mechanics stay lean and tactical, but now every system is anchored to São Paulo 1999, INTRA vs State, and the living pattern that is Rebus.