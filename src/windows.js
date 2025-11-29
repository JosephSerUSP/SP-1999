// ============================================================================
// WINDOWS (UI)
// ============================================================================

/**
 * Represents a single UI window.
 */
class UI_Window {
    /**
     * Creates a new UI Window.
     * @param {string} id - HTML ID for the window.
     * @param {Object} rect - Style object defining position and size.
     * @param {string} [title] - Optional title for the header.
     */
    constructor(id, rect, title) {
        this.el = document.createElement('div'); this.el.className = 'pe-window';
        Object.assign(this.el.style, rect);
        if(title) { const h = document.createElement('div'); h.className = 'pe-header'; h.innerText = title; this.el.appendChild(h); }
        this.content = document.createElement('div'); this.content.className = 'pe-content';
        this.el.appendChild(this.content); document.getElementById('ui-root').appendChild(this.el);
    }

    /**
     * Clears the content of the window.
     */
    clear() { this.content.innerHTML = ''; }
}

/**
 * Manages all UI windows and interactions.
 */
class UIManager {
    /**
     * Creates an instance of UIManager.
     */
    constructor() {
        this.windows = {};
        this.createLayout();
        this.initEvents();
    }

    initEvents() {
        EventBus.on('log_updated', () => this.refreshLog());
        EventBus.on('refresh_ui', () => this.refresh());
        EventBus.on('refresh_minimap', () => this.refreshMinimap());
        EventBus.on('float_text', (t,x,y,c) => this.floatText(t,x,y,c));
    }

    /**
     * Creates the initial UI layout.
     */
    createLayout() {
        this.windows.status = new UI_Window('status', {top:'2%', left:'2%', width:'20%', height:'50%'}, "SQUADRON");
        this.windows.cmd = new UI_Window('cmd', {bottom:'2%', left:'2%', width:'20%', height:'44%'}, "TACTICS");
        this.windows.minimap = new UI_Window('minimap', {top:'2%', right:'2%', width:'20%', height:'0'}, "MINIMAP");
        const mmW = this.windows.minimap.el.clientWidth;
        this.windows.minimap.el.style.height = mmW + 'px';
        const cvs = document.createElement('canvas'); cvs.id = 'minimap-canvas'; cvs.width = 128; cvs.height = 128;
        this.windows.minimap.content.appendChild(cvs);
        this.windows.minimap.content.style.padding = '0';
        this.windows.minimap.content.style.overflow = 'auto';

        this.windows.log = new UI_Window('log', {top:`calc(2% + ${mmW + 8}px)`, right:'2%', width:'20%', bottom:'2%'}, "SYSTEM LOG");
        this.windows.view = new UI_Window('view', {top:'2%', left:'23%', width:'54%', height:'96%'}, "OPTICAL FEED");
        this.windows.view.content.id = 'game-view-container';
        this.windows.view.content.style.padding = '0';
        this.windows.view.content.style.background = '#000';
        this.windows.view.content.style.display = 'flex';
        this.windows.view.content.style.alignItems = 'center';
        this.windows.view.content.style.justifyContent = 'center';
    }

    /**
     * Refreshes all UI components.
     */
    refresh() { this.refreshStatus(); this.refreshCmd(); this.refreshLog(); this.refreshMinimap(); }

    /**
     * Redraws the minimap.
     */
    refreshMinimap() {
        const c = document.getElementById('minimap-canvas');
        if(!c) return;
        const ts = 4; // Tile Size
        c.width = $gameMap.width * ts;
        c.height = $gameMap.height * ts;
        c.style.width = c.width + "px";
        c.style.height = c.height + "px";

        const ctx = c.getContext('2d');
        ctx.fillStyle = "#000"; ctx.fillRect(0,0,c.width,c.height);

        for(let x=0; x<$gameMap.width; x++) {
            for(let y=0; y<$gameMap.height; y++) {
                if(!$gameMap.visited || !$gameMap.visited[x] || !$gameMap.visited[x][y]) continue;
                const t = $gameMap.tiles[x][y];
                if(t === 1) continue;
                else if(t === 3) { ctx.fillStyle = "#0f0"; ctx.fillRect(x*ts, y*ts, ts, ts); }
                else { ctx.fillStyle = "#222"; ctx.fillRect(x*ts, y*ts, ts, ts); }
            }
        }
        $gameMap.enemies.forEach(e => {
            const dist = Math.abs(e.x - $gameMap.playerX) + Math.abs(e.y - $gameMap.playerY);
            if(dist < 8) {
                ctx.fillStyle = "#f00";
                ctx.shadowColor = "#f00"; ctx.shadowBlur = 4;
                ctx.fillRect(e.x*ts, e.y*ts, ts, ts);
                ctx.shadowBlur = 0;
            }
        });
        ctx.fillStyle = "#0ff"; ctx.fillRect($gameMap.playerX*ts, $gameMap.playerY*ts, ts, ts);

        // Auto scroll to player
        const mm = this.windows.minimap.content;
        const px = $gameMap.playerX * ts;
        const py = $gameMap.playerY * ts;
        mm.scrollTop = py - mm.clientHeight / 2;
        mm.scrollLeft = px - mm.clientWidth / 2;
    }

