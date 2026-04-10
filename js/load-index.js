/* load-index.js — Renders index.html content from data/site.json */
(function () {

  // Fetch site config + all data files that feed hero stats in parallel.
  // Each data fetch is made resilient with .catch so one bad file doesn't
  // kill the whole page render.
  function safeFetch(url) {
    return fetch(url).then(function (r) { return r.json(); }).catch(function () { return null; });
  }

  Promise.all([
    safeFetch('data/site.json'),
    safeFetch('data/projects.json'),
    safeFetch('data/blog.json'),
    safeFetch('data/games.json')
  ]).then(function (results) {
    var site = results[0];
    var projects = results[1];
    var blog = results[2];
    var games = results[3];
    if (!site) { console.warn('load-index: site.json missing'); return; }

    var counts = computeCounts(projects, blog, games);
    renderHeroStats(resolveStats(site.hero.stats, counts));
    renderAbout(site.about);
    startTypewriter(site.hero.typewriterPhrases);
    if (window.GlitchUtils) window.GlitchUtils.setupCounters();
  });

  // ── Auto-computed counts from data files ──────────────────
  function computeCounts(projects, blog, games) {
    var projectCount = Array.isArray(projects) ? projects.length : 0;
    var blogCount = (blog && Array.isArray(blog.posts)) ? blog.posts.length : 0;
    // "Games Played" = any game that isn't in the backlog (completed + playing)
    var gamesPlayed = 0;
    if (games && Array.isArray(games.games)) {
      gamesPlayed = games.games.filter(function (g) { return g.status !== 'backlog'; }).length;
    }
    return { projects: projectCount, blog: blogCount, games: gamesPlayed };
  }

  // Replace `source: "projects"|"blog"|"games"` stats with the live count.
  // Stats without a `source` keep their static `value`.
  function resolveStats(stats, counts) {
    return stats.map(function (s) {
      if (s.source && counts[s.source] != null) {
        return { label: s.label, value: counts[s.source] };
      }
      return s;
    });
  }

  // ── Hero stats ─────────────────────────────────────────────
  function renderHeroStats(stats) {
    var container = document.getElementById('hero-stats');
    if (!container) return;
    container.innerHTML = stats.map(function (s) {
      return '<div class="stat">'
        + '<span class="stat__value" data-count="' + s.value + '">0</span>'
        + '<span class="stat__label">' + s.label + '</span>'
        + '</div>';
    }).join('');
  }

  // ── About section ──────────────────────────────────────────
  function renderAbout(about) {
    // Bio paragraphs
    var bioEl = document.getElementById('about-bio');
    if (bioEl) {
      bioEl.innerHTML = about.bio.map(function (p) {
        return '<p>' + p + '</p>';
      }).join('');
    }

    // Skills
    var skillsEl = document.getElementById('about-skills');
    if (skillsEl) {
      skillsEl.innerHTML = about.skills.map(function (s) {
        return '<span class="badge badge--' + s.color + '">' + s.label + '</span>';
      }).join('');
    }

    // System info rows
    var sysEl = document.getElementById('about-system-info');
    if (sysEl) {
      sysEl.innerHTML = about.systemInfo.map(function (row) {
        var val;
        if (row.href) {
          val = '<a href="' + row.href + '" target="_blank" style="color:var(--cyan)">' + row.value + '</a>';
        } else if (row.color) {
          val = '<span style="color:var(--' + row.color + ')">' + row.value + '</span>';
        } else {
          val = row.value;
        }
        return '<div class="about__stat-row">'
          + '<span class="about__stat-key">' + row.key + '</span>'
          + '<span class="about__stat-val">' + val + '</span>'
          + '</div>';
      }).join('');
    }
  }

  // ── Typewriter ─────────────────────────────────────────────
  function startTypewriter(phrases) {
    var el = document.getElementById('typewriter');
    if (!el || !phrases || !phrases.length) return;

    var pIdx = 0, cIdx = 0, deleting = false;
    var SPEED_TYPE = 80, SPEED_DEL = 45, PAUSE = 1800;

    function tick() {
      var phrase = phrases[pIdx];
      if (!deleting) {
        el.textContent = phrase.slice(0, cIdx + 1);
        cIdx++;
        if (cIdx === phrase.length) {
          deleting = true;
          setTimeout(tick, PAUSE);
          return;
        }
        setTimeout(tick, SPEED_TYPE);
      } else {
        el.textContent = phrase.slice(0, cIdx - 1);
        cIdx--;
        if (cIdx === 0) {
          deleting = false;
          pIdx = (pIdx + 1) % phrases.length;
          setTimeout(tick, 300);
          return;
        }
        setTimeout(tick, SPEED_DEL);
      }
    }
    setTimeout(tick, 800);
  }

})();
