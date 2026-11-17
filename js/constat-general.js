/* Constat général : chaque préconisation cochée affiche son champ « Commentaires » juste dessous ; décochée, il disparaît. */
(function () {
  'use strict';
  var boxes = document.querySelectorAll('input[name="preconisations"]');
  Array.prototype.forEach.call(boxes, function (box) {
    var zone = document.getElementById(box.getAttribute('aria-controls'));
    if (!zone) return;
    function sync() {
      zone.hidden = !box.checked;
      Array.prototype.forEach.call(zone.querySelectorAll('textarea, button'), function (el) { el.disabled = !box.checked; });
      box.setAttribute('aria-expanded', box.checked ? 'true' : 'false');
    }
    box.addEventListener('change', sync);
    sync();
  });
})();

/* Infobulle DSFR (classes fr-tooltip) sans le JS DSFR : survol, focus ou clic ; Échap / clic ailleurs pour fermer. */
(function () {
  'use strict';
  var btn = document.querySelector('[data-tooltip-btn]');
  if (!btn) return;
  var tip = document.getElementById(btn.getAttribute('aria-describedby'));
  var wrap = tip.parentNode;
  var pinned = false;

  function place() {
    var w = wrap.getBoundingClientRect(), b = btn.getBoundingClientRect(), tw = tip.offsetWidth;
    var center = b.left - w.left + b.width / 2;
    var left = Math.max(0, Math.min(center - tw / 2, w.width - tw));
    tip.style.left = left + 'px';
    tip.style.top = 'auto';
    tip.style.bottom = (w.bottom - b.top) + 'px';
    tip.style.setProperty('--arrow-x', (center - left - tw / 2) + 'px');
  }
  function show() { tip.classList.add('fr-tooltip--shown'); tip.removeAttribute('aria-hidden'); place(); }
  function hide() { if (pinned) return; tip.classList.remove('fr-tooltip--shown'); tip.setAttribute('aria-hidden', 'true'); }
  function close() { pinned = false; hide(); }

  btn.addEventListener('mouseenter', show);
  btn.addEventListener('mouseleave', hide);
  btn.addEventListener('focus', show);
  btn.addEventListener('blur', hide);
  btn.addEventListener('click', function () { pinned = !pinned; pinned ? show() : close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.addEventListener('click', function (e) { if (e.target !== btn && !btn.contains(e.target)) close(); });
  window.addEventListener('resize', function () { if (tip.classList.contains('fr-tooltip--shown')) place(); });
})();
