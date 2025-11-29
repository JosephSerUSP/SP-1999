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
