# After Hours implementation / original planning archive

Status (2026-10-27): historical planning archive only. Both the Signal Room experiment and scroll-driven After Hours layout are superseded by the fullscreen cozy 3D workspace. Current implemented behavior is documented in README.md and COZY_WORKSPACE_TODO.md. Do not use unchecked historical items below as the current roadmap.
Vikram's title is AI Product Engineer, including product decisions and ownership.
No automated tests or browser review by default; the owner handles visual review.

Current decisions superseding the original plan below:
- Always show the chooser; do not persist a theme preference.
- Routes are separate; changing routes resets chat. Explanation toggles retain it.
- No live telemetry or live GCP retrieval is implied by illustrative diagrams.
- STYLE_GUIDE.md documents the After Hours visual system.

The checklist below is historical planning, not a current completion report.

## Intent

Keep the current simple editorial design as the default. Offer a clearly
different, optional glossy experience through a small “Simple / Glossy”
switch. The latest request supersedes removing the current topbar globally:
preserve it in Simple; reconsider navigation independently for Glossy.

## Simple theme

- Preserve the current ivory, forest-green, and burnt-orange palette.
- Keep existing typography, layout, navigation, cursor, and restrained motion.
- Follow STYLE_GUIDE.md. Do not gradually turn Simple into the glossy design.

## Glossy theme direction

Create a distinct visual identity and composition, not just a dark-mode recolor.

- Explore deep charcoal or midnight surfaces with luminous, restrained accents.
- Use translucent layered panels, fine highlights, and soft reflected light.
- Give the hero, projects, experience, and assistant their own glossy layouts.
- Replace the conventional topbar with a compact theme/navigation control.
- Add fixed frosted-glass fades at the top and bottom of the viewport. They
  should soften passing content without blocking clicks, focus, or readability.
- Introduce staggered entrances as elements enter view: opacity, short vertical
  travel, and gentle scale. Avoid scroll hijacking and excessive bouncing.
- Adapt the geometric experience drawing, cursor trail, assistant flip, and
  journey replay to the new visual language.
- Keep the copy factual and concise. No extra slogans to fill visual space.

## Implementation checklist

- [ ] Add an accessible Simple / Glossy control, visible in both themes.
- [ ] Default to Simple; persist an explicit choice in localStorage.
- [ ] Apply the saved choice before first paint without hydration mismatch.
- [ ] Handle unavailable storage gracefully and retain a working default.
- [ ] Separate shared data/behavior from theme-specific styling and composition.
- [ ] Use scoped theme tokens and CSS Modules; avoid global overrides that
      accidentally change Simple.
- [ ] Keep one mounted assistant and shared state when switching themes.
      Preserve chat history, an in-progress SSE reply, the selected career role,
      and the assistant's front/back view.
- [ ] Keep selection, keyboard focus, and scroll position sensible on switching.
- [ ] Build the Glossy layout and motion as a complete, coherent alternative.
- [ ] Keep scroll observers and animation frames scoped and clean them up.
- [ ] Use GPU-friendly transforms/opacity; limit backdrop blur to small areas.
- [ ] Hide decorative overlays from assistive technology and pointer events.
- [ ] Provide opaque, readable surfaces when backdrop-filter is unsupported.
- [ ] Respect reduced motion: remove entrances, tilt, and trails while retaining
      all content and controls. Switching themes must remain immediate and usable.
- [ ] Support mobile, touch, keyboard navigation, and visible focus in both modes.
- [ ] Document Glossy's palette, typography, spacing, surfaces, and motion in
      STYLE_GUIDE.md, separately from Simple.
- [ ] Update lib/assistant-context.js so the assistant can explain both themes
      accurately once implemented.

## Acceptance criteria

1. First-time visitors see the chooser, with Simple available and Glossy clearly
   marked coming soon until implemented.
2. Switching produces a visibly different Glossy experience and can be reversed.
3. Simple retains its original appearance and interactions.
4. Chat state and streaming survive theme changes without duplicate requests.
5. Glass edges never cover essential controls or obstruct interaction.
6. Content is visible with reduced motion or without JavaScript-driven reveals.
7. No layout overflow or hover-only functionality on phones.

## Working preference

Implement only when requested. The user currently prefers code changes only,
with review/testing left to them. Do not start preview, browser inspection,
provider requests, or tests unless that preference changes. Do not push or deploy.
