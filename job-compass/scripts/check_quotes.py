#!/usr/bin/env python3
"""Check that every quote and every word-list term really appears in the ad.

Usage:
  check_quotes.py check data.json ADS_DIR    ADS_DIR holds one text file per job: <job id>.txt
  check_quotes.py fetch URL OUT.txt           try to save an ad's text (many job sites need a
                                              browser; if little text comes back, paste the ad
                                              into OUT.txt instead)

The ad text must be the ad's own words: pasted by the person, saved from the page, or fetched
here. A summary or paraphrase of the ad is not good enough, because then a quote can
"match" words the ad never used.

Comparison ignores case, curly versus straight quotes, dash types, bullet marks and spacing.
Everything else must match.
"""
import html.parser
import json
import os
import re
import sys
import unicodedata
import urllib.request

QUOTE_MAP = {
    "‘": "'", "’": "'", "‚": "'", "‛": "'", "′": "'",
    "“": '"', "”": '"', "„": '"', "‟": '"', "«": '"', "»": '"',
    "–": "-", "—": "-", "‒": "-", "‐": "-", "‑": "-", "−": "-",
    "…": "...", " ": " ", "•": " ", "·": " ", "*": " ", "#": " ",
}


def norm(s):
    s = unicodedata.normalize("NFKC", s)
    s = "".join(QUOTE_MAP.get(ch, ch) for ch in s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)  # markdown links -> text
    s = re.sub(r"\s+", " ", s)
    return s.strip().lower()


def split_term(term):
    parts = re.split(r",\s*|\s+and\s+|\s+&\s+|\s*/\s*", term)
    return [p for p in (x.strip() for x in parts) if p]


class _Text(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.out, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self.skip += 1
        if tag in ("p", "br", "li", "div", "h1", "h2", "h3", "h4", "tr"):
            self.out.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.out.append(data)


def html_to_text(raw):
    p = _Text()
    p.feed(raw)
    return re.sub(r"\n\s*\n+", "\n\n", "".join(p.out)).strip()


def read_ad(ads_dir, job_id):
    for ext in (".txt", ".md", ".html", ".htm"):
        path = os.path.join(ads_dir, job_id + ext)
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                raw = f.read()
            return html_to_text(raw) if ext in (".html", ".htm") else raw
    return None


def check(data, ads_dir):
    """Return (errors, warnings)."""
    errors, warnings = [], []
    for job in data.get("jobs") or []:
        jid = job.get("id", "?")
        if job.get("unchecked"):
            warnings.append("%s: marked unchecked, so nothing was compared with the ad." % jid)
            continue
        ad = read_ad(ads_dir, jid)
        if ad is None:
            errors.append("%s: no ad text found (expected %s.txt in %s)." % (jid, jid, ads_dir))
            continue
        if len(ad) < 400:
            warnings.append("%s: the ad text is very short (%d characters). Is it the whole ad?" % (jid, len(ad)))
        text = norm(ad)
        quotes = [a.get("wrote") for a in job.get("asks") or []] + [l.get("wrote") for l in job.get("lines") or []]
        for q in quotes:
            if q and norm(q) not in text:
                errors.append("%s: quote not found in the ad: \"%s\". Copy it exactly, or turn it into a rewording ('text')." % (jid, q))
        for w in job.get("words") or []:
            term = w[0] if isinstance(w, list) and w else None
            if not term:
                continue
            if norm(term) in text:
                continue
            missing = [p for p in split_term(term) if norm(p) not in text]
            if missing:
                errors.append("%s: word-list term not found in the ad: \"%s\"." % (jid, ", ".join(missing)))
    return errors, warnings


def fetch(url, out):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (job-compass quote check)"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode(resp.headers.get_content_charset() or "utf-8", "replace")
    text = html_to_text(raw)
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print("saved %d characters to %s" % (len(text), out))
    if len(text) < 800:
        print("warning: very little text. The site probably builds the ad in the browser. "
              "Paste the ad text into the file instead.")


def main(argv):
    if len(argv) == 4 and argv[1] == "check":
        with open(argv[2], encoding="utf-8") as f:
            errors, warnings = check(json.load(f), argv[3])
        for w in warnings:
            print("warning: " + w)
        for e in errors:
            print("error: " + e)
        if not errors:
            print("ok: every quote and term was found in its ad.")
        return 1 if errors else 0
    if len(argv) == 4 and argv[1] == "fetch":
        try:
            fetch(argv[2], argv[3])
        except Exception as e:  # network blocked, 403, timeout...
            print("error: could not fetch the ad (%s). Paste the ad text into %s instead." % (e, argv[3]))
            return 1
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
