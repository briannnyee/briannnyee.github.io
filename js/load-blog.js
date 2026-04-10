/* load-blog.js — Renders blog.html content from data/blog.json */
(function () {

  fetch('data/blog.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderPosts(data.posts);
      renderSidebar(data.posts, data.sidebar);
    })
    .catch(function (err) { console.warn('load-blog: failed to load blog.json', err); });

  function observeFadeUps(parent) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    parent.querySelectorAll('.fade-up').forEach(function (el) { obs.observe(el); });
  }

  function postUrl(post) {
    return 'post.html?id=' + encodeURIComponent(post.id);
  }

  function renderPosts(posts) {
    var list = document.getElementById('post-list');
    if (!list) return;

    var html = posts.map(function (post) {
      var featuredClass = post.featured ? ' post-card--featured' : '';
      var featuredLabel = post.featured ? '<div class="featured-label">FEATURED POST</div>' : '';
      var tags = post.tags.map(function (t) {
        return '<span class="badge badge--' + t.color + '">' + t.label + '</span>';
      }).join('');
      var url = postUrl(post);

      // The whole card is a single anchor so the entire surface is a click target.
      return '<a class="post-card' + featuredClass + ' fade-up" href="' + url + '">'
        + featuredLabel
        + '<div class="post-card__meta">'
        + '<span class="post-card__date">' + post.date + '</span>'
        + '<span class="post-card__readtime">' + post.readtime + '</span>'
        + '<div class="post-card__tags">' + tags + '</div>'
        + '</div>'
        + '<h2 class="post-card__title">' + post.title + '</h2>'
        + '<p class="post-card__excerpt">' + post.excerpt + '</p>'
        + '<span class="post-card__link">Read Article</span>'
        + '</a>';
    }).join('');

    list.innerHTML = html;
    observeFadeUps(list);
  }

  function renderSidebar(posts, sidebar) {
    // About blurb
    var aboutEl = document.getElementById('sidebar-about-text');
    if (aboutEl) aboutEl.textContent = sidebar.about;

    // Topics
    var topicsEl = document.getElementById('sidebar-topics');
    if (topicsEl) {
      topicsEl.innerHTML = sidebar.topics.map(function (t) {
        return '<span class="tag-pill">' + t + '</span>';
      }).join('');
    }

    // Recent posts (4 most recent)
    var recentEl = document.getElementById('sidebar-recent');
    if (recentEl) {
      recentEl.innerHTML = posts.slice(0, 4).map(function (p) {
        return '<a class="recent-item" href="' + postUrl(p) + '">'
          + '<span class="recent-item__title">' + p.title + '</span>'
          + '<span class="recent-item__date">' + p.date + '</span>'
          + '</a>';
      }).join('');
    }
  }

})();
