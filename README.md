# Paulo Marques · Portfolio + CMS

A scalable, modular, client-first portfolio + Content Management System.

## Contents

| File | What it does |
|---|---|
| `portfolio.html` | Static, fully self-contained portfolio (works without any backend). Recommended for offline / first deploy. |
| `portfolio-live.html` | Data-driven portfolio — pulls projects, skills, social links, about, journey, goals and contact channels from the CMS. Updates instantly when you save in the admin. |
| `admin.html` | Admin dashboard (login + sidebar shell with 9 management sections). |
| `assets/store.js` | Persistence layer (localStorage). Single source of truth for all CMS data. |
| `assets/ui.js` | UI primitives: toasts, modals, drawers, helpers. |
| `assets/auth.js` | Login / logout / password / email change + notifications module. |
| `assets/api.js` | External services (contact form → email delivery). |
| `assets/skills.js` | Skills CRUD + icon picker. |
| `assets/social.js` | Social links CRUD. |
| `assets/projects.js` | Projects CRUD + reorder + drag-and-drop. |
| `assets/about.js` | About Me + Journey + Goals CRUD (incl. image & PDF upload). |
| `assets/messages.js` | Contact-form inbox viewer. |
| `assets/settings.js` | Settings + export / import / reset. |
| `assets/dashboard.js` | Home dashboard (stats, charts, activity). |
| `assets/admin.js` | Admin shell, sidebar, top bar, router, view renderers. |
| `assets/portfolio.js` | Data-binding script used by `portfolio-live.html`. |
| `assets/admin.css` | Admin styles (~40 KB design system). |
| `assets/portfolio.css` | Live portfolio styles (~24 KB, mirrors the static version visually). |

## Quick start

1. **Open `admin.html`** in your browser.
2. Login with the demo credentials: `admin@portfolio.dev` / `admin123`.
3. Edit anything — projects, skills, bio, social links, etc.
4. Open `portfolio-live.html` in **another tab** — updates appear instantly.
5. **Export → Import** from *Settings → Data* to move your data between machines.

> Tip: drag project rows in the admin to reorder them on the live portfolio. Re-renders happen instantly via `Store.subscribe()`.

## What's real vs what's demo

The CMS is a complete, working prototype. Here is the honest map of what's real today, what's simulated, and what to swap in before publishing publicly.

| Concern | Status today | Swap for production |
|---|---|---|
| **Authentication** | Client-side gate (localStorage flag). Any visitor with the file can disable and read your draft data if they really try. | **Real backend** — Firebase Auth, Supabase, Clerk, NextAuth, or your own server with cookie sessions. Replace `Auth.login()` body in `auth.js` and protect the dashboard route server-side. |
| **Storage** | `localStorage`, scoped to one browser per device. | **Database** — Postgres, Firestore, Supabase, MongoDB, etc. The whole `Store` API was designed for this swap: replace the body of `Store.init / Store.persist / Store.upsert / Store.remove` with REST/GraphQL calls. No caller changes. |
| **Image uploads** | Stored as base64 inside localStorage. Fine for thumbnails, but doesn't scale beyond a few MB. | **Object storage** — S3, Cloudflare R2, Supabase Storage. Update `UI.readFileAsDataURL` to PUT the file and store the resulting URL on the project object. |
| **Email delivery** | Three out-of-four providers work *today* without code changes once you sign up:<br>• **Formspree** — paste your form URL in Settings → Email delivery<br>• **Resend** — paste any server endpoint that forwards to Resend<br>• **Webhook** — any URL that accepts POST JSON<br>**Demo mode** — every message is always stored locally first, so admin can see it even with email disabled. | The `Api.sendMessage()` function is a single chokepoint — replace its body to call your own transactional email service or a serverless function. |
| **Notifications** | In-app toast + persistent notification feed (both unlimited retention up to 50). Could be wired to a service like Pusher or OneSignal by replacing `Notifications.push`. | Service worker push for browser notifications; Pusher/Ably for cross-device fan-out. |
| **Analytics dashboard** | The chart on the home dashboard counts notifications by day. | Plug in Plausible, Google Analytics, Fathom or your own events table. Add a fetch in `dashboard.js`'s `computeStats`. |

## Architecture

### Why this shape?

The codebase is split into modules with one job each, each one (~7 KB average) with a clear public API on `window.*`. This is intentional — every external dependency (auth, storage, email, analytics) is a single module that you can swap independently.

The single point of contact for data is `Store` — every CRUD module reads and writes through it, so swapping localStorage for a real database is a one-file change.

### Folder structure (recommended for production)

If you're turning this into a real product, organise it like:

