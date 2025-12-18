// ============================================================================
// WINDOW: PARTY
// ============================================================================

class Window_Party extends Window_Base {
    constructor() {
        super('status', {top:'2%', left:'2%', width:'20%', height:'50%'}, "SQUADRON");
        this.show(); // Always visible
    }

    defineLayout() {
        const members = $gameParty.members.map((m, i) => {
            const active = i === $gameParty.index;
            const pct = (m.hp / m.mhp) * 100;
            const pePct = (m.pe / m.mpe) * 100;
            const expPct = (m.exp / m.nextExp) * 100;
            const staPct = (m.stamina / m.mstamina) * 100;
            const clr = pct < 30 ? 'var(--pe-red)' : pct < 60 ? 'var(--pe-gold)' : 'var(--pe-green)';

            // Stamina Color
            // White/Teal usually, Red if exhausted
            const staColor = m.isExhausted ? 'var(--pe-red)' : '#ccffff';

            return {
                type: 'container',
                props: {
                    className: `party-slot ${active ? 'active' : ''}`,
                    onClick: () => {
                        if (!$gameSystem.isBusy && !$gameSystem.isInputBlocked) {
                            $gameSystem.ui.showStatusModal(m);
                        }
                    }
                },
                layout: new FlexLayout({ direction: 'row', gap: 4 }),
                children: [
                    // Icon / Initial
                    {
                        component: Label,
                        props: {
                            text: m.name[0],
                            style: { color: '#' + m.color.toString(16), width: '20px', fontWeight: 'bold' }
                        }
                    },
                    // Bars Container
                    {
                        type: 'container',
                        props: { flex: '1' },
                        layout: new FlexLayout({ direction: 'column', gap: 2 }),
                        children: [
                            // Name & HP Text
                            {
                                type: 'container',
                                layout: new FlexLayout({ direction: 'row', justify: 'space-between' }),
                                children: [
                                    { component: Label, props: { text: m.name } },
                                    { component: Label, props: { text: `${m.hp}/${m.mhp}`, color: clr } }
                                ]
                            },
                            // HP Bar
                            { component: Gauge, props: { percent: pct, color: clr, height: '4px' } },

                            // Stamina Bar (New)
                            { component: Gauge, props: { percent: staPct, color: staColor, height: '4px' } },

                            // PE & EXP (Shared Line)
                            {
                                type: 'container',
                                layout: new FlexLayout({ direction: 'row', gap: 2 }),
                                children: [
                                    { component: Gauge, props: { percent: pePct, color: 'var(--pe-cyan)', height: '2px', style: {flex: '1'} } },
                                    { component: Gauge, props: { percent: expPct, color: '#888', height: '2px', style: {flex: '1'} } }
                                ]
                            }
                        ]
                    }
                ]
            };
        });

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 0 }),
            children: members
        };
    }
}