    /**
     * Refreshes the squad status window.
     */
    refreshStatus() {
        const w = this.windows.status; w.clear();
        $gameParty.members.forEach((m, i) => {
            const active = i === $gameParty.index;
            const div = document.createElement('div'); div.className = `party-slot ${active ? 'active' : ''}`;
            div.onclick = () => { if(!$gameSystem.isBusy && !$gameSystem.isInputBlocked) this.showStatusModal(m); };
            const pct = (m.hp / m.mhp) * 100;
            const pePct = (m.pe / m.mpe) * 100;
            const expPct = (m.exp / m.nextExp) * 100;
            const clr = pct < 30 ? 'var(--pe-red)' : pct < 60 ? 'var(--pe-gold)' : 'var(--pe-green)';
            div.innerHTML = `<div style="color:#${m.color.toString(16)}; width:20px; font-weight:bold;">${m.name[0]}</div>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between;"><span>${m.name}</span><span style="color:${clr}">${m.hp}/${m.mhp}</span></div>
                    <div style="height:4px; bg:#333; margin-top:2px;"><div style="width:${pct}%; height:100%; background:${clr};"></div></div>
                    <div style="height:2px; bg:#222; margin-top:2px;"><div style="width:${pePct}%; height:100%; background:var(--pe-cyan);"></div></div>
                    <div style="height:1px; bg:#111; margin-top:2px; width:100%; display:flex;"><div style="width:${expPct}%; height:100%; background:#888;"></div></div>
                </div>`;
            w.content.appendChild(div);
        });
    }

    /**
     * Refreshes the command window.
     */
    refreshCmd() {
        const w = this.windows.cmd; w.clear();
        const actor = $gameParty.active();
        const btn = (t, s, cb, dis, sk) => {
            const b = document.createElement('div'); b.className = `cmd-btn ${dis?'disabled':''}`;
            b.innerHTML = `<span>${t}</span><span style="font-size:10px; color:#666;">${s}</span>`;
            b.onclick = () => { if(!$gameSystem.isBusy && !$gameSystem.isInputBlocked && !dis) cb(); };
            if(sk) {
                b.onmouseenter = (e) => { Renderer.showRange(sk); this.showTooltip(e, `<b>${sk.name}</b><br>${sk.desc(actor)}`); };
                b.onmouseleave = () => { Renderer.clearRange(); this.hideTooltip(); };
            }
            w.content.appendChild(b);
        };
        btn("WAIT", "", () => $gameMap.processTurn(0,0));
        btn("ITEM", "", () => this.showInventoryModal());
        w.content.appendChild(document.createElement('hr'));
        actor.skills.forEach(k => {
            const s = $dataSkills[k];
            btn(s.name, `${s.cost}PE`, () => {
                if(!$gameSystem.isBusy) $gameMap.processTurn(0,0,()=>BattleManager.executeSkill(actor, k));
                BattleManager.executeSkill(actor, k);
            }, actor.pe < s.cost, s);
        });
    }

    /**
     * Shows a tooltip.
     * @param {Event} e - The mouse event.
     * @param {string} html - HTML content for tooltip.
     */
    showTooltip(e, html) {
        const el = document.getElementById('tooltip'); el.innerHTML = html; el.style.display = 'block';
        el.style.left = (e.clientX + 10) + 'px'; el.style.top = (e.clientY) + 'px';
    }

    /**
     * Hides the tooltip.
     */
    hideTooltip() { document.getElementById('tooltip').style.display = 'none'; }

