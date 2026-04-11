/* load-projects.js — Renders projects.html content from data/projects.json */
(function () {

  fetch('data/projects.json')
    .then(function (r) { return r.json(); })
    .then(function (projects) {
      renderFilters(projects);
      renderProjects(projects);
      setupFilter();
    })
    .catch(function (err) { console.warn('load-projects: failed to load projects.json', err); });

  function renderFilters(projects) {
    var bar = document.getElementById('filter-bar');
    if (!bar) return;
    var seen = {};
    var cats = [];
    projects.forEach(function (p) {
      if (!p.category || seen[p.category]) return;
      seen[p.category] = true;
      cats.push({ key: p.category, label: p.categoryLabel || p.category });
    });
    var html = '<button class="filter-btn active" data-filter="all">All</button>';
    html += cats.map(function (c) {
      return '<button class="filter-btn" data-filter="' + c.key + '">' + c.label + '</button>';
    }).join('');
    bar.innerHTML = html;
  }

  function renderProjects(projects) {
    var grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = projects.map(buildCard).join('');
    // Observe newly added fade-up elements
    if (window.GlitchUtils) window.GlitchUtils.setupCounters();
    observeFadeUps(grid.querySelectorAll('.fade-up'));
  }

  function observeFadeUps(els) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { obs.observe(el); });
  }

  function buildCard(p) {
    var featuredClass = p.featured ? ' project-card--featured' : '';
    var stack = p.stack.map(function (s) {
      return '<span class="badge badge--' + s.color + '">' + s.label + '</span>';
    }).join('');
    var links = p.links.map(function (l) {
      var ext = l.href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + l.href + '"' + ext + ' class="btn btn--sm ' + (l.variant || '') + '">' + l.label + '</a>';
    }).join('');

    return '<article class="project-card' + featuredClass + ' fade-up" data-category="' + p.category + '"'
      + ' style="--accent-color:' + p.accentColor + '">'
      + '<div class="card__body">'
      + '<div class="card__meta">'
      + '<span class="card__category">' + p.categoryLabel + '</span>'
      + '<span class="card__year">' + p.year + '</span>'
      + '</div>'
      + '<h2 class="card__title">' + p.title + '</h2>'
      + '<p class="card__desc">' + p.desc + '</p>'
      + '<div class="card__stack">' + stack + '</div>'
      + '<div class="card__links">' + links + '</div>'
      + '</div>'
      + '</article>';
  }

  function setupFilter() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.project-card');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.dataset.filter;
        cards.forEach(function (card) {
          var match = filter === 'all' || card.dataset.category === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

})();
