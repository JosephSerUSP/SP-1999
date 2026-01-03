// ============================================================================
// MANAGERS
// ============================================================================

/**
 * Manages item generation and logic.
 */
class ItemManager {
    /**
     * Generates a random piece of loot based on the current floor.
     * @static
     * @param {number} floor - The current floor level.
     * @returns {Game_Item|Game_Weapon|Game_Armor} The generated item instance.
     */
    static generateLoot(floor) {
        const roll = Math.random();
        if (roll < 0.4) {
            const item = $dataLootTable.items[Math.floor(Math.random() * $dataLootTable.items.length)];
            return new Game_Item(item);
        } else if (roll < 0.7) {
            const base = $dataLootTable.weapons[Math.floor(Math.random() * $dataLootTable.weapons.length)];
            const pre = $dataLootTable.prefixes[Math.min(Math.floor(Math.random() * (floor + 2)), $dataLootTable.prefixes.length-1)];
            return new Game_Weapon(base, pre);
        } else {
            const base = $dataLootTable.armors[Math.floor(Math.random() * $dataLootTable.armors.length)];
            return new Game_Armor(base);
        }
    }
}

/**
 * Manages cutscene playback and sequencing.
 */
class CutsceneManager {
    /**
     * Creates an instance of CutsceneManager.
     */
    constructor() {
        /**
         * The queue of cutscene commands.
         * @type {Array<Object>}
         */
        this.queue = [];
        /**
         * Whether a cutscene is currently active.
         * @type {boolean}
         */
        this.active = false;
        /**
         * The DOM element used to display cutscene dialogs.
         * @type {HTMLElement}
         */
        this.dialogEl = document.getElementById('cutscene-overlay');
    }

    /**
     * Starts playing a cutscene script.
     * @param {Array<Object>} script - The list of cutscene commands to execute.
     */
    play(script) {
        this.queue = [...script];
        this.active = true;
        $gameSystem.isInputBlocked = true;
        this.next();
    }

    /**
     * Advances to the next command in the cutscene queue.
     */
    next() {
        if(this.queue.length === 0) {
            this.end();
            return;
        }
        const cmd = this.queue.shift();
        this.processCommand(cmd);
    }

    /**
     * Processes a single cutscene command.
     * @param {Object} cmd - The command object.
     * @param {string} cmd.type - The type of command ('dialog', 'wait', 'log').
     * @param {string} [cmd.text] - The text content for dialog or logs.
     * @param {string} [cmd.speaker] - The speaker name for dialog.
     * @param {string} [cmd.color] - The color of the speaker name.
     * @param {number} [cmd.time] - Duration to wait in milliseconds.
     */
    processCommand(cmd) {
        switch(cmd.type) {
            case 'dialog':
                this.dialogEl.innerHTML = `
                    <div style="border-bottom:1px solid #444; margin-bottom:5px; padding-bottom:2px; font-weight:bold; color:${cmd.color || '#0ff'}">${cmd.speaker || 'SYSTEM'}</div>
                    <div style="font-size:14px; margin-bottom:10px;">${cmd.text}</div>
                    <div style="font-size:10px; color:#666;">[CLICK / PRESS OK TO CONTINUE]</div>
                `;
                this.dialogEl.style.display = 'block';

                let advanced = false;
                const advance = () => {
                    if (advanced) return;
                    advanced = true;
                    this.dialogEl.style.display = 'none';
                    document.removeEventListener('click', advance);
                    this.next();
                };

                // Allow mouse click
                setTimeout(() => document.addEventListener('click', advance), 100);

                // Allow keyboard Input (need to hook into update loop or just poll here?
                // Since this blocks input, SceneManager loop is still running but game map updates are blocked.
                // But SceneManager.loop calls InputManager.update().
                // We need a way to check input here.
                // We can't easily hook into the loop from here without a callback or polling interval.
                // Let's use a polling interval for this specific blocking state.
                const checkInput = setInterval(() => {
                    if (advanced) { clearInterval(checkInput); return; }
                    // We need to check InputManager state. InputManager updates in SceneManager loop.
                    if (InputManager.isTriggered('OK')) {
                        clearInterval(checkInput);
                        advance();
                    }
                }, 100);

                break;
            case 'wait':
                setTimeout(() => this.next(), cmd.time);
                break;
            case 'log':
                $gameSystem.log(cmd.text);
                this.next();
                break;
        }
    }

