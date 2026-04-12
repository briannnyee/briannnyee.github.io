# briannnyee.github.io

## Overview

Static personal portfolio site for Ming-Han Lee (`briannnyee.github.io`). Pure HTML/CSS/JS — no build tools, no npm, no framework. Open any `.html` file directly in a browser or use a local server for development.

## Development

```bash
# Serve locally (Python)
python3 -m http.server 8000
# then open http://localhost:8000

# Or with Node
npx serve .
```

No build step, no lint config, no test suite.

## Architecture

### Pages → CSS → JS → Data mapping

| Page | File | Page CSS | JS | Data |
|------|------|----------|----|------|
| Home/Hero | `index.html` | `css/index.css` | `js/glitch.js`, `js/load-index.js` | `site.json`, `projects.json`, `blog.json`, `games.json` |
| Projects | `projects.html` | `css/projects.css` | `js/load-projects.js` | `projects.json` |
| Blog listing | `blog.html` | `css/blog.css` | `js/load-blog.js` | `blog.json` |
| Blog post | `post.html` | `css/blog.css`, `css/post.css` | `js/load-post.js` | `blog.json`, `data/posts/{id}.md` |
| Milestones | `milestones.html` | `css/milestones.css` | `js/load-milestones.js` | `milestones.json` |
| Dreams | `dreams.html` | `css/dreams.css` | `js/load-dreams.js` | `dreams.json` |
| Games | `games.html` | `css/games.css` | `js/games.js` | `games.json` |

`js/nav.js` is loaded on every page — handles hamburger toggle and active link highlighting.
`js/glitch.js` is loaded on every page — handles `.fade-up` scroll reveals and `[data-count]` animated counters.

### Data layer

All content lives in `data/` as JSON files. Each page loader fetches its JSON at runtime, builds HTML strings, and injects them into container elements. Blog posts have a second layer: `data/posts/{id}.md` files parsed by `marked.js` (loaded via CDN in `post.html`). Fallback format: `data/posts/{id}.json` with structured content blocks.

**Data files:**
| File | Structure | Consumed by |
|------|-----------|-------------|
| `data/site.json` | Hero config (typewriter phrases, stats) + about section (bio, skills, system info) | `load-index.js` |
| `data/projects.json` | Array of project objects (category, stack, links, accentColor) | `load-projects.js`, `load-index.js` (stats) |
| `data/blog.json` | `{ posts: [...], sidebar: { about, topics } }` | `load-blog.js`, `load-post.js` |
| `data/posts/*.md` | GFM markdown, parsed at runtime by `marked.js` | `load-post.js` |
| `data/milestones.json` | Array of year groups, each with entries (side, category, icon, tags) | `load-milestones.js` |
| `data/games.json` | `{ games: [...], achievements: [...], topPicks: [...] }` | `games.js` |
| `data/dreams.json` | Array of dream objects (id, status, title, desc, tags) | `load-dreams.js` |

### Design system (`css/global.css`)

All CSS variables, shared components (nav, footer, buttons, badges), and utility classes live here. Every page imports this first.

