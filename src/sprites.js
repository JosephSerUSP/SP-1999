// ============================================================================
// SPRITES (VIEW)
// ============================================================================

/**
 * Helper to properly dispose of a Three.js object and its children.
 * @param {THREE.Object3D} obj
 */
function disposeHierarchy(obj) {
    if (!obj) return;
    obj.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
            } else {
                child.material.dispose();
            }
        }
    });
}

/**
 * System for managing and rendering particle effects in the 3D scene.
 */
class ParticleSystem {
    /**
     * Creates an instance of ParticleSystem.
     * @param {THREE.Scene} scene - The Three.js scene to add particles to.
     */
    constructor(scene) {
        /**
         * The Three.js scene instance.
         * @type {THREE.Scene}
         */
        this.scene = scene;
        /**
         * Pool of particle objects.
         * @type {Array<Object>}
         */
        this.particles = [];
        const geo = new THREE.PlaneGeometry(0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true });
        for(let i=0; i<50; i++) {
            const p = new THREE.Mesh(geo, mat.clone()); p.visible = false; scene.add(p);
            this.particles.push({ mesh: p, life: 0, velocity: new THREE.Vector3() });
        }
    }

    /**
     * Spawns a radial burst of particles at a specific location.
     * @param {number} x - X coordinate in game world.
     * @param {number} y - Y coordinate in game world.
     * @param {number} color - Hex color for the particles.
     * @param {number} [count=10] - Number of particles to spawn.
     */
    spawnBurst(x, y, color, count=10) {
        let spawned = 0;
        for(let p of this.particles) {
            if(p.life <= 0 && spawned < count) {
                p.mesh.visible = true; p.mesh.position.set(x, 0.5, y);
                p.mesh.material.color.setHex(color); p.mesh.material.opacity = 1;
                const angle = Math.random() * Math.PI * 2; const speed = 0.05 + Math.random() * 0.05;
                p.velocity.set(Math.cos(angle) * speed, (Math.random() * 0.1), Math.sin(angle) * speed);
                p.life = 1.0; spawned++;
            }
        }
    }

    /**
     * Spawns an upward sparkle effect (e.g., for looting).
     * @param {number} x - X coordinate in game world.
     * @param {number} y - Y coordinate in game world.
     */
    spawnSparkle(x, y) {
        let count = 5; let spawned = 0;
        for(let p of this.particles) {
             if(p.life <= 0 && spawned < count) {
                p.mesh.visible = true;
                p.mesh.position.set(x + (Math.random()-0.5)*0.5, 0.2, y + (Math.random()-0.5)*0.5);
                p.mesh.material.color.setHex(0xffff00); p.mesh.material.opacity = 1;
                p.life = 1.5; p.velocity.set(0, 0.03 + Math.random()*0.02, 0);
                spawned++;
             }
        }
    }

    /**
     * Updates the state of all active particles (movement, fading).
     * Should be called every frame.
     */
    update() {
        for(let p of this.particles) {
            if(p.life > 0) {
                p.life -= 0.02; p.mesh.position.add(p.velocity);
                p.mesh.material.opacity = Math.min(1, p.life); p.mesh.rotation.z += 0.1;
                if(p.life <= 0) p.mesh.visible = false;
            }
        }
    }
}

/**
 * Main renderer class handling the 3D scene using Three.js.
 */
class Renderer3D {
    /**
     * Creates an instance of Renderer3D.
     */
    constructor() {
        this.scene = null; this.camera = null; this.renderer = null;
        this.meshes = { map: [], enemies: [], loot: [] };
        this.playerTarget = new THREE.Vector3();
        this.lungeTarget = null;
        this.enemyTargets = new Map();
        this.enemyLunges = new Map();
        this.shakeTargets = new Map();
        this.rangeGroup = new THREE.Group();
        this.dangerGroup = new THREE.Group();
        this.cameraLookCurrent = new THREE.Vector3();
        this.particles = null;
        this.moveLerpStart = new THREE.Vector3();
        this.moveLerpEnd = new THREE.Vector3();
        this.moveLerpProgress = 1;
        this.nextColor = null;
        this.spinProgress = 0;
        this.isSpinning = false;
        this.isAscending = false;
        this.ascendProgress = 0;
        this.zoomProgress = 0;
        this.isAnimating = false;
        this.instancedFloor = null;
        this.instancedWalls = null;
        this.currentRangeSkill = null;
        this.previewOverride = null;
        this.cursorMesh = null;

        // Shared resources for danger zones to prevent memory leaks
        this.dangerGeo = new THREE.PlaneGeometry(0.9, 0.9);
        this.dangerMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
        this.dangerPool = [];
        this.floatingTexts = [];
    }

