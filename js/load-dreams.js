/* load-dreams.js — Injects dream text content from data/dreams.json */
(function () {

  fetch('data/dreams.json')
    .then(function (r) { return r.json(); })
    .then(function (dreams) {
      dreams.forEach(injectDream);
    })
    .catch(function (err) { console.warn('load-dreams: failed to load dreams.json', err); });

  function injectDream(d) {
    var el = document.querySelector('[data-dream-id="' + d.id + '"]');
    if (!el) return;

    var tags = d.tags.map(function (t) {
      return '<span class="badge badge--' + t.color + '">' + t.label + '</span>';
    }).join('');

    el.innerHTML =
      '<div class="dream__number">' + d.number + '</div>'
      + '<div class="dream__status ' + d.statusClass + '">'
      + '<span class="dream__status-dot"></span>'
      + d.statusText
      + '</div>'
      + '<h2 class="dream__title">' + d.title + '<em>' + d.titleEm + '</em></h2>'
      + '<p class="dream__desc">' + d.desc + '</p>'
      + '<div class="dream__tags">' + tags + '</div>';
  }

})();
