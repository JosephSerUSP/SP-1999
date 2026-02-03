# 2. Game Design Document — “Stillnight: SP1999 / Eve of the Stack”

## 2.1. Overview

**Title:** Stillnight: SP1999 – Eve of the Stack
**Platform:** Browser (HTML/JS, Three.js)
**Genre:**
*   Floor-based dungeon crawler
*   Turn-based roguelike movement (1 step = 1 “turn”)
*   Inline bump-combat with active skills, Stamina management, and limited Parapsychic Energy (PE)
*   Mission-based “case file” structure over a longer campaign

**Setting & Premise**

São Paulo, 1999.
The world is buzzing with Y2K panic, apocalyptic prophecies and election talk; Brazil sits under FHC, with Lula still “only” a candidate. New metro stations are rumored, half-built, or missing. Reality feels unstable—not because time is glitching, but because who gets to define reality is up for grabs.

You work with INTRA (Instituto de Rastreamento de Anomalias), a small, underfunded, anti-government organization that investigates anomalies across São Paulo and Santos. These anomalies are manifestations of cognitive conflicts made real—where official narratives, personal trauma, and collective fears collide so violently they produce literal monsters.

The Police and State institutions are not neutral: they are systemic antagonists. They produce sanitized “truths” in official records, raid favelas, ignore domestic violence, and enforce racism, homophobia, and transphobia. INTRA’s work directly threatens their monopoly on “what really happened.”

**Aesthetic & Mood**
*   Parasite Eve meets PSX Persona in São Paulo / Santos.
*   David Lynch and Junji Ito flavored cognitive horror more than simple gore.
*   X-Files / SCP Foundation structure: “case of the week” anomalies with a long running mega-case.
*   UI is a PC-98 / late-90s Windows-style control center: multiple windows, minimap, logs, and cutscene overlays.
*   Combat and exploration share a single 3D tactical feed, framed as INTRA’s “optical” surveillance of the mission.

## 2.2. Core Fantasy & Pillars

**Core Fantasy**
You command a small INTRA field squad investigating dangerous anomalies in real São Paulo/Santos locations. Every step forward advances time, costs Stamina, and requires careful resource management.

You aren’t just killing monsters; you’re fighting for control over the case file itself, against a State that wants to erase, distort, or bury what you find.

**Pillars**

*   **Tactical Step-Based Infiltration:** Movement is grid-based and turn-based; enemies advance only when you act. Bump-combat and tight corridors create constant micro-tension.
*   **Three-Member INTRA Squad:** A small team with distinct roles: hardened investigator, anxious analyst, unstable “pattern” being. You must manually swap between members (or be forced to swap upon exhaustion) to utilize their unique skills and HP pools effectively.
*   **Cognition → Reality:** Anomalies are born from conflicting narratives. Skills, items, and case-file choices reflect knowledge as a weapon.
*   **Anti-State Horror:** The State and Police are structurally violent; they are not the cavalry. Many anomalies originate where state violence meets denial.
*   **Atmosphere Through UI & Camera:** 3D combat/exploration is always framed inside the INTRA control UI. Logs, minimap, and a cinematic camera sell the mood more than high poly counts.
*   **Data-Driven Systems:** Skills, enemies, loot, floors, and missions are defined in data tables.

## 2.3. Narrative Premise

**INTRA & the State**
INTRA is an informal, semi-illegal anomaly tracking institute with connections to activists, academics, and a few disillusioned civil servants. Its purpose is to collect, cross-reference, and preserve the truths that official channels try to erase.

**Anomalies**
Anomalies in SP1999 are cognitive knots turned physical: conflicting records, urban legends, and unacknowledged traumas. When contradictions reach a critical point, reality buckles.

**1999 & the Apocalypse**
1999 acts as a pressure cooker: Y2K panic, political tension, and a sense that the "end of the world" is imminent.

## 2.4. Player Role & Core Cast

**Player Role**
You’re effectively the tactical layer of an INTRA field team:
*   Decide movement, waiting, skill usage, and item usage.
*   Manage the squad's Stamina and PE levels.
*   Interpret logs and case file notes between missions.

**Party Members (Active Squad)**

**Julia dos Santos (Agent)**
*   **Background:** Saw her older brother killed in a police raid at age 8. Dismissive-avoidant attachment style.
*   **Role:** Practical spearhead. Mid-range attacker with tactical skills (intel, precision strikes).
*   **Mechanics:** HP: mid, ATK: mid+, DEF: low+, PE: moderate.
*   **Skills:** Rapid Fire (short-range burst), Scan (intel), Snipe (high power).

