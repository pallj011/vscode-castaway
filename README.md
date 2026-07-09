# Castaway for VS Code

A Johnny Castaway–style island survivor who lives in your editor — built on the
architecture of [vscode-pets](https://github.com/tonybaloney/vscode-pets), with
the 1992 desert-island premise dragged kicking and screaming into the modern
world. He has a phone. It has no bars. A drone delivers packages. They contain
socks.

## Scenes

**The classics** — idle, fishing, raft building (with a proper two-handed
stone mallet), sleeping, jogging (now with smartwatch step-goal celebrations),
coconut gathering, watching the horizon, and making fire — a real one, with a
driftwood teepee, a stone ring, rising embers, and drifting smoke.

**The modern conveniences**

| Scene | What happens |
|---|---|
| Drone Delivery | A quadcopter winches down a smiling cardboard box. Contents: one of 20 disappointments (bulk mayonnaise, a snow shovel, someone else's returns...). |
| Searching for Signal | Phone held aloft. Zero bars. Occasionally one bar, briefly, cruelly. |
| Island Selfie | Selfie stick, countdown, flash, `#castaway #day2947 #blessed`. |
| Doomscrolling | Sitting in the phone glow, refreshing a feed with no new posts. |
| Video Call | Phone propped on a delivery box. Buffering. Buffering. Call failed. |
| Satellite Internet | Dish, laptop, `RESCUE_MAP.ZIP` at 2%, ETA 14 years. |
| Food Delivery | A delivery jetski passes by. It's the wrong island. |
| Robot Vacuum | It came in one of the boxes. It cruises, bumps, spins in place, and wanders off in a new direction. The sand gets tidied eventually. |
| Wilson | A volleyball is a fine conversationalist. |
| Stargazing | Shooting stars, a passing satellite, and one very specific wish. |

The island follows your clock through a full day: golden sunrise, bright
afternoon, orange-and-purple sunset, and a proper night — crescent moon with
craters, twinkling stars, a shimmering moonlight path on the water, and
fireflies over the sand. At night the world dims and the light sources take
over: the campfire throws a warm glow, phone screens light Johnny's face, and
delivery drones switch on red/green navigation lights and a drop-zone
spotlight. Scene selection is time-aware — stargazing, doomscrolling, and
sleeping at night; jogging and selfies by day.

Plus holiday easter eggs (Halloween, Christmas, St. Patrick's, New Year's Eve)
and two graphics modes: **classic** (1992 VGA pixel look) and **modern**
(gradients and effects).

## Commands (⇧⌘P)

- `Castaway: Start Island Session` — open the island in an editor panel
- `Castaway: Next Scene` / `Castaway: Choose Scene...`
- `Castaway: Order a Package (Drone Delivery)` — same-decade shipping
- `Castaway: Check the Phone` — a random phone scene
- `Castaway: Toggle Graphics Mode (Classic/Modern)`
- `Castaway: Pause/Resume`

## Settings

- `vscode-castaway.graphicsMode` — `classic` (default) or `modern`
- `vscode-castaway.position` — `panel` (default) or `explorer` (sidebar view)
- `vscode-castaway.textSize` — `small`, `medium` (default), `large`, or
  `x-large`; bump it up if speech bubbles are hard to read in the sidebar

## Development

```bash
npm install
npm test          # compile + headless smoke test of every scene
```

Press **F5** in VS Code to launch an Extension Development Host, or open
`dev.html` in a browser for a standalone harness with scene-picker buttons.

- `src/extension.ts` — extension host (panel + explorer view, commands)
- `media/` — the webview: `engine.js` (loop/messages), `renderer.js`
  (classic + modern drawing), `scenes.js` (scene definitions), `calendar.js`
- `legacy/` — the original browser-only prototype this was ported from

## Credits

A loving riff on *Johnny Castaway* (1992, Sierra On-Line/Dynamix) and the
extension scaffolding of vscode-pets (MIT, Anthony Shaw). Not affiliated with
any retailer whose logo may or may not be a smile.
