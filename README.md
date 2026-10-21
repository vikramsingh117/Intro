# Vikram Singh — portfolio

A responsive Next.js portfolio with a career timeline, selected projects, and a résumé-grounded assistant.

## Local development

Use Node.js 22 (the version declared in package.json).

```sh
npm install
npm run dev
```

Open http://localhost:3000. If you need an explicit loopback binding, use
`npm run dev -- -H 127.0.0.1 -p 3000`.

Run `npm run build` for a production build, then `npm start` to serve it.
Stop the development server before building: both use the same .next directory.

## Portfolio assistant

The assistant calls `/api/about` and uses the résumé in `lib/profile.js`.
Set `GEMINI_KEY` in an untracked `.env.local` file, then restart the server to
enable generated answers through Gemini. The model defaults to
`gemini-3.8-flash`; override it with `GEMINI_MODEL` if needed.
Never use a NEXT_PUBLIC prefix for
this key.

Without a key, or when the AI provider fails, the assistant returns curated
résumé excerpts and explicitly labels them “Résumé mode.” These are topic
matches, not generated conversational answers. The portfolio itself does not
require Redis, MongoDB, JWT generation, or a third-party stats service.

The endpoint validates message lengths and history, times out provider calls,
disables response caching, and applies a bounded in-memory limit of 15 requests
per minute per client address. This limit is local to each server process and
is not a distributed quota. On Vercel it uses the platform-forwarded client
address; on other hosts it uses the socket address. Add a shared gateway or
Redis limit when deploying across multiple instances or behind another proxy.

## Content and design

See [STYLE_GUIDE.md](STYLE_GUIDE.md) for the visual direction, palette,
typography, layout, motion, cursor behavior, and guidelines for future changes.

- Landing style chooser: `pages/index.js`
- Simple portfolio and career entries: `pages/simple.js`
- Assistant facts and fallback answers: `lib/profile.js`
- Assistant UI: `components/AboutChat.js`
- Layout and tokens: `styles/Home.module.css`, `styles/globals.css`
- Assistant styling: `styles/AboutChat.module.css`

The legacy LeetCode widget, visitor chart, activity feed, authentication flow,
and their API/database helpers have been removed. The active API is `/api/about`.
