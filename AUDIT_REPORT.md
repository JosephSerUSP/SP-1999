# Comprehensive Code Audit Report

## 1. Executive Summary

The codebase for "Stillnight: Eve of the Stack" demonstrates a successful transition from a monolithic prototype to a modular, event-driven architecture. The separation of concerns between Game Logic (`objects.js`), State Management (`main.js`), and Presentation (`sprites.js`, `windows.js`) is largely effective, facilitated by a robust `EventBus` that decouples these layers.

However, the audit identified significant issues regarding resource management and security. The most critical finding is a GPU memory leak in the 3D rendering system, which threatens long-term application stability. Additionally, the widespread use of `innerHTML` for UI construction introduces potential Cross-Site Scripting (XSS) vulnerabilities, although the current risk is mitigated by the use of static data sources.

Documentation staleness is another concern, with the `STUB_IMPLEMENTATION_PLAN.md` referencing "missing" features that are, in fact, implemented in the codebase.

**Overall Health Score:** B-
**Architecture:** Solid (Modular, Event-Driven)
**Code Quality:** Mixed (Clean Logic vs. Unsafe UI patterns)

---

## 2. Findings by Severity

### 🔴 Critical (Immediate Action Required)

#### 1. GPU Memory Leak in `Renderer3D`
*   **Location:** `src/sprites.js` (Method: `rebuildLevel`)
*   **Description:** The renderer calls `this.mapGroup.clear()` to remove old level geometry. In Three.js, removing a mesh from a scene does **not** release the memory allocated for its Geometry or Material.
*   **Impact:** Every floor transition allocates new Geometries and Materials without freeing the old ones. This causes a linear growth in GPU memory usage, leading to browser tab crashes after extended play.

### 🟠 Major (High Priority)

#### 1. Unsafe DOM Manipulation (XSS Risk)
*   **Location:** `src/windows.js` (`UIManager`), `src/managers.js` (`CutsceneManager`)
*   **Description:** The UI is constructed almost exclusively using `innerHTML` with template literals.
*   **Impact:** If any displayed data (e.g., item names, chat messages) were to come from an external or user-generated source, this would allow arbitrary script execution. While currently safe due to static data, this pattern violates security best practices and hampers future scalability.

#### 2. Stale Documentation vs. Implementation
*   **Location:** `STUB_IMPLEMENTATION_PLAN.md` vs `src/objects.js`
*   **Description:** The documentation lists `turret`, `patrol`, and `flee` AI behaviors as "Missing". However, `Game_Map.updateEnemies` clearly contains logic for these behaviors.
*   **Impact:** Misleads developers, potentially causing duplicate work or confusion during maintenance.

#### 3. Input Handling Race Condition
*   **Location:** `src/main.js` (`SceneManager.loop`)
*   **Description:** The game loop calls the async method `$gameMap.processTurn` without awaiting it. It relies on the view state (`Renderer.isAnimating`) to block input.
*   **Impact:** Coupling the Game Logic's input blocking mechanism to the View's animation state is fragile. If an animation fails to trigger or ends prematurely, the logic could process multiple turns per frame or desynchronize.

### 🟡 Minor (Refactoring Recommended)

#### 1. God Class Anti-Pattern: `Game_Map`
*   **Description:** `Game_Map` violates the Single Responsibility Principle. It manages map data, pathfinding, entity lists, turn processing, and specific enemy AI logic.
*   **Recommendation:** Extract AI logic to a `BehaviorSystem` and turn processing to a `TurnManager`.

#### 2. Magic Numbers & Hardcoding
*   **Location:** Global
*   **Description:** Logic is littered with numeric literals (e.g., `dist < 7`, `damage * 0.8`, `setTimeout(..., 300)`).
*   **Recommendation:** Move these to `src/data.js` as `CONSTANTS`.

#### 3. Inline CSS in JavaScript
*   **Location:** `src/windows.js`
*   **Description:** `UIManager` writes extensive CSS styles within JavaScript strings.
*   **Recommendation:** Move static styles to `style.css` and toggle classes (e.g., `.hidden`, `.active`) instead.

---

## 3. Actionable Refactoring Suggestions

### A. Fix Memory Leak in `Renderer3D` (Critical)

Add a generic disposal helper and use it before clearing groups.

```javascript
// In src/sprites.js

/**
 * Helper to properly dispose of a Three.js object and its children.
 * @param {THREE.Object3D} obj
 */
function disposeHierarchy(obj) {
    obj.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
            } else {
                child.material.dispose();
            }
        }
    });
}

// Update rebuildLevel()
rebuildLevel() {
    // DISPOSE OLD ASSETS
    disposeHierarchy(this.mapGroup);
    this.mapGroup.clear();

    // ... existing logic ...
}
```

### B. Sanitize UI Creation (Major)

Replace `innerHTML` with a safer DOM creation helper.

```javascript
// Helper Function
function createElement(tag, className, textOrChildren) {
    const el = document.createElement(tag);
    if (className) el.className = className;

    if (typeof textOrChildren === 'string') {
        el.textContent = textOrChildren;
    } else if (Array.isArray(textOrChildren)) {
        textOrChildren.forEach(child => el.appendChild(child));
    } else if (textOrChildren instanceof HTMLElement) {
        el.appendChild(textOrChildren);
    }
    return el;
}

// Refactoring Example in UIManager
// OLD:
// div.innerHTML = `<span>${m.name}</span>`;

// NEW:
const nameSpan = createElement('span', null, m.name);
const hpSpan = createElement('span', null, `${m.hp}/${m.mhp}`);
hpSpan.style.color = clr; // Styles can still be inline if dynamic
const row = createElement('div', 'flex-row', [nameSpan, hpSpan]);
```

### C. Refactor Enemy AI (Minor)

Extract AI logic from `Game_Map.updateEnemies` to a dedicated handler.

```javascript
// src/objects.js

class EnemyAI {
    static update(enemy, mapData) {
        const dist = this.getDistance(enemy, mapData.player);

        if (enemy.ai === 'turret') {
            if (dist <= 5) return { type: 'attack', target: 'player' };
            return { type: 'wait' };
        }
        // ... other AI logic
        return { type: 'move', dx: 0, dy: 0 };
    }
}
```
