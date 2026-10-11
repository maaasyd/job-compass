# Stage 3: ads with less help

Three new ads. This time the person reads the original first, and the page only helps when asked. Per job:

1. **Read the ad.** Opens in a new tab.
2. **Words.** The word list is closed. The person opens only the words they want explained. The number opened is information for you, not a score.
3. **Must or wish?** Three quoted lines. The person guesses, then sees what the wording says and why.
4. **Their own picture.** Before seeing the plain version, they say in their own words what the job is. Then they compare it with the plain summary, a week of tasks (pick up to three) and the "good to know" facts.

## Choosing the three must-or-wish lines

This is the core lesson, so choose carefully:
- **Mix musts and wishes** in each ad. At least one of each.
- **Include the tricky kinds:** a wish phrased like a condition ("is preferable"), a line that holds a must and a wish together ("3 years' experience, ideally as a team leader"), a small must ("first experience"), a hard-to-measure line.
- **Copy each line exactly** as it stands in the ad, even if it's clumsy. The build checks it. A line may be part of a sentence, if that part is copied exactly.
- `is`: `must` or `wish`. Treat a small must as `must`, and say in `why` that a little is enough.
- `signal`: the deciding words, copied from the line (leave it out for a plain must with no signal word).
- `why`: why the wording means what it means. Don't say whether the person has it. This stage is about reading, not about them.

## The rest of the data

Same as stage 2 (`week`, `words`, `short`, `know`, `facts`, `link`), with these differences:
- No `plain` heading: the page shows the ad's own title, because the person reads the ad first.
- `words` may be a little longer (6 to 11 terms), because the person chooses.
- `link` may be left out for an ad the person pasted. Step 1 then asks them to read the ad they found.
- Top-level `"afterStage2": false` when the person didn't do stage 2. The page then doesn't refer to "the first round".

```json
{
  "page": "ads-less-help",
  "title": "Three jobs, with less help",
  "checked": "2026-10-11",
  "jobs": [ { "id": "planner", "title": "Production Planner", "employer": "…", "facts": ["…"], "link": "https://…",
              "words": [["line capacity", "…"]],
              "lines": [{ "wrote": "Knowledge of SAP or a similar ERP system would be an advantage", "is": "wish", "signal": "would be an advantage", "why": "…" }],
              "short": "…", "week": [["org", "…"]], "know": ["…"] } ]
}
```
Full example: `examples/4-ads-less-help.json`.

## Reading what comes back

- **Words opened:** fewer than in stage 2 means the language is becoming familiar. Notice which words they opened. Those are the ones to explain again in the hand-off, briefly.
- **Must or wish:** look for a pattern, not a score. Reading wishes as musts is the most common and most useful finding. If you see it, point to the signal words once more, kindly: "'Is preferable' sounds like a condition, but it's a wish."
- **Reactions and tasks:** combine them with stage 2. Together they show which kind of work, which tasks, and which settings (hours, size, place) the person keeps choosing.