    /**
     * Ends the cutscene and restores control to the player.
     */
    end() {
        this.active = false;
        $gameSystem.isInputBlocked = false;
        $gameSystem.log("Command restored.");
    }
}

/**
 * Manages battle mechanics, damage calculation, and skill execution.
 */
class BattleManager {
    /**
     * Calculates damage between a source and a target.
     * @static
     * @param {Game_Battler} source - The attacker.
     * @param {Game_Battler} target - The defender.
     * @returns {number} The calculated damage amount (minimum 1).
     */
    static calcDamage(source, target) {
        const atk = source.getAtk ? source.getAtk() : source.atk;
        const def = target.getDef ? target.getDef() : (target.def || 0);
        const variation = 0.8 + Math.random() * 0.4;
        const dmg = Math.floor((atk * 2 - def) * variation);
        return Math.max(1, dmg);
    }

    /**
     * Applies a specific effect to a target.
     * @static
     * @async
     * @param {Object} effect - The effect definition object.
     * @param {number} effect.code - The effect code (e.g., EFFECT_DAMAGE).
     * @param {number} [effect.value] - The base value or multiplier for the effect.
     * @param {boolean} [effect.fixed] - Whether the damage value is fixed (true) or based on ATK (false).
     * @param {string} [effect.dataId] - The ID of data (e.g., state ID) associated with the effect.
     * @param {number} [effect.chance] - The probability (0.0-1.0) of the effect applying.
     * @param {Game_Battler} source - The source of the effect (user).
     * @param {Game_Battler} target - The target of the effect.
     * @returns {Promise<void>}
     */
    static async applyEffect(effect, source, target) {
        switch(effect.code) {
            case EFFECT_DAMAGE:
                const baseDmg = effect.fixed ? effect.value : Math.floor(source.getAtk() * effect.value);
                const dmg = Math.max(1, Math.floor(baseDmg * (0.8 + Math.random() * 0.4))); // Simple variation
                target.takeDamage(dmg);
                EventBus.emit('float_text', dmg, target.x, target.y, target.uid === 'player' ? "#f00" : "#fff");
                EventBus.emit('play_animation', 'hit', { uid: target.uid });

                // Trigger Enemy Info Update for "Affected by Ability"
                if (target.uid !== 'player') {
                     EventBus.emit('enemy_affected', { target: target, duration: 2000 });
                }

                if(target.hp <= 0 && target.uid !== 'player') await $gameMap.killEnemy(target);
                break;
            case EFFECT_HEAL:
                target.heal(effect.value);
                EventBus.emit('float_text', "+" + effect.value, target.x, target.y, "#0f0");
                break;
            case EFFECT_ADD_STATE:
                if(Math.random() < (effect.chance || 1.0)) {
                    target.addState(effect.dataId);
                    EventBus.emit('float_text', $dataStates[effect.dataId].name.toUpperCase(), target.x, target.y, "#ff0");
                    // Trigger Enemy Info Update for State Add
                    if (target.uid !== 'player') {
                        EventBus.emit('enemy_affected', { target: target, duration: 2000 });
                    }
                }
                break;
            case EFFECT_RECOVER_PE:
                if(target.pe !== undefined) {
                    target.pe = Math.min(target.mpe, target.pe + effect.value);
                    EventBus.emit('float_text', "+" + effect.value + "PE", target.x, target.y, "#0ff");
                }
                break;
            case EFFECT_SCAN_MAP:
                $gameMap.revealZone($gameMap.width/2, $gameMap.height/2, 100);
                $gameMap.scanActive = true;
                EventBus.emit('refresh_minimap');
                EventBus.emit('float_text', "SCAN", $gameMap.playerX, $gameMap.playerY, "#0ff");
                break;
        }
    }

