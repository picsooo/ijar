(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var form = $('#fx-form'); if (!form) return;
  var panes = $$('.fx-pane', form), steps = $$('#fx-steps li'), cur = 0, max = 0;
  var S = { years: 5, down: 0.2, sup: 'non', pf: 'non', slot: 'Matin' };
  var TYPES = { truck: 'Transport et logistique', btp: 'BTPH', vans: 'Véhicules utilitaires', industry: 'Industrie', health: 'Santé', hotel: 'Hôtellerie' };
  var RATE = 0.085, RV = 0.01;
  function fmt(n) { return Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' '); }
  function num(v) { return parseFloat(String(v || '').replace(/[^\d]/g, '')) || 0; }

  /* ---------- Pièces à fournir (liste officielle ILA, regroupée en familles) ---------- */
  var IC = {
    projet: '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 12h8M9 16h6"/>',
    ent: '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6"/>',
    pers: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
    fin: '<path d="M3 20h18"/><rect x="5" y="11" width="3" height="7"/><rect x="10.5" y="7" width="3" height="11"/><rect x="16" y="3" width="3" height="15"/>',
    bank: '<path d="M3 9l9-5 9 5"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"/>',
    btp: '<path d="M2 20h20M4 20V9l5-3v14M9 20V4l11 4v12"/>'
  };
  var FAM = [
    ['projet', 'Votre projet', 'Ce que vous voulez financer', 'Demandez la facture pro forma à votre fournisseur dès maintenant : c\'est souvent la pièce la plus longue à obtenir.', [
      ['Demande de financement', 'Présentation de l\'entreprise, des biens, du motif et des conditions souhaitées'],
      ['Spécifications techniques et factures pro forma', 'Au nom de IJAR LEASING ALGERIE SPA C/P votre dénomination sociale'],
      ['Étude technico-économique', 'Du projet à financer']]],
    ['ent', 'Votre entreprise', 'Existence légale et locaux', 'Le registre de commerce doit être une copie légalisée par le CNRC.', [
      ['Registre de commerce', 'Copie légalisée par le CNRC, ou agrément, autorisation d\'exercer, carte d\'artisan'],
      ['Statuts à jour', 'Et actes de nomination et de pouvoirs des dirigeants'],
      ['Contrat de location ou acte de propriété', 'Des locaux professionnels repris sur le registre de commerce'],
      ['Attestations NIF et NIS', '']]],
    ['pers', 'Dirigeant et associés', 'Pour le gérant et chaque associé', 'Rassemblez ces pièces pour chaque associé en même temps : vous gagnerez du temps.', [
      ['Carte d\'identité nationale', 'En cours de validité'],
      ['Certificat de résidence', ''],
      ['Extrait de naissance', ''],
      ['Justificatif de la situation professionnelle et salariale', 'Des associés']]],
    ['fin', 'Finances et fiscalité', 'Documents récents', 'Les situations fiscale et parafiscale doivent dater de moins de 3 mois au moment du dépôt.', [
      ['États financiers des 3 derniers exercices', 'Bilans et comptes de résultats, annexes visées par l\'administration fiscale'],
      ['Situation fiscale et parafiscale', 'Extrait de rôle, mises à jour CNAS, CASNOS, CACOBATH, de moins de 3 mois']]],
    ['bank', 'Votre banque', 'Relations bancaires', 'L\'autorisation de consultation de la centrale des risques doit être signée par le représentant légal.', [
      ['Attestation RIB', 'Fournie par votre banque'],
      ['Relevés bancaires des 6 derniers mois', ''],
      ['Autorisation de consultation de la centrale des risques', 'Signée par le représentant légal']]],
    ['btp', 'Spécifique BTP', 'Entreprises du BTP', 'Ces deux pièces s\'ajoutent au dossier des entreprises du BTP.', [
      ['Plan de charges', ''],
      ['Attestation de qualification', '']], true]
  ];
  var svg = function (k) { return '<span class="fx-ico"><svg viewBox="0 0 24 24">' + IC[k] + '</svg></span>'; };
  $('#fx-docs').innerHTML = FAM.map(function (f, i) {
    return '<details class="fx-fam" data-fam="' + f[0] + '"' + (i === 0 ? ' open' : '') + (f[5] ? ' hidden' : '') + '><summary>' + svg(f[0]) +
      '<div><b>' + f[1] + '</b><small>' + f[2] + '</small></div><em>0 / ' + f[4].length + '</em></summary><div class="fx-fam__body"><p class="fx-tip">' + f[3] + '</p>' +
      f[4].map(function (d) { return '<label class="fx-doc"><input type="checkbox"><i></i><span><b>' + d[0] + '</b>' + (d[1] ? '<small>' + d[1] + '</small>' : '') + '</span></label>'; }).join('') +
      '</div></details>';
  }).join('');
  function docs() {
    var tot = 0, ok = 0;
    $$('.fx-fam').forEach(function (f) {
      if (f.hidden) return;
      var all = $$('input', f), c = all.filter(function (x) { return x.checked; }).length;
      tot += all.length; ok += c;
      $('em', f).textContent = c + ' / ' + all.length; f.classList.toggle('is-full', c === all.length);
    });
    $('#fx-docbar').style.width = (tot ? ok / tot * 100 : 0) + '%';
    $('#fx-doctxt').textContent = ok + ' / ' + tot + ' pièce' + (ok > 1 ? 's' : '') + ' prête' + (ok > 1 ? 's' : '');
    return { ok: ok, tot: tot };
  }
  $('#fx-docs').addEventListener('change', docs);

  /* ---------- Conseils ---------- */
  var HINTS = [
    ['Le crédit-bail, pour quel équipement ?', 'ILA finance l\'acquisition d\'équipements neufs, avec un financement global à des conditions compétitives.', ['Transport, BTPH, véhicules utilitaires, industrie, santé et hôtellerie', 'Vous choisissez librement l\'équipement et le fournisseur', 'ILA achète le bien, vous l\'exploitez contre des loyers']],
    ['Préparez la facture pro forma', 'C\'est la pièce clé de votre projet : elle décrit le bien et son prix.', ['À établir au nom de IJAR LEASING ALGERIE SPA C/P votre dénomination sociale', 'Accompagnée des spécifications techniques de l\'équipement', 'Pensez aussi à l\'étude technico-économique du projet']],
    ['Les pièces de l\'entreprise', 'Vérifiez dès maintenant que vos documents légaux sont à jour.', ['Registre de commerce en copie légalisée par le CNRC', 'Ou agrément, autorisation d\'exercer pour les activités réglementées', 'Statuts à jour et attestations NIF et NIS']],
    ['Un seul interlocuteur', 'Indiquez la personne qui suivra le dossier côté entreprise.', ['De préférence le dirigeant ou une personne habilitée', 'Ses pièces d\'identité feront partie du dossier', 'Un numéro joignable aux heures de bureau']],
    ['Des documents récents', 'Certaines pièces doivent être datées de moins de 3 mois au moment du dépôt.', ['Extrait de rôle et mises à jour CNAS, CASNOS, CACOBATH', 'États financiers des 3 derniers exercices', 'Relevés bancaires des 6 derniers mois']],
    ['Avant d\'envoyer', 'Relisez chaque bloc, vous pouvez revenir sur n\'importe quelle étape.', ['Un chargé d\'affaires vous recontacte pour étudier votre projet', 'Gardez votre liste de pièces à portée de main', 'Vos estimations restent indicatives']],
    ['Et maintenant ?', 'Préparez les pièces manquantes en attendant l\'appel du chargé d\'affaires.', ['Vidéo : les pièces à fournir, en 38 secondes', 'Liste complète sur la page demande']]
  ];
  function hint(i) {
    var h = HINTS[i], box = $('.fx-hint');
    var extra = [];
    if (i === 2 && $('#f-form').value === 'Artisan') extra.push('Pour un artisan : la carte d\'artisan remplace le registre de commerce');
    if (i === 4 && val('type') === 'btp') extra.push('Entreprise du BTP : ajoutez le plan de charges et l\'attestation de qualification');
    $('#fx-hint-t').textContent = h[0]; $('#fx-hint-p').textContent = h[1];
    $('#fx-hint-l').innerHTML = h[2].concat(extra).map(function (x) { return '<li>' + x + '</li>'; }).join('');
    box.classList.remove('is-swap'); void box.offsetWidth; box.classList.add('is-swap');
  }

  /* ---------- Contrôles ---------- */
  function val(n) { var r = $('input[name="' + n + '"]:checked'); return r ? r.value : ''; }
  $$('.fx-seg').forEach(function (g) {
    $$('button', g).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', g).forEach(function (x) { x.removeAttribute('aria-pressed'); });
        b.setAttribute('aria-pressed', 'true');
        var k = g.getAttribute('data-name'), v = b.getAttribute('data-v');
        S[k] = isNaN(parseFloat(v)) ? v : parseFloat(v);
        if (k === 'sup') $('#fx-sup-name').hidden = v !== 'oui';
        est();
      });
    });
  });
  var amt = $('#f-amt');
  amt.addEventListener('input', function () {
    var n = num(amt.value), pos = amt.value.length - amt.selectionStart;
    amt.value = n ? fmt(n) : ''; var p = Math.max(0, amt.value.length - pos); amt.setSelectionRange(p, p); est();
  });
  function est() {
    var a = num(amt.value), n = S.years * 12, r = RATE / 12;
    if (!a) { $('#fx-rent').textContent = '–'; $('#fx-fin').textContent = '–'; $('#fx-n').textContent = n + ' mois'; return; }
    var fin = a * (1 - S.down), rv = a * RV, rent = (fin - rv / Math.pow(1 + r, n)) * r / (1 - Math.pow(1 + r, -n));
    $('#fx-rent').textContent = fmt(rent) + ' DA'; $('#fx-fin').textContent = fmt(fin) + ' DA'; $('#fx-n').textContent = n + ' mois';
  }
  $('#f-ok').addEventListener('change', function () { if (this.checked) err(5, false); });
  $('#f-form').addEventListener('change', function () { if (cur === 2) hint(2); });
  form.addEventListener('change', function (e) {
    if (e.target.name === 'type') { $('.fx-fam[data-fam="btp"]').hidden = e.target.value !== 'btp'; docs(); err(0, false); }
  });

  /* ---------- Validation ---------- */
  function err(i, on) { var e = $('.fx-err[data-err="' + (i === 0 ? 'type' : i) + '"]'); if (e) e.classList.toggle('is-on', on); }
  function need(ids) {
    var ok = true;
    ids.forEach(function (id) { var el = $('#' + id), bad = !el.value.trim(); el.classList.toggle('is-bad', bad); if (bad && ok) { el.focus(); } if (bad) ok = false; });
    return ok;
  }
  function valid(i) {
    var ok = true;
    if (i === 0) ok = !!val('type');
    if (i === 1) ok = need(['f-eq', 'f-amt']);
    if (i === 2) ok = need(['f-soc']);
    if (i === 3) ok = need(['f-nom', 'f-tel']);
    if (i === 5) ok = $('#f-ok').checked;
    err(i, !ok); return ok;
  }
  $$('.fx-f input, .fx-f textarea').forEach(function (el) { el.addEventListener('input', function () { el.classList.remove('is-bad'); }); });

  /* ---------- Récapitulatif ---------- */
  function row(k, v) { return v ? '<dt>' + k + '</dt><dd>' + String(v).replace(/</g, '&lt;') + '</dd>' : ''; }
  function block(t, i, rows) { return '<section class="fx-rb"><header><h4>' + t + '</h4><button type="button" data-go="' + i + '">Modifier</button></header><dl>' + rows + '</dl></section>'; }
  function recap() {
    var d = docs();
    $('#fx-recap').innerHTML =
      block('Financement', 0, row('Secteur', TYPES[val('type')])) +
      block('Projet', 1, row('Équipement', $('#f-eq').value) + row('Quantité', $('#f-qty').value) + row('Montant HT', amt.value && amt.value + ' DA') + row('Durée', S.years + ' ans') + row('Apport', Math.round(S.down * 100) + ' %') + row('Fournisseur', S.sup === 'oui' ? ($('#f-sup').value || 'Choisi') : 'Pas encore choisi') + row('Facture pro forma', S.pf === 'oui' ? 'Disponible' : 'Pas encore') + row('Loyer estimé HT', $('#fx-rent').textContent)) +
      block('Entreprise', 2, row('Raison sociale', $('#f-soc').value) + row('Forme juridique', $('#f-form').value) + row('Création', $('#f-year').value) + row('Wilaya', $('#f-wil').value) + row('Activité', $('#f-act').value)) +
      block('Interlocuteur', 3, row('Nom', $('#f-nom').value) + row('Fonction', $('#f-fn').value) + row('Téléphone', $('#f-tel').value) + row('E-mail', $('#f-mail').value) + row('Rappel', S.slot)) +
      block('Dossier', 4, row('Pièces prêtes', d.ok + ' sur ' + d.tot));
  }
  $('#fx-recap').addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) go(+b.getAttribute('data-go')); });

  /* ---------- Navigation ---------- */
  var prev = $('#fx-prev'), next = $('#fx-next');
  function go(i) {
    cur = i; max = Math.max(max, i);
    panes.forEach(function (p) { p.hidden = +p.getAttribute('data-step') !== i; });
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i || (k <= max && k !== i && i < 6) ); if (i === 6) s.classList.add('is-done'); });
    prev.hidden = i === 0 || i === 6; next.parentNode.hidden = i === 6;
    next.firstChild.textContent = i === 5 ? 'Envoyer ma demande' : 'Continuer';
    var pct = i === 6 ? 100 : Math.round(i / 6 * 100);
    $('#fx-pct').textContent = pct + ' %'; $('#fx-ring').style.strokeDashoffset = 119.4 * (1 - pct / 100);
    if (i === 1) $('#fx-type-recall').textContent = 'Secteur choisi : ' + (TYPES[val('type')] || '') + '. Décrivez le bien et estimez votre loyer.';
    if (i === 5) recap();
    hint(i);
    var top = $('.fx-top').getBoundingClientRect().bottom + window.scrollY - 70;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
  }
  next.addEventListener('click', function () { if (!valid(cur)) return; go(cur + 1); });
  prev.addEventListener('click', function () { go(Math.max(0, cur - 1)); });
  steps.forEach(function (s, k) { s.addEventListener('click', function () { if (k <= max && k !== cur) go(k); }); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') { e.preventDefault(); next.click(); } });

  /* ---------- Pré-remplissage depuis le simulateur ---------- */
  var q = new URLSearchParams(location.search);
  if (TYPES[q.get('s')]) { var r = $('input[name="type"][value="' + q.get('s') + '"]'); if (r) { r.checked = true; $('.fx-fam[data-fam="btp"]').hidden = q.get('s') !== 'btp'; } }
  if (num(q.get('m'))) amt.value = fmt(num(q.get('m')));
  [['years', q.get('d')], ['down', q.get('a')]].forEach(function (p) {
    if (!p[1]) return; var b = $('.fx-seg[data-name="' + p[0] + '"] button[data-v="' + p[1] + '"]'); if (b) b.click();
  });

  docs(); est(); go(0);
})();
