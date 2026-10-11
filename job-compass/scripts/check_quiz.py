#!/usr/bin/env python3
"""Fair quiz layouts and the fairness check for Job Compass.

A quiz is fair when every kind of work is offered equally often and every pair of
kinds of work meets equally often. Then no option gets an easier run, and
"picked X of the Y times it was offered" means the same thing for all of them.

Usage:
  check_quiz.py layout ID1 ID2 ... ID7     print which kinds of work go into each question
  check_quiz.py check quiz.json            check a quiz data file and report problems

Supported sizes (four options per question):
  7 kinds of work -> 14 questions, each offered 8 times, each pair meets 4 times
  6 kinds of work -> 15 questions, each offered 10 times, each pair meets 6 times
  5 kinds of work -> 10 questions, each offered 8 times, each pair meets 6 times
"""
import itertools
import json
import re
import sys
from collections import Counter

# Index layouts. The 7-way layout is the one used in the first trial.
LAYOUTS = {
    7: [(2, 4, 5, 6), (0, 3, 5, 6), (0, 1, 4, 6), (0, 1, 2, 5), (1, 2, 3, 6), (0, 2, 3, 4), (1, 3, 4, 5),
        (1, 4, 5, 6), (0, 2, 5, 6), (0, 1, 3, 6), (0, 1, 2, 4), (1, 2, 3, 5), (2, 3, 4, 6), (0, 3, 4, 5)],
    # Every set of four out of six.
    6: [(0, 1, 2, 3), (2, 3, 4, 5), (0, 1, 4, 5), (0, 2, 3, 5), (1, 2, 4, 5), (0, 1, 3, 4), (1, 3, 4, 5),
        (0, 2, 4, 5), (0, 1, 2, 4), (1, 2, 3, 5), (0, 3, 4, 5), (0, 1, 2, 5), (1, 2, 3, 4), (0, 2, 3, 4),
        (0, 1, 3, 5)],
    # Every set of four out of five, twice, with repeats kept apart.
    5: [(0, 1, 2, 3), (1, 2, 3, 4), (0, 2, 3, 4), (0, 1, 3, 4), (0, 1, 2, 4),
        (0, 2, 3, 4), (0, 1, 2, 3), (0, 1, 2, 4), (1, 2, 3, 4), (0, 1, 3, 4)],
}

# Words that make one option sound more important than the others.
STATUS_WORDS = re.compile(r"\b(lead|leading|head of|strategic|strategy|senior|expert|manage a team|managing a team|"
                          r"boss|director|prestig\w*|top|best)\b", re.I)


def balance(blocks, n):
    offered = Counter(i for b in blocks for i in b)
    pairs = Counter(p for b in blocks for p in itertools.combinations(sorted(b), 2))
    return offered, pairs


def _self_test():
    for n, blocks in LAYOUTS.items():
        offered, pairs = balance(blocks, n)
        assert set(offered) == set(range(n)), n
        assert len(set(offered.values())) == 1, (n, offered)
        assert len(pairs) == n * (n - 1) // 2 and len(set(pairs.values())) == 1, (n, pairs)


def layout(ids):
    n = len(ids)
    if n not in LAYOUTS:
        raise SystemExit("Use 5, 6 or 7 kinds of work (got %d)." % n)
    return [[ids[i] for i in b] for b in LAYOUTS[n]]


def check(data):
    """Return (errors, warnings) for a quiz data dict."""
    errors, warnings = [], []
    dirs = data.get("directions") or []
    ids = [d.get("id") for d in dirs]
    qs = data.get("questions") or []
    n = len(ids)
    if n not in LAYOUTS:
        errors.append("The quiz needs 5, 6 or 7 kinds of work; it has %d." % n)
        return errors, warnings
    if len(set(ids)) != n:
        errors.append("Two kinds of work share an id.")
    want = len(LAYOUTS[n])
    if len(qs) != want:
        errors.append("With %d kinds of work the quiz needs exactly %d questions; it has %d." % (n, want, len(qs)))

    blocks = []
    for qi, q in enumerate(qs, 1):
        opts = q.get("options") or []
        keys = [o[0] for o in opts]
        if len(opts) != 4:
            errors.append("Question %d has %d options; every question needs 4." % (qi, len(opts)))
        if len(set(keys)) != len(keys):
            errors.append("Question %d offers the same kind of work twice." % qi)
        bad = [k for k in keys if k not in ids]
        if bad:
            errors.append("Question %d uses unknown ids: %s." % (qi, ", ".join(bad)))
        blocks.append(tuple(ids.index(k) for k in keys if k in ids))

        texts = [o[1] for o in opts if len(o) > 1]
        if texts:
            lens = [len(x) for x in texts]
            if min(lens) and max(lens) / min(lens) > 1.8:
                warnings.append("Question %d: the longest option is %.1f times the shortest. Long options tend to win; "
                                "bring them closer in length." % (qi, max(lens) / min(lens)))
            for k, x in zip(keys, texts):
                m = STATUS_WORDS.search(x)
                if m:
                    warnings.append("Question %d, option '%s': '%s' makes it sound more important than the others."
                                    % (qi, k, m.group(0)))
        if not q.get("q"):
            errors.append("Question %d has no question text." % qi)

    if not errors:
        offered, pairs = balance(blocks, n)
        if len(set(offered[i] for i in range(n))) != 1:
            errors.append("Not every kind of work is offered equally often: " +
                          ", ".join("%s %d" % (ids[i], offered[i]) for i in range(n)) +
                          ". Run `check_quiz.py layout` and follow its slots.")
        missing = [p for p in itertools.combinations(range(n), 2) if p not in pairs]
        if missing or len(set(pairs.values())) != 1:
            errors.append("Not every pair of kinds of work meets equally often. "
                          "Run `check_quiz.py layout` and follow its slots.")
    return errors, warnings


def main(argv):
    _self_test()
    if len(argv) >= 2 and argv[1] == "layout":
        ids = argv[2:]
        for qi, block in enumerate(layout(ids), 1):
            print("Question %2d: %s" % (qi, ", ".join(block)))
        return 0
    if len(argv) == 3 and argv[1] == "check":
        with open(argv[2], encoding="utf-8") as f:
            errors, warnings = check(json.load(f))
        for w in warnings:
            print("warning: " + w)
        for e in errors:
            print("error: " + e)
        if not errors:
            print("ok: the quiz is fair.")
        return 1 if errors else 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
