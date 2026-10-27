# Vikram Singh — portfolio

Two experiences in one Next.js app: a readable **Simple** portfolio and **After Hours**, an interactive cozy 3D workspace. The homepage offers both, with a lightweight SVG illustration matching the room.

## Development

Use Node.js 22 (declared in package.json).

```sh
npm install
npm run dev
```

Open http://localhost:3000. Optional explicit binding: `npm run dev -- -H 127.0.0.1 -p 3000`.
Run `npm run lint` for code checks. Do not add or run automated tests unless the owner requests them.
Stop the dev server before `npm run build`; both use `.next`. Then `npm start` serves the build.

## Routes and loading

- `/`: experience chooser; Simple loads first, then the room code and assets preload.
- `/simple`: résumé, selected projects, career timeline, contributions, and assistant.
- `/after-hours`: fullscreen room; `/workbench` shares the same implementation.
- `/api/about`: assistant streaming endpoint.
- `/api/wall-notes`: shared sticky-note CRUD endpoint.
- `/api/photos`: shared gallery, image/thumbnail delivery, upload and owner deletion.
- `/api/visit`: production-only visit, interaction and duration recording.
- `/privacy`: visitor data collection and notification disclosure.

The After Hours card fills as model/texture loader groups complete (not byte-level progress). There is no loading/ready notification popup. Clicking it while loading enters automatically when ready. Entry zooms into the preview, fades through black, then reveals the rendered room. The mobile recommended label does not affect card alignment. The illustration is `public/images/after-hours-workbench.svg` and does not require WebGL.

## After Hours

React Three Fiber and Three.js render the room. Click the monitor, notebook, or window for smooth camera transitions; orbit the main room and use limited look-around at the window. Touch, pinch zoom, reduced motion, and mobile monitor layouts are supported.

- Monitor: persistent projected HTML desktop with My Work, About Me, Projects, AI Assistant, Terminal, Task Manager, Photos, Credits, social links, and email. Windows drag, resize, minimize, maximize, and close. Mobile uses larger controls and a plain screen background. Desktop right-click offers refresh and app shortcuts.
- Terminal: simulated Linux commands, session-only files, history and completion; `sudo`, `top`, `ps`, `df`, and `free` are simulated. App snapshots use actual open desktop windows; CPU/RAM figures are not invented. No host shell or network access.
- Notebook: rough product notes, recursion/pseudocode and ~600 LeetCode problems, agent-harness learning doodles; animated opening/page turns and locally saved page state.
- Atmosphere: toggleable desk and ceiling lights, click-to-play radio music with a brief static burst on toggles and a green playback indicator, night city and slow airplane flyby. Entering from Home primes audio in the click gesture, then fades to volume 0.28 over 11 seconds; direct room visits leave the radio off. Leaving the room stops playback.
- Drawer: opens to reveal glasses; putting them on blurs the lens regions while preserving room exploration.
- Sticky notes: write on projected paper, peel and place notes on the wall, and read other visitors' messages via MongoDB. Notes display their content and creation date without public-wall/creator notices.
- Props: chair, keyboard, plant left of the desk, Pascal beside the lamp, and the upliance appliance on a stool to the right. Hovering the appliance opens its real lid assembly, fades on blue jar LEDs, and wakes a reference-inspired cooking display; leaving closes it and switches it off. Click/tap zooms to work pages on its physical display: overview, upliance app, upliance mobile app, and internal tool orchestrator. Plain arrows and × appear inside the screen after zooming; clicking outside or Escape also returns to the desk. The screen is a visual demo, not live appliance control. Stool legs are 30% longer; ceiling light is positioned to remain in the room view. Final coordinates live in `components/workbench/propPlacement.js`; temporary placement sliders/storage are removed.

Both portfolios have themed Home links; the room link hides while a view is focused. Browser Back exits that view before navigating away. Mobile horizontal orbit is bounded from -0.3 to 1.15 radians, balancing appliance visibility against the window wall.

SMAA antialiasing runs after bloom and output conversion on desktop and mobile. The projected HTML desktop sits outside WebGL, so its perimeter uses a separate approximately one-display-pixel mask. Rendering still caps device pixel ratio at 1.5. Social sharing metadata uses the supplied screenshot in `public/images/portfolio-social.png`.

## Environment and assistant knowledge

Set server-only variables in untracked `.env.local`, then restart the server:

