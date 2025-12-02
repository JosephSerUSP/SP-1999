// ============================================================================
// WINDOWS (UI)
// ============================================================================

/**
 * Represents a generic UI window with a header and content area.
 */
class UI_Window {
    /**
     * Creates a new UI Window.
     * @param {string} id - HTML ID for the window element.
     * @param {Object} rect - Style object defining position and size.
     * @param {string} [rect.top] - CSS top position.
     * @param {string} [rect.left] - CSS left position.
     * @param {string} [rect.right] - CSS right position.
     * @param {string} [rect.bottom] - CSS bottom position.
     * @param {string} [rect.width] - CSS width.
     * @param {string} [rect.height] - CSS height.
     * @param {string} [title] - Optional text title for the window header.
     */
    constructor(id, rect, title) {
        this.el = document.createElement('div');
        this.el.className = 'pe-window';
        Object.assign(this.el.style, rect);
        if(title) {
            const h = document.createElement('div');
            h.className = 'pe-header';
            h.innerText = title;
            this.el.appendChild(h);
        }
        this.content = document.createElement('div');
        this.content.className = 'pe-content';
        this.el.appendChild(this.content);
        document.getElementById('ui-root').appendChild(this.el);
    }

    /**
     * Clears all HTML content from the window's content area.
     */
    clear() { this.content.innerHTML = ''; }
}

/**
 * Manages the game's UI windows, layout, and user interactions.
 */
class UIManager {
    /**
     * Creates an instance of UIManager.
     */
    constructor() {
        /**
         * Map of active UI windows.
         * @type {Object.<string, UI_Window>}
         */
        this.windows = {};

        // Input / Focus Tracking
        this.focusedWindow = null; // 'status' or 'cmd' or null (map)
        this.focusIndex = 0;
        this.focusableElements = []; // Array of DOM elements
        this.activeModal = null; // Stores reference to active modal wrapper if any

        this.createLayout();
        this.initEvents();
    }

    /**
     * Initializes event listeners to update UI based on game events.
     */
    initEvents() {
        EventBus.on('log_updated', () => this.refreshLog());
        EventBus.on('refresh_ui', () => this.refresh());
        EventBus.on('refresh_minimap', () => this.refreshMinimap());
        EventBus.on('float_text', (t,x,y,c) => this.floatText(t,x,y,c));
    }

    /**
     * Creates the initial persistent UI layout (Status, Cmd, Minimap, Log, View).
     */
    createLayout() {
        this.windows.status = new UI_Window('status', {top:'2%', left:'2%', width:'20%', height:'50%'}, "SQUADRON");
        this.windows.cmd = new UI_Window('cmd', {bottom:'2%', left:'2%', width:'20%', height:'44%'}, "TACTICS");
        this.windows.minimap = new UI_Window('minimap', {top:'2%', right:'2%', width:'20%', height:'0'}, "MINIMAP");

        // Dynamically size minimap to be square based on width
        const mmW = this.windows.minimap.el.clientWidth;
        this.windows.minimap.el.style.height = mmW + 'px';

        const cvs = document.createElement('canvas');
        cvs.id = 'minimap-canvas';
        cvs.width = 128;
        cvs.height = 128;
        this.windows.minimap.content.appendChild(cvs);
        this.windows.minimap.content.style.padding = '0';
        this.windows.minimap.content.style.overflow = 'auto';

        this.windows.log = new UI_Window('log', {top:`calc(2% + ${mmW + 8}px)`, right:'2%', width:'20%', bottom:'2%'}, "SYSTEM LOG");
        this.windows.view = new UI_Window('view', {top:'2%', left:'23%', width:'54%', height:'96%'}, "OPTICAL FEED");
        this.windows.view.content.id = 'game-view-container';
        // Inline styles retained for specific layout logic not easily moved to generic CSS class without more refactoring
        this.windows.view.content.style.padding = '0';
        this.windows.view.content.style.background = '#000';
        this.windows.view.content.style.display = 'flex';
        this.windows.view.content.style.alignItems = 'center';
        this.windows.view.content.style.justifyContent = 'center';
    }

