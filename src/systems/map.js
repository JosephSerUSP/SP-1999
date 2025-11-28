import { $dataFloors, $dataEnemies } from '../data/data.js';
import { Game_Enemy } from './entities.js';
import { ItemManager } from './items.js';
import { BattleManager } from './battle.js';
import { Sequencer } from './system.js';

/**
 * Manages the game map, level generation, and entity placement.
 */
export class Game_Map {
    /**
     * Creates an instance of Game_Map.
     * @param {Game_System} gameSystem - Reference to Game_System.
     * @param {Game_Party} gameParty - Reference to Game_Party.
     */
    constructor(gameSystem, gameParty) {
        this.gameSystem = gameSystem;
        this.gameParty = gameParty;
        this.width = 20;
        this.height = 20;
        this.tiles = [];
        this.enemies = [];
        this.loot = [];
        this.playerX = 1;
        this.playerY = 1;
        this.enemyIdCounter = 0;
        this.stairsX = 0;
        this.stairsY = 0;
    }

    /**
     * Sets up a new floor.
     * @param {number} floor - The floor level to generate.
     * @returns {Object} Events generated during setup.
     */
    setup(floor) {
        this.gameSystem.floor = floor;
        this.gameSystem.log(`>> SECTOR ${floor}`);
        const c = $dataFloors[floor] || $dataFloors.default;
        this.width = c.width; this.height = c.height;
        this.tiles = Array(this.width).fill(0).map(()=>Array(this.height).fill(1));
        const rooms = [];
        for(let i=0; i<c.rooms; i++) {
            const w = 4+Math.floor(Math.random()*5), h = 4+Math.floor(Math.random()*5);
            const x = Math.floor(Math.random()*(this.width-w-2))+1, y = Math.floor(Math.random()*(this.height-h-2))+1;
            let ov = false;
            for(let r of rooms) if(x<r.x+r.w+1 && x+w+1>r.x && y<r.y+r.h+1 && y+h+1>r.y) { ov = true; break; }
            if(!ov) {
                rooms.push({x,y,w,h,cx:Math.floor(x+w/2), cy:Math.floor(y+h/2)});
                for(let rx=x; rx<x+w; rx++) for(let ry=y; ry<y+h; ry++) this.tiles[rx][ry] = 0;
                if(rooms.length > 1) this.carveTunnel(rooms[rooms.length-2].cx, rooms[rooms.length-2].cy, rooms[rooms.length-1].cx, rooms[rooms.length-1].cy);
            }
        }
        if(rooms.length > 0) {
            this.playerX = rooms[0].cx; this.playerY = rooms[0].cy;
            this.stairsX = rooms[rooms.length-1].cx; this.stairsY = rooms[rooms.length-1].cy;
            this.tiles[this.stairsX][this.stairsY] = 3;
        }
        this.enemies = []; this.loot = [];
        for(let i=0; i<c.enemies+floor; i++) {
            const pt = this.getRandomPoint();
            if(pt) this.enemies.push(new Game_Enemy($dataEnemies[Math.floor(Math.random()*$dataEnemies.length)], pt.x, pt.y, this.enemyIdCounter++, 10+floor*2));
        }
        for(let i=0; i<c.loot; i++) {
            const pt = this.getRandomPoint();
            if(pt) this.loot.push({x: pt.x, y: pt.y, item: ItemManager.generateLoot(floor)});
        }

        return {
            type: 'mapSetup',
            floor: floor,
            cutscene: c.cutscene
        };
    }

    /**
     * Gets a random empty point on the map.
     * @returns {Object|null} An object with x and y coordinates, or null if failed.
     */
    getRandomPoint() {
        for(let i=0; i<200; i++) {
            const x = Math.floor(Math.random()*this.width), y = Math.floor(Math.random()*this.height);
            if(this.tiles[x][y] === 0 && (x!==this.playerX || y!==this.playerY) && (x!==this.stairsX || y!==this.stairsY)) return {x,y};
        }
        return null;
    }

    /**
     * Carves a tunnel between two points.
     * @param {number} x1 - Start x.
     * @param {number} y1 - Start y.
     * @param {number} x2 - End x.
     * @param {number} y2 - End y.
     */
    carveTunnel(x1,y1,x2,y2) {
        if(Math.random()<0.5) { this.hTunnel(x1,x2,y1); this.vTunnel(y1,y2,x2); } else { this.vTunnel(y1,y2,x1); this.hTunnel(x1,x2,y2); }
    }

    /**
     * Carves a horizontal tunnel.
     * @param {number} x1 - Start x.
     * @param {number} x2 - End x.
     * @param {number} y - Y coordinate.
     */
    hTunnel(x1,x2,y) { for(let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++) if(this.isValid(x,y)) this.tiles[x][y]=0; }

    /**
     * Carves a vertical tunnel.
     * @param {number} y1 - Start y.
     * @param {number} y2 - End y.
     * @param {number} x - X coordinate.
     */
    vTunnel(y1,y2,x) { for(let y=Math.min(y1,y2); y<=Math.max(y1,y2); y++) if(this.isValid(x,y)) this.tiles[x][y]=0; }