    /**
     * Initializes the Three.js scene, camera, and renderer.
     * @param {HTMLElement} container - The DOM element to attach the renderer canvas to.
     */
    init(container) {
        if(!container) return;
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.bg);
        this.scene.fog = new THREE.Fog(CONFIG.colors.fog, 4, 14);

        const w = container.clientWidth;
        const h = container.clientHeight;
        // Aspect ratio based on actual container size
        this.camera = new THREE.PerspectiveCamera(50, (w && h) ? w/h : 1, 0.1, 16);

        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        // Viewport is half the size of the window, scaled up
        this.renderer.setSize(Math.floor(w/2), Math.floor(h/2), false);
        this.renderer.domElement.id = 'game-canvas';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.imageRendering = 'pixelated';

        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.id = 'game-view-wrapper'; wrapper.style.width = '100%'; wrapper.style.height = '100%';
        wrapper.appendChild(this.renderer.domElement); container.appendChild(wrapper);

        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            const width = entry.contentRect.width;
            const height = entry.contentRect.height;
            if (width > 0 && height > 0) {
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(Math.floor(width/2), Math.floor(height/2), false);
            }
        });
        resizeObserver.observe(container);

        this.scene.add(new THREE.AmbientLight(0x222222));
        const dirLight = new THREE.DirectionalLight(0x555555, 0.6); dirLight.position.set(10, 20, 10); this.scene.add(dirLight);
        this.playerLight = new THREE.PointLight(0x004444, 1.5, 15); this.scene.add(this.playerLight);

        const geo = new THREE.OctahedronGeometry(0.35);
        this.matPlayer = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x001133 });
        this.playerMesh = new THREE.Mesh(geo, this.matPlayer);
        this.playerMesh.userData.uid = 'player';
        this.scene.add(this.playerMesh);

        // Cursor (Targeting Reticle)
        const cursorGeo = new THREE.BoxGeometry(1, 1, 1);
        const cursorMat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true, transparent: true, opacity: 0.8 });
        this.cursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
        this.cursorMesh.visible = false;
        this.scene.add(this.cursorMesh);

        this.mapGroup = new THREE.Group(); this.enemyGroup = new THREE.Group(); this.lootGroup = new THREE.Group(); this.rangeGroup = new THREE.Group();
        this.scene.add(this.mapGroup); this.scene.add(this.enemyGroup); this.scene.add(this.lootGroup); this.scene.add(this.rangeGroup);
        this.scene.add(this.dangerGroup);
        this.particles = new ParticleSystem(this.scene);
        this.initEvents();
        this.animate();
    }

    /**
     * Initializes event listeners for the EventBus.
     */
    initEvents() {
        EventBus.on('map_setup', () => this.rebuildLevel());
        EventBus.on('play_animation', (type, data) => this.playAnimation(type, data));
        EventBus.on('sync_enemies', () => this.syncEnemies());
        EventBus.on('sync_loot', () => this.syncLoot());
        EventBus.on('float_text', (t,x,y,c) => this.spawnFloatText(t,x,y,c));
    }

    /**
     * Spawns a floating text at the specified grid coordinates.
     * @param {string} text - The text to display.
     * @param {number} x - The grid X coordinate.
     * @param {number} y - The grid Y coordinate.
     * @param {string} color - The CSS color string.
     */
    spawnFloatText(text, x, y, color) {
        const jitterX = (Math.random() - 0.5) * 40;
        const jitterY = (Math.random() - 0.5) * 20;

        const container = document.createElement('div');
        container.className = 'float-text-container';

        const pos = this.projectToScreen(x, 0.5, y);
        container.style.left = (pos.x + jitterX) + 'px';
        container.style.top = (pos.y + jitterY) + 'px';

        const chars = text.toString().split('');
        chars.forEach((char, i) => {
            const s = document.createElement('span');
            s.className = 'float-digit';
            s.style.animationDelay = (i * 30) + 'ms';
            s.style.color = color;
            s.innerText = char;
            container.appendChild(s);
        });

        const layer = document.getElementById('floating-text-layer');
        if(layer) layer.appendChild(container);

        this.floatingTexts.push({
            el: container,
            x: x,
            y: y, // Grid Y is World Z in our coordinate system
            jitterX: jitterX,
            jitterY: jitterY,
            life: 1.2
        });
    }

    /**
     * Rebuilds the level geometry (floor, walls) based on current map data.
     */
    rebuildLevel() {
        disposeHierarchy(this.mapGroup);
        this.mapGroup.clear();
        const count = $gameMap.width * $gameMap.height;
        const geoFloor = new THREE.PlaneGeometry(0.95, 0.95);
        const matFloor = new THREE.MeshLambertMaterial({ color: CONFIG.colors.floor });
        this.instancedFloor = new THREE.InstancedMesh(geoFloor, matFloor, count);
        const geoBlock = new THREE.BoxGeometry(0.95, 1, 0.95);
        const matWall = new THREE.MeshLambertMaterial({ color: CONFIG.colors.wall });
        this.instancedWalls = new THREE.InstancedMesh(geoBlock, matWall, count);
        const dummy = new THREE.Object3D();
        let fIdx = 0, wIdx = 0;

        for(let x=0; x<$gameMap.width; x++) {
            for(let y=0; y<$gameMap.height; y++) {
                if($gameMap.tiles[x][y] === 0 || $gameMap.tiles[x][y] === 3) {
                    dummy.position.set(x, 0, y); dummy.rotation.set(-Math.PI/2, 0, 0); dummy.scale.set(1,1,1); dummy.updateMatrix();
                    this.instancedFloor.setMatrixAt(fIdx++, dummy.matrix);
                    if($gameMap.tiles[x][y] === 3) {
                        const numSteps = 5; const maxH = 0.4; const sliceW = 0.8 / numSteps;
                        for(let s=0; s<numSteps; s++) {
                            const h = maxH * (numSteps - s) / numSteps;
                            const yPos = h / 2; const zPos = y - 0.4 + (s * sliceW) + (sliceW / 2);
                            const step = new THREE.Mesh(new THREE.BoxGeometry(0.8, h, sliceW * 0.9), new THREE.MeshPhongMaterial({ color: 0x00ffaa, flatShading: true }));
                            step.position.set(x, yPos, zPos); this.mapGroup.add(step);
                        }
                    }
                } else if ($gameMap.tiles[x][y] === 1) {
                     if(this.hasFloorNeighbor(x,y)) {
                        dummy.position.set(x, 0.5, y); dummy.rotation.set(0,0,0); dummy.scale.set(1,1,1); dummy.updateMatrix();
                        this.instancedWalls.setMatrixAt(wIdx++, dummy.matrix);
                     }
                }
            }
        }
        this.instancedFloor.count = fIdx; this.instancedWalls.count = wIdx;
        this.instancedFloor.instanceMatrix.needsUpdate = true; this.instancedWalls.instanceMatrix.needsUpdate = true;
        this.mapGroup.add(this.instancedFloor); this.mapGroup.add(this.instancedWalls);

        this.playerMesh.position.set($gameMap.playerX, 0.5, $gameMap.playerY);
        this.playerTarget.set($gameMap.playerX, 0.5, $gameMap.playerY);
        this.cameraLookCurrent.set($gameMap.playerX, 0, $gameMap.playerY);
        this.isAscending = false; this.ascendProgress = 0; this.zoomProgress = 0; this.playerMesh.visible = true;
        this.syncEnemies(); this.syncLoot();
        this.updateDangerZones();
    }

    /**
     * Checks if a wall tile has at least one floor neighbor (for occlusion culling optimization).
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {boolean} True if adjacent to a floor tile.
     */
    hasFloorNeighbor(x,y) {
        const t = $gameMap.tiles;
        const check = (nx, ny) => nx>=0 && nx<$gameMap.width && ny>=0 && ny<$gameMap.height && t[nx][ny] !== 1;
        return check(x+1,y) || check(x-1,y) || check(x,y+1) || check(x,y-1);
    }

    /**
     * Synchronizes 3D enemy meshes with the logical game state.
     */
    syncEnemies() {
        const cIds = new Set($gameMap.enemies.map(e => e.uid));
        for(let i = this.enemyGroup.children.length - 1; i >= 0; i--) {
            const c = this.enemyGroup.children[i];
            if(!cIds.has(c.userData.uid)) {
                disposeHierarchy(c);
                this.enemyGroup.remove(c);
                this.enemyTargets.delete(c.userData.uid);
            }
        }
        $gameMap.enemies.forEach(e => {
            let mesh = this.enemyGroup.children.find(c => c.userData.uid === e.uid);
            if(!mesh) {
                const geo = new THREE.ConeGeometry(0.3 * e.scale, 0.8 * e.scale, 4);
                const mat = new THREE.MeshPhongMaterial({ color: e.color, flatShading: true });
                mesh = new THREE.Mesh(geo, mat);
                mesh.userData = { uid: e.uid, scaleBase: e.scale };
                mesh.position.set(e.x, 0.4, e.y);
                this.enemyGroup.add(mesh);
                this.enemyTargets.set(e.uid, new THREE.Vector3(e.x, 0.4, e.y));
            } else {
                const target = this.enemyTargets.get(e.uid); if(target) target.set(e.x, 0.4, e.y);
            }
        });
        this.updateDangerZones();
    }

    /**
     * Updates the visualization of enemy danger zones (attack ranges).
     */
    updateDangerZones() {
        // Reset pool usage
        this.dangerPool.forEach(m => m.visible = false);
        let poolIdx = 0;

        const dangerTiles = new Set();
        $gameMap.enemies.forEach(e => {
            if (e.ai === 'turret') {
                const range = 5; // Hardcoded range for Turret
                for (let x = e.x - range; x <= e.x + range; x++) {
                    for (let y = e.y - range; y <= e.y + range; y++) {
                        if ($gameMap.isValid(x, y) && $gameMap.tiles[x][y] !== 1) {
                            const dist = Math.abs(x - e.x) + Math.abs(y - e.y);
                            if (dist <= range) {
                                if ($gameMap.checkLineOfSight(e.x, e.y, x, y)) {
                                    dangerTiles.add(`${x},${y}`);
                                }
                            }
                        }
                    }
                }
            }
        });

        dangerTiles.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            let m;
            if (poolIdx < this.dangerPool.length) {
                m = this.dangerPool[poolIdx];
                m.visible = true;
            } else {
                m = new THREE.Mesh(this.dangerGeo, this.dangerMat);
                m.rotation.x = -Math.PI / 2;
                this.dangerGroup.add(m);
                this.dangerPool.push(m);
            }
            m.position.set(x, 0.03, y);
            poolIdx++;
        });
    }

    /**
     * Synchronizes 3D loot meshes with the logical game state.
     */
    syncLoot() {
        disposeHierarchy(this.lootGroup);
        this.lootGroup.clear();
        $gameMap.loot.forEach(l => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshPhongMaterial({ color: 0xffd700, wireframe: true }));
            m.position.set(l.x, 0.25, l.y);
            this.lootGroup.add(m);
        });
    }

    /**
     * Triggers a specific visual animation.
     * @param {string} type - The type of animation (e.g., 'move_switch', 'lunge', 'hit').
     * @param {Object} data - Parameters for the animation.
     */
    playAnimation(type, data) {
        if (type === 'move_switch' || type === 'move') {
            this.moveLerpStart.copy(this.playerMesh.position);
            this.moveLerpEnd.set(data.toX, 0.5, data.toY);
            this.nextColor = data.nextColor; // Undefined for simple move, checked below
            this.moveLerpProgress = 0;
            this.playerTarget.set(data.toX, 0.5, data.toY);
            this.isAnimating = true; // Lock input during move
            this.animationType = type; // Track type for render loop
        } else if (type === 'ascend') {
            this.isAscending = true;
            this.ascendProgress = 0;
            this.zoomProgress = 0;
        } else if (type === 'projectile') {
            // Visual projectile
            const geo = new THREE.SphereGeometry(0.1, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color: data.color || 0xffff00 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(data.x1, 0.5, data.y1);
            this.scene.add(mesh);

            const start = new THREE.Vector3(data.x1, 0.5, data.y1);
            const end = new THREE.Vector3(data.x2, 0.5, data.y2);
            let progress = 0;

            const animateProjectile = () => {
                progress += 0.1; // Speed
                if(progress >= 1) {
                    this.scene.remove(mesh);
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                } else {
                    mesh.position.lerpVectors(start, end, progress);
                    requestAnimationFrame(animateProjectile);
                }
            };
            animateProjectile();
        } else if (type === 'lunge') {
            this.lungeTarget = new THREE.Vector3(data.tx, 0.5, data.ty);
            setTimeout(() => { this.lungeTarget = null; }, 150);
        } else if (type === 'enemyLunge') {
            this.enemyLunges.set(data.uid, new THREE.Vector3(data.tx, 0.4, data.ty));
            setTimeout(() => { this.enemyLunges.delete(data.uid); }, 150);
        } else if (type === 'shake') {
            const el = document.getElementById('game-view-wrapper');
            el.style.transform = `translate(${Math.random()*6-3}px, ${Math.random()*6-3}px)`;
            setTimeout(() => el.style.transform = 'none', 50);
        } else if (type === 'hit') {
            if (data.uid !== undefined) {
                this.shakeTargets.set(data.uid, 5);
                const pos = data.uid==='player' ? this.playerMesh.position : this.enemyGroup.children.find(c=>c.userData.uid===data.uid)?.position;
                if(pos) this.particles.spawnBurst(pos.x, pos.z, 0xff0000, 5);
            }
        } else if (type === 'itemGet') {
            this.particles.spawnSparkle(data.x, data.y);
        } else if (type === 'flash') {
            this.flash(data.color);
        } else if (type === 'die') {
            const target = this.enemyGroup.children.find(c => c.userData.uid === data.uid);
            if(target) this.particles.spawnBurst(target.position.x, target.position.z, 0xaaaaaa, 10);
        }
    }

    /**
     * Projects a 3D world coordinate to 2D screen space.
     * @param {number} x - World X.
     * @param {number} y - World Y (up).
     * @param {number} z - World Z.
     * @returns {Object} An object {x, y} representing screen coordinates relative to the UI root.
     */
    projectToScreen(x, y, z) {
        if (!this.container) return { x: 0, y: 0 };

        // Calculate offset relative to app-container to work in logical 960x540 space
        let el = this.container;
        let offX = 0;
        let offY = 0;

        const app = document.getElementById('app-container');
        while (el && el !== app) {
            offX += el.offsetLeft;
            offY += el.offsetTop;
            el = el.offsetParent;
        }

        // Use client width/height which are logical pixels (ignores transform scale)
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;

        const vec = new THREE.Vector3(x, y, z);
        vec.project(this.camera);

        const localX = (vec.x * 0.5 + 0.5) * w;
        const localY = (-vec.y * 0.5 + 0.5) * h;

        return {
            x: localX + offX,
            y: localY + offY
        };
    }

    /**
     * The main animation loop called every frame.
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isAscending) {
            // 1. ZOOM PHASE
            if(this.zoomProgress < 1) {
                this.zoomProgress += 0.02; // Slower Zoom
                // Dolly In
                const lx = this.playerTarget.x; const lz = this.playerTarget.z;
                this.cameraLookCurrent.x += (lx - this.cameraLookCurrent.x) * 0.1;
                this.cameraLookCurrent.z += (lz - this.cameraLookCurrent.z) * 0.1;

                const targetX = this.playerTarget.x;
                const targetZ = this.playerTarget.z + 3; // Closer
                const targetY = 3; // Lower
                this.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);
                this.camera.lookAt(this.playerTarget.x, 0, this.playerTarget.z); // Look at stair base
            }

            // 2. FLY PHASE (Triggered after zoom is mostly done)
            if(this.zoomProgress > 0.8) {
                this.ascendProgress += 0.015;
                const y = 0.5 + (this.ascendProgress * this.ascendProgress * this.ascendProgress * 50);
                this.playerMesh.position.y = y;
                // Light STAYS DOWN (don't update playerLight pos)
            }
        } else {
             // --- CUSTOM MOVE & SWAP LOGIC ---
            if (this.moveLerpProgress < 1) {
                this.moveLerpProgress += 0.06; // SLOWER VISUALS (approx 16 frames)

                // EARLY UNLOCK FOR SEAMLESS INPUT
                if(this.moveLerpProgress > 0.85) {
                     this.isAnimating = false;
                }

                if(this.moveLerpProgress >= 1) this.moveLerpProgress = 1;

                this.playerMesh.position.lerpVectors(this.moveLerpStart, this.moveLerpEnd, this.moveLerpProgress);

                if (this.animationType === 'move_switch') {
                    if (this.moveLerpProgress >= 0.5 && this.nextColor !== undefined && this.matPlayer.color.getHex() !== this.nextColor) {
                        this.matPlayer.color.setHex(this.nextColor);
                    }
                    this.playerMesh.rotation.y = this.moveLerpProgress * Math.PI * 2;
                } else {
                    // Simple Move: Face direction? Or just slide.
                    // Slide is fine for now.
                    this.playerMesh.rotation.y = 0;
                }
            } else {
                this.playerMesh.rotation.y = 0;
                if (this.lungeTarget) this.playerMesh.position.lerp(this.lungeTarget, 0.3);
                else this.playerMesh.position.lerp(this.playerTarget, 0.3);
            }

            if(!this.isAscending) {
                this.playerMesh.position.y = 0.5 + Math.sin(Date.now()*0.005)*0.05;
                this.playerLight.position.copy(this.playerMesh.position).add(new THREE.Vector3(0, 1, 0));

                if(this.camera) {
                    let lx = this.playerTarget.x; let lz = this.playerTarget.z;
                    let tx = this.playerTarget.x; let tz = this.playerTarget.z + 6; let ty = 6;

                    // Camera follows cursor in Target Cycle Mode
                    if ($gameMap.targetingState && $gameMap.targetingState.active && $gameMap.targetingState.mode === 'target_cycle') {
                        const cur = $gameMap.targetingState.cursor;
                        lx = cur.x; lz = cur.y;
                        tx = cur.x; tz = cur.y + 5; ty = 5; // Slightly closer zoom for targeting
                    }

                    this.cameraLookCurrent.x += (lx - this.cameraLookCurrent.x) * 0.1;
                    this.cameraLookCurrent.z += (lz - this.cameraLookCurrent.z) * 0.1;

                    this.camera.position.x += (tx - this.camera.position.x) * 0.1;
                    this.camera.position.z += (tz - this.camera.position.z) * 0.1;
                    this.camera.position.y += (ty - this.camera.position.y) * 0.1;
                    this.camera.lookAt(this.cameraLookCurrent.x, 0, this.cameraLookCurrent.z - 2);
                }
            }
        }

        if (this.shakeTargets.has('player')) {
            const f = this.shakeTargets.get('player');
            if (f > 0) {
                this.playerMesh.position.x += (Math.random()-0.5)*0.2; this.playerMesh.position.z += (Math.random()-0.5)*0.2;
                this.shakeTargets.set('player', f - 1);
            } else this.shakeTargets.delete('player');
        }

        this.enemyGroup.children.forEach(mesh => {
            const uid = mesh.userData.uid;
            if (this.enemyLunges.has(uid)) mesh.position.lerp(this.enemyLunges.get(uid), 0.3);
            else {
                const t = this.enemyTargets.get(uid); if(t) mesh.position.lerp(t, 0.15);
            }
            if (this.shakeTargets.has(uid)) {
                const f = this.shakeTargets.get(uid);
                if (f > 0) {
                    mesh.position.x += (Math.random()-0.5)*0.15; mesh.position.z += (Math.random()-0.5)*0.15;
                    this.shakeTargets.set(uid, f - 1);
                } else this.shakeTargets.delete(uid);
            }
            const s = mesh.userData.scaleBase || 1.0;
            const pulse = s * (1 + Math.sin(Date.now() * 0.008 + uid) * 0.1);
            mesh.scale.set(1, pulse, 1); mesh.rotation.y += 0.02;
        });

        this.lootGroup.children.forEach(l => { l.rotation.y += 0.02; l.rotation.x += 0.01; });
        this.particles.update();

        // Update Floating Text Positions
        this.floatingTexts.forEach((ft, i) => {
            ft.life -= 0.016;
            if(ft.life <= 0) {
                if(ft.el.parentNode) ft.el.parentNode.removeChild(ft.el);
                this.floatingTexts[i] = null;
            } else {
                const pos = this.projectToScreen(ft.x, 0.5, ft.y);
                ft.el.style.left = (pos.x + ft.jitterX) + 'px';
                ft.el.style.top = (pos.y + ft.jitterY) + 'px';
            }
        });
        this.floatingTexts = this.floatingTexts.filter(ft => ft !== null);

        // Update Cursor
        if ($gameMap.targetingState && $gameMap.targetingState.active) {
            this.cursorMesh.visible = true;
            const t = $gameMap.targetingState.cursor;
            this.cursorMesh.position.set(t.x, 0.5, t.y);
            this.cursorMesh.material.opacity = 0.5 + Math.sin(Date.now() * 0.01) * 0.4; // Blink
        } else {
            this.cursorMesh.visible = false;
        }

        // Idle Range Display or Targeting Range
        if ($gameMap.targetingState && $gameMap.targetingState.active) {
            // Show range of the skill being targeted
            this.showRange($gameMap.targetingState.skill);
        } else if (this.previewOverride) {
            this.showRange(this.previewOverride);
        } else {
            this.clearRange();
        }

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Sets a manual override for the range preview (e.g. from UI hover).
     * @param {Object} skill
     */
    setPreviewOverride(skill) {
        this.previewOverride = skill;
    }

    /**
     * Clears the manual range preview override.
     */
    clearPreviewOverride() {
        this.previewOverride = null;
    }

    /**
     * Displays a range indicator for a skill on the map.
     * @param {Object} skill - The skill definition object.
     * @param {number} skill.range - The range of the skill.
     * @param {string} skill.type - The targeting type (e.g., 'line', 'target').
     */
    showRange(skill) {
        // Optimization check - check both skill ref and direction
        const actor = $gameParty.active();
        // Since we use direction now, we must clear if direction changed
        if (this.currentRangeSkill === skill && this.lastRangeDir && this.lastRangeDir.x === actor.direction.x && this.lastRangeDir.y === actor.direction.y) return;

        this.currentRangeSkill = skill;
        this.lastRangeDir = { ...actor.direction };

        if (!this.rangeGroup) return;
        this.rangeGroup.clear();
        if (!skill) return;
        const geo = new THREE.PlaneGeometry(0.9, 0.9);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
        const px = $gameMap.playerX; const py = $gameMap.playerY; const coords = [];

        if (skill.type === 'all_enemies') {
            $gameMap.enemies.forEach(e => coords.push({x: e.x, y: e.y}));
        } else if (skill.type === 'target') {
             // For target selection, show all valid tiles in range (Diamond)
             const r = skill.range;
             for(let x = px - r; x <= px + r; x++) {
                for(let y = py - r; y <= py + r; y++) {
                    if (Math.abs(x - px) + Math.abs(y - py) <= r && $gameMap.isValid(x, y) && $gameMap.tiles[x][y] !== 1) {
                        // Check LOS for consistency
                        if ($gameMap.checkLineOfSight(px, py, x, y)) coords.push({x, y});
                    }
                }
            }
        } else if (skill.range > 0 || skill.range === 0) {
            // Use shared Geometry logic for Line, Cone, Circle (including self range 0)
            const tiles = $gameMap.getTilesInShape(px, py, skill.type, skill.range, actor.direction);
            tiles.forEach(t => coords.push(t));
        }
        coords.forEach(c => {
            const m = new THREE.Mesh(geo, mat);
            m.rotation.x = -Math.PI / 2;
            m.position.set(c.x, 0.02, c.y);
            this.rangeGroup.add(m);
        });

        // Trigger Target Update
        const targets = [];
        coords.forEach(c => {
            const e = $gameMap.enemies.find(en => en.x === c.x && en.y === c.y);
            if (e && !targets.includes(e)) targets.push(e);
        });
        if (targets.length > 0) EventBus.emit('targets_updated', targets);
        else EventBus.emit('targets_cleared');
    }

    /**
     * Clears the current range indicator.
     */
    clearRange() {
        if (this.currentRangeSkill === null) return;
        this.currentRangeSkill = null;
        if (this.rangeGroup) this.rangeGroup.clear();
        EventBus.emit('targets_cleared');
    }

    /**
     * Triggers a screen shake effect (CSS transform).
     */
    shake() {
        const el = document.getElementById('game-view-wrapper');
        el.style.transform = `translate(${Math.random()*6-3}px, ${Math.random()*6-3}px)`;
        setTimeout(() => el.style.transform = 'none', 50);
    }

    /**
     * Flashes the screen with a specific color (CSS overlay).
     * @param {number} color - Hex color for the flash.
     */
    flash(color) {
        const fx = document.getElementById('screen-fx');
        fx.style.backgroundColor = '#' + color.toString(16).padStart(6,'0');
        fx.style.opacity = 0.5;
        setTimeout(() => { fx.style.backgroundColor = 'transparent'; fx.style.opacity = 0.6; }, 100);
    }
}
