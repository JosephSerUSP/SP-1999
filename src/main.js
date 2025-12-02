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

        // Delegate Input
        // 1. UI Navigation
        if (UI.activeModal || UI.focusedWindow) {
            UI.updateInput();
            return;
        }

        // 2. Map Gameplay
        if (!$gameSystem.isBusy && !$gameSystem.isInputBlocked && !Renderer.isAnimating) {
             if(InputManager.isPressed('UP')) $gameMap.processTurn(0,-1);
             else if(InputManager.isPressed('DOWN')) $gameMap.processTurn(0,1);
             else if(InputManager.isPressed('LEFT')) $gameMap.processTurn(-1,0);
             else if(InputManager.isPressed('RIGHT')) $gameMap.processTurn(1,0);
             else if(InputManager.isPressed('OK') && !InputManager.isTriggered('OK')) { /* Prevent auto-repeat attack spam if desired, or allow hold? Original logic allowed hold. Keeping hold. */ $gameMap.playerAttack(); }
             else if(InputManager.isTriggered('OK')) $gameMap.playerAttack(); // Ensure tap also works
             else if(InputManager.isTriggered('MENU')) { UI.focusWindow('tactics'); }
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
