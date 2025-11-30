# Migration Analysis: Three.js to Babylon.js

## 1. Executive Summary

**Recommendation: NO-GO (Fix Three.js implementation instead)**

While Babylon.js is a robust engine, switching now would be a lateral move requiring a complete rewrite of the visualization layer (`src/sprites.js`) for marginal immediate gain. The critical issues identified in the audit (Memory Leak, XSS) are solvable within the current architecture with significantly less effort than a migration.

## 2. Technical Comparison

| Feature | Current (Three.js) | Proposed (Babylon.js) | Note |
| :--- | :--- | :--- | :--- |
| **Geometry** | `InstancedMesh` (Manual matrix mgmt) | `ThinInstances` (Similar high perf) | Both handle the map tiles well. |
| **Particles** | Custom manual mesh system | Native `ParticleSystem` | Babylon wins here; native system is much more powerful. |
| **Coordinate Sync** | `vector.project(camera)` | `Vector3.Project(...)` | Identical logic required. |
| **Asset Mgmt** | Manual Disposal (Currently Broken) | Automatic (mostly) | Babylon handles scene disposal cleaner, but Three.js is fine if fixed. |
| **Input/Interactions** | Raycasting (Manual) | Picking (Built-in) | Babylon's picking is slightly easier to set up. |

## 3. Migration Effort Assessment

**Estimated Effort:** 8-12 Hours

The `src/sprites.js` file is approximately 370 lines of code. It is tightly coupled to Three.js primitives. A migration would involve:

1.  **Context Switching:** Replacing `THREE.Scene`, `THREE.Camera`, `THREE.Renderer` with `BABYLON.Engine`, `BABYLON.Scene`.
2.  **Asset Logic Rewrite:** Converting `InstancedMesh` logic to Babylon's `ThinInstances`. The matrix calculation logic is similar but API syntax differs.
3.  **Particle System Replacement:** Deleting the custom `ParticleSystem` class and configuring Babylon's built-in emitter.
4.  **UI Projection:** Re-calibrating the `projectToScreen` function. Differences in camera FOV definition and coordinate systems (Right-handed vs Left-handed) often cause alignment bugs during porting.
5.  **Lighting & Materials:** Re-tuning colors and light intensities to match the specific "Stillnight" aesthetic.

## 4. Risk Analysis

*   **Regression Risk (High):** The visual "feel" (fog density, lighting falloff, pixelation scale) is already tuned. Porting introduces a high risk of the game looking "different" or "wrong" until significant tuning is done.
*   **Coordinate System Clash:** Three.js is Right-Handed (Y-up standard). Babylon.js is Left-Handed by default. This will invert Z-axis logic for map generation and movement, likely requiring changes to `Game_Map` or a conversion layer.

## 5. Strategic Conclusion

The prompt "Should we consider a transition?" likely stems from the **GPU Memory Leak** finding in the audit.

**The Fix:**
Fixing the memory leak in Three.js requires adding ~15 lines of code (a disposal helper).
Migrating to Babylon.js requires rewriting ~400 lines of code and re-testing the entire visual layer.

**Verdict:**
Stick with Three.js. The current architecture uses the library correctly as a renderer (view) separate from logic. The issues are implementation bugs, not engine limitations.
