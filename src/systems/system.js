
/**
 * Utility class for sequencing async operations.
 */
export class Sequencer {
    /**
     * Pauses execution for a specified duration.
     * @param {number} ms - The number of milliseconds to sleep.
     * @returns {Promise<void>} A promise that resolves after the delay.
     */
    static sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

/**
 * Manages global game state, such as floor level and logs.
 */
export class Game_System {
    /**
     * Creates an instance of Game_System.
     */
    constructor() {
        /**
         * The current floor level.
         * @type {number}
         */
        this.floor = 1;
        /**
         * History of game logs.
         * @type {Array<string>}
         */
        this.logHistory = [];
        /**
         * Indicates if the system is busy processing an action.
         * @type {boolean}
         */
        this.isBusy = false;
        /**
         * Indicates if player input is blocked.
         * @type {boolean}
         */
        this.isInputBlocked = false;

        /**
         * Callback for when a log is added.
         * @type {Function|null}
         */
        this.onLog = null;
    }

    /**
     * Adds a message to the game log.
     * @param {string} text - The text to log.
     */
    log(text) {
        this.logHistory.unshift(text);
        if(this.logHistory.length > 15) this.logHistory.pop();
        if (this.onLog) this.onLog();
    }
}
