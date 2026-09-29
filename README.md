# Sabr and Sukoon — Custom Website

A fast, SEO + AIO-ready custom rebuild of **sabrandsukoon.online**, migrated off Blogger.
Built with **Next.js 15 (App Router) + TypeScript + Tailwind v4**, designed for **Vercel**,
with a **draft-only automation pipeline** and a **full admin login**.

> Islamic wellness blog for Muslim women — Quran, Hadith & psychology for inner peace.
 
--- 

## ✨ What's included

- **73 articles migrated from Blogger** — with their original bespoke styling (ayah boxes,
  section cards, series badges) preserved, plus **301 redirects** from every old
  `/YYYY/MM/slug.html` URL so no SEO is lost.
- **Design system** — calm emerald / cream / gold palette from the brand logo, serif +
  Arabic (Amiri) typography, fully responsive.
- **SEO / AIO** — per-page metadata, OpenGraph/Twitter cards, canonical URLs, JSON-LD
  (`WebSite`, `Organization`, `Person`, `Article`, `BreadcrumbList`), `sitemap.xml`,
  `robots.txt`, and an RSS feed.
- **Trust & E-E-A-T pages** — About, Contact, Author profile, Editorial Policy, Privacy
  Policy (AdSense/cookie-ready), Terms, Disclaimer (YMYL-appropriate).
- **Admin dashboard** (`/admin`) — secure login, a review queue, and one-click publish.
- **Draft-only ingestion API** (`POST /api/ingest`) — your automation pushes drafts;
  **nothing is ever auto-published**. A human approves each one.

---

## 🚀 Quick start (local)

> This repository **is** the app (the Next.js project lives at the repo root).

```bash
npm install

# 1. Create .env.local and set a long random AUTH_SECRET
cp .env.example .env.local      # then edit it

# 2. (Re)generate posts from the Blogger export — already done, re-run if needed
npm run migrate

# 3. Run
npm run dev                     # http://localhost:3000
```

Create `.env.local` from `.env.example` and set `AUTH_SECRET`. To rotate the locked admin
password later, run `npm run seed-admin -- "new-strong-password"` and replace the bcrypt hash
constant in `src/lib/auth.ts` with the decoded hash produced by the script.

---

## 📝 Adding articles (the content folder)

Published posts live in **`content/posts/`** — one file per article. Drop a file in and
it appears on the site automatically (no database needed). Two formats are supported:

**Markdown** (recommended for new, human-written posts) — `content/posts/my-post.md`:

```markdown
---
title: Finding Calm in Surah Ad-Duha
slug: finding-calm-in-surah-ad-duha
excerpt: A short reflection on hope when mornings feel heavy.
author: Nazia Firdous
date: 2026-06-20T09:00:00Z
categories: Tawakkul, Islamic Wellness
cover: https://example.com/cover.jpg
status: published
---

## The morning light

When the world feels dark, remember **Ad-Duha**…
```

**JSON** (used by the Blogger migration) — `content/posts/my-post.json` with a
`contentHtml` field. See any migrated file for the shape.

> When you create your folder of written blogs, just convert each one to a `.md` file
> like the above (or hand them to the automation pipeline below).

---

## 🔐 Admin — the editorial dashboard

Sign in at `/admin` with the locked editorial credentials. The username and bcrypt password
hash live in `src/lib/auth.ts`; the plaintext password is not stored. Sessions are signed
JWTs in an httpOnly cookie; `/admin` and `/api/admin/*` are guarded by middleware.

| Screen | What it does |
|--------|--------------|
| **Dashboard** (`/admin`) | Counts, recent posts, one-click "Write a new post", export. |
| **Posts** (`/admin/posts`) | Every article — migrated and new — searchable, filterable by published/draft. |
| **Editor** (`/admin/posts/new`, `/admin/posts/<slug>`) | Visual page builder with rich text, images, reusable blocks, HTML source, preview, publishing and deletion. |
| **Automation** (`/admin/drafts`) | The review queue for drafts pushed in by `POST /api/ingest`. |

### The editor

- **Visual writing** supports headings, font family and size, text/background colours,
  alignment, line spacing, links, lists, quotes, dividers, tables and YouTube embeds.
- **Images** can be uploaded, dragged or pasted into the article, reused from the media
  library, resized, aligned and given accessible alt text. Covers use the same library.
- **Designed blocks** insert the site's own Quran, Hadith, Dua, takeaway, reflection and
  step components, styled by `globals.css`.
- **Visual / HTML / Preview modes** make normal editing approachable while preserving an
  escape hatch for bespoke markup. Preview runs through the same sanitizer and article
  stylesheet as the published page.
- **Post settings** cover slug (auto-generated from the title until you edit it), publication
  date, excerpt/SEO preview, topics, cover image and author.
- Draft, publish, unpublish and delete actions are available in the editor. `Ctrl`/`Cmd`+`S`
  saves; local recovery and an unsaved-changes warning protect work in progress.

### New posts vs. migrated ones

Posts written here are stored as sanitized **HTML**. The 73 articles migrated from Blogger
open in the same visual editor; their original structure and styled containers are retained.
Legacy markdown records are converted to HTML when they are edited.

Editing a migrated article writes an *override* into the content store — the original file
in `content/posts/` is left untouched, and the site prefers the override. Deleting a
migrated article therefore **hides** it rather than erasing it; deleting a post written in
the editor removes it outright.

