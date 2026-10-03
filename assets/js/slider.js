/* Carrousel du hero : défilement auto, points, flèches, glisser au doigt */
(function () {
  var root = document.querySelector('.il-slider');
  if (!root) return;
  var slides = [].slice.call(root.querySelectorAll('.il-slide'));
  var dots = [].slice.call(root.querySelectorAll('.il-dot'));
  var num = document.getElementById('il-sn');
  var DUR = 6500, cur = 0, timer = null;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.style.setProperty('--dur', DUR + 'ms');

  function go(i) {
    i = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) {
      var on = k === i;
      s.classList.toggle('is-on', on);
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      s.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
    });
    dots.forEach(function (d, k) {
      d.classList.remove('is-on');
      d.classList.toggle('is-done', k < i);
      if (k === i) { void d.offsetWidth; d.classList.add('is-on'); }
    });
    cur = i;
    if (num) num.textContent = (i < 9 ? '0' : '') + (i + 1);
    /* précharge la photo suivante */
    var nx = slides[(i + 1) % slides.length].querySelector('img');
    if (nx && nx.loading === 'lazy') nx.loading = 'eager';
    restart();
  }
  function restart() { clearTimeout(timer); if (!reduce && !root.classList.contains('is-paused')) timer = setTimeout(function () { go(cur + 1); }, DUR); }

  dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
  root.querySelectorAll('.il-arrow').forEach(function (b) { b.addEventListener('click', function () { go(cur + parseInt(b.dataset.dir, 10)); }); });

  /* pause au survol (ordinateur) et quand l'onglet est caché */
  root.addEventListener('mouseenter', function () { root.classList.add('is-paused'); clearTimeout(timer); });
  root.addEventListener('mouseleave', function () { root.classList.remove('is-paused'); restart(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(timer); else restart(); });

  /* glisser au doigt */
  var x0 = null, y0 = null;
  root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });

  go(0);
})();
