/**
 * Configuration for game colors.
 * @constant
 * @type {Object}
 */
export const CONFIG = { colors: { floor: 0x333333, wall: 0x1a1a1a, fog: 0x051015, bg: 0x050510 } };

/**
 * Data definitions for all available skills.
 * @constant
 * @type {Object}
 */
export const $dataSkills = {
    "rapid": { name: "Rapid Fire", cost: 10, range: 6, type: "target", power: 1.2, count: 2, desc: (a) => `2x shots. Est: ${Math.floor(a.atk * 1.2) * 2} DMG.` },
    "scan": { name: "Scan", cost: 5, range: 0, type: "self", power: 0, desc: () => "Map Intel. Reveals sector layout." },
    "blast": { name: "Grenade", cost: 15, range: 100, type: "all_enemies", power: 15, fixed: true, desc: () => "AoE Blast. 15 DMG to all hostiles." },
    "barrier": { name: "Barrier", cost: 20, range: 0, type: "self", power: 0, desc: () => "Nano-shield. DEF +2 temporarily." },
    "combust": { name: "Combust", cost: 25, range: 100, type: "all_enemies", power: 25, fixed: true, desc: () => "Ignite Room. 25 Fire DMG to all." },
    "drain": { name: "Drain", cost: 10, range: 2, type: "target", power: 10, fixed: true, desc: () => "Bio-leech. 10 DMG + Heal Self." },
    "snipe": { name: "Snipe", cost: 15, range: 8, type: "target", power: 3.0, desc: (a) => `Precision shot. Est: ${Math.floor(a.atk * 3.0)} DMG.` },
    "heal": { name: "Heal", cost: 15, range: 0, type: "self", power: 30, fixed: true, desc: () => "Restore 30 HP." },
    "stun": { name: "Stun Bat", cost: 10, range: 1, type: "target", power: 1.0, desc: (a) => "Melee shock. Chance to stun." },
    "nuke": { name: "Overload", cost: 60, range: 100, type: "all_enemies", power: 60, fixed: true, desc: () => "Discharge all PE. 60 DMG." }
};

/**
 * Data definitions for player classes/characters.
 * @constant
 * @type {Object}
 */
export const $dataClasses = {
    "Aya": { job: "Detective", hp: 45, atk: 4, def: 2, pe: 40, color: 0xffff00, skills: ["rapid", "scan", "snipe"] },
    "Kyle": { job: "Trooper", hp: 70, atk: 3, def: 4, pe: 20, color: 0x0088ff, skills: ["blast", "barrier", "stun"] },
    "Eve": { job: "Subject", hp: 35, atk: 6, def: 1, pe: 80, color: 0xff0044, skills: ["combust", "drain", "nuke", "heal"] }
};

/**
 * Data definitions for enemies.
 * @constant
 * @type {Array<Object>}
 */
export const $dataEnemies = [
    { id: 1, name: "Sewer Rat", hp: 12, atk: 3, exp: 5, color: 0x885544, scale: 0.4, ai: "hunter" },
    { id: 2, name: "Ooze", hp: 25, atk: 5, exp: 12, color: 0x00ff44, scale: 0.6, ai: "patrol" },
    { id: 3, name: "Stalker", hp: 40, atk: 8, exp: 25, color: 0xff4400, scale: 0.8, ai: "ambush" },
    { id: 4, name: "Watcher", hp: 20, atk: 12, exp: 15, color: 0xaa00ff, scale: 0.5, ai: "turret" },
    { id: 5, name: "Drone", hp: 15, atk: 4, exp: 10, color: 0xaaaaaa, scale: 0.3, ai: "hunter" },
    { id: 6, name: "Mutant Hound", hp: 30, atk: 6, exp: 20, color: 0x880000, scale: 0.5, ai: "hunter" },
    { id: 7, name: "Abomination", hp: 80, atk: 10, exp: 50, color: 0x440044, scale: 1.0, ai: "patrol" }
];

/**
 * Loot table for generating random items.
 * @constant
 * @type {Object}
 */
export const $dataLootTable = {
    prefixes: [ { name: "Rusty", atk: -1 }, { name: "Standard", atk: 0 }, { name: "Polished", atk: 1 }, { name: "Violent", atk: 3 }, { name: "Toxic", atk: 2 }, { name: "Ancient", atk: 5 }, { name: "Tech", atk: 2 } ],
    weapons: [ { name: "M92F", baseAtk: 4, icon: "🔫", desc: "Standard issue sidearm." }, { name: "Tonfa", baseAtk: 3, icon: "⚔️", desc: "Police baton for CQC." }, { name: "Shotgun", baseAtk: 8, icon: "💥", desc: "High damage, loud noise." }, { name: "Revolver", baseAtk: 6, icon: "🤠", desc: "Reliable six-shooter." }, { name: "Blade", baseAtk: 5, icon: "🗡️", desc: "Sharp tactical knife." } ],
    armors: [ { name: "N Vest", baseDef: 2, icon: "🦺", desc: "Basic protection." }, { name: "Kevlar", baseDef: 5, icon: "🛡️", desc: "Ballistic weave vest." }, { name: "Cmbt Suit", baseDef: 8, icon: "🧥", desc: "Full body tactical armor." }, { name: "Tac Gear", baseDef: 6, icon: "🥋", desc: "Lightweight ops gear." } ],
    items: [ { name: "Medicine 1", type: "heal", val: 30, icon: "💊", desc: "Heals 30 HP." }, { name: "Medicine 2", type: "heal", val: 60, icon: "💉", desc: "Heals 60 HP." }, { name: "Stim", type: "pe", val: 20, icon: "🧪", desc: "Restores 20 PE." }, { name: "Antidote", type: "cure", val: 0, icon: "🧬", desc: "Cures poison." } ]
};

/**
 * Configuration for floor generation.
 * @constant
 * @type {Object}
 */
export const $dataFloors = {
    1: { width: 30, height: 30, rooms: 12, enemies: 6, loot: 5, cutscene: 'intro' },
    2: { width: 40, height: 40, rooms: 15, enemies: 10, loot: 8 },
    3: { width: 50, height: 50, rooms: 20, enemies: 15, loot: 12 },
    default: { width: 60, height: 60, rooms: 25, enemies: 20, loot: 15 }
};

/**
 * Data for cutscenes.
 * @constant
 * @type {Object}
 */
export const $dataCutscenes = {
    'intro': [
        { type: 'wait', time: 500 },
        { type: 'dialog', text: "Target area reached. The stack goes deep.", speaker: "KYLE" },
        { type: 'dialog', text: "My mitochondria... they're screaming.", speaker: "AYA" },
        { type: 'log', text: "Mission Start." }
    ]
};

const Data = {
    CONFIG,
    skills: $dataSkills,
    classes: $dataClasses,
    enemies: $dataEnemies,
    lootTable: $dataLootTable,
    floors: $dataFloors,
    cutscenes: $dataCutscenes
};

export default Data;
