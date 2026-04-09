/* load-milestones.js — Renders milestones.html content from data/milestones.json */
(function () {

  fetch('data/milestones.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderTimeline(data);
      setupFilter();
    })
    .catch(function (err) { console.warn('load-milestones: failed to load milestones.json', err); });

  function observeFadeUps(parent) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    parent.querySelectorAll('.fade-up').forEach(function (el) { obs.observe(el); });
  }

  function renderTimeline(yearGroups) {
    var timeline = document.getElementById('timeline');
    if (!timeline) return;

    var html = yearGroups.map(function (group) {
      var entriesHtml = group.entries.map(buildEntry).join('');
      return '<div class="timeline-year"><span class="timeline-year__label">' + group.year + '</span></div>'
        + entriesHtml;
    }).join('');

    html += '<div class="timeline-end"><div class="timeline-end__dot"></div></div>';
    timeline.innerHTML = html;
    observeFadeUps(timeline);
  }

  function buildEntry(e) {
    var tags = e.tags.map(function (t) {
      return '<span class="badge badge--' + t.color + '">' + t.label + '</span>';
    }).join('');

    var bodyHtml = e.body.map(function (p) {
      return '<p>' + p + '</p>';
    }).join('');

    var card = '<div class="milestone__card">'
      + '<div class="milestone__header">'
      + '<span class="milestone__date">' + e.date + '</span>'
      + '<span class="milestone__cat-badge">' + e.categoryLabel + '</span>'
      + '</div>'
      + '<div class="milestone__title">' + e.title + '</div>'
      + '<div class="milestone__org">' + e.org + '</div>'
      + '<div class="milestone__body">' + bodyHtml + '</div>'
      + '<div class="milestone__tags">' + tags + '</div>'
      + '</div>';

    var dot = '<div class="milestone__dot"><div class="milestone__dot-icon">' + e.icon + '</div></div>';
    var empty = '<div class="milestone__empty"></div>';

    // side === "right": empty | dot | card
    // side === "left":  card  | dot | empty
    var inner = e.side === 'right'
      ? empty + dot + card
      : card + dot + empty;

    return '<div class="milestone fade-up" data-cat="' + e.category + '">' + inner + '</div>';
  }

  function setupFilter() {
    var milestones = document.querySelectorAll('.milestone[data-cat]');
    document.querySelectorAll('#milestone-filters .filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#milestone-filters .filter-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        var cat = btn.dataset.cat;
        milestones.forEach(function (m) {
          m.classList.toggle('hidden', cat !== 'all' && m.dataset.cat !== cat);
        });
        // Hide year labels with no visible entries
        document.querySelectorAll('.timeline-year').forEach(function (yr) {
          var next = yr.nextElementSibling;
          var hasVisible = false;
          while (next && !next.classList.contains('timeline-year') && !next.classList.contains('timeline-end')) {
            if (next.classList.contains('milestone') && !next.classList.contains('hidden')) hasVisible = true;
            next = next.nextElementSibling;
          }
          yr.style.display = hasVisible ? '' : 'none';
        });
      });
    });
  }

})();
