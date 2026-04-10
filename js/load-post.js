/* load-post.js — Renders post.html from data/blog.json + data/posts/{id}.json
   Supports content blocks: text, heading, image, video, code, quote, list, divider. */
(function () {

  function safeFetch(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function () { return null; });
  }

  function getQueryId() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('id');
    } catch (e) {
      return null;
    }
  }

  // ── Bootstrap ──────────────────────────────────────────────
  var id = getQueryId();
  if (!id) {
    renderNotFound('No post ID was provided in the URL.');
    return;
  }

  Promise.all([
    safeFetch('data/blog.json'),
    safeFetch('data/posts/' + id + '.json')
  ]).then(function (results) {
    var blog = results[0];
    var postContent = results[1];

    if (!blog || !Array.isArray(blog.posts)) {
      renderNotFound('Blog index is unavailable.');
      return;
    }

    var meta = blog.posts.find(function (p) { return p.id === id; });
    if (!meta) {
      renderNotFound('No post found with ID "' + id + '".');
      return;
    }

    if (!postContent) {
      renderNotFound('Content file missing for "' + id + '".');
      return;
    }

    renderPost(meta, postContent);
  });

  // ── Render: header + body ──────────────────────────────────
  function renderPost(meta, content) {
    document.title = meta.title + ' — Ming-Han Lee';

    // Cover image (optional — from content.cover or meta.cover)
    var coverUrl = content.cover || meta.cover;
    var coverEl = document.getElementById('post-cover');
    if (coverEl && coverUrl) {
      coverEl.className = 'post__cover';
      coverEl.innerHTML = '<img src="' + coverUrl + '" alt="' + escapeAttr(meta.title) + ' cover">';
    }

    // Tags
    var tagsEl = document.getElementById('post-tags');
    if (tagsEl && Array.isArray(meta.tags)) {
      tagsEl.innerHTML = meta.tags.map(function (t) {
        return '<span class="badge badge--' + t.color + '">' + escapeHtml(t.label) + '</span>';
      }).join('');
    }

    // Title
    var titleEl = document.getElementById('post-title');
    if (titleEl) titleEl.textContent = meta.title;

    // Meta (date + readtime)
    var metaEl = document.getElementById('post-meta');
    if (metaEl) {
      metaEl.innerHTML =
        '<span class="post__meta-date">' + escapeHtml(meta.date) + '</span>' +
        '<span class="post__meta-readtime">' + escapeHtml(meta.readtime) + '</span>';
    }

    // Body — iterate blocks
    var bodyEl = document.getElementById('post-body');
    if (bodyEl && Array.isArray(content.body)) {
      bodyEl.innerHTML = content.body.map(renderBlock).filter(Boolean).join('');
    }
  }

  // ── Block dispatcher ───────────────────────────────────────
  function renderBlock(block) {
    if (!block || !block.type) return '';
    switch (block.type) {
      case 'text':
        // Inline HTML is trusted (author-written).
        return '<p>' + (block.content || '') + '</p>';

      case 'heading':
        var level = (block.level === 3) ? 3 : 2;
        return '<h' + level + '>' + escapeHtml(block.content || '') + '</h' + level + '>';

      case 'image':
        var cap = block.caption
          ? '<figcaption>' + escapeHtml(block.caption) + '</figcaption>'
          : '';
        return '<figure>'
          + '<img src="' + escapeAttr(block.src || '') + '"'
          + ' alt="' + escapeAttr(block.alt || block.caption || '') + '"'
          + ' loading="lazy">'
          + cap
          + '</figure>';

      case 'video':
        var videoCap = block.caption
          ? '<figcaption>' + escapeHtml(block.caption) + '</figcaption>'
          : '';
        var media;
        if (block.embed) {
          // YouTube / Vimeo / other iframe embed
          media = '<div class="post__video">'
            + '<iframe src="' + escapeAttr(block.src || '') + '"'
            + ' title="' + escapeAttr(block.caption || 'Embedded video') + '"'
            + ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"'
            + ' allowfullscreen></iframe>'
            + '</div>';
        } else {
          media = '<div class="post__video">'
            + '<video src="' + escapeAttr(block.src || '') + '" controls'
            + (block.poster ? ' poster="' + escapeAttr(block.poster) + '"' : '')
            + '></video>'
            + '</div>';
        }
        return '<figure class="post__video-figure">' + media + videoCap + '</figure>';

      case 'code':
        var lang = block.lang ? ' data-lang="' + escapeAttr(block.lang) + '"' : '';
        return '<pre' + lang + '><code>' + escapeHtml(block.content || '') + '</code></pre>';

      case 'quote':
        var cite = block.cite
          ? '<cite>' + escapeHtml(block.cite) + '</cite>'
          : '';
        return '<blockquote><p>' + (block.content || '') + '</p>' + cite + '</blockquote>';

      case 'list':
        var tag = block.ordered ? 'ol' : 'ul';
        var items = Array.isArray(block.items)
          ? block.items.map(function (item) { return '<li>' + item + '</li>'; }).join('')
          : '';
        return '<' + tag + '>' + items + '</' + tag + '>';

      case 'divider':
        return '<hr>';

      default:
        console.warn('load-post: unknown block type "' + block.type + '"');
        return '';
    }
  }

  // ── Not found state ────────────────────────────────────────
  function renderNotFound(reason) {
    document.title = 'Post not found — Ming-Han Lee';
    var title = document.getElementById('post-title');
    var body = document.getElementById('post-body');
    var header = document.querySelector('.post__header');
    var cover = document.getElementById('post-cover');
    if (cover) cover.innerHTML = '';
    if (header) header.style.display = 'none';
    if (title) title.textContent = '';
    if (body) {
      body.innerHTML =
        '<div class="post__notfound">' +
          '<h2>// POST_NOT_FOUND</h2>' +
          '<p>' + escapeHtml(reason || '') + '</p>' +
          '<a href="blog.html" class="btn">← Back to Blog</a>' +
        '</div>';
    }
  }

  // ── Escape helpers ─────────────────────────────────────────
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

})();
