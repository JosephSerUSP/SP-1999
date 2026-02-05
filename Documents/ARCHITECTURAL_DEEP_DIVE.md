> **Status:** Proposal / Roadmap. This document outlines future architectural goals and does not reflect the current codebase state.

# Architectural Deep Dive: Stillnight - Eve of the Stack

## 1. Executive Summary

This document outlines the architectural evolution required to transition *Stillnight* from a linear roguelike prototype into a narrative-driven campaign RPG. The core challenge is shifting from a single "always-in-dungeon" loop to a multi-modal system that supports a Narrative Hub, a World Map, and modular Missions, while retaining the "Logic-First" and "Data-Driven" philosophies of the existing engine.

## 2. The Multi-Modal State Machine

Currently, `SceneManager` runs a single `loop()` that feeds input directly to `$gameMap`. To support the new requirements, we must formalize the concept of **Game Modes**.

### 2.1. The Modes

We will introduce a `Game_Mode` enum or class system to arbitrate Input and Rendering context.

1.  **MODE_DUNGEON (Existing)**
    *   **View:** 3D Viewport + HUD.
    *   **Input:** Grid movement, Bump Combat, Skill usage.
    *   **Logic:** Standard Roguelike loop (Player Turn -> Enemy Turn).
    *   **Context:** Used for all "Missions" and the "VELDT".

2.  **MODE_HUB (New - "Safe" 3D)**
    *   **View:** 3D Viewport (Same engine as Dungeon) + Minimal HUD (No combat logs/skills).
    *   **Input:** Grid movement, Interaction (Talk/Shop).
    *   **Logic:** Real-time or semi-real-time. No enemy turn processing.
    *   **Context:** The "Base of Operations".
    *   **Key Distinction:** "Bump" triggers `Event` interaction instead of `Attack`.

3.  **MODE_WORLD_MAP (New - Menu)**
    *   **View:** 2D Interface (likely a stylized map graphic with menu overlays).
    *   **Input:** Menu Navigation (Up/Down/Select).
    *   **Logic:** Pure UI state.
    *   **Context:** Selecting where to go next (e.g., "Travel to USP", "Enter VELDT").

### 2.2. Implementation Strategy

Instead of rewriting `SceneManager` entirely, we can implement a `ModeManager` (or expand `SceneManager`) that swaps the *Input Delegate*.

```javascript
// Conceptual Pseudocode
SceneManager.update = function() {
    if (this.mode === MODES.DUNGEON) {
        $gameMap.processTurn(input); // Existing logic
    } else if (this.mode === MODES.HUB) {
        $gameMap.processHubMovement(input); // New safe movement logic
    } else if (this.mode === MODES.WORLD_MAP) {
        UIManager.processWorldMap(input);
    }
}
```

## 3. The Mission System

The **Mission** is the atomic unit of the campaign. It encapsulates the narrative context, the location data, and the success criteria.

### 3.1. Data Schema (`$dataMissions`)

Missions will be defined in a new data file, enabling modularity and easy expansion.

```javascript
const $dataMissions = {
    "MSN-001": {
        id: "MSN-001",
        title: "The Phantom Signal",
        description: "Investigate the anomalous readings at the unfinished subway station.",

        // Requirements to see/accept this mission
        requirements: {
            minLevel: 1,
            flags: ["INTRO_COMPLETE"], // Must have completed intro
            party: ["Rebus"] // Rebus must be in the party
        },

        // The Dungeon Generator Config
        location: {
            type: "dungeon", // Uses DungeonGenerator
            theme: "subway", // Tileset/Fog config
            floorCount: 3,
            enemyTable: "subway_early", // Reference to a spawn table
            boss: "BOSS_SIGNAL_GHOST" // Boss at the end
        },

        // Narrative Hooks
        onStart: "CUTSCENE_MSN_001_START",
        onComplete: "CUTSCENE_MSN_001_END",

        // Rewards
        rewards: {
            items: ["ITEM_MEDKIT"],
            flags: ["MSN_001_CLEARED"] // Sets this flag on completion
        }
    }
};
```

### 3.2. Mission Logic Flow

1.  **Acceptance:** Player selects mission in `MODE_WORLD_MAP`.
2.  **Initialization:**
    *   System sets `currentMission = $dataMissions[id]`.
    *   `Game_Map` is reset.
    *   `GeneratorRegistry` is invoked with `mission.location` parameters.
    *   Mode switches to `MODE_DUNGEON`.
3.  **Execution:** Player progresses through floors.
4.  **Conclusion:**
    *   Victory: Boss defeated -> Apply Rewards -> Set Flags -> Return to Hub.
    *   Failure: Party Wipe -> Reload/Checkpoint -> Return to Hub.

## 4. The Investigation & Flag System

The "Mystery" is driven by a robust **Global State System** (Flags/Switches). This is a standard RPG pattern but crucial for the "Logic-First" approach.

