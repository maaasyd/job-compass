# Step 3: ads translated

Three real ads, each rewritten so that someone outside the field understands what the job is, what a week looks like, and which requirements actually matter. Everything is explained. The person's only job is to notice what sounds good.

## Per job

- `plain`: the job in plain words, as the page's main heading. Say what you'd actually do. "Checking that a food factory makes safe food", not "Quality Assistant".
- `title` and `employer`: as in the ad. If it's an agency hiding the employer, say so: "a company hiring through the agency X".
- `facts`: 2 to 4 short chips such as place, contract, hours, pay (if shown) or language.
- `short`: 2 to 3 sentences. What the organisation does, what problem this job solves for them, and what you'd do.
- `week`: 5 to 7 tasks, each `[kind, text]`. Write each as something you'd do on a normal day, starting with a verb. Kinds: `data` (numbers & data), `write` (reading & writing), `org` (organising), `check` (checking & rules), `people` (working with people), `hands` (hands-on work), `create` (making & designing). The page asks the person to **pick up to three**. In the trial, "tap anything" stopped being informative once someone tapped nearly everything.
- `words`: 5 to 9 terms from the ad, `[term, meaning]`. Copy each term exactly as the ad writes it, since the build checks it. Explain it in one or two plain sentences, and say what it means *in this job* if that differs from everyday use. Include insider words, acronyms, and ordinary-looking words with a special meaning ("lines" meaning products).
- `asks`: what they ask for, 3 to 6 lines. See below.
- `know`: 2 to 4 short facts the ad leaves out or that matter: agency, no salary shown, temporary, shifts, where the job really is, a clear perk.
- `link`: the original ad. Leave it out only for an ad the person pasted without a web address.
- `unchecked: true`: when you couldn't get the ad's own words. Then: rewordings only, no `signal`, no word list. Tags show as "Probably a must / wish". See `finding-ads.md`.

Optional page-level fields: `pickMax` (how many tasks can be picked, default 3; keep 3 unless there's a reason) and `pageId` (normally left out; the build makes one, so saved progress from different pages never mixes).

## The requirements (`asks`)

Each line has:
- `tag`: one of
  - `must`: a fixed requirement. Signal words like "required", "essential", "mandatory", or a plain statement with no softening word.
  - `wish`: something they'd like. Signal words like "is a plus", "preferred", "ideally", "an advantage", "desirable".
  - `small`: a must where a little is enough ("first experience", "basic knowledge").
  - `neither`: can't be measured ("excellent communication skills", "a passion for…").
- `wrote` **or** `text`: `wrote` is an exact quote from the ad, checked by the build. `text` is your rewording, used for long or scattered requirements. Use quotes for the lines that teach something, especially wishes.
- `signal` (when there is one): the exact deciding words, copied from the quote, e.g. `"is a plus"`. The page shows "The word that decides it: 'is a plus'". This is how the person learns the signal words, so include it for every wish.
- `have: true`: only when a stated fact clearly meets the line. The `why` then names that fact ("Your six years in restaurant kitchens are exactly this."). If unsure, leave it out.
- `why`: one or two sentences. What it means, and, for a gap, why it may matter less than it looks. Be honest about real gaps too: "This is the one line where you'd be at the low end." Then add the reassurance only if it's true. If there's a realistic way people usually close the gap, name it (for example, that volunteer experience counts and archives often take volunteers), so the line doesn't end on the gap alone.

Put the most reassuring true line first, if there is one. Mix musts and wishes so the signal-word box has something to teach.

## Data

```json
{
  "page": "ads-translated",
  "title": "Three jobs, translated",
  "checked": "2026-10-11",
  "jobs": [ { "id": "quality", "plain": "…", "title": "…", "employer": "…", "facts": ["…"], "short": "…",
              "week": [["check", "…"]], "words": [["HACCP", "…"]],
              "asks": [{ "tag": "wish", "wrote": "HACCP Level 3 is desirable, or a willingness to complete it", "signal": "is desirable", "why": "…" }],
              "know": ["…"], "link": "https://…" } ]
}
```
Full example: `examples/3-ads-translated.json`. Build with `--ads ads/`.

## Reading what comes back

The copied text gives a reaction per job (I'd like this / Not sure / No thanks), the tasks picked, and the count per kind of work.
- The **picked tasks** say more than the reactions. Use their kinds to choose the ads for step 4.
- "No thanks" to all three is useful. Ask what put them off: the work itself, or something in the ad (hours, place, level)?
- If they liked everything, ask for the one they'd look at first, and why.
