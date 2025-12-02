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
        let atk = source.getAtk ? source.getAtk() : source.atk;
        let def = target.getDef ? target.getDef() : (target.def || 0);
        const variation = 0.8 + Math.random() * 0.4;
        let dmg = Math.floor((atk * 2 - def) * variation);
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
                }
                break;
            case EFFECT_RECOVER_PE:
                // Assuming Game_Actor has pe
                if(target.pe !== undefined) {
                    target.pe = Math.min(target.mpe, target.pe + effect.value);
                    EventBus.emit('float_text', "+" + effect.value + "PE", target.x, target.y, "#0ff");
                }
                break;
            case EFFECT_SCAN_MAP:
                $gameMap.revealZone($gameMap.width/2, $gameMap.height/2, 100);
                EventBus.emit('refresh_minimap');
                EventBus.emit('float_text', "SCAN", $gameMap.playerX, $gameMap.playerY, "#0ff");
                break;
        }
    }

    /**
     * Executes a skill by an actor.
     * @static
     * @async
     * @param {Game_Actor} a - The actor using the skill.
     * @param {string} k - The key/ID of the skill.
     * @param {Game_Battler} [target=null] - An optional specific target override.
     * @returns {Promise<boolean>} Resolves to true if skill was executed successfully, false otherwise.
     */
    static async executeSkill(a, k, target = null) {
        const s = $dataSkills[k];
        if(a.pe < s.cost) { $gameSystem.log("No PE."); return false; }
        a.pe -= s.cost; $gameSystem.log(`${a.name} uses ${s.name}!`);
        EventBus.emit('play_animation', 'flash', { color: a.color });
        await Sequencer.sleep(300);

        // Pre-calculation helper
        const runEffects = async (tgt) => {
            if (!tgt) return;
            // Visuals first (projectile) if needed
            if (s.type !== 'self' && s.type !== 'all_enemies') {
                EventBus.emit('play_animation', 'projectile', { x1: $gameMap.playerX, y1: $gameMap.playerY, x2: tgt.x, y2: tgt.y, color: a.color });
                await Sequencer.sleep(100);
            }

            for (let eff of s.effects) {
                const finalTarget = (eff.target === 'self') ? a : tgt;
                await BattleManager.applyEffect(eff, a, finalTarget);
            }
        };

        if (target) {
            // Direct target provided (e.g. Bump attack override)
            await runEffects(target);
        } else {
            // Resolve Targets based on Type
            if (s.type === 'self') {
                await runEffects(a);
            } else if (s.type === 'all_enemies') {
                // All enemies
                // We use Promise.all to animate simultaneously or loop with delay?
                // Loop with slight delay looks better
                const targets = [...$gameMap.enemies]; // Copy list
                for(let e of targets) {
                    await runEffects(e);
                    await Sequencer.sleep(100);
                }
                EventBus.emit('play_animation', 'shake');
            } else {
                // Single target logic (Line or Range)
                // Filter enemies in range
                const targets = $gameMap.enemies.filter(e => Math.abs(e.x - $gameMap.playerX) + Math.abs(e.y - $gameMap.playerY) <= s.range);

                if (targets.length > 0) {
                    const count = s.count || 1;
                    for (let i = 0; i < count; i++) {
                        // For rapid fire, we might want random targets from the list
                        // For snipe, just the closest or first? Original logic was first.
                        const t = targets[Math.floor(Math.random() * targets.length)];
                        await runEffects(t);
                        await Sequencer.sleep(200);
                        if(targets.length === 0) break; // All dead?
                    }
                } else {
                    $gameSystem.log("No targets in range.");
                }
            }
        }

        await Sequencer.sleep(300);
        return true;
    }
}

/**
 * Manages the display of banter (floating text above the map).
 */
class BanterManager {
    /**
     * Creates an instance of BanterManager.
     */
    constructor() {
        /**
         * List of active banter lines currently displayed.
         * @type {Array<Object>}
         */
        this.activeLines = [];
        /**
         * The container element for banter.
         * @type {HTMLElement|null}
         */
        this.container = null;
    }

    /**
     * Initializes the banter manager.
     * @param {HTMLElement} container - The container element to append banter to.
     */
    init(container) {
        this.container = document.createElement('div');
        this.container.id = 'banter-container';
        this.container.style.position = 'absolute';
        this.container.style.top = '58px'; // Moved down by 48px from original 10px
        this.container.style.left = '10px';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '100';
        container.appendChild(this.container);
    }

    /**
     * Updates the state of active banter lines (timers, animations).
     */
    update() {
        if (!this.container) return;
        for (let i = this.activeLines.length - 1; i >= 0; i--) {
            const line = this.activeLines[i];
            line.timer--;

            // Fade and move left animation when expiring or pushed out
            if (line.timer < 30) {
                line.opacity = line.timer / 30;
                line.xOffset -= 1.0;
                line.element.style.opacity = line.opacity;
                line.element.style.transform = `translateX(${line.xOffset}px)`;
            }

            if (line.timer <= 0) {
                line.element.remove();
                this.activeLines.splice(i, 1);
            }
        }
    }

    /**
     * Attempts to trigger banter based on an event type.
     * @param {string} type - The trigger type (e.g., 'kill', 'walk').
     * @param {Object} [context={}] - Additional context for condition checking.
     */
    trigger(type, context = {}) {
        $gameParty.members.forEach(actor => {
            if (actor.isDead()) return;
            const data = $dataClasses[actor.name];
            if (!data || !data.banter) return;

            // Filter for trigger match
            const potential = data.banter.filter(b => b.trigger === type);
            potential.forEach(b => {
                if (Math.random() < b.chance) {
                    // Inject battler into context for conditions like HP check
                    const checkContext = Object.assign({ battler: actor, x: $gameMap.playerX, y: $gameMap.playerY }, context);
                    if (!b.condition || ConditionSystem.check(b.condition, checkContext)) {
                        this.addBanter(actor.name, b.text);
                    }
                }
            });
        });
    }

    /**
     * Adds a specific banter line to the display.
     * @param {string} speaker - The name of the speaker.
     * @param {string} text - The banter text.
     */
    addBanter(speaker, text) {
        // If too many lines, force expire oldest by setting timer low
        if (this.activeLines.length >= 5) {
            this.activeLines[0].timer = Math.min(this.activeLines[0].timer, 30);
        }

        const el = document.createElement('div');
        // Removed background color as requested
        el.style.color = 'white';
        el.style.padding = '2px 4px';
        el.style.marginBottom = '2px';
        // Kept border for readability, or should I remove it too?
        // Request said "remove the darkened background". I'll keep the gold accent for speaker ID.
        // But visual style might need shadow if no background.
        el.style.textShadow = '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000';
        el.style.fontSize = '12px';
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.2s';

        const actor = $gameParty.members.find(m => m.name === speaker);
        const color = actor ? '#' + actor.color.toString(16) : '#fff';

        el.innerHTML = `<span style="color:${color}; font-weight:bold; margin-right:5px;">${speaker}</span> ${text}`;

        this.container.appendChild(el);
        requestAnimationFrame(() => el.style.opacity = '1');

        this.activeLines.push({ text, speaker, timer: 120, element: el, opacity: 1, xOffset: 0 });
    }
}
