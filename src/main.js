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
        Renderer = new Renderer3D();
        Cutscene = new CutsceneManager();
        $gameBanter = new BanterManager();

        Renderer.init(UI.windows.view.content);
        $gameMap.setup(1);
        UI.refresh();
        $gameBanter.init(UI.windows.view.content);
        $gameSystem.log("System initialized.");

        // INPUT POLLING
        /** @type {Object.<string, boolean>} */
        this.keys = {};
        document.addEventListener('keydown', e => this.keys[e.key] = true);
        document.addEventListener('keyup', e => this.keys[e.key] = false);

        this.loop();
    }

    /**
     * The main game loop driving input and updates.
     * @static
     */
    static loop() {
        requestAnimationFrame(() => this.loop());
        $gameBanter.update();
        // Input Logic
        if (!$gameSystem.isBusy && !$gameSystem.isInputBlocked && !Renderer.isAnimating) {
             if(this.keys["ArrowUp"]||this.keys["w"]) $gameMap.processTurn(0,-1);
             else if(this.keys["ArrowDown"]||this.keys["s"]) $gameMap.processTurn(0,1);
             else if(this.keys["ArrowLeft"]||this.keys["a"]) $gameMap.processTurn(-1,0);
             else if(this.keys["ArrowRight"]||this.keys["d"]) $gameMap.processTurn(1,0);
             else if(this.keys[" "]) $gameMap.processTurn(0,0);
             else if(this.keys["Enter"]) $gameMap.playerAttack();
             else if(this.keys["t"]) $gameMap.negotiate();
             else if(this.keys["c"]) UI.showCompModal();
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