    /**
     * Refreshes all main UI components.
     */
    refresh() {
        this.refreshStatus();
        this.refreshCmd();
        this.refreshLog();
        this.refreshMinimap();

        // Restore focus visual if valid
        if (this.focusedWindow) {
            this.setFocus(this.focusIndex);
        }
    }

    /**
     * Update Loop for Input Handling when UI is focused.
     */
    updateInput() {
        if (!InputManager.isTriggered) return; // Safety check if method missing

        if (InputManager.isTriggered('CANCEL')) {
            if (this.activeModal) {
                // If modal has a cancel button or X, click it, or just close
                const closeBtn = this.activeModal.querySelector('#modal-close');
                if (closeBtn) closeBtn.click();
                else this.closeModal();
            } else if (this.focusedWindow) {
                this.blurWindow();
            }
            return;
        }

        if (InputManager.isTriggered('MENU')) {
            if (!this.activeModal) {
                if (!this.focusedWindow) {
                    this.focusWindow('cmd');
                } else if (this.focusedWindow === 'cmd') {
                    this.focusWindow('status');
                } else {
                    this.blurWindow();
                }
            }
            return;
        }

        // Navigation
        if (this.focusableElements.length > 0) {
            let nextIndex = this.focusIndex;
            if (InputManager.isTriggered('DOWN') || InputManager.isTriggered('RIGHT')) nextIndex++;
            if (InputManager.isTriggered('UP') || InputManager.isTriggered('LEFT')) nextIndex--;

            // Wrap
            if (nextIndex < 0) nextIndex = this.focusableElements.length - 1;
            if (nextIndex >= this.focusableElements.length) nextIndex = 0;

            if (nextIndex !== this.focusIndex) {
                this.setFocus(nextIndex);
            }

            // Action
            if (InputManager.isTriggered('OK')) {
                const el = this.focusableElements[this.focusIndex];
                if (el && !el.classList.contains('disabled')) el.click();
            }
        }
    }

    focusWindow(winKey) {
        this.focusedWindow = winKey;
        this.collectFocusables();
        this.setFocus(0);
    }

    blurWindow() {
        this.focusedWindow = null;
        this.clearFocus();
    }

    collectFocusables() {
        this.focusableElements = [];
        let container = null;

        if (this.activeModal) {
            container = this.activeModal;
        } else if (this.focusedWindow === 'cmd') {
            container = this.windows.cmd.content;
        } else if (this.focusedWindow === 'status') {
            container = this.windows.status.content;
        }

        if (container) {
            // Find all elements with known interactive classes
            // We use querySelectorAll and filter manually or add a common class 'ui-focusable'
            // Current interactive classes: 'cmd-btn', 'party-slot', 'item-row', and modals specific buttons
            // Let's grab them generally
            const candidates = container.querySelectorAll('.cmd-btn, .party-slot, .item-row');
            candidates.forEach(el => this.focusableElements.push(el));

            // Also grab custom modal buttons if not covered above
            // (e.g. YES/NO buttons in confirm modal are .cmd-btn, so they are covered)
            // Target selection list items are divs with click handlers but maybe no class?
            // See showTargetSelectModal -> they have no class but have style.cursor='pointer'.
            // Let's add a class to them in that method to make this easier.
        }
    }

    setFocus(index) {
        // Clear previous
        this.focusableElements.forEach(el => el.classList.remove('focused'));

        this.focusIndex = index;
        if (this.focusableElements[index]) {
            const el = this.focusableElements[index];
            el.classList.add('focused');
            el.scrollIntoView({ block: 'nearest' });

            // Trigger mouseenter logic for tooltips
            if (el.onmouseenter) el.onmouseenter({ clientX: el.getBoundingClientRect().right, clientY: el.getBoundingClientRect().top });
        }
    }

    clearFocus() {
        this.focusableElements.forEach(el => {
            el.classList.remove('focused');
            if (el.onmouseleave) el.onmouseleave();
        });
        this.focusableElements = [];
    }

