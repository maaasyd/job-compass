#!/usr/bin/env python3
"""Check a Job Compass data file before it becomes a page.

Usage:
  check_page.py data.json

Finds missing or malformed fields (errors) and plain-language problems (warnings):
jargon in the page's own text, very long sentences, and acronyms nobody explained.
Text quoted from an ad ("wrote") and the terms in a word list are not checked for jargon,
because there the jargon is the point.
"""
import datetime
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "assets")
KINDS = {"data", "write", "org", "check", "people", "hands", "create"}
ASK_TAGS = {"must", "wish", "small", "neither"}
ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,39}$")
ACRONYM_RE = re.compile(r"\b[A-Z]{2,6}s?\b")
ACRONYM_OK = {"EU", "UK", "US", "USA", "AI", "CV", "IT", "OK", "TV", "PC", "CEO", "HR", "PDF", "GP", "NHS", "UN", "NGO", "NGOs"}


def load_jargon():
    words = []
    with open(os.path.join(ASSETS, "jargon.txt"), encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                words.append(line)
    return [(w, re.compile(r"(?<![\w-])" + re.escape(w) + r"(?![\w-])", re.I)) for w in words]


JARGON = load_jargon()


class Report:
    def __init__(self):
        self.errors, self.warnings = [], []

    def err(self, where, msg):
        self.errors.append("%s: %s" % (where, msg))

    def warn(self, where, msg):
        self.warnings.append("%s: %s" % (where, msg))


def need_str(r, obj, key, where, optional=False):
    v = obj.get(key)
    if v is None and optional:
        return None
    if not isinstance(v, str) or not v.strip():
        r.err(where, "'%s' must be non-empty text." % key)
        return None
    return v


def need_list(r, obj, key, where, min_len=1):
    v = obj.get(key)
    if not isinstance(v, list) or len(v) < min_len:
        r.err(where, "'%s' must be a list with at least %d item(s)." % (key, min_len))
        return []
    return v


def plain(r, text, where, explained=()):
    """Plain-language checks for text the page says in its own voice."""
    if not isinstance(text, str):
        return
    for word, rx in JARGON:
        if rx.search(text):
            r.warn(where, "uses '%s'. Say what it means in everyday words." % word)
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        n = len(sentence.split())
        if n > 30:
            r.warn(where, "a sentence has %d words. Split it; aim for under 25." % n)
    for m in ACRONYM_RE.finditer(text):
        a = m.group(0)
        if a not in ACRONYM_OK and a.rstrip("s") not in ACRONYM_OK and a not in explained and a.rstrip("s") not in explained:
            r.warn(where, "'%s' is an abbreviation the page never explains." % a)


def check_ids(r, items, where):
    seen = set()
    for i, it in enumerate(items):
        v = it.get("id") if isinstance(it, dict) else None
        if not isinstance(v, str) or not ID_RE.match(v):
            r.err("%s[%d]" % (where, i), "'id' must be short lowercase letters, digits or dashes.")
        elif v in seen:
            r.err("%s[%d]" % (where, i), "id '%s' is used twice." % v)
        seen.add(v)


def check_checked(r, data):
    v = data.get("checked")
    try:
        d = datetime.date.fromisoformat(v)
    except Exception:
        r.err("checked", "give the date the ads were checked, as YYYY-MM-DD.")
        return
    today = datetime.date.today()
    if d > today:
        r.err("checked", "the date is in the future.")
    elif (today - d).days > 14:
        r.warn("checked", "the ads were checked %d days ago and may have closed. Check them again before sharing." % (today - d).days)


def check_link(r, job, where):
    v = job.get("link")
    if v is None:
        r.warn(where, "no 'link'. Fine for an ad the person pasted; otherwise link the original ad.")
    elif not isinstance(v, str) or not re.match(r"^https?://", v):
        r.err(where, "'link' must be the web address of the original ad.")


def check_unchecked(r, job, where, allowed=True):
    """A job whose own words could not be obtained: no quotes and no word list allowed."""
    if job.get("unchecked") is None:
        return
    if job.get("unchecked") is not True:
        r.err(where, "'unchecked' is true or left out.")
        return
    if not allowed:
        r.err(where, "this page needs the ad's own words for the must-or-wish lines. Pick an ad you can get the text of.")
        return
    if any(a.get("wrote") for a in job.get("asks") or []):
        r.err(where, "an unchecked ad can't have quotes ('wrote'). Use rewordings ('text').")
    if any(a.get("signal") for a in job.get("asks") or []):
        r.err(where, "an unchecked ad can't name signal words, because you haven't seen its exact wording. "
                     "Leave 'signal' out; the page shows 'Probably a must / wish' and asks the person to look.")
    if job.get("words"):
        r.err(where, "an unchecked ad can't have a word list, because the terms can't be checked.")


def check_week(r, job, where):
    week = need_list(r, job, "week", where, 4)
    for i, w in enumerate(week):
        if not (isinstance(w, list) and len(w) == 2 and w[0] in KINDS and isinstance(w[1], str)):
            r.err("%s.week[%d]" % (where, i), "each task is [kind, text] with kind one of %s." % ", ".join(sorted(KINDS)))
        else:
            plain(r, w[1], "%s.week[%d]" % (where, i))


def check_words(r, job, where, min_len=1):
    words = need_list(r, job, "words", where, min_len)
    terms = []
    for i, w in enumerate(words):
        if not (isinstance(w, list) and len(w) == 2 and all(isinstance(x, str) and x.strip() for x in w)):
            r.err("%s.words[%d]" % (where, i), "each word is [term from the ad, plain meaning].")
        else:
            terms.append(w[0])
            plain(r, w[1], "%s.words[%d]" % (where, i), explained=explained_terms(job))
    return terms


def explained_terms(job):
    out = set()
    for w in job.get("words") or []:
        if isinstance(w, list) and w:
            out.update(re.findall(r"[A-Z]{2,6}", str(w[0])))
    return out


def check_pick(r, data):
    c = need_list(r, data, "candidates", "candidates", 5)
    check_ids(r, c, "candidates")
    keep = data.get("keep") or {"min": 5, "max": 7}
    if not (keep.get("min") == 5 and keep.get("max") == 7):
        r.warn("keep", "the quiz supports keeping 5 to 7. Leave 'keep' out to use that.")
    if len(c) < 8:
        r.warn("candidates", "offer 8 to 10 kinds of work, so there is something to cross out.")
    if len(c) > 12:
        r.warn("candidates", "more than 12 is a lot to read. Aim for 8 to 10.")
    for i, x in enumerate(c):
        where = "candidates[%d]" % i
        need_str(r, x, "name", where)
        day = need_str(r, x, "day", where)
        plain(r, day, where + ".day")
        if day and len(day.split()) > 40:
            r.warn(where, "keep 'day' to one or two sentences.")


def check_quiz_page(r, data):
    sys.dont_write_bytecode = True  # never write caches into the skill folder
    sys.path.insert(0, HERE)
    import check_quiz
    dirs = need_list(r, data, "directions", "directions", 5)
    check_ids(r, dirs, "directions")
    for i, d in enumerate(dirs):
        where = "directions[%d]" % i
        need_str(r, d, "name", where)
        plain(r, need_str(r, d, "day", where), where + ".day")
        titles = need_list(r, d, "titles", where, 2)
        for ti, t in enumerate(titles):
            tw = "%s.titles[%d]" % (where, ti)
            if isinstance(t, str) and t.strip():
                continue
            if isinstance(t, dict) and isinstance(t.get("title"), str) and t["title"].strip() \
                    and set(t) <= {"title", "meaning"} and isinstance(t.get("meaning", ""), str):
                plain(r, t.get("meaning"), tw + ".meaning")
                continue
            r.err(tw, "a title is text, or {\"title\": \"…\", \"meaning\": \"…\"}.")
        for k in ("where", "bring", "know"):
            plain(r, need_str(r, d, k, where, optional=True), "%s.%s" % (where, k))
    for i, q in enumerate(data.get("questions") or []):
        plain(r, q.get("q"), "questions[%d].q" % i)
        plain(r, q.get("hint"), "questions[%d].hint" % i)
        for o in q.get("options") or []:
            if isinstance(o, list) and len(o) == 2:
                plain(r, o[1], "questions[%d] option '%s'" % (i, o[0]))
            else:
                r.err("questions[%d]" % i, "each option is [id, text].")
    if not r.errors:
        errors, warnings = check_quiz.check(data)
        r.errors += ["quiz: " + e for e in errors]
        r.warnings += ["quiz: " + w for w in warnings]


def check_signal(r, item, where):
    s, w = item.get("signal"), item.get("wrote")
    if s is not None:
        if not isinstance(s, str) or not s.strip():
            r.err(where, "'signal' must be the deciding words, copied from the quoted line.")
        elif w and s.lower() not in w.lower():
            r.err(where, "the signal '%s' does not appear in the quoted line." % s)


def check_ads_translated(r, data):
    check_checked(r, data)
    jobs = need_list(r, data, "jobs", "jobs", 1)
    if len(jobs) != 3:
        r.warn("jobs", "the method uses three ads, gentlest first. This page has %d." % len(jobs))
    check_ids(r, jobs, "jobs")
    for j, job in enumerate(jobs):
        where = "jobs[%d]" % j
        for k in ("plain", "title", "employer", "short"):
            need_str(r, job, k, where)
        ex = explained_terms(job)
        plain(r, job.get("plain"), where + ".plain", ex)
        plain(r, job.get("short"), where + ".short", ex)
        for i, f in enumerate(need_list(r, job, "facts", where, 1)):
            plain(r, f, "%s.facts[%d]" % (where, i), ex)
        check_link(r, job, where)
        check_week(r, job, where)
        check_words(r, job, where, 0 if job.get("unchecked") else 1)
        check_unchecked(r, job, where)
        asks = need_list(r, job, "asks", where, 1)
        for i, a in enumerate(asks):
            aw = "%s.asks[%d]" % (where, i)
            if a.get("tag") not in ASK_TAGS:
                r.err(aw, "'tag' must be one of %s." % ", ".join(sorted(ASK_TAGS)))
            if bool(a.get("wrote")) == bool(a.get("text")):
                r.err(aw, "give either 'wrote' (an exact quote from the ad) or 'text' (your rewording), not both.")
            if a.get("have") not in (None, True, False):
                r.err(aw, "'have' is true or left out.")
            if a.get("tag") == "wish" and a.get("wrote") and not a.get("signal"):
                r.warn(aw, "a wish should name its signal words (e.g. 'is a plus').")
            check_signal(r, a, aw)
            plain(r, need_str(r, a, "why", aw), aw + ".why", ex)
            plain(r, a.get("text"), aw + ".text", ex)
        for i, k in enumerate(need_list(r, job, "know", where, 1)):
            plain(r, k, "%s.know[%d]" % (where, i), ex)


def check_ads_less_help(r, data):
    check_checked(r, data)
    if data.get("afterStage2") not in (None, True, False):
        r.err("afterStage2", "true or false: did the person do the translated-ads page before this one?")
    jobs = need_list(r, data, "jobs", "jobs", 1)
    if len(jobs) != 3:
        r.warn("jobs", "the method uses three ads. This page has %d." % len(jobs))
    check_ids(r, jobs, "jobs")
    for j, job in enumerate(jobs):
        where = "jobs[%d]" % j
        for k in ("title", "employer", "short"):
            need_str(r, job, k, where)
        ex = explained_terms(job)
        plain(r, job.get("short"), where + ".short", ex)
        for i, f in enumerate(need_list(r, job, "facts", where, 1)):
            plain(r, f, "%s.facts[%d]" % (where, i), ex)
        check_link(r, job, where)
        check_unchecked(r, job, where, allowed=False)
        check_week(r, job, where)
        if not check_words(r, job, where, 0):
            r.warn(where, "no word list. Fine when the person pasted only a few lines without insider words.")
        lines = need_list(r, job, "lines", where, 1)
        if len(lines) != 3:
            r.warn(where, "use three must-or-wish lines per ad.")
        kinds = set()
        for i, ln in enumerate(lines):
            lw = "%s.lines[%d]" % (where, i)
            need_str(r, ln, "wrote", lw)
            if ln.get("is") not in ("must", "wish"):
                r.err(lw, "'is' must be 'must' or 'wish'.")
            kinds.add(ln.get("is"))
            check_signal(r, ln, lw)
            plain(r, need_str(r, ln, "why", lw), lw + ".why", ex)
        if lines and len(kinds) == 1:
            r.warn(where, "all lines are '%s'. Mix musts and wishes so the guess means something." % kinds.pop())
        for i, k in enumerate(need_list(r, job, "know", where, 1)):
            plain(r, k, "%s.know[%d]" % (where, i), ex)


PAGES = {
    "pick": check_pick,
    "quiz": check_quiz_page,
    "ads-translated": check_ads_translated,
    "ads-less-help": check_ads_less_help,
}


def check(data):
    r = Report()
    page = data.get("page")
    if page not in PAGES:
        r.err("page", "must be one of %s." % ", ".join(PAGES))
        return r
    need_str(r, data, "title", "title")
    PAGES[page](r, data)
    return r


def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 2
    with open(argv[1], encoding="utf-8") as f:
        r = check(json.load(f))
    for w in r.warnings:
        print("warning: " + w)
    for e in r.errors:
        print("error: " + e)
    if not r.errors:
        print("ok: no errors (%d warning%s)." % (len(r.warnings), "" if len(r.warnings) == 1 else "s"))
    return 1 if r.errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
