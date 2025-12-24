// ============================================================================
// WINDOW: MINIMAP
// ============================================================================

class Window_Minimap extends Window_Base {
    constructor() {
        // Remove title ("MINIMAP" -> null) to avoid header creation
        // We will override styling in show/applyMode
        super('minimap', { top: '2%', right: '2%', width: '20%', height: '0', zIndex: '10' }, null);

        // State: 0 = Corner, 1 = Center/Overlay, 2 = Hidden
        this.mode = 0;

        // Force transparent background by removing the standard window class or overriding style
        if (this.el) {
            this.el.classList.remove('pe-window');
            // Ensure basic positioning/flex is still applied if pe-window did it
            // pe-window has: position: absolute; background: ...; border: ...; display: flex; flex-direction: column; padding: 2px; pointer-events: auto;
            // We want absolute, flex, column. We DON'T want background, border, shadow.
            this.el.style.position = 'absolute';
            this.el.style.display = 'flex';
            this.el.style.flexDirection = 'column';
            this.el.style.background = 'transparent';
            this.el.style.border = 'none';
            this.el.style.boxShadow = 'none';
            this.el.style.pointerEvents = 'none'; // Map shouldn't block clicks usually? Or maybe it should? "minimap window" -> usually informational.
            // If overlay covers screen, pointer-events: none is safer.
        }

        // Initialize display
        this.applyMode();
        this.show();
    }

    defineLayout() {
        // Ensure relative positioning for absolute child placement
        return {
            type: 'container',
            props: { style: { padding: '0', overflow: 'hidden', position: 'relative', width: '100%', height: '100%' } },
            children: [
                {
                    component: MinimapCanvas
                }
            ]
        };
    }

    update() {
        if (InputManager.isTriggered('MINIMAP')) {
            this.mode = (this.mode + 1) % 3;
            this.applyMode();
        }

        // Centering Logic
        if (this.visible && this.el && typeof $gameMap !== 'undefined' && this.contentEl) {
            // Find the root container created by defineLayout, which is the direct child of contentEl
            const mm = this.root.el;
            const c = mm ? mm.querySelector('canvas') : null;

            if (c) {
                const ts = (this.mode === 1) ? 12 : 4;
                const pX = $gameMap.playerX * ts + (ts / 2);
                const pY = $gameMap.playerY * ts + (ts / 2);

                const cW = parseFloat(c.style.width) || c.width;
                const cH = parseFloat(c.style.height) || c.height;
                const winW = mm.clientWidth;
                const winH = mm.clientHeight;

                c.style.position = 'absolute';
                c.style.margin = '0'; // clear margin logic

                let targetLeft = (winW / 2) - pX;
                let targetTop = (winH / 2) - pY;

                // Mode 0 (Corner): Clamp to bounds to prevent seeing empty space (unless map is smaller)
                if (this.mode === 0) {
                    if (cW <= winW) {
                        targetLeft = (winW - cW) / 2;
                    } else {
                        targetLeft = Math.max(winW - cW, Math.min(0, targetLeft));
                    }

                    if (cH <= winH) {
                        targetTop = (winH - cH) / 2;
                    } else {
                        targetTop = Math.max(winH - cH, Math.min(0, targetTop));
                    }
                }
                // Mode 1 (Overlay): Always center player (targetLeft/Top remain as calculated)

                c.style.left = Math.floor(targetLeft) + 'px';
                c.style.top = Math.floor(targetTop) + 'px';
            }
        }
    }

    applyMode() {
        if (!this.el) return;

        // Reset styles that might change
        this.el.style.transform = 'none';
        this.el.style.opacity = '1';
        this.el.style.left = 'auto';
        this.el.style.bottom = 'auto';
        this.el.style.right = 'auto';
        this.el.style.top = 'auto';

        if (this.mode === 0) {
            // CORNER
            this.el.style.display = 'flex';
            this.el.style.top = '2%';
            this.el.style.right = '2%';
            this.el.style.width = '20%';
            // Height will be set in refresh/show to match width
            this.refresh();
        } else if (this.mode === 1) {
            // CENTERED / DIABLO STYLE
            this.el.style.display = 'flex';
            this.el.style.top = '50%';
            this.el.style.left = '50%';
            this.el.style.width = '80%';
            this.el.style.height = '80%'; // Explicit height for overlay container
            this.el.style.transform = 'translate(-50%, -50%)';
            this.el.style.opacity = '0.2'; // 20% opacity
            this.refresh();
        } else {
            // HIDDEN
            this.el.style.display = 'none';
        }

        // Force refresh of minimap content to apply scale/scrolling
        if (this.mode !== 2 && $gameSystem && $gameSystem.ui) {
            $gameSystem.ui.refreshMinimap();
        }
    }

    show() {
        // Override Window_Base.show() to respect mode visibility
        if (this.mode !== 2) {
            this.el.style.display = 'flex';
            this.visible = true;
            this.refresh();
        }
    }

    refresh() {
        super.refresh();
        // Force height to match width to keep it square ONLY IN CORNER MODE
        if (this.el && this.mode === 0) {
            const width = this.el.clientWidth;
            if (width > 0) {
                this.el.style.height = width + 'px';
            }
        }
    }
}

class MinimapCanvas extends UIComponent {
    create() {
        const cvs = document.createElement('canvas');
        cvs.id = 'minimap-canvas';
        // Initial size
        cvs.width = 128;
        cvs.height = 128;
        // Style handled by UIManager.refreshMinimap now (explicit px size)
        return cvs;
    }
}
