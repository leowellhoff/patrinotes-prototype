/* Autocomplétion « Rechercher un monument historique » — ARIA 1.2 combobox + onglets Édifices / Mobiliers.
   Client-side, sans réseau (RGESN). Seuil : 3 caractères. */
(function () {
  'use strict';
  var MIN = 3;
  var data = window.PATRINOTES_DATA;
  var input = document.getElementById('monument-search');
  var popup = document.getElementById('monument-popup');
  var status = document.getElementById('monument-status');
  var tabs = Array.prototype.slice.call(popup.querySelectorAll('[role="tab"]'));
  var lists = { edifices: document.getElementById('list-edifices'), mobiliers: document.getElementById('list-mobiliers') };
  var panels = { edifices: document.getElementById('panel-edifices'), mobiliers: document.getElementById('panel-mobiliers') };
  var current = 'edifices', activeIdx = -1, counts = { edifices: 0, mobiliers: 0 };

  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function words(s) { return norm(s).split(/[^a-z0-9]+/).filter(Boolean); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* Surbrillance = texte saisi : tout mot du titre commençant par un terme saisi est mis en gras
     (sur la longueur du terme), comme dans la maquette. */
  function longest(wordNorm, tokens) {
    var n = 0;
    tokens.forEach(function (t) { if (wordNorm.indexOf(t) === 0 && t.length > n) n = t.length; });
    return n;
  }
  function highlight(title, tokens) {
    var out = '', re = /([A-Za-zÀ-ÿ0-9]+)|([^A-Za-zÀ-ÿ0-9]+)/g, m;
    while ((m = re.exec(title))) {
      if (m[2]) { out += esc(m[2]); continue; }
      var w = m[1], n = longest(norm(w), tokens);
      out += n ? '<strong>' + esc(w.slice(0, n)) + '</strong>' + esc(w.slice(n)) : esc(w);
    }
    return out;
  }

  /* Score = nombre de termes retrouvés (préfixe d'un mot) ; on tolère un terme manquant. */
  function search(items, tokens) {
    var need = Math.max(1, tokens.length - 1);
    return items.map(function (it) {
      var ws = words(it.t);
      var score = tokens.filter(function (t) { return ws.some(function (w) { return w.indexOf(t) === 0; }); }).length;
      return { it: it, s: score };
    }).filter(function (r) { return r.s >= need; })
      .sort(function (a, b) { return b.s - a.s; });
  }

  function render(key, results, tokens) {
    var ul = lists[key];
    if (!results.length) {
      ul.innerHTML = '<li class="pn-empty" role="presentation">Aucun résultat dans cette base.</li>';
      return;
    }
    ul.innerHTML = results.map(function (r, i) {
      return '<li role="option" id="opt-' + key + '-' + i + '" class="pn-option" aria-selected="false" data-i="' + i + '"' + (r.it.go ? ' data-go="' + esc(r.it.go) + '"' : '') + '>' +
        '<span class="pn-option__title">' + highlight(r.it.t, tokens) + '</span>' +
        '<span class="pn-option__loc fr-text--sm">' + esc(r.it.l) + '</span></li>';
    }).join('');
  }

  function setActive(i) {
    var opts = lists[current].querySelectorAll('[role="option"]');
    Array.prototype.forEach.call(opts, function (o) { o.setAttribute('aria-selected', 'false'); });
    activeIdx = i;
    if (i >= 0 && opts[i]) {
      opts[i].setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', opts[i].id);
      opts[i].scrollIntoView({ block: 'nearest' });
    } else { input.removeAttribute('aria-activedescendant'); }
  }

  function selectTab(key, focus) {
    current = key;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-key') === key;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panels[t.getAttribute('data-key')].classList.toggle('fr-tabs__panel--selected', on);
      if (on && focus) t.focus();
    });
    input.setAttribute('aria-controls', lists[key].id);
    setActive(-1);
  }

  function open() { popup.hidden = false; input.setAttribute('aria-expanded', 'true'); }
  function close(clear) {
    popup.hidden = true; input.setAttribute('aria-expanded', 'false');
    setActive(-1); if (clear) status.textContent = '';
  }

  function update() {
    var v = input.value.trim();
    if (v.length < MIN) { close(true); return; }
    var tokens = words(v);
    ['edifices', 'mobiliers'].forEach(function (k) {
      var res = search(data[k], tokens); counts[k] = res.length; render(k, res, tokens);
      document.getElementById('count-' + k).textContent = res.length;
    });
    /* Si l'onglet courant est vide mais pas l'autre, on bascule sur l'autre. */
    if (!counts[current] && counts[current === 'edifices' ? 'mobiliers' : 'edifices']) {
      selectTab(current === 'edifices' ? 'mobiliers' : 'edifices');
    }
    setActive(-1); open();
    status.textContent = counts.edifices + ' édifice(s) et ' + counts.mobiliers + ' mobilier(s) trouvés.';
  }

  function choose(opt) {
    var title = opt.querySelector('.pn-option__title').textContent;
    if (opt.getAttribute('data-go')) { window.location.href = opt.getAttribute('data-go'); return; }
    input.value = title; close(true); input.focus();
  }

  input.addEventListener('input', update);
  input.addEventListener('focus', function () { if (input.value.trim().length >= MIN) update(); });
  input.addEventListener('keydown', function (e) {
    var opts = lists[current].querySelectorAll('[role="option"]'), n = opts.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); if (popup.hidden) update(); else if (n) setActive((activeIdx + 1) % n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (n) setActive(activeIdx <= 0 ? n - 1 : activeIdx - 1); }
    else if (e.key === 'Enter') { if (!popup.hidden && activeIdx >= 0) { e.preventDefault(); choose(opts[activeIdx]); } }
    else if (e.key === 'Escape') { if (!popup.hidden) { e.preventDefault(); close(true); } }
  });

  /* Onglets : clic + flèches gauche/droite (motif ARIA tabs) */
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t.getAttribute('data-key')); });
    t.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : -1;
      if (e.key === 'Home') j = 0; if (e.key === 'End') j = tabs.length - 1;
      if (j >= 0) { e.preventDefault(); selectTab(tabs[j].getAttribute('data-key'), true); }
      else if (e.key === 'Escape') { close(true); input.focus(); }
    });
  });

  popup.addEventListener('mousedown', function (e) { if (e.target.closest('[role="option"]')) e.preventDefault(); });
  popup.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (o) choose(o); });
  popup.addEventListener('mousemove', function (e) {
    var o = e.target.closest('[role="option"]'); if (o) setActive(+o.getAttribute('data-i'));
  });
  document.addEventListener('click', function (e) {
    if (!popup.hidden && !e.target.closest('.pn-combobox')) close(true);
  });
  document.addEventListener('focusin', function (e) {
    if (!popup.hidden && !e.target.closest('.pn-combobox')) close(true);
  });

  selectTab('edifices');
})();
