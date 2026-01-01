# Stillnight: Eve of the Stack - Game Design

## 1. Narrative & Setting

**Setting:** "Stillnight" is set in a cyberpunk dystopia in São Paulo, 1999. The story takes place within a virtual reality training simulation known as the **VELDT** (Virtual Environmental Learning & Drill Terminal), run by the **INTRA Facility**.

**Premise:** The protagonist squad, "Subject-03" (Julia, Miguel, and Rebus), are digital constructs or "Ghosts" trapped within the simulation. They are guided by an external operator, **Olavo**, as they investigate anomalous readings ("The Phantom Signal") that suggest the simulation is being corrupted or invaded by a sentient virus.

### Characters

*   **Julia (The Agent)**
    *   **Role:** DPS / Precision
    *   **Personality:** Professional, cold, focused on the mission.
    *   **Combat Style:** High single-target damage, crit focus.
    *   **Stats:** Low HP, High PE, High Speed.
    *   **Color:** Yellow (`0xffff00`)

*   **Miguel (The Analyst)**
    *   **Role:** Tank / Support
    *   **Personality:** Nervous, technical, the moral compass.
    *   **Combat Style:** Defense buffs, crowd control (stun), explosives.
    *   **Stats:** High HP, Low PE, High Defense.
    *   **Color:** Blue (`0x0088ff`)

*   **Rebus (The Entity)**
    *   **Role:** Mage / AoE
    *   **Personality:** Cryptic, glitchy, connected to the code.
    *   **Combat Style:** Area of effect damage, self-sustain (drain), high cost "Nuke".
    *   **Stats:** Low HP, High PE, Low Defense.
    *   **Color:** Red (`0xff0044`)

## 2. Core Gameplay Loop

The game follows a turn-based tactical RPG structure with roguelike elements.

### 2.1. The Tag Team Mechanic
The player controls a **party of 3 characters**, but only **one character** is physically present on the grid at any time.

*   **Manual Swapping:** The player can freely swap the active character (default keys: Q/E or L2/R2) at the start of their turn.
*   **Tactical Depth:** Swapping allows the player to adapt to the situation (e.g., switch to Miguel to tank a hit, switch to Rebus to clear a room).
*   **Stamina (PE) Management:**
    *   Every action (Move, Attack, Skill) costs **PE** (Power Energy).
    *   **Inactive** party members regenerate PE (50% of the active member's expenditure).
    *   **Exhaustion:** If a character's Stamina reaches 0, they become **Exhausted** and are forcibly swapped out. They cannot be swapped back in until their Stamina recovers to 50%.

### 2.2. Combat
Combat is seamless (no separate battle screen) and takes place on the dungeon grid.

*   **Turn Structure:** Player Phase -> Enemy Phase.
*   **Actions:**
    *   **Move:** WASD / D-Pad. Consumes 10 Stamina.
    *   **Bump Attack:** Moving into an enemy triggers a basic melee attack. Consumes 20 Stamina.
    *   **Skills:** Selected from the menu. Can target single enemies, shapes (Line, Cone, Circle), or Self. Consumes PE (Power Energy) and 20 Stamina.
        *   **Targeting:** Starts at the active character (or first valid target for inspection).
    *   **Items:** Consumables for healing or buffs. Using an item ends the turn.
*   **Damage Formula:** `(ATK * 2 - DEF) * variation`. This formula makes Defense a very powerful stat.

### 2.3. Exploration
*   **Procedural Generation:** Levels are generated procedurally using different algorithms (Dungeon/BSP, Cave/Cellular Automata) defined in `$dataFloors`.
*   **Fog of War:** The map is hidden until explored.
*   **Interaction:**
    *   **Loot:** Bumping into a loot crate collects an item.
    *   **Stairs:** Reaching the stairs proceeds to the next floor (generating a new level). Note: Exit locking mechanisms (e.g. Boss requirements) are currently disabled/not implemented.

## 3. Systems

### 3.1. Enemy AI
Enemies use behavior trees defined in `$dataEnemies`. Common behaviors include:
*   **Hunter:** Pathfinds directly to the player.
*   **Patrol:** Moves randomly until the player is spotted.
*   **Turret:** Stationary, attacks from range.
*   **Tactical:** Maintains optimal range, switches between melee and ranged.

### 3.2. Traits & Effects
*   **Traits:** Static modifiers (e.g., "Attack + 5", "Immune to Poison") attached to Equipment or States.
*   **Effects:** Instant actions (Damage, Heal) or State Application attached to Skills and Items.

### 3.3. Banter System
Characters react to gameplay events (Kill, Walk, Loot, Hurt) with "Banter" lines displayed above their heads.
*   **Priority Queue:** High-priority lines (Story, Low HP) override flavor text. Note: Banter is suppressed if input is blocked (e.g., during cutscenes), regardless of priority.
*   **Context Awareness:** Banter can check conditions like "Nearby Enemy Count" or "Current Health %".
