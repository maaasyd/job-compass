/* Stage 1, step 1: kinds of work to keep or cross out.
   The person sees 8 to 10 kinds of work, each as one sentence about a normal day,
   and crosses out the ones that feel wrong. The quiz is then written for the ones they keep. */
(function () {
  'use strict';
  var t = JC.t, h = JC.h, D = JC.DATA;
  var C = D.candidates;
  var MIN = (D.keep && D.keep.min) || 5, MAX = (D.keep && D.keep.max) || 7;
  var ids = C.map(function (c) { return c.id; });

  function fresh() { return { out: [], note: '' }; }
  function valid(s) {
    return !!s && Array.isArray(s.out) && s.out.every(function (id) { return ids.indexOf(id) !== -1; }) && typeof s.note === 'string';
  }
  var store = JC.store('pick', valid);
  var state = fresh();
  var app;

  function kept() { return C.filter(function (c) { return state.out.indexOf(c.id) === -1; }); }
  function crossed() { return C.filter(function (c) { return state.out.indexOf(c.id) !== -1; }); }

  function guidance() {
    var n = kept().length;
    if (n > MAX) return t('pick.tooMany', { n: n - MAX, max: MAX });
    if (n < MIN) return t('pick.tooFew', { min: MIN });
    return t('pick.fine');
  }

  function text() {
    var lines = JC.header(t('pick.copyName'));
    var k = kept(), x = crossed();
    lines.push('');
    lines.push(t('pick.copyKept', { n: k.length }));
    k.forEach(function (c) { lines.push('- ' + c.name); });
    lines.push('');
    lines.push(t('pick.copyOut', { n: x.length }));
    if (!x.length) lines.push('- ' + t('pick.copyNone'));
    x.forEach(function (c) { lines.push('- ' + c.name); });
    if (state.note.trim()) { lines.push(''); lines.push(t('pick.copyNote')); lines.push(state.note.trim()); }
    return lines.join('\n');
  }

  function render() {
    app.textContent = '';
    app.append(h('header', { class: 'stack' },
      h('p', { class: 'eyebrow', text: t('pick.eyebrow') }),
      h('h1', { id: 'focus-title', tabindex: '-1', text: t('pick.title') }),
      h('p', { class: 'lede', text: t('pick.lede', { n: C.length, min: MIN, max: MAX }) })));

    var tally = h('p', { class: 'tally', role: 'status' });
    var guide = h('p', { class: 'note' });
    function paintTally() {
      tally.textContent = t('pick.tally', { n: kept().length, total: C.length });
      guide.textContent = guidance();
    }

    var list = h('div', { class: 'cands' });
    C.forEach(function (c) {
      var card = h('div', { class: 'cand' + (state.out.indexOf(c.id) !== -1 ? ' out' : ''), id: 'cand-' + c.id });
      var btn = h('button', { type: 'button', class: 'btn quiet small', id: 'toggle-' + c.id });
      function paint() {
        var isOut = state.out.indexOf(c.id) !== -1;
        card.className = 'cand' + (isOut ? ' out' : '');
        btn.textContent = isOut ? t('pick.bringBack') : t('pick.crossOut');
        btn.setAttribute('aria-pressed', isOut ? 'true' : 'false');
        btn.setAttribute('aria-label', (isOut ? t('pick.bringBack') : t('pick.crossOut')) + ': ' + c.name);
      }
      btn.addEventListener('click', function () {
        var at = state.out.indexOf(c.id);
        if (at === -1) state.out.push(c.id); else state.out.splice(at, 1);
        paint(); paintTally(); store.save(state);
      });
      paint();
      card.append(h('p', { class: 'name', text: c.name }), h('p', { class: 'day', text: c.day }), h('div', { class: 'row' }, btn));
      list.append(card);
    });
    app.append(list);
    paintTally();
    app.append(h('div', { class: 'stack' }, tally, guide));

    var note = h('textarea', { class: 'free', id: 'note', 'aria-label': t('pick.noteLabel') });
    note.value = state.note;
    note.addEventListener('input', function () { state.note = note.value; store.save(state); });
    app.append(JC.section(t('pick.noteTitle'), t('pick.noteHint'), note));

    app.append(JC.copyPanel({
      copyLabel: t('pick.copy'),
      getText: text,
      resetQuestion: t('pick.resetQuestion'),
      onReset: function () { state = fresh(); store.clear(); render(); JC.focusTitle(); }
    }));
    app.append(h('p', { class: 'fine', text: t('pick.footer') }));
  }

  JC.boot(function (root, saved) {
    app = root;
    var s = valid(saved) ? saved : store.load();
    if (s) state = { out: s.out.slice(), note: s.note };
    render();
  });
})();
