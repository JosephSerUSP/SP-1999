// ============================================================================
// WINDOWS (UI)
// ============================================================================

/**
 * Manages the game's UI windows, layout, and user interactions.
 */
class UIManager {
    constructor() {
        this.windows = {};
        this.focusedWindow = null;
        this.focusIndex = 0;
        this.focusableElements = [];
        this.activeModal = null;
        this.initEvents();
        // Layout creation is deferred until SceneManager calls init?
        // No, SceneManager calls new UIManager(), which calls createLayout().
        this.createLayout();
    }

    initEvents() {
        EventBus.on('log_updated', () => this.refreshLog());
        EventBus.on('refresh_ui', () => this.refresh());
        EventBus.on('refresh_minimap', () => this.refreshMinimap());
        EventBus.on('float_text', (t,x,y,c) => this.floatText(t,x,y,c));
    }

    createLayout() {
        // Persistent Windows
        this.windows.status = new Window_Party();
        this.windows.cmd = new Window_Tactics();
        this.windows.minimap = new Window_Minimap();

        // Ensure minimap shell is sized before log creation?
        // Window_Minimap logic sets its own height on mount.
        // But Window_Log needs it for top calculation.
        // We can access el.clientWidth immediately after mount (which happens in constructor of Window_Base).
        const mmW = this.windows.minimap.el.clientWidth;

        this.windows.log = new Window_Log(mmW);

        // Viewport (Optical Feed)
        this.windows.view = new Window_View();

        // Enemy Info Overlay
        this.windows.enemyInfo = new Window_EnemyInfo();
    }

    refresh() {
        if (this.windows.status) this.windows.status.refresh();
        if (this.windows.cmd) this.windows.cmd.refresh();
        if (this.windows.log) this.windows.log.refresh();
        if (this.windows.enemyInfo) this.windows.enemyInfo.update();
        this.refreshMinimap();

        if (this.focusedWindow) {
            this.setFocus(this.focusIndex);
        }
    }

