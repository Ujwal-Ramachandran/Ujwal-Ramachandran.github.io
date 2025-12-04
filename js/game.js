/**
 * NEURAL FIREWALL
 * Standalone Page Logic
 */

const COLORS = {
    CORE: '#58a6ff',      
    MALWARE: '#f85149',   
    DATA: '#3fb950',      
    NODE_OFF: '#30363d',  
    NODE_ON: '#58a6ff',   
    LINE_OFF: '#21262d',
    LINE_ON: 'rgba(88, 166, 255, 0.3)'
};

const SETTINGS = {
    LAYERS: 3,
    NODES_PER_LAYER: 6,
    NODE_RADIUS: 15,
    PACKET_SPEED: 0.008, 
    SPAWN_RATE: 120,     
};

class Node {
    constructor(id, x, y, layer, type = 'intermediate') {
        this.id = id;
        this.x = x;
        this.y = y;
        this.layer = layer; 
        this.type = type;   
        this.isOpen = true; 
        this.neighbors = [];
    }

    draw(ctx) {
        const r = this.type === 'core' ? SETTINGS.NODE_RADIUS * 1.5 : SETTINGS.NODE_RADIUS;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = this.x + r * Math.cos(angle);
            const hy = this.y + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();

        if (this.type === 'core') {
            ctx.fillStyle = COLORS.CORE;
            ctx.shadowColor = COLORS.CORE;
            ctx.shadowBlur = 20;
        } else if (!this.isOpen) {
            ctx.fillStyle = COLORS.NODE_OFF;
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#8b949e';
        } else {
            ctx.fillStyle = '#161b22'; 
            ctx.strokeStyle = COLORS.NODE_ON;
            ctx.shadowColor = COLORS.NODE_ON;
            ctx.shadowBlur = 10;
        }

        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

class Packet {
    constructor(startNode, type) {
        this.currentNode = startNode;
        this.targetNode = null;
        this.type = type; 
        this.progress = 0;
        this.alive = true;
        this.finished = false;
        this.x = startNode.x;
        this.y = startNode.y;
    }

    update() {
        if (!this.targetNode) return;
        this.progress += SETTINGS.PACKET_SPEED;
        this.x = this.currentNode.x + (this.targetNode.x - this.currentNode.x) * this.progress;
        this.y = this.currentNode.y + (this.targetNode.y - this.currentNode.y) * this.progress;

        if (this.progress >= 1) this.arrive();
    }

    arrive() {
        this.currentNode = this.targetNode;
        this.targetNode = null;
        this.progress = 0;

        if (!this.currentNode.isOpen && this.currentNode.type !== 'core') {
            this.alive = false; 
            return;
        }
        if (this.currentNode.type === 'core') {
            this.finished = true;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = this.type === 'malware' ? COLORS.MALWARE : COLORS.DATA;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('neural-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.nodes = [];
        this.packets = [];
        this.edges = []; 
        
        this.score = 0;
        this.integrity = 100;
        this.isRunning = false;
        this.frameCount = 0;

        this.uiScore = document.getElementById('game-score');
        this.uiIntegrity = document.getElementById('game-integrity');
        this.uiFinalScore = document.getElementById('final-score');
        this.menu = document.getElementById('game-menu');
        this.gameOverScreen = document.getElementById('game-over-screen');

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('restart-btn').addEventListener('click', () => this.reset());
        // Exit/Close now returns to index.html
        document.getElementById('close-game-btn').addEventListener('click', () => this.exitGame());
        document.getElementById('exit-btn').addEventListener('click', () => this.exitGame());

        // Initial render for background
        this.generateMap();
        this.draw();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        if(this.nodes.length > 0) this.generateMap(); 
        if(!this.isRunning) this.draw();
    }

    generateMap() {
        this.nodes = [];
        this.edges = [];
        const cx = this.width / 2;
        const cy = this.height / 2;
        const layerDist = Math.min(this.width, this.height) / 2 / (SETTINGS.LAYERS + 1);

        const core = new Node(0, cx, cy, 0, 'core');
        this.nodes.push(core);

        let nodeId = 1;

        for (let l = 1; l <= SETTINGS.LAYERS; l++) {
            const radius = l * layerDist;
            for (let i = 0; i < SETTINGS.NODES_PER_LAYER; i++) {
                const angle = (Math.PI * 2 / SETTINGS.NODES_PER_LAYER) * i;
                const nx = cx + Math.cos(angle) * radius;
                const ny = cy + Math.sin(angle) * radius;
                const type = l === SETTINGS.LAYERS ? 'gateway' : 'intermediate';
                
                const node = new Node(nodeId++, nx, ny, l, type);
                this.nodes.push(node);
            }
        }

        // Connections
        for (let i = 1; i <= SETTINGS.NODES_PER_LAYER; i++) {
            this.connect(this.nodes[0], this.nodes[i]);
        }

        for (let l = 1; l < SETTINGS.LAYERS; l++) {
            const startIdx = 1 + (l - 1) * SETTINGS.NODES_PER_LAYER;
            const nextLayerStartIdx = 1 + l * SETTINGS.NODES_PER_LAYER;

            for (let i = 0; i < SETTINGS.NODES_PER_LAYER; i++) {
                const current = this.nodes[startIdx + i];
                const outer = this.nodes[nextLayerStartIdx + i];
                this.connect(current, outer);
                const nextInRingIdx = startIdx + ((i + 1) % SETTINGS.NODES_PER_LAYER);
                const ringNeighbor = this.nodes[nextInRingIdx];
                this.connect(current, ringNeighbor);
            }
        }
    }

    connect(n1, n2) {
        n1.neighbors.push(n2);
        n2.neighbors.push(n1);
        this.edges.push([n1, n2]);
    }

    spawnPacket() {
        const gateways = this.nodes.filter(n => n.type === 'gateway');
        const startNode = gateways[Math.floor(Math.random() * gateways.length)];
        const type = Math.random() > 0.6 ? 'data' : 'malware';
        this.packets.push(new Packet(startNode, type));
    }

    findNextMove(packet) {
        const queue = [{ node: packet.currentNode, path: [] }];
        const visited = new Set();
        visited.add(packet.currentNode.id);

        while (queue.length > 0) {
            const { node, path } = queue.shift();
            if (node.id === 0) return path[0];

            const neighbors = [...node.neighbors].sort(() => Math.random() - 0.5);

            for (let neighbor of neighbors) {
                if (!visited.has(neighbor.id) && neighbor.isOpen) {
                    visited.add(neighbor.id);
                    queue.push({ node: neighbor, path: [...path, neighbor] });
                }
            }
        }
        return null; 
    }

    handleClick(e) {
        if (!this.isRunning) return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        for (let node of this.nodes) {
            if (node.type === 'core' || node.type === 'gateway') continue;
            const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
            if (dist < SETTINGS.NODE_RADIUS + 5) {
                node.isOpen = !node.isOpen; 
                break;
            }
        }
    }

    update() {
        this.frameCount++;
        if (this.frameCount % SETTINGS.SPAWN_RATE === 0) {
            this.spawnPacket();
            if (this.frameCount % 1000 === 0 && SETTINGS.SPAWN_RATE > 30) {
                SETTINGS.SPAWN_RATE -= 10; 
            }
        }

        for (let i = this.packets.length - 1; i >= 0; i--) {
            const p = this.packets[i];
            if (!p.targetNode) {
                const next = this.findNextMove(p);
                if (next) p.targetNode = next;
            }
            p.update();

            if (!p.alive) {
                if (p.type === 'data') this.score = Math.max(0, this.score - 50); 
                if (p.type === 'malware') this.score += 100; 
                this.packets.splice(i, 1);
            } else if (p.finished) {
                if (p.type === 'data') this.score += 200;
                else if (p.type === 'malware') this.integrity -= 20;
                this.packets.splice(i, 1);
            }
        }

        if (this.integrity <= 0) this.gameOver();
        this.updateUI();
    }

    updateUI() {
        this.uiScore.innerText = this.score;
        this.uiIntegrity.innerText = this.integrity + '%';
        if (this.integrity < 40) this.uiIntegrity.style.color = '#f85149';
        else this.uiIntegrity.style.color = '#58a6ff';
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.lineWidth = 1;
        this.edges.forEach(edge => {
            const [n1, n2] = edge;
            const isActive = n1.isOpen && n2.isOpen;
            this.ctx.beginPath();
            this.ctx.moveTo(n1.x, n1.y);
            this.ctx.lineTo(n2.x, n2.y);
            this.ctx.strokeStyle = isActive ? COLORS.LINE_ON : COLORS.LINE_OFF;
            this.ctx.stroke();
        });

        this.nodes.forEach(node => node.draw(this.ctx));
        this.packets.forEach(p => p.draw(this.ctx));
    }

    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    start() {
        this.menu.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.isRunning = true;
        this.score = 0;
        this.integrity = 100;
        this.packets = [];
        this.frameCount = 0;
        SETTINGS.SPAWN_RATE = 120; 
        this.generateMap();
        this.loop();
    }

    gameOver() {
        this.isRunning = false;
        this.uiFinalScore.innerText = this.score;
        this.gameOverScreen.style.display = 'block';
    }

    reset() {
        this.start();
    }

    exitGame() {
        // Return to main index page
        window.location.href = 'index.html';
    }
}

// Initialize on page load
window.onload = () => {
    new Game();
};