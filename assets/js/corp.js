(function () {
  var LOGO = 'https://www.ijarleasingalgerie.dz/IMAGE/Logo.png';
  var page = document.body.getAttribute('data-page') || '';
  var links = [
    ['index.html', 'Accueil', 'home'],
    ['solutions.html', 'Solutions', 'solutions'],
    ['simulateur.html', 'Simulateur', 'sim'],
    ['demande.html', 'Demande de financement', 'demande'],
    ['contact.html', 'Contact', 'contact']
  ];
  function nav(cls) {
    return links.map(function (l) {
      return '<a href="' + l[0] + '"' + (l[2] === page ? ' aria-current="page"' : '') + '>' + l[1] + '</a>';
    }).join('');
  }

  /* ---- En-tête ---- */
  var head = document.getElementById('il-head');
  if (head) {
    head.className = 'il-head';
    head.innerHTML =
      '<div class="il-wrap il-head__in">' +
        '<a class="il-brand" href="index.html" aria-label="Ijar Leasing Algérie, accueil">' +
          '<img src="' + LOGO + '" alt="Ijar Leasing Algérie" onerror="this.remove()">' +
          '<span class="il-brand__txt">Ijar Leasing Algérie<small>Crédit-bail · filiale de la BEA</small></span>' +
        '</a>' +
        '<nav class="il-nav" aria-label="Navigation principale">' + nav() + '</nav>' +
        '<a class="il-btn il-btn--ink il-head__cta" href="demande.html">Demander un financement</a>' +
        '<button class="il-burger" type="button" aria-expanded="false" aria-controls="il-drawer" aria-label="Ouvrir le menu"><span></span></button>' +
      '</div>' +
      '<div class="il-wrap il-drawer" id="il-drawer">' + nav() +
        '<a class="il-btn il-btn--ink" href="demande.html">Demander un financement</a></div>';
    var b = head.querySelector('.il-burger'), d = head.querySelector('.il-drawer');
    b.addEventListener('click', function () {
      var o = d.classList.toggle('is-open');
      b.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
  }

  /* ---- Carte + pied de page ---- */
  var foot = document.getElementById('il-foot');
  if (foot) {
    foot.innerHTML =
      '<iframe class="il-map" title="Siège d\'Ijar Leasing Algérie sur Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" ' +
      'src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.818556013759!2d3.046569214504149!3d36.75092607817307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb27a60f15e31%3A0x955471d0676ab82c!2sIjar%20Leasing%20Alg%C3%A9rie!5e0!3m2!1sfr!2sdz!4v1612269883743!5m2!1sfr!2sdz"></iframe>' +
      '<footer class="il-foot"><div class="il-wrap">' +
        '<div class="il-foot__grid">' +
          '<div><h3>Ijar Leasing Algérie</h3><p>Établissement financier de crédit-bail créé par la Banque Extérieure d\'Algérie. Capital social de 6,5 milliards DA.</p></div>' +
          '<div><h3>Siège</h3><ul><li>71, rue Mohamed Belkacemi</li><li>El Madania, Alger</li><li><a href="tel:+21323738009">023 73 80 09</a></li><li>Fax 023 73 80 10</li><li><a href="mailto:contact@ijarleasingalgerie.dz">contact@ijarleasingalgerie.dz</a></li></ul></div>' +
          '<div><h3>Raccourcis</h3><ul>' + links.map(function (l) { return '<li><a href="' + l[0] + '">' + l[1] + '</a></li>'; }).join('') + '</ul></div>' +
        '</div>' +
        '<div class="il-foot__bottom">© Ijar Leasing Algérie SPA. Maquette proposée par Webminds Digital Solutions.</div>' +
      '</div></footer>';
  }

  /* ---- Calcul du loyer (hypothèses indicatives, à valider par ILA) ---- */
  var RATE = 0.085;   // taux annuel indicatif
  var RV = 0.01;      // valeur résiduelle indicative (1 % du montant)
  function fmt(n) { return Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' '); }
  function calc(amount, downPct, years) {
    var down = amount * downPct, financed = amount - down, n = years * 12, r = RATE / 12;
    var rv = amount * RV;
    var rent = (financed - rv / Math.pow(1 + r, n)) * r / (1 - Math.pow(1 + r, -n));
    return { down: down, financed: financed, n: n, rent: rent, rv: rv, total: down + rent * n + rv };
  }
  window.ILA = { calc: calc, fmt: fmt };

  function bindSeg(box, onChange) {
    box.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        box.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        onChange();
      });
    });
  }
  function segVal(box) { return parseFloat(box.querySelector('[aria-pressed="true"]').getAttribute('data-v')); }

  document.querySelectorAll('[data-sim]').forEach(function (sim) {
    var amt = sim.querySelector('[data-amount]');
    var amtOut = sim.querySelector('[data-amount-out]');
    var dur = sim.querySelector('[data-years]');
    var dwn = sim.querySelector('[data-down]');
    var full = sim.getAttribute('data-sim') === 'full';
    function run() {
      var a = parseFloat(amt.value) || 0;
      if (amtOut) amtOut.textContent = fmt(a) + ' DA';
      var res = calc(a, segVal(dwn), segVal(dur));
      sim.querySelectorAll('[data-out="rent"]').forEach(function (el) { el.textContent = fmt(res.rent) + ' DA'; });
      if (!full) return;
      var map = { down: res.down, financed: res.financed, rv: res.rv, total: res.total, n: res.n };
      Object.keys(map).forEach(function (k) {
        var el = sim.querySelector('[data-out="' + k + '"]');
        if (el) el.textContent = k === 'n' ? map[k] + ' loyers' : fmt(map[k]) + ' DA';
      });
      var bars = sim.querySelector('.il-bars');
      if (bars) {
        var h = '';
        /* schéma : apport, puis les loyers, puis l'option d'achat */
        var ratio = Math.min(1, res.rent / Math.max(res.down, 1));
        h += '<i class="is-first" style="height:100%" title="Apport"></i>';
        for (var i = 0; i < res.n; i++) h += '<i style="height:' + Math.round(35 + ratio * 40) + '%"></i>';
        h += '<i class="is-last" style="height:100%;flex:3" title="Option d\'achat"></i>';
        bars.innerHTML = h;
      }
    }
    amt.addEventListener('input', run);
    bindSeg(dur, run); bindSeg(dwn, run);
    run();
  });

  /* ---- Pièces à fournir ---- */
  var docs = document.querySelector('.il-docs');
  if (docs) {
    var boxes = docs.querySelectorAll('input'), bar = document.querySelector('.il-prog__bar i'), txt = document.querySelector('.il-prog__txt');
    function upd() {
      var c = 0; boxes.forEach(function (b) { if (b.checked) c++; });
      bar.style.width = (c / boxes.length * 100) + '%';
      txt.textContent = c + ' pièce' + (c > 1 ? 's' : '') + ' prête' + (c > 1 ? 's' : '') + ' sur ' + boxes.length;
    }
    boxes.forEach(function (b) { b.addEventListener('change', upd); });
    upd();
  }
})();
