// ============================================================================
// WINDOW: PARTY
// ============================================================================

class Window_Party extends Window_Base {
    constructor() {
        // Triangle Layout: Active Top, Others Bottom Left/Right
        // Position: Bottom Right
        super('status', { bottom: '2%', right: '2%', width: '30%', height: 'auto', zIndex: '10' }, "PARTY");
        this.gauges = {};

        // Remove frame styles for seamless look
        this.el.style.background = 'transparent';
        this.el.style.border = 'none';
        this.el.style.boxShadow = 'none';

        // Override header styles
        if (this.headerEl) {
             this.headerEl.style.display = 'none'; // Hide header for this layout
        }

        this.show();
    }

    refresh() {
        if (!this.root.el) {
            this.root.mount(this.contentEl);
            this.root.el.style.width = '100%';
        }

        if (this.root.children.length === 0) {
            this.buildLayout();
        }
        this.updateValues();
    }

    buildLayout() {
        this.gauges = {};
        const container = this.root;
        container.update({ layout: new FlexLayout({ direction: 'column', gap: 4, align: 'center' }) });
        container.children = []; // Clear existing
        container.el.innerHTML = '';

        const party = $gameParty.members;
        if (party.length === 0) return;

        const activeIdx = $gameParty.index;
        const activeMember = party[activeIdx];

        // 1. Top Slot (Active)
        const topSlot = this.createMemberSlot(activeMember, activeIdx, true);
        container.add(topSlot);

        // 2. Bottom Row (Prev/Next)
        const bottomRow = new UIContainer({
            layout: new FlexLayout({ direction: 'row', gap: 10, justify: 'space-between' }),
            style: { width: '100%', marginTop: '4px' }
        });

        // Determine Prev/Next logic based on Input.js cycle logic
        // PREV = (index - 1 + length) % length
        // NEXT = (index + 1) % length

        const count = party.length;
        if (count > 1) {
            const prevIdx = (activeIdx - 1 + count) % count;
            const prevMember = party[prevIdx];
            const prevSlot = this.createMemberSlot(prevMember, prevIdx, false);
            bottomRow.add(prevSlot);

            // If only 2 members, showing both might be redundant if we want strictly Prev/Next slots.
            // But usually in 2 member party, Prev==Next. We can just show one or duplicate.
            // Given "Triangle" request, let's show all available unique non-active members.

            if (count > 2) {
                const nextIdx = (activeIdx + 1) % count;
                const nextMember = party[nextIdx];
                const nextSlot = this.createMemberSlot(nextMember, nextIdx, false);
                bottomRow.add(nextSlot);
            }
        }

        container.add(bottomRow);
    }

