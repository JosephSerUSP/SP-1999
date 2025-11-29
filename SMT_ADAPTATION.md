# SMT Adaptation: Protocol Nullifier -> Tokyo Apocalypse

## Narrative Assessment
The "Stillnight" engine is structurally perfect for a first-person dungeon crawler (DRPG) like *Shin Megami Tensei*.
- **Strengths:**
    - The **Banter System** is a natural fit for "Demon Conversations" and partner commentary.
    - The **Turn-Based Combat** with speed/initiative logic works for SMT's press-turn or standard turn interactions.
    - The **3D Grid Rendering** captures the SNES/PS1 era SMT aesthetic (e.g., SMT1/2, Soul Hackers).
    - **Floor Generation** allows for the "Endless" feel of the Expanse or large Tokyo districts.
- **Gaps:**
    - **Branching Dialogue:** The engine currently lacks user input during cutscenes. This is critical for Alignment choices.
    - **Party Management:** The current "Rotation" system is unique. SMT usually has a fixed active party + stock. *Adaptation:* I will hybridize this. You have an active "Squad" (3 members) and a "COMP" (Stock). You can swap members from the COMP.
    - **Negotiation:** The core SMT mechanic. Needs a UI for "Talk".

## Campaign Structure: The Tokyo Apocalypse
We will adapt the SMT1 arc into a condensed 20-floor run.

### Biomes (5 Floors each)
1.  **Kichijoji (Floors 1-5):**
    -   *Theme:* Hospital/Arcade/Suburbs.
    -   *Visuals:* Grey walls, sterile lights.
    -   *Enemies:* Pixie, Kobold, Cait Sith.
    -   *Boss:* Orias (Introduction to Chaos).
2.  **Shinjuku (Floors 6-10):**
    -   *Theme:* Ruined City/Resistance Base.
    -   *Visuals:* Red sky (fog), concrete rubble.
    -   *Enemies:* Jack Frost, Pyro Jack, Bodyconian.
    -   *Boss:* Thor (Proxy).
3.  **Roppongi (Floors 11-15):**
    -   *Theme:* High Tech/Illusion/Law.
    -   *Visuals:* Purple neon, clean metal.
    -   *Enemies:* Angel, Archangel, Power.
    -   *Boss:* Nebiros/Alice (Introduction to Law).
4.  **The Cathedral (Floors 16-20):**
    -   *Theme:* Divine/Demonic War.
    -   *Visuals:* Gold and Flesh.
    -   *Enemies:* Girimehkala, Throne, Surt.
    -   *Boss:* Asura (Chaos) or Michael (Law) - dependent on alignment (or just fixed neutral boss for this scope: YHVH avatar?). *Decision:* Fixed Boss "The Administrator" for simplicity, but dialogue reflects alignment.

## Mechanics Adaptation

### 1. Alignment
-   **Law:** Order, Peace, Control. (Blue)
-   **Chaos:** Freedom, Strength, Anarchy. (Red)
-   **Neutral:** Humanism, Balance. (White)
-   *Implementation:* Hidden variable `alignment` (-10 to +10). Choices in negotiation and cutscenes shift this.

### 2. The COMP (Stock System)
-   The player carries a "COMP" (Computer).
-   **Stock:** Holds up to 8 Demons.
-   **Summon:** Swap an active party member (who isn't the Hero) with a Demon from the COMP.
-   **Magnetite:** Simplified. Demons cost nothing to maintain, but maybe cost "PE" (MP) to summon? For this "Lite" version, summoning is free, but takes a turn.

### 3. Negotiation (Talk)
-   New Action: `Talk`.
-   Initiates a dialogue with the targeted enemy.
-   **Flow:**
    1.  Enemy asks a question or demands something (HP, Item).
    2.  Player chooses from a list (Yes/No, Threaten, Joke).
    3.  **Result:**
        -   *Join:* Enemy becomes a Item (Card) or directly enters Stock.
        -   *Item:* Enemy gives item and leaves.
        -   *Leave:* Enemy leaves.
        -   *Attack:* Enemy gets free turn.

### 4. Spells (Skills)
-   **Agi/Bufu/Zio/Zan:** Elemental Damage.
-   **Dia/Media:** Healing.
-   **Tarukaja/Rakukaja:** Buffs (The engine already supports traits/states).
-   **Mudo/Hama:** Instant kill (or high damage).

## Data Structures

### Game_Party
-   `stock`: Array of `Game_Actor` (Demons).
-   `macca`: Currency (optional, can stick to Items).
-   `alignment`: Integer.

### Game_Enemy
-   `personality`: 'kind', 'aggressive', 'dumb'.
-   `talkEvents`: Array of dialog objects.

### Game_Actor
-   `race`: 'Hero', 'Fairy', 'Beast', 'Divine', etc.
