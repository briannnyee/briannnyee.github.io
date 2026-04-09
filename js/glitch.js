/* glitch.js — Typewriter + scroll fade-in */
(function () {

  // ── Typewriter ───────────────────────────────────────────
  const el = document.getElementById('typewriter');
  if (el) {
    const phrases = [
      'Software Engineer',
      'Full-Stack Developer',
      'Cyberpunk 2077 Fan',
      'Problem Solver',
      'Builder of Cool Things',
    ];
    let pIdx = 0, cIdx = 0, deleting = false;
    const SPEED_TYPE = 80, SPEED_DEL = 45, PAUSE = 1800;

    function tick() {
      const phrase = phrases[pIdx];
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

  // ── Scroll fade-up ───────────────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
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
  function animateCount(el, target, duration = 1500) {
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

  document.querySelectorAll('[data-count]').forEach(el => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animateCount(el, parseInt(el.dataset.count));
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  });

})();
