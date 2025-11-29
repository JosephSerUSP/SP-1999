// ============================================================================
// [1] DATA
// ============================================================================
/**
 * Configuration for game colors.
 */
const CONFIG = { colors: { floor: 0x222222, wall: 0x111111, fog: 0x000000, bg: 0x000000 } };

const TRAIT_PARAM_PLUS = 1;
const TRAIT_PARAM_RATE = 2;
const TRAIT_RESTRICTION = 3;
const TRAIT_ATTACK_SKILL = 4;

const EFFECT_DAMAGE = 11;
const EFFECT_HEAL = 12;
const EFFECT_ADD_STATE = 21;
const EFFECT_RECOVER_PE = 31;
const EFFECT_SCAN_MAP = 41;

const PARAM_MHP = 0;
const PARAM_MPE = 1;
const PARAM_ATK = 2;
const PARAM_DEF = 3;

const $dataStates = {
    "barrier": { name: "Tetraja", duration: 4, icon: "🛡️", traits: [{ code: TRAIT_PARAM_PLUS, dataId: PARAM_DEF, value: 5 }] },
    "stun": { name: "Shock", duration: 2, icon: "⚡", traits: [{ code: TRAIT_RESTRICTION, dataId: 0, value: 0 }] },
    "poison": { name: "Poison", duration: 10, icon: "☠️", traits: [] },
    "charm": { name: "Charm", duration: 3, icon: "💕", traits: [{ code: TRAIT_RESTRICTION, dataId: 0, value: 0 }] } // Simplified charm as stun for now
};

const $dataSkills = {
    // Magic - Fire
    "agi": { name: "Agi", cost: 4, range: 4, type: "target", effects: [{code: EFFECT_DAMAGE, value: 1.5}], desc: (a) => `Small Fire. Est: ${Math.floor(a.atk * 1.5)}.` },
    "agilao": { name: "Agilao", cost: 8, range: 5, type: "target", effects: [{code: EFFECT_DAMAGE, value: 2.5}], desc: (a) => `Medium Fire. Est: ${Math.floor(a.atk * 2.5)}.` },
    "maragi": { name: "Maragi", cost: 12, range: 100, type: "all_enemies", effects: [{code: EFFECT_DAMAGE, value: 1.2}], desc: (a) => `AoE Fire. Est: ${Math.floor(a.atk * 1.2)}.` },

    // Magic - Ice
    "bufu": { name: "Bufu", cost: 4, range: 4, type: "target", effects: [{code: EFFECT_DAMAGE, value: 1.5}], desc: (a) => `Small Ice. Est: ${Math.floor(a.atk * 1.5)}.` },
    "bufula": { name: "Bufula", cost: 8, range: 5, type: "target", effects: [{code: EFFECT_DAMAGE, value: 2.5}], desc: (a) => `Medium Ice. Est: ${Math.floor(a.atk * 2.5)}.` },

    // Magic - Elec
    "zio": { name: "Zio", cost: 5, range: 4, type: "target", effects: [{code: EFFECT_DAMAGE, value: 1.4}, {code: EFFECT_ADD_STATE, dataId: 'stun', chance: 0.3}], desc: (a) => `Small Elec + Shock.` },
    "mzio": { name: "Mazio", cost: 15, range: 100, type: "all_enemies", effects: [{code: EFFECT_DAMAGE, value: 1.2}, {code: EFFECT_ADD_STATE, dataId: 'stun', chance: 0.2}], desc: (a) => `AoE Elec + Shock.` },

    // Magic - Force/Impact
    "zan": { name: "Zan", cost: 4, range: 4, type: "target", effects: [{code: EFFECT_DAMAGE, value: 1.5}], desc: (a) => `Small Force. Est: ${Math.floor(a.atk * 1.5)}.` },

    // Healing
    "dia": { name: "Dia", cost: 5, range: 0, type: "self", effects: [{code: EFFECT_HEAL, value: 50}], desc: () => "Heal 50 HP (Self)." },
    "media": { name: "Media", cost: 15, range: 0, type: "self", effects: [{code: EFFECT_HEAL, value: 40}], desc: () => "Heal 40 HP (Self)." }, // Engine doesn't support 'all_allies' easily yet, self for now.

    // Support
    "tarukaja": { name: "Tarukaja", cost: 12, range: 0, type: "self", effects: [{code: EFFECT_ADD_STATE, dataId: 'barrier'}], desc: () => "Buffs ATK (Simulated)." }, // Placeholder

    // Physical
    "lunge": { name: "Lunge", cost: 3, range: 1, type: "target", effects: [{code: EFFECT_DAMAGE, value: 1.2}], desc: (a) => `Light Phys.` },
    "gunshot": { name: "Shoot", cost: 0, range: 6, type: "line", effects: [{code: EFFECT_DAMAGE, value: 1.0}], desc: (a) => `Gun Attack.` },

    // Utility
    "scan": { name: "Mapper", cost: 2, range: 0, type: "self", effects: [{code: EFFECT_SCAN_MAP}], desc: () => "Map Intel." }
};

