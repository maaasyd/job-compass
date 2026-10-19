/* Job Compass shared page code.
   Every page gets: window.JC_DATA (the content Claude wrote), window.JC_STRINGS (page text),
   and this file. The page template then calls JC.boot(start). Nothing here talks to a server;
   progress stays in this browser's storage. */
var JC = (function () {
  'use strict';

  var DATA = window.JC_DATA || {};
  var S = window.JC_STRINGS || {};

  // ---- text -------------------------------------------------------------
  function lookup(key) {
    var parts = key.split('.'), v = S;
    for (var i = 0; i < parts.length; i++) {
      if (v == null || typeof v !== 'object') return null;
      v = v[parts[i]];
    }
    return v;
  }
  // t('quiz.count', {n: 3, total: 14}). Values may be {one, other} for plurals.
  function t(key, vars) {
    var v = lookup(key);
    if (v == null) { try { console.warn('Missing text: ' + key); } catch (e) {} return key; }
    if (typeof v === 'object' && !Array.isArray(v)) v = (vars && vars.n === 1) ? v.one : v.other;
    if (Array.isArray(v)) return v;
    return String(v).replace(/\{(\w+)\}/g, function (m, k) {
      return vars && vars[k] != null ? String(vars[k]) : m;
    });
  }

  // Quotation marks come from the page text, so a translation can use its own („…“ in German).
  function q(s) { return t('common.quoteOpen') + s + t('common.quoteClose'); }

  function niceDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T12:00:00Z');
    if (isNaN(d)) return iso;
    try {
      return d.toLocaleDateString(t('meta.locale'), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    } catch (e) { return iso; }
  }

  // ---- DOM --------------------------------------------------------------
  function h(tag, props) {
    var n = document.createElement(tag), k, v, i, c;
    if (props) for (k in props) {
      v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'style') n.setAttribute('style', v);
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (i = 2; i < arguments.length; i++) {
      c = arguments[i];
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x != null && x !== false) n.append(x); });
      else n.append(c);
    }
    return n;
  }

  function section(title, hint) {
    var s = h('section', { class: 'stack' }, h('h2', null, h('span', { text: title })), hint && h('p', { class: 'hint', text: hint }));
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) s.append(arguments[i]);
    return s;
  }

  function step(num, title, hint) {
    var s = h('section', { class: 'stack' },
      h('h2', null, num && h('span', { class: 'num', 'aria-hidden': 'true', text: String(num) }), h('span', { text: title })),
      hint && h('p', { class: 'hint', text: hint }));
    for (var i = 3; i < arguments.length; i++) if (arguments[i]) s.append(arguments[i]);
    return s;
  }

  function focusTitle(scroll) {
    if (scroll !== false) window.scrollTo(0, 0);
    var el = document.getElementById('focus-title');
    if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  }

  // ---- storage ----------------------------------------------------------
  // Each built page has its own pageId, so two people's pages on one device never mix.
  function store(name, valid) {
    var key = 'job-compass:' + name + ':' + (DATA.pageId || 'page');
    return {
      load: function () {
        try { var s = JSON.parse(localStorage.getItem(key) || 'null'); return valid(s) ? s : null; } catch (e) { return null; }
      },
      save: function (state) { try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {} },
      clear: function () { try { localStorage.removeItem(key); } catch (e) {} }
    };
  }

  function isIndexList(l, max) {
    return Array.isArray(l) && l.every(function (n, i) { return typeof n === 'number' && n % 1 === 0 && n >= 0 && n < max && l.indexOf(n) === i; });
  }

  // ---- pieces -----------------------------------------------------------
  function trail(label, total, current, stateOf) {
    var bar = h('div', { class: 'trail', role: 'img', 'aria-label': label, style: 'grid-template-columns:repeat(' + total + ',1fr)' });
    for (var n = 0; n < total; n++) {
      var st = n === current ? 'now' : stateOf(n);
      bar.append(h('span', { class: 'seg' + (st ? ' ' + st : '') }));
    }
    return h('div', { class: 'stack' }, h('p', { class: 'count', text: label }), bar);
  }

  // Up to `max` picks from a list of task texts. selected is an array of indexes, changed in place.
  function picker(idPrefix, texts, selected, max, onChange) {
    var list = h('div', { class: 'tasks' });
    var status = h('p', { class: 'hint', role: 'status' });
    var buttons = [];
    function paint() {
      var full = selected.length >= max;
      buttons.forEach(function (b, n) {
        var on = selected.indexOf(n) !== -1;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (full && !on) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      });
      status.textContent = full ? t('common.pickFull', { max: max }) : '';
    }
    texts.forEach(function (txt, n) {
      var b = h('button', { type: 'button', class: 'task', id: idPrefix + '-' + n, onclick: function () {
        var at = selected.indexOf(n);
        if (at !== -1) selected.splice(at, 1);
        else if (selected.length < max) selected.push(n);
        else return;
        paint();
        onChange();
      } }, h('span', { class: 'box', 'aria-hidden': 'true' }), h('span', { class: 'txt', text: txt }));
      buttons.push(b);
      list.append(b);
    });
    paint();
    return h('div', { class: 'stack' }, list, status);
  }

  // Three buttons: I'd like this / Not sure / No thanks. Tapping the chosen one again clears it.
  function reactions(idPrefix, current, onChange) {
    var box = h('div', { class: 'react' });
    var opts = ['yes', 'maybe', 'no'];
    opts.forEach(function (k) {
      box.append(h('button', { type: 'button', class: 'btn quiet', id: idPrefix + '-' + k,
        'aria-pressed': current() === k ? 'true' : 'false',
        onclick: function () {
          var next = current() === k ? null : k;
          onChange(next);
          Array.prototype.forEach.call(box.children, function (c) {
            c.setAttribute('aria-pressed', c.id === idPrefix + '-' + next ? 'true' : 'false');
          });
        } }, t('common.react.' + k)));
    });
    return box;
  }

  // Copy button with a manual fallback, plus "look again" and "start again" with a confirm step.
  function copyPanel(o) {
    var status = h('p', { class: 'fine', id: 'copy-status', role: 'status' });
    var fallback = h('textarea', { id: 'copy-fallback', readonly: true, hidden: true, 'aria-label': t('common.copyFallbackLabel') });
    var confirmRow = h('div', { class: 'row start', id: 'reset-confirm', hidden: true },
      h('span', { text: o.resetQuestion }),
      h('button', { type: 'button', class: 'btn', id: 'btn-reset-yes', onclick: o.onReset }, t('common.resetYes')),
      h('button', { type: 'button', class: 'btn quiet', id: 'btn-reset-no', onclick: function () { confirmRow.hidden = true; } }, t('common.resetNo')));
    function copy() {
      var text = o.getText();
      function manual() {
        fallback.hidden = false;
        fallback.value = text;
        fallback.focus();
        fallback.select();
        status.textContent = t('common.copyBlocked');
      }
      try {
        navigator.clipboard.writeText(text).then(function () {
          status.textContent = t('common.copied');
          fallback.value = text;
        }, manual);
      } catch (e) { manual(); }
    }
    return h('div', { class: 'stack' },
      h('div', { class: 'row start' },
        h('button', { type: 'button', class: 'btn', id: 'btn-copy', onclick: copy }, o.copyLabel),
        o.reviewLabel && h('button', { type: 'button', class: 'btn quiet', id: 'btn-review', onclick: o.onReview }, o.reviewLabel),
        h('button', { type: 'button', class: 'btn quiet', id: 'btn-reset', onclick: function () { confirmRow.hidden = false; } }, t('common.startAgain'))),
      confirmRow, status, fallback);
  }

  function bars(rows) {
    // rows: [{label, n}] already sorted. Only used for counts of the person's own picks.
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; }).concat([1]));
    var box = h('div', { class: 'kinds' });
    rows.forEach(function (r) {
      box.append(h('div', { class: 'kind' },
        h('span', { text: r.label }),
        h('span', { class: 'n', text: r.count }),
        h('span', { class: 'bar', 'aria-hidden': 'true' }, h('i', { style: 'width:' + Math.round(r.n / max * 100) + '%' }))));
    });
    return box;
  }

  function header(lines) {
    // First line of every copied text names the page, so Claude knows what it is reading.
    return [t('common.copyHeader', { page: lines })];
  }

  // ---- start --------------------------------------------------------------
  function boot(start) {
    var app = document.getElementById('app');
    try { document.documentElement.lang = t('meta.lang'); } catch (e) {}
    if (DATA.title) document.title = DATA.title;
    var hot = window.claude && window.claude.hot;
    function go(saved) {
      app.textContent = '';
      start(app, saved || null);
    }
    try {
      if (hot && hot.ready) { hot.ready(go); return; }
    } catch (e) {}
    go((hot && hot.data) || null);
  }

  return {
    DATA: DATA, t: t, q: q, get: lookup, h: h, section: section, step: step, focusTitle: focusTitle, store: store,
    isIndexList: isIndexList, trail: trail, picker: picker, reactions: reactions, copyPanel: copyPanel,
    bars: bars, header: header, niceDate: niceDate, boot: boot
  };
})();
