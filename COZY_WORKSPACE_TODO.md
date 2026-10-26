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

- [ ] Owner visual review of final object spacing, stool/appliance contact, raised-light reach, mobile framing and weak-device performance.
- [ ] Broader keyboard-only access to all physical object interactions.
- [ ] Optional rain on glass and subtle room reflection, within rendering budget.
- [ ] More detailed decision case studies, if supporting personal evidence is supplied.
- [ ] Cross-app search and optional wallpaper selection.
- [ ] Owner visual review of appliance lid travel, blue light intensity and screen alignment in the room.
- [ ] Distributed abuse protection/moderation for the public wall if traffic warrants it; current write limits are process-local.

The earlier subway exterior and click-to-sit chair were replaced: the skyline is current, and the chair is decorative. No new work on those earlier interactions is planned.

See `README.md` for setup and architecture, `public/models/README.md` for asset attribution and reproducible optimization, and `STYLE_GUIDE.md` for design direction. Keep assistant knowledge in `lib/profile.js` and `lib/assistant-context.js` aligned with implemented behavior.
