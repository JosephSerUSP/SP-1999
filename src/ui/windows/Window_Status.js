// ============================================================================
// WINDOW: STATUS
// ============================================================================

class Window_Status extends Window_Base {
    /**
     * @param {Game_Actor} actor
     */
    constructor(actor) {
        super('status-modal', {
            left: '20%', top: '10%', width: '60%', height: '80%', zIndex: 100
        }, `STATUS: ${actor.name}`);
        this.actor = actor;
    }

    defineLayout() {
        const a = this.actor;
        const hpPct = (a.hp / a.mhp) * 100;
        const pePct = (a.pe / a.mpe) * 100;
        const expPct = (a.exp / a.nextExp) * 100;

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 15 }),
            children: [
                // Top Row: Portrait and Basic Stats
                {
                    type: 'container',
                    layout: new FlexLayout({ direction: 'row', gap: 20 }),
                    children: [
                        // Portrait Box
                        {
                            type: 'container',
                            props: {
                                style: {
                                    width: '80px', height: '80px',
                                    border: '1px solid var(--c-accent-main)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '40px', color: '#' + a.color.toString(16),
                                    background: 'rgba(0,0,0,0.5)',
                                    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                                }
                            },
                            children: [{ component: Label, props: { text: a.name[0] } }]
                        },
                        // Basic Info Column
                        {
                            type: 'container',
                            layout: new FlexLayout({ direction: 'column', gap: 6 }),
                            props: { flex: '1' },
                            children: [
                                { component: Label, props: { html: `<span class="stat-label">JOB CLASS:</span> <span class="stat-val" style="color:var(--c-accent-main)">${a.job.toUpperCase()}</span>` } },

                                // HP
                                {
                                    type: 'container',
                                    layout: new FlexLayout({ direction: 'column', gap: 2 }),
                                    children: [
                                        { component: Label, props: { html: `<span class="stat-label">HP</span> <span class="stat-val">${a.hp} / ${a.mhp}</span>` } },
                                        { component: Gauge, props: { percent: hpPct, color: 'var(--c-accent-ok)', height: '6px' } }
                                    ]
                                },
                                // PE
                                {
                                    type: 'container',
                                    layout: new FlexLayout({ direction: 'column', gap: 2 }),
                                    children: [
                                        { component: Label, props: { html: `<span class="stat-label">PE</span> <span class="stat-val">${a.pe} / ${a.mpe}</span>` } },
                                        { component: Gauge, props: { percent: pePct, color: 'var(--c-accent-warn)', height: '6px' } }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                { component: Separator },
                // Grid for other stats
                {
                    type: 'container',
                    layout: new GridLayout({ columns: '1fr 1fr', gap: 15 }),
                    children: [
                        this.createStatBox('ATTACK', a.getAtk()),
                        this.createStatBox('DEFENSE', a.getDef()),
                        this.createStatBox('LEVEL', a.level),
                        {
                            type: 'container',
                            layout: new FlexLayout({ direction: 'column', gap: 2 }),
                            children: [
                                { component: Label, props: { text: 'EXP', className: 'stat-label' } },
                                { component: Gauge, props: { percent: expPct, color: 'var(--c-text-sec)', height: '4px' } },
                                { component: Label, props: { text: `${a.exp} / ${a.nextExp}`, align: 'right', fontSize: '10px', color: '#666' } }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    createStatBox(label, value) {
        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'row', justify: 'space-between', align: 'center' }),
            props: {
                style: {
                    background: 'rgba(255,255,255,0.02)',
                    padding: '8px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }
            },
            children: [
                { component: Label, props: { text: label, className: 'stat-label' } },
                { component: Label, props: { text: value, color: 'white', fontSize: '14px', fontWeight: 'bold' } }
            ]
        };
    }
}
