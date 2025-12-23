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
            children.push(this.createCommand(
                s.name,
                `${s.cost}PE`,
                () => {
                    if (!$gameSystem.isBusy) $gameMap.processTurn(0, 0, () => BattleManager.executeSkill(actor, k));
                    // Note: original code called processTurn AND executeSkill immediately?
                    // Original: $gameMap.processTurn(0,0,()=>BattleManager.executeSkill(actor, k));
                    // BattleManager.executeSkill(actor, k);
                    // This looks like double execution in original code?
                    // Ah, processTurn takes a callback.
                    // But then it calls executeSkill AGAIN outside?
                    // Wait, looking at src/windows.js original:
                    // if(!$gameSystem.isBusy) $gameMap.processTurn(0,0,()=>BattleManager.executeSkill(actor, k));
                    // BattleManager.executeSkill(actor, k);
                    // That implies if NOT busy, do turn+skill. If BUSY, do skill immediately?
                    // That seems wrong.
                    // Let's assume processTurn is the correct path for action.
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
                         // Smart Targeting Logic
                         if (skill && (skill.type === 'line' || skill.type === 'cone' || skill.type === 'target')) {
                            // Check current direction first
                            const currentTiles = $gameMap.getTilesInShape(actor.x, actor.y, skill.type, skill.range, actor.direction);
                            const hasTargets = $gameMap.enemies.some(e => currentTiles.some(t => t.x === e.x && t.y === e.y));

                            if (!hasTargets) {
                                // Scan other directions
                                const dirs = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
                                for (let d of dirs) {
                                    if (d.x === actor.direction.x && d.y === actor.direction.y) continue;
                                    const tiles = $gameMap.getTilesInShape(actor.x, actor.y, skill.type, skill.range, d);
                                    if ($gameMap.enemies.some(e => tiles.some(t => t.x === e.x && t.y === e.y))) {
                                        actor.direction = d; // Auto-turn
                                        break;
                                    }
                                }
                            }
                         }
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
