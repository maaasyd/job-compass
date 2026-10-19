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
It opens the page at phone width with no network, clicks through to the end, presses Copy, repeats in dark mode, and checks that the "has not started" message appears when scripts are blocked. Exit code 3 means no browser is available here. Then rely on the build checks, which cover the data, the quiz's fairness and every quote. When you share the page, ask the person to tell you if anything looks wrong or a button doesn't respond.

Rebuild and retest after every change, however small. In the first trial, two bugs reached the person because a page was changed after testing.

## Share
Pick what the environment supports:
- **A published page** (for example an artifact with its own link) when the environment can publish HTML. Easiest for the person: one link that opens on a phone. Use the built file as it is.
- **The file itself** when publishing isn't available, or for someone without Claude. It is one self-contained HTML file. They can open it from email, a chat app or a download. If a chat app's preview shows the "has not started yet" message, they need to open the file in a browser. The message tells them so.
- **Printing** works for the summaries if someone prefers paper. The copy and navigation buttons are hidden in print.

When sending, add one or two lines in plain words: what the page is, about how long it takes, that nobody is applying to anything, and "When you're done, press Copy and send me what it gives you." For the ad pages, which take longer, add that they can do it in two goes: the page usually remembers where they got to when they open it again in the same browser.

## Privacy
Pages can end up at public links. Use "you", not names. Don't include contact details, health details, or anything the person hasn't agreed to put on a page. The ad texts in `ads/` are working files for the quote check. Don't publish them.

## Page text in other languages

The page's fixed text (buttons, hints, the signal-word box) lives in `SKILL/assets/strings/en.json`. Don't write into the skill's folder. For another language:

1. Copy `en.json` into your work folder, e.g. `job-compass-work/strings-de.json`.
2. Translate every value. Keep the keys and the `{placeholders}`. Set `meta.lang` and `meta.locale` (e.g. `de`, `de-DE`), and use that language's quotation marks for `common.quoteOpen` and `common.quoteClose` (for German „ and “).
3. Translate the signal words for that language with care, and leave `meta.signalsChecked` as `false` unless a native speaker has checked them. The page then says they're a first draft.
4. Build with `--strings-file job-compass-work/strings-de.json`. The build refuses a translation that's missing any text.

Tell the person the page text was translated by you and may have small mistakes.
