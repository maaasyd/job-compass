# Changelog

Each version gets a few plain lines: what changed, and whether people who already installed it should update.

Version numbers: `0.1.1` for small fixes, `0.2.0` for new features, `1.0.0` once it has been tried by more people.

## 0.3.0 (2026-10-18)

From a test with four simulated people, a review, and a test drive with three more. Worth updating, mainly for the ad steps and a page bug in step 4.

- Claude finds the ads and sends links. It never asks the person to search job sites.
- When a browser tool is available, Claude uses it to read ads word for word.
- When an ad's exact words can't be read, the step still goes ahead. The page says so, shows "Probably a must" or "Probably a wish", never guesses the deciding word, and invites the person to find it in the ad. Before, this stopped every test run.
- In step 4 without exact words, the person pastes only the few lines they're unsure about.
- Translated pages: the page text can come from a file in the work folder (`--strings-file`). Signal words in other languages are marked as a first draft. Before, Claude had to copy the whole skill to translate a page.
- Shorter start for people who answer in a few words: one easy question at a time, and the first page sooner.
- Search words are capped at three per kind of work and eight overall.
- Smaller fixes: helper facts are named as such, the quiz shows a realistic time, the first list always includes one option from the person's hobbies, and examples in questions come from what the person said.
- The hand-off no longer suggests talking to someone who does the job as the main next step, because many people find that a big hurdle. It offers lighter options instead: a video of a normal day, first-hand accounts, a trial day, or the free public careers service where the person lives.
- When the browser test can't run, Claude relies on the build checks and asks the person to say if a page looks wrong.
- Claude only uses ad links from search results or pages it opened, never a guessed address.
- The README explains what the ad steps look like without a browser tool.
- A small website in `docs/` explains Job Compass and lets people click through the four example pages. It's published with GitHub Pages.
- SKILL.md shows the version and the licence, so you can tell which version is installed.
- The steps are numbered 1 to 4 everywhere, one number per page. The older entries below use the earlier numbering, where the ad steps were numbered 2 and 3.

From the test drive with three simulated people (an anxious graduate, a helper setting it up for her dad, and a career changer writing in German):

- Fixed a bug in step 4: the page showed a stray "null" before the explanation of every line without a deciding word. It had been there since the first version. The browser test now checks pages for broken text like this.
- Ads Claude couldn't read word for word: the page says the list of requirements may be incomplete, invites the person to look for the deciding word only once, no longer points to a word list that isn't there, and no longer says they read the ads "from start to finish".
- Claude checks each ad against the person's limits (commute, travel, hours, desk time, pay). If it doesn't know yet whether they need full-time work, how soon or for what pay, it asks before choosing ads.
- Finding ads stays quick. Claude skips old listings, tries each way of reading an ad once, says so when there are too few suitable ads, and only sends links that open the ad itself. In one run, building the page had taken 37 minutes.
- Claude never drops a kind of work the person kept without asking them.
- Intake: when someone answers only some of the questions, Claude asks the most important skipped one next, on its own. In one run, the person's location came only on the third try, and her pay and hours were never asked.
- Quiz results no longer tell the person to type the search words into job sites, and the quiz page has its own heading. When the person gave a pay floor, every kind of work says how its pay compares.
- Qualifications are named, for example NEBOSH, instead of "a well-known safety certificate".
- When the person has a real gap, the page names the realistic way people usually close it, when there is one.
- The summary comes as plain text a helper can forward as it is. It says when a search word usually pays below what the person needs, and why a kind of work near the top was left out.
- Translated pages use their own quotation marks, and the note under translated signal words is easier to understand.
- Smaller fixes: "Cross out 1 more, the one…" instead of "the ones", "on this phone or computer" instead of "in this browser", the copied text lists task kinds in the same order as the screen, a short intake still asks about hobbies, and the scripts no longer write cache files into the skill folder.

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
