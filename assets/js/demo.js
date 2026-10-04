/* Bandeau de démonstration Webminds + pastille de changement de version */
(function () {
  var root = document.documentElement.getAttribute('data-root') || './';
  var isV2 = document.documentElement.getAttribute('data-version') === 'v2';

  var css = document.createElement('style');
  css.textContent =
    '.wm-demo{position:fixed;left:0;right:0;bottom:0;z-index:90;background:#1b2421;color:#e8ece9;font:500 12.5px/1.35 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;text-align:center;padding:11px 14px calc(11px + env(safe-area-inset-bottom,0px));height:auto;min-height:40px;border-top:1px solid #a8812f}' +
    '.wm-demo b{color:#e9c977;font-weight:600}' +
    '.wm-pill{position:fixed;left:14px;bottom:calc(54px + env(safe-area-inset-bottom,0px));z-index:91;display:inline-flex;align-items:center;gap:10px;padding:11px 16px 11px 12px;border-radius:999px;background:#a8812f;color:#fff;text-decoration:none;font:600 14px/1.2 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;box-shadow:0 8px 24px rgba(18,48,43,.28)}' +
    '.wm-pill__dot{width:10px;height:10px;border-radius:50%;background:#fff;position:relative}' +
    '.wm-pill__dot::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid #fff;opacity:0;animation:wmPing 2.2s ease-out infinite}' +
    '@keyframes wmPing{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.9);opacity:0}}' +
    '@media (prefers-reduced-motion:reduce){.wm-pill__dot::after{animation:none}}';
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'wm-demo';
  bar.setAttribute('role', 'note');
  bar.innerHTML = 'Maquette de démonstration réalisée par <b>Webminds</b> · aucun formulaire n\'est enregistré';
  document.body.appendChild(bar);

  var pill = document.createElement('a');
  pill.className = 'wm-pill';
  pill.href = isV2 ? root + 'index.html' : root + 'v2/index.html';
  pill.innerHTML = '<span class="wm-pill__dot" aria-hidden="true"></span>' +
    (isV2 ? 'Découvrir la version corporate' : 'Découvrir la version institutionnelle');
  document.body.appendChild(pill);

  /* Formulaires factices : rien n'est envoyé */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f.matches('[data-fake]')) return;
    e.preventDefault();
    var ok = document.getElementById(f.getAttribute('data-fake'));
    if (ok) { ok.classList.add('is-on'); ok.setAttribute('tabindex', '-1'); ok.focus(); }
    f.reset();
  });
})();