| Variable | Purpose |
| --- | --- |
| `GEMINI_KEY` | Generated assistant replies |
| `GEMINI_MODEL` | Optional override; current code default is `gemini-3.8-flash` |
| `MONGODB_URI` | Notes, photos and visitor analytics database connection |
| `MONGODB_DB` | Database name, currently `Portfolio` (case-sensitive) |
| `NTFY_PHOTO_TOPIC` | Server-only ntfy topic for photos, India visits and new note messages |

Never use `NEXT_PUBLIC` for these credentials. Configure them separately on the deployment host.

The assistant combines `lib/profile.js` and `lib/assistant-context.js`; it does not inspect live repositories, search vectors, or query GitHub/LeetCode. `/api/about` streams Gemini responses, validates input/history, enforces timeouts, and falls back to labelled “Résumé mode” when generation is unavailable. Its rate limiter is process-local, not distributed.

The wall displays the latest 200 notes, up to 240 characters each, polling every 15 seconds while visible and not editing. A local browser ownership token permits editing/moving/deleting its notes; only a hash is stored in MongoDB. Clearing browser storage loses editing rights. The API validates coordinates and ownership and applies process-local write limits. Missing database configuration makes the shared wall unavailable; it does not prevent the portfolio or assistant from loading.

## Assets and optimization

See `public/models/README.md` for source links, licenses, and modifications. The Credits app supplies visible attribution. Pascal is CC BY-NC 4.0; other asset terms differ.

Runtime manifests preload the same URLs used by scene components. Original downloads are preserved; unused subway assets are not loaded. City textures are 1.47 MB including geometry; plant, ceiling light, chair, radio, and keyboard together use about 3.19 MB of referenced resources. Pascal is 1.03 MB and the stool 0.56 MB. The upliance CAD OBJ was converted from ~240 MB to a 4.49 MB interactive GLB with ~90% fewer triangles and a separately retained lid; original OBJ/MTL remain in Downloads.

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

Visual/browser review is performed by the owner; lint and focused asset/configuration checks complement that review. No automated tests are run by default.

## Shared Photos app

The monitor Photos app shows visitor images in pages of 40, with Load more for older uploads. Visitors can choose JPG/PNG/WebP files or explicitly enable their camera inside the app, capture a frame, preview it with a retro scanline filter, and press Share photo. Camera audio is disabled; streams stop when hidden, minimized, unfocused, or closed. Camera access needs HTTPS or localhost and browser permission.

The browser redraws images as JPEG at up to 1280px (under 600 KB) and creates 320px thumbnails. `/api/photos` checks JPEG markers, header dimensions and size, then stores binary images in the same configured MongoDB database's `photos` collection. Public image endpoints return JPEG with nosniff headers. Browser ownership tokens allow deleting one's own uploads; no login is required. Clearing browser storage loses deletion access. Upload limits are process-local (10/hour/address), not distributed moderation. Gallery auto-refresh runs every 30 seconds while active; image thumbnails load lazily.

### Notifications (photos, visits and sticky notes)

Set the server-only `NTFY_PHOTO_TOPIC` environment variable to a long, random topic on ntfy.sh, then subscribe to that topic in the ntfy app. Keep the topic out of source control: free topics are accessible to anyone who knows their name. No account or email is required. Newly inserted photos trigger a text notification linking to the saved photo; duplicate retries and failed saves do not notify. Delivery is best-effort with a three-second timeout and cannot fail a successful upload. ntfy outages or rate limits can cause missed alerts; there is no delivery retry queue.

### Visitor analytics

Production requests to `/api/visit` record the IP address and Vercel country/region headers in MongoDB. `visitor_activity` holds one document per browser page load, including the landing route and up to 1,000 deduplicated timestamped actions; `visitor_totals` records IP-based landing counts. Client-side route changes are page views, not new landings. IPs identify network connections, not reliably individual people (shared networks, VPNs and changing addresses affect counts). Geolocation is approximate; missing state information remains unknown.

The existing private ntfy topic receives a notice for each new landing located in India. No IP address or interaction history is sent to ntfy. Alerts use the same free-service quota as photo alerts and are best-effort. Analytics are batched every four seconds and flushed when the page hides; blocking scripts, abrupt closes or network failures can cause missing events. Only control/action labels are recorded, not typed messages, note text, terminal commands or image contents. There is no public analytics read endpoint. Counts are based on retained visit documents, and no automatic retention deletion is configured.

