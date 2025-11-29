// ============================================================================
// [2] CORE SYSTEMS
// ============================================================================

class EventBus {
    static topics = {};
    static on(topic, listener) {
        if(!this.topics[topic]) this.topics[topic] = [];
        this.topics[topic].push(listener);
    }
    static emit(topic, ...args) {
        if(!this.topics[topic]) return;
        this.topics[topic].forEach(l => l(...args));
    }
}

class ConditionSystem {
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
     * @param {number} ms - The number of milliseconds to sleep.
     * @returns {Promise<void>} A promise that resolves after the delay.
     */
    static sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}
