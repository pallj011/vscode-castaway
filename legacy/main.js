// Main initialization and UI event handlers

let engine;

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Validate required DOM elements exist
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element "gameCanvas" not found');
        }

        const graphicsToggle = document.getElementById('graphicsToggle');
        const pauseToggle = document.getElementById('pauseToggle');
        const nextScene = document.getElementById('nextScene');

        if (!graphicsToggle || !pauseToggle || !nextScene) {
            throw new Error('Required control buttons not found');
        }

        // Initialize the engine
        engine = new JohnnyCastawayEngine('gameCanvas');

        // Graphics toggle button
        graphicsToggle.addEventListener('click', () => {
            const newMode = engine.toggleGraphicsMode();
            graphicsToggle.textContent = `Graphics: ${newMode.charAt(0).toUpperCase() + newMode.slice(1)}`;
        });

        // Pause toggle button
        pauseToggle.addEventListener('click', () => {
            const isPaused = engine.togglePause();
            pauseToggle.textContent = isPaused ? 'Resume' : 'Pause';
        });

        // Next scene button
        nextScene.addEventListener('click', () => {
            engine.nextScene();
        });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case ' ':
                // Spacebar to pause/resume
                e.preventDefault();
                pauseToggle.click();
                break;
            case 'g':
                // G to toggle graphics
                graphicsToggle.click();
                break;
            case 'n':
                // N for next scene
                nextScene.click();
                break;
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    handleResize();
    
        console.log('🏝️ Johnny Castaway initialized!');
        console.log('Keyboard shortcuts:');
        console.log('  Space - Pause/Resume');
        console.log('  G - Toggle Graphics Mode');
        console.log('  N - Next Scene');
    } catch (error) {
        console.error('❌ Failed to initialize Johnny Castaway:', error);
        alert(`Failed to initialize application: ${error.message}`);
    }
});

function handleResize() {
    // Maintain aspect ratio on resize
    const container = document.querySelector('.container');
    const canvas = document.getElementById('gameCanvas');
    
    // Could add more sophisticated resize logic here
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (engine) {
        engine.destroy();
    }
});
