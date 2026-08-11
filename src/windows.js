// ============================================================================
// WINDOWS (UI)
// ============================================================================

/**
 * Manages the game's UI windows, layout, and user interactions.
 * Uses the Component-Based architecture (src/ui/).
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
        EventBus.on('actor_stats_updated', () => this.refresh());
        EventBus.on('refresh_minimap', () => this.refreshMinimap());
    }

    createLayout() {
        // Persistent Windows
        this.windows.status = new Window_Party();
        this.windows.cmd = new Window_Tactics();
        this.windows.help = new Window_Help();
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
        if (this.windows.help) this.windows.help.refresh();
        if (this.windows.enemyInfo) this.windows.enemyInfo.update();
        this.refreshMinimap();

        if (this.focusedWindow) {
            this.collectFocusables();
            this.setFocus(this.focusIndex);
        }
    }

    updateInput() {
        if (!InputManager.isTriggered) return;

        // Update Minimap Toggle
        if (this.windows.minimap && this.windows.minimap.update) {
            this.windows.minimap.update();
        }

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
        const prev = this.focusedWindow;
        this.focusedWindow = winKey;
        if (winKey === 'cmd' || prev === 'cmd') {
            this.refreshCmd();
        }
        this.collectFocusables();
        this.setFocus(0);
    }

    blurWindow() {
        const prev = this.focusedWindow;
        this.focusedWindow = null;
        this.clearFocus();
        if (prev === 'cmd') {
            this.refreshCmd();
        }
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
            if (el.onmouseenter) {
                el.onmouseenter({ target: el, clientX: el.getBoundingClientRect().right, clientY: el.getBoundingClientRect().top });
            }
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

        // Determine Tile Size based on Mode
        // Mode 1 (Overlay) = Larger (e.g., 12px), Mode 0 (Corner) = 4px
        const mode = this.windows.minimap ? this.windows.minimap.mode : 0;
        const ts = (mode === 1) ? 12 : 4;

        // Set internal resolution based on map size
        c.width = $gameMap.width * ts;
        c.height = $gameMap.height * ts;

        // Force style sizing to ensure canvas has correct dimensions for scrolling
        c.style.width = c.width + "px";
        c.style.height = c.height + "px";

        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height); // Clear previous frame (transparency)

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
            if($gameMap.scanActive || dist < 8) {
                ctx.fillStyle = "#f00";
                ctx.shadowColor = "#f00"; ctx.shadowBlur = 4;
                ctx.fillRect(e.x*ts, e.y*ts, ts, ts);
                ctx.shadowBlur = 0;
            }
        });

        $gameMap.loot.forEach(i => {
            if ($gameMap.visited[i.x][i.y]) {
                ctx.fillStyle = "#ff0";
                ctx.fillRect(i.x * ts, i.y * ts, ts, ts);
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

    showInventoryModal() {
        $gameSystem.isInputBlocked = true;
        const w = new Window_Inventory();
        w.show();
        this.activeModal = w.el;

        const closeAndCleanup = () => {
             w.close();
             w.destroy();
             $gameSystem.isInputBlocked = false;
             this.closeModal();
        };
        w.closeCallback = closeAndCleanup;

        const closeBtn = document.createElement('span');
        closeBtn.id = 'modal-close';
        closeBtn.innerText = 'X';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '5px';
        closeBtn.style.top = '2px';
        closeBtn.onclick = () => {
             if (w.handleBack && w.handleBack()) return;
             closeAndCleanup();
        };
        w.headerEl.appendChild(closeBtn);

        this.collectFocusables();
        this.setFocus(0);
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

    showTooltip(e, html) {
        const el = document.getElementById('tooltip');
        el.innerHTML = html;
        el.style.display = 'block';
        el.style.left = (e.clientX + 10) + 'px';
        el.style.top = (e.clientY) + 'px';
    }

    hideTooltip() { document.getElementById('tooltip').style.display = 'none'; }

    showHelp(html) {
        if (this.windows.help) {
            this.windows.help.setText(html);
        }
    }

    clearHelp() {
        if (this.windows.help) {
            this.windows.help.setText('');
        }
    }

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
