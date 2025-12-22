// ============================================================================
// GAME OBJECTS
// ============================================================================

/**
 * Manages global game state, such as floor level and logs.
 * Note: While historically a Manager in some engines, this acts as the central data object for the system state.
 */
class Game_System {
    /**
     * Creates an instance of Game_System.
     */
    constructor() {
        /**
         * The current floor level.
         * @type {number}
         */
        this.floor = 1;
        /**
         * History of game logs.
         * @type {Array<string>}
         */
        this.logHistory = [];
        /**
         * Indicates if the system is busy processing an action.
         * @type {boolean}
         */
        this.isBusy = false;
        /**
         * Indicates if player input is blocked.
         * @type {boolean}
         */
        this.isInputBlocked = false;
    }

    /**
     * Adds a message to the game log.
     * @param {string} text - The text to log.
     */
    log(text) {
        this.logHistory.unshift(text);
        if(this.logHistory.length > 15) this.logHistory.pop();
        EventBus.emit('log_updated');
    }
}

/**
 * Represents a base item in the game.
 */
class Game_BaseItem {
    /**
     * Creates a new Game_BaseItem.
     * @param {string} name - The name of the item.
     * @param {string} icon - The icon for the item.
     * @param {string} desc - The description of the item.
     * @param {string} category - The category of the item.
     */
    constructor(name, icon, desc, category) {
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.icon = icon;
        /** @type {string} */
        this.desc = desc;
        /** @type {string} */
        this.category = category;
    }
}

/**
 * Represents a generic consumable item.
 */
class Game_Item extends Game_BaseItem {
    /**
     * Creates a new Game_Item.
     * @param {Object} d - The data object for the item.
     * @param {string} d.name - The name of the item.
     * @param {string} d.type - The type of the item (e.g., 'heal').
     * @param {number} d.val - The value associated with the item (e.g., heal amount).
     * @param {string} [d.icon] - The icon for the item.
     * @param {string} [d.desc] - The description of the item.
     */
    constructor(d) {
        super(d.name, d.icon || "📦", d.desc || "", "item");
        /** @type {string} */
        this.type = d.type;
        /** @type {number} */
        this.val = d.val;
    }
}

/**
 * Represents base equipment in the game.
 */
class Game_Equipment extends Game_BaseItem {
    /**
     * Creates a new Game_Equipment.
     * @param {string} name - The name of the equipment.
     * @param {string} icon - The icon for the equipment.
     * @param {string} desc - The description of the equipment.
     * @param {string} category - The category ('weapon' or 'armor').
     */
    constructor(name, icon, desc, category) {
        super(name, icon, desc, category);
        /** @type {Array<Object>} */
        this.traits = [];
    }
}

/**
 * Represents a weapon.
 */
class Game_Weapon extends Game_Equipment {
    /**
     * Creates a new Game_Weapon.
     * @param {Object} b - The base weapon data.
     * @param {number} b.baseAtk - Base attack value.
     * @param {string} [b.icon] - Weapon icon.
     * @param {string} [b.desc] - Weapon description.
     * @param {string} [b.attackSkill] - ID of the skill used for basic attacks.
     * @param {Object} p - The prefix data modifying the weapon.
     * @param {string} p.name - Prefix name.
     * @param {number} [p.atk] - Attack modifier.
     * @param {number} [p.color] - Color override.
     */
    constructor(b, p) {
        super(`${p.name} ${b.name}`, b.icon || "⚔️", b.desc || "", "weapon");
        /** @type {number} */
        this.atk = b.baseAtk + (p.atk||0);
        /** @type {number} */
        this.color = p.color;
        this.traits.push({ code: TRAIT_PARAM_PLUS, dataId: PARAM_ATK, value: this.atk });
        if (b.attackSkill) this.traits.push({ code: TRAIT_ATTACK_SKILL, dataId: 0, value: b.attackSkill });
    }
}

/**
 * Represents armor.
 */
class Game_Armor extends Game_Equipment {
    /**
     * Creates a new Game_Armor.
     * @param {Object} b - The base armor data.
     * @param {string} b.name - Armor name.
     * @param {number} b.baseDef - Base defense value.
     * @param {string} [b.icon] - Armor icon.
     * @param {string} [b.desc] - Armor description.
     */
    constructor(b) {
        super(b.name, b.icon || "🛡️", b.desc || "", "armor");
        /** @type {number} */
        this.def = b.baseDef;
        this.traits.push({ code: TRAIT_PARAM_PLUS, dataId: PARAM_DEF, value: this.def });
    }
}

/**
 * Represents a base battler entity (Actor or Enemy).
 */
class Game_Battler {
    /**
     * Creates a new Game_Battler.
     */
    constructor() {
        /** @type {number} */
        this.hp = 0;
        /** @type {number} */
        this.mhp = 0;
        /** @type {number} */
        this.atk = 0;
        /** @type {number} */
        this.def = 0;
        /** @type {Array<Object>} */
        this.states = [];
        /** @type {Object} */
        this.equip = { weapon: null, armor: null };
    }