    /**
     * Refreshes the system log window.
     */
    refreshLog() {
        const w = this.windows.log; w.clear();
        const h = w.content.clientHeight;
        const lineH = 16;
        const lines = Math.floor(h / lineH) - 1;
        $gameSystem.logHistory.slice(0,lines).forEach((t,i) => {
            const d = document.createElement('div'); d.innerText = `> ${t}`;
            d.style.opacity = 1 - i*0.1; d.style.marginBottom='4px'; if(i===0) d.style.color='#fff';
            w.content.appendChild(d);
        });
    }

    /**
     * Displays floating text at a screen location.
     * @param {string|number} t - The text to display.
     * @param {number} x - The map x coordinate.
     * @param {number} y - The map y coordinate.
     * @param {string} c - CSS color string.
     */
    floatText(t, x, y, c) {
        const pos = Renderer.projectToScreen(x, 0.5, y);
        const container = document.createElement('div');
        container.className = 'float-text-container';
        container.style.left = pos.x + 'px';
        container.style.top = pos.y + 'px';
        const chars = t.toString().split('');
        chars.forEach((char, i) => {
            const s = document.createElement('span');
            s.className = 'float-digit';
            s.style.animationDelay = (i * 30) + 'ms';
            s.style.color = c;
            s.innerText = char;
            container.appendChild(s);
        });
        document.getElementById('floating-text-layer').appendChild(container);
        setTimeout(()=>container.remove(), 1200);
    }

    /**
     * Shows the inventory modal window.
     */
    showInventoryModal() {
        $gameSystem.isInputBlocked = true;
        const render = (c) => {
            c.innerHTML = '';
            c.style.display = "flex"; c.style.flexDirection = "column"; c.style.gap = "10px"; c.style.height = "100%";
            const desc = document.createElement('div');
            desc.style.height = "60px"; desc.style.borderBottom = "1px solid #444"; desc.style.marginBottom = "5px"; desc.style.padding = "5px"; desc.style.fontSize = "12px"; desc.style.color = "#aaa"; desc.style.fontStyle = "italic";
            desc.innerText = "Select an item...";
            c.appendChild(desc);
            const body = document.createElement('div');
            body.style.flex = "1"; body.style.display = "flex"; body.style.gap = "10px"; body.style.overflow = "hidden";
            const leftCol = document.createElement('div');
            leftCol.style.flex = "1"; leftCol.style.borderRight = "1px solid #444"; leftCol.style.paddingRight = "5px"; leftCol.style.overflowY = "auto";
            if($gameParty.inventory.length === 0) leftCol.innerHTML = "<div style='color:#666; text-align:center; padding-top:20px;'>Empty</div>";
            $gameParty.inventory.forEach((i, idx) => {
                const r = document.createElement('div'); r.className = 'item-row';
                r.innerHTML = `<span>${i.icon} ${i.name}</span><span style="font-size:10px;color:#666">${i.category.toUpperCase()}</span>`;
                r.onmouseenter = () => desc.innerText = i.desc || "No description.";
                r.onclick = () => {
                    if(i.category === 'item') {
                        this.showTargetSelectModal((t) => {
                            this.showConfirmModal(`Use ${i.name} on ${t.name}?`, () => this.useConsumable(t, i, idx));
                        });
                    } else {
                        this.showTargetSelectModal((t) => { this.equipGear(t, i, idx, () => { render(c); this.refresh(); }); }, i);
                    }
                };
                leftCol.appendChild(r);
            });
            const rightCol = document.createElement('div');
            rightCol.style.flex = "1"; rightCol.style.display = "flex"; rightCol.style.flexDirection = "column"; rightCol.style.gap = "5px"; rightCol.style.overflowY = "auto";
            rightCol.innerHTML = "<div style='text-align:center; color:var(--pe-gold); font-size:10px; margin-bottom:5px;'>SQUAD STATUS</div>";
            $gameParty.members.forEach(m => {
                const box = document.createElement('div');
                box.style.border = "1px solid #333"; box.style.padding = "4px";
                box.innerHTML = `<div style="font-weight:bold; color:#${m.color.toString(16)}; border-bottom:1px solid #222; margin-bottom:2px; display:flex; justify-content:space-between;"><span>${m.name}</span><span style="font-size:9px; color:#999">ATK:${m.getAtk()} DEF:${m.getDef()}</span></div>`;
                const renderEquip = (slot, item) => {
                    const row = document.createElement('div');
                    row.style.fontSize = "10px"; row.style.display = "flex"; row.style.justifyContent = "space-between";
                    row.style.cursor = item ? "pointer" : "default";
                    if(item) {
                        row.innerHTML = `<span>${slot}: ${item.icon} ${item.name}</span>`;
                        row.onclick = () => {
                            if($gameParty.inventory.length < $gameParty.maxInventory) {
                                $gameParty.gainItem(item); m.equip[slot] = null; render(c); this.refresh();
                            } else { alert("Inventory Full!"); }
                        };
                        row.onmouseover = () => row.style.color = "var(--pe-red)"; row.onmouseout = () => row.style.color = "";
                    } else { row.innerHTML = `<span style="color:#444">${slot}: ---</span>`; }
                    return row;
                };
                box.appendChild(renderEquip('weapon', m.equip.weapon)); box.appendChild(renderEquip('armor', m.equip.armor)); rightCol.appendChild(box);
            });
            body.appendChild(leftCol); body.appendChild(rightCol);
            c.appendChild(body);
        };
        this.createModal(`SHARED INVENTORY [${$gameParty.inventory.length}/${$gameParty.maxInventory}]`, render, () => $gameSystem.isInputBlocked=false);
    }

