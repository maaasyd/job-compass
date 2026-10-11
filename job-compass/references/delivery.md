# Building, testing and sharing pages

## Build
```
python3 SKILL/scripts/build_page.py job-compass-work/3-ads.json job-compass-work/pages/3-ads.html --ads job-compass-work/ads
```
(`SKILL` is this skill's folder. See SKILL.md for the working folder.)
- The page type comes from `"page"` in the data.
- The script refuses to build if the data is incomplete, the quiz isn't fair, or a quote or term isn't in its ad. Fix the data, never the HTML.
- Warnings don't stop the build, but read them. Fix every jargon and long-sentence warning unless you have a good reason.
- `--ads` is required for ad pages that quote. Without the ad's own words, use rewordings (see `finding-ads.md`).
- Each built page gets its own storage key, so two people's pages on the same phone never mix.

## Test
```
python3 SKILL/scripts/smoke_test.py job-compass-work/pages/3-ads.html
```
It opens the page at phone width with no network, clicks through to the end, presses Copy, repeats in dark mode, and checks that the "has not started" message appears when scripts are blocked. Exit code 3 means no browser is available. Then open the page yourself, ideally on a phone, before sharing it.

Rebuild and retest after every change, however small. In the first trial, two bugs reached the person because a page was changed after testing.

## Share
Pick what the environment supports:
- **A published page** (for example an artifact with its own link) when the environment can publish HTML. Easiest for the person: one link that opens on a phone. Use the built file as it is.
- **The file itself** when publishing isn't available, or for someone without Claude. It is one self-contained HTML file. They can open it from email, a chat app or a download. If a chat app's preview shows the "has not started yet" message, they need to open the file in a browser. The message tells them so.
- **Printing** works for the summaries if someone prefers paper. The copy and navigation buttons are hidden in print.

When sending, add one or two lines in plain words: what the page is, about how long it takes, that nobody is applying to anything, and "When you're done, press Copy and send me what it gives you."

## Privacy
Pages can end up at public links. Use "you", not names. Don't include contact details, health details, or anything the person hasn't agreed to put on a page. The ad texts in `ads/` are working files for the quote check. Don't publish them.

## Page text in other languages
The page's fixed text lives in `assets/strings/en.json`. To make a page in another language, copy the file (e.g. `de.json`), translate every value, keep the keys and `{placeholders}`, set `meta.lang` and `meta.locale`, and build with `--strings de`. Tell the person the page text was machine-translated and hasn't been checked by a native speaker, unless it has.
