// ============================================================================
// WINDOW: STATUS
// ============================================================================

class Window_Status extends Window_Base {
    /**
     * @param {Game_Actor} actor
     */
    constructor(actor) {
        // Modal centering logic
        // We can either set fixed rect or dynamic centering in CSS
        super('status-modal', {
            left: '20%', top: '10%', width: '60%', height: '80%', zIndex: 100
        }, `STATUS: ${actor.name}`);
        this.actor = actor;
    }

    defineLayout() {
        const a = this.actor;
        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 10 }),
            children: [
                // Top Row: Portrait and Basic Stats
                {
                    type: 'container',
                    layout: new FlexLayout({ direction: 'row', gap: 10 }),
                    children: [
                        // Portrait Box
                        {
                            type: 'container',
                            props: {
                                style: {
                                    width: '60px', height: '60px',
                                    border: '1px solid #444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '30px', color: '#' + a.color.toString(16)
                                }
                            },
                            children: [{ component: Label, props: { text: a.name[0] } }]
                        },
                        // Basic Info Column
                        {
                            type: 'container',
                            layout: new FlexLayout({ direction: 'column', gap: 2 }),
                            props: { flex: '1' },
                            children: [
                                { component: Label, props: { html: `<span class="stat-label">JOB:</span> <span class="stat-val">${a.job}</span>` } },
                                { component: Label, props: { html: `<span class="stat-label">HP:</span> <span class="stat-val" style="color:var(--pe-green)">${a.hp}/${a.mhp}</span>` } },
                                { component: Label, props: { html: `<span class="stat-label">PE:</span> <span class="stat-val" style="color:var(--pe-red)">${a.pe}/${a.mpe}</span>` } },
                            ]
                        }
                    ]
                },
                { component: Separator },
                // Grid for other stats
                {
                    type: 'container',
                    layout: new GridLayout({ columns: '1fr 1fr', gap: 5 }),
                    children: [
                        this.createStatBox('ATK', a.getAtk()),
                        this.createStatBox('DEF', a.getDef()),
                        this.createStatBox('EXP', `${a.exp}/${a.nextExp}`),
                        this.createStatBox('LVL', a.level),
                    ]
                }
            ]
        };
    }

    createStatBox(label, value) {
        return {
            type: 'container',
            children: [
                { component: Label, props: { text: label, className: 'stat-label' } },
                { component: Label, props: { text: value, color: 'white' } }
            ]
        };
    }
}
