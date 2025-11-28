import { $dataSkills } from '../data/data.js';
import { Sequencer } from './system.js';

/**
 * Manages battle mechanics and skill execution.
 */
export class BattleManager {
    /**
     * Calculates damage between a source and a target.
     * @param {Object} source - The attacker.
     * @param {Object} target - The defender.
     * @returns {number} The calculated damage.
     */
    static calcDamage(source, target) {
        let atk = source.getAtk ? source.getAtk() : source.atk;
        let def = target.getDef ? target.getDef() : (target.def || 0);
        const variation = 0.8 + Math.random() * 0.4;
        let dmg = Math.floor((atk * 2 - def) * variation);
        return Math.max(1, dmg);
    }

    /**
     * Executes a skill by an actor.
     * @param {Game_Actor} a - The actor using the skill.
     * @param {string} k - The key/ID of the skill.
     * @param {Game_Map} gameMap - Reference to Game_Map.
     * @param {Game_System} gameSystem - Reference to Game_System.
     * @returns {Promise<Array>} Resolves to list of events.
     */
    static async executeSkill(a, k, gameMap, gameSystem) {
        const events = [];
        const s = $dataSkills[k];
        if(a.pe < s.cost) { gameSystem.log("No PE."); return events; }
        a.pe -= s.cost; gameSystem.log(`${a.name} uses ${s.name}!`);

        events.push({ type: 'flash', color: a.color });
        await Sequencer.sleep(300);
        const baseDmg = s.fixed ? s.power : Math.floor(a.getAtk() * s.power);

        if(k === 'rapid') {
            const tgts = gameMap.enemies.filter(e => Math.abs(e.x - gameMap.playerX) + Math.abs(e.y - gameMap.playerY) < s.range);
            if(tgts.length > 0) {
                for(let i=0; i<2; i++) {
                    const t = tgts[Math.floor(Math.random()*tgts.length)];
                    t.takeDamage(baseDmg);
                    events.push({
                        type: 'projectile',
                        x1: gameMap.playerX, y1: gameMap.playerY,
                        x2: t.x, y2: t.y,
                        color: a.color
                    });
                    await Sequencer.sleep(200);

                    events.push({ type: 'floatText', text: baseDmg, x: t.x, y: t.y, color: "#fff" });
                    events.push({ type: 'hitEffect', uid: t.uid });

                    if(t.hp <= 0) await gameMap.killEnemy(t, events);
                    await Sequencer.sleep(300);
                }
            }
        } else if(s.type === 'all_enemies') {
            const dead = [];
            gameMap.enemies.forEach(e => {
                e.takeDamage(baseDmg);
                events.push({ type: 'floatText', text: baseDmg, x: e.x, y: e.y, color: "#f40" });
                events.push({ type: 'hitEffect', uid: e.uid });
                if(e.hp <= 0) dead.push(e);
            });
            events.push({ type: 'shake' });
            for (const e of dead) {
                await gameMap.killEnemy(e, events);
            }
        } else if(s.type === 'target') {
            const tgts = gameMap.enemies.filter(e => Math.abs(e.x - gameMap.playerX) + Math.abs(e.y - gameMap.playerY) < s.range);
            if(tgts.length > 0) {
                const t = tgts[0]; t.takeDamage(baseDmg);
                events.push({
                    type: 'projectile',
                    x1: gameMap.playerX, y1: gameMap.playerY,
                    x2: t.x, y2: t.y,
                    color: a.color
                });
                events.push({ type: 'floatText', text: baseDmg, x: t.x, y: t.y, color: "#f00" });

                if(k==='drain') {
                    a.heal(baseDmg);
                    events.push({ type: 'floatText', text: "+"+baseDmg, x: gameMap.playerX, y: gameMap.playerY, color: "#0f0" });
                }

                if(t.hp <= 0) await gameMap.killEnemy(t, events);
            }
        }
        await Sequencer.sleep(500);
        events.push({ type: 'uiRefresh' });
        return events;
    }
}
