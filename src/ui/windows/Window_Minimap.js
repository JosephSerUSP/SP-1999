// ============================================================================
// WINDOW: MINIMAP
// ============================================================================

class Window_Minimap extends Window_Base {
    constructor() {
        super('minimap', { top: '2%', right: '2%', width: '20%', height: '0' }, "MINIMAP");
        // Height is set dynamically in UIManager usually.
        // We need to handle that here.
        this.show();
    }

    onMount() {
        super.onMount();
        // Set height to be square
        const width = this.el.clientWidth;
        this.el.style.height = width + 'px';

        // Re-run refresh to ensure canvas is sized?
        // Or handle canvas creation in defineLayout?
        // Canvas is special, it's not a standard component unless we wrap it.
    }

    defineLayout() {
        // We need a canvas.
        // We can create a custom Component for the canvas.
        return {
            type: 'container',
            props: { style: { padding: '0', overflow: 'auto', width: '100%', height: '100%' } },
            children: [
                {
                    component: MinimapCanvas
                }
            ]
        };
    }
}

class MinimapCanvas extends UIComponent {
    create() {
        const cvs = document.createElement('canvas');
        cvs.id = 'minimap-canvas';
        cvs.width = 128;
        cvs.height = 128;
        return cvs;
    }
}
