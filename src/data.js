// ============================================================================
// [1] DATA (Parasite Eve Adaptation)
// ============================================================================
/**
 * Configuration for game colors.
 * @constant
 * @type {Object}
 * @property {Object} colors - Map of color definitions.
 */
const CONFIG = { colors: { floor: 0x222222, wall: 0x111111, fog: 0x050505, bg: 0x000000 } };

// TRAITS
const TRAIT_PARAM_PLUS = 1;
const TRAIT_PARAM_RATE = 2;
const TRAIT_RESTRICTION = 3;
const TRAIT_ATTACK_SKILL = 4;

// EFFECTS
const EFFECT_DAMAGE = 11;
const EFFECT_HEAL = 12;
const EFFECT_ADD_STATE = 21;
const EFFECT_RECOVER_PE = 31;
const EFFECT_SCAN_MAP = 41;

// PARAMS
const PARAM_MHP = 0;
const PARAM_MPE = 1;
const PARAM_ATK = 2;
const PARAM_DEF = 3;

/**
 * Definitions for game states (buffs/debuffs).
 */
const $dataStates = {
    "prerelease": { name: "Prerelease", duration: 5, icon: "🛡️", traits: [{ code: TRAIT_PARAM_PLUS, dataId: PARAM_DEF, value: 5 }] },
    "haste": { name: "Haste", duration: 3, icon: "⏩", traits: [{ code: TRAIT_PARAM_RATE, dataId: PARAM_ATK, value: 1.2 }] },
    "stun": { name: "Stunned", duration: 2, icon: "⚡", traits: [{ code: TRAIT_RESTRICTION, dataId: 0, value: 0 }] },
    "poison": { name: "Toxin", duration: 5, icon: "☠️", traits: [] },
    "confuse": { name: "Confused", duration: 3, icon: "😵", traits: [{ code: TRAIT_PARAM_RATE, dataId: PARAM_DEF, value: 0.5 }] }
};

/**
 * Data definitions for all available skills (Mitochondrial Powers).
 */
const $dataSkills = {
    // AYA SKILLS
    "rapid": { name: "Rapid Fire", cost: 10, range: 6, type: "target", count: 2, effects: [{code: EFFECT_DAMAGE, value: 0.8}], desc: (a) => `2x Shots. Est: ${Math.floor(a.atk * 0.8) * 2} DMG.` },
    "scan": { name: "Scan", cost: 5, range: 0, type: "self", effects: [{code: EFFECT_SCAN_MAP}], desc: () => "Mito-Scan. Reveals sector." },
    "energy_shot": { name: "Energy Shot", cost: 15, range: 8, type: "target", effects: [{code: EFFECT_DAMAGE, value: 2.5}], desc: (a) => `Focused PE. Est: ${Math.floor(a.atk * 2.5)} DMG.` },
    "liberate": { name: "Liberate", cost: 80, range: 100, type: "all_enemies", effects: [{code: EFFECT_DAMAGE, value: 50, fixed: true}, {code: EFFECT_HEAL, value: 999, target: 'self'}], desc: () => "Awaken. Massive DMG + Full Heal." },

    // KYLE SKILLS
    "grenade": { name: "Grenade", cost: 15, range: 100, type: "all_enemies", effects: [{code: EFFECT_DAMAGE, value: 15, fixed: true}], desc: () => "Frag out. 15 DMG to all." },
    "barrier": { name: "Barrier", cost: 20, range: 0, type: "self", effects: [{code: EFFECT_ADD_STATE, dataId: 'prerelease'}], desc: () => "Defense Up. DEF +5." },
    "stun_baton": { name: "Stun Baton", cost: 10, range: 1, type: "target", effects: [{code: EFFECT_DAMAGE, value: 1.2}, {code: EFFECT_ADD_STATE, dataId: 'stun', chance: 0.6}], desc: (a) => "Shock. Chance to stun." },
    "cover_fire": { name: "Cover Fire", cost: 25, range: 6, type: "line", effects: [{code: EFFECT_DAMAGE, value: 1.5}], desc: (a) => `Suppressing fire in line.` },

    // EVE SKILLS
    "pyro": { name: "Pyrokinesis", cost: 20, range: 5, type: "target", effects: [{code: EFFECT_DAMAGE, value: 25, fixed: true}], desc: () => "Ignite target. 25 Fire DMG." },
    "combustion": { name: "Combustion", cost: 40, range: 100, type: "all_enemies", effects: [{code: EFFECT_DAMAGE, value: 20, fixed: true}], desc: () => "Room heat. 20 Fire DMG to all." },
    "necrosis": { name: "Necrosis", cost: 15, range: 4, type: "target", effects: [{code: EFFECT_DAMAGE, value: 5, fixed: true}, {code: EFFECT_ADD_STATE, dataId: 'poison'}], desc: () => "Cellular decay. Poison target." },
    "metabolism": { name: "Metabolism", cost: 25, range: 0, type: "self", effects: [{code: EFFECT_HEAL, value: 40}], desc: () => "Accelerate healing. +40 HP." },

    // WEAPON SKILLS
    "gunshot": { name: "Gunshot", cost: 0, range: 5, type: "line", effects: [{code: EFFECT_DAMAGE, value: 1.0}], desc: (a) => `Standard shot.` },
    "shotgun_blast": { name: "Buckshot", cost: 0, range: 3, type: "line", effects: [{code: EFFECT_DAMAGE, value: 1.2}], desc: (a) => `Spread shot.` }
};

