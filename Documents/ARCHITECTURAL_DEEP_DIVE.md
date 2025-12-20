# Architectural Deep Dive: Stillnight - Eve of the Stack

## 1. Executive Summary

This document outlines the architectural evolution required to transition *Stillnight* from a linear roguelike prototype into a narrative-driven campaign RPG. The core challenge is shifting from a single "always-in-dungeon" loop to a multi-modal system that supports a Narrative Hub, a World Map, and modular Missions, while retaining the "Logic-First" and "Data-Driven" philosophies of the existing engine.

## 2. The Unified Map Architecture

We will adopt a **Unified Map Architecture**. Instead of creating distinct, hard-coded "Hub Mode" and "Dungeon Mode" engines, we will utilize the existing `Game_Map` logic for both, distinguishing them via data flags (`peaceful`) and generator configurations (`fixed` vs `procedural`).

### 2.1. Why Unified?

*   **Consistency:** Movement mechanics (grid-based, step-based) remain identical across the game, reinforcing the "Logic-First" pillar.
*   **Maintainability:** We avoid splitting the `SceneManager` loop or creating parallel `InputDelegate` systems.
*   **Flexibility:** A "Dungeon" can easily become a "Hub" (e.g., clearing a floor makes it safe), and a "Hub" can become a "Dungeon" (e.g., Base Invasion event) simply by toggling flags.

### 2.2. The Modes (Data-Driven)

We distinguish states not by engine class, but by **State Flags** in `$gameSystem` or the current `Mission` context.

1.  **Exploration Mode (Hub/Safe Areas)**
    *   **Configuration:** `peaceful: true` in Map Data.
    *   **Input:** Standard Grid Movement.
    *   **Combat:** Disabled. Skills are locked.
    *   **Enemies:** Replaced by **NPCs** (Event Entities).
    *   **Mechanic:** Moving does *not* trigger enemy turns (or triggers empty turns). Bumping triggers **Interaction**.

2.  **Combat Mode (Dungeon/VELDT)**
    *   **Configuration:** `peaceful: false`.
    *   **Input:** Grid Movement + Combat Actions.
    *   **Combat:** Active.
    *   **Enemies:** Hostile.
    *   **Mechanic:** Moving triggers `processTurn` and Enemy AI. Bumping triggers **Attack**.

3.  **World Map Mode (Menu)**
    *   **View:** 2D Menu Interface.
    *   **Context:** Selection screen for Missions/Locations.
    *   **Implementation:** A distinct `UIManager` state, effectively pausing the `Game_Map`.

## 3. The Mission System

The **Mission** is the atomic unit of the campaign. It encapsulates the narrative context, the location data, and the success criteria.

### 3.1. Data Schema (`$dataMissions`)

Missions will be defined in a new data file, enabling modularity.

```javascript
const $dataMissions = {
    "MSN-001": {
        id: "MSN-001",
        title: "The Phantom Signal",
        description: "Investigate the anomalous readings at the unfinished subway station.",

        // Requirements
        requirements: {
            minLevel: 1,
            flags: ["INTRO_COMPLETE"]
        },

        // The Dungeon Generator Config
        location: {
            type: "dungeon",
            theme: "subway",
            floorCount: 3,
            peaceful: false // Enables Combat
        },

        // Narrative Hooks
        onStart: "CUTSCENE_MSN_001_START",
        onComplete: "CUTSCENE_MSN_001_END"
    },
    "HUB-001": {
        id: "HUB-001",
        title: "INTRA HQ",
        location: {
            type: "fixed", // Uses a pre-defined layout
            mapId: "hq_layout_01",
            peaceful: true // Disables Combat
        }
    }
};
```

### 3.2. Refactoring `Game_Map.processTurn`

To support this, `Game_Map` needs a slight refactor to respect the `peaceful` flag.

```javascript
// Conceptual Logic
Game_Map.prototype.processTurn = async function(dx, dy) {
    // 1. Move Player
    this.movePlayer(dx, dy);

    // 2. Check Triggers
    this.checkTriggers();

    // 3. Enemy Phase (Skipped if peaceful)
    if (!this.isPeaceful()) {
        await this.updateEnemies();
    }

    // 4. Update UI
    UIManager.refresh();
};
```

## 4. The Investigation & Flag System

The "Mystery" is driven by a robust **Global State System** (Flags/Switches).

### 4.1. Flag Architecture

We will introduce `$gameSwitches` (boolean) and `$gameVariables` (integers/strings) within `$gameSystem`.

*   **Flags (`$gameSwitches`)**: `MET_OLAVO`, `TRUE_ENDING_LOCKED`.
*   **Variables (`$gameVariables`)**: `CHAOS_METER`, `DAYS_REMAINING`.

### 4.2. Dynamic VELDT Generation

VELDT generation parameters will be dynamic functions rather than static objects.

```javascript
// In Game_Map.setup()
function getVeldtConfig() {
    let config = { ...BASE_VELDT_CONFIG };
    if ($gameSystem.switches["CHAPTER_2_STARTED"]) {
        config.density += 0.2;
    }
    return config;
}
```

## 5. Hub & Interaction Architecture

### 5.1. The "Interaction" Verb

We will normalize "Bumping" as a context-sensitive action.

*   **If Target is Hostile:** Trigger `playerAttack()`.
*   **If Target is Friendly/Neutral:** Trigger `playerInteract()`.

### 5.2. NPC Implementation

NPCs will be added as a new entity type or a flag on `Game_Enemy`.
*   **Class:** `Game_Event` (extends `Game_Character`).
*   **Properties:** `sprite`, `dialogueId`.
*   **Interaction:** Opens `Window_Dialogue`.

## 6. Character Decoupling (The "True Ending" Requirement)

The True Ending requires switching control to "Subject-03" (Eve/Pattern).

### 6.1. Implementation

*   **Avatar:** `Renderer3D` updates player mesh based on `$gameParty.leader()`.
*   **Solo Mode:** Set `$gameParty.members = [Eve]`.
*   **Persistence:** Save active party composition in `$gameSystem`.

## 7. Refactoring Roadmap

1.  **Phase 1: Unified Map Updates**
    *   Add `peaceful` flag to Map Data.
    *   Modify `Game_Map.processTurn` to skip enemy phase if peaceful.
    *   Implement `Game_Event` for NPCs.
2.  **Phase 2: The Data Layer**
    *   Create `$dataMissions.js` and `$gameSwitches`.
3.  **Phase 3: Hub Implementation**
    *   Create a "Fixed" Map Generator for the Hub.
    *   Implement Interaction/Dialogue UI.
4.  **Phase 4: World Map & VELDT**
    *   Implement World Map Menu.
    *   Implement Dynamic VELDT config logic.

## 8. Conclusion

By adopting the **Unified Map Architecture**, we treat the "Hub" as just a special kind of Dungeon—one without monsters and with a fixed layout. This approach maximizes code reuse, ensures consistent "Logic-First" movement mechanics, and simplifies the transition between combat and narrative modes.