```
src/
├── data/         Store, repositories, migrations
├── services/     Auth, Api, Notifications, Search
├── ui/           Primitives: Toast, Modal, Drawer, Field, Card, etc.
├── modules/
│   ├── projects/
│   ├── skills/
│   ├── social/
│   ├── about/
│   ├── messages/
│   ├── notifications/
│   ├── dashboard/
│   └── settings/
├── pages/        admin.js (router), portfolio.js (binding)
└── styles/       admin.css, portfolio.css, tokens.css
```

### Data shape (`paulo_cms_v1`)

```js
{
  meta:         { version, createdAt, updatedAt },
  auth:         { loggedIn, user, lastLoginAt },
  projects:     [ { id, title, description, stack, category, github, demo, date, featured, order, status, color, thumbnail, screenshots } ],
  skills:       [ { id, name, icon, proficiency, visible, locked, badge } ],
  social:       { github:{url,enabled}, linkedin:{...}, email:{...}, whatsapp:{...}, portfolio:{...}, instagram:{...}, x:{...} },
  about:        { name, title, bio:[], avatar, resume:{name,data}, stats:[{num,label}] },
  journey:      [ { id, year, title, body, upcoming } ],
  goals:        { technical:[{id,label,done,priority}], personal:[...] },
  messages:     [ { id, name, email, subject, message, timestamp, read, delivered } ],
  notifications:[ { id, type:'info|success|warning|error', title, message, timestamp, read } ],
  settings:     { emailProvider, emailEndpoint, adminEmail, contactEnabled, defaultLocale, theme, notifications, security:{sessionTimeoutMin} },
}
```

## Adding features later

The system was built to keep growing with you. Drop-in extension points:

- **Blog**: add `state.posts = []` to `DEFAULT_STATE` in `store.js`, create `assets/posts.js` mirroring `projects.js`, register a route in `admin.js`'s `ROUTES` array, render in `portfolio.js`.
- **Experience / Certifications / Testimonials**: same pattern — one CRUD module + one render branch on the live portfolio.
- **i18n (PT/EN)**: wrap every visible string in `t('key')` (i18next or your own). Add a `lang` field under `state.settings`. Render in `portfolio.js` based on `lang`.
- **Dark / light mode**: extend the settings panel. Add a second token set under `:root[data-theme="light"]` in CSS, then `document.documentElement.dataset.theme = state.settings.theme`.
- **Search**: the top-bar input already calls `Admin.runSearch()` — extend it to scan across blogs, projects, skills.
- **Filter / sort projects**: filter chips already work via `<button data-filter>`. Sort dropdown is a small addition in `Admin.renderProjects`.

## Deployment

This is a 100% static site — any of these work:

- **Vercel / Netlify / Cloudflare Pages**: drag-and-drop the `files/` folder.
- **GitHub Pages**: push to a repo, enable Pages, point at the `files/` folder.
- **Self-host**: any nginx / Apache / Caddy will serve the files.

If you want to enable backend features (real auth, server-side storage, real email):

- **Formspree** (no-code, 5 minutes): sign up, create a form, paste the endpoint URL into *Settings → Email delivery → Endpoint*.
- **Resend + small serverless function**: deploy the `Api.sendMessage` body as an edge function (Vercel / Cloudflare Worker). Reads `process.env.RESEND_API_KEY`, returns 200.
- **Supabase**: sign up, run the schema dump below, swap `store.js` for `lib/supabase-store.ts`, deploy `admin.html` + `portfolio-live.html` as-is.

### Suggested Postgres schema (production port)

```sql
create table projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  stack        text[],
  category     text,
  github       text,
  demo         text,
  date         date,
  featured     boolean default false,
  ordering     integer default 0,
  status       text default 'draft',
  thumbnail    text,            -- object storage URL
  screenshots  text[]
);
create table skills (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  icon         text,
  proficiency  int,
  visible      boolean default true,
  locked       boolean default false,
  badge        text
);
create table social (
  platform     text primary key,
  url          text,
  enabled      boolean
);
create table about (
  id           int primary key default 1,
  name         text,
  title        text,
  bio          jsonb,           -- array of paragraphs
  avatar       text,
  resume_url   text,
  stats        jsonb
);
create table messages (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  email        text,
  subject      text,
  message      text,
  created_at   timestamptz default now(),
  read         boolean default false,
  delivered    boolean
);
```

## Security notes

- The client-side login gate in `auth.js` exists to keep casual visitors from seeing unfinished drafts. It's **not** a security boundary and should never be relied on publicly.
- For real protection, always put the admin behind server-side auth + a reverse proxy (Cloudflare Access, Vercel Password Protection, your own middleware).
- The portfolio uses Content-Security-Policy-friendly markup: no `eval`, no inline `<script>` event handlers, all assets loaded from same origin.

## License

Personal project. Use freely as a starting point.
