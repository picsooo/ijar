(function () {
  var RATE = 0.085, RV = 0.01;
  var $ = function (id) { return document.getElementById(id); };
  var t = $('v-t'), amt = $('v-amt'), playBtn = $('v-play');
  var state = { years: 5, down: 0.1 };
  function fmt(n) { return Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ') + ' DA'; }

  function rent() {
    var a = parseFloat(amt.value), n = state.years * 12, r = RATE / 12;
    var fin = a * (1 - state.down), rv = a * RV;
    return { a: a, n: n, down: a * state.down, rv: rv, rent: (fin - rv / Math.pow(1 + r, n)) * r / (1 - Math.pow(1 + r, -n)) };
  }

  function draw() {
    var res = rent(), m = Math.min(parseInt(t.value, 10), res.n);
    t.max = res.n;
    $('v-amt-o').textContent = fmt(res.a);
    $('v-rent').textContent = fmt(res.rent);
    $('v-paid').textContent = fmt(res.down + res.rent * m + (m === res.n ? res.rv : 0));
    $('v-left').textContent = (res.n - m) + ' / ' + res.n;
    var done = m === res.n;
    $('v-month').textContent = done ? 'Fin du contrat' : 'Mois ' + m;
    /* Le bien se "colore" au rythme des loyers, de gauche à droite */
    $('v-clip-r').setAttribute('width', (m / res.n * 52).toFixed(2));
    $('v-key').classList.toggle('is-on', done);
    $('v-owner').innerHTML = done ? 'Propriété de <b>votre entreprise</b>' : 'Propriété d\'ILA';
    $('v-use').innerHTML = done ? 'Option d\'achat levée' : 'Utilisé par <b>votre entreprise</b>';
  }

  document.querySelectorAll('.v-pick button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.v-pick button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      var ic = '#' + b.getAttribute('data-ic');
      $('v-use-a').setAttribute('href', ic); $('v-use-b').setAttribute('href', ic);
      t.value = 0; draw();
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
    }, reduce ? 400 : 70);
  });
  draw();
})();
