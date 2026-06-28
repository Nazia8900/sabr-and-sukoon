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

```bash
cd site
npm install

# 1. Generate admin credentials (prints ADMIN_PASSWORD_HASH + AUTH_SECRET)
npm run seed-admin -- "choose-a-strong-password"

# 2. Create .env.local from the example and paste the values
cp .env.example .env.local      # then edit it

# 3. (Re)generate posts from the Blogger export — already done, re-run if needed
npm run migrate

# 4. Run
npm run dev                     # http://localhost:3000
```

A working `.env.local` is already present for local development.
Default admin login: **username `nazia`**, **password `sabr-admin-2026`** — change before launch.

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

## 🔐 Admin

1. Go to `/admin` → you'll be redirected to `/admin/login`.
2. Sign in with your `ADMIN_USERNAME` / password.
3. The dashboard shows the **review queue** of incoming drafts.
4. Open a draft → edit title/slug/excerpt/topics/cover → **Approve & publish** (or Delete).

Sessions are signed JWTs in an httpOnly cookie; `/admin` and `/api/admin/*` are guarded by
middleware.

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

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo → set Root Directory to `site`.**
3. Add environment variables (from `.env.example`): `NEXT_PUBLIC_SITE_URL`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `INGEST_TOKEN`,
   `REVALIDATE_TOKEN`. Use `https://www.sabrandsukoon.online` for the site URL.
4. Deploy.
5. **Domain (Namecheap):** Vercel → Project → Settings → Domains → add
   `sabrandsukoon.online` and `www.sabrandsukoon.online`. Then in Namecheap → Domain →
   *Advanced DNS*:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` record `www` → `cname.vercel-dns.com`
   (Use whatever Vercel shows in its Domains panel — it tells you the exact records.)
6. After DNS propagates, set the primary domain to `www` (or apex) in Vercel.
7. Add the property in **Google Search Console** and submit `https://www.sabrandsukoon.online/sitemap.xml`.

### ⚠️ Production note on the draft store

The draft queue uses a **file adapter** (`content/drafts/`) which works locally and on any
host with a writable disk. Vercel's serverless filesystem is **read-only**, so for
automation in production, swap the internals of `src/lib/drafts.ts` for a database/KV
(Vercel KV, Vercel Postgres, Turso, Neon…). The function signatures stay the same — only
that one file changes. Published posts (git-committed files) work on Vercel as-is.

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
site/
├─ content/
│  ├─ posts/            # published articles (JSON from migration, or .md)
│  ├─ drafts/           # incoming automation drafts (file adapter)
│  ├─ redirects.json    # old Blogger URL → new URL (301s)
│  └─ categories.json   # topic index
├─ scripts/
│  ├─ migrate-blogger.mjs
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
| `ADMIN_USERNAME` | Admin login username. |
| `ADMIN_PASSWORD_HASH` | Base64-encoded bcrypt hash (`npm run seed-admin`). |
| `AUTH_SECRET` | Secret for signing admin session JWTs. |
| `INGEST_TOKEN` | Bearer token for `POST /api/ingest`. |
| `REVALIDATE_TOKEN` | Bearer token for `POST /api/revalidate`. |
