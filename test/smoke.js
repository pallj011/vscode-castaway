// Headless smoke test: runs every scene in both graphics modes against a
// stubbed 2D canvas context and fails on any thrown error (bad method calls,
// undefined variables, etc.). No browser or GPU required.

'use strict';

const path = require('path');

// --- Minimal canvas/context/DOM stubs -----------------------------------

function makeGradient() {
    return { addColorStop() {} };
}

function makeContext() {
    const noop = () => {};
    return {
        canvas: null,
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'miter',
        globalAlpha: 1,
        font: '10px monospace',
        textAlign: 'left',
        textBaseline: 'alphabetic',
        imageSmoothingEnabled: true,
        clearRect: noop,
        fillRect: noop,
        strokeRect: noop,
        beginPath: noop,
        closePath: noop,
        moveTo: noop,
        lineTo: noop,
        arc: noop,
        ellipse: noop,
        rect: noop,
        roundRect: noop,
        quadraticCurveTo: noop,
        bezierCurveTo: noop,
        fill: noop,
        stroke: noop,
        save: noop,
        restore: noop,
        translate: noop,
        rotate: noop,
        scale: noop,
        setTransform: noop,
        fillText: noop,
        strokeText: noop,
        measureText: (t) => ({ width: t.length * 7 }),
        createLinearGradient: makeGradient,
        createRadialGradient: makeGradient,
    };
}

function makeCanvas() {
    const ctx = makeContext();
    const canvas = {
        width: 1200,
        height: 600,
        clientWidth: 1200,
        clientHeight: 600,
        getContext: () => ctx,
    };
    ctx.canvas = canvas;
    return canvas;
}

// --- Load the webview modules --------------------------------------------

const media = (f) => path.join(__dirname, '..', 'media', f);
const { Calendar } = require(media('calendar.js'));
const { Renderer } = require(media('renderer.js'));
const { SceneManager } = require(media('scenes.js'));

// --- Exercise every scene in both modes, day and night --------------------

let failures = 0;

// A calendar we can force into any time of day and holiday.
class FakeCalendar extends Calendar {
    constructor(tod, holidayKey) {
        super();
        this.tod = tod;
        this.holidayKey = holidayKey || null;
    }
    getTimeOfDay() {
        return this.tod;
    }
    getCurrentHoliday() {
        return this.holidayKey
            ? { key: this.holidayKey, name: this.holidayKey }
            : null;
    }
}

const holidays = [null, 'halloween', 'christmas', 'stPatricks', 'newYearEve'];

for (const mode of ['classic', 'modern']) {
    for (const tod of ['morning', 'afternoon', 'evening', 'night']) {
        const night = tod === 'night';
        const canvas = makeCanvas();
        const renderer = new Renderer(canvas);
        renderer.setGraphicsMode(mode);
        const calendar = new FakeCalendar(tod, night ? null : holidays[Math.floor(Math.random() * holidays.length)]);
        const manager = new SceneManager(renderer, calendar);

        for (const sceneKey of Object.keys(manager.scenes)) {
            try {
                manager.setScene(sceneKey);
                // Simulate the whole scene: hop through its duration so every
                // elapsed-time phase (drone approach, drop, flight out...) runs.
                const phases = 12;
                const originalNow = Date.now;
                const start = originalNow();
                const duration = manager.scenes[sceneKey].duration;
                for (let p = 0; p <= phases; p++) {
                    const fakeElapsed = (duration * p) / phases - 1; // stay within scene
                    Date.now = () => start + Math.max(0, fakeElapsed);
                    for (let f = 0; f < 10; f++) {
                        manager.frame++;
                        if (manager.currentScene.update) {
                            manager.sceneState = manager.currentScene.update(manager.sceneState);
                        }
                        manager.render();
                    }
                }
                Date.now = originalNow;
                console.log(`ok   ${mode}/${tod} ${sceneKey}`);
            } catch (err) {
                failures++;
                console.error(`FAIL ${mode}/${tod} ${sceneKey}: ${err.stack}`);
            }
        }

        // Scene rotation for a while (random selection paths)
        try {
            for (let i = 0; i < 50; i++) {
                manager.setScene(manager.selectRandomScene());
                manager.update();
                manager.render();
            }
            console.log(`ok   ${mode}/${tod} random-rotation`);
        } catch (err) {
            failures++;
            console.error(`FAIL ${mode}/${tod} random-rotation: ${err.stack}`);
        }
    }
}

