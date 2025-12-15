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

        // Add decorative overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.border = '1px solid rgba(0, 240, 255, 0.3)';
        overlay.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.8)';
        // Crosshair
        overlay.innerHTML = `
            <div style="position:absolute; top:50%; left:50%; width:10px; height:10px; border:1px solid rgba(0,255,0,0.5); transform:translate(-50%, -50%); border-radius:50%"></div>
            <div style="position:absolute; top:0; left:50%; width:1px; height:100%; background:rgba(0,255,0,0.1)"></div>
            <div style="position:absolute; top:50%; left:0; width:100%; height:1px; background:rgba(0,255,0,0.1)"></div>
        `;
        this.el.querySelector('.pe-content').appendChild(overlay);
    }

    defineLayout() {
        // We need a canvas.
        // We can create a custom Component for the canvas.
        return {
            type: 'container',
            props: { style: { padding: '0', overflow: 'hidden', width: '100%', height: '100%', position: 'relative', background: '#000' } },
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
        cvs.style.width = '100%';
        cvs.style.height = '100%';
        cvs.style.opacity = '0.8';
        return cvs;
    }
}
