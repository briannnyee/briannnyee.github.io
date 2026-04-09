/* glitch.js — Scroll fade-in + counter animation
   Typewriter is handled by js/load-index.js on the home page. */
(function () {

  // ── Scroll fade-up ───────────────────────────────────────
  function setupFadeUps() {
    const fadeEls = document.querySelectorAll('.fade-up');
    if (!fadeEls.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    fadeEls.forEach(el => obs.observe(el));
  }

  // ── Counter animation ────────────────────────────────────
  function animateCount(el, target, duration) {
    duration = duration || 1500;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  function setupCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          animateCount(el, parseInt(el.dataset.count));
          obs.disconnect();
        }
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }

  // ── Expose for page loaders (e.g. load-index.js) ─────────
  window.GlitchUtils = { setupCounters: setupCounters, animateCount: animateCount };

  // ── Auto-init ────────────────────────────────────────────
  setupFadeUps();
  setupCounters();

})();
