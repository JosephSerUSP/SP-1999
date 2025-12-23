// ============================================================================
// WINDOW: MINIMAP
// ============================================================================

class Window_Minimap extends Window_Base {
    constructor() {
        super('minimap', { top: '2%', right: '2%', width: '20%', height: '0', zIndex: '10' }, "MINIMAP");
        // Height is initialized to 0, will be updated in show/refresh
        this.show();
    }

    defineLayout() {
        // We need a canvas.
        // We can create a custom Component for the canvas.
        return {
            type: 'container',
            props: { style: { padding: '0', overflow: 'hidden', width: '100%', height: '100%' } },
            children: [
                {
                    component: MinimapCanvas
                }
            ]
        };
    }

    show() {
        super.show();
        // Force height to match width to keep it square
        if (this.el) {
            const width = this.el.clientWidth;
            if (width > 0) {
                this.el.style.height = width + 'px';
            }
        }
        // Force a refresh to ensure canvas is sized correctly if needed
        this.refresh();
    }
}

class MinimapCanvas extends UIComponent {
    create() {
        const cvs = document.createElement('canvas');
        cvs.id = 'minimap-canvas';
        cvs.width = 128;
        cvs.height = 128;
        cvs.style.width = '100%';
        cvs.style.height = '100%';
        return cvs;
    }
}
