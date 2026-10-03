/* Simulateur de crédit-bail ILA (maquette). Taux et valeur résiduelle : hypothèses à valider par ILA. */
(function () {
  var root = document.getElementById('sx');
  if (!root) return;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var TVA = 0.19;

  function fmt(n) { return Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' '); }
  function da(n) { return fmt(n) + ' DA'; }
  function short(n) { return n >= 1e6 ? (Math.round(n / 1e5) / 10).toString().replace('.', ',') + ' M' : fmt(n); }

  /* ---------- État (lu depuis l'URL si présent) ---------- */
  var q = new URLSearchParams(location.search);
  var S = {
    eq: q.get('s') || 'truck',
    amount: q.get('m') ? Math.max(1000000, Math.min(300000000, parseFloat(q.get('m')) || 0)) : 0,
    down: [0.1, 0.2, 0.3].indexOf(parseFloat(q.get('a'))) > -1 ? parseFloat(q.get('a')) : 0.2,
    years: [2, 3, 4, 5].indexOf(parseInt(q.get('d'), 10)) > -1 ? parseInt(q.get('d'), 10) : 4,
    rate: 8.5, rv: 1, ttc: false, ibs: 0.19
  };
  var touched = { 1: !!q.get('s'), 2: !!q.get('m'), 3: !!q.get('a'), 4: !!q.get('d') };

  function eqBtn(k) { return $('.sx-eq button[data-eq="' + k + '"]') || $('.sx-eq button'); }
  if (!S.amount) S.amount = parseFloat(eqBtn(S.eq).getAttribute('data-default'));

  /* ---------- Calcul ---------- */
  function calc(amount, down, years) {
    var n = years * 12, r = S.rate / 100 / 12, dn = amount * down, fin = amount - dn, rv = amount * S.rv / 100;
    var rent = r === 0 ? (fin - rv) / n : (fin - rv / Math.pow(1 + r, n)) * r / (1 - Math.pow(1 + r, -n));
    var total = dn + rent * n + rv;
    return { amount: amount, n: n, r: r, down: dn, fin: fin, rv: rv, rent: rent, total: total, cost: total - amount, years: years, downPct: down };
  }
  function schedule(c) {
    var b = c.fin, rows = [];
    for (var k = 1; k <= c.n; k++) {
      var it = b * c.r, pr = c.rent - it; b -= pr;
      rows.push({ k: k, rent: c.rent, it: it, pr: pr, bal: Math.max(b, 0) });
    }
    return rows;
  }

  /* ---------- Étapes et pastilles de progression ---------- */
  function steps() {
    var next = null;
    [1, 2, 3, 4].forEach(function (i) {
      var el = $('#sx-step-' + i);
      el.classList.toggle('is-done', !!touched[i]);
      el.classList.remove('is-next');
      if (!touched[i] && next === null) next = i;
    });
    if (next) $('#sx-step-' + next).classList.add('is-next');
    var done = [1, 2, 3, 4].filter(function (i) { return touched[i]; }).length;
    $('#sx-progress').textContent = done === 4 ? 'Simulation complète' : 'Étape ' + (done + 1) + ' sur 4';
  }

  /* ---------- Rendu ---------- */
  var lastRent = 0, tableMode = 'year';
  function render() {
    var c = calc(S.amount, S.down, S.years), b = eqBtn(S.eq);
    // Sélections
    $$('.sx-eq button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    $$('[data-k="down"] button').forEach(function (x) { x.setAttribute('aria-pressed', parseFloat(x.dataset.v) === S.down ? 'true' : 'false'); });
    $$('[data-k="years"] button').forEach(function (x) { x.setAttribute('aria-pressed', parseInt(x.dataset.v, 10) === S.years ? 'true' : 'false'); });
    var inp = $('#sx-amount');
    if (document.activeElement !== inp) inp.value = fmt(S.amount);
    $('#sx-range').value = S.amount;
    $$('#sx-chips button').forEach(function (x) { x.setAttribute('aria-pressed', parseFloat(x.dataset.v) === S.amount ? 'true' : 'false'); });
    $('#sx-down-note').innerHTML = 'Apport : <b>' + da(c.down) + '</b> · Financé par ILA : <b>' + da(c.fin) + '</b>';
    $('#sx-years-note').innerHTML = '<b>' + c.n + ' loyers</b> mensuels, puis option d\'achat à <b>' + da(c.rv) + '</b>';
    $('#sx-rate-o').textContent = S.rate.toString().replace('.', ',') + ' %';
    $('#sx-rv-o').textContent = S.rv + ' %';

    // Panneau résultat
    $('#sx-res-img').src = b.querySelector('img').src;
    $('#sx-res-name').textContent = b.getAttribute('data-name');
    $('#sx-res-sub').textContent = da(S.amount) + ' · ' + S.years + ' ans · apport ' + Math.round(S.down * 100) + ' %';
    var shown = S.ttc ? c.rent * (1 + TVA) : c.rent;
    var big = $('#sx-big');
    big.textContent = da(shown);
    if (Math.round(lastRent) !== Math.round(c.rent)) { big.classList.add('is-flash'); setTimeout(function () { big.classList.remove('is-flash'); }, 350); }
    lastRent = c.rent;
    $('#sx-big-l').textContent = S.ttc ? 'Loyer mensuel estimé TTC' : 'Loyer mensuel estimé HT';
    $('#sx-ttc').textContent = S.ttc ? 'Soit ' + da(c.rent) + ' HT' : 'Soit ' + da(c.rent * (1 + TVA)) + ' TTC (TVA 19 %)';
    $('#sx-dock-v').textContent = da(shown);

    // Anneau de répartition
    var parts = [[c.down, '#86d38d'], [c.rent * c.n, '#4f8fd6'], [c.rv, '#ffffff']], tot = c.total, off = 0, C = 2 * Math.PI * 42, svg = '';
    parts.forEach(function (p) {
      var len = p[0] / tot * C;
      svg += '<circle cx="55" cy="55" r="42" fill="none" stroke="' + p[1] + '" stroke-width="14" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-off) + '"/>';
      off += len;
    });
    $('#sx-donut').innerHTML = '<circle cx="55" cy="55" r="42" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="14"/>' + svg;
    $('#sx-l-down').textContent = da(c.down);
    $('#sx-l-rents').textContent = da(c.rent * c.n);
    $('#sx-l-rv').textContent = da(c.rv);
    $('#sx-r-fin').textContent = da(c.fin);
    $('#sx-r-total').textContent = da(c.total);
    $('#sx-r-cost').textContent = da(c.cost);

    tips(c); compare(); chart(c); table(c); fiscal(c); links(c); steps();
  }

  /* Suggestions cliquables calculées à partir de la simulation */
  function tips(c) {
    var out = [];
    if (S.years < 5) {
      var a = calc(S.amount, S.down, S.years + 1);
      out.push(['years', S.years + 1, 'Passez à ' + (S.years + 1) + ' ans : votre loyer baisse de ' + da(c.rent - a.rent) + ' par mois']);
    }
    if (S.down < 0.3) {
      var d = Math.round((S.down + 0.1) * 10) / 10, b2 = calc(S.amount, d, S.years);
      out.push(['down', d, 'Avec un apport de ' + Math.round(d * 100) + ' %, le loyer baisse de ' + da(c.rent - b2.rent) + ' par mois']);
    }
    if (S.years > 2 && out.length < 2) {
      var e = calc(S.amount, S.down, S.years - 1);
      out.push(['years', S.years - 1, 'En ' + (S.years - 1) + ' ans, vous économisez ' + da(c.total - e.total) + ' sur le coût total']);
    }
    $('#sx-tips').innerHTML = out.slice(0, 2).map(function (t) {
      return '<button type="button" class="sx-tip" data-tk="' + t[0] + '" data-tv="' + t[1] + '"><i></i><span>' + t[2] + '</span></button>';
    }).join('');
  }

  /* Comparatif des quatre durées, avec pastilles calculées (pas de statistiques inventées) */
  function compare() {
    var cs = [2, 3, 4, 5].map(function (y) { return calc(S.amount, S.down, y); });
    var minRent = Math.min.apply(null, cs.map(function (x) { return x.rent; }));
    var minTot = Math.min.apply(null, cs.map(function (x) { return x.total; }));
    $('#sx-compare').innerHTML = cs.map(function (x) {
      var pill = x.rent === minRent ? '<span class="il-pill il-pill--brass">Loyer le plus bas</span>' : x.total === minTot ? '<span class="il-pill">Coût total le plus bas</span>' : (x.years === S.years ? '<span class="il-pill il-pill--soft">Votre choix</span>' : '');
      return '<button type="button" class="sx-cmp" data-y="' + x.years + '" aria-pressed="' + (x.years === S.years) + '">' + pill +
        '<h3>' + x.years + ' ans</h3><strong>' + da(x.rent) + '</strong><small>par mois HT</small><small>Coût total ' + short(x.total) + ' DA</small></button>';
    }).join('');
  }

  /* Graphique : capital restant dû et cumul payé */
  function chart(c) {
    var rows = schedule(c), W = 800, H = 260, P = 34, maxY = Math.max(c.fin, c.total);
    var x = function (k) { return P + (W - P - 34) * k / c.n; }, y = function (v) { return H - P - (H - P - 14) * v / maxY; };
    var bal = 'M' + x(0) + ',' + y(c.fin), paid = 'M' + x(0) + ',' + y(c.down);
    rows.forEach(function (r) { bal += ' L' + x(r.k) + ',' + y(r.bal); paid += ' L' + x(r.k) + ',' + y(c.down + c.rent * r.k); });
    var area = bal + ' L' + x(c.n) + ',' + y(0) + ' L' + x(0) + ',' + y(0) + ' Z';
    var grid = '';
    for (var yy = 0; yy <= S.years; yy++) {
      grid += '<line x1="' + x(yy * 12) + '" x2="' + x(yy * 12) + '" y1="14" y2="' + (H - P) + '" stroke="#e3e9f0"/>' +
        '<text x="' + x(yy * 12) + '" y="' + (H - 12) + '" font-size="12" text-anchor="middle" fill="#566476">' + (yy === 0 ? 'Début' : 'An ' + yy) + '</text>';
    }
    $('#sx-chart').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Évolution du capital restant dû et des montants payés">' + grid +
      '<path d="' + area + '" fill="rgba(11,47,87,.12)"/><path d="' + bal + '" fill="none" stroke="#0b2f57" stroke-width="2.5"/>' +
      '<path d="' + paid + '" fill="none" stroke="#2b8a3b" stroke-width="2.5" stroke-dasharray="6 5"/>' +
      '<circle cx="' + x(c.n) + '" cy="' + y(c.rv) + '" r="6" fill="#2b8a3b"/><text x="' + (x(c.n) - 10) + '" y="' + (y(c.rv) - 12) + '" font-size="12" text-anchor="end" fill="#0b2f57" font-weight="700">Option d\'achat</text></svg>';
  }

  /* Échéancier : par année ou par mois */
  function table(c) {
    var rows = schedule(c), h = '';
    if (tableMode === 'year') {
      for (var yy = 1; yy <= S.years; yy++) {
        var sl = rows.slice((yy - 1) * 12, yy * 12), it = 0, pr = 0;
        sl.forEach(function (r) { it += r.it; pr += r.pr; });
        h += '<tr><td>Année ' + yy + '</td><td>' + fmt(c.rent * 12) + '</td><td>' + fmt(c.rent * 12 * (1 + TVA)) + '</td><td>' + fmt(pr) + '</td><td>' + fmt(it) + '</td><td>' + fmt(sl[sl.length - 1].bal) + '</td></tr>';
      }
    } else {
      rows.forEach(function (r) {
        h += '<tr><td>Mois ' + r.k + '</td><td>' + fmt(r.rent) + '</td><td>' + fmt(r.rent * (1 + TVA)) + '</td><td>' + fmt(r.pr) + '</td><td>' + fmt(r.it) + '</td><td>' + fmt(r.bal) + '</td></tr>';
        if (r.k % 12 === 0) h += '<tr class="is-year"><td>Fin de l\'année ' + (r.k / 12) + '</td><td colspan="4"></td><td>' + fmt(r.bal) + '</td></tr>';
      });
    }
    h += '<tr class="is-year"><td>Option d\'achat</td><td>' + fmt(c.rv) + '</td><td colspan="3"></td><td>0</td></tr>';
    $('#sx-table tbody').innerHTML = h;
  }

  /* Avantage fiscal indicatif : loyers déductibles */
  function fiscal(c) {
    var rents = c.rent * c.n;
    $('#sx-f-rents').textContent = da(rents);
    $('#sx-f-tva').textContent = da(c.rent * TVA);
    $('#sx-f-ibs').textContent = da(rents * S.ibs);
  }

  function links(c) {
    var qs = 's=' + S.eq + '&m=' + Math.round(S.amount) + '&a=' + S.down + '&d=' + S.years;
    history.replaceState(null, '', '?' + qs);
    $$('[data-sx-demande]').forEach(function (a) { a.href = 'demande.html?' + qs; });
  }

  /* ---------- Interactions ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.closest('.sx-eq')) { S.eq = t.dataset.eq; touched[1] = true; S.amount = parseFloat(t.dataset.default); touched[2] = touched[2] || false; buildChips(); render(); return; }
    if (t.closest('#sx-chips')) { S.amount = parseFloat(t.dataset.v); touched[2] = true; render(); return; }
    var g = t.closest('[data-k]');
    if (g) { var k = g.dataset.k; S[k] = parseFloat(t.dataset.v); touched[k === 'down' ? 3 : 4] = true; render(); return; }
    if (t.classList.contains('sx-tip')) { S[t.dataset.tk] = parseFloat(t.dataset.tv); touched[t.dataset.tk === 'down' ? 3 : 4] = true; render(); toast('Simulation mise à jour'); return; }
    if (t.classList.contains('sx-cmp')) { S.years = parseInt(t.dataset.y, 10); touched[4] = true; render(); return; }
    if (t.dataset.tab) { tableMode = t.dataset.tab; $$('.sx-tabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); }); render(); return; }
    if (t.id === 'sx-share') { share(); return; }
    if (t.id === 'sx-print') { window.print(); return; }
  });
  $('#sx-amount').addEventListener('input', function (e) {
    var v = parseFloat(e.target.value.replace(/[^\d]/g, '')) || 0;
    if (v >= 1000000 && v <= 300000000) { S.amount = v; touched[2] = true; render(); }
  });
  $('#sx-amount').addEventListener('blur', function (e) {
    var v = parseFloat(e.target.value.replace(/[^\d]/g, '')) || 0;
    S.amount = Math.max(1000000, Math.min(300000000, v || S.amount)); render();
  });
  $('#sx-range').addEventListener('input', function (e) { S.amount = parseFloat(e.target.value); touched[2] = true; render(); });
  $('#sx-rate').addEventListener('input', function (e) { S.rate = parseFloat(e.target.value); render(); });
  $('#sx-rv').addEventListener('input', function (e) { S.rv = parseFloat(e.target.value); render(); });
  $('#sx-ttc-t').addEventListener('change', function (e) { S.ttc = e.target.checked; render(); });
  $('#sx-ibs').addEventListener('change', function (e) { S.ibs = parseFloat(e.target.value); render(); });

  function buildChips() {
    var b = eqBtn(S.eq);
    $('#sx-chips').innerHTML = b.dataset.chips.split(',').map(function (v) {
      return '<button type="button" data-v="' + v + '">' + short(parseFloat(v)) + ' DA</button>';
    }).join('');
  }

  function toast(msg) {
    var t = $('#sx-toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('is-on'); }, 2200);
  }
  function share() {
    var url = location.href;
    if (navigator.share) { navigator.share({ title: 'Ma simulation de crédit-bail ILA', url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Lien de la simulation copié'); }, function () { toast('Copiez le lien dans la barre d\'adresse'); });
    else toast('Copiez le lien dans la barre d\'adresse');
  }

  /* Barre collante sur mobile quand le résultat sort de l'écran */
  var dock = $('#sx-dock'), res = $('.sx-res');
  if ('IntersectionObserver' in window && dock && res) {
    new IntersectionObserver(function (en) { dock.classList.toggle('is-on', !en[0].isIntersecting); }, { threshold: 0 }).observe(res);
  }

  buildChips();
  render();
})();
