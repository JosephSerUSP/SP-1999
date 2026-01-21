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
    "panting": { name: "Panting", duration: 2, icon: "😓", traits: [{ code: TRAIT_RESTRICTION, dataId: 0, value: 0 }] },
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
    "drain": { name: "Drain", cost: 10, range: 2, type: "circle", effects: [{code: EFFECT_DAMAGE, value: 10, fixed: true}, {code: EFFECT_HEAL, value: 10, target: 'self'}], desc: () => "Bio-leech. 10 DMG + Heal Self." },
    "snipe": { name: "Snipe", cost: 15, range: 8, type: "target", effects: [{code: EFFECT_DAMAGE, value: 3.0}], desc: (a) => `Precision shot. Est: ${Math.floor(a.atk * 3.0)} DMG.` },
    "heal": { name: "Heal", cost: 15, range: 0, type: "self", effects: [{code: EFFECT_HEAL, value: 30}], desc: () => "Restore 30 HP." },
    "stun": { name: "Stun Bat", cost: 10, range: 1, type: "target", effects: [{code: EFFECT_DAMAGE, value: 1.0}, {code: EFFECT_ADD_STATE, dataId: 'stun', chance: 0.5}], desc: (a) => "Melee shock. Chance to stun." },
    "nuke": { name: "Overload", cost: 60, range: 100, type: "all_enemies", effects: [{code: EFFECT_DAMAGE, value: 60, fixed: true}], desc: () => "Discharge all PE. 60 DMG." },
    "gunshot": { name: "Gunshot", cost: 0, range: 5, type: "line", piercing: false, effects: [{code: EFFECT_DAMAGE, value: 1.5}], desc: (a) => `Ranged shot. Est: ${Math.floor(a.atk * 1.5)} DMG.` },
    "melee": { name: "Melee", cost: 0, range: 1, type: "target", effects: [{code: EFFECT_DAMAGE, value: 1.0}], desc: (a) => `Basic attack. Est: ${Math.floor(a.atk)} DMG.` },

    // New Skills for AI/Player Shape Testing
    "cone_shot": { name: "Scatter Shot", cost: 10, range: 3, type: "cone", effects: [{code: EFFECT_DAMAGE, value: 1.2}], desc: (a) => "Cone AoE attack." },
    "spin_slash": { name: "Spin Slash", cost: 15, range: 1, type: "circle", effects: [{code: EFFECT_DAMAGE, value: 1.5}], desc: (a) => "Hit all adjacent units." },
    "charge_blade": { name: "Charge Blade", cost: 0, range: 1, type: "target", effects: [{code: EFFECT_DAMAGE, value: 2.0}], desc: (a) => "Heavy Melee attack." },
    "tactical_shot": { name: "Tac Shot", cost: 0, range: 6, type: "line", effects: [{code: EFFECT_DAMAGE, value: 1.2}], desc: (a) => "Ranged shot. Triggers Melee Mode." }
};

/**
 * Data definitions for player classes/characters.
 * Updated with new Banter System fields: priority, reply, id.
 * Priorities: 100 (Story), 50 (High Reactivity), 10 (Idle/Flavor).
 * @constant
 * @type {Object.<string, Object>}
 */
