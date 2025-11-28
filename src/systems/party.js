import { Game_Actor } from './entities.js';

/**
 * Manages the party of actors.
 */
export class Game_Party {
    /**
     * Creates an instance of Game_Party.
     * @param {Game_System} gameSystem - Reference to Game_System.
     * @param {Function} onGameOver - Callback for game over.
     */
    constructor(gameSystem, onGameOver) {
        this.gameSystem = gameSystem;
        this.onGameOver = onGameOver;
        this.members = [
            new Game_Actor("Aya", gameSystem),
            new Game_Actor("Kyle", gameSystem),
            new Game_Actor("Eve", gameSystem)
        ];
        this.index = 0;
        this.inventory = [];
        this.maxInventory = 20;
    }

    /**
     * Gets the currently active party member.
     * @returns {Game_Actor} The active actor.
     */
    active() { return this.members[this.index]; }

    /**
     * Gets the next party member in the rotation.
     * @returns {Game_Actor} The next actor.
     */
    nextActive() { return this.members[(this.index + 1) % 3]; }

    /**
     * Rotates to the next living party member.
     */
    rotate() {
        let s = 3; do { this.index = (this.index + 1) % 3; s--; } while(this.active().isDead() && s > 0);
        if(this.active().isDead() && this.onGameOver) this.onGameOver();
    }

    /**
     * Distributes experience points to the party.
     * @param {number} a - The base amount of experience.
     */
    distributeExp(a) { const k = this.active(); this.members.forEach(m => !m.isDead() && m.gainExp(m===k ? a : Math.floor(a*0.5))); }

    /**
     * Adds an item to the party's inventory.
     * @param {Game_Item|Game_Weapon|Game_Armor} i - The item to gain.
     */
    gainItem(i) { if(this.inventory.length < this.maxInventory) { this.inventory.push(i); this.gameSystem.log(`Got ${i.icon}${i.name}`); } else { this.gameSystem.log("Inv Full!"); } }
}
