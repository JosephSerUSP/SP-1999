// ============================================================================
// WINDOW: INVENTORY
// ============================================================================

class Window_Inventory extends Window_Base {
    constructor() {
        super('inventory-modal', {
            left: '20%', top: '10%', width: '60%', height: '80%', zIndex: 100
        }, `SHARED INVENTORY [${$gameParty.inventory.length}/${$gameParty.maxInventory}]`);

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
                            height: '60px', borderBottom: '1px solid #444',
                            marginBottom: '5px', padding: '5px',
                            fontSize: '12px', color: '#aaa', fontStyle: 'italic'
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
                    subLabel: item.category.toUpperCase(),
                    onClick: () => this.onItemClick(item, idx),
                    onMouseEnter: () => this.updateDescription(item.desc || "No description.")
                }
            };
        });

        if (items.length === 0) {
            items.push({
                component: Label,
                props: { text: "Empty", align: 'center', color: '#666', style: { paddingTop: '20px' } }
            });
        }

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 0 }),
            props: {
                flex: '1',
                style: { borderRight: '1px solid #444', paddingRight: '5px', overflowY: 'auto' }
            },
            children: items
        };
    }

    createSquadStatus() {
        const members = $gameParty.members.map(m => {
            return {
                component: Box,
                props: { style: { marginBottom: '5px', border: '1px solid #333', padding: '4px' } },
                layout: new FlexLayout({ direction: 'column', gap: 2 }),
                children: [
                    // Header
                    {
                        type: 'container',
                        layout: new FlexLayout({ direction: 'row', justify: 'space-between' }),
                        props: { style: { borderBottom: '1px solid #222', marginBottom: '2px' } },
                        children: [
                            { component: Label, props: { text: m.name, color: '#' + m.color.toString(16), fontWeight: 'bold' } },
                            { component: Label, props: { text: `ATK:${m.getAtk()} DEF:${m.getDef()}`, fontSize: '9px', color: '#999' } }
                        ]
                    },
                    // Slots
                    this.createEquipRow('weapon', m.equip.weapon, m),
                    this.createEquipRow('armor', m.equip.armor, m)
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
                { component: Label, props: { text: 'SQUAD STATUS', align: 'center', color: 'var(--pe-gold)', fontSize: '10px', style: { marginBottom: '5px' } } },
                ...members
            ]
        };
    }

    createEquipRow(slot, item, actor) {
        return {
            component: Button, // Making it clickable to unequip
            props: {
                className: 'item-row',
                style: { fontSize: '10px', display: 'flex', justifyContent: 'space-between', cursor: item ? 'pointer' : 'default', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '2px' },
                html: item ? `<span>${slot}: ${item.icon} ${item.name}</span>` : `<span style="color:#444">${slot}: ---</span>`,
                onClick: () => {
                     if (item) this.unequipItem(actor, slot);
                },
                onMouseEnter: (e) => {
                    if (item) e.target.style.color = "var(--pe-red)";
                },
                onMouseLeave: (e) => {
                    e.target.style.color = "";
                }
            }
        };
    }

    updateDescription(text) {
        // Direct DOM manipulation for performance on hover, bypassing full re-render
        // Though ideally we'd use state. But for now this is fine.
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
        this.title = `SHARED INVENTORY [${$gameParty.inventory.length}/${$gameParty.maxInventory}]`;
        if (this.headerEl) this.headerEl.innerText = this.title;
        this.refresh();

        // Re-focus logic would go here if we had a robust focus system linked to components
        // For now, UIManager handles focus separately via class names
        // But since we rebuilt the DOM, we need to let UIManager know to re-collect focusables
        // This is a bit tricky with the hybrid approach.
        // We'll rely on UIManager's loop or manual trigger.
        if ($gameSystem.ui.activeModal === this.el) {
             $gameSystem.ui.collectFocusables();
             $gameSystem.ui.setFocus(0);
        }
    }
}
