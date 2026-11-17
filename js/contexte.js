/* Page « Contexte de la visite » : le champ « Destination de l’objet » n’apparaît que si « Déplacement de l’objet » est coché */
(function () {
  'use strict';
  var radios = document.querySelectorAll('input[name="objectif"]');
  var group = document.getElementById('groupe-destination');
  var field = document.getElementById('destination');
  if (!radios.length || !group || !field) return;

  function sync() {
    var show = document.getElementById('objectif-3').checked;
    group.hidden = !show;
    field.disabled = !show;   /* champ masqué = non envoyé, non focalisable */
  }
  Array.prototype.forEach.call(radios, function (r) { r.addEventListener('change', sync); });
  sync();
})();