    /**
     * Checks if the battler is dead.
     * @returns {boolean} True if HP <= 0.
     */
    isDead() { return this.hp <= 0; }

    /**
     * Inflicts damage on the battler.
     * @param {number} v - The amount of damage.
     */
    takeDamage(v) {
        this.hp = Math.max(0, this.hp - v);
        if (this.uid === 'player' || this instanceof Game_Actor) {
            $gameBanter.trigger('hurt');
            if (this.hp < this.mhp * 0.3) {
                $gameBanter.trigger('low_hp');
            }
        }
    }

    /**
     * Gets the total Attack parameter.
     * @returns {number} The calculated ATK.
     */
    getAtk() {
        let base = this.atk;
        return Math.floor((base + this.paramPlus(PARAM_ATK)) * this.paramRate(PARAM_ATK));
    }

    /**
     * Gets the total Defense parameter.
     * @returns {number} The calculated DEF.
     */
    getDef() {
        let base = this.def;
        return Math.floor((base + this.paramPlus(PARAM_DEF)) * this.paramRate(PARAM_DEF));
    }

    /**
     * Collects all trait-bearing objects associated with this battler.
     * @returns {Array<Object>} List of objects containing traits (states, equipment).
     */
    traitObjects() {
        const objects = [...this.states];
        if (this.equip.weapon) objects.push(this.equip.weapon);
        if (this.equip.armor) objects.push(this.equip.armor);
        return objects;
    }

    /**
     * Calculates the additive modifier for a parameter.
     * @param {number} id - The parameter ID.
     * @returns {number} The total additive value.
     */
    paramPlus(id) {
        let context = { hp: this.hp, mhp: this.mhp, battler: this };
        if (this.uid === 'player' || this instanceof Game_Actor) {
            context.x = $gameMap.playerX;
            context.y = $gameMap.playerY;
        } else {
            context.x = this.x;
            context.y = this.y;
        }

        return this.traitObjects().reduce((r, obj) => {
            return r + (obj.traits || []).filter(t => t.code === TRAIT_PARAM_PLUS && t.dataId === id).reduce((a, t) => {
                 if (t.condition && !ConditionSystem.check(t.condition, context)) return a;
                 return a + t.value;
            }, 0);
        }, 0);
    }

    /**
     * Calculates the multiplicative modifier for a parameter.
     * @param {number} id - The parameter ID.
     * @returns {number} The total multiplier.
     */
    paramRate(id) {
        return this.traitObjects().reduce((r, obj) => {
            return r * (obj.traits || []).filter(t => t.code === TRAIT_PARAM_RATE && t.dataId === id).reduce((a, t) => a * t.value, 1);
        }, 1);
    }

    /**
     * Adds a state to the battler.
     * @param {string} id - The state ID.
     */
    addState(id) {
        if (this.isStateAffected(id)) {
            const s = this.states.find(s => s.id === id);
            s.duration = $dataStates[id].duration;
        } else {
            const s = Object.assign({id: id}, $dataStates[id]);
            this.states.push(s);
        }
    }

    /**
     * Removes a state from the battler.
     * @param {string} id - The state ID.
     */
    removeState(id) { this.states = this.states.filter(s => s.id !== id); }

    /**
     * Checks if the battler is affected by a state.
     * @param {string} id - The state ID.
     * @returns {boolean} True if the state is active.
     */
    isStateAffected(id) { return this.states.some(s => s.id === id); }

    /**
     * Checks if the battler is restricted (cannot act).
     * @returns {boolean} True if restricted.
     */
    isRestricted() { return this.states.some(s => s.traits.some(t => t.code === TRAIT_RESTRICTION)); }

    /**
     * Gets the custom attack skill ID if any.
     * @returns {string|null} The skill ID or null.
     */
    getAttackSkill() {
        const t = this.traitObjects().flatMap(o => o.traits || []).find(t => t.code === TRAIT_ATTACK_SKILL);
        return t ? t.value : null;
    }
}

/**
 * Represents an enemy in the game.
 */
class Game_Enemy extends Game_Battler {
    /**
     * Creates a new Game_Enemy.
     * @param {Object} d - The enemy data template.
     * @param {number} x - The x-coordinate on the map.
     * @param {number} y - The y-coordinate on the map.
     * @param {string|number} uid - Unique identifier for the enemy instance.
     * @param {number} hp - The hit points of the enemy.
     */
    constructor(d, x, y, uid, hp) {
        super();
        Object.assign(this, d);
        this.x = x;
        this.y = y;
        this.uid = uid;
        this.hp = hp;
        this.mhp = hp;
        this.alerted = false;
        // AI State
        // Deep clone aiConfig to allow per-instance state (like fleeThreshold logic) and prevent shared state mutation
        this.aiConfig = d.aiConfig ? JSON.parse(JSON.stringify(d.aiConfig)) : null;
        this.cooldowns = {}; // skillId -> turns remaining
        this.customState = {}; // For flags like 'rangedDisabled'
        this.turnCount = 0;
        this.direction = {x:0, y:1}; // Enemies need direction for cones
    }

