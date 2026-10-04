(function () {
  var RATE = 0.085, RV = 0.01, st = { years: 5, down: 0.1 };
  var $ = function (id) { return document.getElementById(id); };
  function fmt(n) { return Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ') + ' DA'; }
  function draw() {
    var a = parseFloat($('c-amt').value), n = st.years * 12, r = RATE / 12, down = a * st.down, fin = a - down, rv = a * RV;
    var rent = (fin - rv / Math.pow(1 + r, n)) * r / (1 - Math.pow(1 + r, -n));
    $('c-amt-o').textContent = fmt(a); $('c-rent').textContent = fmt(rent); $('c-down').textContent = fmt(down);
    $('c-fin').textContent = fmt(fin); $('c-n').textContent = n + ' mois'; $('c-rv').textContent = fmt(rv);
  }
  document.querySelectorAll('.e-seg').forEach(function (g) {
    g.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        g.querySelectorAll('button').forEach(function (x) { x.removeAttribute('aria-pressed'); });
        b.setAttribute('aria-pressed', 'true'); st[g.getAttribute('data-k')] = parseFloat(b.getAttribute('data-v')); draw();
      });
    });
  });
  if ($('c-amt')) { $('c-amt').addEventListener('input', draw); draw(); }
})();