const $dataClasses = {
    "Hero": {
        job: "Human", hp: 60, atk: 5, def: 4, pe: 20, color: 0xaaaaaa, skills: ["gunshot", "scan"],
        banter: [
            { text: "Demon neutralized.", trigger: "kill", chance: 0.5 },
            { text: "Got it.", trigger: "loot", chance: 0.5 },
            { text: "Ugh...", trigger: "hurt", chance: 0.5 },
            { text: "Not here to die.", trigger: "low_hp", chance: 0.8 },
            { text: "Stronger.", trigger: "level_up", chance: 1.0 }
        ]
    },
    "Law": {
        job: "Messian", hp: 40, atk: 3, def: 3, pe: 60, color: 0x4444ff, skills: ["dia", "zan", "hama"],
        banter: [
            { text: "God's will.", trigger: "kill", chance: 0.6 },
            { text: "Impure.", trigger: "kill", chance: 0.4 },
            { text: "For the Order.", trigger: "walk", chance: 0.05 },
            { text: "Protect me!", trigger: "hurt", chance: 0.5 },
            { text: "I see the light...", trigger: "low_hp", chance: 0.8 }
        ]
    },
    "Chaos": {
        job: "Gaean", hp: 70, atk: 6, def: 2, pe: 30, color: 0xff4444, skills: ["agi", "lunge"],
        banter: [
            { text: "Weak.", trigger: "kill", chance: 0.6 },
            { text: "More blood.", trigger: "kill", chance: 0.4 },
            { text: "Boring.", trigger: "walk", chance: 0.05 },
            { text: "Heh, good hit.", trigger: "hurt", chance: 0.5 },
            { text: "Not... done...", trigger: "low_hp", chance: 0.8 }
        ]
    }
};

const $dataEnemies = [
    // Floor 1-5 (Kichijoji / Hospital)
    { id: 1, name: "Pixie", hp: 15, atk: 3, exp: 5, color: 0xffaaaa, scale: 0.4, ai: "hunter", race: "Fairy", skills: ["dia", "zio"], talk: { type: "friendly" } },
    { id: 2, name: "Kobold", hp: 20, atk: 5, exp: 8, color: 0x885544, scale: 0.5, ai: "patrol", race: "Jirae", skills: ["lunge"], talk: { type: "aggressive" } },
    { id: 3, name: "Cait Sith", hp: 25, atk: 6, exp: 12, color: 0xffffaa, scale: 0.5, ai: "hunter", race: "Beast", skills: ["agi"], talk: { type: "greedy" } },
    { id: 4, name: "Slime", hp: 30, atk: 4, exp: 6, color: 0x44ff44, scale: 0.6, ai: "patrol", race: "Slime", skills: ["lunge"], talk: { type: "dumb" } },

    // Floor 6-10 (Shinjuku)
    { id: 10, name: "Jack Frost", hp: 40, atk: 6, exp: 20, color: 0xaaccff, scale: 0.5, ai: "hunter", race: "Fairy", skills: ["bufu"], talk: { type: "friendly" } },
    { id: 11, name: "Pyro Jack", hp: 40, atk: 6, exp: 20, color: 0xffaa44, scale: 0.5, ai: "hunter", race: "Fairy", skills: ["agi"], talk: { type: "friendly" } },
    { id: 12, name: "Bodyconian", hp: 50, atk: 8, exp: 25, color: 0xff00ff, scale: 0.7, ai: "ambush", race: "Zombie", skills: ["lunge"], talk: { type: "seductive" } },

    // Floor 11-15 (Roppongi / Law)
    { id: 20, name: "Angel", hp: 60, atk: 8, exp: 35, color: 0xeeeeff, scale: 0.6, ai: "patrol", race: "Divine", skills: ["hama", "dia"], talk: { type: "law" } },
    { id: 21, name: "Power", hp: 90, atk: 12, exp: 50, color: 0xffffff, scale: 0.8, ai: "hunter", race: "Divine", skills: ["zan", "tarukaja"], talk: { type: "law" } },

    // Floor 16-20 (Cathedral / Chaos)
    { id: 30, name: "Girimehkala", hp: 150, atk: 20, exp: 100, color: 0x440044, scale: 1.0, ai: "hunter", race: "Jaki", skills: ["mzio", "lunge"], talk: { type: "chaos" } },
    { id: 31, name: "Surt", hp: 200, atk: 25, exp: 150, color: 0xff0000, scale: 1.2, ai: "hunter", race: "Tyrant", skills: ["maragi", "lunge"], talk: { type: "chaos" } }
];