    /**
     * Uses a consumable item on a target.
     * @param {Game_Actor} actor - The target actor.
     * @param {Game_Item} i - The item to use.
     * @param {number} idx - The index of the item in inventory.
     */
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
        $gameParty.inventory.splice(idx, 1);
        this.closeModal(); $gameSystem.isInputBlocked = false; this.refresh(); $gameMap.processTurn(0,0);
    }

    /**
     * Equips gear to an actor.
     * @param {Game_Actor} actor - The target actor.
     * @param {Game_Weapon|Game_Armor} i - The item to equip.
     * @param {number} idx - The index of the item in inventory.
     * @param {Function} cb - Callback to run after equipping.
     */
    equipGear(actor, i, idx, cb) {
        const type = i.category; const current = actor.equip[type];
        actor.equip[type] = i; $gameParty.inventory.splice(idx, 1);
        if(current) $gameParty.gainItem(current);
        $gameSystem.log(`${actor.name} equipped ${i.name}.`);
        cb();
    }

    /**
     * Shows a modal to select a target for an item or skill.
     * @param {Function} callback - Function called with selected actor.
     * @param {Object} [itemPreview] - Optional item for stats preview.
     */
    showTargetSelectModal(callback, itemPreview = null) {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute'; overlay.style.top = '20%'; overlay.style.left = '30%'; overlay.style.width = '40%'; overlay.style.background = 'var(--pe-panel-bg)'; overlay.style.border = '1px solid #444'; overlay.style.zIndex = '150'; overlay.style.padding = '10px';
        overlay.innerHTML = "<div style='color:white; text-align:center; margin-bottom:10px;'>SELECT TARGET</div>";
        $gameParty.members.forEach(m => {
            const btn = document.createElement('div');
            let txt = m.name;
            if(itemPreview) {
                if(itemPreview.category === 'weapon') {
                    const currentAtk = m.getAtk(); const newAtk = m.getAtkWith(itemPreview); const diff = newAtk - currentAtk;
                    const color = diff > 0 ? '#0f0' : (diff < 0 ? '#f00' : '#888');
                    txt += ` (ATK: ${currentAtk} -> <span style='color:${color}'>${newAtk}</span>)`;
                } else if(itemPreview.category === 'armor') {
                    const currentDef = m.getDef(); const newDef = m.getDefWith(itemPreview); const diff = newDef - currentDef;
                    const color = diff > 0 ? '#0f0' : (diff < 0 ? '#f00' : '#888');
                    txt += ` (DEF: ${currentDef} -> <span style='color:${color}'>${newDef}</span>)`;
                }
            }
            btn.innerHTML = txt;
            btn.style.padding = '5px'; btn.style.border = '1px solid #333'; btn.style.marginBottom = '5px'; btn.style.cursor = 'pointer'; btn.style.color = '#'+m.color.toString(16);
            btn.onmouseover = () => btn.style.background = '#333'; btn.onmouseout = () => btn.style.background = '';
            btn.onclick = () => { callback(m); overlay.remove(); };
            overlay.appendChild(btn);
        });
        const cancel = document.createElement('div');
        cancel.innerText = "CANCEL"; cancel.style.color = "#888"; cancel.style.textAlign = "center"; cancel.style.cursor = "pointer"; cancel.style.fontSize = "10px";
        cancel.onclick = () => overlay.remove();
        overlay.appendChild(cancel);
        document.getElementById('ui-root').appendChild(overlay);
    }

    /**
     * Shows a confirmation modal.
     * @param {string} text - The prompt text.
     * @param {Function} onConfirm - Callback if confirmed.
     */
    showConfirmModal(text, onConfirm) {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute'; overlay.style.top = '40%'; overlay.style.left = '35%'; overlay.style.width = '30%'; overlay.style.background = 'var(--pe-panel-bg)'; overlay.style.border = '1px solid #444'; overlay.style.zIndex = '160'; overlay.style.padding = '10px'; overlay.style.textAlign = 'center';
        overlay.innerHTML = `<div style='color:white; margin-bottom:10px;'>${text}</div>`;
        const yes = document.createElement('button'); yes.innerText = "YES"; yes.className = "cmd-btn"; yes.style.display = "inline-block"; yes.style.width = "40%"; yes.style.marginRight = "10px";
        yes.onclick = () => { onConfirm(); overlay.remove(); };
        const no = document.createElement('button'); no.innerText = "NO"; no.className = "cmd-btn"; no.style.display = "inline-block"; no.style.width = "40%";
        no.onclick = () => overlay.remove();
        overlay.appendChild(yes); overlay.appendChild(no);
        document.getElementById('ui-root').appendChild(overlay);
    }

    /**
     * Shows a modal with actor status details.
     * @param {Game_Actor} a - The actor to show.
     */
    showStatusModal(a) {
        $gameSystem.isInputBlocked = true;
        this.createModal(`STATUS: ${a.name}`, (c) => {
            c.innerHTML = `<div style="display:flex; gap:10px; margin-bottom:10px;">
                <div style="width:60px; height:60px; border:1px solid #444; display:flex; align-items:center; justify-content:center; font-size:30px; color:#${a.color.toString(16)}">${a.name[0]}</div>
                <div style="flex:1"><div class="stat-label">JOB: <span class="stat-val">${a.job}</span></div>
                <div class="stat-label">HP: <span class="stat-val" style="color:var(--pe-green)">${a.hp}/${a.mhp}</span></div>
                <div class="stat-label">PE: <span class="stat-val" style="color:var(--pe-red)">${a.pe}/${a.mpe}</span></div></div></div>
                <hr style="border-color:#333; margin:10px 0;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
                <div><div class="stat-label">ATK</div><div style="color:white">${a.getAtk()}</div></div>
                <div><div class="stat-label">DEF</div><div style="color:white">${a.getDef()}</div></div>
                <div><div class="stat-label">EXP</div><div style="color:white">${a.exp}/${a.nextExp}</div></div>
                <div><div class="stat-label">LVL</div><div style="color:white">${a.level}</div></div></div>`;
        }, () => $gameSystem.isInputBlocked=false);
    }

    /**
     * Creates a generic modal window.
     * @param {string} t - Title of the modal.
     * @param {Function} build - Function to build content into the provided element.
     * @param {Function} close - Callback when modal is closed.
     */
    createModal(t, build, close) {
        if(document.getElementById('temp-modal')) document.getElementById('temp-modal').remove();
        const m = document.createElement('div'); m.id='temp-modal'; m.className='pe-window';
        Object.assign(m.style, {left:'20%', top:'10%', width:'60%', height:'80%', zIndex:100});
        m.innerHTML = `<div class="pe-header" style="display:flex; justify-content:space-between;">${t}<span style="cursor:pointer" id="modal-close">X</span></div><div class="pe-content"></div>`;
        build(m.querySelector('.pe-content'));
        document.getElementById('ui-root').appendChild(m);
        m.querySelector('#modal-close').onclick = () => { this.closeModal(); if(close) close(); };
    }

    /**
     * Closes the temporary modal window.
     */
    closeModal() { if(document.getElementById('temp-modal')) document.getElementById('temp-modal').remove(); }
}
