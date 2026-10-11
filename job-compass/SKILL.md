---
name: job-compass
description: Helps someone who is stuck before the job search even starts. They don't know which kind of job they want, or reading job ads overwhelms or discourages them. Builds short, phone-friendly pages in four steps (kinds of work to cross out, a fair quiz about what they'd enjoy, three real job ads translated into plain words, three more ads read with less help) and ends with a summary and search words. Use it whenever someone says they don't know what job they want, feels lost about their career, finds job ads confusing or off-putting, has just finished school, training or university without a direction, wants to change careers but doesn't know to what, or when a partner, friend, parent or coach wants to help someone with any of this. Not for CV writing, applications or interview prep.
---

# Job Compass

Job Compass is for the time before the job search. The person doesn't know yet which kind of work they want, and job ads make it worse, because they read like lists of reasons not to apply. The skill gives them a few small, safe steps: find out which kinds of work appeal, then learn to read real job ads, with less help each time. At the end, they know what they like and which words to search for.

It is not therapy, not a psychological test and not a career assessment. It asks about preferences, never about ability, and the person is the one judging the jobs.

## The rules, and why they matter

These came out of the first trial. Each one is there because something went wrong without it, or went right with it.

- **Preferences only.** Nothing tests what the person can do. Testing ability turns exploring into being judged, and judged people stop exploring.
- **Nobody is applying today.** Say it before every ad. It's the one sentence that made reading ads feel safe in the trial.
- **Three ads, not ten, gentlest first.** The first ad should be the closest to what the person knows.
- **Remove help step by step.** Stage 2 explains everything. Stage 3 lets the person ask for only what they need.
- **Teach must versus wish early.** In the trial, soft wording like "is preferable" was read as a hard condition, and that was the main thing that made ads feel out of reach. The signal words go in stage 2, not only at the end.
- **No score that can sting.** Show a count only when it is high. Never rank the person.
- **Nothing is claimed about the person** that they or their helper didn't say. "What you already bring" and "You have this" must point to something stated. If nothing was stated, leave it out.
- **Quotes are exact and checked.** Every quoted line and every word-list term must appear in the ad's own text, and the build script checks this. Link to the original ad. Never copy a whole ad into a page.
- **Say when the ads were checked.** Ads close. Every ad page shows the date.
- **Plain language everywhere.** The page's own text has no jargon. Jargon belongs in the word lists, where it gets explained. See `references/plain-language.md`.

## Before you start

Read `references/care-and-limits.md` once per conversation. It says when to stop the exercise and simply talk to the person. Some people who use this are in real distress about work, and that matters more than finishing a stage.

## How a session runs

| Step | What happens | Read | Page |
|---|---|---|---|
| 0. Intake | A short conversation: background, what they enjoyed, what they don't want, practical limits | `references/intake-and-directions.md` | none |
| 1a. Kinds of work | 8–10 kinds of work, one sentence each. The person crosses out what feels wrong and keeps 5–7 | `references/intake-and-directions.md` | `pick` |
| 1b. Quiz | A fair quiz built from the kept list. Results show a normal day, titles to search, and what they bring | `references/quiz.md` | `quiz` |
| 2. Ads translated | Three real, open ads in plain words: a week of tasks, a word list, musts and wishes marked | `references/finding-ads.md`, `references/ads-translated.md`, `references/signal-words.md` | `ads-translated` |
| 3. Ads with less help | Three new ads. Read the original first, open only the words needed, guess must or wish, picture the job, then compare | `references/finding-ads.md`, `references/ads-less-help.md`, `references/signal-words.md` | `ads-less-help` |
| Hand-off | What they like, the search words that follow, and one person to talk to | `references/handoff.md` | none |

Each page ends with a "Copy" button. The person pastes the result back to you (or to their helper, who passes it on). Read it before building the next page. It tells you what they kept, picked, skipped and guessed.

**Start where the person is.** Every stage works on its own:
- They have no idea at all: start at 0.
- They have a kind of work in mind but ads scare them: do a short intake, then go to stage 2 for that kind of work.
- They can read ads but keep mixing up musts and wishes: stage 3 on its own works (set `"afterStage2": false`).
- After a quiz result of "Not really": go back to 1a with new kinds of work, using what they crossed out and skipped.

Suggest one stage per sitting. A stage takes 10 to 30 minutes, and a break between stages is part of the method, not a delay.

## Helper mode

Sometimes a partner, friend, parent or coach sets this up for someone else. Then:
- The helper supplies the intake facts. Record what came from them, and use only that in "What you already bring".
- The person still makes every choice on the pages. The helper's hopes must not pick the kinds of work, so the person crosses out their own list in 1a.
- The pages work without a Claude account. The helper sends the file or link, and the person sends back the copied text.
- The results belong to the person. Tell the helper to let the person decide whether to share them.

## Building and sharing a page

Never write page HTML by hand. Write a data file, then build.

`SKILL` below means the folder this SKILL.md is in. In Claude Code and Cowork, that is `${CLAUDE_SKILL_DIR}`. Don't write into it, because it may be read-only. Keep all working files in one folder in your current working directory, `job-compass-work/`:

```
job-compass-work/
  1-pick.json  2-quiz.json  3-ads.json  4-ads.json      the data you write
  ads/<job id>.txt                                      each ad's own text, for the quote check
  pages/                                                the built pages
```

1. Write the data as JSON. The field formats are in each stage's reference file. Complete examples are in `SKILL/examples/` (a made-up person and made-up ads).
2. For ad pages, save each ad's own text as `job-compass-work/ads/<job id>.txt`. See `references/finding-ads.md`.
3. Build: `python3 SKILL/scripts/build_page.py job-compass-work/2-quiz.json job-compass-work/pages/2-quiz.html --ads job-compass-work/ads`. The script checks the data, the quiz's fairness and every quote and term, and refuses to build if anything is wrong. Read the warnings too: most are about plain language.
4. Test: `python3 SKILL/scripts/smoke_test.py job-compass-work/pages/2-quiz.html`. It opens the page at phone width, clicks through it, and checks dark mode and the no-script message. If it says Playwright is missing, open the page in a browser yourself before sharing it.
5. Share it as the environment allows: publish it as a page, or send the file. `references/delivery.md` covers both, including the standalone file for someone without Claude.

Two bugs reached a real person in the first trial because a page was changed by hand after testing. Rebuild and retest after every change.

**Without web access** you can't search for ads or check them online. Ask the person (or helper) to paste three ads they found, and save each pasted text as the ad text. Use the paste date as `checked`, leave `link` out, and confirm with them that the job titles are right. Everything else works the same.

## Files

- `scripts/build_page.py`: data → one self-contained page (runs all checks)
- `scripts/check_quiz.py`: `layout` prints which kinds of work go into each question. `check` tests fairness
- `scripts/check_page.py`: data and plain-language checks
- `scripts/check_quotes.py`: quotes and terms against the ad text, plus a `fetch` helper
- `scripts/smoke_test.py`: headless browser test
- `assets/`: the page shell, styles, shared code, page scripts and page text (`strings/en.json`). Don't edit these during a session
- `examples/`: worked data for all four pages, made-up ad texts, and the built pages