// --- Dialogue: no scene may say the same line twice in a row --------------
//
// Speech bubbles blink off between lines. If the blink is driven by a clock
// that does not match the one choosing the line, a line gets cut in half and
// comes back after the gap, so the castaway appears to repeat himself. Walk
// each scene at frame rate and assert that consecutive bubbles differ.
{
    const FPS = 60;
    const canvas = makeCanvas();
    const renderer = new Renderer(canvas);
    renderer.setGraphicsMode('modern');
    const manager = new SceneManager(renderer, new FakeCalendar('afternoon'));

    let shown = [];
    renderer.drawSpeechBubble = (x, y, text) => shown.push(String(text));

    for (const sceneKey of Object.keys(manager.scenes)) {
        const duration = manager.scenes[sceneKey].duration;
        const originalNow = Date.now;
        const start = originalNow();
        Date.now = () => start;
        manager.setScene(sceneKey);

        let previous = null;
        let lastNonEmpty = null;
        const repeats = [];
        for (let t = 0; t <= duration; t += 1000 / FPS) {
            Date.now = () => start + t;
            manager.frame++;
            if (manager.currentScene.update) {
                manager.sceneState = manager.currentScene.update(manager.sceneState);
            }
            shown = [];
            manager.currentScene.render(manager.sceneState);
            const current = shown.join(' | ');
            if (current !== previous) {
                // A line reappearing after a silent gap is the repeat we care
                // about; text changing straight to something else is fine.
                if (current !== '' && current === lastNonEmpty) {
                    repeats.push(`${Math.round(t)}ms "${current}"`);
                }
                if (current !== '') {
                    lastNonEmpty = current;
                }
                previous = current;
            }
        }
        Date.now = originalNow;

        if (repeats.length) {
            failures++;
            console.error(
                `FAIL dialogue ${sceneKey}: repeats ${repeats.join(', ')}`);
        } else {
            console.log(`ok   dialogue ${sceneKey}`);
        }
    }
}

// --- The Choose Scene... picker must list exactly the scenes that exist ----
//
// src/extension.ts keeps its own copy of the scene ids. A scene missing from
// it never appears in the picker; an id that no longer exists sets a scene
// the webview does not have.
{
    const fs = require('fs');
    const source = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'extension.ts'), 'utf8');
    const listed = [...source.matchAll(/\{ id: '([A-Za-z]+)'/g)].map((m) => m[1]);

    const canvas = makeCanvas();
    const manager = new SceneManager(new Renderer(canvas), new Calendar());
    const actual = Object.keys(manager.scenes);

    const missing = actual.filter((k) => !listed.includes(k));
    const extra = listed.filter((k) => !actual.includes(k));
    if (missing.length || extra.length) {
        failures++;
        if (missing.length) {
            console.error(`FAIL picker: scenes missing from extension.ts: ${missing.join(', ')}`);
        }
        if (extra.length) {
            console.error(`FAIL picker: extension.ts lists unknown scenes: ${extra.join(', ')}`);
        }
    } else {
        console.log(`ok   picker lists all ${actual.length} scenes`);
    }
}

// Calendar sanity
{
    const cal = new Calendar();
    const tod = cal.getTimeOfDay();
    if (!['morning', 'afternoon', 'evening', 'night'].includes(tod)) {
        failures++;
        console.error(`FAIL calendar.getTimeOfDay returned ${tod}`);
    } else {
        console.log('ok   calendar');
    }
}

if (failures > 0) {
    console.error(`\n${failures} smoke test failure(s)`);
    process.exit(1);
}
console.log('\nAll smoke tests passed.');
