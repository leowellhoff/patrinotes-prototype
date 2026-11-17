/* Panneau latéral « Signaler une alerte » : <dialog> natif (focus piégé, Échap, fond inerte)
   habillé avec les classes de la modale DSFR ; glisse de droite à gauche. Sans dépendance (RGESN). */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('[data-drawer-open]'), function (btn) {
    var dlg = document.getElementById(btn.getAttribute('data-drawer-open'));
    if (!dlg || typeof dlg.showModal !== 'function') return;

    function open() {
      dlg.showModal();
      document.documentElement.style.overflow = 'hidden';
      var focusFirst = function () { var f = dlg.querySelector('[data-drawer-close]'); if (f) f.focus(); };
      if (reduce) { dlg.classList.add('fr-modal--opened'); focusFirst(); }
      else requestAnimationFrame(function () { requestAnimationFrame(function () { dlg.classList.add('fr-modal--opened'); focusFirst(); }); });
    }
    function close() {
      if (!dlg.open) return;
      dlg.classList.remove('fr-modal--opened');
      var done = function () { dlg.close(); document.documentElement.style.overflow = ''; btn.focus(); };
      if (reduce) done(); else setTimeout(done, 300);
    }
    btn.addEventListener('click', open);
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });   /* Échap */
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-drawer-close]')) close();       /* Fermer, Valider, fond */
    });
  });
})();
