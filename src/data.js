// ============================================================================
// [1] DATA
// ============================================================================
/**
 * Configuration for game colors.
 * @constant
 * @type {Object}
 * @property {Object} colors - Map of color definitions.
 * @property {number} colors.floor - Hex color for floor tiles.
 * @property {number} colors.wall - Hex color for wall tiles.
 * @property {number} colors.fog - Hex color for fog.
 * @property {number} colors.bg - Hex color for background.
 */
const CONFIG = { colors: { floor: 0x333333, wall: 0x1a1a1a, fog: 0x051015, bg: 0x050510 } };

/**
 * Trait code for parameter addition.
 * @constant {number}
 */
const TRAIT_PARAM_PLUS = 1;
/**
 * Trait code for parameter rate (multiplier).
 * @constant {number}
 */
const TRAIT_PARAM_RATE = 2;
/**
 * Trait code for restriction (e.g. stunned).
 * @constant {number}
 */
const TRAIT_RESTRICTION = 3;
/**
 * Trait code for adding an attack skill.
 * @constant {number}
 */
const TRAIT_ATTACK_SKILL = 4;

/**
 * Effect code for dealing damage.
 * @constant {number}
 */
const EFFECT_DAMAGE = 11;
/**
 * Effect code for healing HP.
 * @constant {number}
 */
const EFFECT_HEAL = 12;
/**
 * Effect code for adding a state.
 * @constant {number}
 */
const EFFECT_ADD_STATE = 21;
/**
 * Effect code for recovering PE.
 * @constant {number}
 */
const EFFECT_RECOVER_PE = 31;
/**
 * Effect code for revealing the map.
 * @constant {number}
 */
const EFFECT_SCAN_MAP = 41;

/**
 * Parameter ID for Maximum HP.
 * @constant {number}
 */
const PARAM_MHP = 0;
/**
 * Parameter ID for Maximum PE.
 * @constant {number}
 */
const PARAM_MPE = 1;
/**
 * Parameter ID for Attack.
 * @constant {number}
 */
const PARAM_ATK = 2;
/**
 * Parameter ID for Defense.
 * @constant {number}
 */
const PARAM_DEF = 3;

/**
 * Definitions for game states (buffs/debuffs).
 * @constant
 * @type {Object.<string, Object>}
 */
const $dataStates = {
    "barrier": { name: "Barrier", duration: 4, icon: "🛡️", traits: [{ code: TRAIT_PARAM_PLUS, dataId: PARAM_DEF, value: 2 }] },
    "stun": { name: "Stunned", duration: 2, icon: "⚡", traits: [{ code: TRAIT_RESTRICTION, dataId: 0, value: 0 }] },
    "poison": { name: "Poison", duration: 5, icon: "☠️", traits: [] }
};

/**
 * Data definitions for all available skills.
 * @constant
 * @type {Object.<string, Object>}
 */
