/* Stage 2: three real ads, translated.
   Each job gets a plain title, a short picture, a week of tasks (pick up to three),
   a word list, and the requirements with must / wish marked and the signal word named. */
(function () {
  'use strict';
  var t = JC.t, h = JC.h, D = JC.DATA;
  var JOBS = D.jobs;
  var MAX = D.pickMax || 3;

  function fresh() {
    var s = { pos: 0, picks: {}, react: {} };
    JOBS.forEach(function (j) { s.picks[j.id] = []; s.react[j.id] = null; });
    return s;
  }
  function valid(s) {
    if (!s || typeof s.pos !== 'number' || s.pos % 1 !== 0 || s.pos < 0 || s.pos > JOBS.length) return false;
    if (!s.picks || !s.react) return false;
    return JOBS.every(function (j) {
      var r = s.react[j.id];
      return JC.isIndexList(s.picks[j.id], j.week.length) && s.picks[j.id].length <= MAX &&
        (r === null || r === 'yes' || r === 'maybe' || r === 'no');
    });
  }
  var store = JC.store('ads-translated', valid);
  var state = fresh();
  var app;

  function go(pos) { state.pos = pos; render(); JC.focusTitle(); }
  function render() {
    app.textContent = '';
    if (state.pos >= JOBS.length) renderSummary(); else renderJob();
    store.save(state);
  }

  function signalBox(open) {
    var list = h('div', { class: 'signals' });
    ['wish', 'must', 'small', 'neither'].forEach(function (k) {
      list.append(h('div', null, h('b', { text: t('signals.' + k + '.label') }), t('signals.' + k + '.words')));
    });
    return h('details', { class: 'signalbox', open: open },
      h('summary', null, h('b', { text: t('signals.title') })),
      h('p', { class: 'hint', text: t('signals.intro') }),
      list);
  }

  function renderJob() {
    var i = state.pos, job = JOBS[i];

    if (i === 0) {
      app.append(h('div', { class: 'rule' }, h('strong', { text: t('common.nobodyApplying') }), t('ads1.ruleText')));
    }
    app.append(JC.trail(t('common.jobCount', { i: i + 1, total: JOBS.length }), JOBS.length, i, function (n) {
      return state.react[JOBS[n].id] ? 'done' : '';
    }));

    var facts = h('ul', { class: 'facts' });
    job.facts.forEach(function (f) { facts.append(h('li', { text: f })); });
    if (job.unchecked) facts.append(h('li', { text: t('ads1.uncheckedChip') }));
    app.append(h('header', { class: 'stack' },
      h('p', { class: 'eyebrow', text: t('ads1.eyebrow') }),
      h('h1', { id: 'focus-title', tabindex: '-1', text: job.plain }),
      h('p', { class: 'called' }, t('ads1.calledPre'), h('b', { text: job.title }), t('ads1.calledPost', { employer: job.employer })),
      facts,
      h('p', { class: 'short', text: job.short })));

    app.append(JC.section(t('ads1.weekTitle'), t('common.pickHint', { max: MAX }),
      JC.picker('task-' + job.id, job.week.map(function (w) { return w[1]; }), state.picks[job.id], MAX, function () { store.save(state); })));

    if (job.words && job.words.length) {
      var words = h('dl', { class: 'words' });
      job.words.forEach(function (w) { words.append(h('div', null, h('dt', { text: w[0] }), h('dd', { text: w[1] }))); });
      app.append(JC.section(t('ads1.wordsTitle'), t('ads1.wordsHint'), words));
    }

    var asks = h('ul', { class: 'asks' });
    job.asks.forEach(function (a) {
      asks.append(h('li', { class: a.have ? 'have' : null },
        h('div', { class: 'row start' },
          h('span', { class: 'tag ' + a.tag, text: t('tags.' + a.tag) }),
          a.have && h('span', { class: 'tag have', text: t('tags.have') })),
        a.wrote ? h('p', { class: 'wrote', text: '“' + a.wrote + '”' }) : h('p', { text: a.text }),
        a.signal ? h('p', { class: 'signal' }, t('ads1.signalPre'), h('b', { text: '“' + a.signal + '”' })) : null,
        h('p', { class: 'why', text: a.why })));
    });
    app.append(JC.section(t('ads1.asksTitle'), t('ads1.asksHint'), signalBox(i === 0), asks));

    var know = h('ul', { class: 'know' });
    job.know.forEach(function (k) { know.append(h('li', { text: k })); });
    app.append(JC.section(t('ads1.knowTitle'), null, know,
      job.link && h('p', null, h('a', { href: job.link, target: '_blank', rel: 'noopener', text: t('ads1.readOriginal') }), t('ads1.readOriginalPost'))));

    app.append(h('hr'));
    app.append(JC.section(t('common.reactTitle'), t('common.reactHint'),
      JC.reactions('react-' + job.id, function () { return state.react[job.id]; }, function (v) { state.react[job.id] = v; store.save(state); })));

    app.append(h('div', { class: 'row' },
      h('button', { type: 'button', class: 'btn quiet', id: 'btn-back', disabled: i === 0, onclick: function () { go(i - 1); } }, t('common.back')),
      h('button', { type: 'button', class: 'btn', id: 'btn-next', onclick: function () { go(i + 1); } },
        i === JOBS.length - 1 ? t('common.seeWhatIThought') : t('common.nextJob'))));
  }

  function tally() {
    var counts = {}, picked = [], kinds = [];
    JOBS.forEach(function (j) {
      j.week.forEach(function (w) { if (kinds.indexOf(w[0]) === -1) kinds.push(w[0]); });
      state.picks[j.id].slice().sort(function (a, b) { return a - b; }).forEach(function (n) {
        counts[j.week[n][0]] = (counts[j.week[n][0]] || 0) + 1;
        picked.push(j.week[n][1]);
      });
    });
    return { counts: counts, picked: picked, kinds: kinds };
  }

  function resultText(tl) {
    var lines = JC.header(t('ads1.copyName'));
    lines.push('');
    JOBS.forEach(function (j, n) {
      lines.push((n + 1) + '. ' + j.title + ' (' + j.employer + '): ' + (state.react[j.id] ? t('common.react.' + state.react[j.id]) : t('common.noAnswer')));
    });
    lines.push('');
    lines.push(t('common.copyKinds'));
    tl.kinds.forEach(function (k) { lines.push('- ' + t('kinds.' + k) + ': ' + (tl.counts[k] || 0)); });
    if (tl.picked.length) {
      lines.push('');
      lines.push(t('common.copyPicked'));
      tl.picked.forEach(function (p) { lines.push('- ' + p); });
    }
    return lines.join('\n');
  }

  function renderSummary() {
    var tl = tally();
    var anyYes = JOBS.some(function (j) { return state.react[j.id] === 'yes'; });

    app.append(h('header', { class: 'stack' },
      h('p', { class: 'eyebrow', text: t('ads1.summaryEyebrow') }),
      h('h1', { id: 'focus-title', tabindex: '-1', text: t('common.whatYouThought') }),
      h('p', { class: 'lede', text: t('ads1.summaryLede', { n: JOBS.length }) })));


    var sum = h('ul', { class: 'sum' });
    JOBS.forEach(function (j) {
      var r = state.react[j.id];
      sum.append(h('li', { class: r === 'yes' ? 'yes' : null },
        h('span', { class: 'what', text: j.plain }),
        h('span', { class: 'said', text: r ? t('common.react.' + r) : t('common.noAnswerYet') })));
    });
    app.append(JC.section(t('ads1.summaryJobs', { n: JOBS.length }), null, sum));

    if (!tl.picked.length) {
      app.append(JC.section(t('common.kindsTitle'), null, h('p', { text: t('common.noPicks') })));
    } else {
      var rows = tl.kinds.map(function (k) { var n = tl.counts[k] || 0; return { label: t('kinds.' + k), n: n, count: t('common.tasksN', { n: n }) }; })
        .sort(function (a, b) { return b.n - a.n; });
      var picked = h('ul', { class: 'picked' });
      tl.picked.forEach(function (p) { picked.append(h('li', { text: p })); });
      app.append(JC.section(t('common.kindsTitle'), t('common.kindsHint'), JC.bars(rows)));
      app.append(JC.section(t('common.pickedTitle'), null, picked));
    }

    app.append(JC.section(t('common.nextStepTitle'), null, h('p', { text: anyYes ? t('ads1.nextYes') : t('ads1.nextNone') })));

    app.append(JC.copyPanel({
      copyLabel: t('common.copyWhatIThought'),
      getText: function () { return resultText(tally()); },
      reviewLabel: t('common.lookAgain'),
      onReview: function () { go(0); },
      resetQuestion: t('common.resetJobsQuestion'),
      onReset: function () { state = fresh(); store.clear(); go(0); }
    }));
    app.append(h('p', { class: 'fine', text: t('common.adsFooter', { date: JC.niceDate(D.checked) }) }));
  }

  JC.boot(function (root, saved) {
    app = root;
    var s = valid(saved) ? saved : store.load();
    if (s) state = JSON.parse(JSON.stringify(s));
    render();
  });
})();