**Miguel (Analyst)**
*   **Background:** Gentle, quirky, late bloomer. Childhood friend of Olavo. Anxious attachment style.
*   **Role:** Support/control unit; reads anomalies, stabilizes the team.
*   **Mechanics:** HP: high, ATK: mid-, DEF: high, PE: low+.
*   **Skills:** Grenade (AoE), Barrier (defense), Stun Baton (melee control).

**Rebus (Entity)**
*   **Ontology:** Not a person but a recurring "pattern" (Subject-03) that reincarnates.
*   **Personality:** Androgynous, beautiful, alienated.
*   **Role:** Glass cannon parapsychic unit.
*   **Mechanics:** HP: low, ATK: high, DEF: low, PE: very high.
*   **Skills:** Combust/Nuke (AoE), Drain (damage + heal).

**Key NPC**
*   **Olavo (Mission Handler):** INTRA’s mission coordinator and Miguel's childhood friend.

## 2.5. Campaign Structure & Missions

*   **Base (INTRA HQ):** Narrative and mechanical hub.
*   **VELDT (VR Simulation):** Training and experimentation.
*   **Field Missions:** Real-world dungeons (Santa Casa, USP, Subway, Favelas) with procedural generation.
*   **Endgame:** Four endings (Bad, Normal, True, Joke) determined by case decisions and exploration.

## 2.6. Core Gameplay Loop

**Floor-Level Loop**
*   **Insertion:** Squad spawns near entry.
*   **Exploration:** Turn-based movement. Consumes 10 Stamina per step.
*   **Interaction:** Bump-combat (Melee), Skill usage (Consumes 20 Stamina + PE), Item usage.
*   **Escalation & Exit:** Reach boss or stairs.

**Return to Base**
*   Update case files, level up, manage gear.

## 2.7. Turn & Combat Model

**Turn Structure**
1.  **Player Phase:** Choose one: move, wait, use skill, or use item. Action resolves immediately.
    *   **Stamina:** Moving costs 10. Skills/Attacks cost 20. Reaching 0 Stamina causes Exhaustion.
    *   **Rotation:** You may manually swap characters (Q/E). Exhaustion or Death forces a swap to the next available member.
2.  **Enemy Phase:** Alerted enemies move or attack.

**Combat Feel**
Simple numerically but tense tactically due to resource management (Stamina/PE) and positioning.

## 2.8. Skills & Parapsychic Energy (PE)

**PE (Parapsychic Emission)**
*   A finite resource for using skills.
*   **No Auto-Regen:** PE does *not* regenerate automatically. It must be restored via Items (e.g., Stims) or specific effects.
*   Each agent has a personal PE pool.

**Skill Data**
*   Defined in `$dataSkills`.
*   Types: target, all_enemies, self, line, cone, circle.
*   Costs: PE amount.

**Current Behaviors**
*   **Rapid Fire (Julia):** Multi-hit ranged.
*   **Drain (Rebus):** Damage + Self-heal.
*   **Blast/Nuke (Rebus/Miguel):** AoE.
*   **Scan/Barrier/Heal:** Intel and Support.

## 2.9. Enemies & Anomaly Taxonomy

Enemies are non-human manifestations (Infestations, Ooze, Stalker, Abomination).
Defined in `$dataEnemies` with `aiConfig` controlling behavior (Hunter, Patrol, Turret, etc.).

## 2.10. Floors & Locations

Procedurally generated based on `$dataFloors`. Themes include Hospitals, Universities, Subways, and Favelas.

## 2.11. Items, Gear & Inventory

*   **Items:** Consumables for HP (Meds) and PE (Stims).
*   **Equipment:** Weapons (modify ATK/Skills) and Armor (modify DEF).
*   **Inventory:** Shared, capped at 20 slots.

## 2.12. UI & Narrative

*   **Persistent Windows:** Squadron, Tactics, Minimap, Log, Optical Feed.
*   **Modals:** Inventory, Status.
*   **Narrative:** Case File system to frame anomalies and influence endings.

## 2.13. Future Scope

*   Expand Intel/Scan systems.
*   Expand Status Effects system (beyond basic Stun/Poison/Barrier).
*   Flesh out Case File UI and decision mechanics.
*   Add optional dungeons and narrative flags.