/**
 * Data definitions for player classes/characters.
 */
const $dataClasses = {
    "Aya": {
        job: "N.Y.P.D.", hp: 50, atk: 4, def: 3, pe: 60, color: 0xffffaa, skills: ["rapid", "scan", "energy_shot", "liberate"],
        banter: [
            { text: "Target down.", trigger: "kill", chance: 0.5 },
            { text: "My cells are boiling.", trigger: "kill", chance: 0.1 },
            { text: "Did that thing just... scream?", trigger: "kill", chance: 0.2 },
            { text: "Checking corners.", trigger: "walk", chance: 0.05 },
            { text: "It's quiet. Too quiet.", trigger: "walk", chance: 0.05 },
            { text: "I can feel them.", trigger: "walk", chance: 0.05 },
            { text: "Too many targets!", trigger: "surrounded", chance: 0.4, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Need support!", trigger: "surrounded", chance: 0.3, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Evidence secured.", trigger: "loot", chance: 0.5 },
            { text: "Useful.", trigger: "loot", chance: 0.5 },
            { text: "Damn!", trigger: "hurt", chance: 0.5 },
            { text: "I'm okay...", trigger: "hurt", chance: 0.4 },
            { text: "Vision fading...", trigger: "low_hp", chance: 0.8, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Can't give up...", trigger: "low_hp", chance: 0.5, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "I'm evolving.", trigger: "level_up", chance: 1.0 }
        ]
    },
    "Kyle": {
        job: "Detective", hp: 80, atk: 3, def: 5, pe: 20, color: 0x4488ff, skills: ["grenade", "barrier", "stun_baton", "cover_fire"],
        banter: [
            { text: "Scratch one.", trigger: "kill", chance: 0.5 },
            { text: "Ugly bastard down.", trigger: "kill", chance: 0.4 },
            { text: "Moving.", trigger: "walk", chance: 0.05 },
            { text: "Stay sharp, Brea.", trigger: "walk", chance: 0.05 },
            { text: "We're surrounded!", trigger: "surrounded", chance: 0.5, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Get off me!", trigger: "surrounded", chance: 0.4, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Found something.", trigger: "loot", chance: 0.6 },
            { text: "Taking hits!", trigger: "hurt", chance: 0.6 },
            { text: "Bleeding out...", trigger: "low_hp", chance: 0.8, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Stronger.", trigger: "level_up", chance: 0.8 }
        ]
    },
    "Eve": {
        job: "Clone", hp: 40, atk: 6, def: 2, pe: 100, color: 0xff4444, skills: ["pyro", "combustion", "necrosis", "metabolism"],
        banter: [
            { text: "Ashes.", trigger: "kill", chance: 0.6 },
            { text: "They break so easily.", trigger: "kill", chance: 0.5 },
            { text: "More heat.", trigger: "kill", chance: 0.4 },
            { text: "It calls to me.", trigger: "walk", chance: 0.05 },
            { text: "Mother is near.", trigger: "walk", chance: 0.05 },
            { text: "So many souls.", trigger: "surrounded", chance: 0.5, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Burn them all!", trigger: "surrounded", chance: 0.4, condition: { type: "enemy_count_range", range: 5, min: 3 } },
            { text: "Pretty.", trigger: "loot", chance: 0.7 },
            { text: "Pain is data.", trigger: "hurt", chance: 0.5 },
            { text: "Fading...", trigger: "low_hp", chance: 0.8, condition: { type: "hp_below_pct", value: 0.3 } },
            { text: "Evolving.", trigger: "level_up", chance: 1.0 }
        ]
    }
};

/**
 * Data definitions for enemies (Parasite Eve Campaign).
 */
const $dataEnemies = [
    // BIOME 1: THEATER (Rat, Bat, Actor)
    { id: 101, name: "Sewer Rat", hp: 15, atk: 4, exp: 5, color: 0x885544, scale: 0.4, ai: "hunter" },
    { id: 102, name: "Opera Bat", hp: 10, atk: 5, exp: 6, color: 0x444444, scale: 0.5, ai: "hunter" },
    { id: 103, name: "Burned Actor", hp: 25, atk: 6, exp: 12, color: 0xaa4444, scale: 0.9, ai: "patrol" },

    // BOSS 1: ACTRESS
    { id: 199, name: "Melissa", hp: 150, atk: 12, exp: 100, color: 0xff0000, scale: 1.2, ai: "hunter" },

    // BIOME 2: PARK (Snake, Monkey, Plant)
    { id: 201, name: "Viper", hp: 30, atk: 8, exp: 15, color: 0x00ff44, scale: 0.6, ai: "ambush" },
    { id: 202, name: "Mad Monkey", hp: 40, atk: 10, exp: 20, color: 0x885522, scale: 0.7, ai: "hunter" },
    { id: 203, name: "Blue Frog", hp: 35, atk: 12, exp: 18, color: 0x0088ff, scale: 0.5, ai: "turret" },

    // BOSS 2: WORM
    { id: 299, name: "Giant Worm", hp: 300, atk: 20, exp: 250, color: 0x88aa44, scale: 1.5, ai: "patrol" },

    // BIOME 3: HOSPITAL (Slime, Mixed, Nurse)
    { id: 301, name: "Green Slime", hp: 50, atk: 15, exp: 30, color: 0x00ff00, scale: 0.6, ai: "patrol" },
    { id: 302, name: "Mixed Man", hp: 80, atk: 18, exp: 45, color: 0xff00ff, scale: 1.0, ai: "hunter" },
    { id: 303, name: "Rat-Man", hp: 60, atk: 20, exp: 35, color: 0x884444, scale: 0.9, ai: "ambush" },

    // BOSS 3: SHEEVA
    { id: 399, name: "Sheeva", hp: 600, atk: 30, exp: 500, color: 0xff0088, scale: 1.1, ai: "hunter" },

    // BIOME 4: MUSEUM (Raptor, Knight, Scorpion)
    { id: 401, name: "Raptor", hp: 100, atk: 25, exp: 60, color: 0xaa8844, scale: 1.0, ai: "hunter" },
    { id: 402, name: "Armored Knight", hp: 150, atk: 30, exp: 80, color: 0xcccccc, scale: 1.2, ai: "patrol" },
    { id: 403, name: "Scorpion", hp: 80, atk: 28, exp: 70, color: 0xaa0000, scale: 0.8, ai: "turret" },

    // BOSS 4: ULTIMATE BEING
    { id: 499, name: "Ultimate Being", hp: 2000, atk: 50, exp: 9999, color: 0xffffff, scale: 2.0, ai: "hunter" }
];

/**
 * Loot table.
 */
const $dataLootTable = {
    prefixes: [ { name: "Rusty", atk: -1 }, { name: "Std", atk: 0 }, { name: "Polished", atk: 1 }, { name: "Tactical", atk: 3 }, { name: "Mito", atk: 5 }, { name: "Wayne's", atk: 8 } ],
    weapons: [
        { name: "M92F", baseAtk: 4, icon: "🔫", desc: "Standard 9mm.", attackSkill: "gunshot" },
        { name: "P229", baseAtk: 6, icon: "🔫", desc: "Silenced pistol.", attackSkill: "gunshot" },
        { name: "M870", baseAtk: 12, icon: "💥", desc: "Pump shotgun.", attackSkill: "shotgun_blast" },
        { name: "Tonfa", baseAtk: 5, icon: "⚔️", desc: "Police baton." },
        { name: "M4A1", baseAtk: 10, icon: "🔫", desc: "Assault Rifle.", attackSkill: "gunshot" }
    ],
    armors: [
        { name: "N Vest", baseDef: 3, icon: "🦺", desc: "Light protection." },
        { name: "Kevlar", baseDef: 8, icon: "🛡️", desc: "Police issue." },
        { name: "Cmbt Armor", baseDef: 15, icon: "🧥", desc: "SWAT gear." },
        { name: "Cr Jacket", baseDef: 12, icon: "🧥", desc: "Resistant fabric." },
        { name: "Sv Armor", baseDef: 20, icon: "🥋", desc: "Spectra vest." }
    ],
    items: [
        { name: "Medicine 1", type: "heal", val: 50, icon: "💊", desc: "Heals 50 HP." },
        { name: "Medicine 2", type: "heal", val: 100, icon: "💉", desc: "Heals 100 HP." },
        { name: "Full Cure", type: "heal", val: 999, icon: "🧪", desc: "Full HP." },
        { name: "Stim", type: "pe", val: 40, icon: "🧬", desc: "+40 PE." }
    ]
};

/**
 * Configuration for floors (Campaign).
 * Colors formatted as { floor, wall, fog, bg }.
 */
const $dataFloors = {
    default: { width: 30, height: 30, rooms: 12, enemies: 5, loot: 4, colors: { floor: 0x333333, wall: 0x222222, fog: 0x111111, bg: 0x000000 } },

    // BIOME 1: THEATER (1-5)
    1: {
        width: 20, height: 20, rooms: 8, enemies: 4, loot: 3,
        cutscene: 'intro',
        colors: { floor: 0x442222, wall: 0x221111, fog: 0x110505, bg: 0x110000 } // Red/Dark
    },
    5: {
        width: 25, height: 25, rooms: 10, enemies: 8, loot: 4,
        boss: 199, // Melissa
        colors: { floor: 0x442222, wall: 0x221111, fog: 0x110505, bg: 0x110000 }
    },

    // BIOME 2: PARK (6-10)
    6: {
        width: 35, height: 35, rooms: 15, enemies: 10, loot: 5,
        cutscene: 'biome2_start',
        colors: { floor: 0x224422, wall: 0x113311, fog: 0x051105, bg: 0x001100 } // Green/Nature
    },
    10: {
        width: 35, height: 35, rooms: 15, enemies: 12, loot: 6,
        boss: 299, // Worm
        colors: { floor: 0x224422, wall: 0x113311, fog: 0x051105, bg: 0x001100 }
    },

    // BIOME 3: HOSPITAL (11-15)
    11: {
        width: 40, height: 40, rooms: 18, enemies: 15, loot: 8,
        cutscene: 'biome3_start',
        colors: { floor: 0xcccccc, wall: 0xaaaaaa, fog: 0x888888, bg: 0xeeeeee } // White/Sterile
    },
    15: {
        width: 40, height: 40, rooms: 18, enemies: 18, loot: 8,
        boss: 399, // Sheeva
        colors: { floor: 0xcccccc, wall: 0xaaaaaa, fog: 0x888888, bg: 0xeeeeee }
    },

    // BIOME 4: MUSEUM (16-20)
    16: {
        width: 45, height: 45, rooms: 20, enemies: 20, loot: 10,
        cutscene: 'biome4_start',
        colors: { floor: 0x443322, wall: 0x332211, fog: 0x221105, bg: 0x110500 } // Brown/Ancient
    },
    20: {
        width: 50, height: 50, rooms: 22, enemies: 25, loot: 12,
        boss: 499, // Ultimate Being
        colors: { floor: 0x443322, wall: 0x332211, fog: 0x221105, bg: 0x110500 }
    }
};

/**
 * Data for cutscenes (Campaign Script).
 */
const $dataCutscenes = {
    'intro': [
        { type: 'wait', time: 1000 },
        { type: 'dialog', speaker: "NARRATOR", text: "Dec 24, 1997. Carnegie Hall.", color: "#aaa" },
        { type: 'dialog', speaker: "AYA", text: "The opera... everyone just... burst into flames.", color: "#ffffaa" },
        { type: 'dialog', speaker: "KYLE", text: "We need to clear the building. Stay close.", color: "#4488ff" },
        { type: 'log', text: "Mission: Pursuit." }
    ],
    'biome2_start': [
        { type: 'wait', time: 1000 },
        { type: 'dialog', speaker: "AYA", text: "Central Park. It's freezing.", color: "#ffffaa" },
        { type: 'dialog', speaker: "EVE", text: "The trees are alive. Can you feel them?", color: "#ff4444" },
        { type: 'log', text: "Sector: The Zoo." }
    ],
    'biome3_start': [
        { type: 'wait', time: 1000 },
        { type: 'dialog', speaker: "KYLE", text: "St. Francis Hospital. My precinct got a call from here.", color: "#4488ff" },
        { type: 'dialog', speaker: "AYA", text: "This is where it started. The experiments.", color: "#ffffaa" },
        { type: 'log', text: "Sector: Hospital." }
    ],
    'biome4_start': [
        { type: 'wait', time: 1000 },
        { type: 'dialog', speaker: "AYA", text: "The Museum. She's here.", color: "#ffffaa" },
        { type: 'dialog', speaker: "EVE", text: "Evolution is the only truth.", color: "#ff4444" },
        { type: 'log', text: "Sector: Museum." }
    ]
};
