// ============================================================================
// WINDOW: VIEW
// ============================================================================

class Window_View extends Window_Base {
    constructor() {
        super('view', {top:'2%', left:'23%', width:'54%', height:'96%'}, "OPTICAL FEED");
        this.contentEl.id = 'game-view-container';
        // Styles needed for Renderer alignment
        this.contentEl.style.padding = '0';
        this.contentEl.style.background = '#000';
        this.contentEl.style.display = 'flex';
        this.contentEl.style.alignItems = 'center';
        this.contentEl.style.justifyContent = 'center';
        this.show();
    }

    defineLayout() {
        // Return null to prevent Window_Base from managing the content area.
        // The content area is managed by Renderer3D and BanterManager directly.
        return null;
    }
}
