# Beyond Hours — Cozy Workspace

## Direction

Build a lived-in apartment workspace on a rainy city evening: a wooden desk,
warm desk lamp, muted metal, a little intentional clutter, and cool light from
outside. The room adds personality and atmosphere; portfolio content lives in
the monitor. Decide the desktop content and organization separately.

Keep the first version focused on four interactive objects: monitor, lamp,
window, and notebook. Keyboard and small desk items can initially be scenery.

## Existing prototype

- Preview route: `/workbench`.
- Branch: `vikram/beyond-hours-3d`.
- React Three Fiber scene with a reused Kenney CC0 monitor.
- Monitor screen orientation corrected; click-to-enter camera transition and
  desktop exit implemented. Finish verifying both transition directions.
- Basic My Work and About Me desktop windows exist as provisional content.
- Asset source and license are recorded in `public/models/README.md`.

## 1. Establish the room

- [x] Replace the isolated platform with a full wooden desk.
- [x] Add a restrained room shell and a window beside the desk.
- [ ] Place the monitor, desk lamp, notebook, and keyboard within easy reach.
- [ ] Add a few subtle signs of use: a pen, mug, or cable, without visual clutter.
- [x] Establish warm interior and cool exterior colors and materials.
- [ ] Compose a welcoming default view from a seated position.
- [ ] Check framing on narrow screens before adding detail.

## 2. Three composed views

- [ ] **Desk:** default view showing the monitor, lamp, keyboard, and notebook.
- [ ] **Window:** move closer to the rainy city view while keeping part of the
  desk visible.
- [ ] **Notebook:** move close enough to read and interact with its pages.
- [ ] Use smooth, bounded camera transitions between views rather than free
  movement through the room.
- [ ] Keep a visible **Back to desk** control in every focused view, including
  the computer desktop.
- [ ] Support Escape to close the current interaction or return to the desk.
- [ ] Prevent overlapping transitions when objects are clicked repeatedly.
- [ ] Preserve room state, including the lamp setting, when returning to desk.

## 3. Monitor — explore the portfolio

- [ ] Verify that clicking the monitor smoothly zooms into its screen.
- [ ] Align the 3D screen and HTML desktop for a convincing handoff.
- [ ] Verify the reverse transition when leaving the desktop.
- [ ] Keep the separate visible enter button removed; provide a keyboard
  equivalent and an accessible fallback when 3D is unavailable.
- [ ] Keep the desktop readable and operable as ordinary HTML.
- [ ] Refine portfolio content and desktop organization in a later pass.

## 4. Lamp — change the atmosphere

- [x] Reuse the Grab3D architect lamp; click the lamp or its accessible toggle.
- [x] Toggle the lamp on and off with mouse, touch, and keyboard controls.
- [ ] Cast a warm pool of light across the desk and notebook.
- [x] Make the shade and bulb appearance agree with the lamp state.
- [ ] When switched off, let monitor glow and cool window light illuminate
  enough of the room to preserve navigation.
- [ ] Keep lighting changes comfortable in reduced-motion mode.

## 5. Window — a quiet moment outside

- [ ] Create a restrained nighttime city backdrop with a few lit windows.
- [ ] Add subtle rain on the glass and an optional rain toggle.
- [ ] Add a faint room reflection if it fits the rendering budget.
- [ ] Make the window selectable, with a clear close view and return path.
- [ ] Avoid unnecessary background animation; keep the scene calm.
- [ ] Leave ambient sound for a later pass; any sound must begin muted.

## 6. Notebook — personality

- [x] Place a closed notebook and pen on the desk.
- [x] Clicking the notebook opens it and moves to the notebook view.
- [x] Three illustrated spreads with animated physical page turns. Tap left/right pages or use arrow keys; open state and selected spread persist locally.
- [x] Use shared Upliance work history for AI/product, preference behavior, and
  observability notes. Doodles are conceptual, not claimed personal sketches or metrics.
