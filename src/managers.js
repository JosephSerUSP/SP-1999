// ============================================================================
// MANAGERS
// ============================================================================

/**
 * Manages item generation and handling.
 */
class ItemManager {
    /**
     * Generates a random piece of loot based on the current floor.
     * @param {number} floor - The current floor level.
     * @returns {Game_Item|Game_Weapon|Game_Armor} The generated item.
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
 * Manages cutscene playback.
 */
class CutsceneManager {
    /**
     * Creates an instance of CutsceneManager.
     */
    constructor() {
        this.queue = [];
        this.active = false;
        this.dialogEl = document.getElementById('cutscene-overlay');
    }

    /**
     * Starts playing a cutscene script.
     * @param {Array<Object>} script - The list of cutscene commands.
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
     */
    processCommand(cmd) {
        switch(cmd.type) {
            case 'dialog':
                this.dialogEl.innerHTML = `
                    <div style="border-bottom:1px solid #444; margin-bottom:5px; padding-bottom:2px; font-weight:bold; color:${cmd.color || '#0ff'}">${cmd.speaker || 'SYSTEM'}</div>
                    <div style="font-size:14px; margin-bottom:10px;">${cmd.text}</div>
                    <div style="font-size:10px; color:#666;">[CLICK TO CONTINUE]</div>
                `;
                this.dialogEl.style.display = 'block';
                const clickHandler = () => {
                    this.dialogEl.style.display = 'none';
                    document.removeEventListener('click', clickHandler);
                    this.next();
                };
                setTimeout(() => document.addEventListener('click', clickHandler), 100);
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
     * Ends the cutscene and restores control.
     */
    end() {
        this.active = false;
        $gameSystem.isInputBlocked = false;
        $gameSystem.log("Command restored.");
    }
}

/**
 * Manages battle mechanics and skill execution.
 */
class BattleManager {
    /**
     * Calculates damage between a source and a target.
     * @param {Object} source - The attacker.
     * @param {Object} target - The defender.
     * @returns {number} The calculated damage.
     */
    static calcDamage(source, target) {
        let atk = source.getAtk ? source.getAtk() : source.atk;
        let def = target.getDef ? target.getDef() : (target.def || 0);
        const variation = 0.8 + Math.random() * 0.4;
        let dmg = Math.floor((atk * 2 - def) * variation);
        return Math.max(1, dmg);
    }

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
     * @param {Game_Actor} a - The actor using the skill.
     * @param {string} k - The key/ID of the skill.
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

class BanterManager {
    constructor() {
        this.activeLines = []; // { text, speaker, timer, element, xOffset }
        this.container = null;
    }

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

/**
 * Static class that manages the main game loop and initialization.
 */
class SceneManager {
    /**
     * Initializes the game.
     */
    static init() {
        $gameSystem = new Game_System(); $gameParty = new Game_Party(); $gameMap = new Game_Map();
        UI = new UIManager(); Renderer = new Renderer3D(); Cutscene = new CutsceneManager();
        $gameBanter = new BanterManager();
        Renderer.init(UI.windows.view.content); $gameMap.setup(1); UI.refresh();
        $gameBanter.init(UI.windows.view.content);
        $gameSystem.log("System initialized.");

        // INPUT POLLING
        this.keys = {};
        document.addEventListener('keydown', e => this.keys[e.key] = true);
        document.addEventListener('keyup', e => this.keys[e.key] = false);

        this.loop();
    }

    /**
     * Main game loop.
     */
    static loop() {
        requestAnimationFrame(() => this.loop());
        $gameBanter.update();
        // Input Logic
        if (!$gameSystem.isBusy && !$gameSystem.isInputBlocked && !Renderer.isAnimating) {
             if(this.keys["ArrowUp"]||this.keys["w"]) $gameMap.processTurn(0,-1);
             else if(this.keys["ArrowDown"]||this.keys["s"]) $gameMap.processTurn(0,1);
             else if(this.keys["ArrowLeft"]||this.keys["a"]) $gameMap.processTurn(-1,0);
             else if(this.keys["ArrowRight"]||this.keys["d"]) $gameMap.processTurn(1,0);
             else if(this.keys[" "]) $gameMap.processTurn(0,0);
             else if(this.keys["Enter"]) $gameMap.playerAttack();
        }
    }

    /**
     * Triggers game over state.
     */
    static gameOver() { alert("FAILURE."); location.reload(); }
}