const $dataSkills = {
    "rapid": { name: "Rapid Fire", cost: 10, range: 6, type: "target", count: 2, effects: [{code: EFFECT_DAMAGE, value: 1.2}], desc: (a) => `2x shots. Est: ${Math.floor(a.atk * 1.2) * 2} DMG.` },
    "scan": { name: "Scan", cost: 5, range: 0, type: "self", effects: [{code: EFFECT_SCAN_MAP}], desc: () => "Map Intel. Reveals sector layout." },
    "blast": { name: "Grenade", cost: 15, range: 100, type: "all_enemies", effects: [{code: EFFECT_DAMAGE, value: 15, fixed: true}], desc: () => "AoE Blast. 15 DMG to all hostiles." },
    "barrier": { name: "Barrier", cost: 20, range: 0, type: "self", effects: [{code: EFFECT_ADD_STATE, dataId: 'barrier'}], desc: () => "Nano-shield. DEF +2 temporarily." },
    "combust": { name: "Combust", cost: 25, range: 100, type: "all_enemies", effects: [{code: EFFECT_DAMAGE, value: 25, fixed: true}], desc: () => "Ignite Room. 25 Fire DMG to all." },
    "drain": { name: "Drain", cost: 10, range: 2, type: "target", effects: [{code: EFFECT_DAMAGE, value: 10, fixed: true}, {code: EFFECT_HEAL, value: 10, target: 'self'}], desc: () => "Bio-leech. 10 DMG + Heal Self." },
    "snipe": { name: "Snipe", cost: 15, range: 8, type: "target", effects: [{code: EFFECT_DAMAGE, value: 3.0}], desc: (a) => `Precision shot. Est: ${Math.floor(a.atk * 3.0)} DMG.` },
    "heal": { name: "Heal", cost: 15, range: 0, type: "self", effects: [{code: EFFECT_HEAL, value: 30}], desc: () => "Restore 30 HP." },
    "stun": { name: "Stun Bat", cost: 10, range: 1, type: "target", effects: [{code: EFFECT_DAMAGE, value: 1.0}, {code: EFFECT_ADD_STATE, dataId: 'stun', chance: 0.5}], desc: (a) => "Melee shock. Chance to stun." },
    "nuke": { name: "Overload", cost: 60, range: 100, type: "all_enemies", effects: [{code: EFFECT_DAMAGE, value: 60, fixed: true}], desc: () => "Discharge all PE. 60 DMG." },
    "gunshot": { name: "Gunshot", cost: 0, range: 5, type: "line", effects: [{code: EFFECT_DAMAGE, value: 1.5}], desc: (a) => `Ranged shot. Est: ${Math.floor(a.atk * 1.5)} DMG.` }
};

/**
 * Data definitions for player classes/characters.
 * @constant
 * @type {Object.<string, Object>}
 */
