#!/usr/bin/env python3
"""Turn a Job Compass data file into one self-contained page.

Usage:
  build_page.py data.json OUT.html [--ads ADS_DIR] [--strings en]

The page type comes from the data file's "page" field: pick, quiz, ads-translated or ads-less-help.
The script refuses to build when a check fails:
  - the data is incomplete or malformed (check_page.py)
  - the quiz is not fair (check_quiz.py)
  - an ad page contains quotes and no ad texts were given, or a quote is not in its ad (check_quotes.py)
Warnings are printed but do not stop the build. Read them; most are about plain language.

The result is one HTML file with everything inside. It works when opened from disk,
when sent to someone without Claude, and as a published page.
"""
import argparse
import hashlib
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.normpath(os.path.join(HERE, "..", "assets"))
sys.path.insert(0, HERE)

import check_page  # noqa: E402
import check_quotes  # noqa: E402


def read(*parts):
    with open(os.path.join(ASSETS, *parts), encoding="utf-8") as f:
        return f.read()


def js_json(obj):
    s = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    # Keep the JSON from closing the <script> tag or breaking older parsers.
    return s.replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def needs_ad_text(data):
    """True when any job quotes its ad or has a word list, i.e. something must be checked against the ad."""
    for job in data.get("jobs") or []:
        if job.get("unchecked"):
            continue
        if job.get("words") or any(a.get("wrote") for a in job.get("asks") or []) or any(l.get("wrote") for l in job.get("lines") or []):
            return True
    return False


def build(data, strings_lang="en", ads_dir=None):
    report = check_page.check(data)
    errors, warnings = list(report.errors), list(report.warnings)

    if data.get("page") in ("ads-translated", "ads-less-help") and not errors:
        if ads_dir:
            e, w = check_quotes.check(data, ads_dir)
            errors += ["quotes: " + x for x in e]
            warnings += ["quotes: " + x for x in w]
        elif needs_ad_text(data):
            errors.append("quotes: this page quotes the ads or explains their words, but no ad texts were given. "
                          "Pass --ads with one <job id>.txt per ad. If you cannot get an ad's own words, mark that "
                          "job \"unchecked\": true and use rewordings only (see references/finding-ads.md).")
    if errors:
        return None, errors, warnings

    data = dict(data)
    if not data.get("pageId"):
        data["pageId"] = hashlib.sha1(json.dumps(data, sort_keys=True).encode("utf-8")).hexdigest()[:10]
    strings = json.loads(read("strings", strings_lang + ".json"))

    parts = {
        "TITLE": html.escape(data["title"]),
        "WAITING": html.escape(strings["common"]["waiting"]),
        "CSS": read("base.css"),
        "STRINGS": js_json(strings),
        "DATA": js_json(data),
        "RUNTIME": read("runtime.js"),
        "PAGE": read("pages", data["page"] + ".js"),
    }
    shell = read("shell.html")
    # One pass, so text inside the inserted parts is never treated as a placeholder.
    out = re.sub(r"@@([A-Z]+)@@", lambda m: parts[m.group(1)], shell)
    if "<main class=\"wrap\" id=\"app\">" not in out or "@@" in re.sub(r"<script>.*?</script>", "", out, flags=re.S):
        errors.append("build: the page shell was damaged. Do not edit assets/shell.html by hand.")
        return None, errors, warnings
    return out, errors, warnings


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("data")
    ap.add_argument("out")
    ap.add_argument("--ads", help="folder with one <job id>.txt per ad (needed for pages that quote ads)")
    ap.add_argument("--strings", default="en", help="page language file in assets/strings (default: en)")
    a = ap.parse_args()

    with open(a.data, encoding="utf-8") as f:
        data = json.load(f)
    out, errors, warnings = build(data, a.strings, a.ads)
    for w in warnings:
        print("warning: " + w)
    for e in errors:
        print("error: " + e)
    if out is None:
        print("Not built. Fix the errors above and run again.")
        return 1
    with open(a.out, "w", encoding="utf-8") as f:
        f.write(out)
    print("built %s (%d KB). Next: python3 scripts/smoke_test.py %s" % (a.out, len(out.encode("utf-8")) // 1024, a.out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