    /**
     * Redraws the minimap on the canvas element.
     */
    refreshMinimap() {
        const c = document.getElementById('minimap-canvas');
        if(!c) return;
        const ts = 4; // Tile Size in pixels
        c.width = $gameMap.width * ts;
        c.height = $gameMap.height * ts;
        c.style.width = c.width + "px";
        c.style.height = c.height + "px";

        const ctx = c.getContext('2d');
        ctx.fillStyle = "#000"; ctx.fillRect(0,0,c.width,c.height);

        for(let x=0; x<$gameMap.width; x++) {
            for(let y=0; y<$gameMap.height; y++) {
                if(!$gameMap.visited || !$gameMap.visited[x] || !$gameMap.visited[x][y]) continue;
                const t = $gameMap.tiles[x][y];
                if(t === 1) continue;
                else if(t === 3) { ctx.fillStyle = "#0f0"; ctx.fillRect(x*ts, y*ts, ts, ts); }
                else { ctx.fillStyle = "#222"; ctx.fillRect(x*ts, y*ts, ts, ts); }
            }
        }
        $gameMap.enemies.forEach(e => {
            const dist = Math.abs(e.x - $gameMap.playerX) + Math.abs(e.y - $gameMap.playerY);
            if(dist < 8) {
                ctx.fillStyle = "#f00";
                ctx.shadowColor = "#f00"; ctx.shadowBlur = 4;
                ctx.fillRect(e.x*ts, e.y*ts, ts, ts);
                ctx.shadowBlur = 0;
            }
        });
        ctx.fillStyle = "#0ff"; ctx.fillRect($gameMap.playerX*ts, $gameMap.playerY*ts, ts, ts);

        // Auto scroll container to center on player
        const mm = this.windows.minimap.content;
        const px = $gameMap.playerX * ts;
        const py = $gameMap.playerY * ts;
        mm.scrollTop = py - mm.clientHeight / 2;
        mm.scrollLeft = px - mm.clientWidth / 2;
    }

    /**
     * Refreshes the squadron status window (HP, PE, EXP bars).
     */
    refreshStatus() {
        const w = this.windows.status; w.clear();
        $gameParty.members.forEach((m, i) => {
            const active = i === $gameParty.index;
            const div = document.createElement('div');
            div.className = `party-slot ${active ? 'active' : ''}`;
            div.onclick = () => { if(!$gameSystem.isBusy && !$gameSystem.isInputBlocked) this.showStatusModal(m); };

            const pct = (m.hp / m.mhp) * 100;
            const pePct = (m.pe / m.mpe) * 100;
            const expPct = (m.exp / m.nextExp) * 100;
            const clr = pct < 30 ? 'var(--pe-red)' : pct < 60 ? 'var(--pe-gold)' : 'var(--pe-green)';

            div.innerHTML = `<div style="color:#${m.color.toString(16)}; width:20px; font-weight:bold;">${m.name[0]}</div>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between;"><span>${m.name}</span><span style="color:${clr}">${m.hp}/${m.mhp}</span></div>
                    <div style="height:4px; bg:#333; margin-top:2px;"><div style="width:${pct}%; height:100%; background:${clr};"></div></div>
                    <div style="height:2px; bg:#222; margin-top:2px;"><div style="width:${pePct}%; height:100%; background:var(--pe-cyan);"></div></div>
                    <div style="height:1px; bg:#111; margin-top:2px; width:100%; display:flex;"><div style="width:${expPct}%; height:100%; background:#888;"></div></div>
                </div>`;
            w.content.appendChild(div);
        });
    }

    /**
     * Refreshes the command/tactics window.
     */
    refreshCmd() {
        const w = this.windows.cmd; w.clear();
        const actor = $gameParty.active();

        const createBtn = (label, sub, callback, disabled, skill) => {
            const b = document.createElement('div');
            b.className = `cmd-btn ${disabled?'disabled':''}`;
            b.innerHTML = `<span>${label}</span><span style="font-size:10px; color:#666;">${sub}</span>`;
            b.onclick = () => { if(!$gameSystem.isBusy && !$gameSystem.isInputBlocked && !disabled) callback(); };
            if(skill) {
                b.onmouseenter = (e) => { Renderer.showRange(skill); this.showTooltip(e, `<b>${skill.name}</b><br>${skill.desc(actor)}`); };
                b.onmouseleave = () => { Renderer.clearRange(); this.hideTooltip(); };
            }
            w.content.appendChild(b);
        };

        createBtn("WAIT", "", () => $gameMap.processTurn(0,0));
        createBtn("ITEM", "", () => this.showInventoryModal());
        w.content.appendChild(document.createElement('hr'));

        actor.skills.forEach(k => {
            const s = $dataSkills[k];
            createBtn(s.name, `${s.cost}PE`, () => {
                if(!$gameSystem.isBusy) $gameMap.processTurn(0,0,()=>BattleManager.executeSkill(actor, k));
                BattleManager.executeSkill(actor, k);
            }, actor.pe < s.cost, s);
        });
    }

