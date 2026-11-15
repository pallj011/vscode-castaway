# Changelog

## 0.1.8 — 2026-11-15

### Two new scenes

- **Hula** — grass skirt, lei, a flower in his hair, and a smart speaker
  playing "Hula Workout: Level 9". It's all in the hips. He has burned 4
  calories. The crab side-steps along in time.
- **Cruise Ship Party** — a three-act scene, the longest on the island. A
  cruise ship anchors at sunset: he's saved! It's a three-hour shore
  excursion. Six guests in loud shirts come ashore, light a bonfire and party
  into the night; the delivery drone turns up with a disco ball; Wilson gets
  a party hat. He passes out. *The next morning* the ship is a dot on the
  horizon, the beach is covered in cups and streamers, and he is left holding
  the bin bag. One-star review: "No Wi-Fi."
- New props: a cruise ship with cabin lights and a string of party bulbs,
  cruise passengers (dancing, drinking, taking photos), a mirror ball with
  sweeping coloured beams, party litter, a bin bag, and a hula-dancing Johnny
- A scene can now drive its own sky. The party runs sunset → night → morning
  whatever the real clock says, with a fade and a title card over each jump.
  Scene selection still follows your clock

## 0.1.7 — 2026-09-02

### Four new scenes

- **Prove You Are Not a Robot** — a CAPTCHA wants all the squares with boats
  in them. There are none, so he ticks them all anyway, while an actual ship
  sails past on the water behind him. Verification failed.
- **Daily Standup** — four video tiles, one colleague permanently off-camera,
  and the only blocker he has ever reported. "Let's take that offline."
- **Hey Coco** — a smart speaker with battery left and no idea where it is.
  Asked for the coast guard, it plays "Help" by The Beatles on all 1 devices.
- **Printer Says No** — it will print one S.O.S. once he replaces the cyan
  cartridge. The document is black and white. Then the paper jams in tray 2,
  and there is no tray 2.
- New props: a mesh-and-glowing-ring smart speaker, an inkjet printer with a
  page stuck a third of the way out, a floating CAPTCHA grid, and video-call
  tiles with a rotating active speaker
- The horizon ship was drawn above the waterline, hovering slightly in the
  sky; it now sits on the water. Also visible in Watching Horizon
- `npm test` now checks the `Choose Scene...` list against the scenes that
  actually exist, so the two cannot drift apart

New defaults: the island now lives in the Explorer sidebar and renders in
modern graphics out of the box. Existing settings are untouched — this only
changes what a fresh install looks like.

- `position` now defaults to `explorer` (was `panel`) and `graphicsMode` to
  `modern` (was `classic`)
- `Castaway: Start Island Session` reveals the sidebar view when that is where
  the island lives, instead of always opening an editor panel. The other
  commands (Next Scene, Choose Scene, Order a Package, Check the Phone) expand
  the view too, rather than quietly spawning a panel beside it
- Commands fired while the sidebar webview is still loading are now held and
  delivered once it is listening, instead of being dropped
- A graphics-mode change made while the sidebar view was closed is no longer
  lost — the view opens in the mode you picked
- README demo GIF re-recorded in modern graphics (same three scenes), and
  `dev.html` now opens in modern mode to match

### Dialogue no longer repeats itself

Speech bubbles blink off between lines, but the blink ran on the frame
counter while the line being shown was picked off the wall clock. The two
drifted, so a blink would cut a line in half and the same line would come
back after the gap — the castaway saying the same thing two or three times
in a row. Nine scenes did this; doomscrolling repeated all four of its lines.

- Lines are now scheduled on one clock, so the silent gap always falls
  *between* lines. A scene ends on silence instead of looping back to line one
- Searching for Signal and Robot Vacuum had a single line on a blink loop —
  both now rotate through several, so there is nothing to repeat
- Wilson's last line (`You always get me, Wilson.`) was scheduled 600ms after
  the scene ends and had never once been seen
- Message in a Bottle and Satellite Internet no longer restart their status
  sequence seconds before the scene is over
- `npm test` now walks every scene at frame rate and fails on a repeated line

## 0.1.6 — 2026-08-01

Five new scenes and a sidebar readability pass.

- New scenes: **Password Reset** (the 2FA code was sent via SMS — to the
  phone with zero bars), **Message in a Bottle** (shipped with real-time
  tracking: label created, awaiting pickup, ETA 2041), **Smart Doorbell**
  (motion detected: crab), **Targeted Advertising** (a plane tows an
  `ESCAPE TO PARADISE` banner past the island), and **Asking the AI**
  ("Great question! Step 1: book a ferry.")
- New props to match: a scuttling crab, a corked message bottle, a smart
  doorbell with a blinking camera LED, and a banner-towing prop plane
