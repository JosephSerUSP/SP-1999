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
        // Remove size constraints to allow content to overflow and be scrolled
        return {
            type: 'container',
            props: { style: { padding: '0', overflow: 'hidden' } },
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
            const ts = (this.mode === 1) ? 12 : 4;
            const pX = $gameMap.playerX * ts + (ts / 2);
            const pY = $gameMap.playerY * ts + (ts / 2);
            const centerX = this.contentEl.clientWidth / 2;
            const centerY = this.contentEl.clientHeight / 2;

            // Apply scroll to center the player
            this.contentEl.scrollLeft = pX - centerX;
            this.contentEl.scrollTop = pY - centerY;
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
        // Force height to match width to keep it square
        if (this.el && this.mode !== 2) {
            const width = this.el.clientWidth;
            if (width > 0) {
                this.el.style.height = width + 'px';
            }
            // Trigger redraw of canvas content via event or direct call?
            // UIManager calls refreshMinimap() on 'refresh_ui' or 'refresh_minimap'.
            // We should ensure the canvas is resized correctly.
            // UIManager.refreshMinimap() uses $gameMap.width * scale.
            // It modifies the canvas width/height attributes and style.
            // Wait, UIManager.refreshMinimap sets canvas width/height based on Map Grid Size * Scale (4px).
            // It ignores the container size!
            // The canvas style width is set to map size.
            // If we want the map to scale to the window (container), we need to change UIManager.refreshMinimap
            // OR change how the canvas is styled.

            // Current UIManager.refreshMinimap:
            // c.width = $gameMap.width * 4; ... c.style.width = c.width + "px";
            // This fixes the size. If the window is 20% of screen (~192px), and map is large, it might overflow or be cut off.
            // If the window is large (80%), the map might be too small.

            // We should modify the canvas style to fill the container (width: 100%; height: 100%)
            // and let the internal resolution be whatever matches the map or higher.
            // MinimapCanvas creates canvas with style.width = '100%'.
            // But UIManager.refreshMinimap overwrites c.style.width!

            // We need to fix UIManager.refreshMinimap as well, or modify it here.
            // But UIManager is in a different file.
            // However, I can override the behavior if I can.
            // Or I can emit an event to request refresh.
        }
        // Emit refresh event so UIManager redraws the content
        // But UIManager.refreshMinimap is what draws it.
        // I should probably fix UIManager.refreshMinimap to NOT set style.width/height if I want it to stretch.
        // OR I set the canvas internal size to match the container.

        // Let's defer UIManager changes to the next step if needed.
        // For now, let's just trigger the refresh.
        // EventBus.emit('refresh_minimap'); // This might cause infinite loop if called from refresh()?
        // No, refresh() is called by Window_Base logic.
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