    /**
     * Shows a floating tooltip at the mouse position.
     * @param {MouseEvent} e - The mouse event triggering the tooltip.
     * @param {string} html - The HTML content of the tooltip.
     */
    showTooltip(e, html) {
        const el = document.getElementById('tooltip');
        el.innerHTML = html;
        el.style.display = 'block';
        el.style.left = (e.clientX + 10) + 'px';
        el.style.top = (e.clientY) + 'px';
    }

    /**
     * Hides the global tooltip.
     */
    hideTooltip() { document.getElementById('tooltip').style.display = 'none'; }

    /**
     * Refreshes the system log window.
     */
    refreshLog() {
        const w = this.windows.log; w.clear();
        const h = w.content.clientHeight;
        const lineH = 16;
        const lines = Math.floor(h / lineH) - 1;
        $gameSystem.logHistory.slice(0,lines).forEach((t,i) => {
            const d = document.createElement('div'); d.innerText = `> ${t}`;
            d.style.opacity = 1 - i*0.1;
            d.style.marginBottom='4px';
            if(i===0) d.style.color='#fff';
            w.content.appendChild(d);
        });
    }

    /**
     * Displays floating text (damage numbers) at a specific screen location.
     * @param {string|number} text - The text to display.
     * @param {number} x - The map X coordinate.
     * @param {number} y - The map Y coordinate.
     * @param {string} color - The CSS color string.
     */
    floatText(text, x, y, color) {
        const pos = Renderer.projectToScreen(x, 0.5, y);
        const container = document.createElement('div');
        container.className = 'float-text-container';
        container.style.left = pos.x + 'px';
        container.style.top = pos.y + 'px';
        const chars = text.toString().split('');
        chars.forEach((char, i) => {
            const s = document.createElement('span');
            s.className = 'float-digit';
            s.style.animationDelay = (i * 30) + 'ms';
            s.style.color = color;
            s.innerText = char;
            container.appendChild(s);
        });
        document.getElementById('floating-text-layer').appendChild(container);
        setTimeout(()=>container.remove(), 1200);
    }

    /**
     * Shows the inventory modal window.
     */
    showInventoryModal() {
        $gameSystem.isInputBlocked = true;
        const w = new Window_Inventory();
        w.show();
        this.activeModal = w.el;

        // Add close logic
        const closeBtn = document.createElement('span');
        closeBtn.id = 'modal-close';
        closeBtn.innerText = 'X';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '5px';
        closeBtn.style.top = '2px';
        closeBtn.onclick = () => {
             w.close();
             w.destroy();
             this.closeModal(); // Clean up state
             $gameSystem.isInputBlocked = false;
        };
        w.headerEl.appendChild(closeBtn);

        this.collectFocusables();
        this.setFocus(0);

        // Override closeModal to also destroy this specific window
        const superClose = this.closeModal.bind(this);
        this.closeModal = () => {
            w.close();
            w.destroy();
            $gameSystem.isInputBlocked = false;
            superClose();
            // Restore original method
            this.closeModal = superClose;
        };
    }

    /**
     * Handles the logic for using a consumable item.
     * @param {Game_Actor} actor - The target actor.
     * @param {Game_Item} i - The item used.
     * @param {number} idx - The index of the item in inventory.
     */
    useConsumable(actor, i, idx) {
        if(i.type==='heal') { actor.heal(i.val); $gameSystem.log(`Healed ${actor.name} for ${i.val}.`); }
        if(i.type==='pe') { actor.pe = Math.min(actor.mpe, actor.pe+i.val); $gameSystem.log(`Restored PE for ${actor.name}.`); }
        if(i.type==='cure') {
            if(actor.isStateAffected('poison')) {
                actor.removeState('poison');
                $gameSystem.log(`${actor.name} is cured.`);
            } else {
                $gameSystem.log("No effect.");
            }
        }
        $gameParty.inventory.splice(idx, 1);
        this.closeModal();
        $gameSystem.isInputBlocked = false;
        this.refresh();
        $gameMap.processTurn(0,0);
    }

