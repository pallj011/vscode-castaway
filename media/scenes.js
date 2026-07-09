// Scene management — the classic 1992 repertoire plus the modern conveniences
// that somehow all found their way to a deserted island.

class SceneManager {
    constructor(renderer, calendar) {
        this.renderer = renderer;
        this.calendar = calendar;
        this.currentScene = null;
        this.currentSceneKey = null;
        this.frame = 0;
        this.sceneStartTime = Date.now();

        const groundY = () => this.renderer.groundY();

        this.scenes = {
            // ----------------------------------------------------------
            // The classics
            // ----------------------------------------------------------
            idle: {
                name: 'Idle',
                duration: 5000,
                weight: 20,
                nightWeight: 10,
                init: () => ({ johnnyX: 550, johnnyY: groundY() }),
                update: (state) => state,
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);
                }
            },

            fishing: {
                name: 'Fishing',
                duration: 15000,
                weight: 18,
                nightWeight: 12,
                init: () => ({ johnnyX: 802, johnnyY: groundY(), bobbing: 0 }),
                update: (state) => {
                    state.bobbing++;
                    return state;
                },
                render: (state) => {
                    // Far right of the island so the line lands in open water
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'fishing', state.bobbing);
                }
            },

            building: {
                name: 'Building Raft',
                duration: 20000,
                weight: 12,
                nightWeight: 4,
                init: () => ({ johnnyX: 585, johnnyY: groundY(), raftProgress: 0 }),
                update: (state) => {
                    state.raftProgress = Math.min(1, (Date.now() - this.sceneStartTime) / 20000);
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'building', this.frame);
                    this.drawRaft(620, groundY() + 12, state.raftProgress);
                }
            },

            sleeping: {
                name: 'Sleeping',
                duration: 12000,
                weight: 15,
                nightWeight: 20,
                init: () => ({ johnnyX: 550, johnnyY: groundY() + 6, zzz: 0 }),
                update: (state) => {
                    state.zzz++;
                    return state;
                },
                render: (state) => {
                    const ctx = this.renderer.ctx;
                    this.renderer.drawJohnnyLying(state.johnnyX, state.johnnyY);

                    if (state.zzz % 60 < 40) {
                        ctx.fillStyle = '#000';
                        ctx.font = `${20 * this.renderer.textScale}px Arial`;
                        ctx.fillText('Z', state.johnnyX, state.johnnyY - 30);
                        if (state.zzz % 60 > 20) {
                            ctx.fillText('Z', state.johnnyX + 10, state.johnnyY - 45);
                            if (state.zzz % 60 > 30) {
                                ctx.fillText('Z', state.johnnyX + 20, state.johnnyY - 60);
                            }
                        }
                    }
                }
            },

            running: {
                name: 'Jogging',
                duration: 12000,
                weight: 12,
                nightWeight: 3,
                init: () => ({
                    johnnyX: 480,
                    johnnyY: groundY(),
                    direction: 1,
                    stepsCelebrated: false
                }),
                update: (state) => {
                    state.johnnyX += state.direction * 2;
                    if (state.johnnyX > 780 || state.johnnyX < 480) {
                        state.direction *= -1;
                    }
                    return state;
                },
                render: (state) => {
                    const legOffset = Math.abs(Math.sin(this.frame * 0.28)) * -2.5;
                    this.renderer.drawJohnny(
                        state.johnnyX, state.johnnyY + legOffset, 'running',
                        this.frame, { dir: state.direction });

                    // The smartwatch is very proud of him.
                    const elapsed = Date.now() - this.sceneStartTime;
                    if (elapsed > 6000 && elapsed < 11500) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX + 10, state.johnnyY - 95, '10,000 STEPS! GOAL!');
                        this.renderer.drawHearts(state.johnnyX, state.johnnyY - 70, this.frame, 2);
                    }
                }
            },

            coconutGathering: {
                name: 'Getting Coconut',
                duration: 8000,
                weight: 14,
                nightWeight: 4,
                init: () => ({
                    johnnyX: 600,
                    johnnyY: groundY(),
                    coconutFalling: false,
                    coconutY: 200
                }),
                update: (state) => {
                    const elapsed = Date.now() - this.sceneStartTime;
                    if (elapsed > 3000 && !state.coconutFalling) {
                        state.coconutFalling = true;
                    }
                    if (state.coconutFalling && state.coconutY < groundY() - 8) {
                        state.coconutY += 5;
                    }
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);
                    if (state.coconutFalling) {
                        this.renderer.ctx.fillStyle = '#8B4513';
                        this.renderer.ctx.beginPath();
                        this.renderer.ctx.arc(655, state.coconutY, 8, 0, Math.PI * 2);
                        this.renderer.ctx.fill();
                    }
                }
            },

            watchingHorizon: {
                name: 'Watching Horizon',
                duration: 10000,
                weight: 15,
                nightWeight: 8,
                init: () => ({
                    johnnyX: 720,
                    johnnyY: groundY(),
                    shipX: -100,
                    shipVisible: Math.random() < 0.3
                }),
                update: (state) => {
                    if (state.shipVisible) {
                        state.shipX += 1.5;
                    }
                    return state;
                },
                renderFar: (state) => {
                    if (state.shipVisible && state.shipX < this.renderer.width + 100) {
                        this.drawShip(state.shipX, this.renderer.height * 0.55);
                    }
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);
                }
            },

            fire: {
                name: 'Making Fire',
                duration: 15000,
                weight: 12,
                nightWeight: 18,
                init: () => ({ johnnyX: 520, johnnyY: groundY(), fireIntensity: 0 }),
                update: (state) => {
                    state.fireIntensity = Math.min(1, (Date.now() - this.sceneStartTime) / 10000);
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);
                    this.drawFire(580, groundY() + 6, state.fireIntensity);
                }
            },

            // ----------------------------------------------------------
            // The modern conveniences
            // ----------------------------------------------------------

            droneDelivery: {
                name: 'Drone Delivery',
                duration: 18000,
                weight: 14,
                nightWeight: 10,
                init: () => {
                    const surprises = [
                        'Socks. Again.',
                        'A second volleyball!',
                        'Phone charger. No outlets.',
                        'Inflatable raft! (pump sold separately)',
                        '4,000 coffee pods.',
                        'A snow shovel.',
                        'Scented candle: "Ocean Breeze".',
                        'A "BEACH LIFE" doormat.',
                        'One (1) left flip-flop.',
                        'A desk fan. Batteries not included.',
                        'An ice cube tray.',
                        'Sunscreen. SPF 4.',
                        'A karaoke machine!',
                        'Message-in-a-bottle kit. Novelty.',
                        'Tiny umbrellas. For drinks.',
                        "Someone else's returns.",
                        'A smart doorbell.',
                        'Bulk mayonnaise.',
                        '"How to Sail" — audiobook edition.',
                        'A rake and 50 leaf bags.'
                    ];
                    return {
                        droneX: -80,
                        droneY: 140,
                        lineLength: 26,
                        dropX: 545,
                        boxOnGround: false,
                        boxOpen: false,
                        johnnyX: 760,
                        johnnyY: groundY(),
                        surprise: surprises[
                            Math.floor(Math.random() * surprises.length)]
                    };
                },
                update: (state) => {
                    const t = Date.now() - this.sceneStartTime;
                    const gy = groundY();

                    if (t < 4000) {
                        // Fly in from the left
                        state.droneX = -80 + (state.dropX + 80) * (t / 4000);
                    } else if (t < 8000) {
                        // Hover and winch the box down
                        state.droneX = state.dropX;
                        const maxLine = gy - state.droneY - 6;
                        state.lineLength = 26 + (maxLine - 26) * ((t - 4000) / 4000);
                    } else if (t < 8600) {
                        state.boxOnGround = true;
                        state.lineLength = 0;
                    } else if (t < 13000) {
                        // Fly away up-right
                        state.boxOnGround = true;
                        state.droneX += 6;
                        state.droneY -= 2;
                    } else {
                        state.boxOnGround = true;
                    }

                    // Johnny cautiously approaches once the box is down
                    if (state.boxOnGround && state.johnnyX > state.dropX + 45) {
                        state.johnnyX -= 1.4;
                    } else if (state.boxOnGround && !state.boxOpen &&
                               state.johnnyX <= state.dropX + 45) {
                        state.boxOpen = t > 14500;
                    }
                    return state;
                },
                render: (state) => {
                    const gy = groundY();

                    if (state.boxOnGround) {
                        this.renderer.drawPackage(state.dropX, gy + 4, 1, { open: state.boxOpen });
                    }

                    if (state.droneX < this.renderer.width + 100 && state.droneY > -40) {
                        this.renderer.drawDrone(state.droneX, state.droneY, this.frame, {
                            lineLength: state.boxOnGround ? 0 : state.lineLength
                        });
                    }

                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);

                    if (state.boxOpen) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX + 20, state.johnnyY - 100, state.surprise);
                    } else if (state.boxOnGround && state.johnnyX <= state.dropX + 60) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX + 20, state.johnnyY - 100, 'I ordered this 3 years ago.');
                    }
                }
            },

            phoneSignal: {
                name: 'Searching for Signal',
                duration: 14000,
                weight: 13,
                nightWeight: 8,
                init: () => ({
                    johnnyX: 560,
                    johnnyY: groundY(),
                    direction: 1,
                    bars: 0
                }),
                update: (state) => {
                    state.johnnyX += state.direction * 0.7;
                    if (state.johnnyX > 700 || state.johnnyX < 520) {
                        state.direction *= -1;
                    }
                    // Mostly zero bars; a cruel flicker of hope now and then.
                    const cycle = this.frame % 300;
                    state.bars = cycle > 200 && cycle < 240 ? 1 : 0;
                    if (state.bars === 1) {
                        state.lastBarFrame = this.frame;
                    }
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(
                        state.johnnyX, state.johnnyY, 'armUp', this.frame,
                        { dir: state.direction });
                    const hand = this.renderer.raisedHandPos(
                        state.johnnyX, state.johnnyY, state.direction);
                    this.renderer.drawPhone(hand.x, hand.y - 8, { lit: true, angle: -0.2 });
                    this.renderer.drawSignalBars(hand.x + 14, hand.y - 18, state.bars);
                    // The one-bar excitement lingers a moment after the bar dies
                    if (state.lastBarFrame && this.frame - state.lastBarFrame < 130) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 10, state.johnnyY - 115, 'ONE BAR?! Don\'t move!');
                    } else if (this.frame % 260 < 190) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 10, state.johnnyY - 115, 'No service. Shocking.');
                    }
                }
            },

            selfie: {
                name: 'Island Selfie',
                duration: 11000,
                weight: 10,
                nightWeight: 2,
                init: () => ({ johnnyX: 600, johnnyY: groundY(), flash: 0 }),
                update: (state) => {
                    const t = Date.now() - this.sceneStartTime;
                    if (t > 6000 && t < 6200) {
                        state.flash = 1;
                    }
                    state.flash = Math.max(0, state.flash - 0.04);
                    return state;
                },
                render: (state) => {
                    const t = Date.now() - this.sceneStartTime;
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'armUp', this.frame);

                    // Selfie stick extends from the raised hand
                    const hand = this.renderer.raisedHandPos(state.johnnyX, state.johnnyY);
                    const px = hand.x + 34;
                    const py = hand.y - 22;
                    this.renderer.ctx.strokeStyle = '#666';
                    this.renderer.ctx.lineWidth = 2;
                    this.renderer.ctx.beginPath();
                    this.renderer.ctx.moveTo(hand.x, hand.y);
                    this.renderer.ctx.lineTo(px, py);
                    this.renderer.ctx.stroke();
                    this.renderer.drawPhone(px, py, { lit: true, angle: 0.3 });

                    if (t < 6000) {
                        const count = 3 - Math.floor(t / 2000);
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 20, state.johnnyY - 115, `${count}...`);
                    } else if (t > 6500) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 20, state.johnnyY - 115, '#castaway #day2947 #blessed');
                        this.renderer.drawHearts(px, py - 10, this.frame);
                    }

                    this.renderer.drawFlash(state.flash);
                }
            },

            doomscrolling: {
                name: 'Doomscrolling',
                duration: 14000,
                weight: 9,
                nightWeight: 20,
                init: () => ({
                    johnnyX: 580,
                    johnnyY: groundY(),
                    captions: ['Refreshing feed...', 'No new posts.', 'Refreshing feed...',
                        'Still no new posts.', '0 likes on my raft pic.']
                }),
                update: (state) => state,
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'sitting', this.frame);
                    // Phone in his lap, face lit by the glow
                    this.renderer.drawPhone(state.johnnyX + 14, state.johnnyY - 26, {
                        lit: true, angle: -0.5
                    });
                    const idx = Math.floor((Date.now() - this.sceneStartTime) / 3200) %
                        state.captions.length;
                    if (this.frame % 190 < 160) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX + 5, state.johnnyY - 90, state.captions[idx]);
                    }
                }
            },

            videoCall: {
                name: 'Video Call',
                duration: 13000,
                weight: 10,
                nightWeight: 8,
                init: () => ({ johnnyX: 560, johnnyY: groundY(), boxX: 640 }),
                update: (state) => state,
                render: (state) => {
                    const t = Date.now() - this.sceneStartTime;
                    const gy = groundY();

                    // Phone propped against a delivery box — improvised tripod
                    this.renderer.drawPackage(state.boxX, gy + 4, 0.8);
                    this.renderer.drawPhone(state.boxX - 22, gy - 12, { lit: true, angle: -0.15 });

                    // Johnny waves at the phone
                    const waving = Math.floor(this.frame / 40) % 2 === 0;
                    this.renderer.drawJohnny(
                        state.johnnyX, state.johnnyY, waving ? 'armUp' : 'standing', this.frame);

                    let status;
                    if (t < 4000) {
                        status = 'Connecting...';
                    } else if (t < 9000) {
                        const dots = '▮'.repeat(1 + (Math.floor(this.frame / 20) % 3)).padEnd(4, '▯');
                        status = `Buffering ${dots}`;
                    } else {
                        status = 'CALL FAILED';
                    }
                    this.renderer.drawSpeechBubble(state.boxX - 20, gy - 60, status, { tailDx: 5 });

                    if (t >= 9000 && this.frame % 200 < 160) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 15, state.johnnyY - 115, 'Mom? MOM?');
                    }
                }
            },

            satelliteInternet: {
                name: 'Satellite Internet',
                duration: 16000,
                weight: 10,
                nightWeight: 8,
                init: () => ({ johnnyX: 545, johnnyY: groundY() }),
                update: (state) => state,
                render: (state) => {
                    const gy = groundY();
                    this.renderer.drawSatDish(700, gy + 4, this.frame);
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'sitting', this.frame);
                    this.renderer.drawLaptop(605, gy + 2, {
                        progress: 0.02 + Math.sin(this.frame * 0.05) * 0.005,
                        label: 'RESCUE_MAP.ZIP  2%',
                        eta: 'ETA: 14 YEARS'
                    });
                    if (this.frame % 260 < 200) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 10, state.johnnyY - 95,
                            'Should have got the premium plan.');
                    }
                }
            },

            foodDelivery: {
                name: 'Food Delivery',
                duration: 13000,
                weight: 10,
                nightWeight: 4,
                init: () => ({
                    johnnyX: 810,
                    johnnyY: groundY(),
                    jetskiX: this.renderer.width + 80
                }),
                update: (state) => {
                    state.jetskiX -= 3.2;
                    return state;
                },
                renderFar: (state) => {
                    // Behind the island — it is, after all, not stopping here.
                    const waterY = this.renderer.height * 0.655;
                    if (state.jetskiX > -100) {
                        this.renderer.drawJetski(state.jetskiX, waterY, this.frame, -1);
                    }
                },
                render: (state) => {
                    const waving = Math.floor(this.frame / 30) % 2 === 0 && state.jetskiX > 200;
                    this.renderer.drawJohnny(
                        state.johnnyX, state.johnnyY, waving ? 'armUp' : 'standing', this.frame);

                    if (state.jetskiX > 300) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 20, state.johnnyY - 115, 'HEY! OVER HERE!');
                    } else if (state.jetskiX > -100) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 20, state.johnnyY - 115, '...wrong island.');
                    } else if (this.frame % 200 < 160) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 20, state.johnnyY - 115,
                            'Delivery fee here is $400 anyway.');
                    }
                }
            },

            robotVacuum: {
                name: 'Robot Vacuum',
                duration: 14000,
                weight: 10,
                nightWeight: 5,
                init: () => ({
                    johnnyX: 520,
                    johnnyY: groundY(),
                    roombaX: 600,
                    roombaDepth: 10,
                    vx: 1.6,
                    mode: 'cruise',
                    modeTimer: 90
                }),
                update: (state) => {
                    // Real roomba logic: drive straight, hit something (or
                    // just decide to), spin in place, pick a new random
                    // heading and speed, repeat.
                    state.modeTimer--;
                    if (state.mode === 'cruise') {
                        state.roombaX += state.vx;
                        const bumped = state.roombaX > 800 || state.roombaX < 470;
                        if (bumped || state.modeTimer <= 0) {
                            state.roombaX = Math.max(470, Math.min(800, state.roombaX));
                            state.bumped = bumped;
                            state.mode = 'spin';
                            state.modeTimer = 25 + Math.random() * 55;
                        }
                    } else if (state.modeTimer <= 0) {
                        // Bounce away from walls; otherwise any direction goes
                        let dir = Math.random() < 0.5 ? -1 : 1;
                        if (state.bumped) {
                            dir = state.roombaX > 635 ? -1 : 1;
                        }
                        state.vx = dir * (0.7 + Math.random() * 2.4);
                        state.roombaDepth = 5 + Math.random() * 12;
                        state.mode = 'cruise';
                        state.modeTimer = 40 + Math.random() * 170;
                    }
                    return state;
                },
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'standing', this.frame);
                    this.renderer.drawRoomba(
                        state.roombaX, groundY() + state.roombaDepth, this.frame,
                        { dir: state.vx > 0 ? 1 : -1, spinning: state.mode === 'spin' });
                    if (this.frame % 300 < 220) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX - 10, state.johnnyY - 115,
                            'It came in one of the boxes.');
                    }
                }
            },

            wilson: {
                name: 'Wilson',
                duration: 13000,
                weight: 12,
                nightWeight: 10,
                init: () => ({
                    johnnyX: 590,
                    johnnyY: groundY(),
                    lines: ['So... how was your day?', ' ',
                        'Mine too.', ' ', 'You always get me, Wilson.']
                }),
                update: (state) => state,
                render: (state) => {
                    this.renderer.drawJohnny(state.johnnyX, state.johnnyY, 'sitting', this.frame);
                    this.renderer.drawWilson(700, groundY() + 8);
                    const idx = Math.floor((Date.now() - this.sceneStartTime) / 3400) %
                        state.lines.length;
                    const line = state.lines[idx];
                    if (line.trim()) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX + 10, state.johnnyY - 90, line);
                    }
                }
            },

            stargazing: {
                name: 'Stargazing',
                duration: 17000,
                weight: 3,
                nightWeight: 22,
                init: () => ({
                    johnnyX: 570,
                    johnnyY: groundY() + 6,
                    satX: -30
                }),
                update: (state) => {
                    state.satX += 0.9;
                    return state;
                },
                render: (state) => {
                    const t = Date.now() - this.sceneStartTime;

                    this.renderer.drawJohnnyLying(
                        state.johnnyX, state.johnnyY, { awake: true });

                    // A satellite drifts across the sky, blinking.
                    if (state.satX < this.renderer.width + 40) {
                        const satY = 70 + Math.sin(state.satX * 0.012) * 12;
                        this.renderer.drawSatellite(state.satX, satY, this.frame);
                    }

                    // One shooting star, mid-scene.
                    if (t > 6000 && t < 7600) {
                        this.renderer.drawShootingStar((t - 6000) / 1600);
                    }

                    let line = null;
                    if (t < 4500) {
                        line = 'The stars are amazing out here.';
                    } else if (t > 7600 && t < 11000) {
                        line = 'A shooting star! I wish for a boat.';
                    } else if (t > 12500) {
                        line = "That one's a satellite. HEY! I'M DOWN HERE!";
                    }
                    if (line) {
                        this.renderer.drawSpeechBubble(
                            state.johnnyX + 15, state.johnnyY - 60, line);
                    }
                }
            }
        };

        this.setScene('idle');
    }

    setScene(sceneName) {
        if (!this.scenes[sceneName]) {
            console.warn(`Scene ${sceneName} not found`);
            return;
        }
        this.currentSceneKey = sceneName;
        this.currentScene = this.scenes[sceneName];
        this.sceneState = this.currentScene.init();
        this.sceneStartTime = Date.now();
        this.frame = 0;
    }

    // Scenes can carry a nightWeight so the island keeps a plausible
    // schedule: stargazing and doomscrolling at night, jogging by day.
    sceneWeight(scene) {
        if (this.calendar.isNight() && scene.nightWeight !== undefined) {
            return scene.nightWeight;
        }
        return scene.weight;
    }

    selectRandomScene() {
        const entries = Object.entries(this.scenes)
            .filter(([name]) => name !== this.currentSceneKey);
        const totalWeight = entries.reduce(
            (sum, [, scene]) => sum + this.sceneWeight(scene), 0);
        let random = Math.random() * totalWeight;
        for (const [name, scene] of entries) {
            random -= this.sceneWeight(scene);
            if (random <= 0) {
                return name;
            }
        }
        return 'idle';
    }

    update() {
        this.frame++;
        const elapsed = Date.now() - this.sceneStartTime;
        if (elapsed > this.currentScene.duration) {
            this.setScene(this.selectRandomScene());
        }
        if (this.currentScene.update) {
            this.sceneState = this.currentScene.update(this.sceneState);
        }
    }

    render() {
        const holiday = this.calendar.getCurrentHoliday();
        const timeOfDay = this.calendar.getTimeOfDay();
        const isNight = timeOfDay === 'night';

        // Layer order: sky/water → clouds → far actors (behind the island:
        // ships, jetskis) → island → palm → scene actors.
        this.renderer.drawBackground(timeOfDay, holiday);

        if (this.frame % 120 < 60) {
            this.renderer.drawCloud(200 + (this.frame % 800), 100, 0.8);
        }
        if (!isNight && this.frame % 150 < 75) {
            this.renderer.drawCloud(800 + (this.frame % 600), 150, 1);
        }

        if (this.currentScene.renderFar) {
            this.currentScene.renderFar(this.sceneState);
        }

        this.renderer.drawIsland();
        this.renderer.drawPalmTree(640, this.renderer.groundY(), holiday);
        if (holiday) {
            this.renderer.drawHolidayDecoration(holiday);
        }

        if (isNight) {
            // Moonlit ambiance: dim the world, then let the scene's light
            // sources (fire, phone screens, drone lights) draw on top.
            this.renderer.drawNightOverlay(0.22);
            this.renderer.drawFireflies(this.frame);
        }

        if (this.currentScene.render) {
            this.currentScene.render(this.sceneState);
        }
    }

    getCurrentSceneName() {
        return this.currentScene ? this.currentScene.name : 'Unknown';
    }

    drawRaft(x, y, progress) {
        const ctx = this.renderer.ctx;
        const logs = Math.floor(progress * 5);
        ctx.fillStyle = '#8B4513';
        for (let i = 0; i < logs; i++) {
            ctx.fillRect(x + i * 15, y, 10, 40);
        }
        if (progress > 0.5) {
            ctx.strokeStyle = '#D2691E';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x, y + 10 + i * 10);
                ctx.lineTo(x + 70, y + 10 + i * 10);
                ctx.stroke();
            }
        }
    }

    drawShip(x, y) {
        const ctx = this.renderer.ctx;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, 60, 20);
        ctx.fillRect(x + 25, y - 30, 10, 30);
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(x + 30, y - 30);
        ctx.lineTo(x + 55, y - 15);
        ctx.lineTo(x + 30, y);
        ctx.fill();
    }

    drawFire(x, y, intensity) {
        if (intensity === 0) return;
        const ctx = this.renderer.ctx;
        const flameHeight = 46 * intensity;
        const time = this.frame * 0.1;

        // Warm light pool on the sand — the campfire's whole point at night.
        const isNight = this.calendar.isNight();
        const glowR = (75 + Math.sin(time * 2) * 7) * intensity;
        const glow = ctx.createRadialGradient(x, y - 5, 5, x, y - 5, glowR);
        glow.addColorStop(0, `rgba(255, 160, 60, ${isNight ? 0.45 : 0.18})`);
        glow.addColorStop(1, 'rgba(255, 160, 60, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y - 5, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Smoke drifts up once the fire has caught
        if (intensity > 0.5) {
            ctx.save();
            for (let i = 0; i < 3; i++) {
                const t = ((this.frame * 0.8 + i * 33) % 100) / 100;
                ctx.globalAlpha = (1 - t) * 0.25;
                ctx.fillStyle = '#AAB2B8';
                ctx.beginPath();
                ctx.arc(
                    x + Math.sin(time * 1.3 + i * 2) * (4 + t * 14) + t * 8,
                    y - flameHeight - 12 - t * 44,
                    3 + t * 7, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Driftwood logs leaning into a teepee
        ctx.lineCap = 'round';
        const logs = [
            { x1: -20, y1: 14, x2: 4, y2: -4, c: '#6E3A0F', w: 6 },
            { x1: 20, y1: 14, x2: -4, y2: -4, c: '#8B4513', w: 6 },
            { x1: -14, y1: 16, x2: 10, y2: 0, c: '#7A4A1E', w: 5 },
            { x1: 15, y1: 17, x2: -8, y2: 2, c: '#9C5A26', w: 5 }
        ];
        for (const l of logs) {
            ctx.strokeStyle = l.c;
            ctx.lineWidth = l.w;
            ctx.beginPath();
            ctx.moveTo(x + l.x1, y + l.y1);
            ctx.lineTo(x + l.x2, y + l.y2);
            ctx.stroke();
        }

        // Layered flames: red-orange shell, orange body, yellow core.
        ctx.save();
        const layers = [
            { c: '#E5450F', w: 15, h: 1.0, a: 0.85 },
            { c: '#FF9500', w: 10, h: 0.72, a: 0.9 },
            { c: '#FFE066', w: 6, h: 0.45, a: 0.95 }
        ];
        for (let i = 0; i < layers.length; i++) {
            const l = layers[i];
            const flick = 0.8 + Math.abs(Math.sin(time * 3 + i * 1.7)) * 0.35;
            const h = flameHeight * l.h * flick;
            const sway = Math.sin(time * 2.2 + i) * 4;
            ctx.globalAlpha = l.a;
            ctx.fillStyle = l.c;
            ctx.beginPath();
            ctx.moveTo(x - l.w, y + 6);
            ctx.quadraticCurveTo(x - l.w * 1.4, y - h * 0.45, x + sway, y - h);
            ctx.quadraticCurveTo(x + l.w * 1.4, y - h * 0.45, x + l.w, y + 6);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Embers spiraling up and burning out
        ctx.save();
        const emberCount = Math.round(6 * intensity);
        for (let i = 0; i < emberCount; i++) {
            const t = ((this.frame * 1.5 + i * 37) % 90) / 90;
            ctx.globalAlpha = (1 - t) * 0.9;
            ctx.fillStyle = i % 2 ? '#FFB347' : '#FF6A2A';
            ctx.fillRect(
                x + Math.sin(this.frame * 0.08 + i * 2.4) * (5 + t * 12),
                y - 6 - t * (46 + i * 5),
                2, 2);
        }
        ctx.restore();

        // Stone fire ring, because Johnny read a survival blog once
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const sx = x + Math.cos(a) * 27;
            const sy = y + 15 + Math.sin(a) * 5;
            ctx.fillStyle = i % 2 ? '#9A9A9A' : '#7E7E7E';
            ctx.beginPath();
            ctx.ellipse(sx, sy, 5, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SceneManager };
}
