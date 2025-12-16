// ============================================================================
// MAP GENERATORS
// ============================================================================

/**
 * Base class for all Map Generators.
 * Defines the interface for generating level data.
 */
class MapGenerator {
    /**
     * @param {number} width - Map width.
     * @param {number} height - Map height.
     * @param {Object} config - Configuration object.
     */
    constructor(width, height, config = {}) {
        this.width = width;
        this.height = height;
        this.config = config;
        this.tiles = [];
        this.rooms = [];
        this.startPos = { x: 1, y: 1 };
        this.endPos = { x: 1, y: 1 };
    }

    /**
     * Generates the map.
     * @returns {Object} Result containing tiles, rooms, startPos, endPos.
     */
    generate() {
        // Initialize blank map (1 = wall)
        this.tiles = Array(this.width).fill(0).map(() => Array(this.height).fill(1));
        this.run();
        return {
            tiles: this.tiles,
            rooms: this.rooms,
            startPos: this.startPos,
            endPos: this.endPos
        };
    }

    /**
     * The core generation logic. Override this.
     */
    run() {
        // Default implementation: Empty room
        this.fillRegion(1, 1, this.width - 2, this.height - 2, 0);
    }

    fillRegion(x, y, w, h, tileId) {
        for (let ix = x; ix < x + w; ix++) {
            for (let iy = y; iy < y + h; iy++) {
                if (this.isValid(ix, iy)) this.tiles[ix][iy] = tileId;
            }
        }
    }

    isValid(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}

/**
 * Standard BSP/Room-Tunnel Generator (Original Logic Refined).
 */
class DungeonGenerator extends MapGenerator {
    run() {
        const roomCount = this.config.rooms || 10;
        const minSize = this.config.minRoomSize || 4;
        const maxSize = this.config.maxRoomSize || 8;

        for (let i = 0; i < roomCount; i++) {
            const w = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));
            const h = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));
            const x = Math.floor(Math.random() * (this.width - w - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - h - 2)) + 1;

            let overlap = false;
            // Pad collision check by 1 to prevent merged walls unless desired
            for (let r of this.rooms) {
                if (x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y) {
                    overlap = true;
                    break;
                }
            }

            if (!overlap) {
                const room = { x, y, w, h, cx: Math.floor(x + w / 2), cy: Math.floor(y + h / 2) };
                this.rooms.push(room);
                this.fillRegion(x, y, w, h, 0);

                if (this.rooms.length > 1) {
                    const prev = this.rooms[this.rooms.length - 2];
                    this.carveTunnel(prev.cx, prev.cy, room.cx, room.cy);
                }
            }
        }

        if (this.rooms.length > 0) {
            this.startPos = { x: this.rooms[0].cx, y: this.rooms[0].cy };
            this.endPos = { x: this.rooms[this.rooms.length - 1].cx, y: this.rooms[this.rooms.length - 1].cy };
        }
    }

    carveTunnel(x1, y1, x2, y2) {
        if (Math.random() < 0.5) {
            this.hTunnel(x1, x2, y1);
            this.vTunnel(y1, y2, x2);
        } else {
            this.vTunnel(y1, y2, x1);
            this.hTunnel(x1, x2, y2);
        }
    }

    hTunnel(x1, x2, y) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            if (this.isValid(x, y)) this.tiles[x][y] = 0;
        }
    }

    vTunnel(y1, y2, x) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            if (this.isValid(x, y)) this.tiles[x][y] = 0;
        }
    }
}

/**
 * Cellular Automata Generator for Caves.
 */
class CaveGenerator extends MapGenerator {
    run() {
        // Initialize with noise
        const chance = this.config.density || 0.45;
        for (let x = 1; x < this.width - 1; x++) {
            for (let y = 1; y < this.height - 1; y++) {
                if (Math.random() < chance) this.tiles[x][y] = 1; // Wall
                else this.tiles[x][y] = 0; // Floor
            }
        }

        // Automata steps
        const steps = 4;
        for (let i = 0; i < steps; i++) {
            this.doSimulationStep();
        }

        // Post-process: Find valid locations
        const openSpots = [];
        for (let x = 1; x < this.width - 1; x++) {
            for (let y = 1; y < this.height - 1; y++) {
                if (this.tiles[x][y] === 0) openSpots.push({x, y});
            }
        }

        if (openSpots.length > 0) {
            this.startPos = openSpots[Math.floor(Math.random() * openSpots.length)];
            this.endPos = openSpots[Math.floor(Math.random() * openSpots.length)];

            // Basic guarantee: Dig a straight line if needed.
            // For now, assume large enough cave is connected.
        } else {
            // Fallback
             this.fillRegion(1, 1, 3, 3, 0);
             this.startPos = {x: 2, y: 2};
             this.endPos = {x: 2, y: 2};
        }
    }

    doSimulationStep() {
        const newTiles = this.tiles.map(arr => [...arr]);
        for (let x = 1; x < this.width - 1; x++) {
            for (let y = 1; y < this.height - 1; y++) {
                const n = this.countAliveNeighbors(x, y);
                if (this.tiles[x][y] === 1) {
                    if (n < 4) newTiles[x][y] = 0;
                    else newTiles[x][y] = 1;
                } else {
                    if (n > 5) newTiles[x][y] = 1;
                    else newTiles[x][y] = 0;
                }
            }
        }
        this.tiles = newTiles;
    }

    countAliveNeighbors(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nx = x + i, ny = y + j;
                if (this.isValid(nx, ny) && this.tiles[nx][ny] === 1) count++;
            }
        }
        return count;
    }
}
