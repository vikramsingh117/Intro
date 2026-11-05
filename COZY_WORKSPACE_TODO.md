# After Hours — cozy workspace

Current implementation on `main` (updated 2026-10-27). `/after-hours` and `/workbench` share the fullscreen room. The Simple portfolio remains the readable alternative.

## Implemented

- [x] Wooden desk, drawers, extended room shell and ceiling, window with night-city skyline.
- [x] Smooth monitor/window/notebook camera transitions, main-room orbit/pinch zoom and bounded window look-around.
- [x] Perspective-projected desktop remains on the monitor in room and focused views.
- [x] My Work, About Me, Projects, AI Assistant, Terminal, Task Manager, Photos and Credits apps; GitHub, LinkedIn, LeetCode and email shortcuts.
- [x] Movable/resizable windows, minimize/maximize/restore, taskbar and desktop context menu. Native drag/resize pointers; themed square cursor elsewhere.
- [x] Mobile app layout, larger controls, plain monitor background and software-keyboard-aware sizing.
- [x] Simulated terminal with virtual files, history/completion, common Linux commands and sudo. Top/ps report desktop app snapshots, not OS telemetry.
- [x] Desk lamp and suspended ceiling light toggle; fixture shadow artifacts reduced. Ceiling fixture lowered into the room framing.
- [x] Home entry primes radio playback and fades to volume 0.28 over 11 seconds; manual toggles and exit cleanup remain supported. Direct visits start silent.
- [x] Physical notebook opening/page-turn animations, three rough-note spreads, local page/open state, readable projected pages and accessible text.
- [x] Drawer and glasses animations; lens blur allows continued exploration.
- [x] Shared MongoDB sticky notes with in-scene writing, peeling, placement, reading, browser ownership and validated CRUD.
- [x] Night-city view, slow AC-130 flyby, navigation lights and subtle trails. Aircraft pauses outside the city view, when hidden, or with reduced motion.
- [x] Decorative chair, keyboard, plant, Pascal soft toy and stool; hover-driven upliance lid, blue LEDs and cooking display with click/tap work-display focus and reduced-motion support.
- [x] Stool legs lengthened 30% without changing seat size. Final placement settings applied; temporary controls removed.
- [x] Simple loads before After Hours. Homepage room illustration fills silently with asset progress; no ready/loading popup.
- [x] Optimized city and room textures; simplified/quantized upliance GLB; original source assets and attribution preserved.

- [x] Shared Photos gallery backed by MongoDB, in-monitor camera, retro scanline preview, explicit upload, owner deletion, and camera cleanup on leaving the app.
- [x] Upliance uses the same subtle hover boundary outline as other interactive room objects.
- [x] Approved headphone mascot uses six-step pixel bob/nod, alternating foot taps and progressing music notes. Actual radio playback (including default entrance playback) selects music mode above the room greeting; music off restores normal greeting/idle/sleep behavior. Hint interaction and compact taskbar placement remain available; hidden/reduced-motion states pause animation. Static monitor fallback reflects the headphone pose while music plays. Owner visual review pending.
- [x] Cache stationary directional-light and desk-lamp shadow maps. Refresh for caster loading/removal, visibility, transforms, geometry changes and light toggles; swinging ceiling spotlight remains dynamic. Check after animations and before postprocessing so moving paper, pages, drawer and upliance retain correct shadows. Owner startup-performance review pending.
- [x] Hover responsiveness: custom cursor follows the pointer directly; detailed interactive meshes use cached local box hit tests while retaining existing event targets; hover labels update independently of the workbench; outlines are reused, with cached stationary bounds and visible moving-object updates. Bloom and SMAA preserved. Owner interaction review pending.

- [x] Home entry zoom/black fade/room reveal; stable mobile recommended label and themed Home links.
- [x] Focused views consume browser Back before page navigation; Home link hidden while focused.
- [x] Upliance work display with four pages, plain inside-edge arrows, × close, outside-click and Escape exit.
- [x] SMAA scene antialiasing and a separate projected-monitor edge mask; bounded mobile orbit (-0.3 to 1.15 radians).
- [x] Shared screenshot-based Open Graph/Twitter previews.
- [x] Production MongoDB IP-based landing counts, action history, elapsed/visible-tab duration, and privacy disclosure.
- [x] Best-effort ntfy notifications for new photos, India landings, and newly shared sticky-note messages.
- [x] Office Solutions Power BI benchmarking details aligned across Simple, monitor apps, and assistant knowledge.

