// ============================================================================
// WINDOW: TACTICS
// ============================================================================

class Window_Tactics extends Window_Base {
    constructor() {
        super('cmd', {bottom:'2%', left:'2%', width:'20%', height:'44%'}, "TACTICS");
        this.show();
    }

    defineLayout() {
        if (!$gameParty || !$gameParty.active()) return null; // Safety
        const actor = $gameParty.active();

        const children = [];

        // Standard Commands
        children.push(this.createCommand("WAIT", "", () => $gameMap.processTurn(0,0)));
        children.push(this.createCommand("ITEM", "", () => $gameSystem.ui.showInventoryModal()));
        children.push({ component: Separator });

        // Skills
        actor.skills.forEach(k => {
            const s = $dataSkills[k];
            const disabled = actor.pe < s.cost;

            // SubLabel styling
            let costLabel = `${s.cost} PE`;
            if (disabled) {
                 costLabel = `<span style="color:var(--c-accent-warn)">${s.cost} PE</span>`;
            } else {
                 costLabel = `<span style="color:var(--c-accent-main)">${s.cost} PE</span>`;
            }

            children.push(this.createCommand(
                s.name,
                costLabel,
                () => {
                    if (!$gameSystem.isBusy) $gameMap.processTurn(0, 0, () => BattleManager.executeSkill(actor, k));
                },
                disabled,
                s,
                actor
            ));
        });

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
                        Renderer.showRange(skill);
                        // Tooltip styling uses HTML, so we can use classes/vars there too if we update tooltip logic,
                        // but currently it's hardcoded inline or in style.css.
                        // style.css has #tooltip b { color: var(--c-accent-gold) } so we are good.
                        $gameSystem.ui.showTooltip(e, `<b>${skill.name}</b><br>${skill.desc(actor)}`);
                    }
                },
                onMouseLeave: () => {
                    if (skill) {
                        Renderer.clearRange();
                        $gameSystem.ui.hideTooltip();
                    }
                }
            }
        };
    }
}