const $dataClasses = {
    "Aya": {
        job: "Detective", hp: 45, atk: 4, def: 2, pe: 40, color: 0xffff00, skills: ["rapid", "scan", "snipe"],
        banter: [
            { text: "Got one.", trigger: "kill", chance: 0.5 },
            { text: "Messy work.", trigger: "kill", chance: 0.3 },
            { text: "Down you go.", trigger: "kill", chance: 0.3 },
            { text: "Another stat.", trigger: "kill", chance: 0.2 },
            { text: "Clean shot.", trigger: "kill", chance: 0.2 },
            { text: "Checking corners.", trigger: "walk", chance: 0.05 },
            { text: "Watch your step.", trigger: "walk", chance: 0.05 },
            { text: "Quiet...", trigger: "walk", chance: 0.05 },
            { text: "Scanning area.", trigger: "walk", chance: 0.05 },
            { text: "Don't like this quiet.", trigger: "walk", chance: 0.05 },
            { text: "Too many of them!", trigger: "surrounded", chance: 0.4, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Need backup here!", trigger: "surrounded", chance: 0.4, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "They're everywhere.", trigger: "surrounded", chance: 0.3, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Back to back!", trigger: "surrounded", chance: 0.3, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Getting crowded.", trigger: "surrounded", chance: 0.3, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Found something.", trigger: "loot", chance: 0.8 },
            { text: "Useful.", trigger: "loot", chance: 0.5 },
            { text: "Bagging it.", trigger: "loot", chance: 0.5 },
            { text: "Evidence?", trigger: "loot", chance: 0.3 },
            { text: "Mine.", trigger: "loot", chance: 0.3 },
            { text: "Damn it!", trigger: "hurt", chance: 0.5 },
            { text: "Just a scratch.", trigger: "hurt", chance: 0.4 },
            { text: "Need a medic!", trigger: "hurt", chance: 0.3 },
            { text: "They hit hard.", trigger: "hurt", chance: 0.3 },
            { text: "Ugh...", trigger: "hurt", chance: 0.3 },
            { text: "I'm bleeding bad.", trigger: "low_hp", chance: 0.8, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Vision blurring...", trigger: "low_hp", chance: 0.6, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Not done yet.", trigger: "low_hp", chance: 0.5, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Stronger.", trigger: "level_up", chance: 1.0 },
            { text: "Experience pays off.", trigger: "level_up", chance: 0.8 }
        ]
    },
    "Kyle": {
        job: "Trooper", hp: 70, atk: 3, def: 4, pe: 20, color: 0x0088ff, skills: ["blast", "barrier", "stun"],
        banter: [
            { text: "Target neutralized.", trigger: "kill", chance: 0.5 },
            { text: "Hostile down.", trigger: "kill", chance: 0.4 },
            { text: "Tango down.", trigger: "kill", chance: 0.4 },
            { text: "Threat cleared.", trigger: "kill", chance: 0.3 },
            { text: "One less.", trigger: "kill", chance: 0.3 },
            { text: "Moving out.", trigger: "walk", chance: 0.05 },
            { text: "Stay sharp.", trigger: "walk", chance: 0.05 },
            { text: "Check your six.", trigger: "walk", chance: 0.05 },
            { text: "Advancing.", trigger: "walk", chance: 0.05 },
            { text: "Maintain formation.", trigger: "walk", chance: 0.05 },
            { text: "We are surrounded!", trigger: "surrounded", chance: 0.5, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Suppressing fire!", trigger: "surrounded", chance: 0.4, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Multiple contacts!", trigger: "surrounded", chance: 0.4, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Defensive perimeter!", trigger: "surrounded", chance: 0.3, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "They're swarming.", trigger: "surrounded", chance: 0.3, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Supplies secured.", trigger: "loot", chance: 0.8 },
            { text: "Equipment recovered.", trigger: "loot", chance: 0.6 },
            { text: "Asset acquired.", trigger: "loot", chance: 0.5 },
            { text: "Lock and load.", trigger: "loot", chance: 0.4 },
            { text: "Good find.", trigger: "loot", chance: 0.4 },
            { text: "Taking fire!", trigger: "hurt", chance: 0.6 },
            { text: "Armor hit!", trigger: "hurt", chance: 0.5 },
            { text: "I'm hit!", trigger: "hurt", chance: 0.5 },
            { text: "Damage report.", trigger: "hurt", chance: 0.3 },
            { text: "Grr...", trigger: "hurt", chance: 0.3 },
            { text: "Critical condition.", trigger: "low_hp", chance: 0.8, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Need evac...", trigger: "low_hp", chance: 0.6, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Holding the line.", trigger: "low_hp", chance: 0.5, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Combat efficiency up.", trigger: "level_up", chance: 1.0 },
            { text: "Promoted.", trigger: "level_up", chance: 0.8 }
        ]
    },
    "Eve": {
        job: "Subject", hp: 35, atk: 6, def: 1, pe: 80, color: 0xff0044, skills: ["combust", "drain", "nuke", "heal"],
        banter: [
            { text: "Burn.", trigger: "kill", chance: 0.6 },
            { text: "Gone.", trigger: "kill", chance: 0.5 },
            { text: "Ashes.", trigger: "kill", chance: 0.4 },
            { text: "It screamed.", trigger: "kill", chance: 0.4 },
            { text: "Fuel.", trigger: "kill", chance: 0.3 },
            { text: "It calls to me.", trigger: "walk", chance: 0.05 },
            { text: "So dark...", trigger: "walk", chance: 0.05 },
            { text: "Can you hear it?", trigger: "walk", chance: 0.05 },
            { text: "Wandering.", trigger: "walk", chance: 0.05 },
            { text: "The stack breathes.", trigger: "walk", chance: 0.05 },
            { text: "So many souls.", trigger: "surrounded", chance: 0.5, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Get away!", trigger: "surrounded", chance: 0.4, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "I'll burn them all.", trigger: "surrounded", chance: 0.4, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Too loud...", trigger: "surrounded", chance: 0.3, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Crowded.", trigger: "surrounded", chance: 0.3, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Pretty.", trigger: "loot", chance: 0.7 },
            { text: "Mine.", trigger: "loot", chance: 0.6 },
            { text: "Can I keep it?", trigger: "loot", chance: 0.5 },
            { text: "Shiny.", trigger: "loot", chance: 0.4 },
            { text: "Curious.", trigger: "loot", chance: 0.4 },
            { text: "Pain...", trigger: "hurt", chance: 0.6 },
            { text: "Don't touch me!", trigger: "hurt", chance: 0.5 },
            { text: "My blood...", trigger: "hurt", chance: 0.5 },
            { text: "Stop it.", trigger: "hurt", chance: 0.4 },
            { text: "Ah!", trigger: "hurt", chance: 0.4 },
            { text: "Fading...", trigger: "low_hp", chance: 0.8, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Cold...", trigger: "low_hp", chance: 0.6, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Help me.", trigger: "low_hp", chance: 0.5, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Power growing.", trigger: "level_up", chance: 1.0 },
            { text: "Evolving.", trigger: "level_up", chance: 0.8 }
        ]
    }
};

/**
 * Data definitions for enemies.
 * @constant
 * @type {Array<Object>}
 */
const $dataEnemies = [
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
const $dataLootTable = {
    prefixes: [ { name: "Rusty", atk: -1 }, { name: "Standard", atk: 0 }, { name: "Polished", atk: 1 }, { name: "Violent", atk: 3 }, { name: "Toxic", atk: 2 }, { name: "Ancient", atk: 5 }, { name: "Tech", atk: 2 } ],
    weapons: [ { name: "M92F", baseAtk: 4, icon: "🔫", desc: "Standard issue sidearm.", attackSkill: "gunshot" }, { name: "Tonfa", baseAtk: 3, icon: "⚔️", desc: "Police baton for CQC." }, { name: "Shotgun", baseAtk: 8, icon: "💥", desc: "High damage, loud noise.", attackSkill: "gunshot" }, { name: "Revolver", baseAtk: 6, icon: "🤠", desc: "Reliable six-shooter.", attackSkill: "gunshot" }, { name: "Blade", baseAtk: 5, icon: "🗡️", desc: "Sharp tactical knife." } ],
    armors: [
        { name: "N Vest", baseDef: 2, icon: "🦺", desc: "Basic protection." },
        { name: "Kevlar", baseDef: 5, icon: "🛡️", desc: "Ballistic weave vest." },
        { name: "Cmbt Suit", baseDef: 8, icon: "🧥", desc: "Full body tactical armor." },
        { name: "Tac Gear", baseDef: 6, icon: "🥋", desc: "Lightweight ops gear." },
        { name: "Crowd Shield", baseDef: 3, icon: "🛡️", desc: "Defends better in crowds.", traits: [{ code: TRAIT_PARAM_PLUS, dataId: PARAM_DEF, value: 5, condition: { type: 'enemy_count_range', range: 5, min: 3 } }] }
    ],
    items: [ { name: "Medicine 1", type: "heal", val: 30, icon: "💊", desc: "Heals 30 HP." }, { name: "Medicine 2", type: "heal", val: 60, icon: "💉", desc: "Heals 60 HP." }, { name: "Stim", type: "pe", val: 20, icon: "🧪", desc: "Restores 20 PE." }, { name: "Antidote", type: "cure", val: 0, icon: "🧬", desc: "Cures poison." } ]
};

/**
 * Configuration for floor generation.
 * @constant
 * @type {Object}
 */
const $dataFloors = {
    1: { width: 30, height: 30, rooms: 12, enemies: 6, loot: 5, cutscene: 'intro', generator: 'dungeon' },
    2: { width: 40, height: 40, rooms: 15, enemies: 10, loot: 8, generator: 'dungeon' },
    3: { width: 50, height: 50, rooms: 20, enemies: 15, loot: 12, generator: 'cave', density: 0.45 },
    default: { width: 60, height: 60, rooms: 25, enemies: 20, loot: 15, generator: 'dungeon' }
};

/**
 * Data for cutscenes.
 * @constant
 * @type {Object}
 */
const $dataCutscenes = {
    'intro': [
        { type: 'wait', time: 500 },
        { type: 'dialog', text: "Target area reached. The stack goes deep.", speaker: "KYLE" },
        { type: 'dialog', text: "My mitochondria... they're screaming.", speaker: "AYA" },
        { type: 'log', text: "Mission Start." }
    ]
};