    /**
     * Decides the best action to take.
     * @returns {Object} Action definition { type: 'move'|'skill', data: ... }
     */
    decideAction() {
        if (!this.aiConfig) {
             // Fallback for missing config (should not happen if data is correct, but safe)
             return { type: 'move', behavior: 'hunter' };
        }

        // Flee Check
        if (this.aiConfig.fleeThreshold && this.hp < this.mhp * this.aiConfig.fleeThreshold) {
             return { type: 'move', behavior: 'flee' };
        }

        // 1. Process Cooldowns (done in update, but checked here)
        // 2. Evaluate Actions
        const validActions = [];
        const distToPlayer = Math.abs(this.x - $gameMap.playerX) + Math.abs(this.y - $gameMap.playerY);

        for (const action of (this.aiConfig.actions || [])) {
            // Check Cooldown
            if (this.cooldowns[action.skill] > 0) continue;

            // Check Range (if specified in action, or derived from skill)
            // Ideally action defines condition range, skill defines effect range.
            if (action.condition) {
                if (action.condition.range) {
                    const min = action.condition.range[0];
                    const max = action.condition.range[1];
                    if (distToPlayer < min || distToPlayer > max) continue;
                }

                // Custom flag checks
                if (action.condition.state) {
                    const key = action.condition.state;
                    const val = action.condition.value;
                    // e.g. state: 'rangedMode', value: true
                    if (this.customState[key] !== val) continue;
                }

                // NOT state check (e.g. !rangedMode)
                if (action.condition.notState) {
                    if (this.customState[action.condition.notState]) continue;
                }

                // Turn interval check
                if (action.condition.interval) {
                    if (this.turnCount % action.condition.interval !== 0) continue;
                }
            }

            validActions.push(action);
        }

        // Sort by priority
        validActions.sort((a,b) => (b.priority || 0) - (a.priority || 0));

        if (validActions.length > 0) {
            return { type: 'skill', skillId: validActions[0].skill, config: validActions[0] };
        }

        // Default: Move
        return { type: 'move', behavior: this.aiConfig.movement || 'hunter' };
    }

    /**
     * Updates internal state after an action.
     */
    onActionTaken(action) {
        if (action.type === 'skill') {
            const conf = action.config;
            if (conf.cooldown) {
                this.cooldowns[conf.skill] = conf.cooldown;
            }

            // Apply self-state changes defined in AI config
            if (conf.onUse) {
                if (conf.onUse.setState) {
                    this.customState[conf.onUse.setState] = true;
                }
                if (conf.onUse.clearState) {
                    delete this.customState[conf.onUse.clearState];
                }
            }
        }
        this.turnCount++;
        // Tick cooldowns
        for(let k in this.cooldowns) {
            if(this.cooldowns[k] > 0) this.cooldowns[k]--;
        }
    }
}

/**
 * Represents a player character (actor).
 */
class Game_Actor extends Game_Battler {
    /**
     * Creates a new Game_Actor.
     * @param {string} name - The name of the character (must match a key in $dataClasses).
     */
    constructor(name) {
        super();
        const d = $dataClasses[name];
        Object.assign(this, d);
        this.name = name;
        this.mhp = d.hp;
        this.hp = this.mhp;
        this.mpe = 100;
        this.pe = d.pe;
        this.mstamina = 100;
        this.stamina = this.mstamina;
        this.isExhausted = false;
        // this.equip, this.states initialized in super
        this.level = 1;
        this.exp = 0;
        this.nextExp = 50;
        this.inventory = [];

        if(name === "Julia") this.equip.weapon = new Game_Weapon({name:"M84F", baseAtk:2, icon:"🔫"}, {name:"Std", atk:0});
        if(name === "Miguel") this.equip.armor = new Game_Armor({name:"Vest", baseDef:3, icon:"🦺"});
        this.uid = 'player';
        this.direction = {x:0, y:1};
    }

    /**
     * Heals the actor.
     * @param {number} v - Amount to heal.
     */
    heal(v) { this.hp = Math.min(this.mhp, this.hp + v); }

    /**
     * Regenerates PE (Power Energy).
     */
    regenPE() { this.pe = Math.min(this.mpe, this.pe + 2); }

    /**
     * Consumes stamina for an action.
     * @param {number} amount - The amount of stamina to consume.
     * @returns {boolean} True if the actor is exhausted after this action.
     */
    payStamina(amount) {
        if (amount <= 0) return false;

        this.stamina = Math.max(0, this.stamina - amount);

        if (this.stamina === 0 && !this.isExhausted) {
            this.isExhausted = true;
            $gameParty.checkExhaustionSwap();
        }

        // Trigger regen for other party members
        // Regenerate half of what was spent (so if spent 10, others get 5)
        const regenAmount = Math.floor(amount / 2);
        $gameParty.members.forEach(m => {
            if (m !== this && !m.isDead()) {
                m.gainStamina(regenAmount);
            }
        });

        return this.isExhausted;
    }

