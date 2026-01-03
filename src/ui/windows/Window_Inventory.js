// ============================================================================
// WINDOW: INVENTORY
// ============================================================================

class Window_Inventory extends Window_Base {
    constructor() {
        super('inventory-modal', {
            left: '20%', top: '10%', width: '60%', height: '80%', zIndex: '100'
        }, `SHARED INVENTORY [${$gameParty.inventory.length}/${$gameParty.maxInventory}]`);

        // Track state internally for selection
        this.selectedItem = null;
        this.selectedIdx = -1;
        this.viewState = 'list'; // 'list', 'target'
        this.closeCallback = null; // Assigned by UIManager
    }

    handleBack() {
        if (this.viewState === 'target') {
            this.viewState = 'list';
            this.selectedItem = null;
            this.selectedIdx = -1;
            this.refreshAndTitle();
            return true;
        }
        return false;
    }

    defineLayout() {
        // Main Container
        const container = {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 10 }),
            props: { style: { height: '100%' } }, // Fill window
            children: []
        };

        // Description Pane (always visible, updates based on context)
        container.children.push({
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
                { component: Label, props: { id: 'inv-desc-text', text: this.selectedItem ? `Select target for ${this.selectedItem.name}...` : 'Select an item...' } }
            ]
        });

        if (this.viewState === 'target') {
            container.children.push(this.renderTargetSelect());
        } else {
            container.children.push({
                type: 'container',
                layout: new FlexLayout({ direction: 'row', gap: 10 }),
                props: { flex: '1', style: { overflow: 'hidden' } },
                children: [
                    this.createItemList(),
                    this.createSquadStatus()
                ]
            });
        }

        return container;
    }

    renderTargetSelect() {
        const item = this.selectedItem;
        const members = $gameParty.members.map(m => {
            let label = m.name;
            let subLabel = "";

            // Calculate diff if equipment
            if (item.category === 'weapon') {
                const currentAtk = m.getAtk();
                const newAtk = m.getAtkWith(item);
                const diff = newAtk - currentAtk;
                const color = diff > 0 ? '#0f0' : (diff < 0 ? '#f00' : '#888');
                subLabel = `ATK: ${currentAtk} -> <span style="color:${color}">${newAtk}</span>`;
            } else if (item.category === 'armor') {
                const currentDef = m.getDef();
                const newDef = m.getDefWith(item);
                const diff = newDef - currentDef;
                const color = diff > 0 ? '#0f0' : (diff < 0 ? '#f00' : '#888');
                subLabel = `DEF: ${currentDef} -> <span style="color:${color}">${newDef}</span>`;
            } else {
                // Consumable status
                subLabel = `HP: ${m.hp}/${m.mhp} PE: ${m.pe}/${m.mpe}`;
            }

            return {
                component: Button,
                props: {
                    className: 'item-row',
                    label: label,
                    subLabel: subLabel, // Button component needs to support HTML in subLabel if we want colors
                    html: `<span>${label}</span> <span style="font-size:10px; color:#aaa">(${subLabel})</span>`, // Override internal content
                    onClick: () => this.onTargetClick(m)
                }
            };
        });

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 5 }),
            props: { flex: '1', style: { overflowY: 'auto', padding: '10px' } },
            children: [
                { component: Label, props: { text: "SELECT TARGET", align: 'center', color: 'var(--pe-gold)' } },
                ...members
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
            type: 'container',
            props: {
                className: 'item-row',
                style: { fontSize: '10px', display: 'flex', justifyContent: 'space-between', cursor: item ? 'pointer' : 'default', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '2px' },
                html: item ? `<span>${slot}: ${item.icon} ${item.name}</span>` : `<span style="color:#444">${slot}: ---</span>`,
                onClick: () => {
                     if ($gameSystem.isInputBlocked || $gameSystem.isBusy) return;
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

    /**
     * Updates the description text in the inventory window.
     * @param {string} text - The description text to display.
     */
    updateDescription(text) {
        const el = document.getElementById('inv-desc-text');
        if (el) el.innerText = text;
    }

    /**
     * Handles clicking on an inventory item.
     * @param {Game_Item|Game_Weapon|Game_Armor} item - The clicked item.
     * @param {number} idx - The index of the item in the inventory.
     */
    onItemClick(item, idx) {
        if ($gameSystem.isInputBlocked || $gameSystem.isBusy) {
            return;
        }
        this.selectedItem = item;
        this.selectedIdx = idx;
        this.viewState = 'target';
        this.refreshAndTitle();
    }

    /**
     * Handles selecting a target for the currently selected item.
     * @param {Game_Actor} target - The selected target actor.
     */
    onTargetClick(target) {
        if ($gameSystem.isInputBlocked || $gameSystem.isBusy) return;

        const item = this.selectedItem;
        const idx = this.selectedIdx;

        if (item.category === 'item') {
            // Consumable Logic
            if (target.isDead()) {
                 if (item.type !== 'heal' && item.type !== 'revive') {
                     alert("Cannot use this on a dead character!");
                     return;
                 }
            }
            if (item.type === 'cure' && target.isDead()) {
                alert("Cannot cure dead character.");
                return;
            }
            this.useConsumable(target, item, idx);

        } else {
            // Equipment Logic
            this.equipGear(target, item, idx);
        }
    }

    useConsumable(actor, i, idx) {
        if(i.type==='heal') { actor.heal(i.val); $gameSystem.log(`Healed ${actor.name} for ${i.val}.`); }
        if(i.type==='pe') { actor.pe = Math.min(actor.mpe, actor.pe+i.val); $gameSystem.log(`Restored PE for ${actor.name}.`); }
        if(i.type==='cure') {
            if(actor.isStateAffected('poison')) {
                actor.removeState('poison');
                $gameSystem.log(`${actor.name} is cured.`);
            } else {
                $gameSystem.log("No effect.");
            }
        }

        // Remove Item
        $gameParty.inventory.splice(idx, 1);

        // Log and Close
        $gameSystem.ui.refresh(); // Update HUD

        if (this.closeCallback) this.closeCallback();

        // End Turn
        $gameMap.processTurn(0,0);
    }

    equipGear(actor, i, idx) {
        const type = i.category;
        const current = actor.equip[type];
        actor.equip[type] = i;

        // Swap items
        $gameParty.inventory.splice(idx, 1);
        if(current) $gameParty.gainItem(current);

        $gameSystem.log(`${actor.name} equipped ${i.name}.`);

        // Return to list
        this.viewState = 'list';
        this.selectedItem = null;
        this.selectedIdx = -1;
        this.refreshAndTitle();
        $gameSystem.ui.refresh();
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
        if (this.headerEl) {
            // We need to preserve the close button when updating title
            const closeBtn = this.headerEl.querySelector('#modal-close');
            this.headerEl.innerText = this.title;
            if (closeBtn) this.headerEl.appendChild(closeBtn);
        }
        this.refresh();

        if ($gameSystem.ui.activeModal === this.el) {
             $gameSystem.ui.collectFocusables();
             $gameSystem.ui.setFocus(0);
        }
    }
}