    /**
     * Executes a skill by an actor or enemy.
     * @static
     * @async
     * @param {Game_Battler} a - The user (Actor or Enemy).
     * @param {string} k - The key/ID of the skill.
     * @param {Game_Battler} [target=null] - An optional specific target override.
     * @returns {Promise<boolean>} Resolves to true if skill was executed successfully, false otherwise.
     */
    static async executeSkill(a, k, target = null) {
        const s = $dataSkills[k];
        const isPlayer = a.uid === 'player' || a instanceof Game_Actor;

        // Cost Check (PE)
        // Enforce PE cost if the battler has the property.
        if(a.pe !== undefined && a.pe < s.cost) {
            if(isPlayer) $gameSystem.log("No PE.", 'warning');
            return false;
        }
        if(a.pe !== undefined) a.pe -= s.cost;

        $gameSystem.log(`${a.name} uses ${s.name}!`, 'combat');
        EventBus.emit('play_animation', 'flash', { color: a.color });
        await Sequencer.sleep(300);

        // Pre-calculation helper
        const runEffects = async (tgt) => {
            if (!tgt) return;
            // Visuals first (projectile) if needed
            // Only animate projectile if distance > 1
            const dist = Math.abs(a.x - tgt.x) + Math.abs(a.y - tgt.y);
            if (s.type !== 'self' && s.type !== 'all_enemies' && dist > 1) {
                EventBus.emit('play_animation', 'projectile', { x1: a.x, y1: a.y, x2: tgt.x, y2: tgt.y, color: a.color });
                await Sequencer.sleep(100);
            }

            for (let eff of s.effects) {
                const finalTarget = (eff.target === 'self') ? a : tgt;
                await BattleManager.applyEffect(eff, a, finalTarget);
            }
        };

        if (target) {
            // Direct target provided
            await runEffects(target);
        } else {
            // Resolve Targets based on Shape/Type
            let targets = [];

            if (s.type === 'self') {
                targets = [a];
            } else if (s.type === 'all_enemies') {
                // If player uses it: All Enemies.
                // If enemy uses it: All Players? (Only active player exists on map)
                // Let's assume 'all_enemies' contextually means "All Hostiles".
                if (isPlayer) {
                    targets = [...$gameMap.enemies];
                } else {
                    targets = [$gameParty.active()];
                }
            } else {
                // Geometric Targeting (Cone, Line, Circle, Target)
                // Use getTilesInShape
                const dir = a.direction || {x:0, y:1};
                const tiles = $gameMap.getTilesInShape(a.x, a.y, s.type, s.range, dir);

                // Find valid targets on these tiles
                if (isPlayer) {
                    // Player targets Enemies
                    targets = $gameMap.enemies.filter(e => tiles.some(t => t.x === e.x && t.y === e.y));
                } else {
                    // Enemy targets Player
                    // Currently only active player is on map
                    const p = $gameParty.active();
                    if (tiles.some(t => t.x === $gameMap.playerX && t.y === $gameMap.playerY)) {
                        targets = [p];
                    }
                }
            }

            // Apply Logic
            if (targets.length > 0) {
                 if (s.type === 'line' || s.type === 'target') {
                     // Sort by distance (Closest first)
                     targets.sort((t1, t2) => (Math.abs(t1.x - a.x) + Math.abs(t1.y - a.y)) - (Math.abs(t2.x - a.x) + Math.abs(t2.y - a.y)));

                     // Line Logic: Check for piercing. If not piercing, only hit the first target.
                     if (s.type === 'line' && !s.piercing) {
                         targets = [targets[0]];
                     }

                     // 'target' Logic: Usually implies single selection, so targets[0].
                     // If we are here, we might have multiple targets if 'target' shape returns a line (which it does in getTilesInShape).
                     if (s.type === 'target') {
                         targets = [targets[0]];
                     }

                     const count = s.count || 1;
                     // Apply effects to the determined target(s)
                     // Note: If piercing line, targets has multiple. If not, only one.
                     for(let t of targets) {
                         for(let i=0; i<count; i++) {
                             await runEffects(t);
                             await Sequencer.sleep(200);
                             if(t.isDead()) break;
                         }
                     }
                 } else {
                     // AOE (Cone, Circle, All Enemies) - Hit ALL
                     for(let t of targets) {
                         await runEffects(t);
                     }
                     if(targets.length > 2) EventBus.emit('play_animation', 'shake');
                 }
            } else {
                $gameSystem.log("Missed.", 'combat');
            }
        }

        await Sequencer.sleep(300);
        return true;
    }
}

