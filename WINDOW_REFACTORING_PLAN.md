# Window System Refactoring Plan

WHEN IMPLEMENTING THE REFACTOR, UPDATE THE DOCUMENT ACCORDINGLY.

## 1. Executive Summary
The current window system in `src/windows.js` relies on a monolithic `UIManager` that imperatively constructs DOM elements for various UI states (Inventory, Status, Target Selection). This "spaghetti code" approach tightly couples presentation logic with game state, making the UI brittle, difficult to maintain, and hard to customize.

This document proposes a **Hybrid Compositional Architecture** for the "Stillnight" project. By introducing **Layout Managers** and **Declarative Blueprints**, we will separate:
*   **Content**: "Dumb" reusable components (Labels, Gauges, Buttons).
*   **Positioning**: Explicit Layout Managers (Absolute, Flex, Grid).
*   **Logic**: dedicated Window classes that bind game state to the view.

## 2. Current Architecture Assessment

### 2.1. Issues with `src/windows.js`
*   **Imperative DOM Construction**: Methods like `showInventoryModal` and `showStatusModal` manually create `div` elements, set styles, and append children in long, nested sequences. This makes it impossible to visualize the layout structure from the code.
*   **Lack of Reusability**: Common elements like "Item Rows" or "Stat Bars" are redefined or copy-pasted across different methods (`refreshStatus`, `showInventoryModal`).
*   **Implicit State Management**: The `UIManager` directly manipulates `innerHTML` based on `$gameParty` state, leading to potential desyncs and XSS vulnerabilities (as flagged in `AUDIT_REPORT.md`).
*   **Inconsistent Styling**: Styles are applied via inline JavaScript (`element.style.xxx`), generic CSS classes, and raw HTML strings, leading to a fragmented visual system.

### 2.2. Comparison with Desired State
*   **Current**: `UIManager` acts as a "God Class" handling everything from input to rendering.
*   **Goal**: A decentralized system where specific Windows (e.g., `Window_Inventory`) manage their own lifecycle and layout, while a lightweight `UIManager` handles focus and window management.

## 3. Proposed Architecture: Layout Managers & Blueprints

We will implement a structured architecture consisting of three layers:

1.  **Window (Host)**: A class extending `Window_Base` that manages lifecycle, input, and state binding.
2.  **Layout Managers**: Classes that strictly handle positioning logic.
3.  **Components**: Stateless visual units that accept props.

### 3.1. Layout Managers
We will introduce specific strategies for positioning children:
*   **`AbsoluteLayout`**: mimics the precision of RPG Maker, allowing pixel-perfect `x,y` placement.
*   **`FlexLayout`**: leverages CSS Flexbox for automatic flow (Row/Column), perfect for lists like the Inventory.
*   **`GridLayout`**: utilizes CSS Grid for structured data, such as actor stats or equipment slots.

### 3.2. The New `Window_Base` & `UIContainer`
The `UI_Window` class will be replaced/upgraded to `Window_Base`, which creates a root `UIContainer`.
*   **`UIContainer`**: A component that holds other components and applies a Layout Strategy.
*   **`defineLayout()`**: A method in `Window_Base` that returns a declarative JSON-like structure (the "Blueprint") describing the UI.

### 3.3. Example: `Window_Status` Blueprint
Instead of the current `showStatusModal` string building:
```javascript
class Window_Status extends Window_Base {
    defineLayout() {
        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 10 }),
            children: [
                {
                    type: 'container', // Header Row
                    layout: new FlexLayout({ direction: 'row', gap: 20 }),
                    children: [
                        { component: Portrait, props: { actor: this.actor } },
                        { component: StatBlock, props: { actor: this.actor } }
                    ]
                },
                { component: Separator },
                {
                    component: AttributeGrid, // Grid for ATK, DEF, etc.
                    props: { actor: this.actor, columns: 2 }
                }
            ]
        };
    }
}
```

## 4. Refactoring Plan

### Phase 1: Core Framework
1.  **Create `src/ui/core.js`**:
    *   Implement `UIComponent` (base class).
    *   Implement `UIContainer` (manages children and layouts).
    *   Implement `Window_Base` (manages root container and blueprint parsing).
2.  **Create `src/ui/layouts.js`**:
    *   Implement `AbsoluteLayout`, `FlexLayout`, `GridLayout`.

### Phase 2: Component Library
Extract reusable UI elements from the current spaghetti code into dedicated classes in `src/ui/components.js`:
*   **`Label`**: Simple text wrapper.
*   **`Icon`**: Sprite or Unicode icon wrapper.
*   **`Gauge`**: The visual bars currently used in `refreshStatus`.
*   **`Button`**: Interactive elements used in `refreshCmd`.

### Phase 3: Pilot Migration (Modals)
Refactor the "temporary modals" first, as they are self-contained.
1.  **`Window_Status`**: Replace `UIManager.showStatusModal`.
2.  **`Window_Inventory`**: Replace `UIManager.showInventoryModal`.
    *   This will prove the `FlexLayout` for the item list and `GridLayout` for the equipment slots.
3.  **`Window_Confirm` & `Window_Target`**: Create reusable generic windows for these interactions.

### Phase 4: Main HUD Migration
Refactor the persistent windows managed by `UIManager`.
1.  **`Window_Party`**: Replace `refreshStatus` logic.
2.  **`Window_Tactics`**: Replace `refreshCmd` logic.
3.  **`Window_Log`**: Replace `refreshLog`.
4.  **`Window_Minimap`**: Wrap the canvas logic in a component.

### Phase 5: Cleanup
1.  Update `UIManager` to simply manage the stack of `Window_Base` instances (focus, push, pop) rather than building their content.
2.  Remove the old imperative methods (`createModal`, `show...`) from `UIManager`.

## 5. Benefits
*   **Modularity**: Each window is a separate file/class.
*   **Maintainability**: Layouts are visible at a glance in `defineLayout`.
*   **Consistency**: All UI elements use the same `UIComponent` primitives, ensuring unified styling.
*   **Scalability**: Adding new UI features (like a Bestiary or Skill Tree) becomes a matter of assembling existing components rather than writing new DOM manipulation logic.
