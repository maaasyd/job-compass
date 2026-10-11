# Worked example (made up)

These files show the data for all four pages, filled in for one made-up person. Claude copies the format from here, and the scripts use the files as test data.

**The person (invented):** trained as a chef, six years in restaurant kitchens, wants daytime hours, enjoys ordering stock and dealing with suppliers, likes showing new cooks how things work.

**The ads (invented):** the six ads in `ads/` were written for this example. The companies don't exist, and the links point to example.com.

| File | Page |
|---|---|
| `1-pick.json` | Kinds of work to keep or cross out |
| `2-quiz.json` | The quiz, for the seven kinds of work that were kept |
| `3-ads-translated.json` | Three ads, translated |
| `4-ads-less-help.json` | Three ads, with less help |
| `ads/*.txt` | The ad texts the quotes are checked against |
| `pages/*.html` | The built pages. Open them in a browser to try them |

Rebuild everything from the skill's folder:

```
for f in 1-pick 2-quiz 3-ads-translated 4-ads-less-help; do
  python3 scripts/build_page.py examples/$f.json examples/pages/$f.html --ads examples/ads
done
python3 scripts/smoke_test.py examples/pages/*.html
```