- Hero props (phones, laptop, satellite dish, Wilson, signal bars) now scale
  up in narrow panels the way speech-bubble text already did, so every scene
  stays readable in the Explorer sidebar
- Iconic floating status indicators, in the signal-bars idiom: a download
  arrow + progress track above the satellite laptop, buffering dots and a
  blinking red X above the video-call phone, and a 2FA code field with a
  blinking caret (red-slashed after lockout) above the login laptop
- Clouds drift continuously across the sky instead of blinking in and out
  and teleporting every second
- Sleeping Zs are white at night — they were drawn black on a near-black sky
- Stargazing no longer enters the daytime scene rotation
- The classic-mode evening sun is now a deep red that reads against the
  orange sunset sky instead of vanishing into it
- Canvas state-leak fixes: laptop and banner text settings no longer bleed
  into later draws

## 0.1.5 — 2026-07-09

Marketplace housekeeping.

- Source now on GitHub: https://github.com/pallj011/vscode-castaway
  (`repository`/`bugs`/`homepage` links on the marketplace page)
- README demo GIF: drone delivery, the campfire at night, and the roomba
  (`scripts/make-demo.js` regenerates it via headless Chrome + ffmpeg)

## 0.1.4 — 2026-07-09

Readability and behavior fixes.

- New setting `vscode-castaway.textSize` (small/medium/large/x-large) scales
  speech bubbles and all on-screen text — takes effect live, no reload
- Speech bubbles stay on screen much longer; the phone-signal "ONE BAR?!"
  moment now lingers instead of flashing for a quarter second
- Sitting Johnny (doomscrolling, satellite internet, Wilson) got his legs
  back: knees drawn up in a clear silhouette with shorts on his thighs,
  instead of flat skin-tone legs that vanished into night-dimmed sand
- The robot vacuum now behaves like a real one: drives at random speeds,
  bumps, spins in place with an amber light and a circular scuff, then
  wanders off in a new direction at a new depth on the beach
- Raft building upgraded from bare-handed slapping to a proper two-handed
  mallet: driftwood handle, stone head, vine lashing
- The campfire got a full rebuild: teepee of driftwood logs in a stone ring,
  three-layer curling flames, rising embers, and drifting smoke
- The drone now delivers from a catalog of 20 disappointing items (bulk
  mayonnaise, a snow shovel, SPF 4 sunscreen, someone else's returns...)
- Extension icon: the island's palm tree in the classic VGA palette,
  generated from the same drawing math as the in-game tree
  (`scripts/make-icon.js`)

## 0.1.3 — 2026-07-09

Readable in the Explorer sidebar.

- Narrow views now zoom the camera onto the island action zone instead of
  shrinking the whole ocean to fit — Johnny is ~2× bigger in the sidebar
- Speech bubbles keep a minimum readable on-screen font size at small render
  scales, and clamp themselves inside the visible crop so text never gets cut
- Wide panel rendering is unchanged

## 0.1.2 — 2026-07-03

Art pass: the island stops looking programmer-drawn.

- Johnny redesigned: shaggy hair, castaway beard, ragged tee and shorts,
  jointed limbs with a real walk cycle, facing direction, and proper poses
  (standing, running, fishing, building, arm-up, sitting, lying)
- Palm tree redesigned: curved tapering trunk with ring segments and a sunlit
  edge, seven drooping leaf-shaped fronds with center ribs, coconuts, and a
  gentle sway in the breeze
- Island dressed up: wet-sand shoreline, breathing foam arcs, starfish,
  shells, a grass tuft, and pebbles
- Fixed actors clipping through the island: ships and jetskis now pass behind
  it on the far water (new far-render layer), and the fishing line finally
  lands in actual water instead of on the sand
- Fishing got a flexing rod, a red-and-white bobber, and expanding ripples

## 0.1.1 — 2026-07-03

Graphics pass: nights and golden hours.

- Full time-of-day rendering in both graphics modes: sunrise, day, sunset, night
- Crescent moon with craters and halo, stars in classic mode, moonlight glitter path on the water
- Fireflies and a moonlit dim at night; campfire glow, lit phone screens, and drone navigation lights + drop-zone spotlight shine through it
- New scene: Stargazing (shooting star, passing satellite, one very specific wish)
- Scene selection is now time-aware (`nightWeight`) — stargazing, doomscrolling, and sleeping favor night; jogging and selfies favor day
- Sunset-tinted and night-dimmed clouds

## 0.1.0 — 2026-07-03

Initial release: Johnny Castaway–style island in a VS Code webview, built on
the vscode-pets architecture. 17 scenes (8 classic, 9 modern), classic/modern
graphics modes, holiday easter eggs, panel or Explorer placement.
