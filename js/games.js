/* games.js — Filter, search, 3D tilt, card flip, progress bar, achievements ticker */
(function () {

  // ── Status sort order ────────────────────────────────────
  const STATUS_ORDER = { playing: 0, completed: 1, backlog: 2 };

  // ── Data ─────────────────────────────────────────────────
  const GAMES = [
    {
      id: 1, title: 'Cyberpunk 2077', genre: 'RPG', status: 'completed',
      rating: 5, year: 2020, hours: 120, steamId: 1091500,
      bg: 'linear-gradient(135deg, #0a0a1a 0%, #1a0033 50%, #FF006E22 100%)',
      emoji: '🌆',
      review: 'An absolutely immersive open world. Night City feels alive and the story kept me hooked till the very end. The Phantom Liberty DLC is a masterpiece.'
    },
    {
      id: 2, title: 'Elden Ring', genre: 'Action RPG', status: 'completed',
      rating: 5, year: 2022, hours: 200, steamId: 1245620,
      bg: 'linear-gradient(135deg, #0d0a00 0%, #2a1a00 50%, #FCEE0922 100%)',
      emoji: '⚔️',
      review: 'The most rewarding game I have ever played. Every boss feels like a mountain to climb.'
    },
    {
      id: 3, title: 'Hades', genre: 'Roguelike', status: 'completed',
      rating: 5, year: 2020, hours: 80, steamId: 1145360,
      bg: 'linear-gradient(135deg, #1a0005 0%, #3d0015 50%, #FF002244 100%)',
      emoji: '🔱',
      review: 'Incredible gameplay loop. The writing and character relationships are surprisingly deep for a roguelike.'
    },
    {
      id: 4, title: 'The Witcher 3', genre: 'RPG', status: 'completed',
      rating: 5, year: 2015, hours: 180, steamId: 292030,
      bg: 'linear-gradient(135deg, #0a0d0a 0%, #0d1a0d 50%, #39FF1422 100%)',
      emoji: '🐺',
      review: 'A benchmark for open world RPGs. The side quests alone are better than most games\' main stories.'
    },
    {
      id: 5, title: 'Hollow Knight', genre: 'Metroidvania', status: 'completed',
      rating: 5, year: 2017, hours: 55, steamId: 367520,
      bg: 'linear-gradient(135deg, #05050d 0%, #0a0a1f 50%, #00F5FF22 100%)',
      emoji: '🦋',
      review: 'Stunning art direction and brutal but fair combat. The lore is incredibly deep for an indie title.'
    },
    {
      id: 6, title: "Baldur's Gate 3", genre: 'RPG', status: 'playing',
      rating: 5, year: 2023, hours: 65, steamId: 1086940,
      bg: 'linear-gradient(135deg, #0a0005 0%, #1a0020 50%, #9900FF22 100%)',
      emoji: '🎲',
      review: 'Currently in Act 2. This game is redefining what RPGs can be. Every decision feels meaningful.'
    },
    {
      id: 7, title: 'Sekiro', genre: 'Action', status: 'completed',
      rating: 4, year: 2019, hours: 45, steamId: 814380,
      bg: 'linear-gradient(135deg, #0d0505 0%, #1a0a0a 50%, #FF444422 100%)',
      emoji: '🗡️',
      review: 'The most satisfying combat system in any game. Learning the rhythm of each boss is pure zen.'
    },
    {
      id: 8, title: 'Death Stranding', genre: 'Adventure', status: 'completed',
      rating: 4, year: 2019, hours: 60, steamId: 1190460,
      bg: 'linear-gradient(135deg, #050d0d 0%, #0a1a1a 50%, #00AAAA22 100%)',
      emoji: '📦',
      review: 'A divisive but unforgettable experience. The themes of connection hit differently post-pandemic.'
    },
    {
      id: 9, title: 'Disco Elysium', genre: 'RPG', status: 'completed',
      rating: 5, year: 2019, hours: 50, steamId: 632470,
      bg: 'linear-gradient(135deg, #080505 0%, #150a0a 50%, #FF880022 100%)',
      emoji: '🥃',
      review: 'The most unique RPG ever made. A philosophical fever dream told through exceptional writing.'
    },
    {
      id: 10, title: 'Control', genre: 'Action', status: 'completed',
      rating: 4, year: 2019, hours: 25, steamId: 870780,
      bg: 'linear-gradient(135deg, #050508 0%, #0d0d1a 50%, #5555FF22 100%)',
      emoji: '🔮',
      review: "Remedy's best work. The brutalist architecture and New Weird storytelling are unlike anything else."
    },
    {
      id: 11, title: 'Persona 5 Royal', genre: 'JRPG', status: 'backlog',
      rating: 0, year: 2020, hours: 0, steamId: 1687950,
      bg: 'linear-gradient(135deg, #0a0005 0%, #1a000a 50%, #FF000044 100%)',
      emoji: '🎭',
      review: "On the list. Heard it's one of the greatest JRPGs ever made. Can't wait to finally start it."
    },
    {
      id: 12, title: 'Ghost of Tsushima', genre: 'Action', status: 'backlog',
      rating: 0, year: 2020, hours: 0, steamId: 2215430,
      bg: 'linear-gradient(135deg, #050a08 0%, #0a1a12 50%, #00FF8822 100%)',
      emoji: '⛩️',
      review: 'Heard the exploration and combat are beautiful. Samurai aesthetic has me very interested.'
    },
  ];

  // ── Achievements (featured ticker) ───────────────────────
  const ACHIEVEMENTS = [
    { game: 'Elden Ring',       icon: '⚔️',  title: 'Elden Lord',               desc: 'Defeated Malenia, Blade of Miquella' },
    { game: 'Cyberpunk 2077',   icon: '🌆',  title: 'All Endings Unlocked',      desc: 'Experienced every path Night City offers' },
    { game: 'Hollow Knight',    icon: '🦋',  title: 'Dream No More',             desc: 'True ending — defeated the Nightmare King' },
    { game: 'Hades',            icon: '🔱',  title: 'Heat 32 Clear',             desc: 'Max heat run with Extreme Measures 4 active' },
    { game: 'The Witcher 3',    icon: '🐺',  title: 'Full Completion',           desc: '100% of base game + both expansions cleared' },
    { game: 'Sekiro',           icon: '🗡️',  title: 'All Endings',              desc: 'Achieved every possible conclusion' },
    { game: 'Disco Elysium',    icon: '🥃',  title: 'Thought Cabinet Full',      desc: 'Every thought internalized. Consciousness expanded.' },
    { game: "Baldur's Gate 3",  icon: '🎲',  title: 'Dark Urge Run',             desc: 'Currently resisting the call… barely' },
    { game: 'Death Stranding',  icon: '📦',  title: 'Legend of Legends',         desc: 'Achieved max connection rating in every region' },
    { game: 'Control',          icon: '🔮',  title: 'Bureau Director',           desc: 'All board countermeasures completed' },
  ];

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

    card.addEventListener('click', () => card.classList.toggle('flipped'));

    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('flipped')) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.querySelector('.game-card__inner').style.transform =
        `rotateY(${x * 18}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      if (card.classList.contains('flipped')) return;
      const inner = card.querySelector('.game-card__inner');
      inner.style.transition = 'transform 0.5s ease';
      inner.style.transform  = 'rotateY(0) rotateX(0) scale(1)';
      setTimeout(() => { inner.style.transition = ''; }, 500);
    });

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

    // Build items once, then duplicate for infinite loop
    function makeItem(a) {
      const el = document.createElement('div');
      el.className = 'ach-item';
      el.innerHTML = `
        <span class="ach-icon">${a.icon}</span>
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

  // ── Init ─────────────────────────────────────────────────
  updateProgress();
  buildAchievements();
  buildGrid();

})();
