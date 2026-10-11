/* Stage 3: three new ads, with less help.
   Per job: 1 read the real ad, 2 open only the words you want explained,
   3 guess must or wish for three quoted lines, 4 picture the job, then compare with a plain version. */
(function () {
  'use strict';
  var t = JC.t, h = JC.h, D = JC.DATA;
  var JOBS = D.jobs;
  var MAX = D.pickMax || 3;
  var GUESS = ['must', 'wish', 'unsure'];

  function fresh() {
    var s = { pos: 0, open: {}, guess: {}, shown: {}, picks: {}, react: {} };
    JOBS.forEach(function (j) {
      s.open[j.id] = [];
      s.guess[j.id] = j.lines.map(function () { return null; });
      s.shown[j.id] = false;
      s.picks[j.id] = [];
      s.react[j.id] = null;
    });
    return s;
  }
  function valid(s) {
    if (!s || typeof s.pos !== 'number' || s.pos % 1 !== 0 || s.pos < 0 || s.pos > JOBS.length) return false;
    if (!s.open || !s.guess || !s.shown || !s.picks || !s.react) return false;
    return JOBS.every(function (j) {
      var g = s.guess[j.id], r = s.react[j.id];
      return JC.isIndexList(s.open[j.id], j.words.length) && JC.isIndexList(s.picks[j.id], j.week.length) &&
        s.picks[j.id].length <= MAX &&
        Array.isArray(g) && g.length === j.lines.length &&
        g.every(function (x) { return x === null || GUESS.indexOf(x) !== -1; }) &&
        typeof s.shown[j.id] === 'boolean' &&
        (r === null || r === 'yes' || r === 'maybe' || r === 'no');
    });
  }
  var store = JC.store('ads-less-help', valid);
  var state = fresh();
  var app;

  function go(pos) { state.pos = pos; render(); JC.focusTitle(); }
  function render() {
    app.textContent = '';
    if (state.pos >= JOBS.length) renderSummary(); else renderJob();
    store.save(state);
  }

  function renderJob() {
    var i = state.pos, job = JOBS[i];
    if (i === 0) {
      app.append(h('div', { class: 'rule' }, h('strong', { text: D.afterStage2 === false ? t('ads2.ruleTitleAlone') : t('ads2.ruleTitle') }), t('ads2.ruleText')));
    }
    app.append(JC.trail(t('common.jobCount', { i: i + 1, total: JOBS.length }), JOBS.length, i, function (n) {
      return state.react[JOBS[n].id] ? 'done' : '';
    }));

    var facts = h('ul', { class: 'facts' });
    job.facts.forEach(function (f) { facts.append(h('li', { text: f })); });
    app.append(h('header', { class: 'stack' },
      h('p', { class: 'eyebrow', text: t('ads2.eyebrow') }),
      h('h1', { id: 'focus-title', tabindex: '-1', text: job.title }),
      h('p', { class: 'at', text: t('ads2.at', { employer: job.employer }) }),
      facts));

    // 1 read
    app.append(job.link
      ? JC.step(1, t('ads2.readTitle'), t('ads2.readHint'),
          h('div', { class: 'row start' },
            h('a', { class: 'btn', id: 'read-' + job.id, href: job.link, target: '_blank', rel: 'noopener', text: t('ads2.openAd') })))
      : JC.step(1, t('ads2.readTitle'), t('ads2.readHintPasted')));

    // 2 words, opened one at a time on request
    var words = h('div', { class: 'words' });
    job.words.forEach(function (w, n) {
      var isOpen = state.open[job.id].indexOf(n) !== -1;
      var box = h('div', { class: 'word' + (isOpen ? ' open' : '') });
      var btn = h('button', { type: 'button', id: 'word-' + job.id + '-' + n, 'aria-expanded': isOpen ? 'true' : 'false',
        onclick: function () {
          if (state.open[job.id].indexOf(n) !== -1) return;
          state.open[job.id].push(n);
          box.className = 'word open';
          btn.setAttribute('aria-expanded', 'true');
          box.append(h('p', { class: 'mean', text: w[1] }));
          store.save(state);
        } }, h('span', { text: w[0] }), h('span', { class: 'q', text: t('ads2.explain') }));
      box.append(btn);
      if (isOpen) box.append(h('p', { class: 'mean', text: w[1] }));
      words.append(box);
    });
    app.append(JC.step(2, t('ads2.wordsTitle'), t('ads2.wordsHint'), words));

    // 3 must or wish
    var lines = h('div', { class: 'lines' });
    job.lines.forEach(function (ln, n) {
      var card = h('div', { class: 'linecard' }, h('p', { class: 'wrote', text: '“' + ln.wrote + '”' }));
      var pick = h('div', { class: 'pick' });
      var fb = h('div', { class: 'fb', hidden: state.guess[job.id][n] === null });
      function fill() {
        var g = state.guess[job.id][n];
        fb.textContent = '';
        if (g === null) return;
        fb.append(h('b', { text: g === ln.is ? t('ads2.same.' + ln.is) : t('ads2.means.' + ln.is) }),
          ln.signal ? h('span', null, t('ads1.signalPre'), h('b', { style: 'display:inline', text: '“' + ln.signal + '”' }), '. ') : null,
          ln.why);
      }
      GUESS.forEach(function (g) {
        pick.append(h('button', { type: 'button', class: 'btn quiet small', id: 'guess-' + job.id + '-' + n + '-' + g,
          'aria-pressed': state.guess[job.id][n] === g ? 'true' : 'false',
          onclick: function () {
            state.guess[job.id][n] = g;
            Array.prototype.forEach.call(pick.children, function (c) {
              c.setAttribute('aria-pressed', c.id === 'guess-' + job.id + '-' + n + '-' + g ? 'true' : 'false');
            });
            fb.hidden = false;
            fill();
            store.save(state);
          } }, t('ads2.guess.' + g)));
      });
      fill();
      card.append(pick, fb);
      lines.append(card);
    });
    app.append(JC.step(3, t('ads2.linesTitle'), t('ads2.linesHint'), lines));

    // 4 your own picture first, then the plain version
    var plainHost = h('div', { class: 'plain' });
    function showPlain() {
      plainHost.textContent = '';
      var know = h('ul', { class: 'know' });
      job.know.forEach(function (k) { know.append(h('li', { text: k })); });
      plainHost.append(
        h('p', { class: 'short', text: job.short }),
        h('div', { class: 'stack' },
          h('p', { class: 'sub', text: t('ads1.weekTitle') }),
          h('p', { class: 'hint', text: t('common.pickHint', { max: MAX }) }),
          JC.picker('task-' + job.id, job.week.map(function (w) { return w[1]; }), state.picks[job.id], MAX, function () { store.save(state); })),
        h('div', { class: 'stack' }, h('p', { class: 'sub', text: t('ads1.knowTitle') }), know));
    }
    var reveal = h('button', { type: 'button', class: 'btn', id: 'show-' + job.id, hidden: state.shown[job.id],
      onclick: function () { state.shown[job.id] = true; reveal.hidden = true; showPlain(); store.save(state); } }, t('ads2.showPlain'));
    if (state.shown[job.id]) showPlain();
    app.append(JC.step(4, t('ads2.pictureTitle'), t('ads2.pictureHint'), h('div', { class: 'row start' }, reveal), plainHost));

    app.append(h('hr'));
    app.append(JC.step(null, t('common.reactTitle'), t('common.reactHint'),
      JC.reactions('react-' + job.id, function () { return state.react[job.id]; }, function (v) { state.react[job.id] = v; store.save(state); })));

    app.append(h('div', { class: 'row' },
      h('button', { type: 'button', class: 'btn quiet', id: 'btn-back', disabled: i === 0, onclick: function () { go(i - 1); } }, t('common.back')),
      h('button', { type: 'button', class: 'btn', id: 'btn-next', onclick: function () { go(i + 1); } },
        i === JOBS.length - 1 ? t('common.seeWhatIThought') : t('common.nextJob'))));
  }

  function tally() {
    var r = { counts: {}, picked: [], kinds: [], wordsOpen: 0, wordsAll: 0, matched: 0, linesAll: 0 };
    JOBS.forEach(function (j) {
      j.week.forEach(function (w) { if (r.kinds.indexOf(w[0]) === -1) r.kinds.push(w[0]); });
      state.picks[j.id].slice().sort(function (a, b) { return a - b; }).forEach(function (n) {
        r.counts[j.week[n][0]] = (r.counts[j.week[n][0]] || 0) + 1;
        r.picked.push(j.week[n][1]);
      });
      r.wordsOpen += state.open[j.id].length;
      r.wordsAll += j.words.length;
      j.lines.forEach(function (ln, n) {
        r.linesAll++;
        if (state.guess[j.id][n] === ln.is) r.matched++;
      });
    });
    return r;
  }

  function resultText(r) {
    var lines = JC.header(t('ads2.copyName'));
    lines.push('');
    JOBS.forEach(function (j, n) {
      lines.push((n + 1) + '. ' + j.title + ' (' + j.employer + '): ' + (state.react[j.id] ? t('common.react.' + state.react[j.id]) : t('common.noAnswer')));
    });
    lines.push('');
    lines.push(t('ads2.copyWords', { n: r.wordsOpen, total: r.wordsAll }));
    JOBS.forEach(function (j) {
      var o = state.open[j.id].slice().sort(function (a, b) { return a - b; }).map(function (n) { return j.words[n][0]; });
      lines.push('- ' + j.employer + ': ' + (o.length ? o.join(', ') : t('ads2.copyNone')));
    });
    lines.push('');
    lines.push(t('ads2.copyLines'));
    JOBS.forEach(function (j) {
      j.lines.forEach(function (ln, n) {
        var g = state.guess[j.id][n];
        lines.push('- ' + t('ads2.copyLine', { employer: j.employer, n: n + 1, said: g ? t('ads2.guess.' + g) : t('ads2.copyNothing'), is: t('ads2.guess.' + ln.is) }));
      });
    });
    lines.push('');
    lines.push(t('common.copyKinds'));
    r.kinds.forEach(function (k) { lines.push('- ' + t('kinds.' + k) + ': ' + (r.counts[k] || 0)); });
    if (r.picked.length) {
      lines.push('');
      lines.push(t('common.copyPicked'));
      r.picked.forEach(function (p) { lines.push('- ' + p); });
    }
    return lines.join('\n');
  }

  function renderSummary() {
    var r = tally();
    app.append(h('header', { class: 'stack' },
      h('p', { class: 'eyebrow', text: t('ads2.summaryEyebrow') }),
      h('h1', { id: 'focus-title', tabindex: '-1', text: t('common.whatYouThought') }),
      h('p', { class: 'lede', text: t('ads2.summaryLede') })));

    var sum = h('ul', { class: 'sum' });
    JOBS.forEach(function (j) {
      var x = state.react[j.id];
      sum.append(h('li', { class: x === 'yes' ? 'yes' : null },
        h('span', { class: 'what', text: j.title + ', ' + j.employer }),
        h('span', { class: 'said', text: x ? t('common.react.' + x) : t('common.noAnswerYet') })));
    });
    app.append(JC.section(t('ads1.summaryJobs', { n: JOBS.length }), null, sum));

    app.append(JC.section(t('ads2.wordsSummaryTitle'), null, h('p', { text:
      (r.wordsOpen === 0 ? t('ads2.wordsNone', { total: r.wordsAll }) : t('ads2.wordsSome', { n: r.wordsOpen, total: r.wordsAll, rest: r.wordsAll - r.wordsOpen })) +
      (D.afterStage2 === false ? '' : ' ' + t('ads2.wordsRoundOne')) })));

    var signals = h('div', { class: 'signals' });
    ['wish', 'must', 'small', 'neither'].forEach(function (k) {
      signals.append(h('div', null, h('b', { text: t('signals.' + k + '.label') }), t('signals.' + k + '.words')));
    });
    // A count is shown only when it is high. A low count would sting and teaches nothing.
    app.append(JC.section(t('ads2.linesSummaryTitle'), null,
      r.matched > 0 && r.matched / r.linesAll >= 0.75 && h('p', { text: t('ads2.linesMatched', { n: r.matched, total: r.linesAll }) }),
      h('p', { text: t('ads2.signalsLead') }),
      signals));

    if (!r.picked.length) {
      app.append(JC.section(t('common.kindsTitle'), null, h('p', { text: t('common.noPicks') })));
    } else {
      var rows = r.kinds.map(function (k) { var n = r.counts[k] || 0; return { label: t('kinds.' + k), n: n, count: t('common.tasksN', { n: n }) }; })
        .sort(function (a, b) { return b.n - a.n; });
      var picked = h('ul', { class: 'picked' });
      r.picked.forEach(function (p) { picked.append(h('li', { text: p })); });
      app.append(JC.section(t('common.kindsTitle'), t('common.kindsHint'), JC.bars(rows)));
      app.append(JC.section(t('common.pickedTitle'), null, picked));
    }

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
