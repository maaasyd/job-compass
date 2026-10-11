# Signal words: must or wish (English)

Job ads mix fixed requirements with things the employer would simply like. A few small words decide which is which. People who are new to ads, or anxious about them, tend to read every line as a must. The trial showed this clearly, and it can stop people from applying for jobs they could get.

The pages show a short version of this list (from `assets/strings/en.json`, `signals`). Use the full list when writing `tag`, `is` and `signal`.

## A wish
- "is a plus", "would be a plus", "a bonus", "would be a bonus"
- "preferred", "is preferable", "preferably"
- "ideally"
- "an advantage", "would be an advantage", "advantageous"
- "desirable", "is desirable"
- "nice to have", "would be nice", "would be great"
- "beneficial", "helpful"
- "or willingness to learn", "or a willingness to complete it" (this turns a must into a wish)
- "we will support you to achieve it", "training provided" (often turns a qualification into a wish)
- "not required", "not essential", "but not required"

## A must
- "required", "is required", "must have", "you must"
- "essential", "is essential"
- "mandatory"
- "minimum", "at least"
- A plain statement with no softening word at all: "Excellent Excel skills", "Full driving licence". In a requirements list, no softener means must.

## A small must
A must, but a little is enough:
- "first experience", "some experience", "initial experience"
- "basic knowledge", "basic", "familiarity with", "an understanding of"

## Hard to measure
Lines that describe the person the employer imagines. Nobody can check them, so they shouldn't count against anyone:
- "excellent communication skills", "a team player", "a passion for…", "a creative mindset", "a can-do attitude", "self-motivated", "able to work in a fast-paced environment"

## Tricky cases
- **Two in one line:** "3 years' experience, ideally as a team leader". The years are a must, and the team-leader part is a wish. Say so.
- **Levels:** "excellent" or "fluent" raises a must. "Good" is ordinary.
- **Lists under "Nice to have" or "Bonus points" headings:** everything under such a heading is a wish, even without a signal word. The heading isn't part of the quoted line, so leave `signal` out and name the heading in `why`.
- **Years of experience:** often a guide rather than a gate, especially for junior roles. Don't promise that. Say "worth asking" where it fits.

## Other languages
This list is checked for English only. When an ad is in another language, you may still explain its musts and wishes, but write in `why` that the signal words for that language haven't been checked by a native speaker. Contributions of checked lists for other languages are welcome. See the README.
