// Main Animation Engine

class JohnnyCastawayEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.renderer = new Renderer(this.canvas);
        this.calendar = new Calendar();
        this.sceneManager = new SceneManager(this.renderer, this.calendar);
        
        this.isPaused = false;
        this.animationFrameId = null;
        
        this.init();
    }

    init() {
        this.startAnimation();
        this.updateTimeDisplay();
        setInterval(() => this.updateTimeDisplay(), 1000);
    }

    startAnimation() {
        const animate = () => {
            if (!this.isPaused) {
                this.renderer.clear();
                this.sceneManager.update();
                this.sceneManager.render();
                
                // Update UI
                document.getElementById('currentScene').textContent = 
                    `Scene: ${this.sceneManager.getCurrentSceneName()}`;
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
        const nextSceneName = this.sceneManager.selectRandomScene();
        this.sceneManager.setScene(nextSceneName);
    }

    toggleGraphicsMode() {
        const currentMode = this.renderer.graphicsMode;
        const newMode = currentMode === 'classic' ? 'modern' : 'classic';
        this.renderer.setGraphicsMode(newMode);
        return newMode;
    }

    updateTimeDisplay() {
        const now = this.calendar.getCurrentDate();
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        const holiday = this.calendar.getCurrentHoliday();
        
        let displayText = `${timeString} - ${dateString}`;
        if (holiday) {
            displayText += ` 🎉 ${holiday.name}`;
        }
        
        document.getElementById('timeDisplay').textContent = displayText;
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}