## Final placement

Coordinates use scene units; Y is the model base and scale multiplies its normalized size.

| Prop | X | Y | Z | Y rotation ° | Scale |
| --- | ---: | ---: | ---: | ---: | ---: |
| Stool | 6.53 | -4.8 | 0.13 | 0 | 1.12 |
| Upliance | 6.61 | -1.36 | -0.17 | 0 | 0.79 |
| Pascal | -4.02 | -1.53 | -1.11 | -31 | 1 |

Plant: `[-6.65, -4.8, 0.2]`, left of desk. Ceiling light suspension anchor: Y=7.2, ceiling Y=24. Final object settings are in `components/workbench/propPlacement.js`; old browser placement values no longer affect the scene.

## Remaining / optional

### Mascot next steps (2026-11-05)

- [x] Important: keep mobile mascot messages in a fixed-height band beside the mascot, reserve shortcut space, and paginate long hints.
- [x] Important: preload the pixel font from the initial page head and wait for it before revealing hint text.
- [x] Important: wake the mascot from the taskbar to its original standing state when the last app closes/minimizes or the visitor asks for a hint; skip motion for reduced-motion users.
- [ ] Expand the mascot's contextual tips.
- [ ] Add pixel-style confetti and a celebration animation whenever user opens a monitor shortcut app.
- [ ] Improve the terminal commands and add more interesting things to discover.
- [ ] Integrate the mascot into the AI Assistant app.

Current mascot baseline: monitor greeting waves/jumps, then idle pixel-step strolls along the taskbar both inside and outside the monitor; alternating feet, bobbing body, swinging arms and directional glances. Walking stays within responsive desktop bounds and pauses on hover/focus. Music takes priority, hints return to their usual spot, open apps retain taskbar sleep, and hidden/reduced-motion states do not walk. Click-to-cycle pixel-font hints and tuck/wake animations remain. Owner walking visual review pending.

### Other workspace ideas
- [x] Important: show an accessible loading message after a queued After Hours click, then enter automatically when ready.
- [x] Important: remove Simple's repeated About Me introduction; use the hero, work experience, background, and toolbox sections instead.
- [x] Important: record major chooser and mascot steps through the existing database analytics pipeline (wait, enter, hint, dismiss, sleep, wake); no text content or animation-frame events.
- [x] Add draggable ceiling-light suspension above upliance: flexible segmented rope bends with slack when lifted; gravity drops the light on release, then damped motion settles it upright. Starts raised and drops on load; heavier shade and lower damping retain more wobble. Startup drop is disabled for reduced motion. Owner visual review pending.
- [x] Drag the notebook's right-hand page to lift and tear it on release; normal clicks turn pages. Torn sheets flip only their ragged binding strip on both sides. Torn paper goes into a background-free paper-ball icon at bottom left. Click the icon to center the downloaded ball model, then flick with mouse or touch: direction aims the throw and release speed sets force (5.4-unit baseline, reduced 40%). Aiming shows only “Flick to throw” and Esc; Escape restores inventory. Camera and room controls pause only while aiming. Inventory hides in focused views. One stored ball at a time; thrown balls persist for the session with gravity, collisions, bounce, friction and sleep. Owner visual review pending.
- [ ] Task manager should also show how many componetns user has interacted with, out of all.

Validation: new automated tests removed at the owner's request. Mobile positioning and animation appearance still need owner visual review; no browser inspector used. Local/preview analytics remain intentionally disabled, so no production database writes were made during testing.

The earlier subway exterior and click-to-sit chair were replaced: the skyline is current, and the chair is decorative. No new work on those earlier interactions is planned.

See `README.md` for setup and architecture, `public/models/README.md` for asset attribution and reproducible optimization, and `STYLE_GUIDE.md` for design direction. Keep assistant knowledge in `lib/profile.js` and `lib/assistant-context.js` aligned with implemented behavior.
