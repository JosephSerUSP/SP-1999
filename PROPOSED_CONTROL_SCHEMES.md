# Proposed Control Schemes

The current control scheme relies on a traditional "Menu Mode" vs "Map Mode" toggle, which creates friction in combat, especially with the "Tag Team" mechanic requiring frequent adaptations to new skill sets. The following proposals aim to unify movement and action, streamline skill usage, and make party status more accessible via a controller.

## 1. The "Combat Shift" (Trigger-Based Shortcuts)
*Inspired by: Kingdom Hearts, Dragon Age: Inquisition, FF14 Cross Hotbar*

**Concept:**
Keep the player in control of movement at almost all times. Use "Trigger/Shoulder" buttons to shift the function of the Face Buttons (A/B/X/Y) from "Interact/Cancel" to "Skill/Item Shortcuts".

**Controls:**
- **L Stick / D-Pad:** Movement.
- **R Stick:** Camera / Orientation (if applicable) or selection of visible targets.
- **Face Buttons (Default):**
    - `A (Cross)`: Interact / Basic Attack (Forward).
    - `B (Circle)`: Cancel / Dash (if implemented).
    - `X (Square)`: Wait / Guard.
    - `Y (Triangle)`: Open Party Menu (Status/Equip).
- **Hold `R1 / RB` (Skill Shift):**
    - Overlays a small "Diamond" UI over the face buttons on screen.
    - `A`, `B`, `X`, `Y` execute Skill 1, 2, 3, 4 instantly.
    - *Adaptation for Tag Team:* When the active character changes, the UI updates the 4 slots immediately. The player learns "A is always my cheap projectile", "Y is my strong nuke" for each character.
- **Hold `L1 / LB` (Item Shift):**
    - Similar to Skill Shift but for Quick Items (e.g., Potion, Ether).
    - Or, holding L1 transforms D-Pad into Item Selection and A to use.

**UI Changes:**
- Replace the "Tactics" side-window with a **Compact HUD** in the bottom-right or bottom-center.
- Show the 4 face-button icons with current skill assignments constantly (or fade them in when R1 is held).
- Party Status (HP/PE) is permanently visible in a corner (Squadron Panel), no need to "access" it to see HP. Detailed status opens a full-screen menu via `Y`.

**Pros:**
- Extremely fast combat flow.
- "Muscle memory" develops quickly for skills.
- No scrolling through lists.
**Cons:**
- Limits characters to 4 quick skills (others must be accessed via a slower submenu or "Cycle" button).

---

## 2. The "Command Ring" (Radial Menu)
*Inspired by: Secret of Mana, Apex Legends Ping System*

**Concept:**
Bringing the menu *to* the player. Pressing a button opens a ring menu around the character, pausing the action (or slowing it). Selection is done via the Stick, which feels analog and fluid.

**Controls:**
- **L Stick:** Movement.
- **Face Buttons:**
    - `A`: Attack / Confirm.
    - `Y`: Toggle Ring Menu.
- **Ring Menu Navigation:**
    - When `Y` is pressed, a Ring appears.
    - **L Stick** points to a wedge (Skill, Item, Tactics, Status).
    - **A** confirms selection.
    - If "Skill" is selected, a sub-ring of specific skills appears.
    - *Quick Select:* "Flicking" the stick and pressing A can happen in milliseconds once memorized.
- **Targeting:**
    - After selecting a skill, the Ring vanishes, and a **Cursor** appears on a grid tile.
    - **L Stick** moves the cursor. **A** confirms.

**UI Changes:**
- Remove the persistent "Tactics" window.
- UI is entirely "Diegetic" or overlays the game view only when needed.
- Party Status is a wedge in the Ring (showing brief stats) or opens a submenu.

**Pros:**
- Stylish and preserves screen real estate (immersive).
- Very controller-friendly (sticks are great for radial selection).
- Accommodates large lists of items/skills better than the "Combat Shift" method.
**Cons:**
- Can feel "clunky" if the menu animation isn't instant.
- Obscures the center of the screen (the player character) during selection.

---

## 3. The "Tactical Grid" (Cursor Mode)
*Inspired by: Fire Emblem, Tactics Ogre, XCOM*

**Concept:**
Embrace the grid nature. Decouple movement from action completely. The game has two modes: "Move Mode" and "Action Mode".

**Controls:**
- **Move Mode (Default):**
    - **D-Pad:** Moves the character directly.
    - **A:** Attack front / Interact.
- **Action Mode (Press `X` or `Trigger`):**
    - The camera focuses on the cursor.
    - **D-Pad:** Moves a **Target Cursor** freely around the map.
    - Hovering over an enemy shows hit chance / projected damage.
    - Hovering over the Player and pressing **A** opens the **Action List** (Move, Attack, Skill, Item, Wait).
    - Select Action -> Select Target -> Execute.
- **Shoulder Buttons (L1/R1):**
    - Cycle through Party Members (even inactive ones) to view their Status/Equip in the sidebar without changing the active turn order.

**UI Changes:**
- The "Tactics" window becomes context-sensitive to the *Cursor*, not just the active player.
- If Cursor is on Player -> Show Actions.
- If Cursor is on Enemy -> Show Enemy Stats.
- Targeting is integrated into the action flow (Action -> Cursor is already active).

**Pros:**
- Highest precision. Solves "facing the wrong way" completely.
- Allows checking enemy stats easily (just move cursor over them).
- Very "Strategic" feel.
**Cons:**
- Slowest pace of the three.
- Might feel too "heavy" for a game that seems to want quicker dungeon crawling.

---

## Recommendation

Given the **"Tag Team" mechanic** and the dungeon-crawler vibe:

**Proposal #1 (Combat Shift)** is the strongest candidate.
- **Why:** The Tag Team mechanic forces the player to adapt to a new character constantly. Having 4 consistent "Face Button slots" (e.g., Top=Nuke, Left=Stun, Right=AoE, Bottom=Heal) allows the player to map *archetypes* to buttons. Even if the character changes from a Gunner to a Mage, "Triangle" can always be the "Strong Attack".
- It keeps the flow fast, which fits the "Bump Attack" nature of the basic gameplay.
- It removes the visual disconnect of looking at a sidebar menu.