    /**
     * Handles the logic for equipping gear.
     * @param {Game_Actor} actor - The target actor.
     * @param {Game_Weapon|Game_Armor} i - The equipment item.
     * @param {number} idx - The index of the item in inventory.
     * @param {Function} callback - Function to call after equipping (to refresh UI).
     */
    equipGear(actor, i, idx, callback) {
        const type = i.category;
        const current = actor.equip[type];
        actor.equip[type] = i;
        $gameParty.inventory.splice(idx, 1);
        if(current) $gameParty.gainItem(current);
        $gameSystem.log(`${actor.name} equipped ${i.name}.`);
        callback();
    }

    /**
     * Shows a modal to select a target actor from the party.
     * @param {Function} callback - Function called with the selected Game_Actor.
     * @param {Object} [itemPreview] - Optional item to preview stat changes for.
     */
    showTargetSelectModal(callback, itemPreview = null) {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute'; overlay.style.top = '20%'; overlay.style.left = '30%'; overlay.style.width = '40%'; overlay.style.background = 'var(--pe-panel-bg)'; overlay.style.border = '1px solid #444'; overlay.style.zIndex = '150'; overlay.style.padding = '10px';
        overlay.innerHTML = "<div style='color:white; text-align:center; margin-bottom:10px;'>SELECT TARGET</div>";

        $gameParty.members.forEach(m => {
            const btn = document.createElement('div');
            btn.className = 'cmd-btn'; // Use cmd-btn for focus style
            let txt = m.name;
            if(itemPreview) {
                if(itemPreview.category === 'weapon') {
                    const currentAtk = m.getAtk(); const newAtk = m.getAtkWith(itemPreview); const diff = newAtk - currentAtk;
                    const color = diff > 0 ? '#0f0' : (diff < 0 ? '#f00' : '#888');
                    txt += ` (ATK: ${currentAtk} -> <span style='color:${color}'>${newAtk}</span>)`;
                } else if(itemPreview.category === 'armor') {
                    const currentDef = m.getDef(); const newDef = m.getDefWith(itemPreview); const diff = newDef - currentDef;
                    const color = diff > 0 ? '#0f0' : (diff < 0 ? '#f00' : '#888');
                    txt += ` (DEF: ${currentDef} -> <span style='color:${color}'>${newDef}</span>)`;
                }
            }
            btn.innerHTML = txt;
            btn.style.color = '#'+m.color.toString(16);
            btn.onclick = () => { callback(m); overlay.remove(); };
            overlay.appendChild(btn);
        });

        const cancel = document.createElement('div');
        cancel.innerText = "CANCEL"; cancel.style.color = "#888"; cancel.style.textAlign = "center"; cancel.style.cursor = "pointer"; cancel.style.fontSize = "10px";
        cancel.onclick = () => overlay.remove();
        overlay.appendChild(cancel);

        // This is a "nested" modal interaction.
        // We need to attach it to the DOM first
        document.getElementById('ui-root').appendChild(overlay);

        // Then override focus manually for this overlay
        // We'll treat it as a new "activeModal" temporarily
        const prevModal = this.activeModal;
        this.activeModal = overlay;
        this.collectFocusables();
        this.setFocus(0);

        // Clean up on removal (monkey patch the remove function or just rely on flow?)
        // The original logic just calls overlay.remove(). We need to restore focus to prevModal.
        const originalRemove = overlay.remove.bind(overlay);
        overlay.remove = () => {
            originalRemove();
            this.activeModal = prevModal;
            this.collectFocusables();
            this.setFocus(0); // Reset or remember index? 0 is fine for now.
        };
    }

