# Intake and kinds of work (stage 0 and 1a)

The quiz can only rank the kinds of work it is given. If the right one is missing, a clean result points the wrong way and nobody notices. So this step matters more than the quiz itself.

## 0. Intake

Keep it to a short conversation, five to ten questions at most, asked a few at a time. It is about facts and likes, not ability.

Ask about:
1. **What they did:** school, training, degree, jobs (including small ones), volunteering. Just the facts.
2. **What they enjoyed** in any of it, or in hobbies. Ask for moments, not traits: "a good day at work", "something you did that you were glad about".
3. **What they don't want:** shift work, sales targets, a long commute, working alone, sitting all day. These rule things out cleanly.
4. **Practical limits:** where they can work, languages, hours, whether they can move, how soon they need an income. Only as much as they want to share.
5. **Anything already on their mind:** a job they've wondered about, something people keep suggesting.

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

## 1a. Writing the candidates

Write **8 to 10** kinds of work. Rules:

- **Different days.** No two candidates may share the same main activity. "Sustainability consulting" and "Sustainability analysis" fail this test if both mean writing reports all day.
- **The mix:**
  - one that is the **shortest step** from where they are now
  - at least one drawn from an **interest outside work** (a hobby, volunteering, something they light up about)
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
- **More than 7:** ask which ones they're least curious about, or drop the ones closest to another kept one.
- **Fewer than 5:** that's information, not failure. Look at what was crossed out and what the note says, write 4 to 6 new candidates in the directions that survived, and offer a new list. Don't argue for anything they crossed out.
- **A note about something missing:** add it as a candidate if it's real, searchable work.

## Details for the quiz results

Each kind of work that goes into the quiz needs, besides `name` and `day`:

- `titles`: 3 to 6 job titles to search for, in the language the ads in their market use. Check that each title returns real results.
- `where`: one sentence on what kinds of employers hire for this.
- `bring` (optional): what the person already has for this, **only from stated facts**. Name the fact. If nothing stated fits, leave the field out. Don't fill it with flattery.
- `know` (optional): one useful, true thing, such as pay patterns, shift work, a recent change in the field, or how titles vary. Check anything that could be out of date with a quick search.
