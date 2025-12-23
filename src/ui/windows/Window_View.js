// ============================================================================
// WINDOW: VIEW
// ============================================================================

class Window_View extends Window_Base {
    constructor() {
        // Changed to full screen, no title (header will be skipped), zIndex 0
        super('view', {top:'0', left:'0', width:'100%', height:'100%', zIndex: '0'}, null);
        this.contentEl.id = 'game-view-container';

        // Styles needed for Renderer alignment and transparency
        this.contentEl.style.padding = '0';
        this.contentEl.style.background = 'transparent'; // Transparent to show black body/canvas if needed, but canvas usually covers it.
        this.contentEl.style.display = 'flex';
        this.contentEl.style.alignItems = 'center';
        this.contentEl.style.justifyContent = 'center';

        // Remove frame styles derived from .pe-window
        this.el.style.border = 'none';
        this.el.style.boxShadow = 'none';
        this.el.style.background = 'transparent';

        this.show();
    }

    defineLayout() {
        // Return null to prevent Window_Base from managing the content area.
        // The content area is managed by Renderer3D and BanterManager directly.
        return null;
    }
}
