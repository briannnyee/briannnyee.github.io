# briannnyee.github.io

Personal portfolio site for Ming-Han Lee. Built with [Astro](https://astro.build) — static output deployed to GitHub Pages via GitHub Actions.

## Development

```bash
npm install
npm run dev       # dev server at localhost:4321 with HMR
npm run build     # build to dist/
npm run preview   # preview the built site locally
```

## Writing a blog post

Create a new file in `src/content/blog/`:

```
src/content/blog/my-post-slug.md
```

Add frontmatter at the top, then write the body in standard Markdown:

```md
---
title: "Post Title"
date: "2026.06.17"
readtime: "5 MIN READ"
featured: false
cover: "/assets/posts/cover-image.png"   # optional
tags:
  - { label: "AI/ML",  color: "yellow" }
  - { label: "Robotics", color: "cyan" }
excerpt: "One-sentence description shown on the blog listing page."
---

Your post body in standard Markdown...
```

That's it. Push to `main` and GitHub Actions builds and deploys automatically. The post appears at `/blog/my-post-slug`.

**Available tag colors:** `yellow` · `cyan` · `magenta` · `green` · `red`

## Project structure

```
/
├── src/
│   ├── content/
│   │   ├── blog/               ← blog posts (.md with frontmatter)
│   │   └── content.config.ts   ← Zod schema (frontmatter validation)
│   ├── data/                   ← JSON content files
│   │   ├── site.json           ← hero config, about bio, skills, system info
│   │   ├── projects.json       ← project cards
│   │   ├── milestones.json     ← timeline entries
│   │   ├── dreams.json         ← life objectives
│   │   └── games.json          ← game log (also served from public/data/)
│   ├── layouts/
│   │   └── Base.astro          ← shared HTML shell, nav, footer, global CSS
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── Badge.astro         ← colored tag badge
│   │   ├── SectionHeader.astro
│   │   └── PostCard.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── projects.astro
│   │   ├── milestones.astro
│   │   ├── dreams.astro
│   │   ├── games.astro
│   │   └── blog/
│   │       ├── index.astro     ← blog listing
│   │       └── [slug].astro    ← individual post
│   └── styles/                 ← CSS files (one per page + global)
│       ├── global.css
│       └── *.css
├── public/
│   ├── assets/                 ← images (photo.jpg, post covers)
│   ├── data/games.json         ← served statically for games.js
│   ├── js/                     ← client-side scripts (nav, glitch, games)
│   └── post.html               ← redirect shim for old ?id= blog URLs
├── .github/workflows/
│   └── deploy.yml              ← build + deploy to GitHub Pages on push
└── astro.config.mjs
```

## Adding content

**New project:** Add an object to `src/data/projects.json`. Filter tabs auto-generate from the `category` field.

**New game:** Add to `src/data/games.json` `games` array (and `public/data/games.json` — keep both in sync). Provide `steamId` for automatic Steam cover art.

**New milestone:** Add an entry to the relevant year group in `src/data/milestones.json`. Set `"side": "left"` or `"right"`.

**Update bio/skills/system info:** Edit `src/data/site.json`.

## Deployment

Push to `main` → GitHub Actions runs `npm run build` → deploys `dist/` to GitHub Pages.

GitHub Pages source must be set to **GitHub Actions** (repo Settings → Pages → Build and deployment → Source).

## Design system

The cyberpunk aesthetic lives in `src/styles/global.css`:

- **Colors:** `--yellow` (#FCEE09), `--cyan` (#00F5FF), `--magenta` (#FF006E)
- **Typography:** Rajdhani (headers), Share Tech Mono (labels), Exo 2 (body)
- **Shared components:** `.nav`, `.footer`, `.btn`, `.badge--{color}`, `.corner-box`, `.fade-up`, `.section-label`
- **Scroll animations:** Add `fade-up` class → `glitch.js` reveals on scroll via IntersectionObserver
- **Animated counters:** Add `data-count="N"` → `glitch.js` animates 0 → N on scroll-into-view

## Visual features

### Three.js neural network hero (index page)
`src/pages/index.astro` embeds a bundled Three.js script that renders a WebGL particle scene behind the hero: 220 nodes with connection lines, mouse parallax via `scene.rotation` lerp, and a sine-pulse opacity animation. Falls back gracefully if WebGL is unavailable. Respects `prefers-reduced-motion`.

### Procedural city background (all pages)
`public/js/city-bg.js` renders a randomised cyberpunk cityscape on the fixed `#city-canvas` behind every page. Buildings, neon windows, rain particles, and occasional lightning are regenerated on each load. Respects `prefers-reduced-motion` (skips rain and lightning).
