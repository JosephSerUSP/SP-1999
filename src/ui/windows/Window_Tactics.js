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
        const actor = $gameParty.active();
        const skillId = actor.getAttackSkill();
        const attackSkill = $dataSkills[skillId]; // Now guaranteed to exist via getAttackSkill default

        children.push(this.createCommand("ATTACK", "", () => {
            $gameSystem.ui.blurWindow();
            $gameMap.startTargeting(attackSkill, (target) => {
                console.log("[Window_Tactics] Attack confirmed. Target:", target);
                // If confirmed
                if (target) {
                    const finalTarget = (target === 'CONFIRM') ? null : target;
                    // Face target if explicit
                    if (finalTarget) {
                        const dx = Math.sign(finalTarget.x - actor.x); const dy = Math.sign(finalTarget.y - actor.y);
                        if (dx !== 0 || dy !== 0) actor.direction = {x: dx, y: dy};
                    }
                    console.log("[Window_Tactics] calling processTurn with executeSkill. finalTarget:", finalTarget);
                    $gameMap.processTurn(0, 0, () => BattleManager.executeSkill(actor, skillId, finalTarget));
                } else {
                    console.log("[Window_Tactics] Target cancelled/null.");
                    $gameSystem.ui.focusWindow('cmd');
                }
            });
        }, false, attackSkill, actor));

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

                             // Targeting Phase
                             if (s.type === 'self' || s.type === 'all_enemies') {
                                 // Immediate execution
                                 $gameMap.processTurn(0, 0, () => BattleManager.executeSkill(actor, k));
                             } else {
                                 // Enter Targeting
                                 $gameMap.startTargeting(s, (target) => {
                                     if (target) {
                                         // Execute
                                         // If target is string 'CONFIRM', it means Directional confirm (target is null/implicit)
                                         let finalTarget = (target === 'CONFIRM') ? null : target;

                                     // Face target if explicit
                                     if (finalTarget && finalTarget.x !== undefined) { // Check if object
                                         const dx = Math.sign(finalTarget.x - actor.x); const dy = Math.sign(finalTarget.y - actor.y);
                                         if (dx !== 0 || dy !== 0) actor.direction = {x: dx, y: dy};
                                     }

                                         // If skill is AOE (e.g. circle), even if we selected a target for inspection, we want to hit the area.
                                         // Passing null forces BattleManager to calculate targets based on shape.
                                         if (s.type === 'circle' || s.type === 'cone') {
                                             finalTarget = null;
                                         }
                                         $gameMap.processTurn(0, 0, () => BattleManager.executeSkill(actor, k, finalTarget));
                                     } else {
                                         // Cancelled (implicit in updateTargeting but safety here if callback called with null)
                                         // Actually cancel handles its own focus restore in updateTargeting.
                                         // But if we return here with null...
                                     }
                                 });
                             }
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
                        // Show description in help window instead of tooltip
                        $gameSystem.ui.showHelp(`<b>${skill.name}</b>: ${skill.desc(actor)}`);
                    }
                },
                onMouseLeave: () => {
                    if (skill) {
                        Renderer.clearPreviewOverride();
                        $gameSystem.ui.clearHelp();
                    }
                }
            }
        };
    }
}
