// Scene Management System

class SceneManager {
    constructor(renderer, calendar) {
        this.renderer = renderer;
        this.calendar = calendar;
        this.currentScene = null;
        this.frame = 0;
        this.sceneStartTime = Date.now();
        
        // Scene definitions
        this.scenes = {
            idle: {
                name: 'Idle',
                duration: 5000,
                weight: 30,
                init: () => ({ johnnyX: 550, johnnyY: this.renderer.height * 0.64 }),
                update: (state) => state,
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);
                }
            },
            
            fishing: {
                name: 'Fishing',
                duration: 15000,
                weight: 25,
                init: () => ({ 
                    johnnyX: 700, 
                    johnnyY: this.renderer.height * 0.64,
                    bobbing: 0
                }),
                update: (state) => {
                    state.bobbing++;
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'fishing', state.bobbing);
                }
            },
            
            building: {
                name: 'Building Raft',
                duration: 20000,
                weight: 15,
                init: () => ({ 
                    johnnyX: 580, 
                    johnnyY: this.renderer.height * 0.64,
                    raftProgress: 0
                }),
                update: (state) => {
                    state.raftProgress = Math.min(1, (Date.now() - this.sceneStartTime) / 20000);
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'building', this.frame);
                    this.drawRaft(650, this.renderer.height * 0.66, state.raftProgress);
                }
            },
            
            sleeping: {
                name: 'Sleeping',
                duration: 12000,
                weight: 20,
                init: () => ({ 
                    johnnyX: 550, 
                    johnnyY: this.renderer.height * 0.65,
                    zzz: 0
                }),
                update: (state) => {
                    state.zzz++;
                    return state;
                },
                render: (state) => {
                    // Johnny lying down
                    this.renderer.ctx.fillStyle = this.renderer.classicColors.johnnyShirt;
                    this.renderer.ctx.fillRect(state.johnnyX - 20, state.johnnyY - 10, 40, 15);
                    
                    // Head
                    this.renderer.ctx.fillStyle = this.renderer.classicColors.johnny;
                    this.renderer.ctx.beginPath();
                    this.renderer.ctx.arc(state.johnnyX - 25, state.johnnyY - 5, 8, 0, Math.PI * 2);
                    this.renderer.ctx.fill();
                    
                    // ZZZ
                    if (state.zzz % 60 < 40) {
                        this.renderer.ctx.fillStyle = '#000';
                        this.renderer.ctx.font = '20px Arial';
                        this.renderer.ctx.fillText('Z', state.johnnyX, state.johnnyY - 30);
                        if (state.zzz % 60 > 20) {
                            this.renderer.ctx.fillText('Z', state.johnnyX + 10, state.johnnyY - 45);
                            if (state.zzz % 60 > 30) {
                                this.renderer.ctx.fillText('Z', state.johnnyX + 20, state.johnnyY - 60);
                            }
                        }
                    }
                }
            },
            
            running: {
                name: 'Jogging',
                duration: 10000,
                weight: 15,
                init: () => ({ 
                    johnnyX: 400, 
                    johnnyY: this.renderer.height * 0.64,
                    direction: 1
                }),
                update: (state) => {
                    state.johnnyX += state.direction * 2;
                    if (state.johnnyX > 750 || state.johnnyX < 450) {
                        state.direction *= -1;
                    }
                    return state;
                },
                render: (state) => {
                    const legOffset = Math.sin(this.frame * 0.3) * 5;
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY + legOffset, 'running', this.frame);
                }
            },
            
            coconutGathering: {
                name: 'Getting Coconut',
                duration: 8000,
                weight: 20,
                init: () => ({ 
                    johnnyX: 620, 
                    johnnyY: this.renderer.height * 0.64,
                    coconutFalling: false,
                    coconutY: 200
                }),
                update: (state) => {
                    const elapsed = Date.now() - this.sceneStartTime;
                    if (elapsed > 3000 && !state.coconutFalling) {
                        state.coconutFalling = true;
                    }
                    if (state.coconutFalling && state.coconutY < this.renderer.height * 0.64 - 20) {
                        state.coconutY += 5;
                    }
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);
                    
                    // Coconut
                    if (state.coconutFalling) {
                        this.renderer.ctx.fillStyle = '#8B4513';
                        this.renderer.ctx.beginPath();
                        this.renderer.ctx.arc(640, state.coconutY, 8, 0, Math.PI * 2);
                        this.renderer.ctx.fill();
                    }
                }
            },
            
            watchingHorizon: {
                name: 'Watching Horizon',
                duration: 8000,
                weight: 25,
                init: () => ({ 
                    johnnyX: 650, 
                    johnnyY: this.renderer.height * 0.64,
                    shipX: -100,
                    shipVisible: Math.random() < 0.3
                }),
                update: (state) => {
                    if (state.shipVisible) {
                        state.shipX += 1;
                    }
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);
                    
                    // Occasionally a ship passes by
                    if (state.shipVisible && state.shipX < this.renderer.width + 100) {
                        this.drawShip(state.shipX, this.renderer.height * 0.55);
                    }
                }
            },
            
            fire: {
                name: 'Making Fire',
                duration: 15000,
                weight: 15,
                init: () => ({ 
                    johnnyX: 520, 
                    johnnyY: this.renderer.height * 0.64,
                    fireIntensity: 0
                }),
                update: (state) => {
                    state.fireIntensity = Math.min(1, (Date.now() - this.sceneStartTime) / 10000);
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);
                    this.drawFire(580, this.renderer.height * 0.65, state.fireIntensity);
                }
            }
        };
        
        // Initialize with idle scene
        this.setScene('idle');
    }

    setScene(sceneName) {
        if (!this.scenes[sceneName]) {
            console.warn(`Scene ${sceneName} not found`);
            return;
        }
        
        this.currentScene = this.scenes[sceneName];
        this.sceneState = this.currentScene.init();
        this.sceneStartTime = Date.now();
        this.frame = 0;
    }

    selectRandomScene() {
        // Weight-based random selection
        const totalWeight = Object.values(this.scenes).reduce((sum, scene) => sum + scene.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let [name, scene] of Object.entries(this.scenes)) {
            random -= scene.weight;
            if (random <= 0) {
                return name;
            }
        }
        
        return 'idle';
    }

    update() {
        this.frame++;
        
        // Check if scene should end
        const elapsed = Date.now() - this.sceneStartTime;
        if (elapsed > this.currentScene.duration) {
            this.setScene(this.selectRandomScene());
        }
        
        // Update scene state
        if (this.currentScene.update) {
            this.sceneState = this.currentScene.update(this.sceneState);
        }
    }

    render() {
        const holiday = this.calendar.getCurrentHoliday();
        const timeOfDay = this.calendar.getTimeOfDay();
        
        // Draw background
        this.renderer.drawBackground(timeOfDay, holiday);
        
        // Draw palm tree
        this.renderer.drawPalmTree(640, this.renderer.height * 0.64, holiday);
        
        // Draw clouds occasionally
        if (this.frame % 120 < 60) {
            this.renderer.drawCloud(200 + (this.frame % 800), 100, 0.8);
        }
        if (this.frame % 150 < 75) {
            this.renderer.drawCloud(800 + (this.frame % 600), 150, 1);
        }
        
        // Render current scene
        if (this.currentScene.render) {
            this.currentScene.render(this.sceneState);
        }
    }

    getCurrentSceneName() {
        return this.currentScene ? this.currentScene.name : 'Unknown';
    }

    drawRaft(x, y, progress) {
        // Raft construction visualization
        const logs = Math.floor(progress * 5);
        this.renderer.ctx.fillStyle = '#8B4513';
        
        for (let i = 0; i < logs; i++) {
            this.renderer.ctx.fillRect(x + i * 15, y, 10, 40);
        }
        
        if (progress > 0.5) {
            // Rope bindings
            this.renderer.ctx.strokeStyle = '#D2691E';
            this.renderer.ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                this.renderer.ctx.beginPath();
                this.renderer.ctx.moveTo(x, y + 10 + i * 10);
                this.renderer.ctx.lineTo(x + 70, y + 10 + i * 10);
                this.renderer.ctx.stroke();
            }
        }
    }

    drawShip(x, y) {
        // Simple ship silhouette
        this.renderer.ctx.fillStyle = '#333';
        this.renderer.ctx.fillRect(x, y, 60, 20);
        this.renderer.ctx.fillRect(x + 25, y - 30, 10, 30);
        
        // Sail
        this.renderer.ctx.fillStyle = '#FFF';
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x + 30, y - 30);
        this.renderer.ctx.lineTo(x + 55, y - 15);
        this.renderer.ctx.lineTo(x + 30, y);
        this.renderer.ctx.fill();
    }

    drawFire(x, y, intensity) {
        if (intensity === 0) return;
        
        const flameHeight = 40 * intensity;
        const time = this.frame * 0.1;
        
        // Wood logs
        this.renderer.ctx.fillStyle = '#8B4513';
        this.renderer.ctx.fillRect(x - 15, y, 10, 20);
        this.renderer.ctx.fillRect(x + 5, y, 10, 20);
        
        // Flames
        this.renderer.ctx.save();
        this.renderer.ctx.globalAlpha = 0.8;
        
        for (let i = 0; i < 3; i++) {
            const flameX = x - 5 + i * 5 + Math.sin(time + i) * 3;
            const flameY = y - flameHeight * (0.8 + Math.random() * 0.4);
            
            this.renderer.ctx.fillStyle = i === 1 ? '#FFA500' : '#FF4500';
            this.renderer.ctx.beginPath();
            this.renderer.ctx.moveTo(flameX, y);
            this.renderer.ctx.lineTo(flameX - 8, flameY);
            this.renderer.ctx.lineTo(flameX, flameY - 10);
            this.renderer.ctx.lineTo(flameX + 8, flameY);
            this.renderer.ctx.closePath();
            this.renderer.ctx.fill();
        }
        
        this.renderer.ctx.restore();
    }
}
