// Renderer — classic (1992 VGA) and modern graphics modes.
// Ported from the legacy prototype, plus modern-era props: drones, packages,
// phones, laptops, satellite dishes, jetskis, robot vacuums, and one volleyball.

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.graphicsMode = 'classic';
        // Multiplier applied to all drawn text (speech bubbles, labels).
        // Set from the vscode-castaway.textSize setting.
        this.textScale = 1;
        // Internal scene coordinates are always 1200x600; the engine scales
        // the canvas transform to fit the panel.
        this.width = 1200;
        this.height = 600;

        this.classicColors = {
            sky: '#00DDFF',
            skyNight: '#000055',
            water: '#0044BB',
            waterDeep: '#002288',
            waterHorizon: '#5599DD',
            waterMid: '#0066CC',
            sand: '#FFDD55',
            sandDark: '#DDAA33',
            sandHighlight: '#FFEE88',
            palmTrunk: '#AA5522',
            palmTrunkDark: '#884411',
            palmLeaf: '#00DD00',
            palmLeafDark: '#00AA00',
            johnny: '#FFCC99',
            johnnyShirt: '#DD0000',
            johnnyShorts: '#0055CC',
            johnnyBeard: '#664422',
            black: '#000000',
            white: '#FFFFFF'
        };

        this.modernColors = {
            sky: ['#87CEEB', '#E0F6FF'],
            skyNight: ['#0a0a2e', '#1a1a4d', '#4a0a4a'],
            water: ['#1e5a7a', '#4682B4', '#5F9EA0'],
            waterDeep: ['#0d3a5a', '#1e5a7a'],
            sand: ['#F4D03F', '#F4A460', '#DEB887'],
            palmTrunk: ['#8B4513', '#654321', '#4a2511'],
            palmLeaf: ['#1a6b1a', '#228B22', '#32CD32', '#4ade80']
        };
    }

    setGraphicsMode(mode) {
        this.graphicsMode = mode;
        this.ctx.imageSmoothingEnabled = mode !== 'classic';
    }

    // Accepts a named size from settings or a raw multiplier.
    setTextSize(size) {
        const named = { small: 0.8, medium: 1, large: 1.4, 'x-large': 1.8 };
        this.textScale = typeof size === 'number' ? size : (named[size] || 1);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // The sand line Johnny stands on.
    groundY() {
        return this.height * 0.64;
    }

    // timeOfDay: 'morning' | 'day'/'afternoon' | 'evening' | 'night'
    drawBackground(timeOfDay = 'day', holiday = null) {
        if (timeOfDay === 'afternoon') {
            timeOfDay = 'day';
        }
        this.timeOfDay = timeOfDay;
        const isNight = timeOfDay === 'night';

        // Sky
        if (this.graphicsMode === 'classic') {
            const skyColors = {
                morning: '#77CCEE',
                day: this.classicColors.sky,
                evening: '#FF8844',
                night: this.classicColors.skyNight
            };
            this.ctx.fillStyle = skyColors[timeOfDay] || skyColors.day;
            this.ctx.fillRect(0, 0, this.width, this.height * 0.6);

            // Golden-hour horizon band
            if (timeOfDay === 'morning' || timeOfDay === 'evening') {
                this.ctx.fillStyle = timeOfDay === 'evening' ? '#FFCC66' : '#FFE4B8';
                this.ctx.fillRect(0, this.height * 0.6 - 45, this.width, 45);
            }
        } else {
            const stops = {
                morning: [[0, '#7FB7E0'], [0.7, '#FFD9A8'], [1, '#FFE9C9']],
                day: [[0, '#87CEEB'], [1, '#E0F6FF']],
                evening: [[0, '#3D2B56'], [0.55, '#C4456A'], [1, '#FF9E5E']],
                night: [[0, '#0a0a2e'], [0.6, '#1a1a4d'], [1, '#2E1A4D']]
            }[timeOfDay] || [[0, '#87CEEB'], [1, '#E0F6FF']];
            const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.6);
            for (const [pos, color] of stops) {
                skyGradient.addColorStop(pos, color);
            }
            this.ctx.fillStyle = skyGradient;
            this.ctx.fillRect(0, 0, this.width, this.height * 0.6);
        }

        if (isNight) {
            this.drawStars();
        }
        this.drawCelestial(timeOfDay);

        // Water
        if (this.graphicsMode === 'classic') {
            const waterStart = this.height * 0.6;
            const palette = {
                morning: { base: '#0055CC', horizon: '#88BBEE', deep: '#003399', mid: '#0077DD' },
                day: {
                    base: this.classicColors.water,
                    horizon: this.classicColors.waterHorizon,
                    deep: this.classicColors.waterDeep,
                    mid: this.classicColors.waterMid
                },
                evening: { base: '#284488', horizon: '#EE9955', deep: '#1A2F66', mid: '#3355AA' },
                night: { base: '#001155', horizon: '#223377', deep: '#000D33', mid: '#112266' }
            }[timeOfDay];

            this.ctx.fillStyle = palette.base;
            this.ctx.fillRect(0, waterStart, this.width, this.height - waterStart);

            this.ctx.fillStyle = palette.horizon;
            this.ctx.fillRect(0, waterStart, this.width, 25);

            // Painted horizontal water strokes (deterministic — no flicker)
            for (let y = waterStart + 25; y < this.height; y += 3) {
                const variation = Math.sin(y * 0.1) * 0.3 + Math.cos(y * 0.05) * 0.3;
                this.ctx.globalAlpha = 0.2 + Math.abs(variation) * 0.3;
                this.ctx.fillStyle = variation > 0 ? palette.deep : palette.mid;
                const xOffset = Math.sin(y * 0.7) * 25;
                this.ctx.fillRect(xOffset, y, this.width + 50, 2 + (y % 2));
            }

            this.ctx.globalAlpha = 0.3;
            for (let i = 0; i < 20; i++) {
                const y = waterStart + 50 + ((i * 137) % (this.height - waterStart - 50));
                const x = (i * 271) % this.width;
                this.ctx.fillStyle = palette.deep;
                this.ctx.fillRect(x, y, 100 + (i * 53) % 200, 3 + (i % 4));
            }
            this.ctx.globalAlpha = 1.0;
        } else {
            const stops = {
                morning: [[0, '#7FB2C9'], [0.4, '#4682B4'], [1, '#2A5E7A']],
                day: [
                    [0, this.modernColors.water[0]],
                    [0.4, this.modernColors.water[1]],
                    [1, this.modernColors.water[2]]
                ],
                evening: [[0, '#C97B5A'], [0.3, '#6B5A8A'], [1, '#1E3A5A']],
                night: [[0, '#16234A'], [0.5, '#0D2440'], [1, '#061226']]
            }[timeOfDay];
            const waterGradient = this.ctx.createLinearGradient(
                0, this.height * 0.6, 0, this.height);
            for (const [pos, color] of stops) {
                waterGradient.addColorStop(pos, color);
            }
            this.ctx.fillStyle = waterGradient;
            this.ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.4);

            if (!isNight) {
                this.drawWaterShimmer();
            }
            this.drawWaves(isNight ? 0.5 : 1);
        }

        // Sun/moon reflection on the water at golden hour and night
        if (timeOfDay === 'evening' || isNight) {
            this.drawGlitterPath(timeOfDay);
        }
    }

    // The island is its own layer so far-water actors (ships, jetskis) can
    // pass BEHIND it: background → far actors → island → near actors.
    drawIsland() {
        const ctx = this.ctx;
        const centerX = 650;
        const islandY = this.height * 0.72;
        const time = Date.now() / 1000;

        // Wet sand ring where the water laps
        ctx.fillStyle = this.graphicsMode === 'classic' ? '#C09040' : '#B08850';
        ctx.beginPath();
        ctx.ellipse(centerX, islandY + 4, 252, 78, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.graphicsMode === 'classic') {
            ctx.fillStyle = this.classicColors.sand;
            ctx.beginPath();
            ctx.ellipse(centerX, islandY, 240, 70, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = this.classicColors.sandHighlight;
            ctx.beginPath();
            ctx.ellipse(centerX, islandY - 10, 220, 55, 0, Math.PI, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = this.classicColors.sandDark;
            ctx.beginPath();
            ctx.ellipse(centerX, islandY + 8, 235, 65, 0, 0, Math.PI);
            ctx.fill();
        } else {
            const sandGradient = ctx.createRadialGradient(
                centerX, islandY, 0, centerX, islandY, 240);
            sandGradient.addColorStop(0, this.modernColors.sand[0]);
            sandGradient.addColorStop(0.5, this.modernColors.sand[1]);
            sandGradient.addColorStop(0.9, this.modernColors.sand[2]);
            sandGradient.addColorStop(1, '#C9A06A');
            ctx.fillStyle = sandGradient;
            ctx.beginPath();
            ctx.ellipse(centerX, islandY, 240, 72, 0, 0, Math.PI * 2);
            ctx.fill();

            this.drawSandTexture(centerX, islandY);
        }

        // Foam lapping at the shoreline — two breathing arcs
        ctx.save();
        ctx.lineWidth = 3;
        for (let i = 0; i < 2; i++) {
            const pulse = Math.sin(time * 1.4 + i * 2.1);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 - i * 0.12 + pulse * 0.08})`;
            ctx.beginPath();
            ctx.ellipse(
                centerX, islandY + 4 + i * 5,
                252 + i * 9 + pulse * 3, 78 + i * 4 + pulse * 1.5,
                0, 0.15 * Math.PI, 0.85 * Math.PI);
            ctx.stroke();
        }
        ctx.restore();

        this.drawBeachDecor(centerX, islandY);
    }

    // A little set dressing: shells, a starfish, a grass tuft, pebbles.
    drawBeachDecor(centerX, islandY) {
        const ctx = this.ctx;

        // Starfish, front-left
        const sfx = centerX - 150, sfy = islandY + 28;
        ctx.fillStyle = '#E8825A';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
            const a2 = a + Math.PI / 5;
            ctx.lineTo(sfx + Math.cos(a) * 9, sfy + Math.sin(a) * 7);
            ctx.lineTo(sfx + Math.cos(a2) * 3.5, sfy + Math.sin(a2) * 3);
        }
        ctx.closePath();
        ctx.fill();

        // Two shells, front-right
        for (const [x, y, r, c] of [
            [centerX + 130, islandY + 34, 6, '#F2E8DC'],
            [centerX + 168, islandY + 22, 4.5, '#E8C8C0']
        ]) {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(x, y, r, Math.PI, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(120, 100, 90, 0.5)';
            ctx.lineWidth = 1;
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + i * r * 0.55, y - r * 0.9);
                ctx.stroke();
            }
        }

        // Grass tuft, left side
        const gx = centerX - 195, gy = islandY - 4;
        ctx.strokeStyle = this.graphicsMode === 'classic' ? '#00AA00' : '#3E8E41';
        ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.quadraticCurveTo(gx + i * 4, gy - 10, gx + i * 6, gy - 16 + Math.abs(i) * 3);
            ctx.stroke();
        }

        // Pebbles
        ctx.fillStyle = 'rgba(150, 130, 100, 0.8)';
        for (const [px, py, pr] of [[centerX - 60, islandY + 42, 3],
            [centerX - 48, islandY + 45, 2], [centerX + 85, islandY + 44, 2.5]]) {
            ctx.beginPath();
            ctx.ellipse(px, py, pr + 1, pr, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Sun (position and color vary through the day) or moon (night).
    drawCelestial(timeOfDay) {
        const pos = {
            morning: { x: 240, y: 150 },
            day: { x: 1000, y: 100 },
            evening: { x: 900, y: 235 },
            night: { x: 980, y: 110 }
        }[timeOfDay] || { x: 1000, y: 100 };
        this.celestialX = pos.x;
        this.celestialY = pos.y;

        if (timeOfDay === 'night') {
            this.drawMoon(pos.x, pos.y);
            return;
        }

        const sunColor = {
            morning: { body: '#FFEE66', hl: '#FFF7AA' },
            day: { body: '#FFFF00', hl: '#FFFFAA' },
            evening: { body: '#FF6622', hl: '#FFAA44' }
        }[timeOfDay];

        if (this.graphicsMode === 'classic') {
            this.ctx.fillStyle = sunColor.body;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = sunColor.hl;
            this.ctx.beginPath();
            this.ctx.arc(pos.x - 5, pos.y - 5, 15, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            const glow = this.ctx.createRadialGradient(
                pos.x, pos.y, 0, pos.x, pos.y, 80);
            glow.addColorStop(0, '#FFFACD');
            glow.addColorStop(0.4, sunColor.body);
            glow.addColorStop(0.7, timeOfDay === 'evening' ? '#E2553A' : '#FFA500');
            glow.addColorStop(1, 'rgba(255,255,255,0)');
            this.ctx.fillStyle = glow;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 80, 0, Math.PI * 2);
            this.ctx.fill();

            if (timeOfDay === 'day') {
                this.drawSunRays(pos.x, pos.y);
            }
        }
    }

    // A waxing crescent with craters (and a halo in modern mode).
    drawMoon(x, y) {
        const ctx = this.ctx;

        if (this.graphicsMode === 'modern') {
            const halo = ctx.createRadialGradient(x, y, 20, x, y, 75);
            halo.addColorStop(0, 'rgba(240, 240, 220, 0.35)');
            halo.addColorStop(1, 'rgba(240, 240, 220, 0)');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(x, y, 75, 0, Math.PI * 2);
            ctx.fill();
        }

        // Full disc
        ctx.fillStyle = '#EEEEDC';
        ctx.beginPath();
        ctx.arc(x, y, 34, 0, Math.PI * 2);
        ctx.fill();

        // Craters
        ctx.fillStyle = '#D5D5C0';
        for (const [cx, cy, r] of [[-10, -8, 6], [8, 4, 8], [-4, 14, 4], [14, -12, 4]]) {
            ctx.beginPath();
            ctx.arc(x + cx, y + cy, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Crescent shadow — offset disc in the sky color
        ctx.fillStyle = this.graphicsMode === 'classic'
            ? this.classicColors.skyNight
            : '#141438';
        ctx.beginPath();
        ctx.arc(x - 14, y - 6, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Shimmering reflection column on the water under the sun/moon.
    drawGlitterPath(timeOfDay) {
        const ctx = this.ctx;
        const x = this.celestialX || 980;
        const time = Date.now() / 1000;
        const color = timeOfDay === 'night' ? '255, 245, 210' : '255, 180, 90';

        ctx.save();
        for (let y = this.height * 0.62; y < this.height; y += 12) {
            const depth = (y - this.height * 0.62) / (this.height * 0.38);
            const w = 14 + depth * 60 + Math.sin(time * 2 + y * 0.35) * 12;
            const xJitter = Math.sin(time * 1.3 + y * 0.8) * (6 + depth * 18);
            const alpha = (0.22 - depth * 0.12) *
                (0.7 + 0.3 * Math.sin(time * 3 + y));
            if (alpha <= 0.02) continue;
            ctx.fillStyle = `rgba(${color}, ${alpha.toFixed(3)})`;
            ctx.fillRect(x - w / 2 + xJitter, y, w, 3);
        }
        ctx.restore();
    }

    // Wandering pulsing fireflies over the island at night.
    drawFireflies(frame) {
        const ctx = this.ctx;
        const t = frame / 60;
        ctx.save();
        for (let i = 0; i < 7; i++) {
            const cx = 440 + ((i * 97) % 420);
            const baseY = this.groundY() - 14 - ((i * 31) % 70);
            const x = cx + Math.sin(t * 0.7 + i * 2.1) * 28;
            const y = baseY + Math.sin(t * 1.3 + i) * 14;
            const pulse = 0.25 + 0.75 * Math.abs(Math.sin(t * 2 + i * 1.7));

            ctx.globalAlpha = pulse * 0.35;
            ctx.fillStyle = '#D8FF66';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // A meteor streak; progress runs 0..1 over the star's life.
    drawShootingStar(progress) {
        if (progress <= 0 || progress >= 1) return;
        const ctx = this.ctx;
        const sx = 280, sy = 55, ex = 560, ey = 150;
        const x = sx + (ex - sx) * progress;
        const y = sy + (ey - sy) * progress;
        const fade = Math.sin(progress * Math.PI);

        ctx.save();
        const tail = ctx.createLinearGradient(x, y, x - 90, y - 32);
        tail.addColorStop(0, `rgba(255, 255, 255, ${0.9 * fade})`);
        tail.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = tail;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 90, y - 32);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // A satellite crossing the sky. Definitely not a rescue plane.
    drawSatellite(x, y, frame) {
        const ctx = this.ctx;
        ctx.save();
        // Solar panels
        ctx.fillStyle = '#3A5A8C';
        ctx.fillRect(x - 12, y - 2, 8, 4);
        ctx.fillRect(x + 4, y - 2, 8, 4);
        // Body
        ctx.fillStyle = '#CFCFCF';
        ctx.fillRect(x - 4, y - 3, 8, 6);
        // Blinking beacon
        if (frame % 60 < 12) {
            ctx.fillStyle = '#FF5555';
            ctx.beginPath();
            ctx.arc(x, y - 6, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // Johnny flat on his back. awake: eyes open, arms behind head (stargazing).
    drawJohnnyLying(x, y, opts = {}) {
        const ctx = this.ctx;
        const p = this.johnnyPalette();

        if (this.graphicsMode === 'modern') {
            this.drawShadow(x + 4, y + 4, 30, 4, 0.25);
        }

        // Torso (ragged tee)
        ctx.fillStyle = p.shirt;
        ctx.beginPath();
        ctx.moveTo(x - 18, y - 11);
        ctx.lineTo(x + 6, y - 12);
        ctx.lineTo(x + 8, y + 3);
        ctx.lineTo(x + 4, y + 1);
        ctx.lineTo(x, y + 3.5);
        ctx.lineTo(x - 4, y + 1);
        ctx.lineTo(x - 8, y + 3.5);
        ctx.lineTo(x - 18, y + 3);
        ctx.closePath();
        ctx.fill();

        // Shorts
        ctx.fillStyle = p.shorts;
        ctx.fillRect(x + 6, y - 12, 13, 15);

        // Legs — one knee lazily bent when awake
        this.drawLimb(x + 19, y - 6, x + 30, y - 5, x + 40, y - 2, 5, p.skinShade);
        if (opts.awake) {
            this.drawLimb(x + 19, y - 3, x + 27, y - 18, x + 38, y - 4, 5, p.skin);
        } else {
            this.drawLimb(x + 19, y - 3, x + 31, y - 1, x + 42, y + 1, 5, p.skin);
        }

        // Head, face to the sky
        ctx.fillStyle = p.skin;
        ctx.beginPath();
        ctx.arc(x - 26, y - 5, 8.5, 0, Math.PI * 2);
        ctx.fill();

        // Hair spilling onto the sand + beard pointing up
        ctx.fillStyle = p.hair;
        ctx.beginPath();
        ctx.arc(x - 28, y - 5, 8.5, Math.PI * 0.6, Math.PI * 1.7);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 22, y - 12);
        ctx.quadraticCurveTo(x - 16, y - 15, x - 17, y - 7);
        ctx.closePath();
        ctx.fill();

        if (opts.awake) {
            // Arms folded behind the head
            ctx.strokeStyle = p.skin;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x - 14, y - 9);
            ctx.quadraticCurveTo(x - 30, y - 22, x - 36, y - 8);
            ctx.stroke();

            // Eyes looking up
            ctx.fillStyle = '#2A1A0E';
            ctx.beginPath();
            ctx.arc(x - 28, y - 9, 1.3, 0, Math.PI * 2);
            ctx.arc(x - 23, y - 9, 1.3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Closed eyes
            ctx.strokeStyle = '#2A1A0E';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x - 29.5, y - 8);
            ctx.lineTo(x - 26.5, y - 8);
            ctx.moveTo(x - 24.5, y - 8);
            ctx.lineTo(x - 21.5, y - 8);
            ctx.stroke();
        }
    }

    drawSandTexture(centerX, centerY) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        for (let i = 0; i < 30; i++) {
            // Deterministic speckle pattern
            const angle = (i * 2.399963);
            const dist = 180 * ((i * 0.618034) % 1);
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist * 0.4;
            this.ctx.fillStyle = i % 2 ? '#D2A679' : '#C19A6B';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1 + (i % 3), 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawShadow(x, y, width, height, opacity = 0.3) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawSunRays(x, y) {
        const time = Date.now() / 1000;
        this.ctx.save();
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i + time * 0.1;
            const rayLength = 120 + Math.sin(time * 2 + i) * 10;
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(x + Math.cos(angle) * 60, y + Math.sin(angle) * 60);
            this.ctx.lineTo(x + Math.cos(angle) * rayLength, y + Math.sin(angle) * rayLength);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawStars() {
        const time = Date.now() / 1000;
        this.ctx.save();
        const stars = [
            { x: 100, y: 50, size: 2 }, { x: 200, y: 80, size: 1.5 }, { x: 350, y: 40, size: 1 },
            { x: 450, y: 100, size: 2.5 }, { x: 600, y: 60, size: 1.5 }, { x: 750, y: 90, size: 1 },
            { x: 850, y: 45, size: 2 }, { x: 950, y: 120, size: 1.5 }, { x: 150, y: 140, size: 1 },
            { x: 300, y: 160, size: 2 }, { x: 500, y: 180, size: 1.5 }, { x: 700, y: 150, size: 1 },
            { x: 900, y: 170, size: 2.5 }, { x: 250, y: 200, size: 1 }, { x: 550, y: 220, size: 1.5 }
        ];
        stars.forEach((star, i) => {
            const twinkle = 0.3 + Math.abs(Math.sin(time * 2 + i * 0.5)) * 0.7;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            if (this.graphicsMode === 'classic') {
                // Chunky VGA star pixels
                const px = Math.round(star.size + 1);
                this.ctx.fillRect(star.x, star.y, px, px);
                return;
            }
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            if (twinkle > 0.8) {
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${(twinkle - 0.8) * 2})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(star.x - star.size * 2, star.y);
                this.ctx.lineTo(star.x + star.size * 2, star.y);
                this.ctx.moveTo(star.x, star.y - star.size * 2);
                this.ctx.lineTo(star.x, star.y + star.size * 2);
                this.ctx.stroke();
            }
        });
        this.ctx.restore();
    }

    drawWaterShimmer() {
        const time = Date.now() / 1000;
        this.ctx.save();
        this.ctx.globalAlpha = 0.15;
        for (let i = 0; i < 8; i++) {
            const x = (time * 30 + i * 150) % this.width;
            const y = this.height * 0.62 + Math.sin(time + i) * 10;
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 40);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - 40, y - 40, 80, 80);
        }
        this.ctx.restore();
    }

    drawWaves(intensity = 1) {
        const time = Date.now() / 1000;
        for (let i = 0; i < 6; i++) {
            this.ctx.beginPath();
            const y = this.height * 0.63 + i * 35;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${(0.4 - i * 0.05) * intensity})`;
            this.ctx.lineWidth = 2.5;
            for (let x = 0; x < this.width; x += 15) {
                const waveY = y + Math.sin((x + time * (40 + i * 10) + i * 40) / (25 + i * 5)) * (6 - i) * 0.8;
                if (x === 0) {
                    this.ctx.moveTo(x, waveY);
                } else {
                    this.ctx.lineTo(x, waveY);
                }
            }
            this.ctx.stroke();
        }
    }

    drawPalmTree(x, y, holiday = null) {
        const ctx = this.ctx;
        const classic = this.graphicsMode === 'classic';
        const trunkHeight = 185;
        const lean = 38;
        const time = Date.now() / 1000;
        const sway = Math.sin(time * 0.8) * 3; // gentle breeze at the crown

        const topX = x + lean;
        const topY = y - trunkHeight;

        if (!classic) {
            this.drawShadow(x + 34, y + 6, 42, 9, 0.22);
        }

        // Tapered, curved trunk: sampled along a quadratic spine
        const baseW = 24;
        const topW = 11;
        const cpX = x + lean * 0.15;
        const cpY = y - trunkHeight * 0.55;
        const pt = (t) => ({
            x: (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cpX + t * t * topX,
            y: (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cpY + t * t * topY,
            w: baseW + (topW - baseW) * t
        });
        const N = 14;

        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
            const p = pt(i / N);
            if (i === 0) {
                ctx.moveTo(p.x - p.w / 2, p.y);
            } else {
                ctx.lineTo(p.x - p.w / 2, p.y);
            }
        }
        for (let i = N; i >= 0; i--) {
            const p = pt(i / N);
            ctx.lineTo(p.x + p.w / 2, p.y);
        }
        ctx.closePath();
        if (classic) {
            ctx.fillStyle = this.classicColors.palmTrunk;
        } else {
            const g = ctx.createLinearGradient(x - 15, 0, x + lean + 20, 0);
            g.addColorStop(0, '#9A6B3F');
            g.addColorStop(0.5, '#7A5230');
            g.addColorStop(1, '#5C3D22');
            ctx.fillStyle = g;
        }
        ctx.fill();

        // Ring segments following the taper
        ctx.strokeStyle = classic
            ? this.classicColors.palmTrunkDark
            : 'rgba(70, 45, 25, 0.55)';
        ctx.lineWidth = classic ? 3 : 2.5;
        for (let i = 1; i <= 8; i++) {
            const p = pt(i / 9);
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.w / 2, 3.2, 0, 0, Math.PI);
            ctx.stroke();
        }

        // Sunlit edge
        ctx.strokeStyle = classic ? '#CC7733' : 'rgba(225, 180, 120, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
            const p = pt(i / N);
            if (i === 0) {
                ctx.moveTo(p.x - p.w / 2 + 2.5, p.y);
            } else {
                ctx.lineTo(p.x - p.w / 2 + 2.5, p.y);
            }
        }
        ctx.stroke();

        // Root flare
        ctx.fillStyle = classic ? this.classicColors.palmTrunkDark : '#5C3D22';
        ctx.beginPath();
        ctx.ellipse(x, y + 1, baseW * 0.85, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        this.drawPalmCrown(topX, topY, sway, holiday);
    }

    // The crown: 7 drooping, tapered leaf fronds plus coconuts.
    drawPalmCrown(x, y, sway, holiday) {
        const ctx = this.ctx;
        const classic = this.graphicsMode === 'classic';
        const fronds = [
            { a: Math.PI * 0.96, L: 94 },
            { a: Math.PI * 0.78, L: 98 },
            { a: Math.PI * 0.62, L: 88 },
            { a: Math.PI * 0.50, L: 84 },
            { a: Math.PI * 0.38, L: 90 },
            { a: Math.PI * 0.20, L: 100 },
            { a: Math.PI * 0.04, L: 96 }
        ];

        fronds.forEach((f, i) => {
            const dx = Math.cos(f.a);
            const dy = -Math.sin(f.a); // canvas y-down; fronds fan upward
            const droop = 30 * (1 - Math.abs(dy)) + 10;
            const tipX = x + dx * f.L + sway * (0.6 + i * 0.06);
            const tipY = y + dy * f.L * 0.65 + droop;
            const upX = x + dx * f.L * 0.45;
            const upY = y + dy * f.L * 0.75 - 14;
            const loX = x + dx * f.L * 0.55;
            const loY = y + dy * f.L * 0.35 + droop * 0.7;

            if (classic) {
                // Alternate tones for depth, VGA-flat
                ctx.fillStyle = i % 2
                    ? this.classicColors.palmLeaf
                    : this.classicColors.palmLeafDark;
            } else {
                const g = ctx.createLinearGradient(x, y, tipX, tipY);
                g.addColorStop(0, this.modernColors.palmLeaf[0]);
                g.addColorStop(0.6, this.modernColors.palmLeaf[1]);
                g.addColorStop(1, this.modernColors.palmLeaf[2]);
                ctx.fillStyle = g;
            }
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(upX, upY, tipX, tipY);
            ctx.quadraticCurveTo(loX, loY, x, y);
            ctx.closePath();
            ctx.fill();

            // Center rib
            ctx.strokeStyle = classic
                ? '#007700'
                : 'rgba(18, 70, 18, 0.55)';
            ctx.lineWidth = classic ? 2 : 1.8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo((upX + loX) / 2, (upY + loY) / 2, tipX, tipY);
            ctx.stroke();
        });

        // Coconuts tucked under the crown
        for (const [cx, cy] of [[-9, 9], [6, 12], [-1, 17]]) {
            ctx.fillStyle = classic ? '#8B4513' : '#6B4423';
            ctx.beginPath();
            ctx.arc(x + cx, y + cy, 6.5, 0, Math.PI * 2);
            ctx.fill();
            if (!classic) {
                ctx.fillStyle = 'rgba(255, 235, 200, 0.35)';
                ctx.beginPath();
                ctx.arc(x + cx - 2, y + cy - 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (holiday && holiday.key === 'newYearEve') {
            this.drawBanner(x, y - 50, 'HAPPY NEW YEAR!');
        }
    }


    // ------------------------------------------------------------------
    // Johnny — one vector character for both modes. Classic renders him
    // flat and crisp; modern adds a shadow, gradients, and soft outlines.
    // Actions: standing, running, fishing, building, armUp, sitting.
    // opts.dir: 1 faces right, -1 faces left.
    // ------------------------------------------------------------------

    johnnyPalette() {
        return {
            skin: '#E8B080',
            skinShade: '#C98F60',
            hair: '#6B4226',
            hairDark: '#54341E',
            shirt: '#CC2A22',
            shirtDark: '#A31D17',
            shorts: '#2B62C9',
            shortsDark: '#1F4A9E'
        };
    }

    // A two-segment limb (shoulder→elbow→hand or hip→knee→foot).
    drawLimb(x1, y1, x2, y2, x3, y3, width, color) {
        const ctx = this.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.stroke();
    }

    drawJohnnyHead(cx, cy, p, opts = {}) {
        const ctx = this.ctx;

        // Face
        ctx.fillStyle = p.skin;
        ctx.beginPath();
        ctx.arc(cx, cy, 9.5, 0, Math.PI * 2);
        ctx.fill();

        // Castaway beard, wrapping the jaw
        ctx.fillStyle = p.hair;
        ctx.beginPath();
        ctx.moveTo(cx - 9.5, cy - 1);
        ctx.quadraticCurveTo(cx - 10, cy + 9, cx, cy + 11);
        ctx.quadraticCurveTo(cx + 10, cy + 9, cx + 9.5, cy - 1);
        ctx.quadraticCurveTo(cx + 7, cy + 3, cx, cy + 3.5);
        ctx.quadraticCurveTo(cx - 7, cy + 3, cx - 9.5, cy - 1);
        ctx.closePath();
        ctx.fill();

        // Shaggy hair cap with a few tufts
        ctx.fillStyle = p.hair;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 9.5, Math.PI, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 9, cy - 5);
        ctx.lineTo(cx - 12, cy - 10);
        ctx.lineTo(cx - 6, cy - 9);
        ctx.lineTo(cx - 4, cy - 14);
        ctx.lineTo(cx, cy - 10);
        ctx.lineTo(cx + 4, cy - 14);
        ctx.lineTo(cx + 7, cy - 9);
        ctx.lineTo(cx + 11, cy - 11);
        ctx.lineTo(cx + 9, cy - 4);
        ctx.closePath();
        ctx.fill();

        // Eyes + sunburnt nose
        ctx.fillStyle = '#2A1A0E';
        ctx.beginPath();
        ctx.arc(cx - 3.5, cy - 1.5, 1.4, 0, Math.PI * 2);
        ctx.arc(cx + 3.5, cy - 1.5, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = p.skinShade;
        ctx.beginPath();
        ctx.arc(cx, cy + 1.5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // A hint of a mouth in the beard
        ctx.strokeStyle = p.hairDark;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy + 4.5, 2.6, 0.25, Math.PI - 0.25);
        ctx.stroke();
    }

    drawJohnnyTorso(p) {
        const ctx = this.ctx;

        // Ragged tee: shoulders to a torn zigzag hem
        if (this.graphicsMode === 'modern') {
            const g = ctx.createLinearGradient(0, -52, 0, -28);
            g.addColorStop(0, p.shirt);
            g.addColorStop(1, p.shirtDark);
            ctx.fillStyle = g;
        } else {
            ctx.fillStyle = p.shirt;
        }
        ctx.beginPath();
        ctx.moveTo(-9, -51);
        ctx.quadraticCurveTo(-10.5, -40, -8.5, -29);
        ctx.lineTo(-5.5, -31.5);
        ctx.lineTo(-2.5, -28.5);
        ctx.lineTo(0.5, -31.5);
        ctx.lineTo(3.5, -28.5);
        ctx.lineTo(6.5, -31);
        ctx.lineTo(8.5, -29);
        ctx.quadraticCurveTo(10.5, -40, 9, -51);
        ctx.quadraticCurveTo(0, -55, -9, -51);
        ctx.closePath();
        ctx.fill();

        // Ragged shorts
        ctx.fillStyle = this.graphicsMode === 'modern' ? p.shortsDark : p.shorts;
        ctx.beginPath();
        ctx.moveTo(-8, -31);
        ctx.lineTo(8, -31);
        ctx.lineTo(8.5, -19);
        ctx.lineTo(5, -17.5);
        ctx.lineTo(3, -20);
        ctx.lineTo(1, -18);
        ctx.lineTo(-1, -20);   // leg split
        ctx.lineTo(-3, -18);
        ctx.lineTo(-5, -20);
        ctx.lineTo(-8.5, -18);
        ctx.closePath();
        ctx.fill();
        if (this.graphicsMode === 'modern') {
            ctx.fillStyle = p.shorts;
            ctx.fillRect(-8, -31, 16, 6);
        }
    }

    drawJohnny(x, y, action = 'standing', frame = 0, opts = {}) {
        if (action === 'sitting') {
            this.drawJohnnySitting(x, y, frame, opts);
            return;
        }

        const ctx = this.ctx;
        const p = this.johnnyPalette();
        const dir = opts.dir || 1;
        const moving = action === 'running';
        const phase = frame * 0.28;

        if (this.graphicsMode === 'modern') {
            this.drawShadow(x, y + 2, 13, 4, 0.3);
        }

        ctx.save();
        ctx.translate(x, y);
        if (dir < 0) {
            ctx.scale(-1, 1);
        }

        // Legs (back leg shaded)
        if (moving) {
            const s = Math.sin(phase);
            const c = Math.cos(phase);
            this.drawLimb(-3, -29, -4 - s * 5, -15, -s * 9, -Math.max(0, c) * 4,
                5, p.skinShade);
            this.drawLimb(3, -29, 4 + s * 5, -15, s * 9, -Math.max(0, -c) * 4,
                5, p.skin);
        } else {
            this.drawLimb(-3, -29, -4.5, -15, -5, 0, 5, p.skinShade);
            this.drawLimb(3, -29, 4.5, -15, 5, 0, 5, p.skin);
        }
        // Feet
        ctx.fillStyle = p.skin;
        const footL = moving ? -Math.sin(phase) * 9 : -5;
        const footR = moving ? Math.sin(phase) * 9 : 5;
        ctx.beginPath();
        ctx.ellipse(footL + 1.5, -0.5, 4, 2.2, 0, 0, Math.PI * 2);
        ctx.ellipse(footR + 1.5, -0.5, 4, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        this.drawJohnnyTorso(p);

        // Arms
        const shoulderY = -47;
        if (action === 'armUp') {
            this.drawLimb(-7, shoulderY, -11, -38, -10, -30, 4.5, p.skinShade);
            this.drawLimb(7, shoulderY, 12, -58, 15, -71, 4.5, p.skin);
        } else if (action === 'fishing') {
            this.drawLimb(-7, shoulderY, -1, -40, 10, -37, 4.5, p.skinShade);
            this.drawLimb(7, shoulderY, 12, -42, 16, -36, 4.5, p.skin);
        } else if (action === 'building') {
            // Hammer strike cycle (~1.3s): slow two-handed windup over the
            // shoulder, fast swing down onto the wood, a beat of rest at
            // impact. raise: 1 = fully wound up, 0 = struck.
            const cycle = (frame % 80) / 80;
            let raise;
            if (cycle < 0.55) {
                const t = cycle / 0.55;
                raise = t * t * (3 - 2 * t);
            } else if (cycle < 0.68) {
                raise = 1 - (cycle - 0.55) / 0.13;
            } else {
                raise = 0;
            }

            // Both hands grip the handle; they travel from shoulder height
            // down and forward as the mallet comes over the top.
            const handX = 10 - raise * 4;
            const handY = -26 - raise * 12;
            this.drawLimb(-7, shoulderY, -3 - raise * 5, -38 - raise * 3,
                handX - 1.5, handY - 1, 4.5, p.skinShade);
            this.drawLimb(7, shoulderY, 11 - raise * 2, -37 - raise * 4,
                handX + 1, handY, 4.5, p.skin);

            // A serious two-handed mallet: driftwood handle, lashed-on stone
            // head. Pivots at the hands from over-the-shoulder to head-down
            // in front, where the raft is.
            ctx.save();
            ctx.translate(handX, handY);
            ctx.rotate(2.1 - raise * 2.95);
            ctx.fillStyle = '#7A5230';
            ctx.beginPath();
            ctx.roundRect(-2, -34, 4, 37, 2);
            ctx.fill();
            ctx.fillStyle = '#8B8B8B';
            ctx.beginPath();
            ctx.roundRect(-11, -45, 22, 13, 4);
            ctx.fill();
            ctx.fillStyle = '#6E6E6E';
            ctx.beginPath();
            ctx.roundRect(-11, -38, 22, 6, 3);
            ctx.fill();
            // Vine lashing holding it all together, optimistically
            ctx.strokeStyle = '#5A4022';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-3, -45);
            ctx.lineTo(3, -32);
            ctx.moveTo(3, -45);
            ctx.lineTo(-3, -32);
            ctx.stroke();

            // Wood chips flying for a few frames after the blow lands
            if (cycle >= 0.68 && cycle < 0.8) {
                const k = (cycle - 0.68) / 0.12;
                ctx.strokeStyle = `rgba(201, 169, 106, ${1 - k})`;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                for (const [dx, dy] of [[-9, -7], [0, -10], [9, -6]]) {
                    ctx.moveTo(dx * (0.6 + k), -48 + dy * k);
                    ctx.lineTo(dx * (0.6 + k) + dx * 0.3, -48 + dy * k + dy * 0.3);
                }
                ctx.stroke();
            }
            ctx.restore();
        } else if (moving) {
            const s = Math.sin(phase);
            this.drawLimb(-7, shoulderY, -9 + s * 5, -38, -4 + s * 8, -33,
                4.5, p.skinShade);
            this.drawLimb(7, shoulderY, 9 - s * 5, -38, 4 - s * 8, -33,
                4.5, p.skin);
        } else {
            const breathe = Math.sin(frame * 0.05) * 0.6;
            this.drawLimb(-7, shoulderY, -10, -39 + breathe, -10.5, -30, 4.5, p.skinShade);
            this.drawLimb(7, shoulderY, 10, -39 + breathe, 10.5, -30, 4.5, p.skin);
        }

        // Sleeves over the shoulder joints
        ctx.strokeStyle = p.shirtDark;
        ctx.lineWidth = 5.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-7, -48);
        ctx.lineTo(-8.5, -43);
        ctx.moveTo(7, -48);
        if (action === 'armUp') {
            ctx.lineTo(9.5, -52);
        } else {
            ctx.lineTo(8.5, -43);
        }
        ctx.stroke();

        this.drawJohnnyHead(0, -61, p);

        ctx.restore();

        if (action === 'fishing') {
            this.drawFishingRod(x + dir * 16, y - 36, frame, { dir });
        }
    }

    // Where the raised hand ends up for action 'armUp' — scenes place props here.
    raisedHandPos(x, y, dir = 1) {
        return { x: x + 15 * dir, y: y - 71 };
    }

    drawJohnnySitting(x, y, frame, opts = {}) {
        const ctx = this.ctx;
        const p = this.johnnyPalette();
        const dir = opts.dir || 1;

        if (this.graphicsMode === 'modern') {
            this.drawShadow(x + 4 * dir, y + 2, 15, 4, 0.3);
        }

        ctx.save();
        ctx.translate(x, y);
        if (dir < 0) {
            ctx.scale(-1, 1);
        }

        // Legs with knees drawn up — the raised silhouette reads clearly
        // even against night-dimmed sand (flat legs used to vanish into it).
        this.drawLimb(-2, -15, 8, -24, 12, -2, 5, p.skinShade);
        this.drawLimb(0, -14, 10, -22, 15, 0, 5, p.skin);
        ctx.fillStyle = p.skin;
        ctx.beginPath();
        ctx.ellipse(13, -1.5, 3.5, 2.2, 0.1, 0, Math.PI * 2);
        ctx.ellipse(16, 0.5, 3.5, 2.2, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Shorts at the hips, running up the thighs toward the knees
        ctx.strokeStyle = p.shortsDark;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-3, -16);
        ctx.lineTo(4, -21);
        ctx.stroke();
        ctx.strokeStyle = p.shorts;
        ctx.beginPath();
        ctx.moveTo(-1, -15);
        ctx.lineTo(6, -20);
        ctx.stroke();
        ctx.fillStyle = p.shorts;
        ctx.beginPath();
        ctx.roundRect(-8, -18, 12, 8, 3);
        ctx.fill();

        // Torso leaning slightly forward over the phone/knees
        if (this.graphicsMode === 'modern') {
            const g = ctx.createLinearGradient(0, -38, 0, -14);
            g.addColorStop(0, p.shirt);
            g.addColorStop(1, p.shirtDark);
            ctx.fillStyle = g;
        } else {
            ctx.fillStyle = p.shirt;
        }
        ctx.beginPath();
        ctx.moveTo(-8, -36);
        ctx.quadraticCurveTo(-10, -25, -8, -14);
        ctx.lineTo(6, -14);
        ctx.quadraticCurveTo(9, -25, 6, -36);
        ctx.quadraticCurveTo(-1, -40, -8, -36);
        ctx.closePath();
        ctx.fill();

        // Arms resting toward the knees
        this.drawLimb(-6, -33, -2, -25, 8, -22, 4.5, p.skinShade);
        this.drawLimb(5, -33, 10, -27, 12, -23, 4.5, p.skin);

        // Head tilted down a touch
        this.drawJohnnyHead(0, -45, p);

        ctx.restore();
    }

    drawFishingRod(handX, handY, frame, opts = {}) {
        const ctx = this.ctx;
        const dir = opts.dir || 1;
        const tipX = handX + dir * 48;
        const tipY = handY - 34;

        // Rod with a slight flex
        ctx.strokeStyle = '#7A5230';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.quadraticCurveTo(
            handX + dir * 30, handY - 24, tipX, tipY);
        ctx.stroke();

        // Line down to open water, clear of the island
        const bobberX = tipX + dir * 78;
        const bobberY = this.groundY() + 96 + Math.sin(frame * 0.1) * 3;
        ctx.strokeStyle = 'rgba(40, 40, 40, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.quadraticCurveTo(bobberX - dir * 12, (tipY + bobberY) / 2, bobberX, bobberY);
        ctx.stroke();

        // Red-and-white bobber, plus ripples
        ctx.fillStyle = '#EE2222';
        ctx.beginPath();
        ctx.arc(bobberX, bobberY, 4, Math.PI, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(bobberX, bobberY, 4, 0, Math.PI);
        ctx.fill();

        const ringR = 6 + (frame % 50) * 0.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 0.4 - (frame % 50) * 0.01)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(bobberX, bobberY + 2, ringR, ringR * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
    }


    // ------------------------------------------------------------------
    // Modern-era props
    // ------------------------------------------------------------------

    // A delivery quadcopter. opts.lineLength > 0 hangs a package that far
    // below the drone on a winch line.
    drawDrone(x, y, frame, opts = {}) {
        const ctx = this.ctx;
        const bob = Math.sin(frame * 0.12) * 3;
        y += bob;

        const night = this.timeOfDay === 'night';

        // Delivery spotlight — the drone lights its drop zone at night.
        if (night && opts.lineLength && opts.lineLength > 0) {
            const reach = opts.lineLength + 40;
            ctx.save();
            const beam = ctx.createLinearGradient(x, y, x, y + reach);
            beam.addColorStop(0, 'rgba(255, 250, 200, 0.30)');
            beam.addColorStop(1, 'rgba(255, 250, 200, 0)');
            ctx.fillStyle = beam;
            ctx.beginPath();
            ctx.moveTo(x - 8, y + 6);
            ctx.lineTo(x + 8, y + 6);
            ctx.lineTo(x + 45, y + reach);
            ctx.lineTo(x - 45, y + reach);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Winch line + package first, so the drone body overlaps the line.
        if (opts.lineLength && opts.lineLength > 0) {
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, y + 6);
            ctx.lineTo(x, y + 6 + opts.lineLength);
            ctx.stroke();
            this.drawPackage(x, y + 6 + opts.lineLength, 0.9);
        }

        // Arms
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 22, y - 8);
        ctx.lineTo(x + 22, y + 2);
        ctx.moveTo(x + 22, y - 8);
        ctx.lineTo(x - 22, y + 2);
        ctx.stroke();

        // Body
        ctx.fillStyle = '#2E2E2E';
        ctx.beginPath();
        ctx.roundRect(x - 15, y - 6, 30, 12, 4);
        ctx.fill();

        // Cargo-brand smile on the fuselage
        ctx.strokeStyle = '#FF9900';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y - 1, 6, 0.3, Math.PI - 0.3);
        ctx.stroke();

        // Status LED
        ctx.fillStyle = frame % 40 < 20 ? '#FF3B30' : '#34C759';
        ctx.beginPath();
        ctx.arc(x + 11, y + 3, 2, 0, Math.PI * 2);
        ctx.fill();

        // Navigation lights, aviation-correct-ish: red port, green starboard.
        if (night) {
            ctx.save();
            for (const [nx, color] of [[-22, '#FF3B30'], [22, '#34C759']]) {
                const halo = ctx.createRadialGradient(
                    x + nx, y - 4, 0, x + nx, y - 4, 8);
                halo.addColorStop(0, color);
                halo.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = halo;
                ctx.globalAlpha = frame % 30 < 15 ? 0.9 : 0.4;
                ctx.beginPath();
                ctx.arc(x + nx, y - 4, 8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Spinning rotors — squashed ellipses whose width pulses.
        const spin = Math.abs(Math.sin(frame * 0.9));
        ctx.fillStyle = 'rgba(160, 160, 160, 0.7)';
        for (const [rx, ry] of [[-22, -8], [22, -8], [-22, 2], [22, 2]]) {
            ctx.beginPath();
            ctx.ellipse(x + rx, y + ry - 4, 6 + spin * 8, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(120, 120, 120, 0.8)';
        }
    }

    // A cardboard delivery box with tape and a suspiciously familiar smile.
    drawPackage(x, y, size = 1, opts = {}) {
        const ctx = this.ctx;
        const w = 40 * size;
        const h = 28 * size;

        ctx.fillStyle = '#C9974C';
        ctx.fillRect(x - w / 2, y - h, w, h);
        ctx.strokeStyle = '#8B6530';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - w / 2, y - h, w, h);

        if (opts.open) {
            // Open flaps sticking up
            ctx.fillStyle = '#B8863E';
            ctx.beginPath();
            ctx.moveTo(x - w / 2, y - h);
            ctx.lineTo(x - w / 2 - 8 * size, y - h - 12 * size);
            ctx.lineTo(x - w / 6, y - h);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + w / 2, y - h);
            ctx.lineTo(x + w / 2 + 8 * size, y - h - 12 * size);
            ctx.lineTo(x + w / 6, y - h);
            ctx.closePath();
            ctx.fill();
        } else {
            // Tape stripe
            ctx.fillStyle = '#E8D9A8';
            ctx.fillRect(x - 3 * size, y - h, 6 * size, h);
        }

        // Smile arrow on the front
        ctx.strokeStyle = '#3E2C13';
        ctx.lineWidth = 2 * size;
        ctx.beginPath();
        ctx.arc(x, y - h * 0.4, w * 0.28, 0.25, Math.PI - 0.25);
        ctx.stroke();
        // Arrowhead
        const ax = x + w * 0.28 * Math.cos(0.25);
        const ay = y - h * 0.4 + w * 0.28 * Math.sin(0.25);
        ctx.beginPath();
        ctx.moveTo(ax - 4 * size, ay - 4 * size);
        ctx.lineTo(ax + 2 * size, ay);
        ctx.lineTo(ax - 5 * size, ay + 2 * size);
        ctx.stroke();
    }

    // A smartphone. Centered on (x, y), rotated by opts.angle radians.
    drawPhone(x, y, opts = {}) {
        const ctx = this.ctx;
        const s = opts.scale || 1;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(opts.angle || 0);

        if (opts.lit) {
            const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26 * s);
            glow.addColorStop(0, 'rgba(159, 216, 255, 0.5)');
            glow.addColorStop(1, 'rgba(159, 216, 255, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(-26 * s, -26 * s, 52 * s, 52 * s);
        }

        ctx.fillStyle = '#1C1C1E';
        ctx.beginPath();
        ctx.roundRect(-6 * s, -11 * s, 12 * s, 22 * s, 3 * s);
        ctx.fill();

        ctx.fillStyle = opts.lit ? '#9FD8FF' : '#0A0A0A';
        ctx.fillRect(-4.5 * s, -9 * s, 9 * s, 18 * s);

        ctx.restore();
    }

    // Signal bars indicator above a point; bars = how many are filled (0-4).
    drawSignalBars(x, y, bars) {
        const ctx = this.ctx;
        for (let i = 0; i < 4; i++) {
            const bh = 5 + i * 4;
            ctx.fillStyle = i < bars ? '#34C759' : 'rgba(0,0,0,0.25)';
            ctx.fillRect(x + i * 7, y - bh, 5, bh);
        }
        if (bars === 0) {
            ctx.strokeStyle = '#FF3B30';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 22);
            ctx.lineTo(x + 30, y + 4);
            ctx.stroke();
        }
    }

    drawSpeechBubble(x, y, text, opts = {}) {
        const ctx = this.ctx;
        ctx.save();

        // When the panel renders the scene small (Explorer sidebar), grow the
        // font so the on-screen text stays legible (~12 CSS px minimum).
        // Both the base size and the legibility floor scale with the
        // user-configured text size.
        const ts = this.textScale || 1;
        let fontSize = (opts.fontSize || 13) * ts;
        if (this.viewScale && this.viewScale < 0.9) {
            fontSize = Math.max(fontSize, (12 * ts) / this.viewScale);
        }
        fontSize = Math.min(30 * ts, fontSize);
        ctx.font = `${fontSize}px monospace`;
        const padding = Math.max(8, fontSize * 0.55);
        const metrics = ctx.measureText(text);
        const w = metrics.width + padding * 2;
        const h = fontSize + padding * 1.5;

        // Keep the bubble inside the visible (possibly cropped) region
        const vl = (this.visibleLeft ?? 0) + 4;
        const vr = (this.visibleRight ?? this.width) - 4;
        let bx = x - w / 2;
        bx = Math.min(Math.max(bx, vl), Math.max(vl, vr - w));
        const by = y - h;
        // Tail anchor stays near the speaker but within the bubble
        const tailX = Math.min(Math.max(x, bx + 12), bx + w - 12);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, w, h, 6);
        ctx.fill();
        ctx.stroke();

        // Tail
        ctx.beginPath();
        ctx.moveTo(tailX - 5, by + h);
        ctx.lineTo(tailX + (opts.tailDx || -10), by + h + 10);
        ctx.lineTo(tailX + 6, by + h);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, bx + w / 2, by + h / 2 + 1);
        ctx.restore();
    }

    // Floating like/heart reactions rising from (x, y).
    drawHearts(x, y, frame, count = 3) {
        const ctx = this.ctx;
        ctx.save();
        for (let i = 0; i < count; i++) {
            const t = ((frame * 1.2 + i * 25) % 80) / 80;
            const hx = x + Math.sin(frame * 0.05 + i * 2) * 12;
            const hy = y - t * 70;
            ctx.globalAlpha = 1 - t;
            ctx.fillStyle = i % 2 ? '#FF4D6D' : '#FF9900';
            const s = 5;
            ctx.beginPath();
            ctx.arc(hx - s / 2, hy, s / 2, 0, Math.PI * 2);
            ctx.arc(hx + s / 2, hy, s / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(hx - s, hy + 1);
            ctx.lineTo(hx, hy + s + 2);
            ctx.lineTo(hx + s, hy + 1);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    // An open laptop on the sand. progress is 0..1 for the on-screen bar.
    drawLaptop(x, y, opts = {}) {
        const ctx = this.ctx;
        // Base
        ctx.fillStyle = '#4A4A4A';
        ctx.beginPath();
        ctx.moveTo(x - 26, y);
        ctx.lineTo(x + 26, y);
        ctx.lineTo(x + 22, y - 8);
        ctx.lineTo(x - 22, y - 8);
        ctx.closePath();
        ctx.fill();

        // Screen
        ctx.fillStyle = '#333';
        ctx.fillRect(x - 22, y - 40, 44, 32);
        ctx.fillStyle = '#0B2239';
        ctx.fillRect(x - 19, y - 37, 38, 26);

        if (opts.progress !== undefined) {
            ctx.fillStyle = '#DDD';
            ctx.font = `${6 * (this.textScale || 1)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(opts.label || 'DOWNLOADING…', x, y - 30);

            ctx.strokeStyle = '#DDD';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 15, y - 26, 30, 6);
            ctx.fillStyle = '#34C759';
            ctx.fillRect(x - 14, y - 25, Math.max(1, 28 * opts.progress), 4);

            ctx.fillStyle = '#DDD';
            ctx.fillText(opts.eta || '', x, y - 15);
        }
    }

    // Satellite internet dish on a tripod, pointed hopefully at the sky.
    drawSatDish(x, y, frame) {
        const ctx = this.ctx;
        // Tripod
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - 24);
        ctx.lineTo(x - 12, y);
        ctx.moveTo(x, y - 24);
        ctx.lineTo(x + 12, y);
        ctx.moveTo(x, y - 24);
        ctx.lineTo(x, y - 2);
        ctx.stroke();

        // Dish
        ctx.save();
        ctx.translate(x, y - 30);
        ctx.rotate(-0.5);
        ctx.fillStyle = '#EDEDED';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#BBB';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Uplink waves while "connecting"
        if (frame % 90 < 45) {
            ctx.strokeStyle = 'rgba(52, 199, 89, 0.7)';
            ctx.lineWidth = 2;
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.arc(x + 10, y - 44, i * 8, -1.9, -0.7);
                ctx.stroke();
            }
        }
    }

    // A food-delivery jetski that has clearly got the wrong address.
    drawJetski(x, y, frame, dir = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y + Math.sin(frame * 0.2) * 2);
        ctx.scale(dir, 1);

        // Wake
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-28, 6);
        ctx.lineTo(-55, 4);
        ctx.moveTo(-28, 9);
        ctx.lineTo(-48, 11);
        ctx.stroke();

        // Hull
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.moveTo(-28, 4);
        ctx.lineTo(24, 4);
        ctx.lineTo(30, -2);
        ctx.lineTo(10, -8);
        ctx.lineTo(-24, -6);
        ctx.closePath();
        ctx.fill();

        // Rider
        ctx.fillStyle = '#263238';
        ctx.fillRect(-6, -22, 10, 14);
        ctx.fillStyle = '#FFCC99';
        ctx.beginPath();
        ctx.arc(-1, -26, 5, 0, Math.PI * 2);
        ctx.fill();
        // Helmet
        ctx.fillStyle = '#00ACC1';
        ctx.beginPath();
        ctx.arc(-1, -27, 5, Math.PI, 0);
        ctx.fill();

        // Insulated delivery cube on the back
        ctx.fillStyle = '#D81B60';
        ctx.fillRect(-24, -20, 14, 14);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(-20, -16, 6, 6);

        ctx.restore();
    }

    // A robot vacuum, unbothered, moisturized, roaming the sand.
    // opts.dir: travel direction (trail goes the other way).
    // opts.spinning: bumped into something and is rethinking its life.
    drawRoomba(x, y, frame, opts = {}) {
        const ctx = this.ctx;
        const dir = opts.dir || 1;

        if (opts.spinning) {
            // Circular scuff while it pirouettes in place
            ctx.strokeStyle = 'rgba(255, 238, 136, 0.8)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(x, y + 2, 16, 5, 0, 0, Math.PI * 2);
            ctx.stroke();
            x += Math.sin(frame * 0.7) * 1.5;
        } else {
            // Tidy trail behind it
            ctx.strokeStyle = 'rgba(255, 238, 136, 0.8)';
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x - dir * 40, y + 2);
            ctx.lineTo(x - dir * 6, y + 2);
            ctx.stroke();
        }

        // Body
        ctx.fillStyle = '#37474F';
        ctx.beginPath();
        ctx.ellipse(x, y, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#546E7A';
        ctx.beginPath();
        ctx.ellipse(x, y - 3, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Button + status light: green blink cruising, amber when bumped
        ctx.fillStyle = '#263238';
        ctx.beginPath();
        ctx.arc(x, y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        let light;
        if (opts.spinning) {
            light = frame % 20 < 10 ? '#FFB300' : '#7A5600';
        } else {
            light = frame % 50 < 25 ? '#34C759' : '#1B5E20';
        }
        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.arc(x + 7, y - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Wilson. He's a good listener.
    drawWilson(x, y) {
        const ctx = this.ctx;
        ctx.fillStyle = '#F5F0E1';
        ctx.beginPath();
        ctx.arc(x, y - 12, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#C8BFA6';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Seams
        ctx.beginPath();
        ctx.arc(x - 8, y - 12, 12, -0.6, 0.6);
        ctx.moveTo(x + 12, y - 16);
        ctx.arc(x + 8, y - 12, 12, Math.PI - 0.6, Math.PI + 0.6, true);
        ctx.stroke();

        // The face, printed in something we won't ask about
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(x, y - 12, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F5F0E1';
        ctx.beginPath();
        ctx.arc(x - 2.5, y - 14, 1.5, 0, Math.PI * 2);
        ctx.arc(x + 2.5, y - 14, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#F5F0E1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y - 11, 3.5, 0.4, Math.PI - 0.4);
        ctx.stroke();
    }

    // Camera-flash overlay for selfies.
    drawFlash(alpha) {
        if (alpha <= 0) return;
        this.ctx.save();
        this.ctx.globalAlpha = Math.min(1, alpha);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }

    // Dim the world a little (phone-at-night ambiance).
    drawNightOverlay(alpha = 0.35) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }

    // ------------------------------------------------------------------
    // Holiday decorations (ported)
    // ------------------------------------------------------------------

    drawHolidayDecoration(holiday) {
        if (holiday.key === 'halloween') {
            this.drawJackOLantern(500, this.height * 0.65);
        } else if (holiday.key === 'christmas') {
            this.drawChristmasLights();
        } else if (holiday.key === 'stPatricks') {
            this.drawShamrocks();
        }
    }

    drawJackOLantern(x, y) {
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 10, y - 5);
        this.ctx.lineTo(x - 15, y - 10);
        this.ctx.lineTo(x - 5, y - 10);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y - 5);
        this.ctx.lineTo(x + 5, y - 10);
        this.ctx.lineTo(x + 15, y - 10);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(x, y + 5, 12, 0, Math.PI);
        this.ctx.fill();
    }

    drawChristmasLights() {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
        for (let i = 0; i < 10; i++) {
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.beginPath();
            this.ctx.arc(100 + i * 100, 50 + Math.sin(i) * 20, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawShamrocks() {
        this.ctx.fillStyle = '#00FF00';
        for (let i = 0; i < 5; i++) {
            const x = 150 + i * 200;
            const y = 100 + (i * 37) % 100;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.arc(x - 10, y, 8, 0, Math.PI * 2);
            this.ctx.arc(x + 10, y, 8, 0, Math.PI * 2);
            this.ctx.arc(x, y + 10, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawBanner(x, y, text) {
        const ts = this.textScale || 1;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x - 80 * ts, y, 160 * ts, 30 * ts);
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = `${14 * ts}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y + 20 * ts);
    }

    drawCloud(x, y, size = 1) {
        if (this.graphicsMode === 'classic') {
            this.ctx.fillStyle = {
                morning: '#FFF6E8',
                day: this.classicColors.white,
                evening: '#FFCC99',
                night: '#556699'
            }[this.timeOfDay] || this.classicColors.white;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 15 * size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x + 20 * size, y - 5 * size, 20 * size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x + 45 * size, y, 18 * size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x + 60 * size, y + 3 * size, 15 * size, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.save();
            this.ctx.globalAlpha = 0.15;
            this.ctx.fillStyle = '#888888';
            this.ctx.beginPath();
            this.ctx.arc(x + 2, y + 4, 20 * size, 0, Math.PI * 2);
            this.ctx.arc(x + 27 * size, y + 4, 30 * size, 0, Math.PI * 2);
            this.ctx.arc(x + 52 * size, y + 4, 25 * size, 0, Math.PI * 2);
            this.ctx.arc(x + 72 * size, y + 4, 20 * size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.globalAlpha = 0.95;
            const gradient = this.ctx.createRadialGradient(
                x + 35 * size, y - 5, 10, x + 35 * size, y + 5, 60 * size);
            const tints = {
                evening: [
                    'rgba(255, 224, 189, 1)',
                    'rgba(240, 180, 160, 0.95)',
                    'rgba(200, 130, 140, 0.8)'
                ],
                night: [
                    'rgba(120, 130, 170, 0.7)',
                    'rgba(90, 100, 140, 0.6)',
                    'rgba(60, 70, 110, 0.5)'
                ]
            }[this.timeOfDay] || [
                'rgba(255, 255, 255, 1)',
                'rgba(250, 250, 255, 0.95)',
                'rgba(230, 235, 245, 0.8)'
            ];
            gradient.addColorStop(0, tints[0]);
            gradient.addColorStop(0.7, tints[1]);
            gradient.addColorStop(1, tints[2]);
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20 * size, 0, Math.PI * 2);
            this.ctx.arc(x + 25 * size, y - 3, 30 * size, 0, Math.PI * 2);
            this.ctx.arc(x + 50 * size, y, 25 * size, 0, Math.PI * 2);
            this.ctx.arc(x + 70 * size, y + 2, 20 * size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Renderer };
}
