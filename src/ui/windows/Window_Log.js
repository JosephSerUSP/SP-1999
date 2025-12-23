// ============================================================================
// WINDOW: LOG
// ============================================================================

class Window_Log extends Window_Base {
    constructor() {
        // Moved to Top Left
        // top: 2%, left: 2%
        super('log', { top: '2%', left: '2%', width: '20%', height: '30%', zIndex: '10' }, "SYSTEM LOG");
        this.show();
    }

    defineLayout() {
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
                        color: i === 0 ? '#fff' : undefined
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
