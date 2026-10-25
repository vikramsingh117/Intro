# Portfolio design guide

## Direction

Warm, editorial, technical. This is an engineer's personal portfolio, not a SaaS
landing page. Use quiet surfaces, clear hierarchy, precise details, and restrained
motion. Let the work and the working assistant supply the personality.

Keep copy direct: “Selected projects”, “AI engineer”, “How this assistant works”.
Avoid motivational quotes, generic slogans, exaggerated claims, and decorative
paragraphs. Preserve the supplied résumé's facts.

## Palette

Canonical tokens live in `styles/globals.css`.

| Token | Value | Purpose |
| --- | --- | --- |
| `--paper` | `#f4f1e8` | Warm ivory page background |
| `--ink` | `#243c32` | Forest-green text and primary buttons |
| `--muted` | `#6b7065` | Secondary copy |
| `--line` | `#d5d7ca` | Thin dividers and borders |
| `--orange` | `#c54322` | Burnt-orange emphasis, focus, active states |
| Raised surface | `#fbfaf5` | Assistant and journey cards |
| Tinted surface | `#e9eadf` | Selected items and illustration backgrounds |

Use orange sparingly. Avoid neon glows, rainbow gradients, heavy glass effects,
and large dark shadows. Distinguish selected states with shape, border, and text
as well as color. Keep small text readable; tiny mono labels are supplementary.

## Typography

- Helvetica Neue / Arial / sans-serif for names, body text, navigation, and UI.
- Georgia italic for selective heading emphasis, not whole paragraphs.
- System monospace for numbered labels, technical metadata, and payload samples.
- Large, tightly spaced headings; normal tracking and generous line height in prose.
- Main explanatory text is generally 13–18px with 1.6–1.85 line height.
- Keep small uppercase labels short. Do not shrink primary text to fit a layout.
- No external font dependency is required.

## Layout and surfaces

The page is capped at 1440px, with roughly 6% horizontal padding. Desktop uses
two-column compositions; mobile becomes one column around 700px.

The hero puts the introduction and open-source contributions on the left and
the working assistant on the right. Keep the introduction near the top rather
than vertically centered against a tall card. Avoid excessive blank space above it.

Use 1px borders, mostly square corners (2–4px), and occasional pill-shaped
navigation actions. Section spacing is generous but deliberate. Use project
illustrations to explain work, not as generic decorative placeholders.

The assistant's explanation belongs on the reverse of its card, not in a
separate lower section. The text-only toggle flips both ways. Keep the chat
mounted so conversation state survives; make the hidden face inert and
aria-hidden. The journey is an illustrative replay, not live telemetry.

## Motion and interaction

- Small UI transitions: approximately 150–300ms.
- Entrances, section reveals, and card flips: approximately 350–700ms.
- Favor opacity and transform. Use short travel distances, not large bounces.
- Reveal sections once; do not repeatedly hide content as visitors scroll.
- Project hover details, career-tab transitions, streamed chat, and the card
  flip should communicate an action or state.
- Avoid autoplay everywhere, fake loading delays, or simulated token streaming.
- Honor `prefers-reduced-motion`; no information may depend on animation.
- Buttons must remain keyboard accessible with visible focus. Touch interactions
  must work without hover.

## Cursor

`public/cursor.svg` is a small ink-colored arrow with an orange accent and ivory
outline. Fine-pointer desktop users get a single lightly trailing orange ring.
The ring expands slightly over links and buttons; it must never obscure content.

Keep the native pointer fallback. Preserve normal text, resize, disabled, and
other functional cursor behavior. Hide the decorative ring over form fields,
outside the document, on scroll, and when the window loses focus. Disable the
trail for coarse pointers and reduced-motion users.

Implementation: `components/ThemeCursor.js` and
`styles/ThemeCursor.module.css`. Update position through refs and
requestAnimationFrame, not React state per pointer event. Stop the animation
loop once the ring catches up. Never intercept pointer events.

## Content and architecture honesty

The assistant can discuss the résumé and the curated repository description.
Update `lib/assistant-context.js` when changing the architecture.

Describe protections accurately: the master prompt guides off-topic refusal;
it is not an infallible filter. The rate limiter is process-local. Knowledge is
currently embedded text; do not claim live GCP retrieval, vector search, or
dynamic repository access until implemented. Mark fallback answers and
illustrative animations clearly. Never include keys in docs or client assets.

## Where to make changes

- Landing theme chooser: `pages/index.js`, `styles/ThemeChooser.module.css`
- Simple portfolio content and composition: `pages/simple.js`
- Shared palette and base behavior: `styles/globals.css`
- Page layout and motion: `styles/Home.module.css`
- Chat: `components/AboutChat.js`, `styles/AboutChat.module.css`
- Request journey: `components/AssistantJourney.js`,
  `styles/AssistantJourney.module.css`
- Cursor: `components/ThemeCursor.js`, `styles/ThemeCursor.module.css`,
  `public/cursor.svg`

Extend this system rather than introducing another palette or component theme.
Prefer native CSS, SVG, and React to new animation dependencies for small effects.

## After Hours — cozy interactive room

`/after-hours` shares the fullscreen React Three Fiber scene at `/workbench`.
Simple remains a readable portfolio; the homepage chooser is the entry point.

- Olive walls, warm wood, amber desk lighting, dark metal, and cool city-window light.
- The homepage preview is a lightweight SVG illustration of the actual arrangement: plant left, city window, lamp/Pascal/notebook/radio, monitor and chair, appliance on stool right, raised ceiling light. Update `public/images/after-hours-workbench.svg` when the room changes. Keep its bottom-up asset-loading fill; no notification popup.
- Portfolio facts live in readable HTML apps projected onto the physical monitor. Keep windows mounted while minimized; closing intentionally resets them.
- Use smooth camera focus/return transitions; respect reduced motion. No separate content popup for notebook pages or the exterior.
- Handwritten notebook pages should resemble rough working notes, diagrams and doodles, not polished motivational copy.
- Mobile uses plain monitor wallpaper, full-width app windows, large controls, and touch orbit/pinch.
- The mint square cursor turns subtly 90 degrees on hover. Preserve native pointers for window dragging/resizing and input controls.
- Props remain decorative unless an interaction has a clear purpose. Audio begins only with a user gesture.
- Model originals and licenses are preserved. Optimize runtime geometry/textures, and preload exactly the URLs used by scene components. Do not add fake CPU/RAM numbers or byte-progress claims.
- Shared notes use real MongoDB persistence; browser ownership is not login authentication. Document configuration and failures honestly.
- Core files: `components/workbench/`, `styles/Workbench.module.css`, `components/AfterHoursPreload.js`. Final object placement is source-controlled, not overridden by old temporary browser settings.
