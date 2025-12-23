// ============================================================================
// WINDOW: TACTICS
// ============================================================================

class Window_Tactics extends Window_Base {
    constructor() {
        super('cmd', {bottom:'2%', left:'2%', width:'20%', height:'44%', zIndex: '10'}, "TACTICS");
        this.viewState = 'main'; // 'main', 'ability'
        this.show();
        this.el.classList.add('window-slide-exit');
    }

    refresh() {
        super.refresh();
        const ui = $gameSystem.ui;
        // Check if ui exists to avoid crash during initial load
        const focused = ui && ui.focusedWindow === this.id;

        // Remove both classes first
        this.el.classList.remove('window-slide-enter', 'window-slide-exit');

        if (focused) {
            this.el.classList.add('window-slide-enter');
        } else {
            this.el.classList.add('window-slide-exit');
        }
    }

    onCancel() {
        if (this.viewState === 'ability') {
            this.viewState = 'main';
            this.refresh();
            $gameSystem.ui.focusIndex = 0;
            setTimeout(() => {
                $gameSystem.ui.collectFocusables();
                $gameSystem.ui.setFocus(0);
            }, 0);
            return true;
        }
        return false;
    }

    defineLayout() {
        if (!$gameParty || !$gameParty.active()) return null; // Safety

        if (this.viewState === 'ability') return this.renderAbility();
        return this.renderMain();
    }

    renderMain() {
        const children = [];

        // Attack
        children.push(this.createCommand("ATTACK", "", () => {
            $gameSystem.ui.blurWindow();
            $gameMap.playerAttack();
        }));

        // Ability
        children.push(this.createCommand("ABILITY", "", () => {
            this.viewState = 'ability';
            this.refresh();
            $gameSystem.ui.focusIndex = 0;
            setTimeout(() => {
                $gameSystem.ui.collectFocusables();
                $gameSystem.ui.setFocus(0);
            }, 0);
        }));

        // Item
        children.push(this.createCommand("ITEM", "", () => $gameSystem.ui.showInventoryModal()));

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 0 }),
            children: children
        };
    }

    renderAbility() {
        const actor = $gameParty.active();
        const children = [];

        if (actor.skills && actor.skills.length > 0) {
            actor.skills.forEach(k => {
                const s = $dataSkills[k];
                const disabled = actor.pe < s.cost;
                children.push(this.createCommand(
                    s.name,
                    `${s.cost}PE`,
                    () => {
                        if (!$gameSystem.isBusy) {
                             $gameSystem.ui.blurWindow();
                             // Reset state for next time
                             this.viewState = 'main';
                             this.refresh();
                             $gameMap.processTurn(0, 0, () => BattleManager.executeSkill(actor, k));
                        }
                    },
                    disabled,
                    s,
                    actor
                ));
            });
        } else {
             children.push(this.createCommand("No Abilities", "", () => {}, true));
        }

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: 0 }),
            children: children
        };
    }

    createCommand(label, subLabel, callback, disabled = false, skill = null, actor = null) {
        return {
            component: Button,
            props: {
                label: label,
                subLabel: subLabel,
                disabled: disabled,
                onClick: () => {
                    if (!$gameSystem.isBusy && !$gameSystem.isInputBlocked && !disabled) {
                         callback();
                    }
                },
                onMouseEnter: (e) => {
                    if (skill) {
                        Renderer.setPreviewOverride(skill);
                        $gameSystem.ui.showTooltip(e, `<b>${skill.name}</b><br>${skill.desc(actor)}`);
                    }
                },
                onMouseLeave: () => {
                    if (skill) {
                        Renderer.clearPreviewOverride();
                        $gameSystem.ui.hideTooltip();
                    }
                }
            }
        };
    }
}