**Color palette (Cyberpunk 2077-inspired):**
- `--bg` (#050505), `--bg2` (#0a0a0a), `--bg3` (#111) — backgrounds
- `--yellow` (#FCEE09) — primary accent
- `--cyan` (#00F5FF) — secondary accent, links
- `--magenta` (#FF006E) — tertiary accent
- `--text` (#EFEFEF), `--muted` (#888) — text

**Typography (Google Fonts):**
- `Rajdhani` (700) — headers
- `Share Tech Mono` — monospace labels, badges, code
- `Exo 2` (100–900) — body text

**Shared components:** `.nav`, `.footer`, `.container` (1200px, 1600px at 4K), `.btn` / `.btn--cyan` / `.btn--sm`, `.badge--{color}` (6 variants), `.corner-box`, `.fade-up`, `.section-label` / `.section-title` / `.section-line`.

**Neon glow variables:** `--glow-y`, `--glow-c`, `--glow-m` — pre-computed box-shadows for yellow/cyan/magenta.

### Aesthetic conventions

- **Cut-corner cards:** `clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)` is the standard shape.
- **Neon glows:** Applied via `--glow-y/c/m` (box-shadow or text-shadow).
- **Scroll-triggered entrance:** Add class `fade-up` to any element; `js/glitch.js` uses IntersectionObserver to add `.visible`.
- **Animated counters:** Add `data-count="N"` to any element; `js/glitch.js` animates it on scroll-into-view.
- **Color-coded badges:** `badge--yellow`, `badge--cyan`, `badge--magenta`, etc.
- **Scanline overlay:** `body::after` applies subtle repeating horizontal lines for retro CRT effect.

### JS patterns

All code is vanilla JS (ES6), no frameworks. Each page loader follows the same pattern:
1. Fetch JSON via `fetch()`
2. Build HTML strings from data
3. Inject into container elements (`#hero-stats`, `#post-list`, etc.)
4. Re-trigger `fade-up` observers and counters for dynamically added elements

### Features by page

#### Index (`index.html` → `load-index.js`, `glitch.js`)
- **3D grid background:** CSS perspective + rotateX + linear-gradient, scrolls via keyframe
- **Glitch title:** Layered `::before`/`::after` pseudo-elements with clip-path + translate keyframes
- **Typewriter effect:** Cycles through `site.json.hero.typewriterPhrases` with character-by-character typing/deletion via `setInterval`
- **Live stat counters:** Counts computed at runtime from `projects.json`, `blog.json`, `games.json` lengths; animated from 0 → N via `requestAnimationFrame` with cubic ease-out on scroll-into-view
- **Hero photo frame:** Diagonal cut-corner, neon yellow border, scan-line sweep animation
- **About section:** 2-column grid — bio paragraphs + skills badges (color-coded) + system-info rows (key/value with optional link and color from `site.json`)
- **Dream teaser card:** Single featured dream block pulled from `dreams.json`, links to dreams page

#### Projects (`projects.html` → `load-projects.js`)
- **Dynamic filter tabs:** Auto-generated from unique `category`/`categoryLabel` pairs in `projects.json`; "All" always first
- **Filter logic:** Click → `data-filter` attribute matching against card `data-category` → `display:none` toggle
- **Project cards:** Cut-corner shape, accent color bar (via `--accent-color` inline style), category label, year, description, tech stack badges, action links
- **Featured card:** `project-card--featured` spans 2 grid columns
- **Grid layout:** CSS `auto-fill, minmax(340px, 1fr)`

#### Blog listing (`blog.html` → `load-blog.js`)
- **Post cards:** Entire card is an `<a>` tag (full click surface) linking to `post.html?id={id}`
- **Featured post:** `post-card--featured` with "FEATURED POST" banner label
- **Post metadata:** Date, read time, color-coded tag badges
- **Sidebar (sticky):**
  - About blurb (`sidebar.about` from `blog.json`)
  - Topic tag pills (`sidebar.topics` array)
  - Recent posts list (first 4 posts, rendered as links)
- **2-column layout:** Main post list + sidebar, collapses to 1-col on mobile

#### Blog post (`post.html` → `load-post.js`)
- **URL routing:** Reads `?id=` query param, fetches matching entry from `blog.json`
- **Cover image:** Rendered between header and body; supports real image (`cover` field) or dashed-border placeholder (`coverPlaceholder: true` shows `// IMAGE_PLACEHOLDER` label)
- **Markdown rendering:** `marked.js` (CDN) with GFM enabled, `breaks: false` (CommonMark)
- **Post-processing of rendered HTML:**
  - `<code class="language-xxx">` → parent `<pre data-lang="xxx">` for CSS language badge
  - Bare `<iframe>`/`<video>` → wrapped in `.post__video` for responsive 16:9 frame
  - Blockquote last `<p>` starting with em-dash → converted to `<cite>` element
  - Standalone `<img>` in `<p>` → wrapped in `<figure>` with optional `<figcaption>` from title text
- **JSON fallback:** If `.md` file missing, tries `data/posts/{id}.json` with block-based format (text/heading/image/video/code/quote/list/divider)
- **Not-found state:** Renders `// POST_NOT_FOUND` with reason and back-to-blog link
- **Prose styling:** 760px max-width column, cyan-underline links with glow hover, code blocks with cyan left border + language badge, blockquotes with magenta left border + citation arrow

#### Games (`games.html` → `games.js`) — most feature-rich page
- **Data source:** `data/games.json` with three arrays: `games`, `achievements`, `topPicks`
- **Card grid:** CSS `auto-fill, minmax(200px, 1fr)`, each card shows cover image (Steam CDN via `steamId`), gradient background + emoji fallback, star rating (0–5), status badge
- **Search:** Real-time text filter on title and genre (`input` event, case-insensitive `includes()`)
- **Filter buttons:** Status filter (all/playing/completed/backlog) + genre toggle; combined filtering
- **Sort order:** Always `playing → completed → backlog` regardless of filter
- **Progress bar:** Animated fill from 0% → completion percentage on load (CSS transition)
- **Review modal (Netflix-style):**
  - Created dynamically on first click (not pre-rendered DOM)
  - Shows: title, status badge, meta (genre/year/hours), star rating, review prose
  - Close via backdrop click or Escape key
  - Prevents page scroll while open (`.modal-open` on `<body>`)
- **Ming-Han's List (ranked top picks):**
  - Rendered from `topPicks` array with rank number, cover, title, genre, year, stars, custom blurb
  - Each item clickable → opens review modal for that game
- **Achievements ticker (infinite scroll):**
  - Track HTML duplicated for seamless CSS animation loop
  - Fade edges via `mask-image` gradient
  - Pauses on hover
  - Items show cover image (Steam CDN or emoji fallback) + achievement title + description
- **Save-screen header:** Sweep animation across the section title

#### Milestones (`milestones.html` → `load-milestones.js`)
- **Timeline layout:** Center vertical spine (gradient line), cards alternate left/right via CSS grid reorder
- **Milestone cards:** Diamond-shaped icon (clip-path), category badge (color-coded: education/work/award/cert), date, title, organization, body paragraphs, tech tags
- **Year dividers:** Yellow cut-corner labels separating year groups
- **Category filters:** Click → `.hidden` toggle on cards; year labels auto-hide if all entries below them are hidden
- **Mobile collapse:** Single-column layout at ≤768px, all cards stack left-aligned

#### Dreams (`dreams.html` → `load-dreams.js`)
- **Star field background:** Animated drifting particles via CSS keyframes
- **Content injection:** Finds `[data-dream-id]` containers in HTML, fills with content from `dreams.json` (number, status badge, title, description, tags)
- **2-column alternating layout:** Dream blocks alternate text-left/visual-right and vice versa
- **3 animated visual scenes (pure CSS):**
  - Moon: floating astronaut animation
  - Robot: pulsing core glow
  - Infra: animated data packets flowing through network
- **Status badges:** Pulsing dot animation for active/lifetime status indicators
- **Hover shimmer effects:** Gradient sweep on dream cards

### Responsive breakpoints

- `≤900px` — hero collapses to 1-col, about card hidden
- `≤768px` — hamburger nav, milestones single column, games grid 2-col
- `≤600px` — modal full-height, dream teaser stacks
- `≥2560px` — 4K scaling (18px base font, 1600px container)

### Assets

```
/assets
  ├── photo.jpg                        # Hero portrait
  └── /posts
      └── the-rise-of-the-machine.png  # Blog cover image
```

Game cover images are fetched from Steam CDN via `steamId`. Fallback: gradient background + emoji.

## Adding content

**New project:** Add object to `data/projects.json`. Filter tabs auto-generate from `category` field.

**New blog post:** Add entry to `data/blog.json` `posts` array + create `data/posts/{id}.md`. Set `"featured": true` to pin. Optional `"cover"` field for hero image.

**New game:** Add to `data/games.json` `games` array. Provide `steamId` for auto cover art. Add to `achievements` and `topPicks` arrays as needed.

**New milestone:** Add entry to the appropriate year group in `data/milestones.json`. Set `"side": "left"` or `"right"`.

## Deployment

Push to a GitHub repo named exactly `briannnyee.github.io`. GitHub Pages serves `index.html` from the repo root automatically — no config needed. Only external dependency is `marked.js` via jsDelivr CDN.
