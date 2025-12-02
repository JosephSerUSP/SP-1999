# Stillnight: Gameplay Mechanics & Deep Systems Analysis

## Executive Summary
"Stillnight: Eve of the Stack" presents a unique spin on the grid-based dungeon crawler genre by implementing a **Forced Rotation ("Tag Team")** mechanic. Unlike traditional RPGs where the active character takes the consequences of their turn, Stillnight forces a character swap *after* an action but *before* the enemy reaction. This creates a distinct tactical rhythm: **You attack with Character A to position Character B to take the hit.**

This document analyzes the current systems, identifies the emergent "meta", and proposes specific expansions to deepen these interactions.

---

## 1. The Core Loop: The "Tag Team" Mechanic
The most significant emergent behavior arises from the interaction between `Game_Map.processTurn` and `Game_Party.rotate`.

### The Cycle
1. **Player Action**: The Active Actor (e.g., Aya) moves or attacks.
2. **Turn End**: Status effects (Poison) apply to Aya.
3. **Rotation**: The Party rotates. Active Actor becomes Kyle.
4. **Enemy Phase**: Enemies move and attack the *new* Active Actor (Kyle).

### Emergent Strategy: "The Tank Switch"
Because damage is calculated against the actor present during the Enemy Phase, the optimal strategy is to ensure **Kyle (High DEF)** is the active actor whenever ending a turn adjacent to an enemy.

*   **Scenario**: Aya is 1 tile away from a Hunter.
*   **Bad Play**: Aya waits. -> Rotation to Kyle. -> Kyle waits. -> Rotation to Eve (Low DEF). -> Enemy attacks Eve.
*   **Pro Play**: Aya attacks (Range 1). -> Rotation to Kyle. -> Enemy attacks Kyle (High DEF).

### Analysis of Depth
*   **Pros**: This forces players to think 2-3 turns ahead. You cannot simply look at the current character's HP; you must look at the *next* character's ability to survive.
*   **Cons**: It can feel counter-intuitive that the character who "did the work" vanishes before the consequences arriving.
*   **Opportunity**: Introduce skills that manipulate this rotation.
    *   *Pass*: Skip turn without rotating.
    *   *U-Turn*: Swap order (Reverse rotation).
    *   *Cover*: A state where one actor takes damage for the others regardless of who is active.

---

## 2. Combat Mathematics & Scaling

### Damage Formula
$$ \text{Damage} = (\text{ATK} \times 2 - \text{DEF}) \times \text{Variation} $$

*   **Scaling**: This is a "Threshold" or "Subtraction" system.
*   **Breakpoint**: If $\text{DEF} \ge \text{ATK} \times 2$, damage is theoretically 0 (clamped to 1).
*   **Implication**: Defense is exponentially more valuable than Health. A buff of +2 DEF (Barrier) effectively negates 4 points of incoming ATK value. Against an enemy with 10 ATK, 18 DEF vs 20 DEF is the difference between taking 2 damage and taking 0 (1).

### The "Glass Cannon" Problem
*   **Eve (Subject)**: Low DEF (1), High HP (35-70?). Actually her HP is lowest (35). She is extremely vulnerable.
*   **Meta**: Eve must *never* end a turn adjacent to an enemy. Her skills (Combust/Nuke) are AoE, encouraging her to clear rooms so no one can attack her.

### Opportunity: Elemental/Tactical Diversity
Currently, "Color" is visual, not mechanical.
*   **Proposal**: Introduce "Resonance".
    *   Attacking an enemy of the *Same Color* deals reduced damage but restores PE.
    *   Attacking an enemy of the *Opposite Color* deals bonus damage.
*   **Status Effects**:
    *   Current: Stun, Poison, Barrier.
    *   Missing: Blind (Accuracy down), Silence (No skills), Root (No move, but can attack).

---

## 3. AI Behavior & Exploitation

### Current Behaviors
*   **Hunter**: Pathfinds to player.
*   **Patrol**: Random walk -> Hunter on alert.
*   **Ambush**: High stats, behaves like Hunter.
*   **Turret**: Stationary, Ranged attack (Range 5).
*   **Flee**: Run away at low HP.

### Exploitation Strategies
1.  **Cornering**: Hunters try to move closer. By funneling them into a hallway, you fight 1v1. Standard roguelike tactic.
2.  **Turret Cheese**: Turrets do not move. If you have a Range 6 skill (Aya's Rapid Fire), you can kill Range 5 Turrets without retaliation.
3.  **The "Shimmy"**: Stepping back and forth to force an enemy to move into a specific tile for an AoE setup.

### Missing AI Depth
*   **Pack Tactics**: Enemies do not benefit from flanking or grouping.
*   **Healers**: No enemies heal each other.
*   **Summoners**: No enemies spawn other enemies.

---

## 4. Resource Management: PE & Inventory

### PE (Power Energy)
*   Regenerates slowly (+2 per turn).
*   Skills cost 10-60.
*   **Meta**: You effectively have 1 big spell every 10-15 turns naturally, or you rely on "Stim" items.
*   **Tension**: Do I use `Heal` (15 PE) or `Grenade` (15 PE) to kill the source of damage? Usually, prevention (killing) is better than cure, making `Heal` a fallback for mistakes.

### Inventory (20 Slots)
*   Shared inventory for 3 characters.
*   Loot is frequent.
*   **Meta**: You are forced to discard items constantly.
*   **Strategy**: Aggressively use consumables ("Medicine", "Stim") to free up slots for Equipment. Hoarding is punished.

---

## 5. Proposed System Expansions

### A. The "Synergy" System (Combo Magic)
Reward the rotation mechanic.
*   **Primer & Detonator**:
    *   Aya uses "Oil Shot" (Applies 'Oiled').
    *   Rotate to Kyle (Wait).
    *   Rotate to Eve -> Uses "Combust".
    *   **Effect**: 'Oiled' targets take 200% Fire damage and explode.
*   **Design Goal**: Make the rotation an offensive combo tool, not just a defensive toggle.

### B. Stealth & Aggro Management
The codebase hints at "Stealth" (Aya's banter, `Game_Enemy.alerted`), but it is underutilized.
*   **Implementation**:
    *   State `STEALTH`: Reduces aggro range from 7 to 2.
    *   Action `Hide`: Aya skill. Costs PE. Enters Stealth.
    *   Bonus: Attacks from Stealth ignore DEF.

### C. Demon Negotiation (Restoration)
Bringing back the "Talk" mechanic mentioned in legacy notes.
*   **Mechanic**: Instead of attacking, use "Talk".
*   **Context**: Based on Party Member + Enemy Type.
    *   *Eve* talks to *Mutants* (Connection to source).
    *   *Kyle* talks to *Drones/Tech* (Hacking).
*   **Reward**: Avoid combat, gain Intel (Map Reveal), or gain Items.

### D. Verticality & Environment
*   **Hazards**: Toxic sludge tiles (Poison on step).
*   **Cover**: Barrels/Crates that provide +5 DEF but break after 10 damage.

---

## 6. Discrepancy Report & Fixes
*   **Stealth Logic**: The memory suggests stealth reduces aggro range, but `Game_Map.updateEnemies` hardcodes `dist < 7`.
    *   *Fix*: Change `7` to `actor.isStateAffected('stealth') ? 3 : 7`.
*   **Negotiation**: Entirely missing from code. Needs implementation in `Game_Map` and `UIManager`.

## Conclusion
Stillnight's "Tag Team" rotation is a hidden gem of a mechanic that elevates it above a standard crawler. By leaning into this—making the *order* of characters matter for Combos and Defense—the game can achieve significant depth without complex new physics or controls.