### Where posts are stored

| Environment | Store |
|-------------|-------|
| Production (Vercel) | One connected **private Vercel Blob** store for post/draft JSON and uploaded images. The application streams article images through its own `/media/*` route. |
| Local development | Post JSON goes to `content/editor-posts/`; images go to `public/uploads/`. Both runtime folders are git-ignored and need no configuration. |

Blobs are written with `access: "private"`, so an unpublished draft is never readable over
the web. **Export all posts** in the dashboard downloads every article — migrated and new —
as a single JSON file, so the content is never dependent on one service.

---

## 🤖 Automation (draft-only)

Point your auto-blogging engine (Make.com, Zapier, n8n, a script…) at:

```
POST https://your-site/api/ingest
Authorization: Bearer <INGEST_TOKEN>
Content-Type: application/json

{
  "title": "Finding Calm in Surah Ad-Duha",
  "contentMarkdown": "## The morning light\n\nText…",
  "categories": ["Tawakkul", "Islamic Wellness"],
  "excerpt": "A short reflection on hope.",
  "cover": "https://…/cover.jpg",
  "source": "make.com",
  "meta": { "keywords": ["duha","hope"], "model": "claude-opus" }
}
```

Response: `201 { ok: true, id, review: "/admin/drafts/<id>" }`. The item lands in the
review queue as a **draft** — it is **not** published until a human approves it in `/admin`.
You can send `contentHtml` instead of `contentMarkdown`.

---

## ☁️ Deploy to Vercel + connect the domain

The project is already configured for a **zero-config Vercel import** — Next.js is
auto-detected, the repo root **is** the app (leave Root Directory as `./`), and it
**builds with no environment variables set**, so the public site deploys on the very
first import. Env vars are only needed to enable the admin login and automation.

1. In Vercel: **Add New → Project → import `Saqib-Pervez128/sabar-and-sukoon`**.
   Framework = Next.js (auto), Root Directory = `./` (default), Build = `next build` (auto).
   Click **Deploy** — it will succeed as-is.
2. **To enable admin + automation**, add these Environment Variables (Project → Settings
   → Environment Variables), then redeploy:
   - `NEXT_PUBLIC_SITE_URL` = `https://www.sabrandsukoon.online`
   - `AUTH_SECRET` = any long random string used only to sign login sessions
   - `INGEST_TOKEN` = a long random string (your automation sends it as a Bearer token)
   - `REVALIDATE_TOKEN` = a long random string (optional)
3. **Domain (Namecheap):** Vercel → Project → Settings → Domains → add
   `sabrandsukoon.online` and `www.sabrandsukoon.online`. Then in Namecheap → Domain →
   *Advanced DNS*:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` record `www` → `cname.vercel-dns.com`
   (Use whatever Vercel shows in its Domains panel — it tells you the exact records.)
6. After DNS propagates, set the primary domain to `www` (or apex) in Vercel.
7. Add the property in **Google Search Console** and submit `https://www.sabrandsukoon.online/sitemap.xml`.

### Storage on Vercel

Vercel's serverless filesystem is read-only, so runtime content uses the project's connected
**private Vercel Blob** store. Its standard `BLOB_READ_WRITE_TOKEN` / `BLOB_STORE_ID`
credentials hold post JSON, automation drafts and uploaded media. Article images are fetched
server-side from that store and streamed through `/media/*`, so no second public store or
custom media token is needed. Without the store, migrated file-based articles still render,
but admin saves and production image uploads fail.

Locally, no storage setup is needed: content writes to `content/editor-posts/` and
`content/drafts/`, and image uploads write to `public/uploads/`.

---

## 🔄 Re-running the Blogger migration

Source feed: `../_discovery/feed_posts.json` (the full Blogger JSON export).

```bash
npm run migrate
```

Regenerates `content/posts/*.json`, `content/redirects.json`, and `content/categories.json`.
Redirects are wired into `next.config.mjs` automatically.

---

## 📈 AdSense / monetization

The site is technically AdSense-ready (compliance pages, contact page, consistent author,
JSON-LD, HTTPS). To enable ads after approval, add the AdSense script to
`src/app/layout.tsx` (or use Auto Ads). Approval still depends on Google's review and
domain age — see the analysis notes from the project kickoff.

---

## 🗂 Project structure

```
. (repo root = the app)
├─ content/
│  ├─ posts/            # published articles (JSON from migration, or .md)
│  ├─ drafts/           # incoming automation drafts (file adapter)
│  ├─ redirects.json    # old Blogger URL → new URL (301s)
│  └─ categories.json   # topic index
├─ scripts/
│  ├─ migrate-blogger.mjs   # + blogger-feed.json (migration source)
│  └─ seed-admin.mjs
├─ public/              # logo, favicon, default OG image
└─ src/
   ├─ app/              # routes (pages, api, admin, sitemap, robots, rss)
   ├─ components/       # Header, Footer, PostCard, AuthorBox, JsonLd…
   ├─ lib/              # site config, content loader, auth, drafts, seo
   └─ middleware.ts     # admin route guard
```

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (sitemap, JSON-LD, OG). |
| `AUTH_SECRET` | Secret for signing admin session JWTs. |
| `INGEST_TOKEN` | Bearer token for `POST /api/ingest`. |
| `REVALIDATE_TOKEN` | Bearer token for `POST /api/revalidate`. |
