# Control Scheme Redesign Proposals

The current control system relies on a unified `Window_Tactics` for all combat actions and a separate modal system for Inventory/Status. The objective is to split these into two distinct, controller-friendly inputs:
1.  **Skills Button:** Opens a list of skills with cursor memory and range preview.
2.  **Menu Button:** Opens a Party Menu (Inventory + Status).

Below are 4 proposed variations of this design, ranging from conservative to experimental.

---

## Proposal 1: The "Classic JRPG" Standard
*A traditional, reliable approach familiar to fans of Final Fantasy or Persona.*

### Input Mapping
*   **Action (X/Square):** Open **Skills Menu**.
*   **Menu (Y/Triangle or Start):** Open **Party Menu**.
*   **Cancel (B/Circle):** Close current menu.

### UI Design
1.  **Skills Menu:**
    *   A vertical list appearing over the bottom-right or center.
    *   **Cursor Memory:** Remembers the last used skill.
    *   **Preview:** Highlighting a skill immediately draws the range grid on the map (reusing existing `Renderer.showRange` logic).
2.  **Party Menu:**
    *   A full-screen (or large modal) paused interface.
    *   Tabs or a side-list for "Inventory", "Status", "Formation", "Options".
    *   Cycle tabs with L/R bumpers.

### Implementation Details
*   Extract skill logic from `Window_Tactics` into a new `Window_SkillList`.
*   Refactor `Window_Inventory` and `Window_Status` to be sub-views of a new `Window_PartyMenu` container.
*   **Pros:** Intuitive, low learning curve, high information density.
*   **Cons:** Can feel "menu-heavy" / slow if overused.

---

## Proposal 2: The "Quick-Cast" Overlay
*Focused on flow and speed, minimizing visual obstruction.*

### Input Mapping
*   **Skill Button (R1/RB or Trigger):** **Hold** to open **Skill Wheel/Overlay**.
*   **Menu Button (Start/Options):** Toggle **Pause Menu**.

### UI Design
1.  **Skill Overlay:**
    *   Appears *only while the button is held* (or toggled with a tap).
    *   Displayed as a compact grid or radial menu near the active character.
    *   **Preview:** Instant range projection on selection.
    *   **Selection:** D-Pad or Face Buttons map to specific slots, or standard scrolling.
    *   **Cursor Memory:** Defaults to the last used skill.
2.  **Pause Menu:**
    *   Standard separate screen for Inventory/Status management.

### Implementation Details
*   Requires a new "Hold" input state logic or fast toggle.
*   `Window_SkillOverlay` needs to be minimal and transparent.
*   **Pros:** Very fast combat flow, modern feel.
*   **Cons:** Slightly more complex input logic (Hold vs Toggle); radial menus can be finicky on D-Pads.

---

## Proposal 3: The "Context Action" Bar
*Streamlines actions into a context-sensitive bottom bar, similar to MMO hotbars or tactical RPGs.*

### Input Mapping
*   **Skill Button (Square/X):** Focuses the **Skill Bar**.
*   **Menu Button (Triangle/Y):** Opens **Management Modal**.

### UI Design
1.  **Skill Bar:**
    *   A horizontal bar at the bottom of the screen (replacing the current Tactics list).
    *   When focused, D-Pad Left/Right cycles skills.
    *   **Preview:** Range shows immediately on focus.
    *   **Cursor Memory:** Remembers last selection index.
2.  **Management Modal:**
    *   A unified window combining Inventory and Status.
    *   Split view: Left side Inventory, Right side active character Status.

### Implementation Details
*   Replace `Window_Tactics` with `Window_Hotbar`.
*   UI navigation becomes horizontal for skills.
*   **Pros:** Keeps eyes on the field (bottom peripheral); very clear for controller D-pad.
*   **Cons:** Horizontal scrolling can be slow for long skill lists.

---

## Proposal 4: The "Tactical Cursor" Inversion
*Focuses on the grid first, actions second. Best for precise positioning.*

### Input Mapping
*   **Skill Button (X/Square):** Enters **Targeting Mode** (Free Cursor).
*   **Menu Button (Start):** Party Menu.

### UI Design
1.  **Targeting Mode:**
    *   Pressing button hides UI and spawns a cursor on the map.
    *   Move cursor to a target (Enemy or Ally).
    *   Press Confirm to open a **Context Menu** specific to that target (e.g., "Attack", "Fireball", "Heal").
    *   **Preview:** Range is checked implicitly (valid targets highlighted).
2.  **Cursor Memory:**
    *   Cursor remembers last cursor position, not last skill.
    *   However, the "Last Skill" can be the default option in the context menu.

### Implementation Details
*   Major shift from "Select Skill -> Select Target" to "Select Target -> Select Action".
*   Requires new `InputManager` state `TARGETING`.
*   **Pros:** Highly immersive, reduces UI clutter, feels very "Tactical".
*   **Cons:** Slower for repetitive actions (AOE skills need special handling).

---

## Recommendation

**Proposal 1 (Classic JRPG)** is the safest and most robust path given the current architecture (`Window_Base`, `UIManager`). It directly addresses the user's request for "Cursor Memory" and "Range Preview" without requiring a fundamental rewrite of the combat loop (like Proposal 4) or complex input handling (like Proposal 2).

### Next Steps for Proposal 1:
1.  Create `Window_SkillList` (subclass of `Window_Base`).
2.  Create `Window_PartyMenu` (tabbed container).
3.  Update `InputManager` to distinguish `SKILL` and `MENU` actions.
4.  Update `Game_Map` input handling to route these inputs.