/**
 * Manages the display of banter (floating text above the map).
 * Now rewritten with priority queue, cooldowns, and conversational chains.
 */
class BanterManager {
    /**
     * Creates an instance of BanterManager.
     */
    constructor() {
        /**
         * The queue of pending banter lines.
         * @type {Array<Object>}
         */
        this.queue = [];
        /**
         * The currently active banter line being displayed.
         * @type {Object|null}
         */
        this.activeLine = null;
        /**
         * The container element for banter.
         * @type {HTMLElement|null}
         */
        this.container = null;

        // Cooldown state
        this.cooldowns = {
            global: 0,
            triggers: {},
            actors: {}
        };

        // Constants
        this.GLOBAL_COOLDOWN = 180; // frames (~3 seconds)
        this.TRIGGER_COOLDOWN = 600; // frames (~10 seconds) for same trigger type
        this.ACTOR_COOLDOWN = 300; // frames (~5 seconds) for same actor
        this.DISPLAY_TIME = 180; // frames (~3 seconds) to read
    }

    /**
     * Initializes the banter manager.
     * @param {HTMLElement} container - The container element to append banter to.
     */
    init(container) {
        this.container = document.createElement('div');
        this.container.id = 'banter-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '58px';
        this.container.style.left = '10px';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '100';
        container.appendChild(this.container);
    }

    /**
     * Updates the state of active banter lines and processes the queue.
     */
    update() {
        // Decrease cooldowns
        if (this.cooldowns.global > 0) this.cooldowns.global--;
        for (let k in this.cooldowns.triggers) {
            if (this.cooldowns.triggers[k] > 0) this.cooldowns.triggers[k]--;
        }
        for (let k in this.cooldowns.actors) {
            if (this.cooldowns.actors[k] > 0) this.cooldowns.actors[k]--;
        }

        // Handle Active Line
        if (this.activeLine) {
            this.activeLine.timer--;

            // Animation out
            if (this.activeLine.timer < 30) {
                this.activeLine.opacity = this.activeLine.timer / 30;
                this.activeLine.element.style.opacity = this.activeLine.opacity;
                this.activeLine.element.style.transform = `translateY(-${(30 - this.activeLine.timer)}px)`;
            }

            if (this.activeLine.timer <= 0) {
                this.clearActive();
            }
        }
        // Process Queue if Idle
        else if (this.queue.length > 0) {
            // Sort by priority (high first) then entry time
            this.queue.sort((a, b) => b.priority - a.priority);

            const next = this.queue[0];

            // Check specific cooldowns (Global check is skipped for 'story' priority or replies)
            const isStory = next.priority >= 100;
            const isReply = !!next.isReply;

            if (isStory || isReply || (this.cooldowns.global <= 0 && this.canSpeak(next.speaker))) {
                this.queue.shift(); // Remove from queue
                this.show(next);
            } else {
                // If blocked by cooldown, we wait.
                // But if the queue gets too big, we should prune low priority stuff?
                if (this.queue.length > 5) {
                    // Remove lowest priority
                    this.queue.pop();
                }
            }
        }
    }

    /**
     * Checks if an actor can speak (cooldown check).
     */
    canSpeak(speaker) {
        return (this.cooldowns.actors[speaker] || 0) <= 0;
    }

