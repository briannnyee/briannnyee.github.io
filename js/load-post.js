/* load-post.js — Renders post.html from data/blog.json + article content.
   Article content is loaded from either:
     1. data/posts/{id}.md   — preferred, full markdown (GFM)
     2. data/posts/{id}.json — fallback, structured content blocks
*/
(function () {

  // ── Fetch helpers (text and JSON variants) ────────────────
  function safeFetchJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function () { return null; });
  }

  function safeFetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).catch(function () { return null; });
  }

  function getQueryId() {
    try {
      return new URLSearchParams(window.location.search).get('id');
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

  // Fetch blog index + markdown body in parallel. Markdown is the
  // preferred format; if it's missing we try the JSON fallback.
  Promise.all([
    safeFetchJson('data/blog.json'),
    safeFetchText('data/posts/' + id + '.md')
  ]).then(function (results) {
    var blog = results[0];
    var md = results[1];

    if (!blog || !Array.isArray(blog.posts)) {
      renderNotFound('Blog index is unavailable.');
      return;
    }

    var meta = blog.posts.find(function (p) { return p.id === id; });
    if (!meta) {
      renderNotFound('No post found with ID "' + id + '".');
      return;
    }

    if (md != null) {
      renderPostMarkdown(meta, md);
      return;
    }

    // Markdown missing — fall back to the JSON block format.
    safeFetchJson('data/posts/' + id + '.json').then(function (content) {
      if (!content) {
        renderNotFound('Content file missing for "' + id + '".');
        return;
      }
      renderPostBlocks(meta, content);
    });
  });

  // ── Shared: header (cover, tags, title, meta) ─────────────
  function renderHeader(meta, coverOverride) {
    document.title = meta.title + ' — Ming-Han Lee';

    var coverUrl = coverOverride || meta.cover;
    var coverEl = document.getElementById('post-cover');
    if (coverEl && coverUrl) {
      coverEl.className = 'post__cover';
      coverEl.innerHTML = '<img src="' + escapeAttr(coverUrl) + '" alt="' + escapeAttr(meta.title) + ' cover">';
    }

    var tagsEl = document.getElementById('post-tags');
    if (tagsEl && Array.isArray(meta.tags)) {
      tagsEl.innerHTML = meta.tags.map(function (t) {
        return '<span class="badge badge--' + t.color + '">' + escapeHtml(t.label) + '</span>';
      }).join('');
    }

    var titleEl = document.getElementById('post-title');
    if (titleEl) titleEl.textContent = meta.title;

    var metaEl = document.getElementById('post-meta');
    if (metaEl) {
      metaEl.innerHTML =
        '<span class="post__meta-date">' + escapeHtml(meta.date) + '</span>' +
        '<span class="post__meta-readtime">' + escapeHtml(meta.readtime) + '</span>';
    }
  }

  // ── Markdown rendering ────────────────────────────────────
  function renderPostMarkdown(meta, md) {
    if (typeof marked === 'undefined') {
      console.error('load-post: marked library is not loaded');
      renderNotFound('Markdown parser failed to load.');
      return;
    }

    renderHeader(meta);

    var bodyEl = document.getElementById('post-body');
    if (!bodyEl) return;

    // GFM on, auto-linebreaks off (CommonMark behavior).
    marked.setOptions({ gfm: true, breaks: false });
    bodyEl.innerHTML = marked.parse(md);

    postProcessMarkdownHtml(bodyEl);
  }

  // Post-process the DOM that marked produced so it matches the site's
  // existing post.css styling conventions.
  function postProcessMarkdownHtml(bodyEl) {
    // 1. Mirror `language-xxx` class from <code> onto <pre data-lang="xxx">
    //    so the existing .post__body pre::before badge works unchanged.
    bodyEl.querySelectorAll('pre > code[class*="language-"]').forEach(function (code) {
      var m = code.className.match(/language-(\S+)/);
      if (m && code.parentElement && !code.parentElement.hasAttribute('data-lang')) {
        code.parentElement.setAttribute('data-lang', m[1]);
      }
    });

    // 2. Wrap any bare <iframe> or <video> in .post__video so embeds
    //    get the responsive 16:9 frame from post.css. Authors can
    //    paste a YouTube iframe or <video> tag directly into their md.
    bodyEl.querySelectorAll('iframe, video').forEach(function (el) {
      if (el.closest('.post__video')) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'post__video';
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    });

    // 3. Blockquote citations: if the last <p> inside a <blockquote>
    //    starts with an em/en-dash, convert it to a <cite> so the
    //    existing blockquote cite::before arrow styling applies.
    bodyEl.querySelectorAll('blockquote').forEach(function (bq) {
      var paras = bq.querySelectorAll(':scope > p');
      if (!paras.length) return;
      var last = paras[paras.length - 1];
      var text = (last.textContent || '').trim();
      var match = text.match(/^[—–]\s+(.+)$/);
      if (match) {
        var cite = document.createElement('cite');
        cite.textContent = match[1];
        last.replaceWith(cite);
      }
    });

    // 4. Wrap standalone <img> in a <figure> so they get the cut-corner
    //    frame + optional caption treatment. Markdown images with title
    //    text (`![alt](src "caption")`) get the title as figcaption.
    bodyEl.querySelectorAll('p > img:only-child').forEach(function (img) {
      var p = img.parentElement;
      var figure = document.createElement('figure');
      figure.appendChild(img);
      if (img.title) {
        var caption = document.createElement('figcaption');
        caption.textContent = img.title;
        figure.appendChild(caption);
        img.removeAttribute('title');
      }
      p.replaceWith(figure);
    });
  }

  // ── JSON block rendering (fallback format) ────────────────
  function renderPostBlocks(meta, content) {
    renderHeader(meta, content.cover);

    var bodyEl = document.getElementById('post-body');
    if (bodyEl && Array.isArray(content.body)) {
      bodyEl.innerHTML = content.body.map(renderBlock).filter(Boolean).join('');
    }
  }

  function renderBlock(block) {
    if (!block || !block.type) return '';
    switch (block.type) {
      case 'text':
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

  // ── Not found state ───────────────────────────────────────
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
