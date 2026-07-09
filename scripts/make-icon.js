// Generates media/icon.svg — the extension icon: the game's palm tree on its
// island, in the classic VGA palette. The trunk/frond math is copied from
// Renderer.drawPalmTree / drawPalmCrown (sway = 0) so the icon matches what
// the extension actually draws. Rasterize to media/icon.png afterwards, e.g.:
//   qlmanage -t -s 256 media/icon.svg -o media && mv media/icon.svg.png media/icon.png

'use strict';

const fs = require('fs');
const path = require('path');

const W = 340;
const H = 340;

// Classic VGA palette (renderer.js classicColors)
const C = {
    sky: '#00DDFF',
    water: '#0044BB',
    waterHorizon: '#5599DD',
    waterMid: '#0066CC',
    sand: '#FFDD55',
    sandDark: '#DDAA33',
    palmTrunk: '#AA5522',
    palmTrunkDark: '#884411',
    palmLeaf: '#00DD00',
    palmLeafDark: '#00AA00',
    rib: '#007700',
    sunlitEdge: '#CC7733',
    coconut: '#8B4513',
    sun: '#FFEE88'
};

const fmt = (n) => Number(n.toFixed(2));

// --- Trunk: tapered polygon sampled along a quadratic spine ---------------
function trunk(x, y) {
    const trunkHeight = 185;
    const lean = 38;
    const baseW = 24;
    const topW = 11;
    const topX = x + lean;
    const topY = y - trunkHeight;
    const cpX = x + lean * 0.15;
    const cpY = y - trunkHeight * 0.55;
    const pt = (t) => ({
        x: (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cpX + t * t * topX,
        y: (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cpY + t * t * topY,
        w: baseW + (topW - baseW) * t
    });
    const N = 14;

    const left = [];
    const right = [];
    for (let i = 0; i <= N; i++) {
        const p = pt(i / N);
        left.push(`${fmt(p.x - p.w / 2)},${fmt(p.y)}`);
        right.unshift(`${fmt(p.x + p.w / 2)},${fmt(p.y)}`);
    }
    const body = `<polygon points="${left.join(' ')} ${right.join(' ')}" fill="${C.palmTrunk}"/>`;

    // Ring segments following the taper (lower half-ellipses)
    let rings = '';
    for (let i = 1; i <= 8; i++) {
        const p = pt(i / 9);
        const r = p.w / 2;
        rings += `<path d="M ${fmt(p.x - r)} ${fmt(p.y)} A ${fmt(r)} 3.2 0 0 0 ${fmt(p.x + r)} ${fmt(p.y)}" ` +
            `fill="none" stroke="${C.palmTrunkDark}" stroke-width="3"/>`;
    }

    // Sunlit edge along the left side
    const edge = [];
    for (let i = 0; i <= N; i++) {
        const p = pt(i / N);
        edge.push(`${fmt(p.x - p.w / 2 + 2.5)},${fmt(p.y)}`);
    }
    const sunlit = `<polyline points="${edge.join(' ')}" fill="none" stroke="${C.sunlitEdge}" stroke-width="2.5"/>`;

    // Root flare
    const flare = `<ellipse cx="${x}" cy="${y + 1}" rx="${baseW * 0.85}" ry="5.5" fill="${C.palmTrunkDark}"/>`;

    return { svg: body + rings + sunlit + flare, topX, topY };
}

// --- Crown: 7 drooping fronds, ribs, coconuts (drawPalmCrown, sway 0) -----
function crown(x, y) {
    const fronds = [
        { a: Math.PI * 0.96, L: 94 },
        { a: Math.PI * 0.78, L: 98 },
        { a: Math.PI * 0.62, L: 88 },
        { a: Math.PI * 0.50, L: 84 },
        { a: Math.PI * 0.38, L: 90 },
        { a: Math.PI * 0.20, L: 100 },
        { a: Math.PI * 0.04, L: 96 }
    ];
    let svg = '';
    fronds.forEach((f, i) => {
        const dx = Math.cos(f.a);
        const dy = -Math.sin(f.a);
        const droop = 30 * (1 - Math.abs(dy)) + 10;
        const tipX = x + dx * f.L;
        const tipY = y + dy * f.L * 0.65 + droop;
        const upX = x + dx * f.L * 0.45;
        const upY = y + dy * f.L * 0.75 - 14;
        const loX = x + dx * f.L * 0.55;
        const loY = y + dy * f.L * 0.35 + droop * 0.7;
        const fill = i % 2 ? C.palmLeaf : C.palmLeafDark;
        svg += `<path d="M ${x} ${y} Q ${fmt(upX)} ${fmt(upY)} ${fmt(tipX)} ${fmt(tipY)} ` +
            `Q ${fmt(loX)} ${fmt(loY)} ${x} ${y} Z" fill="${fill}"/>`;
        svg += `<path d="M ${x} ${y} Q ${fmt((upX + loX) / 2)} ${fmt((upY + loY) / 2)} ` +
            `${fmt(tipX)} ${fmt(tipY)}" fill="none" stroke="${C.rib}" stroke-width="2"/>`;
    });
    for (const [cx, cy] of [[-9, 9], [6, 12], [-1, 17]]) {
        svg += `<circle cx="${x + cx}" cy="${y + cy}" r="6.5" fill="${C.coconut}"/>`;
    }
    return svg;
}

// --- Compose ---------------------------------------------------------------
const baseX = 150;
const baseY = 292;
const t = trunk(baseX, baseY);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.sky}"/>
  <circle cx="52" cy="50" r="22" fill="${C.sun}"/>
  <rect y="200" width="${W}" height="${H - 200}" fill="${C.water}"/>
  <rect y="198" width="${W}" height="4" fill="${C.waterHorizon}"/>
  <rect y="222" width="${W}" height="2.5" fill="${C.waterMid}"/>
  <rect y="248" width="${W}" height="2.5" fill="${C.waterMid}"/>
  <ellipse cx="170" cy="332" rx="160" ry="64" fill="${C.sandDark}"/>
  <ellipse cx="170" cy="328" rx="155" ry="60" fill="${C.sand}"/>
  ${t.svg}
  ${crown(t.topX, t.topY)}
</svg>
`;

const out = path.join(__dirname, '..', 'media', 'icon.svg');
fs.writeFileSync(out, svg);
console.log(`wrote ${out}`);
