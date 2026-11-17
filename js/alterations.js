/* Modales du constat détaillé : altérations dupliquables, accordéons, tags, « Effacer les informations ».
   Aucune dépendance. Données : js/alterations-data.js */
(function () {
  'use strict';
  var data = window.PATRINOTES_ALTERATIONS;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  function altHtml(prefix, n) {
    var id = prefix + '-alt' + n;
    var options = data.materiaux.map(function (m) { return '<option value="' + esc(m) + '">' + esc(m) + '</option>'; }).join('');
    var acc = data.familles.map(function (f, i) {
      var cid = id + '-fam' + i;
      var tags = f.tags.map(function (t) {
        return '<li><button type="button" class="fr-tag" aria-pressed="false">' + esc(t) + '</button></li>';
      }).join('');
      return '<li><section class="fr-accordion">' +
        '<h3 class="fr-accordion__title"><button type="button" class="fr-accordion__btn" aria-expanded="false" aria-controls="' + cid + '">' + esc(f.titre) + '</button></h3>' +
        '<div class="fr-collapse" id="' + cid + '"><ul class="fr-tags-group" aria-label="Altérations : ' + esc(f.titre) + '">' + tags + '</ul></div>' +
        '</section></li>';
    }).join('');
    return '<div class="pn-alteration" data-alteration>' +
      '<div class="fr-select-group fr-mb-3w">' +
        '<label class="fr-label" for="' + id + '-materiau">Matériau ou technique altéré(e)</label>' +
        '<select class="fr-select" id="' + id + '-materiau" name="' + id + '-materiau"><option value="" selected disabled hidden>Sélectionner une option</option>' + options + '<option value="autre">Autre (préciser)...</option></select>' +
      '</div>' +
      '<div class="fr-input-group fr-mb-3w" data-autre hidden><label class="fr-label" for="' + id + '-autre">Préciser Matériau ou technique altéré(e)</label><input class="fr-input" type="text" id="' + id + '-autre" name="' + id + '-autre" disabled></div>' +
      '<ul class="pn-accordions">' + acc + '</ul>' +
      '<div class="fr-input-group fr-mt-3w">' +
        '<div class="fr-grid-row fr-grid-row--middle">' +
          '<div class="fr-col"><label class="fr-label" for="' + id + '-commentaires">Commentaires<span class="fr-hint-text">Description, incidences sur d’autres éléments, causes probables...</span></label></div>' +
          '<div class="fr-col-auto"><button type="button" class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-left fr-icon-mic-fill">Dicter</button></div>' +
        '</div>' +
        '<textarea class="fr-input" id="' + id + '-commentaires" name="' + id + '-commentaires" rows="4"></textarea>' +
      '</div>' +
    '</div>';
  }

  function setup(dlg) {
    var list = dlg.querySelector('[data-alterations]');
    var addBtn = dlg.querySelector('[data-add-alteration]');
    var reset = dlg.querySelector('[data-reset]');
    var form = dlg.querySelector('form');
    var count = 0;

    function addAlteration() {
      count += 1;
      var wrap = document.createElement('div');
      wrap.innerHTML = (count > 1 ? '<hr class="pn-sep pn-sep--tight">' : '') + altHtml(dlg.id, count);
      while (wrap.firstChild) list.appendChild(wrap.firstChild);
      return count;
    }
    function markDirty() { if (reset) reset.disabled = false; }

    if (list) addAlteration();
    if (addBtn) addBtn.addEventListener('click', function () {
      addAlteration(); markDirty();
      var sel = list.querySelector('[data-alteration]:last-of-type select');
      if (sel) sel.focus();
    });

    dlg.addEventListener('click', function (e) {
      var acc = e.target.closest('.fr-accordion__btn');
      if (acc) {
        var open = acc.getAttribute('aria-expanded') === 'true';
        acc.setAttribute('aria-expanded', String(!open));
        document.getElementById(acc.getAttribute('aria-controls')).classList.toggle('fr-collapse--expanded', !open);
        return;
      }
      var tag = e.target.closest('.fr-tag[aria-pressed]');
      if (tag) {
        tag.setAttribute('aria-pressed', tag.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        markDirty();
      }
    });
    /* « Autre (préciser)... » : champ de saisie simple sous le select */
    dlg.addEventListener('change', function (e) {
      if (!e.target.matches('select.fr-select')) return;
      var alt = e.target.closest('[data-alteration]');
      var group = alt && alt.querySelector('[data-autre]');
      if (!group) return;
      var show = e.target.value === 'autre';
      group.hidden = !show;
      group.querySelector('input').disabled = !show;
    });
    if (form) {
      form.addEventListener('input', markDirty);
      form.addEventListener('change', markDirty);
    }
    if (reset) reset.addEventListener('click', function () {
      if (form) form.reset();
      if (list) { list.innerHTML = ''; count = 0; addAlteration(); }
      reset.disabled = true;
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('dialog.pn-dialog'), setup);
})();
