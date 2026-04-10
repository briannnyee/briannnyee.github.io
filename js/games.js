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
      <div class="game-card__cover">
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
    `;

    card.addEventListener('click', () => openModal(game));

    return card;
  }

  // ── Review modal ─────────────────────────────────────────
  let modalEl = null;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement('div');
    modalEl.className = 'game-modal';
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="game-modal__backdrop" data-close="1"></div>
      <div class="game-modal__dialog" role="dialog" aria-modal="true">
        <button class="game-modal__close" data-close="1" aria-label="Close">×</button>
        <div class="game-modal__body"></div>
      </div>
    `;
    document.body.appendChild(modalEl);

    // Close on backdrop / close-button click
    modalEl.addEventListener('click', (e) => {
      if (e.target.dataset && e.target.dataset.close) closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalEl.classList.contains('open')) closeModal();
    });

    return modalEl;
  }

  function renderReview(game) {
    // Support: (1) game.body = array of paragraphs, (2) game.review with \n\n splits,
    // (3) plain single-paragraph review.
    if (Array.isArray(game.body) && game.body.length) {
      return game.body.map(p => `<p>${p}</p>`).join('');
    }
    const raw = game.review || '';
    return raw.split(/\n{2,}/).map(p => `<p>${p.trim()}</p>`).join('');
  }

  function openModal(game) {
    const modal = ensureModal();
    const body = modal.querySelector('.game-modal__body');

    const statusLabel = {
      completed: 'COMPLETED',
      playing:   '▶ PLAYING',
      backlog:   'BACKLOG',
    }[game.status];

    const stars = Array.from({length: 5}, (_, i) =>
      `<span class="star ${i < game.rating ? 'filled' : ''}">★</span>`
    ).join('');

    body.innerHTML = `
      <div class="game-modal__header">
        <div class="game-modal__status game-modal__status--${game.status}">${statusLabel}</div>
        <h2 class="game-modal__title">${game.title}</h2>
      </div>
      <div class="game-modal__meta">
        <div class="game-modal__meta-chip">
          <span class="game-modal__meta-key">Genre</span>
          <span class="game-modal__meta-val">${game.genre}</span>
        </div>
        <div class="game-modal__meta-chip">
          <span class="game-modal__meta-key">Year</span>
          <span class="game-modal__meta-val">${game.year}</span>
        </div>
        <div class="game-modal__meta-chip">
          <span class="game-modal__meta-key">Hours</span>
          <span class="game-modal__meta-val">${game.hours > 0 ? game.hours + 'h' : '—'}</span>
        </div>
      </div>
      ${game.rating > 0 ? `
      <div class="game-modal__rating">
        <div class="game-card__stars">${stars}</div>
        <span class="game-modal__rating-val">${game.rating}/5</span>
      </div>` : ''}
      <div class="game-modal__divider"></div>
      <div class="game-modal__review">${renderReview(game)}</div>
    `;

    // Reset scroll position each open
    body.scrollTop = 0;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
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
