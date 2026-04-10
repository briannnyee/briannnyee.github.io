/* games.js — Filter, search, 3D tilt, card flip, progress bar, achievements ticker
   Game data is loaded from data/games.json */
(function () {

  // ── Status sort order ────────────────────────────────────
  const STATUS_ORDER = { playing: 0, completed: 1, backlog: 2 };

  // ── Data (populated from data/games.json) ────────────────
  const GAMES = [];
  const ACHIEVEMENTS = [];

  // ── DOM refs ─────────────────────────────────────────────
  const grid        = document.getElementById('games-grid');
  const noResults   = document.getElementById('no-results');
  const searchInput = document.getElementById('game-search');
  const progressFill  = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');
  const completedCount = document.getElementById('completed-count');
  const totalCount     = document.getElementById('total-count');

  // ── State ─────────────────────────────────────────────────
  let filterStatus = 'all';
  let filterGenre  = 'all';
  let searchQuery  = '';

  // ── Cover image URL (Steam CDN portrait format) ───────────
  function coverUrl(game) {
    if (!game.steamId) return null;
    return `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/library_600x900.jpg`;
  }

  // ── Build grid ───────────────────────────────────────────
  function buildGrid() {
    const statusOrder = STATUS_ORDER;

    const filtered = GAMES
      .filter(g => {
        const matchStatus = filterStatus === 'all' || g.status === filterStatus;
        const matchGenre  = filterGenre  === 'all' || g.genre  === filterGenre;
        const matchSearch = !searchQuery ||
          g.title.toLowerCase().includes(searchQuery) ||
          g.genre.toLowerCase().includes(searchQuery);
        return matchStatus && matchGenre && matchSearch;
      })
      .sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));

    grid.querySelectorAll('.game-card').forEach(c => c.remove());

    if (filtered.length === 0) {
      noResults.classList.add('visible');
    } else {
      noResults.classList.remove('visible');
      filtered.forEach((game, i) => {
        const card = buildCard(game, i);
        grid.insertBefore(card, noResults);
      });
    }
  }

  function buildCard(game, idx) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.id = game.id;
    card.style.animationDelay = `${idx * 0.05}s`;

    const stars = Array.from({length: 5}, (_, i) =>
      `<span class="star ${i < game.rating ? 'filled' : ''}">★</span>`
    ).join('');

    const statusLabel = {
      completed: 'COMPLETED',
      playing:   '▶ PLAYING',
      backlog:   'BACKLOG',
    }[game.status];

    const imgUrl = coverUrl(game);

    card.innerHTML = `
      <div class="game-card__inner">
        <div class="game-card__front">
          <div class="game-card__cover">
            <!-- Gradient fallback always present -->
            <div class="game-card__cover-bg" style="background:${game.bg}; position:absolute; inset:0;">
              <span style="position:relative; font-size:5rem;">${game.emoji}</span>
            </div>
            ${imgUrl ? `
            <img
              class="game-card__img"
              src="${imgUrl}"
              alt="${game.title} cover"
              loading="lazy"
              onerror="this.style.display='none'"
            >` : ''}
            <div class="game-card__overlay"></div>
          </div>
          <div class="game-card__info">
            <div class="game-card__status game-card__status--${game.status}">${statusLabel}</div>
            <div class="game-card__title">${game.title}</div>
            <div class="game-card__genre">${game.genre}</div>
            ${game.rating > 0 ? `<div class="game-card__stars" style="margin-top:0.4rem">${stars}</div>` : ''}
          </div>
        </div>
        <div class="game-card__back">
          <div class="back__title">${game.title}</div>
          <div class="back__rating">
            <div class="game-card__stars">${stars}</div>
            ${game.rating > 0
              ? `<span class="back__rating-val">${game.rating}/5</span>`
              : `<span class="back__rating-val">UNPLAYED</span>`}
          </div>
          <div class="back__divider"></div>
          <div class="back__review">${game.review}</div>
          <div class="back__meta">
            <div class="back__meta-row">
              <span class="back__meta-key">Genre</span>
              <span class="back__meta-val">${game.genre}</span>
            </div>
            <div class="back__meta-row">
              <span class="back__meta-key">Year</span>
              <span class="back__meta-val">${game.year}</span>
            </div>
            ${game.hours > 0 ? `
            <div class="back__meta-row">
              <span class="back__meta-key">Hours</span>
              <span class="back__meta-val">${game.hours}h</span>
            </div>` : ''}
          </div>
          <div class="back__hint">[ click to flip back ]</div>
        </div>
      </div>
    `;

    const inner = card.querySelector('.game-card__inner');

    card.addEventListener('click', () => {
      // Clear any tilt inline transform so the CSS flip class takes full control
      inner.style.transform = '';
      inner.style.transition = '';
      card.classList.toggle('flipped');
    });

    // 3D tilt only on pointer devices (not touch)
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (canHover) {
      card.addEventListener('mousemove', (e) => {
        if (card.classList.contains('flipped')) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        inner.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 14}deg) scale(1.03)`;
      });

      card.addEventListener('mouseleave', () => {
        if (card.classList.contains('flipped')) return;
        inner.style.transition = 'transform 0.5s ease';
        inner.style.transform  = 'rotateY(0) rotateX(0) scale(1)';
        setTimeout(() => { inner.style.transition = ''; }, 500);
      });
    }

    return card;
  }

  // ── Progress bar ─────────────────────────────────────────
  function updateProgress() {
    const completed = GAMES.filter(g => g.status === 'completed').length;
    const total = GAMES.length;
    const pct = Math.round((completed / total) * 100);
    if (completedCount) completedCount.textContent = completed;
    if (totalCount)     totalCount.textContent = total;
    if (progressFill)   setTimeout(() => { progressFill.style.width = pct + '%'; }, 400);
    if (progressLabel)  progressLabel.textContent = `${pct}% COMPLETION RATE`;
  }

  // ── Achievements ticker ───────────────────────────────────
  function buildAchievements() {
    const wrap = document.getElementById('achievements-track');
    if (!wrap) return;

    // Build a title → steamId lookup from GAMES data
    const steamMap = {};
    GAMES.forEach(g => { if (g.steamId) steamMap[g.title] = g.steamId; });

    function makeItem(a) {
      const steamId = steamMap[a.game];
      const imgSrc = steamId
        ? `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/library_600x900.jpg`
        : null;

      const iconHtml = imgSrc
        ? `<span class="ach-icon"><img src="${imgSrc}" alt="${a.game}" loading="lazy" onerror="this.style.display='none'"></span>`
        : `<span class="ach-icon">${a.icon}</span>`;

      const el = document.createElement('div');
      el.className = 'ach-item';
      el.innerHTML = `
        ${iconHtml}
        <div class="ach-body">
          <span class="ach-title">${a.title}</span>
          <span class="ach-game">${a.game}</span>
          <span class="ach-desc">${a.desc}</span>
        </div>
        <span class="ach-badge">🏆</span>
      `;
      return el;
    }

    // Fill twice for seamless loop
    [...ACHIEVEMENTS, ...ACHIEVEMENTS].forEach(a => wrap.appendChild(makeItem(a)));
  }

  // ── Filters ──────────────────────────────────────────────
  document.querySelectorAll('.games-filter-btn[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.games-filter-btn[data-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterStatus = btn.dataset.status;
      buildGrid();
    });
  });

  document.querySelectorAll('.games-filter-btn[data-genre]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.games-filter-btn[data-genre]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterGenre = btn.dataset.genre;
      buildGrid();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      buildGrid();
    });
  }

  // ── Init — load data from JSON then boot ─────────────────
  fetch('data/games.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      GAMES.push.apply(GAMES, data.games);
      ACHIEVEMENTS.push.apply(ACHIEVEMENTS, data.achievements);
      updateProgress();
      buildAchievements();
      buildGrid();
    })
    .catch(function (err) { console.warn('games.js: failed to load games.json', err); });

})();
