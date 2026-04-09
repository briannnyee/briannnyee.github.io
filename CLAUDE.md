# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Design System (`css/global.css`)
All CSS variables, shared components (nav, footer, buttons, badges), and utility classes live here. Every page imports this first. Key tokens: `--yellow` (#FCEE09), `--cyan` (#00F5FF), `--magenta` (#FF006E) on `--bg` (#050505). Fonts: `Rajdhani` (headers), `Share Tech Mono` (mono), `Exo 2` (body) via Google Fonts.

### Pages → CSS → JS mapping
| Page | Page CSS | JS |
|------|----------|----|
| `index.html` | `css/index.css` | `js/glitch.js` |
| `projects.html` | `css/projects.css` | inline filter script |
| `blog.html` | `css/blog.css` | — |
| `games.html` | `css/games.css` | `js/games.js` |

`js/nav.js` is loaded on every page — handles hamburger toggle and active link highlighting.

### Games page data
All game data is defined as a `GAMES` array at the top of `js/games.js`. Add, remove, or edit entries there. Each entry drives the card render, 3D tilt, flip animation, filters, search, and progress bar automatically.

### Aesthetic conventions
- Clip-path `polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)` is the standard "cut corner" card shape used throughout.
- Neon glows are applied via CSS variables `--glow-y/c/m` (box-shadow or text-shadow).
- Scroll-triggered entrance: add class `fade-up` to any element; `js/glitch.js` uses IntersectionObserver to add `.visible`.
- Animated counters: add `data-count="N"` to any element; `js/glitch.js` animates it on scroll-into-view.

## Deployment

Push to a GitHub repo named exactly `briannnyee.github.io`. GitHub Pages serves `index.html` from the repo root automatically — no config needed.
