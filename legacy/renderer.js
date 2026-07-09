// Renderer - Handles drawing with Classic and Modern graphics modes

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.graphicsMode = 'classic'; // 'classic' or 'modern'
        this.width = 1200;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Authentic 90s VGA color palette (256-color) - matched to screenshot
        this.classicColors = {
            sky: '#00DDFF',           // Bright cyan/turquoise
            skyNight: '#000055',      // Deep VGA blue
            water: '#0044BB',         // Deep blue water
            waterDeep: '#002288',     // Very dark water
            waterHorizon: '#5599DD',  // Lighter blue at horizon
            waterMid: '#0066CC',      // Mid-tone water
            sand: '#FFDD55',          // Bright yellow sand
            sandDark: '#DDAA33',      // Sand shadow
            sandHighlight: '#FFEE88', // Sand highlight
            palmTrunk: '#AA5522',     // Orange-brown trunk
            palmTrunkDark: '#884411', // Trunk shadow
            palmLeaf: '#00DD00',      // Bright lime green
            palmLeafDark: '#00AA00',  // Darker green
            johnny: '#FFCC99',        // Skin tone
            johnnyShirt: '#DD0000',   // Bright red shirt
            johnnyShorts: '#0055CC',  // Blue shorts
            johnnyBeard: '#664422',   // Beard/hair
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
        if (mode === 'classic') {
            this.ctx.imageSmoothingEnabled = false;
        } else {
            this.ctx.imageSmoothingEnabled = true;
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawBackground(timeOfDay = 'day', holiday = null) {
        // Sky
        const isNight = timeOfDay === 'night';
        if (this.graphicsMode === 'classic') {
            this.ctx.fillStyle = isNight ? this.classicColors.skyNight : this.classicColors.sky;
            this.ctx.fillRect(0, 0, this.width, this.height * 0.6);
        } else {
            const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.6);
            const colors = isNight ? this.modernColors.skyNight : this.modernColors.sky;
            skyGradient.addColorStop(0, colors[0]);
            skyGradient.addColorStop(1, colors[1]);
            this.ctx.fillStyle = skyGradient;
            this.ctx.fillRect(0, 0, this.width, this.height * 0.6);
        }

        // Sun or Moon (VGA style)
        if (this.graphicsMode === 'classic') {
            // Simple VGA sun/moon
            this.ctx.fillStyle = isNight ? '#FFFF88' : '#FFFF00';
            this.ctx.beginPath();
            this.ctx.arc(1000, 100, isNight ? 35 : 40, 0, Math.PI * 2);
            this.ctx.fill();

            // Simple highlight
            this.ctx.fillStyle = isNight ? '#FFFFDD' : '#FFFFAA';
            this.ctx.beginPath();
            this.ctx.arc(995, 95, 15, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Enhanced sun/moon with glow
            const celestialGradient = this.ctx.createRadialGradient(1000, 100, 0, 1000, 100, isNight ? 60 : 80);
            celestialGradient.addColorStop(0, isNight ? '#FFFACD' : '#FFFACD');
            celestialGradient.addColorStop(0.4, isNight ? '#F0E68C' : '#FFD700');
            celestialGradient.addColorStop(0.7, isNight ? '#8B8970' : '#FFA500');
            celestialGradient.addColorStop(1, 'rgba(255,255,255,0)');
            this.ctx.fillStyle = celestialGradient;
            this.ctx.beginPath();
            this.ctx.arc(1000, 100, isNight ? 60 : 80, 0, Math.PI * 2);
            this.ctx.fill();

            // Sun rays during day
            if (!isNight) {
                this.drawSunRays(1000, 100);
            }

            // Stars at night
            if (isNight) {
                this.drawStars();
            }
        }

        // Water - painted/textured effect like original
        if (this.graphicsMode === 'classic') {
            const waterStart = this.height * 0.6;

            // Base water color
            this.ctx.fillStyle = this.classicColors.water;
            this.ctx.fillRect(0, waterStart, this.width, this.height - waterStart);

            // Horizon band
            this.ctx.fillStyle = this.classicColors.waterHorizon;
            this.ctx.fillRect(0, waterStart, this.width, 25);

            // Create organic painted water texture with irregular horizontal strokes
            this.ctx.globalAlpha = 0.4;

            for (let y = waterStart + 25; y < this.height; y += 3) {
                const variation = Math.sin(y * 0.1) * 0.3 + Math.cos(y * 0.05) * 0.3;
                const alpha = 0.2 + Math.abs(variation) * 0.3;

                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = variation > 0 ? this.classicColors.waterDeep : this.classicColors.waterMid;

                // Irregular brush-like strokes
                const strokeHeight = 2 + Math.floor(Math.random() * 2);
                const xOffset = Math.random() * 50 - 25;
                const width = this.width + Math.random() * 100 - 50;

                this.ctx.fillRect(xOffset, y, width, strokeHeight);
            }

            // Add darker depth areas (like brush strokes)
            this.ctx.globalAlpha = 0.3;
            for (let i = 0; i < 20; i++) {
                const y = waterStart + 50 + Math.random() * (this.height - waterStart - 50);
                const x = Math.random() * this.width;
                const w = 100 + Math.random() * 200;
                const h = 3 + Math.random() * 5;

                this.ctx.fillStyle = this.classicColors.waterDeep;
                this.ctx.fillRect(x, y, w, h);
            }

            this.ctx.globalAlpha = 1.0;
        } else {
            // Enhanced water with depth gradient
            const waterGradient = this.ctx.createLinearGradient(0, this.height * 0.6, 0, this.height);
            waterGradient.addColorStop(0, this.modernColors.water[0]);
            waterGradient.addColorStop(0.4, this.modernColors.water[1]);
            waterGradient.addColorStop(1, this.modernColors.water[2]);
            this.ctx.fillStyle = waterGradient;
            this.ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.4);

            // Water shimmer effect
            this.drawWaterShimmer();

            // Water waves
            this.drawWaves();
        }

        // Island (sand) - larger, in foreground, shifted right
        const islandY = this.height * 0.72;  // Lower = closer to viewer
        if (this.graphicsMode === 'classic') {
            // Island shifted right and larger
            const centerX = 650;

            // Main sand ellipse (larger)
            this.ctx.fillStyle = this.classicColors.sand;
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, islandY, 240, 70, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Highlight on top half
            this.ctx.fillStyle = this.classicColors.sandHighlight;
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, islandY - 10, 220, 55, 0, 0, Math.PI);
            this.ctx.fill();

            // Dark outline at bottom
            this.ctx.fillStyle = this.classicColors.sandDark;
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, islandY + 8, 235, 65, 0, 0, Math.PI);
            this.ctx.fill();
        } else {
            // Enhanced sand with multi-layer gradient
            const sandGradient = this.ctx.createRadialGradient(600, islandY, 0, 600, islandY, 220);
            sandGradient.addColorStop(0, this.modernColors.sand[0]);
            sandGradient.addColorStop(0.5, this.modernColors.sand[1]);
            sandGradient.addColorStop(0.85, this.modernColors.sand[2]);
            sandGradient.addColorStop(1, 'rgba(222, 184, 135, 0.5)');
            this.ctx.fillStyle = sandGradient;
            this.ctx.beginPath();
            this.ctx.ellipse(600, islandY, 200, 80, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Sand texture spots
            this.drawSandTexture(600, islandY);
        }

        // Holiday decorations
        if (holiday) {
            this.drawHolidayDecoration(holiday);
        }
    }

    drawSandTexture(centerX, centerY) {
        // Add subtle texture to sand
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;

        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 180;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist * 0.4;

            this.ctx.fillStyle = Math.random() > 0.5 ? '#D2A679' : '#C19A6B';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    drawShadow(x, y, width, height, opacity = 0.3) {
        // Generic shadow helper
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawSunRays(x, y) {
        // Animated sun rays
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
        // Twinkling stars at night
        const time = Date.now() / 1000;
        this.ctx.save();

        // Use seeded positions so stars don't move
        const stars = [
            {x: 100, y: 50, size: 2}, {x: 200, y: 80, size: 1.5}, {x: 350, y: 40, size: 1},
            {x: 450, y: 100, size: 2.5}, {x: 600, y: 60, size: 1.5}, {x: 750, y: 90, size: 1},
            {x: 850, y: 45, size: 2}, {x: 950, y: 120, size: 1.5}, {x: 150, y: 140, size: 1},
            {x: 300, y: 160, size: 2}, {x: 500, y: 180, size: 1.5}, {x: 700, y: 150, size: 1},
            {x: 900, y: 170, size: 2.5}, {x: 250, y: 200, size: 1}, {x: 550, y: 220, size: 1.5}
        ];

        stars.forEach((star, i) => {
            const twinkle = 0.3 + Math.abs(Math.sin(time * 2 + i * 0.5)) * 0.7;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Star sparkle
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
        // Animated shimmer on water surface
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

    drawWaves() {
        const time = Date.now() / 1000;

        for (let i = 0; i < 6; i++) {
            this.ctx.beginPath();
            const y = this.height * 0.63 + i * 35;
            const opacity = 0.4 - i * 0.05;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.lineWidth = 2.5;

            for (let x = 0; x < this.width; x += 15) {
                const waveHeight = (6 - i) * 0.8;
                const waveSpeed = 40 + i * 10;
                const waveFreq = 25 + i * 5;
                const waveY = y + Math.sin((x + time * waveSpeed + i * 40) / waveFreq) * waveHeight;

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
        const trunkHeight = 180;
        const trunkWidth = this.graphicsMode === 'classic' ? 16 : 25;

        // Palm tree shadow
        if (this.graphicsMode === 'modern') {
            this.drawShadow(x + 30, y + 5, 25, 8, 0.25);
        }

        // Trunk
        if (this.graphicsMode === 'classic') {
            // Curved trunk (leaning slightly)
            const curve = 15; // How much the trunk curves

            // Draw trunk as curved shape
            this.ctx.fillStyle = this.classicColors.palmTrunk;
            this.ctx.beginPath();
            this.ctx.moveTo(x - trunkWidth / 2, y);
            this.ctx.quadraticCurveTo(
                x - trunkWidth / 2 + curve, y - trunkHeight / 2,
                x - trunkWidth / 2 + curve, y - trunkHeight
            );
            this.ctx.lineTo(x + trunkWidth / 2 + curve, y - trunkHeight);
            this.ctx.quadraticCurveTo(
                x + trunkWidth / 2 + curve, y - trunkHeight / 2,
                x + trunkWidth / 2, y
            );
            this.ctx.closePath();
            this.ctx.fill();

            // Trunk texture segments (follow the curve)
            this.ctx.fillStyle = this.classicColors.palmTrunkDark;
            for (let i = 0; i < 6; i++) {
                const t = i / 6;
                const segY = y - trunkHeight + i * 30 + 10;
                const xOffset = curve * t;
                this.ctx.fillRect(x - trunkWidth / 2 + xOffset, segY, trunkWidth, 3);
            }

            // Trunk highlight (follows curve)
            this.ctx.fillStyle = this.classicColors.sandHighlight;
            for (let i = 0; i < trunkHeight; i += 2) {
                const t = i / trunkHeight;
                const xOffset = curve * t;
                this.ctx.fillRect(x - trunkWidth / 2 + 2 + xOffset, y - trunkHeight + i, 3, 2);
            }
        } else {
            const trunkGradient = this.ctx.createLinearGradient(x - trunkWidth / 2, 0, x + trunkWidth / 2, 0);
            trunkGradient.addColorStop(0, this.modernColors.palmTrunk[1]);
            trunkGradient.addColorStop(0.5, this.modernColors.palmTrunk[0]);
            trunkGradient.addColorStop(1, this.modernColors.palmTrunk[1]);
            this.ctx.fillStyle = trunkGradient;
            this.ctx.fillRect(x - trunkWidth / 2, y - trunkHeight, trunkWidth, trunkHeight);
            
            // Trunk texture
            this.ctx.strokeStyle = 'rgba(101, 67, 33, 0.5)';
            this.ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
                const segY = y - trunkHeight + i * 35;
                this.ctx.beginPath();
                this.ctx.arc(x, segY, trunkWidth / 2 + 2, 0, Math.PI);
                this.ctx.stroke();
            }
        }

        // Palm fronds
        this.drawPalmFronds(x, y - trunkHeight, holiday);
    }

    drawPalmFronds(x, y, holiday) {
        const frondCount = 8;

        for (let i = 0; i < frondCount; i++) {
            const angle = (Math.PI * 2 / frondCount) * i;

            if (this.graphicsMode === 'classic') {
                // Inverted fronds - pointing upward/outward
                const frondLength = 70;
                const lift = -40; // Negative = upward lift (inverted from droop)

                // Calculate curve points (inverted)
                const midX = x + Math.cos(angle) * (frondLength * 0.5);
                const midY = y + Math.sin(angle) * (frondLength * 0.3) + lift;
                const endX = x + Math.cos(angle) * frondLength;
                const endY = y + Math.sin(angle) * (frondLength * 0.4) + lift * 0.8;

                // Draw filled frond shape
                this.ctx.fillStyle = this.classicColors.palmLeaf;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);

                // Left edge of frond
                this.ctx.quadraticCurveTo(
                    midX + Math.cos(angle + Math.PI / 2) * 8,
                    midY,
                    endX + Math.cos(angle + Math.PI / 2) * 4,
                    endY
                );

                // Tip
                this.ctx.lineTo(endX, endY);

                // Right edge of frond
                this.ctx.quadraticCurveTo(
                    midX + Math.cos(angle - Math.PI / 2) * 8,
                    midY,
                    x,
                    y
                );

                this.ctx.closePath();
                this.ctx.fill();

                // Darker center spine
                this.ctx.strokeStyle = this.classicColors.palmLeafDark;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.quadraticCurveTo(midX, midY, endX, endY);
                this.ctx.stroke();
            } else {
                // Enhanced modern fronds with depth
                const gradient = this.ctx.createLinearGradient(x, y, endX, endY);
                gradient.addColorStop(0, this.modernColors.palmLeaf[0]);
                gradient.addColorStop(0.3, this.modernColors.palmLeaf[1]);
                gradient.addColorStop(0.7, this.modernColors.palmLeaf[2]);
                gradient.addColorStop(1, this.modernColors.palmLeaf[3]);

                // Main frond spine with curve
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 12;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);

                const curveAmount = 25 + Math.sin(i) * 10;
                this.ctx.quadraticCurveTo(
                    x + (endX - x) * 0.5 + Math.cos(angle + Math.PI / 2) * curveAmount,
                    y + (endY - y) * 0.5 + Math.sin(angle + Math.PI / 2) * curveAmount,
                    endX, endY
                );
                this.ctx.stroke();

                // Enhanced frond leaflets with gradient
                this.ctx.lineWidth = 4;
                this.ctx.lineCap = 'round';

                for (let j = 1; j < 12; j++) {
                    const t = j / 12;
                    const leafLength = 25 * (1 - t * 0.3); // Smaller leaves at tip

                    // Calculate position along curve
                    const curveMidX = x + (endX - x) * 0.5 + Math.cos(angle + Math.PI / 2) * curveAmount;
                    const curveMidY = y + (endY - y) * 0.5 + Math.sin(angle + Math.PI / 2) * curveAmount;

                    const px = x * (1 - t) * (1 - t) + 2 * curveMidX * t * (1 - t) + endX * t * t;
                    const py = y * (1 - t) * (1 - t) + 2 * curveMidY * t * (1 - t) + endY * t * t;

                    const perpAngle = angle + Math.PI / 2;
                    const perpX = Math.cos(perpAngle) * leafLength;
                    const perpY = Math.sin(perpAngle) * leafLength;

                    // Left leaflet
                    const leftGradient = this.ctx.createLinearGradient(px, py, px - perpX, py - perpY);
                    leftGradient.addColorStop(0, this.modernColors.palmLeaf[1]);
                    leftGradient.addColorStop(1, this.modernColors.palmLeaf[2]);
                    this.ctx.strokeStyle = leftGradient;
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, py);
                    this.ctx.lineTo(px - perpX, py - perpY);
                    this.ctx.stroke();

                    // Right leaflet
                    const rightGradient = this.ctx.createLinearGradient(px, py, px + perpX, py + perpY);
                    rightGradient.addColorStop(0, this.modernColors.palmLeaf[1]);
                    rightGradient.addColorStop(1, this.modernColors.palmLeaf[2]);
                    this.ctx.strokeStyle = rightGradient;
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, py);
                    this.ctx.lineTo(px + perpX, py + perpY);
                    this.ctx.stroke();
                }
            }
        }

        // Holiday banner on tree
        if (holiday && holiday.key === 'newYearEve') {
            this.drawBanner(x, y - 50, "HAPPY NEW YEAR!");
        }
    }

    drawJohnny(x, y, action = 'standing', frame = 0) {
        const scale = this.graphicsMode === 'classic' ? 1 : 1.2;

        // Character shadow (modern only)
        if (this.graphicsMode === 'modern') {
            this.drawShadow(x, y + 2, 12, 4, 0.3);
        }

        // Body
        if (this.graphicsMode === 'classic') {
            // Authentic VGA sprite - LARGER to match screenshot
            const s = 1.5; // Scale factor

            // Hair/top of head
            this.ctx.fillStyle = this.classicColors.johnnyBeard;
            this.ctx.fillRect(x - 6 * s, y - 48 * s, 12 * s, 4 * s);

            // Head/face
            this.ctx.fillStyle = this.classicColors.johnny;
            this.ctx.fillRect(x - 6 * s, y - 44 * s, 12 * s, 10 * s);

            // Beard/jaw
            this.ctx.fillStyle = this.classicColors.johnnyBeard;
            this.ctx.fillRect(x - 6 * s, y - 35 * s, 12 * s, 3 * s);

            // Eyes
            this.ctx.fillStyle = this.classicColors.black;
            this.ctx.fillRect(x - 4 * s, y - 42 * s, 2 * s, 2 * s);
            this.ctx.fillRect(x + 2 * s, y - 42 * s, 2 * s, 2 * s);

            // Shirt (red)
            this.ctx.fillStyle = this.classicColors.johnnyShirt;
            this.ctx.fillRect(x - 7 * s, y - 32 * s, 14 * s, 14 * s);

            // Arms (extending from shirt)
            this.ctx.fillStyle = this.classicColors.johnny;
            this.ctx.fillRect(x - 9 * s, y - 28 * s, 2 * s, 6 * s);  // Left arm
            this.ctx.fillRect(x + 7 * s, y - 28 * s, 2 * s, 6 * s);  // Right arm

            // Shorts (blue)
            this.ctx.fillStyle = this.classicColors.johnnyShorts;
            this.ctx.fillRect(x - 7 * s, y - 18 * s, 14 * s, 10 * s);

            // Legs
            this.ctx.fillStyle = this.classicColors.johnny;
            this.ctx.fillRect(x - 6 * s, y - 8 * s, 5 * s, 8 * s);  // Left leg
            this.ctx.fillRect(x + 1 * s, y - 8 * s, 5 * s, 8 * s);  // Right leg
        } else {
            // Modern smooth rendering
            this.ctx.save();
            this.ctx.translate(x, y);

            // Head with shading
            const headGradient = this.ctx.createRadialGradient(-3, -55 * scale, 2, 0, -52 * scale, 10 * scale);
            headGradient.addColorStop(0, '#FFE4C4');
            headGradient.addColorStop(1, '#FFD7A8');
            this.ctx.fillStyle = headGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, -52 * scale, 10 * scale, 0, Math.PI * 2);
            this.ctx.fill();

            // Eyes with more detail
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(-3 * scale, -52 * scale, 1.5, 0, Math.PI * 2);
            this.ctx.arc(3 * scale, -52 * scale, 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Smile
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(0, -50 * scale, 4, 0.2, Math.PI - 0.2);
            this.ctx.stroke();

            // Shirt with gradient
            const shirtGradient = this.ctx.createLinearGradient(0, -44 * scale, 0, -24 * scale);
            shirtGradient.addColorStop(0, this.classicColors.johnnyShirt);
            shirtGradient.addColorStop(1, '#CC4A37');
            this.ctx.fillStyle = shirtGradient;
            this.ctx.beginPath();
            this.ctx.ellipse(0, -34 * scale, 12 * scale, 10 * scale, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Shorts with gradient
            const shortsGradient = this.ctx.createLinearGradient(0, -24 * scale, 0, -8 * scale);
            shortsGradient.addColorStop(0, this.classicColors.johnnyShorts);
            shortsGradient.addColorStop(1, '#2F5AAA');
            this.ctx.fillStyle = shortsGradient;
            this.ctx.beginPath();
            this.ctx.ellipse(0, -16 * scale, 11 * scale, 8 * scale, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Legs with rounded edges
            this.ctx.fillStyle = this.classicColors.johnny;
            this.ctx.beginPath();
            this.ctx.roundRect(-7 * scale, -8 * scale, 5 * scale, 8 * scale, 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.roundRect(2 * scale, -8 * scale, 5 * scale, 8 * scale, 2);
            this.ctx.fill();

            this.ctx.restore();
        }

        // Action-specific additions
        if (action === 'fishing') {
            this.drawFishingRod(x, y - 40, frame);
        }
    }

    drawFishingRod(x, y, frame) {
        // Rod
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 40, y - 30);
        this.ctx.stroke();
        
        // Line
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 40, y - 30);
        const bobberX = x + 80;
        const bobberY = this.height * 0.7 + Math.sin(frame * 0.1) * 3;
        this.ctx.lineTo(bobberX, bobberY);
        this.ctx.stroke();
        
        // Bobber
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(bobberX, bobberY, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

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
        
        // Eyes
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
        
        // Mouth
        this.ctx.beginPath();
        this.ctx.arc(x, y + 5, 12, 0, Math.PI);
        this.ctx.fill();
    }

    drawChristmasLights() {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
        for (let i = 0; i < 10; i++) {
            const x = 100 + i * 100;
            const y = 50 + Math.sin(i) * 20;
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawShamrocks() {
        this.ctx.fillStyle = '#00FF00';
        for (let i = 0; i < 5; i++) {
            const x = 150 + i * 200;
            const y = 100 + Math.random() * 100;
            // Simple shamrock shape
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.arc(x - 10, y, 8, 0, Math.PI * 2);
            this.ctx.arc(x + 10, y, 8, 0, Math.PI * 2);
            this.ctx.arc(x, y + 10, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawBanner(x, y, text) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x - 80, y, 160, 30);
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y + 20);
    }

    drawCloud(x, y, size = 1) {
        if (this.graphicsMode === 'classic') {
            // VGA-style simple puffy clouds
            this.ctx.fillStyle = this.classicColors.white;

            // Simple overlapping circles
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
            // Enhanced clouds with gradient and depth
            this.ctx.save();

            // Cloud shadow for depth
            this.ctx.globalAlpha = 0.15;
            this.ctx.fillStyle = '#888888';
            this.ctx.beginPath();
            this.ctx.arc(x + 2, y + 4, 20 * size, 0, Math.PI * 2);
            this.ctx.arc(x + 27 * size, y + 4, 30 * size, 0, Math.PI * 2);
            this.ctx.arc(x + 52 * size, y + 4, 25 * size, 0, Math.PI * 2);
            this.ctx.arc(x + 72 * size, y + 4, 20 * size, 0, Math.PI * 2);
            this.ctx.fill();

            // Main cloud with gradient
            this.ctx.globalAlpha = 0.95;
            const gradient = this.ctx.createRadialGradient(
                x + 35 * size, y - 5, 10,
                x + 35 * size, y + 5, 60 * size
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.7, 'rgba(250, 250, 255, 0.95)');
            gradient.addColorStop(1, 'rgba(230, 235, 245, 0.8)');
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
