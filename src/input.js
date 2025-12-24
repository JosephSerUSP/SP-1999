// ============================================================================
// INPUT MANAGER
// ============================================================================

class InputManager {
    static init() {
        this.keys = {};
        this.latchedKeys = {}; // Keys pressed since last frame
        this.lastKeys = {};

        // Logical actions
        this.actions = {
            UP: ['ArrowUp', 'w', 'W'],
            DOWN: ['ArrowDown', 's', 'S'],
            LEFT: ['ArrowLeft', 'a', 'A'],
            RIGHT: ['ArrowRight', 'd', 'D'],
            OK: ['Enter', ' ', 'z', 'Z'],
            CANCEL: ['Escape', 'x', 'X', 'Backspace'],
            MENU: ['c', 'C'], // Removed 'Tab' from MENU
            MINIMAP: ['Tab', 'm', 'M'], // Added MINIMAP action
            CYCLE: ['Shift', 'v', 'V'],
            PREV_ACTOR: ['q', 'Q', 'PageUp'],
            NEXT_ACTOR: ['e', 'E', 'PageDown']
        };

        // Current logical state
        this.state = {
            UP: false, DOWN: false, LEFT: false, RIGHT: false,
            OK: false, CANCEL: false, MENU: false, MINIMAP: false, CYCLE: false,
            PREV_ACTOR: false, NEXT_ACTOR: false
        };
        this.lastState = { ...this.state };

        // Gamepad mapping (Standard mapping)
        this.gamepadMap = {
            0: 'OK',      // A / Cross
            1: 'CANCEL',  // B / Circle
            2: 'MENU',    // X / Square (Using X for menu for now, or Y?)
            3: 'MENU',    // Y / Triangle
            4: 'MINIMAP', // L1 / LB
            6: 'PREV_ACTOR', // L2 / LT
            7: 'NEXT_ACTOR', // R2 / RT
            8: 'MINIMAP', // Select / Back
            12: 'UP',     // D-Pad Up
            13: 'DOWN',   // D-Pad Down
            14: 'LEFT',   // D-Pad Left
            15: 'RIGHT'   // D-Pad Right
        };

        document.addEventListener('keydown', e => this.onKeyDown(e));
        document.addEventListener('keyup', e => this.onKeyUp(e));

        // Initial polling
        this.update();
    }

    static onKeyDown(e) {
        this.keys[e.key] = true;
        this.latchedKeys[e.key] = true;
        if (e.key === 'Tab') {
            e.preventDefault();
        }
    }

    static onKeyUp(e) {
        this.keys[e.key] = false;
    }

    /**
     * Updates the input state. Should be called once per frame.
     */
    static update() {
        // Save previous state for trigger checks
        this.lastState = { ...this.state };

        // Reset current state to check fresh
        for (const action in this.state) {
            this.state[action] = false;
        }

        // 1. Keyboard Check
        for (const action in this.actions) {
            const keys = this.actions[action];
            for (const key of keys) {
                if (this.keys[key] || this.latchedKeys[key]) {
                    this.state[action] = true;
                    break;
                }
            }
        }

        // Clear latched keys after processing
        this.latchedKeys = {};

        // 2. Gamepad Check
        const gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
        if (gp) {
            // Buttons
            gp.buttons.forEach((b, i) => {
                if (b.pressed && this.gamepadMap[i]) {
                    this.state[this.gamepadMap[i]] = true;
                }
            });

            // Axes (Stick) - Threshold 0.5
            if (gp.axes[1] < -0.5) this.state['UP'] = true;
            else if (gp.axes[1] > 0.5) this.state['DOWN'] = true;

            if (gp.axes[0] < -0.5) this.state['LEFT'] = true;
            else if (gp.axes[0] > 0.5) this.state['RIGHT'] = true;
        }
    }

    /**
     * Checks if an action is currently pressed.
     * @param {string} action - The action name (UP, DOWN, OK, etc.)
     * @returns {boolean}
     */
    static isPressed(action) {
        return this.state[action];
    }

    /**
     * Checks if an action was just pressed this frame (trigger).
     * @param {string} action - The action name.
     * @returns {boolean}
     */
    static isTriggered(action) {
        return this.state[action] && !this.lastState[action];
    }

    /**
     * Helper to get a directional vector from input {x, y}
     * @returns {{x: number, y: number}}
     */
    static getDir() {
        if (this.isPressed('UP')) return {x: 0, y: -1};
        if (this.isPressed('DOWN')) return {x: 0, y: 1};
        if (this.isPressed('LEFT')) return {x: -1, y: 0};
        if (this.isPressed('RIGHT')) return {x: 1, y: 0};
        return {x: 0, y: 0};
    }
}
