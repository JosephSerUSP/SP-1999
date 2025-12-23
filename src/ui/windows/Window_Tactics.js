// ============================================================================
// WINDOW: TACTICS
// ============================================================================

class Window_Tactics extends Window_Base {
    constructor() {
        // Positioned on the right for slide-in from right
        // zIndex increased to 50 to ensure it overlaps Window_Log
        super('cmd', {bottom:'2%', right:'2%', width:'20%', height:'44%', zIndex: '50'}, "TACTICS");
        this.viewState = 'main'; // 'main', 'ability'
        this.show();

        // Add transition class and initial hidden state
        this.el.classList.add('slide-transition', 'slide-hidden');
    }

    onCancel() {
        if (this.viewState === 'ability') {
            this.viewState = 'main';
            this.refresh();
            $gameSystem.ui.focusIndex = 0;
            setTimeout(() => $gameSystem.ui.collectFocusables(), 0);
            return true;
        }
        return false;
    }

    defineLayout() {
        if (!$gameParty || !$gameParty.active()) return null; // Safety

        if (this.viewState === 'ability') return this.renderAbility();
        return this.renderMain();
    }

    // Hook into refresh to update visibility based on focus
    refresh() {
        super.refresh();
        this.updateVisibility();
    }

    updateVisibility() {
        // Safety check: $gameSystem.ui might not be initialized during constructor
        if ($gameSystem && $gameSystem.ui && $gameSystem.ui.focusedWindow === 'cmd') {
            this.el.classList.remove('slide-hidden');
            this.el.classList.add('slide-visible');
        } else {
            this.el.classList.remove('slide-visible');
            this.el.classList.add('slide-hidden');
        }
    }

    renderMain() {
        const children = [];

        // Attack
        children.push(this.createCommand("ATTACK", "", () => {
            $gameSystem.ui.blurWindow();
            // Allow animation to finish or just rely on state change?
            // Blur window will trigger refresh in UIManager?
            // UIManager.blurWindow() clears focus.
            // We need to ensure we re-evaluate visibility.
            this.updateVisibility();
            $gameMap.playerAttack();
        }));

        // Ability
        children.push(this.createCommand("ABILITY", "", () => {
            this.viewState = 'ability';
            this.refresh(); // This will also call updateVisibility
            $gameSystem.ui.focusIndex = 0;
            setTimeout(() => $gameSystem.ui.collectFocusables(), 0);
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
