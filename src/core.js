// ============================================================================
// [2] CORE SYSTEMS
// ============================================================================

/**
 * A lightweight pub/sub event bus for decoupling systems.
 */
class EventBus {
    /**
     * @static
     * @type {Object.<string, Array<Function>>}
     */
    static topics = {};

    /**
     * Subscribe to an event topic.
     * @static
     * @param {string} topic - The event topic name.
     * @param {Function} listener - The callback function to execute when the event is emitted.
     */
    static on(topic, listener) {
        if(!this.topics[topic]) this.topics[topic] = [];
        this.topics[topic].push(listener);
    }

    /**
     * Emit an event to all subscribers of a topic.
     * @static
     * @param {string} topic - The event topic name.
     * @param {...*} args - Arguments to pass to the listener functions.
     */
    static emit(topic, ...args) {
        if(!this.topics[topic]) return;
        this.topics[topic].forEach(l => l(...args));
    }
}

/**
 * System for evaluating contextual conditions (e.g., for Banter triggers).
 */
class ConditionSystem {
    /**
     * Checks if a specific condition is met within a given context.
     * @static
     * @param {Object} condition - The condition object.
     * @param {string} condition.type - The type of condition check (e.g., 'enemy_count_range', 'hp_below_pct').
     * @param {Object} context - The context in which to check the condition.
     * @param {Game_Battler} [context.battler] - The battler involved in the condition.
     * @param {number} [context.x] - X-coordinate for spatial checks.
     * @param {number} [context.y] - Y-coordinate for spatial checks.
     * @returns {boolean} True if the condition is met, false otherwise.
     */
    static check(condition, context) {
        if (!condition) return true;
        switch (condition.type) {
            case 'enemy_count_range':
                const range = condition.range || 5;
                const min = condition.min || 1;
                const px = context.x || $gameMap.playerX;
                const py = context.y || $gameMap.playerY;
                const count = $gameMap.enemies.filter(e => Math.abs(e.x - px) + Math.abs(e.y - py) <= range).length;
                return count >= min;
            case 'hp_below_pct':
                if (!context.battler) return false;
                return (context.battler.hp / context.battler.mhp) < condition.value;
        }
        return false;
    }
}

/**
 * Utility class for sequencing async operations.
 */
class Sequencer {
    /**
     * Pauses execution for a specified duration.
     * @static
     * @param {number} ms - The number of milliseconds to sleep.
     * @returns {Promise<void>} A promise that resolves after the delay.
     */
    static sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

/**
 * Utility class for grid geometry calculations.
 */
class Geometry {
    /**
     * Calculates tiles in a line.
     * @param {number} x0 - Start X
     * @param {number} y0 - Start Y
     * @param {number} x1 - End X
     * @param {number} y1 - End Y
     * @returns {Array<{x:number, y:number}>}
     */
    static getLine(x0, y0, x1, y1) {
        const points = [];
        if (isNaN(x0) || isNaN(y0) || isNaN(x1) || isNaN(y1)) return points;

        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        let cx = x0; let cy = y0;
        let maxIter = 1000; // Safety break
        while (maxIter-- > 0) {
            points.push({x: cx, y: cy});
            if (cx === x1 && cy === y1) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; cx += sx; }
            if (e2 < dx) { err += dx; cy += sy; }
        }
        return points;
    }

    /**
     * Calculates tiles in a circle.
     * @param {number} cx - Center X
     * @param {number} cy - Center Y
     * @param {number} r - Radius
     * @returns {Array<{x:number, y:number}>}
     */
    static getCircle(cx, cy, r) {
        const points = [];
        const r2 = r * r;
        for (let x = cx - r; x <= cx + r; x++) {
            for (let y = cy - r; y <= cy + r; y++) {
                if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) {
                    points.push({x, y});
                }
            }
        }
        return points;
    }

    /**
     * Calculates tiles in a cone (90-degree field of view).
     * @param {number} ox - Origin X
     * @param {number} oy - Origin Y
     * @param {Object} dir - Direction vector {x, y}.
     * @param {number} range - Range/Length of cone.
     * @returns {Array<{x:number, y:number}>}
     */
    static getCone(ox, oy, dir, range) {
        const points = [];

        // Iterate bounding box
        for (let x = ox - range; x <= ox + range; x++) {
            for (let y = oy - range; y <= oy + range; y++) {
                if (x === ox && y === oy) { points.push({x,y}); continue; }

                const dx = x - ox;
                const dy = y - oy;
                const dist = Math.abs(dx) + Math.abs(dy); // Manhattan for loop limit check approx
                if (dist > range * 1.5) continue; // Optimization

                // Exact range check (Euclidean Distance)
                if (Math.sqrt(dx*dx + dy*dy) > range) continue;

                // Direction Check
                // Project (dx,dy) onto dir.
                // Dot Product: dx*dir.x + dy*dir.y
                const dot = dx * dir.x + dy * dir.y;

                // If dot <= 0, it's behind or perpendicular.
                if (dot <= 0) continue;

                // Angle check.
                // For 90 degree cone, the projection on the perpendicular axis should be <= projection on forward axis.
                // Perpendicular: (-dir.y, dir.x)
                const perp = Math.abs(dx * -dir.y + dy * dir.x);
                if (perp <= dot) {
                    points.push({x, y});
                }
            }
        }
        return points;
    }
}
