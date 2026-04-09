# briannnyee.github.io

Personal portfolio and brand website for Ming-Han Lee. Built as a static site hosted on GitHub Pages — no build tools, no dependencies.

**Live site:** https://briannnyee.github.io

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Landing | `index.html` | Hero section with glitch animation, typewriter, animated stats, about card |
| Projects | `projects.html` | Project cards with filter tabs + achievements list |
| Blog | `blog.html` | Post listing with sidebar (tags, recent posts) |
| Games | `games.html` | Interactive game showcase with 3D tilt, card flip, achievements ticker |

## Local Development

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any static file server works. No install or build step required.

## Customization

### Personal info
All placeholder text (name, bio, role, stats) lives directly in the HTML files. Search for comments like `<!-- Replace ... -->` or placeholder values such as `[University Name]`, `[Hackathon Name]`.

### Photo
Drop your image into `assets/photo.jpg`. The hero section references that path and falls back to a styled placeholder frame if the file is missing.

### Projects (`projects.html`)
Edit the `<article class="project-card">` blocks directly. Each card has:
- `data-category` — controls filter tab (`web`, `tools`, `ml`, `other`)
- `--accent-color` CSS variable — sets the top bar and category label color
- Stack badges, GitHub link, and optional live demo link

### Blog posts (`blog.html`)
Copy an existing `<article class="post-card">` block and update the date, title, excerpt, read time, and tags.

### Games (`js/games.js`)
All game data is the `GAMES` array at the top of the file. Each entry:

```js
{
  id: 1,
  title: 'Game Title',
  genre: 'RPG',              // used by genre filter
  status: 'completed',       // 'playing' | 'completed' | 'backlog'
  rating: 5,                 // 1–5, or 0 for unplayed
  year: 2020,
  hours: 120,
  steamId: 1091500,          // Steam App ID — drives cover art from Steam CDN
  bg: 'linear-gradient(…)', // fallback gradient if cover image fails
  emoji: '🎮',              // shown in fallback
  review: 'Your notes…'     // shown on card back
}
```

Grid order is always `playing → completed → backlog`.

### Achievements ticker (`js/games.js`)
The `ACHIEVEMENTS` array (just below `GAMES`) feeds the infinite scrolling ticker. Add or remove entries freely — each needs `game`, `icon`, `title`, and `desc`.

## Deployment

The repo must be named `briannnyee.github.io` for GitHub Pages to serve it at the root domain.

```bash
git remote add origin https://github.com/briannnyee/briannnyee.github.io.git
git push -u origin main
```

GitHub Pages picks up `index.html` from the `main` branch root automatically. No `gh-pages` branch or Actions workflow needed.

## Design System

All design tokens are CSS variables in `css/global.css`:

| Variable | Value | Use |
|----------|-------|-----|
| `--yellow` | `#FCEE09` | Primary accent, CP2077 signature |
| `--cyan` | `#00F5FF` | Secondary accent, links |
| `--magenta` | `#FF006E` | Tertiary accent, alerts |
| `--bg` | `#050505` | Page background |
| `--font-head` | Rajdhani | Section titles, card titles |
| `--font-mono` | Share Tech Mono | Labels, badges, code |
| `--font-body` | Exo 2 | Body copy |

Reusable utilities defined in `global.css`: `.btn`, `.btn--cyan`, `.badge`, `.badge--{color}`, `.fade-up` (scroll reveal), `data-count` (animated counter), `.corner-box`.