- [x] Put text and doodles directly on the notebook pages, with a closer overhead camera; retain screen-reader text without a visible popup.
- [x] Use lit paper materials that respond to room and lamp lighting.
- [x] Click outside the notebook or press Escape to return; the book stays open on its current spread. No floating notebook controls.

## 7. Consistent interaction language

- [x] Subtle outline and short hover label for monitor, lamp, window, and notebook.
- [x] Remove Explore room per the updated direction; use direct object taps and hover labels.
- [x] Notebook keyboard navigation and screen-reader text remain available without visible controls.
- [x] Restore initiating focus after leaving a focused view.
- [x] Allow vertical touch scrolling over the canvas; mouse orbit/zoom remains enabled.
- [x] Back to desk and Escape available in every focused view.
- [x] Pen, keyboard, and decorative objects remain scenery.
- [ ] User visual/device review of notebook framing, hover outlines, and touch behavior.

## 8. Performance and fallbacks

- [ ] Load readable content and navigation before the 3D scene.
- [ ] Provide a static room preview and direct workspace access while loading
  or when WebGL fails.
- [ ] Respect reduced motion with direct view changes and still rain.
- [ ] Pause animation when the scene is offscreen or the tab is hidden.
- [ ] Limit pixel ratio, texture sizes, dynamic lights, and shadow resolution.
- [ ] Use lightweight geometry and reuse materials where possible.
- [ ] Test desktop, touch layouts, keyboard-only use, and weak-device fallbacks.
- [ ] Keep source and license records for every reused asset.

## Suggested implementation order

1. Room blockout, full desk, object placement, and camera views.
2. Monitor zoom and HTML desktop handoff in the new room.
3. Lamp toggle and coordinated lighting.
4. Window close view, city backdrop, and restrained rain.
5. Notebook opening and page navigation.
6. Material polish, subtle reflections, accessibility, and performance checks.

## Computer desktop — approved functionality

Build a small personal desktop with useful apps. Keep content one click away,
with no login, boot sequence, or setup steps blocking visitors. These ideas are
approved for the plan; implement them after the core room interactions.

### Apps

- [ ] **My Work:** browse projects and open case studies covering the problem,
  personal contribution, product decisions, implementation, and outcomes.
- [ ] **About Me:** experience, engineering interests, and a résumé link.
- [ ] **Ask Vikram:** portfolio assistant grounded in verified work, with useful
  suggested questions and clear limits when information is unavailable.
- [ ] **Decision Journal:** explain choices Vikram helped shape, including the
  problem, alternatives, reasoning, and resulting behavior. Start with dietary
  changes and saved allergens once the exact story is documented.
- [ ] **Open Source:** contributions with accurate status and direct PR links.
- [ ] **Contact:** copy email and open GitHub and LinkedIn links.

### Desktop and window behavior

- [x] Open, close, minimize, maximize, and restore app windows.
- [x] Drag title bars and resize edges/corners within desktop bounds, including the projected monitor coordinates.
- [x] Use the taskbar to switch apps and restore minimized windows.
- [ ] Search projects, technologies, and decisions from one place.
- [ ] Keep **Back to desk** visible and use the reverse zoom when leaving.
- [ ] On mobile, show one full-size app at a time with simple back navigation.
- [ ] Preserve keyboard access, visible focus, readable text, and usable
  scrolling throughout the desktop.

### Personal touches

- [ ] **Now:** a short note about what Vikram is learning or exploring; confirm
  its content with him and keep it easy to update.
- [ ] **Terminal:** a small simulated terminal with discoverable commands such
  as `help`, `about`, and `projects`. It does not execute system commands.
- [ ] **Wallpaper selector:** choose a wallpaper and remember the preference
  locally in the visitor's browser.
- [ ] **Read me first:** a brief file explaining how to explore the workspace.

### Desktop build order

1. Refine My Work and About Me; add basic window controls and the taskbar.
2. Add the Decision Journal and assistant once their source content is ready.
3. Add Open Source, Contact, and cross-app search.
4. Add personal touches and polish multi-window and mobile behavior.

## Later, only if useful

