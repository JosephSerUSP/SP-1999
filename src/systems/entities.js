import { $dataClasses } from '../data/data.js';

/**
 * Represents a generic item in the game.
 */
export class Game_Item {
    /**
     * Creates a new Game_Item.
     * @param {Object} d - The data object for the item.
     * @param {string} d.name - The name of the item.
     * @param {string} d.type - The type of the item (e.g., 'heal').
     * @param {number} d.val - The value associated with the item (e.g., heal amount).
     * @param {string} [d.icon] - The icon for the item.
     * @param {string} [d.desc] - The description of the item.
     */
    constructor(d) { this.name = d.name; this.type = d.type; this.val = d.val; this.category = "item"; this.icon = d.icon||"📦"; this.desc = d.desc||""; }
}

/**
 * Represents a weapon.
 */
export class Game_Weapon {
    /**
     * Creates a new Game_Weapon.
     * @param {Object} b - The base weapon data.
     * @param {Object} p - The prefix data modifying the weapon.
     */
    constructor(b, p) { this.name = `${p.name} ${b.name}`; this.atk = b.baseAtk + (p.atk||0); this.color = p.color; this.category = "weapon"; this.icon = b.icon||"⚔️"; this.desc = b.desc||""; }
}

/**
 * Represents armor.
 */
export class Game_Armor {
    /**
     * Creates a new Game_Armor.
     * @param {Object} b - The base armor data.
     */
    constructor(b) { this.name = b.name; this.def = b.baseDef; this.category = "armor"; this.icon = b.icon||"🛡️"; this.desc = b.desc||""; }
}

/**
 * Represents an enemy in the game.
 */
export class Game_Enemy {
    /**
     * Creates a new Game_Enemy.
     * @param {Object} d - The enemy data template.
     * @param {number} x - The x-coordinate on the map.
     * @param {number} y - The y-coordinate on the map.
     * @param {string|number} uid - Unique identifier for the enemy instance.
     * @param {number} hp - The hit points of the enemy.
     */
    constructor(d, x, y, uid, hp) {
        Object.assign(this, d); this.x = x; this.y = y; this.uid = uid; this.hp = hp; this.mhp = hp; this.alerted = false;
        this.def = 0; this.equip = {};
    }

    /**
     * Reduces the enemy's HP.
     * @param {number} v - The amount of damage to take.
     */
    takeDamage(v) { this.hp -= v; if(this.hp < 0) this.hp = 0; }

    /**
     * Checks if the enemy is dead.
     * @returns {boolean} True if HP <= 0.
     */
    isDead() { return this.hp <= 0; }

    /**
     * Gets the enemy's attack value.
     * @returns {number} The attack value.
     */
    getAtk() { return this.atk; }
}

/**
 * Represents a player character (actor).
 */
export class Game_Actor {
    /**
     * Creates a new Game_Actor.
     * @param {string} name - The name of the character (must match a key in $dataClasses).
     * @param {Object} gameSystem - Reference to Game_System for logging.
     */
    constructor(name, gameSystem) {
        this.gameSystem = gameSystem;
        const d = $dataClasses[name];
        Object.assign(this, d); this.name = name; this.mhp = d.hp; this.mpe = 100; this.pe = d.pe;
        this.equip = { weapon: null, armor: null }; this.level = 1; this.exp = 0; this.nextExp = 50; this.inventory = [];
        if(name === "Aya") this.equip.weapon = new Game_Weapon({name:"M84F", baseAtk:2, icon:"🔫"}, {name:"Std", atk:0});
        if(name === "Kyle") this.equip.armor = new Game_Armor({name:"Vest", baseDef:3, icon:"🦺"});
        this.uid = 'player';
    }

    /**
     * Checks if the actor is dead.
     * @returns {boolean} True if HP <= 0.
     */
    isDead() { return this.hp <= 0; }

    /**
     * Reduces the actor's HP.
     * @param {number} v - The amount of damage to take.
     */
    takeDamage(v) { this.hp = Math.max(0, this.hp - v); }

    /**
     * Restores the actor's HP.
     * @param {number} v - The amount of HP to heal.
     */
    heal(v) { this.hp = Math.min(this.mhp, this.hp + v); }

    /**
     * Regenerates a small amount of PE (Power Energy).
     */
    regenPE() { this.pe = Math.min(this.mpe, this.pe + 2); }

    /**
     * Adds experience points and handles leveling up.
     * @param {number} v - The amount of experience to gain.
     */
    gainExp(v) {
        this.exp += v;
        if(this.exp >= this.nextExp) {
            this.level++;
            this.exp = 0;
            this.nextExp = Math.floor(this.nextExp*1.5);
            this.mhp+=5;
            this.hp=this.mhp;
            this.atk++;
            if(this.gameSystem) this.gameSystem.log(`${this.name} Lv.${this.level}!`);
        }
    }

    /**
     * Gets the actor's total attack value including equipment.
     * @returns {number} Total attack.
     */
    getAtk() { return this.atk + (this.equip.weapon ? this.equip.weapon.atk : 0); }

    /**
     * Gets the actor's total defense value including equipment.
     * @returns {number} Total defense.
     */
    getDef() { return this.def + (this.equip.armor ? this.equip.armor.def : 0); }

    /**
     * Calculates what the attack would be with a specific item equipped.
     * @param {Game_Weapon} i - The item to check.
     * @returns {number} The hypothetical attack value.
     */
    getAtkWith(i) { return this.atk + (i.category === 'weapon' ? i.atk : (this.equip.weapon ? this.equip.weapon.atk : 0)); }

    /**
     * Calculates what the defense would be with a specific item equipped.
     * @param {Game_Armor} i - The item to check.
     * @returns {number} The hypothetical defense value.
     */
    getDefWith(i) { return this.def + (i.category === 'armor' ? i.def : (this.equip.armor ? this.equip.armor.def : 0)); }
}
