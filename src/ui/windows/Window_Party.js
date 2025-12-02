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
            const clr = pct < 30 ? 'var(--pe-red)' : pct < 60 ? 'var(--pe-gold)' : 'var(--pe-green)';

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
                            // PE Bar
                            { component: Gauge, props: { percent: pePct, color: 'var(--pe-cyan)', height: '2px' } },
                            // EXP Bar
                            { component: Gauge, props: { percent: expPct, color: '#888', height: '1px' } }
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