    /**
     * Checks if a coordinate is valid.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {boolean} True if valid.
     */
    isValid(x,y) { return x>=0 && x<this.width && y>=0 && y<this.height && this.tiles[x] !== undefined; }

    /**
     * Processes a game turn based on player movement.
     * @param {number} dx - Change in x.
     * @param {number} dy - Change in y.
     * @returns {Promise<Array>} List of events.
     */
    async processTurn(dx, dy) {
        if(this.gameSystem.isInputBlocked) return [];

        const events = [];

        // This check should be done by the caller (Main loop), but we keep it here for logic consistency if needed.
        // But since we are returning events, the caller should handle the "isAnimating" check before calling this.
        // Assuming caller checks Renderer state.

        const nx = this.playerX + dx; const ny = this.playerY + dy;
        if(this.tiles[nx][ny] === 1) return events;

        const enemy = this.enemies.find(e => e.x === nx && e.y === ny);
        if(enemy) {
            if(this.gameSystem.isBusy) return events;
            this.gameSystem.isBusy = true;
            const actor = this.gameParty.active();
            const dmg = BattleManager.calcDamage(actor, enemy);
            enemy.takeDamage(dmg);

            events.push({ type: 'playerAttack', tx: nx, ty: ny });
            await Sequencer.sleep(150);

            events.push({ type: 'floatText', text: dmg, x: nx, y: ny, color: "#fff" });
            events.push({ type: 'hitEffect', uid: enemy.uid });
            await Sequencer.sleep(200);

            this.gameSystem.log(`Hit ${enemy.name} for ${dmg}.`);
            if(enemy.hp <= 0) {
                await this.killEnemy(enemy, events);
            }

            this.gameParty.rotate();
            events.push({ type: 'uiRefresh' });

            const enemyEvents = await this.updateEnemies();
            events.push(...enemyEvents);

            this.gameSystem.isBusy = false;
        } else {
            // TRIGGER VISUAL SWAP
            events.push({
                type: 'playerMove',
                fromX: this.playerX, fromY: this.playerY,
                toX: nx, toY: ny,
                nextColor: this.gameParty.nextActive().color
            });
            this.playerX = nx; this.playerY = ny;

            const itemIdx = this.loot.findIndex(i => i.x === nx && i.y === ny);
            if(itemIdx > -1) {
                this.gameParty.gainItem(this.loot[itemIdx].item);
                events.push({ type: 'itemGet', x: nx, y: ny });
                this.loot.splice(itemIdx, 1);
                events.push({ type: 'syncLoot' });
            }

            if(this.tiles[nx][ny] === 3) {
                this.gameSystem.log("Ascending...");
                events.push({ type: 'ascend' });
                this.gameSystem.isInputBlocked = true;
                // Wait slightly more for dramatic effect before logic switch
                await Sequencer.sleep(4000);
                this.gameSystem.isInputBlocked = false;

                const setupEvents = this.setup(this.gameSystem.floor + 1);
                // Need to merge setup events
                return [setupEvents];
            }

            this.gameParty.rotate();
            events.push({ type: 'uiRefresh' });
            const enemyEvents = await this.updateEnemies();
            events.push(...enemyEvents);
        }
        return events;
    }

    /**
     * Updates enemy positions and actions.
     * @returns {Promise<Array>} List of events.
     */
    async updateEnemies() {
        const events = [];
        for(const e of this.enemies) {
            const dist = Math.abs(e.x - this.playerX) + Math.abs(e.y - this.playerY);
            if(dist < 7) e.alerted = true;
            if(e.alerted) {
                let dx = 0, dy = 0;
                if(e.ai === "hunter" || e.ai === "ambush") {
                    dx = Math.sign(this.playerX - e.x); dy = Math.sign(this.playerY - e.y);
                    if(Math.random() < 0.5 && dx !== 0) dy = 0; else if(dy !== 0) dx = 0;
                }
                const nx = e.x + dx; const ny = e.y + dy;
                if(nx === this.playerX && ny === this.playerY) {
                    const target = this.gameParty.active();
                    const dmg = BattleManager.calcDamage(e, target);
                    target.takeDamage(dmg);

                    events.push({ type: 'enemyAttack', uid: e.uid, tx: nx, ty: ny });
                    events.push({ type: 'floatText', text: dmg, x: this.playerX, y: this.playerY, color: "#f00" });
                    events.push({ type: 'hitEffect', uid: 'player' });
                } else if(this.tiles[nx][ny] === 0 && !this.enemies.find(en => en.x === nx && en.y === ny)) {
                    e.x = nx; e.y = ny;
                    events.push({ type: 'syncEnemies' });
                }
            }
        }
        return events;
    }

    /**
     * Handles the death of an enemy.
     * @param {Game_Enemy} enemy - The enemy to kill.
     * @param {Array} events - Event list to append to.
     */
    async killEnemy(enemy, events) {
        events.push({ type: 'enemyDie', uid: enemy.uid });
        await Sequencer.sleep(300);
        this.enemies = this.enemies.filter(e => e !== enemy);
        this.gameParty.distributeExp(enemy.exp);
        this.gameSystem.log(`${enemy.name} dissolved.`);
        events.push({ type: 'syncEnemies' });
    }
}
