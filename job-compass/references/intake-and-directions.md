# Intake and kinds of work (step 1)

The quiz can only rank the kinds of work it is given. If the right one is missing, a clean result points the wrong way and nobody notices. So this step matters more than the quiz itself.

## Intake

Keep it to a short conversation, five to ten questions at most, asked a few at a time. It is about facts and likes, not ability.

**Confirm, don't assume.** You may know things from memory, earlier conversations or a profile. Those describe the account owner, who is often not the person this is for: in helper mode never, and when testing or helping a friend not either. So don't carry any fact into the intake unasked. If the person is the account owner and you know something useful, say it and ask: "You mentioned you live in X. Is that where you want to work?" Always ask where they want to work. Never fill it in.

Ask about:
1. **What they did:** school, training, degree, jobs (including small ones), volunteering. Just the facts.
2. **What they enjoyed** in any of it, or in hobbies. Ask for moments, not traits: "a good day at work", "something you did that you were glad about".
3. **What they don't want:** shift work, sales targets, a long commute, working alone, sitting all day. These rule things out cleanly.
4. **Practical limits:** where they can work, languages, hours, whether they can move, how soon they need an income. Only as much as they want to share.
5. **Anything already on their mind:** a job they've wondered about, something people keep suggesting.

**How to ask.**
- Open questions for what they did and what they enjoyed. Don't offer ready-made answers there, because those put words in people's mouths.
- For "what you don't want" and practical limits, short options help: shift work, sales targets, sitting all day, long commute, working alone, and so on. If your environment can show tap-to-answer questions, use it for these, always with room for their own answer. Otherwise list the options in one line.
- **Always end the intake with: "Anything else you'd like me to know?"** Some of the most useful facts only come out here.
- **Match the person's length.** If answers come back in a few words ("keine ahnung", "dunno"), switch to one concrete, easy question at a time ("What was a good day at the hostel?"). Don't repeat a question they skipped more than once; move on. If they answer only some of several questions, that was too many at once: ask the most important one they skipped next, on its own. Aim to have the first page ready within about five of their messages. Even then, ask once about something they do for fun, because the first list needs one option from outside work. The cross-out page itself is a way to learn what they like, so you don't need every fact first.
- **Examples come from them.** When you give examples in a question, take them from what they said, or keep them neutral. Don't introduce topics they never mentioned (social media, design, a particular industry), because that steers them.

Then say back in two or three lines what you heard, and let them correct it. Use only what they (or their helper) said. Don't fill gaps with guesses about personality or ability.

In helper mode, note which facts came from the helper. If the person disagrees with any of them later, the person wins.

## The work modes

A kind of work is defined by what a normal day looks like, not by its industry or title. To cover any field, start from these modes and apply them to the person's field and background:

| Mode | A normal day is mostly… |
|---|---|
| Analysing | working with numbers and data to answer a question |
| Checking & rules | checking that things are correct, safe or follow the rules |
| Advising | helping someone else make a decision, project by project |
| Coordinating | keeping a plan, a project or a team moving |
| Improving how things run | finding why problems keep happening and fixing the cause |
| Looking after customers / selling | conversations with customers, keeping them happy, winning new ones |
| Teaching, training & care | helping people learn, recover or feel better |
| Researching & writing | reading, finding out, explaining in writing |
| Making & building | hands-on work: cooking, building, repairing, growing |
| Creating & communicating | design, photos, video, writing for an audience |
| Buying & supplying | choosing what to buy, from whom, at what price |
| Running a place | being responsible for a shop, site, kitchen or team day to day |

## Step 1: writing the candidates

Write **8 to 10** kinds of work. Rules:

- **Different days.** No two candidates may share the same main activity. "Sustainability consulting" and "Sustainability analysis" fail this test if both mean writing reports all day.
- **The mix:**
  - one that is the **shortest step** from where they are now
  - at least one drawn from an **interest outside work** (a hobby, volunteering, something they light up about). Do this even when the hobby seems unrelated to paid work or pays badly as a job: combine the hobby's world with their skills and limits. Karate and fishing plus account management and a pay floor can become "looking after customers for a sports or outdoor brand".
  - one **less obvious** option, to widen the field
  - the rest from their training, education or field
- **Respect the "don't want" list.** If they said no sales targets, don't offer a sales job as one of the candidates. You may offer a nearby one (customer care) and say how it differs.
- **Real, searchable work.** Each one must correspond to jobs that exist in their market. Do a quick search for two or three typical job titles in their region before you include it.
- **Name:** short and plain, using `&` for pairs: "Buying & suppliers".
- **Day:** one or two sentences in "you" form, describing what you actually do. No status words (lead, strategic, senior), no jargon.

Don't include degree-gated jobs the person can't reach without years of new study (doctor, lawyer) unless they raised it themselves.

### Data for the `pick` page

```json
{
  "page": "pick",
  "title": "Kinds of work",
  "candidates": [
    { "id": "buying", "name": "Buying & suppliers", "day": "You decide what a company buys, compare prices, talk to suppliers and make sure the right ingredients arrive on time." }
  ]
}
```
`id`: short, lowercase, dashes allowed. Full example: `examples/1-pick.json`.

### Reading what comes back

The copied text lists what they kept, what they crossed out, and an optional note.
- **5 to 7 kept:** write the quiz for exactly those (see `quiz.md`).
- **More than 7:** ask which ones they're least curious about. Don't drop one of their kept ones yourself, not even to make room for something from their note. The person makes every choice on these lists.
- **Fewer than 5:** that's information, not failure. Look at what was crossed out and what the note says, write 4 to 6 new candidates in the directions that survived, and offer a new list. Don't argue for anything they crossed out.
- **A note about something missing:** add it as a candidate if it's real, searchable work. If that takes the list over 7, ask which one to drop, in the same message as anything else you need to ask.

## Details for the quiz results

Each kind of work that goes into the quiz needs, besides `name` and `day`:

- `titles`: 3 to 6 job titles to search for, in the language the ads in their market use, because that's what they will type into job sites. Check that each title returns real results. Write a title as plain text when it explains itself, or as `{"title": "…", "meaning": "…"}` when it doesn't:
  - **Always add a meaning when the title is in a different language from the page.** "Fachkraft für Veranstaltungstechnik" needs "event technician, a three-year apprenticeship".
  - Also add one when a title hides what the job is ("Business Development Chef": a chef who cooks with a supplier's products to show restaurants what they can do).
  - Keep the meaning short and plain, in the page's language.

  The titles of the top kinds of work become the person's **search words** at the end of the quiz, so choose them with care: they are the main result of steps 1 and 2. **Put the best search term first.** The search-words box shows only the first three titles of each kind of work, and eight at most.
- `where`: one sentence on what kinds of employers hire for this.
- `bring` (optional): what the person already has for this, **only from stated facts**. Name the fact. If nothing stated fits, leave the field out. Don't fill it with flattery. In helper mode, say when a fact came from the helper: "Sandra says customers like how calmly you explain things."
- `know` (optional): one useful, true thing, such as pay patterns, shift work, a recent change in the field, or how titles vary. Check anything that could be out of date with a quick search. If the person gave a pay floor or said they need full-time work, `know` says how this kind of work usually compares, for every kind of work in the quiz, because any of them can come out on top.
