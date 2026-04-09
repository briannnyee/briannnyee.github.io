/* load-index.js — Renders index.html content from data/site.json */
(function () {

  fetch('data/site.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderHeroStats(data.hero.stats);
      renderAbout(data.about);
      startTypewriter(data.hero.typewriterPhrases);
      // Re-run counter setup for the newly added [data-count] elements
      if (window.GlitchUtils) window.GlitchUtils.setupCounters();
    })
    .catch(function (err) { console.warn('load-index: failed to load site.json', err); });

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