- Optional ambient audio.
- Interactive keyboard, drawers, plant, clock, or headphones.
- Additional personal details chosen with Vikram.
- Other portfolio page sections.

These additions are deferred until the four core objects feel cohesive.

## Selected keyboard — implemented

- [x] Import thethieme’s Keyboard as a static prop (no keyboard interactions).
  Source: https://sketchfab.com/3d-models/keyboard-cc7e7ed38d9a469ea499893295bc767a
  License: CC BY 4.0; include creator, source, license, and modification credit.
  Imported from the user-provided Sketchfab download; original files retained,
  with attribution in the preview and model documentation.

### Subway window view
- [x] Click the window (or Look outside) to open the downloaded Berlin U-Bahn model.
- [x] Place subway behind the window in the shared scene; smoothly move to the chosen fixed camera view and back.
- [x] Back to desk / Escape preserves lamp state; include visible asset attribution.
- [ ] Refine framing and atmosphere after visual review.

- [x] Keep the interactive desktop projected onto the physical monitor after zooming; Back to desk reverses the camera move.
- [x] Remove standalone lamp/window buttons; retain direct object clicks.

- [x] Place the notebook beside the lamp; shift the monitor and keyboard right to make room.

- [x] Add three wooden drawers with dark handles beneath the desk, leaving central legroom.

### Chair
- [x] Import Araon’s Rustic chair, credit the author, and face it toward the desk.
- [x] Start slightly farther back; click chair to sit and move closer to the desk.
- [x] Get up / Escape returns to the room view. Closing a monitor, window, or notebook interaction while seated returns to the seated view.

### Current exterior / chair revision
- [x] Chair is now decorative: remove click-to-sit, seated camera, and Get up control.
- [x] Replace the loaded subway with 99.Miles’ night-city skyline.
- [x] Temporary controls for city position/scale/rotation, camera/target/FOV, brightness, ambient, warm/cool lights, shadow strength, glow, and window emission.
- [x] Copy settings exports exact values for final tuning; Reset restores defaults.

- [x] Apply the user-selected final city position, camera, and lighting values in `citySettings.js`; remove the visible tuning panel.

- [x] Place the downloaded Iskra-Unitra RM 312 radio in front of the lamp as a decorative prop; retain license and attribution.

### Monitor window controls
- [x] Multiple windows with focus order, preserved position/size while minimized, and maximize/restore.
- [x] Keyboard arrow movement/resizing on focused title bar / resize grip; Escape closes the top window.
- [x] Terminal shortcut and window with a simulated Linux shell, virtual portfolio files, history, and completion.
- [x] Lint and drag/resize boundary + perspective coordinate checks pass. Browser testing left to the user.

### Terminal commands
- [x] Add help/man, whoami/id/hostname, pwd/ls/cd/tree, cat/head/tail/grep/wc, echo, mkdir/touch/rm, date/uname/uptime, simulated ping, history/clear/exit.
- [x] Keep file mutations local to the terminal session; no real shell or network execution.
- [x] Support quoted arguments, Tab completion, arrow-key history, Ctrl+L and Ctrl+C.
- [x] Seven command-engine tests pass (paths, parsing, mutations, filters, ping, completion, history).

### City flyby
- [x] Add the downloaded SIpriv AC-130 with attribution and original textures.
- [x] Slow, repeating flyby above the skyline, oriented along its path with subtle navigation lights.
- [x] Pause motion outside the focused city view, when hidden/offscreen, or with reduced motion.
- [ ] User visual review of aircraft framing and scale.

### Desktop portfolio content
- [x] Expand My Work with Upliance/Frodo product and engineering contributions, Office Solutions, and Cribble Org.
- [x] Add Projects with the Go crawler, portfolio, and selected open-source PR links.
- [x] Expand About Me with product/engineering focus, skills, education, and contact links.
- [x] Add direct GitHub, LinkedIn, and LeetCode apps using the supplied URLs, opening in new tabs; add an email shortcut.
- [x] Arrange shortcuts in two columns alongside the existing movable windows.
