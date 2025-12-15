// ============================================================================
// WINDOW: LOG
// ============================================================================

class Window_Log extends Window_Base {
    constructor(minimapWidth) {
        // Dynamic top position calculation based on minimap width
        // In original UIManager: top:`calc(2% + ${mmW + 8}px)`
        const top = `calc(2% + ${minimapWidth + 8}px)`;
        super('log', { top: top, right: '2%', width: '20%', bottom: '2%' }, "SYSTEM LOG");
        this.show();
    }

    defineLayout() {
        // Calculate max lines based on height
        // contentEl.clientHeight might be 0 if hidden or not attached?
        // But we are persistent.
        const h = this.contentEl ? this.contentEl.clientHeight : 0;
        const lineH = 16;
        const maxLines = Math.max(1, Math.floor(h / lineH) - 1);

        const history = $gameSystem.logHistory.slice(0, maxLines);

        const lines = history.map((t, i) => {
            return {
                component: Label,
                props: {
                    text: `> ${t}`,
                    style: {
                        opacity: 1 - i * 0.1,
                        marginBottom: '4px',
                        color: i === 0 ? 'var(--c-accent-main)' : undefined, // Highlight latest log
                        textShadow: i === 0 ? 'var(--text-glow)' : 'none'
                    }
                }
            };
        });

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 0 }),
            children: lines
        };
    }
}
