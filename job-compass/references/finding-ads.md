# Finding and checking ads (stages 2 and 3)

## What to look for

- **Real and open.** Check each ad is still online on the day you build the page. Note the date: it goes into the data as `checked`.
- **In the kinds of work they liked,** from the quiz or from what they told you.
- **Where they can work,** in a language they can read. Stage 3 may include one ad in a second language they know, which is good practice.
- **At their level.** Entry and junior roles, or roles their stated experience fits. An ad that asks for ten years teaches nothing and stings.
- **Varied.** Three ads that show different sides: different employers, sizes, or ways of doing the same work.
- **Gentlest first.** The first ad is the one closest to what the person already knows, with the fewest unfamiliar words.
- **Three per page.** Not more.
- **Fresh for stage 3.** Stage 3 uses three new ads, not the stage 2 ones.

Good places: the job boards common in their country, employers' own career pages, and public sector job sites. Avoid ads from aggregators that hide the employer and the original text.

## Saving the ad's own words

Quotes and word-list terms must match the ad exactly, and `build_page.py` checks this. For that it needs the ad's own text, one file per job: `ads/<job id>.txt`.

Ways to get it, best first:
1. **The person or helper pastes it.** Always exact.
2. **Fetch it in the shell:** `python3 scripts/check_quotes.py fetch URL ads/<id>.txt`. Many job sites build the page in the browser, and then little text comes back. The script warns you when that happens.
3. **A browser tool** that returns the page text as it is.
4. **A web-fetch tool, only if it returns the text word for word.** Ask it for the full text of the ad, verbatim. If what comes back looks summarised or reworded, don't use it for quotes.

If you can't get an ad's own words, pick another ad. If that ad is the one that matters, mark the job `"unchecked": true` in stage 2 data. Use only rewordings (`"text"`, never `"wrote"`), leave the word list empty, and the page shows "Not checked word for word". Stage 3 always needs the ad's own words, because the must-or-wish lines are quotes.

**Pasted ads.** When the person pastes an ad, that text is the ad text. Save it as `ads/<job id>.txt` and leave `link` out if there's no web address. Use the date they pasted it as `checked`.

Never make up a quote, and never "fix" a quote's grammar or typos. If an ad has an obvious mistake (an unfilled `[[location]]`, a broken sentence), you may mention it in `know`. It shows the person that ads are written by busy people.

## Link, don't copy

The page links to the original ad and quotes only a few lines. Don't paste a whole ad into a page or a repository. The ad texts in `ads/` are working files for the check. Don't publish them.

## Things to note in "Good to know"

Things the ad leaves out or hides: whether it's an agency (and that the employer is unknown), missing salary, temporary cover, shift patterns, a location that isn't where the person lives, a placeholder someone forgot to fill. Plain facts, no judgement.
