#!/usr/bin/env python3
"""Open built pages in a headless browser and click through them, before anyone else sees them.

Usage:
  smoke_test.py PAGE.html [PAGE.html ...] [--screens DIR]

For each page it checks, at phone width (390 px):
  - the page starts (the "has not started yet" message is gone) and shows no script errors
  - nothing is wider than the screen
  - a full walk-through works: every button on the way to the summary, then "Copy"
  - the same in dark mode
  - with scripts switched off, the "has not started yet" message is shown instead of a blank page
With --screens it saves screenshots of the start and the end of each page.

Needs Playwright for Python with a Chromium browser. If that is missing, the script says so
and exits with code 3: then open each page yourself in a browser, on a phone if you can.
"""
import os
import sys

try:
    from playwright.sync_api import sync_playwright
except Exception:  # pragma: no cover
    print("skipped: Playwright is not installed here. Open each page in a browser yourself before sharing it.")
    sys.exit(3)

PHONE = {"width": 390, "height": 844}


def launch(p):
    exe = None
    for cand in ("/opt/pw-browsers/chromium", os.environ.get("JC_CHROMIUM", "")):
        if cand and os.path.isfile(cand):
            exe = cand
    try:
        return p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    except Exception as e:
        print("skipped: could not start a headless browser (%s). Open each page yourself before sharing it." % e)
        sys.exit(3)


def no_overflow(page):
    return page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")


def walk(page):
    """Click through to the summary like a person would. Returns a short description."""
    kind = page.evaluate("window.JC_DATA && window.JC_DATA.page")
    if kind == "pick":
        n = page.locator(".cand").count()
        for i in range(max(0, n - 6)):
            page.locator(".cand button").nth(i).click()
        page.fill("#note", "Something with animals, maybe.")
    elif kind == "quiz":
        total = page.evaluate("window.JC_DATA.questions.length")
        for i in range(total):
            if i == 3:
                page.click("#btn-next")  # skip one
            else:
                page.locator(".opt").first.click()
            page.wait_for_timeout(320)
        page.wait_for_selector(".dirs")
        page.click("#feel-partly")
    elif kind in ("ads-translated", "ads-less-help"):
        total = page.evaluate("window.JC_DATA.jobs.length")
        for i in range(total):
            if kind == "ads-less-help":
                page.locator(".word button").first.click()
                for btn in page.locator(".linecard .pick button:first-child").all():
                    btn.click()
                page.locator("button[id^=show-]").click()
            tasks = page.locator(".task")
            for k in range(min(4, tasks.count())):
                tasks.nth(k).click(force=True)  # the 4th tap must be refused (pick up to three)
            picked = page.locator('.task[aria-pressed="true"]').count()
            if picked > 3:
                raise AssertionError("more than three tasks could be picked")
            page.locator(".react button").first.click()
            page.click("#btn-next")
        page.wait_for_selector(".sum")
    else:
        raise AssertionError("unknown page type %r" % kind)
    page.click("#btn-copy")
    page.wait_for_function("document.getElementById('copy-status').textContent.length > 0")
    copied = page.evaluate("document.getElementById('copy-fallback').value")
    if not copied.startswith("Job Compass:"):
        raise AssertionError("the copied text does not start with 'Job Compass:'")
    return kind


def test_page(browser, path, screens):
    url = "file://" + os.path.abspath(path)
    name = os.path.splitext(os.path.basename(path))[0]
    problems = []
    for scheme in ("light", "dark"):
        ctx = browser.new_context(viewport=PHONE, color_scheme=scheme, permissions=["clipboard-read", "clipboard-write"])
        # Test the page as a standalone file with no network: web fonts are optional extras.
        ctx.route("**/*", lambda route: route.continue_() if route.request.url.startswith("file:") else route.abort())
        page = ctx.new_page()
        page.set_default_timeout(5000)
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" and "Failed to load resource" not in m.text else None)
        page.goto(url)
        page.wait_for_timeout(300)
        if page.locator("#app .waiting").count():
            problems.append("%s: the page did not start" % scheme)
        if not no_overflow(page):
            problems.append("%s: something is wider than a phone screen at the start" % scheme)
        if screens and scheme == "light":
            page.screenshot(path=os.path.join(screens, name + "-start.png"), full_page=True)
        try:
            kind = walk(page)
        except Exception as e:
            problems.append("%s: walk-through failed: %s" % (scheme, str(e).splitlines()[0]))
            kind = None
        if not no_overflow(page):
            problems.append("%s: something is wider than a phone screen at the end" % scheme)
        if screens and kind:
            page.evaluate("window.scrollTo(0,0)")
            page.screenshot(path=os.path.join(screens, "%s-end-%s.png" % (name, scheme)), full_page=True)
        problems += ["%s: script error: %s" % (scheme, e) for e in errs]
        ctx.close()

    ctx = browser.new_context(viewport=PHONE, java_script_enabled=False)
    ctx.route("**/*", lambda route: route.continue_() if route.request.url.startswith("file:") else route.abort())
    page = ctx.new_page()
    page.goto(url)
    if not page.locator("#app .waiting").is_visible():
        problems.append("no-script: the page would be blank instead of explaining what to do")
    ctx.close()
    return problems


def main(argv):
    screens = None
    if "--screens" in argv:
        i = argv.index("--screens")
        screens = argv[i + 1]
        os.makedirs(screens, exist_ok=True)
        argv = argv[:i] + argv[i + 2:]
    pages = argv[1:]
    if not pages:
        print(__doc__)
        return 2
    failed = 0
    with sync_playwright() as p:
        browser = launch(p)
        for path in pages:
            problems = test_page(browser, path, screens)
            if problems:
                failed += 1
                print("FAIL %s" % path)
                for x in problems:
                    print("  - " + x)
            else:
                print("ok   %s" % path)
        browser.close()
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
