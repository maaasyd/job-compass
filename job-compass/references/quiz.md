# The quiz (stage 1b)

The quiz asks only about preferences. Each question offers four options, and each option belongs to one kind of work. The person picks the one that sounds nicest, or skips.

## Fair by construction

A quiz is fair when every kind of work is offered equally often and every pair meets equally often. Then no option gets an easier run, and "picked 5 of 8" means the same for each one. Don't arrange the questions by hand. Get the slots from the script:

```
python3 scripts/check_quiz.py layout safety buying production development teaching sales care
```

| Kept | Questions | Each offered | Each pair meets |
|---|---|---|---|
| 7 | 14 | 8 times | 4 times |
| 6 | 15 | 10 times | 6 times |
| 5 | 10 | 8 times | 6 times |

Write each question for exactly the four kinds of work in its slot. Order inside a question doesn't matter, because the page rotates the options.

## Writing questions

Mix these question types, so the quiz doesn't feel repetitive:
- **A moment:** "Which Tuesday morning sounds nicest?"
- **A finished result:** "Which finished piece of work would make you proudest?"
- **A scenario from their field:** "A café wants to throw away less food. Which part is yours?" Each option is that kind of work's part in the same situation.
- **Daily shape:** contact with people, how the week looks, which pressure they could live with.
- **A compliment** that would mean the most.
- **A memory** from their own past ("Think of a good day in a kitchen. What made it good?"). Add a hint like "Any good day counts, even a small one."

Rules for options:
- **Activities, not skills.** "Working out why the same complaint keeps coming in" rather than "Strong analytical skills".
- **Equally appealing.** Each option needs one concrete upside. No option should sound obviously better, harder or more important. Avoid status words (lead, strategic, senior, expert, best). The checker flags them.
- **Similar length.** Long options win more often. The checker flags an option much longer than the shortest one.
- **Equally doable.** Don't make one option sound like it needs years of training and another like day one.
- **No traps.** Every option should be something a reasonable person might pick.
- **Pressure questions** offer four different kinds of pressure, all real. Not "no pressure" against "lots".

Then do a review pass: read each question as the person would, and ask "would one of these jump out for reasons that have nothing to do with liking the work?" Fix any that would.

## Data for the `quiz` page

```json
{
  "page": "quiz",
  "title": "Kinds of work quiz",
  "directions": [
    { "id": "buying", "name": "Buying & suppliers", "day": "…", "titles": ["Assistant Buyer", "Purchasing Assistant"], "where": "…", "bring": "…", "know": "…" }
  ],
  "questions": [
    { "q": "How much contact with people do you want in a working day?", "hint": "optional", "options": [
      ["safety", "Some, mostly short visits and talks about what I found"],
      ["buying", "Lots of calls and emails with suppliers, from a desk"],
      ["teaching", "A room full of people for most of the day"],
      ["care", "A small team I know well, and the people we cook for"]
    ] }
  ]
}
```
See `intake-and-directions.md` for `titles`, `where`, `bring` and `know`. Full example: `examples/2-quiz.json`. Check before building: `python3 scripts/check_quiz.py check quiz.json`.

## Reading the results

The copied text lists each kind of work with "picked X of Y", the number skipped, and the answer to "Does one of these feel right?".

- Talk about the **top two or three**, and about the descriptions more than the numbers. Ask which description felt right when they read it.
- **Close top two:** common. Many real jobs mix both. Pick ads that combine them in stage 2.
- **Many skips:** the questions didn't land. Ask what was missing rather than reading much into the ranking.
- **"Partly":** ask which part fits. That usually points to a narrower kind of work.
- **"Not really":** go back to 1a with new candidates, built from what they picked and skipped. Say plainly that this is useful information.

Never describe the person through the results ("you're an analytical type"). The results describe kinds of work, not people.
