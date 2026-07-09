# Johnny Castaway - Feature List

## Current Features (v1.0)

### Graphics Modes
- ✅ **Classic Mode**: Pixel-art style matching 1992 original aesthetics
- ✅ **Modern Mode**: Smooth gradients and enhanced visual effects
- ✅ Seamless switching between modes

### Scenes Implemented
1. **Idle** - Johnny standing on the island
2. **Fishing** - Johnny fishing with animated bobber
3. **Building Raft** - Progressive raft construction
4. **Sleeping** - Johnny sleeping with "ZZZ" animations
5. **Jogging** - Johnny running back and forth
6. **Coconut Gathering** - Coconut falls from tree
7. **Watching Horizon** - Sometimes a ship passes by (rare)
8. **Making Fire** - Building and tending a campfire

### Holiday Easter Eggs
- ✅ New Year's Eve - "Happy New Year" banner on palm tree
- ✅ Halloween - Jack-o'-lantern on beach
- ✅ Christmas - Christmas lights across sky
- ✅ St. Patrick's Day - Shamrocks floating
- ✅ Auto-detection based on system date

### Environment Features
- ✅ Dynamic sky (day/night based on time)
- ✅ Sun/Moon rendering
- ✅ Animated water with waves (modern mode)
- ✅ Moving clouds
- ✅ Palm tree with detailed fronds

### Controls
- ✅ Graphics mode toggle button
- ✅ Pause/Resume functionality
- ✅ Next Scene button (skip to new random scene)
- ✅ Keyboard shortcuts (Space, G, N)
- ✅ Real-time clock and date display

## Planned Features (v2.0+)

### Additional Scenes
- [ ] Mermaid visit
- [ ] Shark attack
- [ ] Pirates tying up Johnny
- [ ] Seagull stealing clothes
- [ ] Message in a bottle
- [ ] Attempted rescue (helicopter, boat)
- [ ] Rain dance
- [ ] Sand castle building
- [ ] Reading a book
- [ ] Star gazing (night)
- [ ] Thunder storm
- [ ] Treasure discovery
- [ ] Volleyball with Wilson-style friend
- [ ] Attempting to start fire with sticks
- [ ] Climbing palm tree

### Enhanced Features
- [ ] Sound effects toggle
- [ ] Background music
- [ ] Scene frequency adjustment
- [ ] Save/load preferences
- [ ] Fullscreen mode
- [ ] Multiple island themes
- [ ] Weather system (rain, storms, clear)
- [ ] Day/night cycle progression
- [ ] Season changes
- [ ] Statistics tracking (scenes viewed, time watched)

### Technical Improvements
- [ ] Electron app wrapper
- [ ] Windows 11 screensaver installer
- [ ] macOS screensaver bundle
- [ ] Linux screensaver integration
- [ ] Performance optimizations
- [ ] Mobile/tablet support
- [ ] Configuration file for customization
- [ ] Scene editor for adding custom scenes

### Holiday Expansions
- [ ] Valentine's Day - Hearts
- [ ] Easter - Easter eggs on beach
- [ ] Independence Day - Fireworks
- [ ] Thanksgiving - Turkey
- [ ] More detailed Christmas decorations
- [ ] New Year countdown animation

## Technical Notes

### Scene System
- Weight-based random selection ensures variety
- Each scene has configurable duration
- State management allows complex animations
- Easy to add new scenes by extending scene definitions

### Graphics System
- Canvas-based rendering
- Dual rendering paths (classic/modern)
- Modular drawing functions
- Easily extensible for new visual elements

### Performance
- 60 FPS target
- Efficient state updates
- Minimal DOM manipulation
- RequestAnimationFrame for smooth animation

## Known Limitations
- No audio yet
- Limited to ~8 main scenes (original had 30+)
- Holiday detection is simplified
- No "story progression" like original
- No rare events yet (1/1000 chance scenes)