Visit documents also store `durationSeconds` (elapsed time since landing) and `activeSeconds` (time the tab was visible on a tracked portfolio route). Heartbeats run roughly every 15 seconds even without clicks; hiding/leaving sends a final best-effort update. Values are cumulative and merged with `$max` so retries or reordered requests cannot double-count time. These are estimates, not a guarantee of attention or exact exit timing. New sticky notes send their message text to the existing ntfy topic once after insertion; edits, moves, and duplicate retries do not trigger alerts.

## Career knowledge: Office Solutions

Owner-supplied experience, March–June 2025, Backend Trainee: refactored and delivered a Java/Spring Boot benchmarking application for Power BI report loading performance in three weeks. A small Node.js server integrated the project's Microsoft embedding workflow with the Java application. Reports were embedded in a browser, controlled through supported Power BI JavaScript APIs, and timed to help assess performance and complexity. Selenium automated the browser workflow; the Spring Boot app used multithreading. Cucumber supported BDD and JUnit testing (50+ tests). Existing contributions also include database/query simplification with a reported 50% performance improvement and Redis rate limiting.

Keep these distinctions in interviews and assistant answers: direct cross-origin iframe DOM access is restricted by the same-origin policy; the integration used supported APIs rather than bypassing CORS. The Power BI embedding client library is JavaScript/TypeScript, not universally Node-only. Selenium automated the browser, while the embedding integration hosted the report. Exact SDK version, event names, complexity formula, and thread-pool details have not been provided. Technical reference: [Microsoft Power BI Client API](https://learn.microsoft.com/en-us/javascript/api/overview/powerbi/embedded-analytics-client-api). The project history itself comes from the owner, not from inspecting that employer's repository.

## Indian-time timestamps and chatbot activity

New database writes retain BSON date fields for sorting and pagination and add matching IST strings (for example, `createdAtIST`, `updatedAtIST`, `landedAtIST`, `lastSeenIST`, `firstSeenIST`, and chatbot `finishedAtIST`). Event timestamps also include `atIST`. These strings use ISO 8601 with `+05:30`; BSON dates themselves always represent UTC instants. Existing records are not migrated. For example, `2026-10-27T18:35:48.752Z` is `2026-10-28T00:05:48.752+05:30`.

Validated, rate-limit-accepted assistant requests create a `chatbot_requests` document with the question and creation time. Completion stores the response (including partial text for interrupted streams), AI/resume mode, status, and finish time. An abruptly terminated server process may leave a record in `generating` state. Storage is best-effort and does not prevent streaming when MongoDB is unavailable. Chat history is not duplicated in each record; no IP is added to these chat records.

Completed AI and résumé-fallback replies send one best-effort ntfy notification per request through the existing `NTFY_PHOTO_TOPIC`, containing the question, response mode, and request time in IST. Interrupted replies do not notify. Client retries are separate requests. Notification and database work are awaited within the API handler; there is no durable retry queue. The assistant and Privacy page disclose this collection. No automatic chat retention policy is configured.

## Terminal admin browser

In the After Hours Terminal, `sudo <numeric password>` authenticates with the server and opens a read-only MongoDB browser inside the terminal window. The configured password is never embedded in frontend code or recorded in command history/output. Regular simulated sudo commands still work. Collection reads begin only after login succeeds, and every data request verifies the HttpOnly, SameSite=Strict session cookie (Secure in production). Sessions expire after 15 minutes; Sign out clears the cookie.

The browser opens on Visitor activity: one card per IP, sorted by its latest activity timestamp descending (falling back to landing time for older records). Summary counts cover all recorded IPs and visits; cards show location, first/last seen in IST, visits, interactions and accumulated active time. Expanding a card fetches only that IP’s visits, newest activity first, in pages of 10 with expandable interaction timelines. IP groups paginate in batches of 25. Refresh reloads the current view. An IP is not a unique person, and simultaneous tabs can overlap in accumulated active time.

Other collections—chatbot requests, visitor totals, wall notes, and photo metadata—retain pages of 25 expandable JSON records sorted by descending ID, not guaranteed creation order for random UUIDs. Binary photo data and ownership hashes are excluded. It accepts no arbitrary database commands or writes.

Configure server-only `ADMIN_PASSWORD_HASH` (`salt:scrypt-64-byte-hex`) and `ADMIN_SESSION_SECRET` (random signing secret). Local credentials are configured in the untracked `.env.local`; production requires these same environment variable names to be set on the deployment host. The API fails closed without configuration. Restart the development server after environment changes. Login permits five attempts per address per 15-minute window using a bounded process-local limiter; this is not a distributed rate limit. Rotating the signing secret invalidates outstanding sessions.