const $dataClasses = {
    "Julia": {
        job: "Agent", hp: 45, atk: 4, def: 2, pe: 40, color: 0xffff00, skills: ["rapid", "scan", "snipe"],
        portrait: "img/portraits/Julia.png",
        banter: [
            // KILL
            { text: "Threat neutralized.", trigger: "kill", chance: 0.4, priority: 20, reply: { speaker: "Miguel", text: "Nice work, Julia.", chance: 0.5 } },
            { text: "Done.", trigger: "kill", chance: 0.2, priority: 10 },
            { text: "Messy.", trigger: "kill", chance: 0.2, priority: 10 },
            { text: "One less variable.", trigger: "kill", chance: 0.2, priority: 10 },

            // WALK
            { text: "Checking corners.", trigger: "walk", chance: 0.05, priority: 10 },
            { text: "Watch your step.", trigger: "walk", chance: 0.05, priority: 10 },
            { text: "Quiet.", trigger: "walk", chance: 0.05, priority: 10, reply: { speaker: "Rebus", text: "The static hums...", chance: 0.5 } },
            { text: "Scanning sector.", trigger: "walk", chance: 0.05, priority: 10 },

            // SURROUNDED (High Priority)
            { text: "Too many of them.", trigger: "surrounded", chance: 0.6, priority: 60, condition: { type: "enemy_count_range", range: 5, min: 3 }, reply: { speaker: "Miguel", text: "I-I'm trying to cover you!", chance: 1.0 } },
            { text: "Back to back.", trigger: "surrounded", chance: 0.5, priority: 60, condition: { type: "enemy_count_range", range: 5, min: 3 } },

            // LOOT
            { text: "Secured.", trigger: "loot", chance: 0.5, priority: 30 },
            { text: "Useful.", trigger: "loot", chance: 0.3, priority: 30 },
            { text: "Might be evidence.", trigger: "loot", chance: 0.2, priority: 30 },

            // HURT
            { text: "Tch.", trigger: "hurt", chance: 0.4, priority: 50 },
            { text: "Careless.", trigger: "hurt", chance: 0.3, priority: 50, reply: { speaker: "Miguel", text: "Julia! Are you okay?", chance: 0.6 } },

            // LOW HP
            { text: "I'm bleeding.", trigger: "low_hp", chance: 0.8, priority: 80, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Focus... stay focused.", trigger: "low_hp", chance: 0.6, priority: 80, condition: { type: "hp_below_pct", value: 0.3 } },

            // LEVEL UP
            { text: "Efficiency increased.", trigger: "level_up", chance: 1.0, priority: 70 },

            // START (New)
            { text: "Let's move. Recording started.", trigger: "start", chance: 1.0, priority: 50 },
            { text: "Stay focused.", trigger: "start", chance: 0.5, priority: 50, reply: { speaker: "Rebus", text: "I am... watching.", chance: 0.4 } }
        ]
    },
    "Miguel": {
        job: "Analyst", hp: 70, atk: 3, def: 4, pe: 20, color: 0x0088ff, skills: ["blast", "barrier", "stun"],
        portrait: "img/portraits/Miguel.png",
        banter: [
            // KILL
            { text: "Oh, wow. Did I do that?", trigger: "kill", chance: 0.4, priority: 20, reply: { speaker: "Julia", text: "Don't hesitate.", chance: 0.4 } },
            { text: "Safe... for now.", trigger: "kill", chance: 0.3, priority: 10 },
            { text: "Is it... dead?", trigger: "kill", chance: 0.3, priority: 10 },

            // WALK
            { text: "My heart's racing.", trigger: "walk", chance: 0.05, priority: 10 },
            { text: "Did you hear that?", trigger: "walk", chance: 0.05, priority: 10, reply: { speaker: "Julia", text: "Nothing on thermal.", chance: 0.5 } },
            { text: "I wish Olavo was here.", trigger: "walk", chance: 0.05, priority: 10 },

            // SURROUNDED
            { text: "Guys? Guys?!", trigger: "surrounded", chance: 0.6, priority: 60, condition: { type: "enemy_count_range", range: 5, min: 3 }, reply: { speaker: "Rebus", text: "They congregate.", chance: 0.7 } },
            { text: "I don't like these odds!", trigger: "surrounded", chance: 0.5, priority: 60, condition: { type: "enemy_count_range", range: 5, min: 3 } },

            // LOOT
            { text: "Found something!", trigger: "loot", chance: 0.6, priority: 30 },
            { text: "Can we use this?", trigger: "loot", chance: 0.4, priority: 30 },

            // HURT
            { text: "Ah! Not the face!", trigger: "hurt", chance: 0.5, priority: 50 },
            { text: "I think I broke something...", trigger: "hurt", chance: 0.4, priority: 50 },

            // LOW HP
            { text: "I don't want to die here...", trigger: "low_hp", chance: 0.8, priority: 80, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Everything's spinning...", trigger: "low_hp", chance: 0.6, priority: 80, condition: { type: "hp_below_pct", value: 0.3 } },

            // LEVEL UP
            { text: "I think I'm getting the hang of this.", trigger: "level_up", chance: 1.0, priority: 70 },

             // START
            { text: "Systems nominal. I think? Olavo is watching, right?", trigger: "start", chance: 1.0, priority: 50 }
        ]
    },
    "Rebus": {
        job: "Entity", hp: 35, atk: 6, def: 1, pe: 80, color: 0xff0044, skills: ["combust", "drain", "nuke", "heal"],
        portrait: "img/portraits/Rebus.png",
        banter: [
            // KILL
            { text: "Deleted.", trigger: "kill", chance: 0.5, priority: 20 },
            { text: "It returns to the code.", trigger: "kill", chance: 0.4, priority: 10 },
            { text: "Zeroes and ones.", trigger: "kill", chance: 0.3, priority: 10 },
            { text: "Silence.", trigger: "kill", chance: 0.3, priority: 20, reply: { speaker: "Miguel", text: "Uh, good job?", chance: 0.6 } },

            // WALK
            { text: "This place... it remembers.", trigger: "walk", chance: 0.05, priority: 10 },
            { text: "So many layers...", trigger: "walk", chance: 0.05, priority: 10 },
            { text: "I feel... heavy.", trigger: "walk", chance: 0.05, priority: 10 },

            // SURROUNDED
            { text: "The data is loud.", trigger: "surrounded", chance: 0.5, priority: 60, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "They want to be real.", trigger: "surrounded", chance: 0.5, priority: 60, condition: { type: "enemy_count_range", range: 5, min: 3 }, reply: { speaker: "Julia", text: "Focus on the target!", chance: 0.8 } },

            // LOOT
            { text: "A fragment.", trigger: "loot", chance: 0.5, priority: 30 },
            { text: "It shines.", trigger: "loot", chance: 0.5, priority: 30 },

            // HURT
            { text: "Interference.", trigger: "hurt", chance: 0.5, priority: 50 },
            { text: "This vessel... fragile.", trigger: "hurt", chance: 0.5, priority: 50 },

            // LOW HP
            { text: "Unspooling...", trigger: "low_hp", chance: 0.8, priority: 80, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "The signal... fading.", trigger: "low_hp", chance: 0.6, priority: 80, condition: { type: "hp_below_pct", value: 0.3 }, reply: { speaker: "Miguel", text: "Stay with us, Rebus!", chance: 1.0 } },

            // LEVEL UP
            { text: "My definition expands.", trigger: "level_up", chance: 1.0, priority: 70 },

            // START
            { text: "I am... here again.", trigger: "start", chance: 1.0, priority: 50 }
        ]
    }
};

/**
 * Data definitions for enemies.
 * @constant
 * @type {Array<Object>}
 */
const $dataEnemies = [
    {
        id: 1, name: "Sewer Rat", hp: 12, atk: 3, exp: 5, color: 0x885544, scale: 0.4, ai: "hunter",
        aiConfig: {
            movement: "hunter",
            actions: [
                { skill: "stun", priority: 10, condition: { range: [1,1] } } // Bite
            ]
        }
    },
    {
        id: 2, name: "Ooze", hp: 25, atk: 5, exp: 12, color: 0x00ff44, scale: 0.6, ai: "patrol",
        aiConfig: { movement: "patrol", fleeThreshold: 0.3 }
    },
    {
        id: 3, name: "Stalker", hp: 40, atk: 8, exp: 25, color: 0xff4400, scale: 0.8, ai: "ambush",
        aiConfig: { movement: "ambush", fleeThreshold: 0.3 }
    },
    {
        id: 4, name: "Watcher", hp: 20, atk: 12, exp: 15, color: 0xaa00ff, scale: 0.5, ai: "turret",
        aiConfig: {
            movement: "turret", // Turret behavior logic
            actions: [
                {
                    skill: "gunshot",
                    priority: 20,
                    condition: { range: [2,6], interval: 2 } // Shoots every 2 turns
                }
            ]
        }
    },
    {
        id: 5, name: "Drone", hp: 15, atk: 4, exp: 10, color: 0xaaaaaa, scale: 0.3, ai: "hunter",
        aiConfig: {
            movement: "hunter",
            actions: [
                { skill: "cone_shot", priority: 20, cooldown: 3, condition: { range: [1, 3] } }
            ]
        }
    },
    {
        id: 6, name: "Mutant Hound", hp: 30, atk: 6, exp: 20, color: 0x880000, scale: 0.5, ai: "hunter",
        aiConfig: { movement: "hunter", fleeThreshold: 0.3 }
    },
    {
        id: 7, name: "Abomination", hp: 80, atk: 10, exp: 50, color: 0x440044, scale: 1.0, ai: "patrol",
        aiConfig: { movement: "patrol", fleeThreshold: 0.3 }
    },

    // NEW ENEMY: Tactical Trooper
    // Shoots then charges (Switching behavior)
    {
        id: 8, name: "Simulacrum", hp: 50, atk: 8, exp: 35, color: 0x008888, scale: 0.7, ai: "tactical",
        aiConfig: {
            movement: "hunter",
            actions: [
                // If in melee mode, use Charge Blade
                {
                    skill: "charge_blade",
                    priority: 30,
                    condition: { range: [1,1], state: 'meleeMode', value: true },
                    onUse: { clearState: 'meleeMode' } // Switch back after hit? Or stay? "Land 2 hits" logic requires counter.
                    // For demo: Switch back immediately (shoot once, charge once, repeat)
                },
                // If adjacent but NOT in melee mode yet? Force switch if close?
                {
                    skill: "charge_blade",
                    priority: 25,
                    condition: { range: [1,1] }, // Use melee if close anyway
                    onUse: { setState: 'meleeMode' }
                },
                // Ranged attack - Triggers melee mode
                {
                    skill: "tactical_shot",
                    priority: 20,
                    condition: { range: [2,6], notState: 'meleeMode' },
                    onUse: { setState: 'meleeMode' } // Switch to melee after shooting
                }
            ]
        }
    }
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
 * Note: `boss` and `texture` properties mentioned in design docs are not currently utilized by the generator.
 * @constant
 * @type {Object}
 */
const $dataFloors = {
    // VELDT Simulation: Green/Matrix aesthetic
    1: {
        width: 30, height: 30, rooms: 12, enemies: 6, loot: 5, cutscene: 'intro', generator: 'dungeon',
        colors: { floor: 0x001100, wall: 0x003300, fog: 0x001000, bg: 0x000500 }
    },
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
        { type: 'log', text: "São Paulo, 1999." },
        { type: 'wait', time: 1000 },
        { type: 'log', text: "INTRA Facility - VR Training Module [VELDT]" },
        { type: 'wait', time: 1000 },
        { type: 'dialog', text: "Recording started. Simulation VELDT initialized.", speaker: "JULIA" },
        { type: 'dialog', text: "It feels so... empty in here. Olavo is monitoring the feed, right?", speaker: "MIGUEL" },
        { type: 'dialog', text: "The code... it breathes.", speaker: "REBUS" },
        { type: 'log', text: "Mission Start." }
    ]
};
