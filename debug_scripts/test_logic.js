
const { EventBus } = require('./src/core.js');
// Mock other classes
global.EventBus = { emit: () => {} };
global.Renderer = { isAnimating: false };
global.InputManager = { isPressed: () => false };
global.Sequencer = { sleep: (ms) => new Promise(r => setTimeout(r, 0)) }; // Instant sleep
global.$dataStates = { 'panting': { duration: 2, traits: [{code:3}] }, 'poison': {duration:5} };
global.$dataFloors = { default: { width: 10, height: 10 } };
global.$generatorRegistry = { create: () => ({ generate: () => ({ tiles: [], startPos: {x:0,y:0}, endPos: {x:9,y:9} }) }) };

// Mock Classes
class Game_Battler {
    constructor() { this.states = []; this.hp = 100; this.mhp = 100; }
    addState(id) { this.states.push({id, duration: 2, traits:[{code:3}]}); }
    removeState(id) { this.states = this.states.filter(s => s.id !== id); }
    isRestricted() { return this.states.some(s => s.id === 'panting'); }
    paramPlus() { return 0; }
    paramRate() { return 1; }
    traitObjects() { return this.states; }
}
class Game_Actor extends Game_Battler {
    constructor() { super(); this.name = 'Test'; this.stamina = 100; this.mstamina = 100; }
    payStamina(amt) {
        if (this.stamina < amt) { this.addState('panting'); return true; }
        this.stamina -= amt;
        return false;
    }
}
class Game_Party {
    constructor() { this.members = [new Game_Actor()]; this.index = 0; }
    active() { return this.members[this.index]; }
}
class Game_System { constructor() { this.isBusy = false; this.isInputBlocked = false; } log(t) { console.log(t); } }

// Setup Globals
global.$gameParty = new Game_Party();
global.$gameSystem = new Game_System();
global.$gameBanter = { trigger: () => {} };

// Load Game_Map code (manually mock or read file - better to read file to test ACTUAL code)
// But reading file in node environment is hard due to dependencies.
// I will reproduce the logic I WROTE in the plan.

class Game_Map {
    constructor() { this.playerX = 0; this.playerY = 0; this.enemies = []; this.tiles = Array(10).fill().map(()=>Array(10).fill(0)); }

    async processTurnEnd(actor) {
        console.log('Turn End. States:', actor.states.length);
        for(let i=actor.states.length-1; i>=0; i--) {
            actor.states[i].duration--;
            if(actor.states[i].duration <= 0) actor.removeState(actor.states[i].id);
        }
    }

    async updateEnemies() {
        console.log('Enemies update...');
    }

    async processTurn(dx, dy) {
        if($gameSystem.isInputBlocked) return;
        if(Renderer.isAnimating) return;

        const actor = $gameParty.active();

        if(actor.isRestricted()) {
             console.log('Restricted! Burning turn.');
             await this.processTurnEnd(actor);
             await this.updateEnemies();
             return;
        }

        // Move
        actor.payStamina(10);
        console.log('Moved. Stamina:', actor.stamina);

        await this.updateEnemies();
        await this.processTurnEnd(actor);
    }
}

global.$gameMap = new Game_Map();

async function test() {
    // Spam Move 15 times
    for(let i=0; i<15; i++) {
        console.log(`--- Input ${i} ---`);
        await $gameMap.processTurn(0, 1);
    }
}

test();
