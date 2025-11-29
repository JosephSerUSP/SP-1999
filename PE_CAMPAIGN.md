# Protocol: Mitochondria (Parasite Eve Adaptation)

## 1. Narrative Assessment & Adaptation

The "Stillnight" engine, with its grid-based exploration and "blobber" perspective, offers a claustrophobic atmosphere perfect for *Parasite Eve*'s survival horror elements. While the original game relied on cinematic 3rd-person cameras, this adaptation will lean into the **Dungeon Crawler (DRPG)** genre (ala *Shin Megami Tensei: Strange Journey*), emphasizing the isolation and the "climb" through a mutating New York City.

### Setting: The Stack (Neo-Mitochondrial Tower)
Instead of a sprawling city map, the game takes place in "The Stack" - a metaphorical representation of NY's locations compressed into a 20-floor vertical dungeon.

### Characters (The Squad)
*   **Aya (The Host):** High PE (Magic) & Gun handling. The only one capable of resonating with the bosses.
*   **Kyle (The Detective):** High Defense & Physical. Represents the NYPD/Daniel support. Grounded, skeptical.
*   **Eve (The Clone):** High Damage, Glass Cannon. Represents the volatile mitochondrial power.

## 2. Campaign Structure

The campaign is divided into 4 Biomes (Days), each culminating in a boss fight.

### Biome 1: The Opera (Floors 1-5)
*   **Theme:** Carnegie Hall / Theater. Red velvet, fire, panic.
*   **Enemies:** Sewer Rats, Mutated Actors (Zombies), Bats.
*   **Boss:** **Melissa (The Actress)**. First form of Eve.
*   **Narrative:** The awakening. Everyone at the opera spontaneously combusts. Aya is untouched.

### Biome 2: The Park (Floors 6-10)
*   **Theme:** Central Park / Zoo. Overgrown, frozen, wild.
*   **Enemies:** Snakes, Monkeys, Bears (Mutated), Plant Hybrids.
*   **Boss:** **Giant Worm**.
*   **Narrative:** Nature reclaiming the city. The mitochondria affecting animals.

### Biome 3: The Hospital (Floors 11-15)
*   **Theme:** St. Francis Hospital / Lab. Sterile white, blood, machinery.
*   **Enemies:** Slimes, Mixed Men (Amalgamations), Nurse Variants.
*   **Boss:** **Spermatozoa / The Crib**.
*   **Narrative:** The origin of the experiment. Maya's cells.

### Biome 4: The Museum (Floors 16-20)
*   **Theme:** Museum of Natural History. Fossils, ancient biology, evolution.
*   **Enemies:** Raptors, Scorpions, Armored Knights.
*   **Boss:** **Ultimate Being**.
*   **Narrative:** Evolution accelerates. The birth of the new species.

## 3. Gameplay Mechanics

### Mitochondrial Skills (PE)
Replacing "Mana", **PE (Parasite Energy)** fuels skills.
*   **Scan:** Analyze enemy stats (Liberate).
*   **Heal:** Self-regeneration (Metabolism).
*   **Plasma:** Single target energy shot.
*   **Combust:** AoE Fire.
*   **Barrier:** Defense up (Prerelease).
*   **Liberate:** Ultimate form (High cost nuke).

### Narrative Delivery
*   **Cutscenes:** Start and end of each Biome. Visual Novel style dialogs.
*   **Banter:** Character reactions to specific enemies ("It's just a rat... oh god, look at its teeth") and environments.
*   **Logs:** System messages tracking the "Evolution Level".

## 4. Implementation Plan
*   **Engine:** Add `Event Trigger` system to `Game_Map` for mid-floor story beats.
*   **Data:** Populate `$dataEnemies`, `$dataFloors`, and `$dataCutscenes` with the content above.
