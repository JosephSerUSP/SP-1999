import { Game_System } from './systems/system.js';
import { Game_Party } from './systems/party.js';
import { Game_Map } from './systems/map.js';
import { BattleManager } from './systems/battle.js';
import { ItemManager } from './systems/items.js';
import { CutsceneManager } from './systems/cutscene.js';
import { Renderer3D } from './presentation/renderer3d.js';
import { UIManager } from './presentation/ui.js';
import { $dataCutscenes } from './data/data.js';

class Main {
    constructor() {
        this.gameSystem = new Game_System();
        this.gameParty = new Game_Party(this.gameSystem, () => this.gameOver());
        this.gameMap = new Game_Map(this.gameSystem, this.gameParty);
        this.renderer = new Renderer3D();
        this.cutsceneManager = new CutsceneManager(this.gameSystem, (e) => this.ui.handleCutsceneEvent(e));

        // Pass a callback for UI actions that need to trigger system updates
        this.ui = new UIManager(
            this.gameSystem,
            this.gameParty,
            this.gameMap,
            BattleManager,
            ItemManager,
            this.cutsceneManager,
            this.renderer,
            (action, data) => this.handleUIAction(action, data)
        );

        // Circular Dependency wiring
        this.renderer.attachGameState(this.gameMap, this.gameParty, this.gameSystem);

        this.keys = {};
        this.setupInput();
    }

    async init() {
        this.renderer.init(this.ui.windows.view.content);

        // Initial Map Setup
        const events = this.gameMap.setup(1);
        this.processEvents([events]); // Wrap in array as setup returns a single event object in my logic above?
        // Wait, map.js setup returns an object { type: 'mapSetup', ... }
        // Let's verify map.js setup return. It returns an object.

        this.ui.refresh();
        this.gameSystem.log("System initialized.");

        this.loop();
    }

    setupInput() {
        document.addEventListener('keydown', e => this.keys[e.key] = true);
        document.addEventListener('keyup', e => this.keys[e.key] = false);
    }

    async handleUIAction(action, data) {
        if (action === 'wait') {
            const events = await this.gameMap.processTurn(0, 0);
            this.processEvents(events);
        } else if (action === 'skill') {
            const actor = this.gameParty.active();
            // Skill execution is part of a turn usually, but in the original code:
            // $gameMap.processTurn(0,0,()=>BattleManager.executeSkill(actor, k));
            // This means: Do the turn logic (enemy move etc), AND execute skill.

            // Wait, looking at original code:
            // if(!$gameSystem.isBusy) $gameMap.processTurn(0,0,()=>BattleManager.executeSkill(actor, k));
            // But BattleManager.executeSkill is async.

            // In my new structure, I want to execute the skill, then maybe enemies update?
            // Actually, usually in these games, Player Action -> Enemy Action.
            // So Skill -> Enemy Action.

            if (this.gameSystem.isBusy) return;
            this.gameSystem.isBusy = true;

            const skillEvents = await BattleManager.executeSkill(actor, data, this.gameMap, this.gameSystem);
            this.processEvents(skillEvents);

            // After skill, enemies take turn?
            // Original code: $gameMap.processTurn(0,0, cb)
            // processTurn calls action(), then rotates party, then updates enemies.

            // So I should replicate that flow.
            // But I separated them.

            // Let's look at Game_Map.processTurn in my new code.
            // It doesn't take an action callback.

            // I should probably manually trigger the turn sequence here.
            // 1. Execute Player Skill
            // 2. Rotate Party
            // 3. Update Enemies

            this.gameParty.rotate();
            this.ui.refresh(); // Refresh UI after player action (PE cost etc)

            const enemyEvents = await this.gameMap.updateEnemies();
            this.processEvents(enemyEvents);

            this.gameSystem.isBusy = false;
        }
    }

    async loop() {
        requestAnimationFrame(() => this.loop());

        // Input Logic
        if (!this.gameSystem.isBusy && !this.gameSystem.isInputBlocked && !this.renderer.isAnimating) {
             let dx = 0, dy = 0;
             if(this.keys["ArrowUp"]||this.keys["w"]) dy = -1;
             else if(this.keys["ArrowDown"]||this.keys["s"]) dy = 1;
             else if(this.keys["ArrowLeft"]||this.keys["a"]) dx = -1;
             else if(this.keys["ArrowRight"]||this.keys["d"]) dx = 1;
             else if(this.keys[" "]) { dx = 0; dy = 0; } // Wait
             else return; // No input

             // If wait key is pressed, it is processed as processTurn(0,0) which is valid.
             // But if no key is pressed, we do nothing.

             // Debounce/Throttle is handled by isBusy/isAnimating flags mostly,
             // but continuous keypress needs to be handled carefully.
             // The original code relied on `!Renderer.isAnimating` to throttle movement.

             // Call processTurn
             const events = await this.gameMap.processTurn(dx, dy);
             this.processEvents(events);
        }
    }

    processEvents(events) {
        if (!events) return;
        // events can be an array or nested array?
        // My map.js returns an array. setup returns an object.
        const list = Array.isArray(events) ? events : [events];

        this.renderer.applyEvents(list);

        // Handle specific events that the Controller needs to know about?
        // Like 'uiRefresh', 'cutscene', 'gameOver' (if it was an event)

        list.forEach(e => {
            if (e.type === 'uiRefresh') this.ui.refresh();
            if (e.type === 'floatText') this.ui.floatText(e.text, e.x, e.y, e.color);
            if (e.type === 'mapSetup' && e.cutscene) {
                this.cutsceneManager.play($dataCutscenes[e.cutscene]);
            }
        });
    }

    gameOver() {
        alert("FAILURE.");
        location.reload();
    }
}

window.onload = () => {
    const game = new Main();
    game.init();
    // Expose for debugging if needed
    window.game = game;
};
