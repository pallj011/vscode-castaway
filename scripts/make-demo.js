// Captures docs/demo.gif for the README: drives dev.html in headless Chrome
// through a few showcase scenes, screenshots the canvas at ~10fps, and
// assembles the frames with ffmpeg (must be on PATH).
//   node scripts/make-demo.js

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEV_HTML = path.join(__dirname, '..', 'dev.html');
const OUT_GIF = path.join(__dirname, '..', 'docs', 'demo.gif');
const FPS = 10;

// Each segment: scene + time-of-day + how far into the scene to start,
// and how long to record. Chosen for the money shots.
const SEGMENTS = [
    // Drone winches the box down, Johnny walks over, opens it
    { scene: 'droneDelivery', tod: 'day', elapsed: 5500, seconds: 5 },
    // Campfire at night: logs, flames, embers, smoke, glow
    { scene: 'fire', tod: 'night', elapsed: 9000, seconds: 4 },
    // Roomba wandering the beach
    { scene: 'robotVacuum', tod: 'day', elapsed: 1000, seconds: 4 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'castaway-frames-'));
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 700, height: 400, deviceScaleFactor: 1 });

    let n = 0;
    for (const seg of SEGMENTS) {
        const url = `file://${DEV_HTML}?mode=classic&scene=${seg.scene}` +
            `&tod=${seg.tod}&elapsed=${seg.elapsed}`;
        await page.goto(url);
        await page.addStyleTag({
            content: '#islandCanvas{width:640px;height:320px;display:block;}' +
                '.toolbar{display:none}body{margin:0}',
        });
        await page.evaluate(() => window.dispatchEvent(new Event('resize')));
        await sleep(300); // let the first frames settle
        const canvas = await page.$('#islandCanvas');

        const frames = seg.seconds * FPS;
        const interval = 1000 / FPS;
        const t0 = Date.now();
        for (let i = 0; i < frames; i++, n++) {
            await canvas.screenshot({
                path: path.join(frameDir, `frame-${String(n).padStart(4, '0')}.png`),
            });
            const behind = Date.now() - (t0 + (i + 1) * interval);
            if (behind < 0) {
                await sleep(-behind);
            }
        }
        console.log(`${seg.scene}: ${frames} frames`);
    }
    await browser.close();

    fs.mkdirSync(path.dirname(OUT_GIF), { recursive: true });
    execFileSync('ffmpeg', [
        '-y', '-framerate', String(FPS),
        '-i', path.join(frameDir, 'frame-%04d.png'),
        '-vf', 'split[s0][s1];[s0]palettegen=max_colors=128[p];' +
            '[s1][p]paletteuse=dither=bayer:bayer_scale=3',
        OUT_GIF,
    ], { stdio: 'pipe' });
    fs.rmSync(frameDir, { recursive: true, force: true });

    const kb = Math.round(fs.statSync(OUT_GIF).size / 1024);
    console.log(`wrote ${OUT_GIF} (${n} frames, ${kb} KB)`);
})();
