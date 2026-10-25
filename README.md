# Vikram Singh — portfolio

Two experiences in one Next.js app: a readable **Simple** portfolio and **After Hours**, an interactive cozy 3D workspace. The homepage offers both, with a lightweight SVG illustration matching the room.

## Development

Use Node.js 22 (declared in package.json).

```sh
npm install
npm run dev
```

Open http://localhost:3000. Optional explicit binding: `npm run dev -- -H 127.0.0.1 -p 3000`.
Run `npm run lint` and `node --test tests/*.test.mjs` for checks.
Stop the dev server before `npm run build`; both use `.next`. Then `npm start` serves the build.

## Routes and loading

- `/`: experience chooser; Simple loads first, then the room code and assets preload.
- `/simple`: résumé, selected projects, career timeline, contributions, and assistant.
- `/after-hours`: fullscreen room; `/workbench` shares the same implementation.
- `/api/about`: assistant streaming endpoint.
- `/api/wall-notes`: shared sticky-note CRUD endpoint.

The After Hours card fills as model/texture loader groups complete (not byte-level progress). There is no loading/ready notification popup. Clicking it while loading enters automatically when ready. The illustration is `public/images/after-hours-workbench.svg` and does not require WebGL.

## After Hours

React Three Fiber and Three.js render the room. Click the monitor, notebook, or window for smooth camera transitions; orbit the main room and use limited look-around at the window. Touch, pinch zoom, reduced motion, and mobile monitor layouts are supported.

- Monitor: persistent projected HTML desktop with My Work, About Me, Projects, AI Assistant, Terminal, Task Manager, Credits, social links, and email. Windows drag, resize, minimize, maximize, and close. Mobile uses larger controls and a plain screen background. Desktop right-click offers refresh and app shortcuts.
- Terminal: simulated Linux commands, session-only files, history and completion; `sudo`, `top`, `ps`, `df`, and `free` are simulated. App snapshots use actual open desktop windows; CPU/RAM figures are not invented. No host shell or network access.
- Notebook: rough product notes, recursion/pseudocode and ~600 LeetCode problems, agent-harness learning doodles; animated opening/page turns and locally saved page state.
- Atmosphere: toggleable desk and ceiling lights, click-to-play radio music, night city and slow airplane flyby. Audio never autoplays.
- Drawer: opens to reveal glasses; putting them on blurs the lens regions while preserving room exploration.
- Sticky notes: write on projected paper, peel and place notes on the wall, and read other visitors' messages via MongoDB.
- Props: chair, keyboard, plant left of the desk, Pascal beside the lamp, and the upliance appliance on a stool to the right. Stool legs are 30% longer; ceiling suspension is 30% shorter. Final coordinates live in `components/workbench/propPlacement.js`; temporary placement sliders/storage are removed.

## Environment and assistant knowledge

Set server-only variables in untracked `.env.local`, then restart the server:

| Variable | Purpose |
| --- | --- |
| `GEMINI_KEY` | Generated assistant replies |
| `GEMINI_MODEL` | Optional override; current code default is `gemini-3.8-flash` |
| `MONGODB_URI` | Shared wall-note database connection |
| `MONGODB_DB` | Database name, currently `Portfolio` (case-sensitive) |

Never use `NEXT_PUBLIC` for these credentials. Configure them separately on the deployment host.

The assistant combines `lib/profile.js` and `lib/assistant-context.js`; it does not inspect live repositories, search vectors, or query GitHub/LeetCode. `/api/about` streams Gemini responses, validates input/history, enforces timeouts, and falls back to labelled “Résumé mode” when generation is unavailable. Its rate limiter is process-local, not distributed.

The wall displays the latest 200 notes, up to 240 characters each, polling every 15 seconds while visible and not editing. A local browser ownership token permits editing/moving/deleting its notes; only a hash is stored in MongoDB. Clearing browser storage loses editing rights. The API validates coordinates and ownership and applies process-local write limits. Missing database configuration makes the shared wall unavailable; it does not prevent the portfolio or assistant from loading.

## Assets and optimization

See `public/models/README.md` for source links, licenses, and modifications. The Credits app supplies visible attribution. Pascal is CC BY-NC 4.0; other asset terms differ.

Runtime manifests preload the same URLs used by scene components. Original downloads are preserved; unused subway assets are not loaded. City textures are 1.47 MB including geometry; plant, ceiling light, chair, radio, and keyboard together use about 2.94 MB of referenced resources. Pascal is 1.03 MB and the stool 0.56 MB. The upliance CAD OBJ was converted from ~240 MB to a 4.49 MB GLB with ~90% fewer triangles; original OBJ/MTL remain in Downloads.

- `scripts/optimize-city.cjs`: city WebP textures and reduced data maps.
- `scripts/optimize-room.cjs [asset ...]`: selected room texture optimization.
- `scripts/optimize-upliance.mjs INPUT.obj TOOL_DIRECTORY`: CAD conversion, simplification, and quantization.

Texture scripts require Sharp in the tool environment. CAD tooling is documented in the script and model README; it is not a runtime dependency. Preserve licenses and originals when regenerating assets. Validate manifests and compare texture detail before switching loaders.

## Main files

- `pages/index.js`, `styles/ThemeChooser.module.css`: chooser and silent fill.
- `components/AfterHoursPreload.js`: Simple-first background loading.
- `components/workbench/`: room, desktop apps, props, and interactions.
- `lib/profile.js`, `lib/assistant-context.js`: résumé and architecture knowledge.
- `components/AboutChat.js`, `pages/api/about.js`: shared assistant.
- `lib/wall-notes.mjs`, `lib/mongodb.js`, `pages/api/wall-notes.js`: shared notes.
- `STYLE_GUIDE.md`: design conventions.
- `COZY_WORKSPACE_TODO.md`: implemented scope and remaining work.

Visual/browser review is performed by the owner; lint, command/API tests, model parsing, and asset checks complement that review.