    updateInput() {
        if (!InputManager.isTriggered) return;

        if (InputManager.isTriggered('CANCEL')) {
            if (this.activeModal) {
                const closeBtn = this.activeModal.querySelector('#modal-close');
                if (closeBtn) closeBtn.click();
                else this.closeModal();
            } else if (this.focusedWindow) {
                const win = this.windows[this.focusedWindow];
                if (win && win.onCancel && win.onCancel()) {
                    // Handled by window
                } else {
                    this.blurWindow();
                }
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

        if (this.focusableElements.length > 0) {
            let nextIndex = this.focusIndex;
            if (InputManager.isTriggered('DOWN') || InputManager.isTriggered('RIGHT')) nextIndex++;
            if (InputManager.isTriggered('UP') || InputManager.isTriggered('LEFT')) nextIndex--;

            if (nextIndex < 0) nextIndex = this.focusableElements.length - 1;
            if (nextIndex >= this.focusableElements.length) nextIndex = 0;

            if (nextIndex !== this.focusIndex) {
                this.setFocus(nextIndex);
            }

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
            container = this.windows.cmd.contentEl; // Updated to contentEl
        } else if (this.focusedWindow === 'status') {
            container = this.windows.status.contentEl; // Updated to contentEl
        }

        if (container) {
            const candidates = container.querySelectorAll('.cmd-btn, .party-slot, .item-row');
            candidates.forEach(el => this.focusableElements.push(el));
        }
    }

    setFocus(index) {
        this.focusableElements.forEach(el => el.classList.remove('focused'));
        this.focusIndex = index;
        if (this.focusableElements[index]) {
            const el = this.focusableElements[index];
            el.classList.add('focused');
            el.scrollIntoView({ block: 'nearest' });
            if (el.onmouseenter) el.onmouseenter({ target: el, clientX: el.getBoundingClientRect().right, clientY: el.getBoundingClientRect().top });
        }
    }

    clearFocus() {
        this.focusableElements.forEach(el => {
            el.classList.remove('focused');
            if (el.onmouseleave) el.onmouseleave();
        });
        this.focusableElements = [];
    }

    refreshMinimap() {
        // Logic remains mostly manual for canvas drawing
        const c = document.getElementById('minimap-canvas');
        if(!c) return;

        // Logic matches original
        const ts = 4;
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

        // Scroll logic needs container
        const mm = this.windows.minimap.contentEl;
        const px = $gameMap.playerX * ts;
        const py = $gameMap.playerY * ts;
        mm.scrollTop = py - mm.clientHeight / 2;
        mm.scrollLeft = px - mm.clientWidth / 2;
    }

    refreshLog() {
        if (this.windows.log) this.windows.log.refresh();
    }

    refreshStatus() {
        if (this.windows.status) this.windows.status.refresh();
    }

    refreshCmd() {
        if (this.windows.cmd) this.windows.cmd.refresh();
    }

    floatText(text, x, y, color) {
        const pos = Renderer.projectToScreen(x, 0.5, y);
        // Add random jitter to prevent overlap when multiple hits occur
        const jitterX = (Math.random() - 0.5) * 40;
        const jitterY = (Math.random() - 0.5) * 20;

        const container = document.createElement('div');
        container.className = 'float-text-container';
        container.style.left = (pos.x + jitterX) + 'px';
        container.style.top = (pos.y + jitterY) + 'px';
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

    showInventoryModal() {
        $gameSystem.isInputBlocked = true;
        const w = new Window_Inventory();
        w.show();
        this.activeModal = w.el;

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
     * @deprecated Legacy imperative modal. Use Window_Target or similar component-based approach if available.
     */
    showTargetSelectModal(callback, itemPreview = null) {
        // Legacy imperative modal
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute'; overlay.style.top = '20%'; overlay.style.left = '30%'; overlay.style.width = '40%'; overlay.style.background = 'var(--pe-panel-bg)'; overlay.style.border = '1px solid #444'; overlay.style.zIndex = '150'; overlay.style.padding = '10px';

        const title = document.createElement('div');
        title.style.color = 'white'; title.style.textAlign = 'center'; title.style.marginBottom = '10px'; title.innerText = 'SELECT TARGET';
        overlay.appendChild(title);

        $gameParty.members.forEach(m => {
            const btn = document.createElement('div');
            btn.className = 'cmd-btn';

            // Safe Text Construction
            const nameSpan = document.createElement('span');
            nameSpan.innerText = m.name;
            btn.appendChild(nameSpan);

            if(itemPreview) {
                if(itemPreview.category === 'weapon') {
                    const currentAtk = m.getAtk(); const newAtk = m.getAtkWith(itemPreview); const diff = newAtk - currentAtk;
                    const diffSpan = document.createElement('span');
                    const color = diff > 0 ? '#0f0' : (diff < 0 ? '#f00' : '#888');
                    diffSpan.style.color = color;
                    diffSpan.innerText = newAtk;

                    btn.appendChild(document.createTextNode(` (ATK: ${currentAtk} -> `));
                    btn.appendChild(diffSpan);
                    btn.appendChild(document.createTextNode(`)`));
                } else if(itemPreview.category === 'armor') {
                    const currentDef = m.getDef(); const newDef = m.getDefWith(itemPreview); const diff = newDef - currentDef;
                    const diffSpan = document.createElement('span');
                    const color = diff > 0 ? '#0f0' : (diff < 0 ? '#f00' : '#888');
                    diffSpan.style.color = color;
                    diffSpan.innerText = newDef;

                    btn.appendChild(document.createTextNode(` (DEF: ${currentDef} -> `));
                    btn.appendChild(diffSpan);
                    btn.appendChild(document.createTextNode(`)`));
                }
            }

            btn.style.color = '#'+m.color.toString(16);
            btn.onclick = () => { callback(m); overlay.remove(); };
            overlay.appendChild(btn);
        });

        const cancel = document.createElement('div');
        cancel.innerText = "CANCEL"; cancel.style.color = "#888"; cancel.style.textAlign = "center"; cancel.style.cursor = "pointer"; cancel.style.fontSize = "10px";
        cancel.onclick = () => overlay.remove();
        overlay.appendChild(cancel);

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
     * @deprecated Legacy imperative modal. Use Window_Confirm or similar component-based approach if available.
     */
    showConfirmModal(text, onConfirm) {
        // Legacy imperative modal
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute'; overlay.style.top = '40%'; overlay.style.left = '35%'; overlay.style.width = '30%'; overlay.style.background = 'var(--pe-panel-bg)'; overlay.style.border = '1px solid #444'; overlay.style.zIndex = '160'; overlay.style.padding = '10px'; overlay.style.textAlign = 'center';

        const msg = document.createElement('div');
        msg.style.color = 'white'; msg.style.marginBottom = '10px'; msg.innerText = text;
        overlay.appendChild(msg);

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

    showStatusModal(a) {
        $gameSystem.isInputBlocked = true;

        const w = new Window_Status(a);
        w.show();
        this.activeModal = w.el;

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

    createModal(title, buildFn, closeCallback) {
        // Generic modal support (legacy)
        if(document.getElementById('temp-modal')) document.getElementById('temp-modal').remove();
        const m = document.createElement('div'); m.id='temp-modal'; m.className='pe-window';
        Object.assign(m.style, {left:'20%', top:'10%', width:'60%', height:'80%', zIndex:100});
        m.innerHTML = `<div class="pe-header" style="display:flex; justify-content:space-between;">${title}<span style="cursor:pointer" id="modal-close">X</span></div><div class="pe-content"></div>`;
        buildFn(m.querySelector('.pe-content'));
        document.getElementById('ui-root').appendChild(m);
        m.querySelector('#modal-close').onclick = () => { this.closeModal(); if(closeCallback) closeCallback(); };

        this.activeModal = m;
        this.collectFocusables();
        this.setFocus(0);
    }

    showTooltip(e, html) {
        const el = document.getElementById('tooltip');
        el.innerHTML = html;
        el.style.display = 'block';
        el.style.left = (e.clientX + 10) + 'px';
        el.style.top = (e.clientY) + 'px';
    }

    hideTooltip() { document.getElementById('tooltip').style.display = 'none'; }

    closeModal() {
        if(document.getElementById('temp-modal')) document.getElementById('temp-modal').remove();
        this.activeModal = null;
        this.clearFocus();
        if (this.focusedWindow) {
            this.collectFocusables();
            this.setFocus(this.focusIndex);
        }
    }
}
