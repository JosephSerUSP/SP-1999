// ============================================================================
// WINDOW: PARTY
// ============================================================================

class Window_Party extends Window_Base {
    constructor() {
        // Changed title to "PARTY", kept position/size but might need adjustment if overlapping with view content
        // View is now full screen behind everything.
        super('status', {top:'2%', left:'2%', width:'20%', height:'50%', zIndex: '10'}, "PARTY");
        this.gauges = {}; // Map of { memberIndex: { hp: Gauge, hpText: Label, pe: Gauge, exp: Gauge, sta: Gauge, slot: Container } }

        // Remove frame styles
        this.el.style.background = 'transparent';
        this.el.style.border = 'none';
        this.el.style.boxShadow = 'none';

        // Override header styles if it exists
        if (this.headerEl) {
             this.headerEl.style.background = 'transparent';
             this.headerEl.style.border = 'none';
             this.headerEl.style.textShadow = '1px 1px 2px #000'; // Make text pop against game view
             this.headerEl.style.fontSize = '14px'; // Slightly bigger
        }

        this.show(); // Always visible
    }

    // Override refresh completely for this window to handle Optimized Updates
    refresh() {
        // Ensure root is mounted (logic from Window_Base.refresh)
        if (!this.root.el) {
            this.root.mount(this.contentEl);
            this.root.el.style.width = '100%';
            this.root.el.style.height = '100%';
        }

        if (this.root.children.length === 0) {
            this.buildLayout();
        }
        this.updateValues();
    }

    // Explicitly define layout logic imperatively to capture component references
    buildLayout() {
        this.gauges = {};
        const container = this.root;
        // Ensure the root container acts as a column flex container
        container.update({ layout: new FlexLayout({ direction: 'column', gap: 0 }) });

        $gameParty.members.forEach((m, i) => {
            const cache = {};
            this.gauges[i] = cache;

            // Slot Container
            const slot = new UIContainer({
                className: 'party-slot',
                onClick: () => {
                    if (!$gameSystem.isBusy && !$gameSystem.isInputBlocked) {
                        $gameSystem.ui.showStatusModal(m);
                    }
                },
                layout: new FlexLayout({ direction: 'row', gap: 4 })
            });
            // Override slot styles to be more seamless
            // .party-slot class has background/border. We might want to keep it or make it more subtle.
            // User said "The 'squadron' window should not have a background or frame anymore".
            // This implies the main window container. The slots might still need some background for readability?
            // "seamlessly overlap with the game view."
            // I'll assume individual slots can have backgrounds, but maybe more transparent?
            // The class `.party-slot` in css has `background: rgba(0,0,0,0.3)`. This is already semi-transparent.
            // I will leave the slot styling as is for now, as it provides readability.

            cache.slot = slot;

            // Icon
            slot.add(new Label({
                text: m.name[0],
                style: { color: '#' + m.color.toString(16), width: '20px', fontWeight: 'bold', textShadow: '1px 1px 0 #000' }
            }));

            // Bars Container
            const barsParams = new UIContainer({
                props: { flex: '1' },
                layout: new FlexLayout({ direction: 'column', gap: 2 })
            });

            // Header (Name + HP)
            const header = new UIContainer({
                layout: new FlexLayout({ direction: 'row', justify: 'space-between' })
            });
            header.add(new Label({ text: m.name, style: { textShadow: '1px 1px 0 #000' } }));
            const hpText = new Label({ text: "", color: '#fff', style: { textShadow: '1px 1px 0 #000' } }); // Value set in updateValues
            cache.hpText = hpText;
            header.add(hpText);
            barsParams.add(header);

            // HP Gauge
            const hpGauge = new Gauge({ height: '4px' });
            cache.hp = hpGauge;
            barsParams.add(hpGauge);

            // Stamina Gauge
            const staGauge = new Gauge({ height: '4px' });
            cache.sta = staGauge;
            barsParams.add(staGauge);

            // PE/EXP Row
            const row = new UIContainer({
                layout: new FlexLayout({ direction: 'row', gap: 2 })
            });
            const peGauge = new Gauge({ height: '2px', style: {flex: '1'}, color: 'var(--pe-cyan)' });
            cache.pe = peGauge;
            row.add(peGauge);

            const expGauge = new Gauge({ height: '2px', style: {flex: '1'}, color: '#888' });
            cache.exp = expGauge;
            row.add(expGauge);

            barsParams.add(row);
            slot.add(barsParams);

            container.add(slot);
        });
    }

    updateValues() {
        $gameParty.members.forEach((m, i) => {
            const cache = this.gauges[i];
            if (!cache) return;

            const active = i === $gameParty.index;
            const pct = (m.hp / m.mhp) * 100;
            const pePct = (m.pe / m.mpe) * 100;
            const expPct = (m.exp / m.nextExp) * 100;
            const staPct = (m.stamina / m.mstamina) * 100;
            const clr = pct < 30 ? 'var(--pe-red)' : pct < 60 ? 'var(--pe-gold)' : 'var(--pe-green)';
            const staColor = m.isExhausted ? 'var(--pe-red)' : '#ccffff';

            if (cache.slot && cache.slot.el) {
                // Manually toggle class because applyProps overwrites
                if (active) cache.slot.el.classList.add('active');
                else cache.slot.el.classList.remove('active');
            }

            if (cache.hpText) cache.hpText.update({ text: `${m.hp}/${m.mhp}`, color: clr });
            if (cache.hp) cache.hp.update({ percent: pct, color: clr });
            if (cache.sta) cache.sta.update({ percent: staPct, color: staColor });
            if (cache.pe) cache.pe.update({ percent: pePct });
            if (cache.exp) cache.exp.update({ percent: expPct });
        });
    }

    // We do not need defineLayout as we override refresh()
    defineLayout() { return null; }
}
