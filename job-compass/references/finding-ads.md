# Finding and checking ads (steps 3 and 4)

## What to look for

- **Real and open.** Check each ad is still online on the day you build the page. Note the date: it goes into the data as `checked`.
- **In the kinds of work they liked,** from the quiz or from what they told you. Search with the search words from the quiz results. When an ad uses a title that isn't on the list but describes the same work, note it: it's a new search word for the hand-off.
- **Where they can work,** in a language they can read. Step 4 may include one ad in a second language they know, which is good practice.
- **At their level.** Entry and junior roles, or roles their stated experience fits. An ad that asks for ten years teaches nothing and stings.
- **Within their limits.** Check each ad against what they said they don't want and against their practical limits: commute, travel and nights away, hours, time at a desk, pay. An ad that breaks one of them teaches little and can sting. If you don't know yet whether they need full-time work, how soon they need an income or what pay they need, ask in one short question before you choose. If there are too few suitable ads, say so, and say why any ad outside their limits is on the page.
- **Varied.** Three ads that show different sides: different employers, sizes, or ways of doing the same work.
- **Gentlest first.** The first ad is the one closest to what the person already knows, with the fewest unfamiliar words.
- **Three per page.** Not more.
- **Fresh for step 4.** Step 4 uses three new ads, not the ones from step 3.

Good places: the job boards common in their country, employers' own career pages, and public sector job sites. Avoid ads from aggregators that hide the employer and the original text.

Many search results are old ads that are still listed. Prefer results that show a recent date, and skip anything older than about a month. If about ten searches haven't found three suitable open ads, stop and tell the person: offer a wider area or a nearby kind of work, or go ahead with fewer ads.

## You find the ads, not the person

Finding ads is your job. Never ask the person to search job sites or scroll through results: for someone who finds ads hard, that's the very thing the method protects them from. In the persona test, a person asked to "just collect" ads froze at the first requirement list and gave up. Send links you found. The person only ever opens an ad you picked.

Use only links that came from a search result or from a page you opened in this session. Never build an ad's address from a pattern, and never guess one. Send a link only if it opens the ad itself, not a list of jobs or a search page. A dead or wrong link is the quickest way to lose the trust of someone who already finds ads hard.

## Getting the ad's own words

Quotes, signal words and word-list terms must match the ad exactly, and `build_page.py` checks this against one text file per job: `ads/<job id>.txt`. Try these in order:

1. **A browser tool.** If this session has one (Claude in Chrome, or the built-in browser in the Claude desktop app), open the ad and read the page text with it. That text is the ad's own words. Read that tool's skill first if one is listed.
2. **The shell:** `python3 SKILL/scripts/check_quotes.py fetch URL ads/<id>.txt`. This often fails: many job sites block it or build the page in the browser. The script says so.
3. **A web-fetch tool, only if it returns the text word for word.** Most return a summary. If what comes back is summarised, shortened or translated, it is not the ad's own words.
4. **Text the person already has.** If they pasted an ad without being asked, use it: save it as `ads/<job id>.txt`, leave `link` out if there's no web address, and use the paste date as `checked`.

Keep this quick. Try each route once per ad, and don't spend more than a few minutes on it in total, because the person is waiting. A page marked "not checked word for word" today is better than a perfect page in half an hour.

If none of these gives you the exact words, **don't stop and don't ask the person to copy whole ads.** Go on with the honest unchecked version below. You may offer copying as an option for later ("if one of these catches your eye, you can paste its requirements part and I'll add the word list"), never as a condition.

## The unchecked version (step 3)

Mark the job `"unchecked": true`. Then:
- Write requirements only as rewordings (`"text"`), never as quotes (`"wrote"`).
- Leave out `signal`. You haven't seen the deciding word, so don't guess one. The build refuses a signal word on an unchecked job.
- Still set `tag` from your best reading. The page shows it as "Probably a must" or "Probably a wish", says the ad couldn't be checked word for word, and invites the person, once, to open the ad and find the deciding word themselves. That small exercise is the lesson. Don't repeat the invitation in `why`.
- Leave the word list empty. The page then doesn't promise one.
- Include every requirement you know of. A summary can miss lines, and the page says so, so never write as if the list were complete.
- Never write "the ad softens this with a word like…". If you don't know the word, say you don't.
- Don't describe the ad's wording or layout in `know` or `why` ("the ad sorts its lines into essential and desirable"). You haven't read it word for word, and the page says so.

## Step 4 without the exact words

Step 4 is about reading the original ad yourself, so it fits naturally: send the link, ask the person to read the ad, and to **paste only the two or three requirement lines they're unsure about**. That pasted text is the ad's own words. Save it as the ad text, and build the must-or-wish lines from exactly those lines. Explaining the lines they picked is better teaching than lines you chose. Don't ask for more than those lines: write the rest of the page (`short`, `week`, `know`) from what you could read, and take the word list only from words in what they pasted. If they don't want to paste anything, go through must or wish in the chat, based on what they tell you they saw.

Never make up a quote, and never "fix" a quote's grammar or typos. If an ad has an obvious mistake (an unfilled `[[location]]`, a broken sentence), you may mention it in `know`. It shows the person that ads are written by busy people.

## Link, don't copy

The page links to the original ad and quotes only a few lines. Don't paste a whole ad into a page or a repository. The ad texts in `ads/` are working files for the check. Don't publish them.

## Things to note in "Good to know"

Things the ad leaves out or hides: whether it's an agency (and that the employer is unknown), missing salary, temporary cover, shift patterns, a location that isn't where the person lives, a placeholder someone forgot to fill. Plain facts, no judgement.
