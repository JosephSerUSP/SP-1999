
class Window_EnemyInfo extends Window_Base {
    constructor() {
        // Positioned Top-Right of the Center Viewport (Window_View)
        // Window_View is left:23%, width:54% => Right edge is 77%.
        // We want this inside that area, top right.
        // Let's position it absolute on the screen but aligned to that visual area.
        super('win-enemy-info', {
            position: 'absolute',
            top: '4%',
            left: '60%', // 23% + 54% - 16% (width) - 1% (padding) approx?
            right: 'auto', // Use left/top for stability or relative to right edge of screen?
            // Actually, let's use right: 24% (100 - 77 + 1)
            right: '24%',
            left: 'auto',
            width: '200px',
            height: 'auto',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #444',
            padding: '10px',
            pointerEvents: 'none', // Don't block clicks
            zIndex: 50,
            display: 'none',
            flexDirection: 'column'
        }, null);

        this.targets = [];
        this.currentTargetIndex = 0;
        this.lockedTarget = null;
        this.lockTimer = 0;

        // Custom Styles
        this.el.style.borderRadius = '4px';

        this.selectedTarget = null; // Specifically selected by cursor
        this.initEvents();
    }

    initEvents() {
        EventBus.on('targets_updated', (targets) => this.onTargetsUpdated(targets));
        EventBus.on('targets_cleared', () => this.onTargetsCleared());
        EventBus.on('enemy_affected', (data) => this.onEnemyAffected(data));
        EventBus.on('target_selected', (target) => this.onTargetSelected(target));
    }

    update() {
        // Handle Timer
        if (this.lockTimer > 0) {
            this.lockTimer -= 16; // Approx 1 frame
            if (this.lockTimer <= 0) {
                this.lockedTarget = null;
                // If no current targets from range, hide
                if (this.targets.length === 0) {
                    this.hide();
                } else {
                    this.refresh();
                }
            }
        }

        // Handle Cycling Input
        if (this.visible && this.targets.length > 1 && !this.lockedTarget && !this.selectedTarget) {
             if (InputManager.isTriggered('CYCLE')) {
                 this.cycleTarget();
            }
        }
    }

    cycleTarget() {
        if (this.targets.length <= 1) return;
        this.currentTargetIndex = (this.currentTargetIndex + 1) % this.targets.length;
        this.refresh();
    }

    onTargetSelected(target) {
        this.selectedTarget = target;
        this.show();
    }

    onTargetsUpdated(targets) {
        if (this.lockedTarget) return; // Don't override locked display (e.g. taking damage)

        // Compare new targets to old to avoid unnecessary refreshes?
        const newIds = targets.map(t => t.uid).join(',');
        const oldIds = this.targets.map(t => t.uid).join(',');

        this.targets = targets;

        // If we have a selected target, ensure it is still valid
        if (this.selectedTarget) {
            if (!targets.find(t => t.uid === this.selectedTarget.uid)) {
                this.selectedTarget = null;
            }
        }

        if (newIds !== oldIds || this.selectedTarget) {
            this.currentTargetIndex = 0;
            if (targets.length > 0) {
                this.show();
            } else {
                this.hide();
            }
        }
    }

    onTargetsCleared() {
        this.targets = [];
        this.selectedTarget = null;
        if (!this.lockedTarget) {
            this.hide();
        }
    }

    onEnemyAffected(data) {
        // data: { target: Game_Enemy, duration: number }
        this.lockedTarget = data.target;
        this.lockTimer = data.duration || 2000;
        this.show();
    }

    defineLayout() {
        const target = this.lockedTarget || this.selectedTarget || this.targets[this.currentTargetIndex];
        if (!target) return null;

        const isMultiple = this.targets.length > 1 && !this.lockedTarget && !this.selectedTarget;

        // Calculate HP Pct
        const hpPct = Math.floor((target.hp / target.mhp) * 100);
        let hpColor = '#0f0';
        if (hpPct < 50) hpColor = '#ff0';
        if (hpPct < 25) hpColor = '#f00';

        const statesText = target.states.map(s => `<span style="color:#ff0; margin-right:4px;">[${s.name}]</span>`).join('');

        // Check for specific weaknesses/traits (stubbed)
        const weaknessText = target.weakness ? `<div style="color:#f88; font-size:12px;">Weak: ${target.weakness.join(', ')}</div>` : '';

        // Drops (stubbed)
        const dropsText = target.drops ? `<div style="color:#ccc; font-size:10px;">Drops: ${target.drops.join(', ')}</div>` : '';

        const multipleHint = isMultiple ? `<div style="font-size:10px; color:#888; margin-top:4px;">[SHIFT] Next Target (${this.currentTargetIndex+1}/${this.targets.length})</div>` : '';

        return {
            type: 'container',
            layout: new FlexLayout({ direction: 'column', gap: '4px' }),
            children: [
                {
                    type: 'container',
                    props: { html: `<div style="font-weight:bold; color:${'#'+target.color.toString(16)}; border-bottom:1px solid #333; padding-bottom:2px;">${target.name}</div>` }
                },
                {
                    type: 'container',
                    props: {
                        html: `
                        <div style="width:100%; height:6px; background:#222; margin-bottom:2px; margin-top:4px;">
                            <div style="width:${hpPct}%; height:100%; background:${hpColor}; transition: width 0.3s;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:12px;">
                            <span>HP ${target.hp}/${target.mhp}</span>
                            <span>Lv.${Math.floor(target.exp/2)}</span>
                        </div>
                        `
                    }
                },
                {
                    type: 'container',
                    props: { html: `<div style="font-size:11px;">${statesText}</div>` }
                },
                {
                    type: 'container',
                    props: { html: weaknessText }
                },
                 {
                    type: 'container',
                    props: { html: dropsText }
                },
                 {
                    type: 'container',
                    props: { html: multipleHint }
                }
            ]
        };
    }
}
