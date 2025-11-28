/**
 * Manages cutscene playback.
 */
export class CutsceneManager {
    /**
     * Creates an instance of CutsceneManager.
     * @param {Object} gameSystem - Reference to Game_System.
     * @param {Function} onEvent - Callback to dispatch events.
     */
    constructor(gameSystem, onEvent) {
        this.gameSystem = gameSystem;
        this.onEvent = onEvent;
        this.queue = [];
        this.active = false;
    }

    /**
     * Starts playing a cutscene script.
     * @param {Array<Object>} script - The list of cutscene commands.
     */
    play(script) {
        this.queue = [...script];
        this.active = true;
        this.gameSystem.isInputBlocked = true;
        this.next();
    }

    /**
     * Advances to the next command in the cutscene queue.
     */
    next() {
        if(this.queue.length === 0) {
            this.end();
            return;
        }
        const cmd = this.queue.shift();
        this.processCommand(cmd);
    }

    /**
     * Processes a single cutscene command.
     * @param {Object} cmd - The command object.
     */
    processCommand(cmd) {
        switch(cmd.type) {
            case 'dialog':
                // We dispatch an event for the UI to handle the dialog display and waiting for click
                this.onEvent({
                    type: 'dialog',
                    speaker: cmd.speaker,
                    text: cmd.text,
                    color: cmd.color,
                    onComplete: () => this.next()
                });
                break;
            case 'wait':
                setTimeout(() => this.next(), cmd.time);
                break;
            case 'log':
                this.gameSystem.log(cmd.text);
                this.next();
                break;
        }
    }

    /**
     * Ends the cutscene and restores control.
     */
    end() {
        this.active = false;
        this.gameSystem.isInputBlocked = false;
        this.gameSystem.log("Command restored.");
    }
}
