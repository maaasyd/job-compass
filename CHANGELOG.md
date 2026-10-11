# Changelog

Each version gets a few plain lines: what changed, and whether people who already installed it should update.

Version numbers: `0.1.1` for small fixes, `0.2.0` for new features, `1.0.0` once it has been tried by more people.

## 0.2.0 (2026-10-11)

From the first test runs. Worth updating.

- Claude no longer carries facts about the person over from memory or earlier chats. It asks, or confirms what it knows, and in helper mode it asks for everything. Before, a test person was assumed to want to work in the account owner's country.
- The intake always ends with "Anything else you'd like me to know?". Short options are offered only for what the person doesn't want and for practical limits. What they enjoyed stays an open question.
- Job titles can carry a short meaning. Titles in another language always get one, e.g. "Fachkraft für Veranstaltungstechnik: event technician, a three-year apprenticeship".
- The quiz results end with "Your search words": the titles of the top kind of work and any close behind it. They are included in the copied results and used to find the ads in steps 2 and 3.
- After copying, the page says where to paste it.

## 0.1.0 (2026-10-11)

First public version.

- Four pages: kinds of work to cross out, a fair quiz, three ads translated, three ads with less help.
- Kinds of work are confirmed by the person before the quiz is written. A "None of these feels right" answer leads to new ones.
- Must-or-wish signal words are taught from the first ad, with the deciding word shown for every requirement.
- "Pick up to three" tasks per job, instead of tapping everything.
- Every page explains what to do when a preview blocks scripts.
- Scripts check the data, the quiz's fairness and every quote against the ad before a page is built, and a browser test clicks through each page at phone width.
- Signal words are checked for English only.