    /**
     * Gains stamina.
     * @param {number} amount
     */
    gainStamina(amount) {
        this.stamina = Math.min(this.mstamina, this.stamina + amount);
        if (this.isExhausted && this.stamina >= this.mstamina / 2) {
            this.isExhausted = false;
        }
    }

    /**
     * Adds experience points to the actor.
     * @param {number} v - Amount of EXP.
     */
    gainExp(v) {
        this.exp += v;
        if(this.exp >= this.nextExp) {
            this.level++; this.exp = 0; this.nextExp = Math.floor(this.nextExp*1.5); this.mhp+=5; this.hp=this.mhp; this.atk++;
            $gameSystem.log(`${this.name} Lv.${this.level}!`);
            $gameBanter.trigger('level_up');
        }
    }

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

/**
 * Manages the party of actors.
 */
class Game_Party {
    /**
     * Creates an instance of Game_Party.
     */
    constructor() {
        /** @type {Array<Game_Actor>} */
        this.members = [new Game_Actor("Julia"), new Game_Actor("Miguel"), new Game_Actor("Rebus")];
        /** @type {number} */
        this.index = 0;
        /** @type {Array<Game_Item|Game_Weapon|Game_Armor>} */
        this.inventory = [];
        /** @type {number} */
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
     * Updates the active index and handles events.
     * @param {number} newIndex - The new party index.
     * @param {boolean} [animate=true] - Whether to play the swap animation.
     */
    setIndex(newIndex, animate = true) {
        if (this.index === newIndex) return;
        this.index = newIndex;
        EventBus.emit('refresh_ui');

        if (animate) {
            EventBus.emit('play_animation', 'move_switch', {
                fromX: $gameMap.playerX, fromY: $gameMap.playerY,
                toX: $gameMap.playerX, toY: $gameMap.playerY,
                nextColor: this.active().color
            });
        }
    }

    /**
     * Rotates to the next living party member.
     * Note: Now only used for forced rotation on death. Manual rotation uses cycleActive.
     */
    rotate() {
        let s = 3;
        let newIdx = this.index;
        do {
            newIdx = (newIdx + 1) % 3;
            s--;
        } while(this.members[newIdx].isDead() && s > 0);

        if (this.members[newIdx].isDead()) {
             SceneManager.gameOver();
        } else {
             this.setIndex(newIdx, true);
        }
    }

    /**
     * Manually cycles the active party member.
     * @param {number} dir - Direction (1 for next, -1 for prev).
     */
    cycleActive(dir) {
        if (this.members.every(m => m.isDead())) return;

        const originalIndex = this.index;
        let newIdx = this.index;
        let s = 3;
        do {
            newIdx = (newIdx + dir + 3) % 3;
            s--;
        } while ((this.members[newIdx].isDead() || this.members[newIdx].isExhausted) && s > 0);

        if (newIdx !== originalIndex) {
            this.setIndex(newIdx, true);
        }
    }

    /**
     * Checks if the active member is exhausted and forces a swap if possible.
     */
    checkExhaustionSwap() {
        const active = this.active();
        if (!active.isExhausted) return;

        let offset = 1;
        while (offset < 3) {
            const nextIndex = (this.index + offset) % 3;
            const member = this.members[nextIndex];
            if (!member.isDead() && !member.isExhausted) {
                $gameSystem.log(`${active.name} exhausted! Swapping.`);
                this.setIndex(nextIndex, true);
                return;
            }
            offset++;
        }
        // If we get here, no one else is available. Stay on exhausted actor.
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
    gainItem(i) { if(this.inventory.length < this.maxInventory) { this.inventory.push(i); $gameSystem.log(`Got ${i.icon}${i.name}`); } else { $gameSystem.log("Inv Full!"); } }
}

/**
 * Manages the game map, level generation, and entity placement.
 */
class Game_Map {
    /**
     * Creates an instance of Game_Map.
     */
    constructor() {
        this.width = 20;
        this.height = 20;
        this.tiles = [];
        this.visited = [];
        this.enemies = [];
        this.loot = [];
        this.playerX = 1;
        this.playerY = 1;
        this.enemyIdCounter = 0;
    }

    /**
     * Sets up a new floor.
     * @param {number} floor - The floor level to generate.
     */
    setup(floor) {
        $gameSystem.floor = floor; $gameSystem.log(`>> SECTOR ${floor}`);
        this.generate(floor);
        // Trigger generic start banter after a short delay
        setTimeout(() => $gameBanter.trigger('start'), 1000);
    }

    /**
     * Generates the map using the configured generator.
     * @param {number} floor - The floor ID.
     */
    generate(floor) {
        const c = $dataFloors[floor] || $dataFloors.default;
        this.width = c.width;
        this.height = c.height;

        // Delegate to Generator
        const generatorType = c.generator || 'dungeon';
        const generator = $generatorRegistry.create(generatorType, this.width, this.height, c);
        const result = generator.generate();

        this.tiles = result.tiles;
        this.playerX = result.startPos.x;
        this.playerY = result.startPos.y;
        this.stairsX = result.endPos.x;
        this.stairsY = result.endPos.y;

        // Ensure stairs are marked
        if (this.isValid(this.stairsX, this.stairsY)) {
            this.tiles[this.stairsX][this.stairsY] = 3;
        }

        // Reset Visited
        this.visited = Array(this.width).fill(0).map(() => Array(this.height).fill(false));
        this.revealZone(this.playerX, this.playerY, 6);

        // Entities
        this.enemies = [];
        this.loot = [];
        this.enemyIdCounter = 0;

        for (let i = 0; i < c.enemies + floor; i++) {
            const pt = this.getRandomPoint();
            if (pt) this.enemies.push(new Game_Enemy($dataEnemies[Math.floor(Math.random() * $dataEnemies.length)], pt.x, pt.y, this.enemyIdCounter++, 10 + floor * 2));
        }
        for (let i = 0; i < c.loot; i++) {
            const pt = this.getRandomPoint();
            if (pt) this.loot.push({x: pt.x, y: pt.y, item: ItemManager.generateLoot(floor)});
        }

        EventBus.emit('map_setup');
        if(c.cutscene && typeof Cutscene !== 'undefined') {
            Cutscene.play($dataCutscenes[c.cutscene]);
        }
        EventBus.emit('refresh_minimap');
    }

    /**
     * Gets a random empty point on the map.
     * @returns {Object|null} An object with x and y coordinates, or null if failed.
     */
    getRandomPoint() {
        for(let i=0; i<200; i++) {
            const x = Math.floor(Math.random()*this.width), y = Math.floor(Math.random()*this.height);
            if(this.tiles[x][y] === 0 && (x!==this.playerX || y!==this.playerY) && (x!==this.stairsX || y!==this.stairsY)) return {x,y};
        }
        return null;
    }

    /**
     * Carves a tunnel between two points.
     * @param {number} x1 - Start x.
     * @param {number} y1 - Start y.
     * @param {number} x2 - End x.
     * @param {number} y2 - End y.
     */
    carveTunnel(x1,y1,x2,y2) {
        if(Math.random()<0.5) { this.hTunnel(x1,x2,y1); this.vTunnel(y1,y2,x2); } else { this.vTunnel(y1,y2,x1); this.hTunnel(x1,x2,y2); }
    }

    /**
     * Carves a horizontal tunnel.
     * @param {number} x1 - Start x.
     * @param {number} x2 - End x.
     * @param {number} y - Y coordinate.
     */
    hTunnel(x1,x2,y) { for(let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++) if(this.isValid(x,y)) this.tiles[x][y]=0; }

    /**
     * Carves a vertical tunnel.
     * @param {number} y1 - Start y.
     * @param {number} y2 - End y.
     * @param {number} x - X coordinate.
     */
    vTunnel(y1,y2,x) { for(let y=Math.min(y1,y2); y<=Math.max(y1,y2); y++) if(this.isValid(x,y)) this.tiles[x][y]=0; }

    /**
     * Checks if a coordinate is valid.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {boolean} True if valid.
     */
    isValid(x,y) { return x>=0 && x<this.width && y>=0 && y<this.height && this.tiles[x] !== undefined; }

    /**
     * Checks if there is a line of sight between two points.
     * @param {number} x0 - Start X.
     * @param {number} y0 - Start Y.
     * @param {number} x1 - End X.
     * @param {number} y1 - End Y.
     * @returns {boolean} True if clear.
     */
    checkLineOfSight(x0, y0, x1, y1) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            if (this.tiles[x0][y0] === 1) return false;
            if (x0 === x1 && y0 === y1) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
        return true;
    }

    /**
     * Reveals a zone on the minimap.
     * @param {number} cx - Center X.
     * @param {number} cy - Center Y.
     * @param {number} radius - Radius of the zone.
     */
    revealZone(cx, cy, radius) {
        const r2 = radius * radius;
        for(let x=cx-radius; x<=cx+radius; x++) {
            for(let y=cy-radius; y<=cy+radius; y++) {
                if(this.isValid(x, y) && ((x-cx)**2 + (y-cy)**2 <= r2)) {
                    this.visited[x][y] = true;
                }
            }
        }
    }

    /**
     * Gets valid tiles for a specific shape.
     * @param {number} ox - Origin X
     * @param {number} oy - Origin Y
     * @param {string} shape - Shape type (line, cone, circle, target)
     * @param {number} range - Range
     * @param {Object} dir - Direction vector
     * @returns {Array<{x:number, y:number}>}
     */
    getTilesInShape(ox, oy, shape, range, dir) {
        let tiles = [];
        if (shape === 'line' || shape === 'target') {
            // Target is treated as line for first-hit, but if AoE target, use Line?
            // "target" in data implies single target.
            // "line" implies penetrating line.
            // Using Geometry.getLine extended to range
            tiles = Geometry.getLine(ox, oy, ox + dir.x * range, oy + dir.y * range);
        } else if (shape === 'cone') {
            tiles = Geometry.getCone(ox, oy, dir, range);
        } else if (shape === 'circle') {
            tiles = Geometry.getCircle(ox, oy, range);
        } else {
            // Default adjacent
            tiles = [{x: ox + dir.x, y: oy + dir.y}];
        }

        // Filter valid and LOS
        // Note: For 'cone' and 'circle', do we respect LOS for every tile?
        // Usually, yes. Explosion shouldn't go through walls unless specified.
        return tiles.filter(t => {
            if (!this.isValid(t.x, t.y)) return false;
            if (this.tiles[t.x][t.y] === 1) return false; // Wall
            // LOS Check from Origin
            if (t.x === ox && t.y === oy) return true; // Self/Origin
            return this.checkLineOfSight(ox, oy, t.x, t.y);
        });
    }

    /**
     * Processes a game turn based on player movement.
     * @param {number} dx - Change in x.
     * @param {number} dy - Change in y.
     * @param {Function} [action] - Optional action to execute.
     */
    async processTurn(dx, dy) {
        if($gameSystem.isInputBlocked) return;

        // Check Renderer state for Seamless Movement Throttling
        if(Renderer && Renderer.isAnimating) return;

        // Player State Logic
        const actor = $gameParty.active();

        // Update Direction if moving
        if (dx !== 0 || dy !== 0) {
            $gameParty.members.forEach(m => m.direction = {x: dx, y: dy});
        }

        if(actor.isRestricted()) {
             $gameSystem.log(`${actor.name} is stunned!`);
             // Skip movement but process turn end for states
             await this.processTurnEnd(actor);
             await this.updateEnemies();
             return;
        }

        const nx = this.playerX + dx; const ny = this.playerY + dy;
        if(this.tiles[nx][ny] === 1) return;

        const enemy = this.enemies.find(e => e.x === nx && e.y === ny);

        if(enemy) {
             this.playerAttack();
        } else {
            // Consume Stamina for Move (10)
            actor.payStamina(10);

            // Check if we became restricted just now (Panting)
            // Even if we become panting, the current move is allowed.
            // The restriction applies to the NEXT turn.

            // Visual Move
            EventBus.emit('play_animation', 'move', { toX: nx, toY: ny });

            // Move
            this.playerX = nx; this.playerY = ny;
            this.revealZone(this.playerX, this.playerY, 6);

            const itemIdx = this.loot.findIndex(i => i.x === nx && i.y === ny);
            if(itemIdx > -1) {
                $gameParty.gainItem(this.loot[itemIdx].item);
                EventBus.emit('play_animation', 'itemGet', { x: nx, y: ny });
                this.loot.splice(itemIdx, 1);
                EventBus.emit('sync_loot');
                $gameBanter.trigger('loot');
            }

            if(this.tiles[nx][ny] === 3) {
                $gameSystem.log("Ascending...");
                EventBus.emit('play_animation', 'ascend');
                $gameSystem.isInputBlocked = true;
                // Wait slightly more for dramatic effect before logic switch
                await Sequencer.sleep(4000);
                $gameSystem.isInputBlocked = false;
                this.setup($gameSystem.floor + 1);
                return;
            }

            EventBus.emit('refresh_ui');
            await this.updateEnemies();
            await this.processTurnEnd(actor); // States update

            $gameBanter.trigger('walk', {x: this.playerX, y: this.playerY});
            $gameBanter.trigger('surrounded', {x: this.playerX, y: this.playerY});
        }
    }

    /**
     * Processes end-of-turn effects for an actor (e.g., DOT, buffs fading).
     * @param {Game_Actor} actor - The actor to update.
     */
    async processTurnEnd(actor) {
        // Update states
        for(let i = actor.states.length - 1; i >= 0; i--) {
            const s = actor.states[i];
            s.duration--;
            if(s.id === 'poison') {
                const dmg = Math.floor(actor.mhp * 0.05);
                actor.takeDamage(dmg);
                $gameSystem.log(`${actor.name} takes poison dmg!`);
                EventBus.emit('float_text', dmg, this.playerX, this.playerY, "#808");
                if(actor.isDead()) {
                     $gameSystem.log(`${actor.name} collapsed.`);
                }
            }
            if(s.duration <= 0) {
                actor.removeState(s.id);
                $gameSystem.log(`${actor.name}'s ${s.name} faded.`);
            }
        }

        // Force rotation if active actor is dead
        if($gameParty.active().isDead()) {
             $gameParty.rotate();
             EventBus.emit('refresh_ui');
        }
    }

    /**
     * Updates enemy positions and actions.
     */
    async updateEnemies() {
        for(const e of this.enemies) {
            // Enemy State Logic
            let restricted = false;
            for(let i = e.states.length - 1; i >= 0; i--) {
                const s = e.states[i];
                s.duration--;
                if(s.traits.some(t => t.code === TRAIT_RESTRICTION)) restricted = true;
                if(s.duration <= 0) e.removeState(s.id);
            }
            if(restricted) continue;

            const dist = Math.abs(e.x - this.playerX) + Math.abs(e.y - this.playerY);
            if(dist < 7) e.alerted = true;

            const alwaysActive = e.aiConfig && (e.aiConfig.movement === 'patrol' || e.aiConfig.alwaysActive);

            if(e.alerted || alwaysActive) {
                // Decide Action
                let action = e.decideAction();

                if (action.type === 'skill') {
                    // Execute Skill
                    // Need to set direction first if it matters?
                    // Usually direction points to player if attacking player.
                    let dx = Math.sign(this.playerX - e.x);
                    let dy = Math.sign(this.playerY - e.y);
                    if(dx !== 0 || dy !== 0) e.direction = {x: dx, y: dy};

                    await BattleManager.executeSkill(e, action.skillId, null); // Targets auto-resolved
                    e.onActionTaken(action);

                } else if (action.type === 'move') {
                    // Movement Logic
                    let dx = 0, dy = 0;
                    let behavior = action.behavior || 'hunter';

                    // LEGACY MOVEMENT MAPPING
                    if(behavior === "turret") {
                         // Still need to shoot if legacy turret
                         if (dist <= 5 && this.checkLineOfSight(e.x, e.y, this.playerX, this.playerY)) {
                            // Using standard calcDamage for legacy support
                            const target = $gameParty.active();
                            const dmg = Math.floor(BattleManager.calcDamage(e, target) * 0.8);
                            target.takeDamage(dmg);
                            EventBus.emit('play_animation', 'projectile', { x1: e.x, y1: e.y, x2: this.playerX, y2: this.playerY, color: e.color });
                            await Sequencer.sleep(100);
                            EventBus.emit('float_text', dmg, this.playerX, this.playerY, "#f00");
                            EventBus.emit('play_animation', 'hit', { uid: 'player' });
                        }
                        // Turrets don't move
                    } else if (behavior === "flee") {
                         dx = -Math.sign(this.playerX - e.x); dy = -Math.sign(this.playerY - e.y);
                         if(dx === 0 && dy === 0) { dx = Math.random()<0.5?1:-1; dy = Math.random()<0.5?1:-1; }
                    } else if(behavior === "patrol" && !e.alerted) {
                         if(Math.random() < 0.3) {
                             const dirs = [{x:0,y:1}, {x:0,y:-1}, {x:1,y:0}, {x:-1,y:0}];
                             const dir = dirs[Math.floor(Math.random()*dirs.length)];
                             dx = dir.x; dy = dir.y;
                         }
                    } else if(behavior === "hunter" || behavior === "ambush" || (behavior === "patrol" && e.alerted)) {
                        dx = Math.sign(this.playerX - e.x); dy = Math.sign(this.playerY - e.y);
                        if(Math.random() < 0.5 && dx !== 0) dy = 0; else if(dy !== 0) dx = 0;
                    }

                    // Execute Move
                    const nx = e.x + dx; const ny = e.y + dy;

                    // Update Direction
                    if(dx !== 0 || dy !== 0) e.direction = {x: dx, y: dy};

                    // Attack if adjacent (Melee) - ONLY if legacy behavior or standard move bump
                    // If AI was 'move', we assume it intends to close distance or melee if close.
                    if(nx === this.playerX && ny === this.playerY) {
                        if (behavior !== "flee") {
                            const target = $gameParty.active();
                            const dmg = BattleManager.calcDamage(e, target);
                            target.takeDamage(dmg);
                            EventBus.emit('play_animation', 'enemyLunge', { uid: e.uid, tx: nx, ty: ny });
                            EventBus.emit('float_text', dmg, this.playerX, this.playerY, "#f00");
                            EventBus.emit('play_animation', 'hit', { uid: 'player' });
                            e.onActionTaken({ type: 'melee_bump' }); // Tick counters
                        }
                    } else if(this.isValid(nx, ny) && this.tiles[nx][ny] === 0 && !this.enemies.find(en => en.x === nx && en.y === ny)) {
                        e.x = nx; e.y = ny;
                        EventBus.emit('sync_enemies');
                        e.onActionTaken({ type: 'move' });
                    }
                }
            }
        }
    }

    /**
     * Handles the death of an enemy.
     * @param {Game_Enemy} enemy - The enemy to kill.
     */
    async killEnemy(enemy) {
        EventBus.emit('play_animation', 'die', { uid: enemy.uid });
        await Sequencer.sleep(300);
        this.enemies = this.enemies.filter(e => e !== enemy);
        $gameParty.distributeExp(enemy.exp);
        $gameSystem.log(`${enemy.name} dissolved.`);
        EventBus.emit('sync_enemies');
        $gameBanter.trigger('kill', {x: this.playerX, y: this.playerY});
    }

    /**
     * Executes the player's attack action.
     */
    async playerAttack() {
        if ($gameSystem.isBusy || $gameSystem.isInputBlocked || (Renderer && Renderer.isAnimating)) return;
        $gameSystem.isBusy = true;
        const actor = $gameParty.active();

        if (actor.isRestricted()) {
            $gameSystem.log(`${actor.name} is stunned!`);
            EventBus.emit('refresh_ui');
            await this.updateEnemies();
            await this.processTurnEnd(actor);
            $gameSystem.isBusy = false;
            return;
        }

        // Determine skill
        const attackSkillId = actor.getAttackSkill();
        const skill = attackSkillId ? $dataSkills[attackSkillId] : null;

        let target = null;
        let skillIdToExec = attackSkillId;

        // STAMINA COST CHECK (Skill/Attack = 20)
        // Check if we can attack. If not enough stamina, we still attack but get exhausted.
        actor.payStamina(20);

        if (skill && (skill.type === 'self' || skill.type === 'all_enemies')) {
             // For self/all_enemies, we don't need to resolve a single target here.
             // BattleManager handles it.
             await BattleManager.executeSkill(actor, skillIdToExec, null);
             // Skip the rest of the targeting logic
             EventBus.emit('refresh_ui');
             await this.updateEnemies();
             $gameSystem.isBusy = false;
             await this.processTurnEnd(actor);
             return;
        }

        if (skill && skill.type === 'line') {
            const dx = actor.direction.x; const dy = actor.direction.y;
            for (let i=1; i<=skill.range; i++) {
                 const tx = this.playerX + dx * i; const ty = this.playerY + dy * i;
                 if (!this.isValid(tx, ty) || this.tiles[tx][ty] === 1) break;
                 const e = this.enemies.find(en => en.x === tx && en.y === ty);
                 if (e) { target = e; break; }
            }
            // Execute even if no target (miss)
        } else {
            // Default melee range 1 (or single target skill with range > 1 but not 'line')
            // Actually 'target' type skills are ranged single target.
            // But this block is "default melee range 1" IF no skill.
            // If skill is present and type is 'target', we should look up to skill range.
            const range = skill ? skill.range : 1;
            // For now, simpler logic: if it's a 'target' skill, we look for closest enemy in direction or just front?
            // Original logic was just front. Let's keep it simple for 'target' type: it acts like melee but extended range?
            // Or should it be directional like 'line' but stops at first? That's what 'line' does.
            // Let's assume 'target' means "Hit enemy at Cursor" but we don't have cursor.
            // So we'll treat it as directional line for now (stops at first target).

             const dx = actor.direction.x; const dy = actor.direction.y;
             // Check along the line up to range
             for (let i=1; i<=range; i++) {
                 const tx = this.playerX + dx * i; const ty = this.playerY + dy * i;
                 if (!this.isValid(tx, ty) || this.tiles[tx][ty] === 1) break;
                 const e = this.enemies.find(en => en.x === tx && en.y === ty);
                 if (e) { target = e; break; }
             }
        }

        if (skillIdToExec) {
            if (!target) {
                // MISS VISUAL
                $gameSystem.log(`${actor.name} attacks empty air.`);
                const dx = actor.direction.x; const dy = actor.direction.y;
                Renderer.playAnimation('projectile', { x1: this.playerX, y1: this.playerY, x2: this.playerX + dx*5, y2: this.playerY + dy*5, color: actor.color });
                await Sequencer.sleep(300);
            } else {
                await BattleManager.executeSkill(actor, skillIdToExec, target);
            }
        } else {
            // Basic Attack (No skill override)
            if (target && (Math.abs(target.x - this.playerX) + Math.abs(target.y - this.playerY) <= 1)) {
                const dmg = BattleManager.calcDamage(actor, target);
                target.takeDamage(dmg);
                EventBus.emit('play_animation', 'lunge', { tx: target.x, ty: target.y });
                await Sequencer.sleep(150);
                EventBus.emit('float_text', dmg, target.x, target.y, "#fff");
                EventBus.emit('play_animation', 'hit', { uid: target.uid });
                await Sequencer.sleep(200);
                $gameSystem.log(`Hit ${target.name} for ${dmg}.`);
                if(target.hp <= 0) await this.killEnemy(target);
            } else {
                $gameSystem.log(`${actor.name} swings at nothing.`);
                EventBus.emit('play_animation', 'lunge', { tx: this.playerX + actor.direction.x, ty: this.playerY + actor.direction.y });
                await Sequencer.sleep(300);
            }
        }

        EventBus.emit('refresh_ui');
        await this.updateEnemies();
        $gameSystem.isBusy = false;
        await this.processTurnEnd(actor);
    }
}
