// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/** @type {Game_System} */
let $gameSystem;
/** @type {Game_Party} */
let $gameParty;
/** @type {Game_Map} */
let $gameMap;
/** @type {Renderer3D} */
let Renderer;
/** @type {UIManager} */
let UI;
/** @type {CutsceneManager} */
let Cutscene;
/** @type {BanterManager} */
let $gameBanter;

/**
 * Static class that manages the main game loop and initialization.
 */
class SceneManager {
    /**
     * Initializes the game systems and starts the main loop.
     * @static
     */
    static init() {
        $gameSystem = new Game_System();
        $gameParty = new Game_Party();
        $gameMap = new Game_Map();
        UI = new UIManager();
        $gameSystem.ui = UI; // Bind UI to game system for easy access in classes
        Renderer = new Renderer3D();
        Cutscene = new CutsceneManager();
        $gameBanter = new BanterManager();

        Renderer.init(UI.windows.view.content);
        $gameMap.setup(1);
        UI.refresh();
        $gameBanter.init(UI.windows.view.content);
        $gameSystem.log("System initialized.");
        InputManager.init();
        this.loop();
    }

    /**
     * The main game loop driving input and updates.
     * @static
     */
    static loop() {
        requestAnimationFrame(() => this.loop());
        InputManager.update();
        $gameBanter.update();
        if (Cutscene) Cutscene.update();

        // Delegate Input
        // 0. Global UI Input (Minimap toggle)
        UI.updateInput(); // Always check for global toggles even if not focused

        // 1. UI Navigation
        if (UI.activeModal || UI.focusedWindow) {
            // UI.updateInput() is already called above
            return;
        }

        // 2. Targeting Mode
        if ($gameMap.isTargeting()) {
            $gameMap.updateTargeting();
            return;
        }

        // 3. Map Gameplay
        if (!$gameSystem.isBusy && !$gameSystem.isInputBlocked && !Renderer.isAnimating) {
             if(InputManager.isPressed('UP')) $gameMap.processTurn(0,-1);
             else if(InputManager.isPressed('DOWN')) $gameMap.processTurn(0,1);
             else if(InputManager.isPressed('LEFT')) $gameMap.processTurn(-1,0);
             else if(InputManager.isPressed('RIGHT')) $gameMap.processTurn(1,0);
             else if(InputManager.isTriggered('OK')) { UI.focusWindow('cmd'); }
             else if(InputManager.isTriggered('MENU')) { UI.focusWindow('cmd'); }
             else if(InputManager.isTriggered('PREV_ACTOR')) { $gameParty.cycleActive(-1); }
             else if(InputManager.isTriggered('NEXT_ACTOR')) { $gameParty.cycleActive(1); }
        }
    }

    /**
     * Triggers the game over state.
     * @static
     */
    static gameOver() {
        alert("FAILURE.");
        location.reload();
    }
}

window.onload = () => {
    SceneManager.init();

    // Auto-scale to fit window
    const resizeGame = () => {
        const app = document.getElementById('app-container');
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const scale = Math.min(winW / 960, winH / 540);
        app.style.transform = `scale(${scale})`;
    };
    window.addEventListener('resize', resizeGame);
    resizeGame();
};