const $dataLootTable = {
    prefixes: [ { name: "Rusty", atk: -1 }, { name: "Std", atk: 0 }, { name: "Blessed", atk: 2 }, { name: "Cursed", atk: 3 }, { name: "Ancient", atk: 5 } ],
    weapons: [
        { name: "Knife", baseAtk: 4, icon: "🗡️", desc: "Survival knife." },
        { name: "Pistol", baseAtk: 6, icon: "🔫", desc: "Handgun.", attackSkill: "gunshot" },
        { name: "Sword", baseAtk: 8, icon: "⚔️", desc: "Ceremonial sword." },
        { name: "Rifle", baseAtk: 10, icon: "︻", desc: "Assault rifle.", attackSkill: "gunshot" }
    ],
    armors: [
        { name: "Vest", baseDef: 3, icon: "🦺", desc: "Light armor." },
        { name: "Suit", baseDef: 6, icon: "🧥", desc: "Demonica suit." },
        { name: "Plate", baseDef: 10, icon: "🛡️", desc: "Heavy plating." }
    ],
    items: [
        { name: "Medicine", type: "heal", val: 50, icon: "💊", desc: "Heals 50 HP." },
        { name: "Life Stone", type: "heal", val: 30, icon: "💎", desc: "Heals 30 HP." },
        { name: "Chakra Drop", type: "pe", val: 20, icon: "💧", desc: "Restores 20 MP." },
        { name: "Bead", type: "heal", val: 200, icon: "📿", desc: "Full Heal." }
    ]
};

const $dataFloors = {
    1: { width: 25, height: 25, rooms: 10, enemies: 5, loot: 4, cutscene: 'intro', colors: { floor: 0x444455, wall: 0x222233, fog: 0x050510, bg: 0x000000 } },
    5: { width: 30, height: 30, rooms: 15, enemies: 10, loot: 6, colors: { floor: 0x553333, wall: 0x331111, fog: 0x100000, bg: 0x000000 } }, // Boss floor transition
    6: { width: 35, height: 35, rooms: 15, enemies: 12, loot: 8, colors: { floor: 0x333333, wall: 0x552222, fog: 0x201010, bg: 0x100000 } }, // Shinjuku
    11: { width: 40, height: 40, rooms: 20, enemies: 15, loot: 10, colors: { floor: 0x111144, wall: 0x000022, fog: 0x000020, bg: 0x000010 } }, // Roppongi
    16: { width: 50, height: 50, rooms: 25, enemies: 20, loot: 15, colors: { floor: 0x330000, wall: 0x220000, fog: 0x100000, bg: 0x050000 } }, // Cathedral
    default: { width: 30, height: 30, rooms: 15, enemies: 10, loot: 5 }
};

const $dataCutscenes = {
    'intro': [
        { type: 'wait', time: 500 },
        { type: 'dialog', text: "Kichijoji Hospital... Demons have appeared.", speaker: "HERO" },
        { type: 'dialog', text: "We need to find the terminal.", speaker: "LAW" },
        { type: 'dialog', text: "Whatever, let's just kill them.", speaker: "CHAOS" },
        { type: 'log', text: "SURVIVE." }
    ]
};