    /**
     * Attempts to trigger banter based on an event type.
     * @param {string} type - The trigger type (e.g., 'kill', 'walk').
     * @param {Object} [context={}] - Additional context for condition checking.
     */
    trigger(type, context = {}) {
        // Block if cutscene active
        // Note: Logic does not currently support priority overrides for blocked input.
        if ($gameSystem.isInputBlocked) return;

        // Block if trigger cooldown is active to prevent spam
        if (this.cooldowns.triggers[type] > 0) return;

        // Collect all possible valid banter from all party members
        let candidates = [];

        $gameParty.members.forEach(actor => {
            if (actor.isDead()) return;
            const data = $dataClasses[actor.name];
            if (!data || !data.banter) return;

            const matches = data.banter.filter(b => b.trigger === type);
            matches.forEach(b => {
                const checkContext = Object.assign({ battler: actor, x: $gameMap.playerX, y: $gameMap.playerY }, context);

                // 1. Condition Check
                if (b.condition && !ConditionSystem.check(b.condition, checkContext)) return;

                // 2. Chance Check (Adjusted by queue depth? No, simple roll)
                if (Math.random() > (b.chance || 1.0)) return;

                candidates.push({
                    speaker: actor.name,
                    text: b.text,
                    priority: b.priority || 10,
                    reply: b.reply, // Array or Object
                    trigger: type
                });
            });
        });

        if (candidates.length === 0) return;

        // Pick one candidate
        // Weight by priority? Or just random among the valid ones?
        // Let's pick random among the highest priority tier found.
        candidates.sort((a, b) => b.priority - a.priority);
        const maxPrio = candidates[0].priority;
        const topCandidates = candidates.filter(c => c.priority === maxPrio);
        const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

        this.addBanter(selected);

        // Set Trigger Cooldown
        this.cooldowns.triggers[type] = this.TRIGGER_COOLDOWN;
    }

    /**
     * Adds a banter object to the queue.
     * @param {Object} banter
     */
    addBanter(banter) {
        this.queue.push(banter);
    }

    /**
     * Displays a banter line.
     * @param {Object} banter
     */
    show(banter) {
        if (!this.container) return;

        // Create Element
        const el = document.createElement('div');
        const actor = $gameParty.members.find(m => m.name === banter.speaker);
        const color = actor ? '#' + actor.color.toString(16) : '#fff';

        el.style.color = '#eee';
        el.style.padding = '4px 8px';
        el.style.marginBottom = '4px';
        // Improved styling: semi-transparent dark backing for readability without being a "box"
        el.style.background = 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)';
        el.style.textShadow = '1px 1px 0 #000';
        el.style.fontSize = '14px';
        el.style.fontFamily = "'Share Tech Mono', monospace";
        el.style.opacity = '0';
        el.style.transform = 'translateX(-10px)';
        el.style.transition = 'all 0.3s ease-out';
        el.style.borderLeft = `3px solid ${color}`;

        el.innerHTML = `<span style="color:${color}; font-weight:bold; margin-right:8px;">${banter.speaker}</span>${banter.text}`;

        this.container.appendChild(el);

        // Trigger reflow for transition
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
        });

        this.activeLine = {
            element: el,
            timer: this.DISPLAY_TIME,
            opacity: 1
        };

        // Set Cooldowns
        this.cooldowns.global = this.GLOBAL_COOLDOWN;
        this.cooldowns.actors[banter.speaker] = this.ACTOR_COOLDOWN;

        // Handle Replies / Chains
        if (banter.reply) {
            this.scheduleReply(banter.reply);
        }
    }

    /**
     * Schedules a reply banter.
     * @param {Object|Array} replyData
     */
    scheduleReply(replyData) {
        // Support array of possible replies? Or just one?
        // Let's assume it's a single object for now or array of options.
        let replyDef = Array.isArray(replyData) ? replyData[Math.floor(Math.random() * replyData.length)] : replyData;

        // Check if responder exists and is alive
        const responder = $gameParty.members.find(m => m.name === replyDef.speaker);
        if (!responder || responder.isDead()) return;

        // Create new banter object for queue
        const replyBanter = {
            speaker: replyDef.speaker,
            text: replyDef.text,
            priority: 100, // Replies are high priority to keep flow
            isReply: true,
            reply: replyDef.reply // Supports multi-chain
        };

        // Add to queue immediately?
        // We want a slight delay visually, but queue logic handles sequential display.
        // If we just push to queue with high priority, it will play next.
        this.queue.push(replyBanter);
    }

    clearActive() {
        if (this.activeLine && this.activeLine.element) {
            this.activeLine.element.remove();
        }
        this.activeLine = null;
    }
}
