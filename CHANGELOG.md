# Changelog

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