### 4.1. Flag Architecture

We will introduce `$gameSwitches` (boolean) and `$gameVariables` (integers/strings) within `$gameSystem`.

*   **Flags (`$gameSwitches`)**: Track binary states.
    *   `"MET_OLAVO"`
    *   `"KNOWS_ABOUT_PROTOCOL_3"`
    *   `"TRUE_ENDING_LOCKED"`
*   **Variables (`$gameVariables`)**: Track counters or complex states.
    *   `"CHAOS_METER"` (if we track alignment)
    *   `"DAYS_REMAINING"`

### 4.2. Dynamic VELDT Generation

The User specified that the VELDT (the procedural VR dungeon) changes based on story progress. We will achieve this by making the **Generator Configuration** dynamic.

Instead of passing a static config to the generator, we pass a *function* or evaluate logic before generation.

```javascript
// In Game_Map.setup() or similar
function getVeldtConfig() {
    let config = { ...BASE_VELDT_CONFIG };

    if ($gameSystem.switches["CHAPTER_2_STARTED"]) {
        config.enemyTable = "veldt_phase_2";
        config.density += 0.2; // Harder
    }

    if ($gameSystem.switches["SAW_GHOST"]) {
        config.specialRooms.push("GHOST_ROOM");
    }

    return config;
}
```

This ensures the "Roguelike" elements (VELDT) feel responsive to the "Narrative" elements (Investigation).

## 5. Hub & Interaction Architecture

The Hub is a 3D environment, but "safe".

### 5.1. The "Interaction" Verb

In `MODE_DUNGEON`, bumping a target = Attack.
In `MODE_HUB`, bumping a target = Interact.

We will refactor `Game_Player.move` to delegate the "bump" action based on the current Mode.

*   **NPCs as Entities:** NPCs in the hub will be instances of `Game_Event` (a new class extending `Game_Character` or `Game_Enemy`), possessing a `sprite` and an `interaction` script.
*   **Visual Novel Interface:** Interaction triggers a new UI overlay (`Window_Dialogue`) that displays:
    *   Character Portrait (High Res).
    *   Background Art (blurred 3D view or static image).
    *   Dialogue Box (Typewriter text).
    *   Choices (if applicable).

### 5.2. World Map Menu

The World Map is a menu, not a playable space. It acts as the bridge between the Hub and Missions.

*   **Structure:** A list of available locations.
*   **Unlock Logic:** Locations appear only if their unlocking flag is set (e.g., `USP_UNLOCKED`).
*   **Mission Select:** Selecting a location opens the list of available Missions for that location.

## 6. Character Decoupling (The "True Ending" Requirement)

The True Ending requires switching control to "Subject-03" (Eve/Pattern) entirely, including in the Hub.

### 6.1. Separation of Concerns

Currently, the code often assumes "Player" is the "Squad". We must decouple:

1.  **`$gameParty.leader()`**: The character currently providing stats/skills for combat.
2.  **`$gamePlayer.avatar`**: The visual representation in the 3D world.
3.  **`$gameParty.members`**: The list of active characters.

### 6.2. Implementation

*   **Avatar:** The `Renderer3D` should update the player mesh based on `$gameParty.leader()`'s associated model/color. This is mostly supported but needs to be explicit.
*   **Solo Mode:** For the True Ending, we simply set `$gameParty.members = [Rebus]`. The existing turn-rotation logic needs to handle a single-member party gracefully (i.e., `nextActive()` just returns self).
*   **Persistence:** The active party composition must be saved in `$gameSystem` (or `$gameParty`'s save data) so that when returning to the Hub, the player is still controlling the correct character.

## 7. Refactoring Roadmap

To achieve this without breaking the existing build, we propose the following order of operations:

1.  **Phase 1: The Mode System**
    *   Refactor `SceneManager` to support `MODE_DUNGEON` vs `MODE_HUB`.
    *   Implement "Safe Movement" (no stamina drain, no enemy turn) in `Game_Map`.
2.  **Phase 2: The Data Layer**
    *   Create `$dataMissions.js`.
    *   Create `$gameSwitches` and `$gameVariables`.
3.  **Phase 3: The Hub & World Map**
    *   Build the World Map Menu UI.
    *   Implement the "Mission Start" logic (loading a specific generator config).
4.  **Phase 4: Dynamic Generation**
    *   Connect VELDT generation to `$gameSwitches`.
5.  **Phase 5: Narrative UI**
    *   Implement the VN-style Dialogue Window.
    *   Add NPC entities to the Hub.

## 8. Conclusion

This architecture respects the project's "Logic-First" limitation by keeping the core simulation (grid, turns, stats) as the engine for *both* combat and exploration. The introduction of specific **Modes** allows us to contextually disable combat mechanics (Stamina, Aggro) for the Hub without writing a separate engine. The **Mission** and **Flag** systems provide the data-driven backbone necessary for a branching, mystery-solving campaign.
