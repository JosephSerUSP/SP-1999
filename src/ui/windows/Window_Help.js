// ============================================================================
// WINDOW: HELP
// ============================================================================

class Window_Help extends Window_Base {
    constructor() {
        super('help', { top: '2%', left: '2%', width: '40%', height: '60px', zIndex: '95' }, null);
        this.show();
        // Hide initially until text is set? Or just show empty.
        // Usually help window is always visible or only when menu is active.
        // User said "contextual Help window".
        // If I make it always visible, it looks like a permanent UI element.
        // Given the request "In the context of the Tactics menu, it should describe...",
        // implies it might be relevant mostly for tactics.
        // But making it a permanent part of the HUD is fine.

        // We'll keep it visible but maybe empty content.
        this.el.style.opacity = '0'; // Hidden by default
        this.el.style.transition = 'opacity 0.2s';
    }

    defineLayout() {
        return {
            type: 'container',
            layout: new FlexLayout({ alignItems: 'center', justifyContent: 'flex-start', padding: '0 10px', height: '100%' }),
            children: [
                {
                    component: Label,
                    props: { text: '', fontSize: '14px', color: '#ccc' } // Light gray text
                }
            ]
        };
    }

    refresh() {
        super.refresh();
        this.labelEl = this.contentEl.querySelector('.ui-label');
    }

    setText(text) {
        if (!this.labelEl) this.refresh();

        if (text) {
            this.labelEl.innerHTML = text;
            this.el.style.opacity = '1';
        } else {
            this.el.style.opacity = '0';
        }
    }
}