    createMemberSlot(member, index, isActive) {
        const cache = {};
        this.gauges[index] = cache;

        const slotHeight = isActive ? '100px' : '80px';
        const slotWidth = isActive ? '100%' : '48%';

        const slot = new UIContainer({
            className: 'party-slot', // We can style this or use inline
            style: {
                width: slotWidth,
                height: slotHeight,
                background: 'rgba(0,0,0,0.5)',
                border: isActive ? '1px solid var(--c-accent-main)' : '1px solid #444',
                position: 'relative',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden'
            },
            onClick: () => {
                if (!$gameSystem.isBusy && !$gameSystem.isInputBlocked) {
                    // Click to swap? Or status?
                    // Manual swap by clicking might be nice.
                    if (isActive) {
                        $gameSystem.ui.showStatusModal(member);
                    } else {
                        // Find this index and swap to it?
                        // The engine assumes L2/R2. Let's just open status for now to be safe.
                         $gameSystem.ui.showStatusModal(member);
                    }
                }
            }
        });
        cache.slot = slot;

        // Portrait Background or Image
        // Use portrait property from data class
        const clsData = $dataClasses[member.name];
        const portraitUrl = clsData ? clsData.portrait : null;

        if (portraitUrl) {
            // We use an image container on the left or background
            const imgEl = document.createElement('img');
            imgEl.src = portraitUrl;
            imgEl.style.position = 'absolute';
            imgEl.style.left = '0';
            imgEl.style.top = '0';
            imgEl.style.height = '100%';
            imgEl.style.width = 'auto';
            imgEl.style.opacity = isActive ? '1.0' : '0.6';
            imgEl.style.maskImage = 'linear-gradient(to right, black 40%, transparent 100%)';
            imgEl.style.webkitMaskImage = 'linear-gradient(to right, black 40%, transparent 100%)';

            // Add to slot element directly as it's not a UIComponent (or wrap it)
            // UIContainer can take a 'component' that creates an element.
            // Simpler: use a container with background image if we want to stick to UI framework strictly,
            // but appending raw element is supported by UIContainer implementation if we use a wrapper.
            // Let's use a Label with HTML or just a raw container.

            const portraitContainer = new UIContainer({
                 style: {
                     position: 'absolute', left: 0, top: 0, bottom: 0, width: '60%',
                     backgroundImage: `url('${portraitUrl}')`,
                     backgroundSize: 'cover',
                     backgroundPosition: 'top center',
                     opacity: isActive ? '1' : '0.5',
                     maskImage: 'linear-gradient(to right, black 0%, transparent 100%)',
                     webkitMaskImage: 'linear-gradient(to right, black 0%, transparent 100%)',
                     pointerEvents: 'none'
                 }
            });
            slot.add(portraitContainer);
        }

        // Info Container (Right side)
        const info = new UIContainer({
            style: {
                marginLeft: '30%', // Offset for portrait
                width: '70%',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                zIndex: 1
            }
        });

        // Name
        const nameLabel = new Label({
            text: member.name,
            style: {
                fontWeight: 'bold',
                fontSize: isActive ? '14px' : '12px',
                textShadow: '1px 1px 2px #000',
                textAlign: 'right'
            }
        });
        info.add(nameLabel);

        // HP Text
        const hpText = new Label({
            text: "",
            style: { fontSize: '10px', textAlign: 'right', textShadow: '1px 1px 0 #000' }
        });
        cache.hpText = hpText;
        info.add(hpText);

        // HP Gauge
        const hpGauge = new Gauge({ height: '4px', style: { marginTop: '2px' } });
        cache.hp = hpGauge;
        info.add(hpGauge);

        // PE Gauge
        const peGauge = new Gauge({ height: '2px', color: 'var(--pe-cyan)', style: { marginTop: '1px' } });
        cache.pe = peGauge;
        info.add(peGauge);

        // Stamina Gauge (Important for swapping)
        const staGauge = new Gauge({ height: '2px', color: '#fff', style: { marginTop: '1px' } });
        cache.sta = staGauge;
        info.add(staGauge);

        slot.add(info);

        return slot;
    }

    updateValues() {
        // We only have gauges for currently displayed slots (Active, Prev, Next)
        // But we need to update them based on the party member they represent.
        // buildLayout is called once, but the party order changes when swapping?
        // Wait, if $gameParty.index changes, the "Active" member changes.
        // My buildLayout creates slots for specific INDICES (activeIdx, prevIdx).
        // If I swap, activeIdx changes.
        // Does Window_Party rebuild layout on swap?
        // Standard refresh() calls updateValues().
        // If the structure depends on who is active (Triangle layout shifts),
        // then I MUST rebuild the layout when the active index changes.

        // Check if cached index matches current active index
        if (this._lastActiveIndex !== $gameParty.index) {
            this._lastActiveIndex = $gameParty.index;
            this.buildLayout();
            // buildLayout creates new gauges, so updateValues will pick them up.
        }

        $gameParty.members.forEach((m, i) => {
            const cache = this.gauges[i];
            if (!cache) return; // This member might not be visible in 2-person party repeated slot scenario, but here we map by index.

            const pct = (m.hp / m.mhp) * 100;
            const pePct = (m.pe / m.mpe) * 100;
            const staPct = (m.stamina / m.mstamina) * 100;

            const hpColor = pct < 30 ? 'var(--pe-red)' : pct < 60 ? 'var(--pe-gold)' : 'var(--pe-green)';
            const staColor = m.isExhausted ? 'var(--pe-red)' : '#ccffff';

            if (cache.hpText) cache.hpText.update({ text: `${Math.floor(m.hp)}`, color: hpColor });
            if (cache.hp) cache.hp.update({ percent: pct, color: hpColor });
            if (cache.pe) cache.pe.update({ percent: pePct });
            if (cache.sta) cache.sta.update({ percent: staPct, color: staColor });
        });
    }

    defineLayout() { return null; }
}
