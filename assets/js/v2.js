(function () {
  var RATE = 0.085, RV = 0.01;
  var $ = function (id) { return document.getElementById(id); };
  var t = $('v-t'), amt = $('v-amt'), playBtn = $('v-play');
  var state = { years: 5, down: 0.1 };
  function fmt(n) { return Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ') + ' DA'; }

  /* En-tête : devient opaque après la scène */
  var head = $('v-head');
  function onScroll() { head.classList.toggle('is-solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function calc() {
    var a = parseFloat(amt.value), n = state.years * 12, r = RATE / 12;
    var fin = a * (1 - state.down), rv = a * RV;
    return { a: a, n: n, down: a * state.down, rv: rv, rent: (fin - rv / Math.pow(1 + r, n)) * r / (1 - Math.pow(1 + r, -n)) };
  }

  function draw() {
    var res = calc();
    t.max = res.n;
    var m = Math.min(parseInt(t.value, 10), res.n), pct = m / res.n * 100, done = m === res.n;
    $('v-amt-o').textContent = fmt(res.a);
    $('v-rent').textContent = fmt(res.rent);
    $('v-paid').textContent = fmt(res.down + res.rent * m + (done ? res.rv : 0));
    $('v-left').textContent = (res.n - m) + ' / ' + res.n;
    $('v-month').textContent = done ? 'Fin du contrat' : 'Mois ' + m;
    /* La photo couleur se dévoile de gauche à droite (largeur pilotée en JS, compatible Safari) */
    $('v-own').style.width = pct + '%';
    var seam = $('v-seam');
    seam.style.left = pct + '%';
    seam.style.opacity = (m > 0 && !done) ? '1' : '0';
    seam.classList.toggle('is-left', pct > 70);
    $('v-seam-l').textContent = m + ' loyer' + (m > 1 ? 's' : '') + ' réglé' + (m > 1 ? 's' : '');
    var owner = $('v-owner');
    owner.innerHTML = done ? 'Propriété de votre entreprise' : 'Propriété d\'ILA';
    owner.classList.toggle('v-tag--done', done);
    $('v-use').innerHTML = done ? 'Option d\'achat levée' : 'Utilisé par <b>votre entreprise</b>';
  }

  document.querySelectorAll('.v-pick button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.v-pick button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      var src = b.getAttribute('data-img');
      $('v-img-a').src = src; $('v-img-b').src = src;
      stop(); t.value = 0; draw();
    });
  });
  document.querySelectorAll('.v-seg').forEach(function (g) {
    g.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        state[g.getAttribute('data-k')] = parseFloat(b.getAttribute('data-v'));
        draw();
      });
    });
  });
  t.addEventListener('input', function () { stop(); draw(); });
  amt.addEventListener('input', draw);

  var timer = null;
  function stop() { if (timer) { clearInterval(timer); timer = null; playBtn.textContent = 'Lancer le contrat'; } }
  playBtn.addEventListener('click', function () {
    if (timer) return stop();
    if (parseInt(t.value, 10) >= parseInt(t.max, 10)) t.value = 0;
    playBtn.textContent = 'Pause';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer = setInterval(function () {
      t.value = Math.min(parseInt(t.max, 10), parseInt(t.value, 10) + (reduce ? 12 : 1));
      draw();
      if (parseInt(t.value, 10) >= parseInt(t.max, 10)) stop();
    }, reduce ? 400 : 60);
  });
  draw();
})();
