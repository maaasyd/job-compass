/* Stage 1, step 2: the fair quiz.
   Every kind of work is offered equally often, and every pair meets equally often
   (scripts/check_quiz.py makes sure). Ranking is "picked X of the Y times it was offered". */
(function () {
  'use strict';
  var t = JC.t, h = JC.h, D = JC.DATA;
  var DIRS = {}, ORDER = D.directions.map(function (d) { DIRS[d.id] = d; return d.id; });
  var Q = D.questions;

  function fresh() { return { answers: Q.map(function () { return null; }), pos: 0, feel: null }; }
  function valid(s) {
    if (!s || !Array.isArray(s.answers) || s.answers.length !== Q.length) return false;
    if (typeof s.pos !== 'number' || s.pos < 0 || s.pos > Q.length || s.pos % 1 !== 0) return false;
    if (!(s.feel === null || s.feel === 'yes' || s.feel === 'partly' || s.feel === 'no')) return false;
    return s.answers.every(function (a, i) {
      return a === null || a === 'skip' || Q[i].options.some(function (o) { return o[0] === a; });
    });
  }
  var store = JC.store('quiz', valid);
  var state = fresh();
  var app, lock = false, reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function score(answers) {
    var picked = {}, offered = {};
    ORDER.forEach(function (k) { picked[k] = 0; offered[k] = 0; });
    answers.forEach(function (a, i) {
      if (a === null || a === 'skip') return;
      Q[i].options.forEach(function (o) { offered[o[0]]++; });
      picked[a]++;
    });
    return ORDER.map(function (k, idx) {
      return { key: k, picked: picked[k], offered: offered[k], ratio: offered[k] ? picked[k] / offered[k] : 0, idx: idx };
    }).sort(function (a, b) { return b.ratio - a.ratio || b.picked - a.picked || a.idx - b.idx; });
  }
  function answeredCount() { return state.answers.filter(function (a) { return a !== null && a !== 'skip'; }).length; }

  function go(pos) {
    state.pos = pos;
    render();
    JC.focusTitle();
  }
  function render() {
    app.textContent = '';
    if (state.pos >= Q.length) renderResults(); else renderQuestion();
    store.save(state);
  }

  function renderQuestion() {
    var i = state.pos, q = Q[i], a = state.answers[i];
    // Rotate where options appear so no kind of work always sits on top.
    var r = (i * 3 + 1) % q.options.length;
    var opts = q.options.slice(r).concat(q.options.slice(0, r));

    app.append(h('header', { class: 'stack' },
      h('p', { class: 'eyebrow', text: t('quiz.eyebrow') }),
      h('h1', { text: t('quiz.title') }),
      i === 0 && h('p', { class: 'lede', text: t('quiz.lede', { n: Q.length, mins: Math.max(3, Math.round(Q.length / 3)) }) })));

    app.append(JC.trail(t('quiz.count', { i: i + 1, total: Q.length }), Q.length, i, function (n) {
      var x = state.answers[n];
      return x === 'skip' ? 'skip' : (x !== null ? 'done' : '');
    }));

    var list = h('div', { class: 'opts' });
    opts.forEach(function (o) {
      list.append(h('button', {
        type: 'button', class: 'opt', id: 'opt-' + i + '-' + o[0],
        'aria-pressed': a === o[0] ? 'true' : 'false',
        onclick: function () { choose(i, o[0], list); }
      }, h('span', { class: 'dot', 'aria-hidden': 'true' }), h('span', { class: 'txt', text: o[1] })));
    });
    app.append(h('section', { class: 'stack' },
      h('h2', { id: 'focus-title', tabindex: '-1', text: q.q }),
      q.hint && h('p', { class: 'hint', text: q.hint }),
      list));

    var answered = a !== null && a !== 'skip';
    app.append(h('div', { class: 'row' },
      h('button', { type: 'button', class: 'btn quiet', id: 'btn-back', disabled: i === 0, onclick: function () { if (!lock) go(i - 1); } }, t('common.back')),
      h('button', { type: 'button', class: 'btn quiet', id: 'btn-next', onclick: function () {
        if (lock) return;
        if (!answered) state.answers[i] = 'skip';
        go(i + 1);
      } }, answered ? t('common.next') : t('quiz.skip'))));
  }

  function choose(i, key, list) {
    if (lock) return;
    lock = true;
    state.answers[i] = key;
    Array.prototype.forEach.call(list.children, function (b) {
      b.setAttribute('aria-pressed', b.id === 'opt-' + i + '-' + key ? 'true' : 'false');
    });
    store.save(state);
    setTimeout(function () { lock = false; go(i + 1); }, reduced ? 0 : 240);
  }

  function resultText(rows) {
    var skipped = Q.length - answeredCount();
    var lines = JC.header(t('quiz.copyName'));
    lines.push('');
    rows.forEach(function (r, n) {
      lines.push((n + 1) + '. ' + DIRS[r.key].name + ': ' + (r.offered ? t('quiz.copyPicked', { picked: r.picked, offered: r.offered }) : t('quiz.notRated')));
    });
    if (skipped) lines.push(t('quiz.copySkipped', { n: skipped }));
    lines.push('');
    lines.push(t('quiz.feelQuestion') + ' ' + (state.feel ? t('quiz.feel.' + state.feel) : t('quiz.copyNoAnswer')));
    return lines.join('\n');
  }

  function block(label, node) { return h('div', null, h('p', { class: 'lab', text: label }), node); }

  function renderResults() {
    var rows = score(state.answers);
    var answered = answeredCount();

    app.append(h('header', { class: 'stack' },
      h('p', { class: 'eyebrow', text: t('quiz.eyebrow') }),
      h('h1', { id: 'focus-title', tabindex: '-1', text: t('quiz.resultsTitle') }),
      h('p', { class: 'lede', text: t('quiz.resultsLede') })));

    if (answered === 0) app.append(h('p', { class: 'note', text: t('quiz.noneAnswered') }));
    else if (answered < Math.ceil(Q.length / 2)) app.append(h('p', { class: 'note', text: t('quiz.fewAnswered', { n: answered, total: Q.length }) }));
    else if (rows[1] && rows[1].picked > 0 && rows[0].ratio - rows[1].ratio <= 0.13) app.append(h('p', { class: 'note', text: t('quiz.closeTop') }));

    var list = h('div', { class: 'dirs' });
    rows.forEach(function (r, n) {
      var d = DIRS[r.key];
      var isTop = n === 0 && r.picked > 0;
      var chips = h('ul', { class: 'chips' });
      (d.titles || []).forEach(function (x) { chips.append(h('li', { text: x })); });
      list.append(h('details', { class: 'dir' + (isTop ? ' top' : ''), id: 'dir-' + r.key, open: answered > 0 && n < 3 && r.picked > 0 },
        h('summary', null,
          h('span', { class: 'name' }, isTop && h('span', { class: 'badge', text: t('quiz.mostPicked') }), isTop && h('br'), d.name),
          h('span', { class: 'score', text: r.offered ? t('quiz.score', { picked: r.picked, offered: r.offered }) : t('quiz.notRated') }),
          h('span', { class: 'chev', 'aria-hidden': 'true' }),
          h('span', { class: 'bar', 'aria-hidden': 'true' }, h('i', { style: 'width:' + Math.round(r.ratio * 100) + '%' }))),
        h('div', { class: 'body' },
          block(t('quiz.labDay'), h('p', { text: d.day })),
          block(t('quiz.labTitles'), h('div', null, chips, d.where && h('p', { class: 'where', text: d.where }))),
          d.bring && block(t('quiz.labBring'), h('p', { text: d.bring })),
          d.know && block(t('quiz.labKnow'), h('p', { text: d.know })))));
    });
    app.append(list);

    // "None of these feels right" is a real answer, not a failure.
    var feelNote = h('p', { class: 'note', hidden: state.feel !== 'no', text: t('quiz.feelNoNote') });
    var feel = h('div', { class: 'react' });
    ['yes', 'partly', 'no'].forEach(function (k) {
      feel.append(h('button', { type: 'button', class: 'btn quiet', id: 'feel-' + k, 'aria-pressed': state.feel === k ? 'true' : 'false',
        onclick: function () {
          state.feel = state.feel === k ? null : k;
          Array.prototype.forEach.call(feel.children, function (c) { c.setAttribute('aria-pressed', c.id === 'feel-' + state.feel ? 'true' : 'false'); });
          feelNote.hidden = state.feel !== 'no';
          store.save(state);
        } }, t('quiz.feel.' + k)));
    });
    app.append(JC.section(t('quiz.feelQuestion'), t('quiz.feelHint'), feel, feelNote));

    app.append(JC.copyPanel({
      copyLabel: t('quiz.copy'),
      getText: function () { return resultText(score(state.answers)); },
      reviewLabel: t('quiz.review'),
      onReview: function () { go(0); },
      resetQuestion: t('quiz.resetQuestion', { n: Q.length }),
      onReset: function () { state = fresh(); store.clear(); go(0); }
    }));
    app.append(h('p', { class: 'fine', text: t('quiz.footer', { n: Q.length }) }));
  }

  JC.boot(function (root, saved) {
    app = root;
    var s = valid(saved) ? saved : store.load();
    if (s) state = { answers: s.answers.slice(), pos: s.pos, feel: s.feel };
    render();
  });
})();
