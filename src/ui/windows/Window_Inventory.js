// ============================================================================
// WINDOW: INVENTORY
// ============================================================================

class Window_Inventory extends Window_Base {
    constructor() {
        super('inventory-modal', {
            left: '20%', top: '10%', width: '60%', height: '80%', zIndex: '100'
        }, `INVENTORY [${$gameParty.inventory.length}/${$gameParty.maxInventory}]`);

        // Track state internally for selection
        this.selectedItem = null;
    }

    defineLayout() {
        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 10 }),
            props: { style: { height: '100%' } }, // Fill window
            children: [
                // Description Pane
                {
                    type: 'container',
                    props: {
                        id: 'inv-desc-pane',
                        style: {
                            height: '60px',
                            borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
                            background: 'rgba(0,0,0,0.3)',
                            marginBottom: '5px', padding: '8px',
                            fontSize: '12px', color: 'var(--c-text-sec)', fontStyle: 'italic',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                        }
                    },
                    children: [
                        { component: Label, props: { id: 'inv-desc-text', text: 'Select an item...' } }
                    ]
                },
                // Body (Split View)
                {
                    type: 'container',
                    layout: new FlexLayout({ direction: 'row', gap: 10 }),
                    props: { flex: '1', style: { overflow: 'hidden' } },
                    children: [
                        // Left Column: Item List
                        this.createItemList(),
                        // Right Column: Squad Equip Status
                        this.createSquadStatus()
                    ]
                }
            ]
        };
    }

    createItemList() {
        const items = $gameParty.inventory.map((item, idx) => {
            return {
                component: Button,
                props: {
                    className: 'item-row', // Reusing existing class
                    label: `${item.icon} ${item.name}`,
                    subLabel: item.category ? item.category.toUpperCase() : '???',
                    onClick: () => this.onItemClick(item, idx),
                    onMouseEnter: (e) => this.updateDescription(item.desc || "No description.")
                }
            };
        });

        if (items.length === 0) {
            items.push({
                component: Label,
                props: { text: "NO ITEMS", align: 'center', color: '#666', style: { paddingTop: '20px', letterSpacing: '2px' } }
            });
        }

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 0 }),
            props: {
                flex: '1',
                style: { borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '5px', overflowY: 'auto' }
            },
            children: items
        };
    }

    createSquadStatus() {
        const members = $gameParty.members.map(m => {
            return {
                component: Box,
                props: {
                    style: {
                        marginBottom: '8px',
                        border: '1px solid #333',
                        padding: '6px',
                        background: 'rgba(255,255,255,0.02)'
                    }
                },
                layout: new FlexLayout({ direction: 'column', gap: 4 }),
                children: [
                    // Header
                    {
                        type: 'container',
                        layout: new FlexLayout({ direction: 'row', justify: 'space-between' }),
                        props: { style: { borderBottom: '1px solid #222', marginBottom: '4px', paddingBottom: '2px' } },
                        children: [
                            { component: Label, props: { text: m.name, color: '#' + m.color.toString(16), fontWeight: 'bold' } },
                            { component: Label, props: { text: `ATK:${m.getAtk()} DEF:${m.getDef()}`, fontSize: '10px', color: '#888' } }
                        ]
                    },
                    // Slots
                    this.createEquipRow('WEAPON', m.equip.weapon, m),
                    this.createEquipRow('ARMOR', m.equip.armor, m)
                ]
            };
        });

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 5 }),
            props: {
                flex: '1',
                style: { overflowY: 'auto' }
            },
            children: [
                { component: Label, props: { text: 'SQUAD STATUS', align: 'center', color: 'var(--c-accent-gold)', fontSize: '11px', style: { marginBottom: '8px', letterSpacing: '2px' } } },
                ...members
            ]
        };
    }

    createEquipRow(slot, item, actor) {
        return {
            type: 'container', // Changed from Button to container (div) to avoid button styling issues
            props: {
                className: 'item-row',
                style: {
                    fontSize: '11px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    cursor: item ? 'pointer' : 'default',
                    background: 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    padding: '4px'
                },
                html: item ? `<span style="color:#aaa">${slot}:</span> <span style="color:white">${item.icon} ${item.name}</span>` : `<span style="color:#444">${slot}: ---</span>`,
                onClick: () => {
                     if (item) this.unequipItem(actor, slot.toLowerCase());
                },
                onMouseEnter: (e) => {
                    if (item) {
                        e.currentTarget.style.background = 'rgba(255, 42, 42, 0.2)'; // Warn/Remove color
                        e.currentTarget.style.border = '1px solid var(--c-accent-warn)';
                    }
                },
                onMouseLeave: (e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.border = 'none';
                }
            }
        };
    }

    updateDescription(text) {
        const el = document.getElementById('inv-desc-text');
        if (el) el.innerText = text;
    }

    onItemClick(item, idx) {
        if (item.category === 'item') {
            $gameSystem.ui.showTargetSelectModal((target) => {
                $gameSystem.ui.showConfirmModal(`Use ${item.name} on ${target.name}?`, () => {
                    $gameSystem.ui.useConsumable(target, item, idx); // Call back to UIManager logic for now
                    // We need to refresh THIS window after use
                    this.refreshAndTitle();
                });
            });
        } else {
            // Equipment
            $gameSystem.ui.showTargetSelectModal((target) => {
                 $gameSystem.ui.equipGear(target, item, idx, () => {
                     this.refreshAndTitle();
                     $gameSystem.ui.refresh(); // Refresh HUD
                 });
            }, item);
        }
    }

    unequipItem(actor, slot) {
        if ($gameParty.inventory.length < $gameParty.maxInventory) {
            const item = actor.equip[slot];
            if (item) {
                $gameParty.gainItem(item);
                actor.equip[slot] = null;
                this.refreshAndTitle();
                $gameSystem.ui.refresh();
            }
        } else {
            alert("Inventory Full!");
        }
    }

    refreshAndTitle() {
        this.title = `INVENTORY [${$gameParty.inventory.length}/${$gameParty.maxInventory}]`;
        if (this.headerEl) {
            // Rebuild Header Content while preserving close button
            const closeBtn = this.headerEl.querySelector('#modal-close');
            this.headerEl.innerText = "";

            // Add decorative box
            const box = document.createElement('span');
            box.style.display = 'inline-block';
            box.style.width = '6px';
            box.style.height = '6px';
            box.style.background = 'var(--c-accent-main)';
            box.style.marginRight = '8px';
            box.style.boxShadow = 'var(--border-glow)';
            this.headerEl.appendChild(box);

            this.headerEl.appendChild(document.createTextNode(this.title));

            if (closeBtn) this.headerEl.appendChild(closeBtn);
        }
        this.refresh();

        if ($gameSystem.ui.activeModal === this.el) {
             $gameSystem.ui.collectFocusables();
             $gameSystem.ui.setFocus(0);
        }
    }
}