    /**
     * Shows a generic confirmation modal (Yes/No).
     * @param {string} text - The prompt text.
     * @param {Function} onConfirm - Callback function if "Yes" is clicked.
     */
    showConfirmModal(text, onConfirm) {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute'; overlay.style.top = '40%'; overlay.style.left = '35%'; overlay.style.width = '30%'; overlay.style.background = 'var(--pe-panel-bg)'; overlay.style.border = '1px solid #444'; overlay.style.zIndex = '160'; overlay.style.padding = '10px'; overlay.style.textAlign = 'center';
        overlay.innerHTML = `<div style='color:white; margin-bottom:10px;'>${text}</div>`;

        const yes = document.createElement('button'); yes.innerText = "YES"; yes.className = "cmd-btn"; yes.style.display = "inline-block"; yes.style.width = "40%"; yes.style.marginRight = "10px";
        yes.onclick = () => { onConfirm(); overlay.remove(); };

        const no = document.createElement('button'); no.innerText = "NO"; no.className = "cmd-btn"; no.style.display = "inline-block"; no.style.width = "40%";
        no.onclick = () => overlay.remove();

        overlay.appendChild(yes); overlay.appendChild(no);
        document.getElementById('ui-root').appendChild(overlay);

        const prevModal = this.activeModal;
        this.activeModal = overlay;
        this.collectFocusables();
        this.setFocus(0);

        const originalRemove = overlay.remove.bind(overlay);
        overlay.remove = () => {
            originalRemove();
            this.activeModal = prevModal;
            this.collectFocusables();
            this.setFocus(0);
        };
    }

    /**
     * Shows a modal detailing an actor's status.
     * @param {Game_Actor} a - The actor to display.
     */
    showStatusModal(a) {
        $gameSystem.isInputBlocked = true;

        const w = new Window_Status(a);
        w.show();
        this.activeModal = w.el;

        // Add close logic
        const closeBtn = document.createElement('span');
        closeBtn.id = 'modal-close';
        closeBtn.innerText = 'X';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '5px';
        closeBtn.style.top = '2px';
        closeBtn.onclick = () => {
             w.close();
             w.destroy();
             this.closeModal();
             $gameSystem.isInputBlocked = false;
        };
        w.headerEl.appendChild(closeBtn);

        this.collectFocusables();
        // setFocus might fail if no buttons in status window, but we need it for ESC handling
        this.setFocus(0);

        const superClose = this.closeModal.bind(this);
        this.closeModal = () => {
            w.close();
            w.destroy();
            $gameSystem.isInputBlocked = false;
            superClose();
            this.closeModal = superClose;
        };
    }

    /**
     * Creates and displays a generic modal window.
     * @param {string} title - The title of the modal.
     * @param {Function} buildFn - Callback receiving the content element to populate it.
     * @param {Function} [closeCallback] - Optional callback when the modal is closed.
     */
    createModal(title, buildFn, closeCallback) {
        if(document.getElementById('temp-modal')) document.getElementById('temp-modal').remove();
        const m = document.createElement('div'); m.id='temp-modal'; m.className='pe-window';
        Object.assign(m.style, {left:'20%', top:'10%', width:'60%', height:'80%', zIndex:100});
        m.innerHTML = `<div class="pe-header" style="display:flex; justify-content:space-between;">${title}<span style="cursor:pointer" id="modal-close">X</span></div><div class="pe-content"></div>`;
        buildFn(m.querySelector('.pe-content'));
        document.getElementById('ui-root').appendChild(m);
        m.querySelector('#modal-close').onclick = () => { this.closeModal(); if(closeCallback) closeCallback(); };

        this.activeModal = m;
        // Wait for content to potentially load/render if async? No, synchronous.
        this.collectFocusables();
        // If no focusables (e.g. Status modal), we still trap focus to allow cancelling
        this.setFocus(0);
    }

    /**
     * Closes the active temporary modal.
     */
    closeModal() {
        if(document.getElementById('temp-modal')) document.getElementById('temp-modal').remove();
        this.activeModal = null;
        this.clearFocus();

        // Restore focus to previous window if any
        if (this.focusedWindow) {
            this.collectFocusables();
            this.setFocus(this.focusIndex);
        }
    }
}
