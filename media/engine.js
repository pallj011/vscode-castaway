// Webview entry point — animation loop, host message handling, and canvas
// scaling. The scene is authored in fixed 1200x600 coordinates and
// letterboxed into whatever size the panel actually is.

class CastawayEngine {
    constructor(canvasId, graphicsMode, textSize) {
        this.canvas = document.getElementById(canvasId);
        this.renderer = new Renderer(this.canvas);
        this.calendar = new Calendar();
        this.sceneManager = new SceneManager(this.renderer, this.calendar);
        this.renderer.setGraphicsMode(graphicsMode || 'classic');
        this.renderer.setTextSize(textSize || 'medium');

        this.isPaused = false;
        this.animationFrameId = null;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.startAnimation();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = this.canvas.clientWidth || window.innerWidth;
        const h = this.canvas.clientHeight || window.innerHeight;
        this.canvas.width = Math.max(1, Math.floor(w * dpr));
        this.canvas.height = Math.max(1, Math.floor(h * dpr));
    }

    startAnimation() {
        // In narrow panels (Explorer sidebar) fitting the whole 1200px scene
        // makes everything unreadably small. Instead, guarantee the island
        // action zone (FOCUS_W px centered on the island) fills the width and
        // crop the open ocean at the edges. Wide panels behave as before.
        const FOCUS_W = 660;
        const FOCUS_CX = 650;

        const animate = () => {
            if (!this.isPaused) {
                const ctx = this.renderer.ctx;
                const rw = this.renderer.width;
                const rh = this.renderer.height;
                const cw = this.canvas.width;
                const ch = this.canvas.height;

                const fitScale = Math.min(cw / rw, ch / rh);
                const focusScale = Math.min(cw / FOCUS_W, ch / rh);
                const scale = Math.max(fitScale, focusScale);

                let tx;
                if (rw * scale <= cw) {
                    tx = (cw - rw * scale) / 2;
                } else {
                    // Center the island, but never show past the scene edges
                    tx = cw / 2 - FOCUS_CX * scale;
                    tx = Math.min(0, Math.max(cw - rw * scale, tx));
                }
                const ty = (ch - rh * scale) / 2;

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, cw, ch);
                ctx.save();
                ctx.setTransform(scale, 0, 0, scale, tx, ty);
                // Keep off-scene actors (drones flying in, jetskis leaving)
                // from spilling into the letterbox bars.
                ctx.beginPath();
                ctx.rect(0, 0, rw, rh);
                ctx.clip();

                // Let the renderer compensate: bubbles keep a readable
                // on-screen font size and stay inside the visible crop.
                const dpr = window.devicePixelRatio || 1;
                this.renderer.viewScale = scale / dpr;
                this.renderer.visibleLeft = Math.max(0, -tx / scale);
                this.renderer.visibleRight = Math.min(rw, (cw - tx) / scale);

                this.sceneManager.update();
                this.sceneManager.render();
                ctx.restore();
            }
            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    nextScene() {
        this.sceneManager.setScene(this.sceneManager.selectRandomScene());
    }

    setScene(name) {
        this.sceneManager.setScene(name);
    }

    toggleGraphicsMode() {
        const newMode = this.renderer.graphicsMode === 'classic' ? 'modern' : 'classic';
        this.renderer.setGraphicsMode(newMode);
        return newMode;
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

// eslint-disable-next-line no-unused-vars
const castawayApp = {
    engine: null,

    start(canvasId, graphicsMode, textSize) {
        this.engine = new CastawayEngine(canvasId, graphicsMode, textSize);

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (!message || !this.engine) {
                return;
            }
            switch (message.command) {
                case 'next-scene':
                    this.engine.nextScene();
                    break;
                case 'set-scene':
                    this.engine.setScene(message.scene);
                    break;
                case 'toggle-pause':
                    this.engine.togglePause();
                    break;
                case 'set-graphics':
                    this.engine.renderer.setGraphicsMode(message.mode);
                    break;
                case 'set-text-size':
                    this.engine.renderer.setTextSize(message.size);
                    break;
                case 'toggle-graphics':
                    this.engine.toggleGraphicsMode();
                    break;
            }
        });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CastawayEngine, castawayApp };
}
