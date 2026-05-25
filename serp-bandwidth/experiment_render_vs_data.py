"""
DECISIVE EXPERIMENT: are the 10 organic links present in Google's server-sent
HTML, even when JS is blocked and the page renders "broken"?

If YES  -> you can block ALL JS (gstatic + google /xjs/), parse the document,
           and land well under 100KB/search. No MITM, no caching needed.
If NO   -> rendering is genuinely required; use run_with_mitm.py instead.

This is the test your previous "blocking gstatic breaks searches" conclusion
did NOT make: validate() checked for rendered UI chrome, not for the data.

What it does per query:
  1. Warm a browser (accept cookies) so the session has consent cookies.
  2. BASELINE: full JS, measure on-wire bytes + links found in the DOM.
  3. JS-BLOCKED: block gstatic + google /xjs/, full-navigate to /search?q=...,
     measure on-wire bytes, then read BOTH:
        - the rendered DOM (page.get_content())
        - the raw server HTML (an in-page fetch of the same URL; this extra
          fetch is for inspection only and is NOT counted in the per-search
          on-wire number printed above it).
  4. Print a verdict.

Run:  PROXY_PORT=10001 python experiment_render_vs_data.py
      (omit PROXY_PORT to run direct/no-proxy for a quick local smoke test;
       a datacenter IP will likely be challenged, but the mechanics still run.)
"""
import asyncio
import os
from urllib.parse import quote_plus

import nodriver as uc

from bandwidth_monitor import BandwidthMonitor
from serp_parse import extract_organic

PROXY_HOST = "gw.dataimpulse.com"

CHROME_FLAGS = [
    "--disable-background-networking",
    "--disable-client-side-phishing-detection",
    "--disable-default-apps",
    "--disable-extensions",
    "--disable-sync",
    "--disable-translate",
    "--disable-component-update",
    "--disable-domain-reliability",
    "--no-first-run",
    "--no-default-browser-check",
    "--metrics-recording-only",
    "--safebrowsing-disable-auto-update",
    "--window-size=800,600",
]

# everything non-essential, PLUS all JS (gstatic search-next + google /xjs/)
JS_BLOCKED = [
    "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.ico", "*.svg",
    "*.woff", "*.woff2", "*.ttf", "*.eot", "*.css",
    "*.gstatic.com/*",            # search-next framework (39%)
    "*www.google.com/xjs/*",      # google JS bundles
    "*googletagmanager.com*", "*google-analytics.com*",
    "*googlesyndication.com*", "*doubleclick.net*", "*googleadservices.com*",
    "*youtube.com*", "*play.google.com*", "*apis.google.com*",
    "*ogs.google.com*", "*consent.google.com*", "*adservice.google.com*",
]

QUERIES = ["Tesco UK careers", "Barclays UK careers", "Microsoft UK careers"]


async def launch(blocked_urls):
    port = os.environ.get("PROXY_PORT")
    args = list(CHROME_FLAGS)
    if port:
        args.insert(0, f"--proxy-server=http://{PROXY_HOST}:{port}")
    browser = await uc.start(browser_args=args)
    page = await browser.get("about:blank")
    await page.send(uc.cdp.network.enable())
    await page.send(uc.cdp.network.set_blocked_ur_ls(urls=blocked_urls))
    mon = BandwidthMonitor()
    await mon.attach(page)
    # warm up + accept consent so the inspection fetch carries cookies
    page = await browser.get("https://www.google.com")
    await asyncio.sleep(3)
    try:
        btn = await page.find("Accept all", best_match=True)
        if btn:
            await btn.click()
            await asyncio.sleep(2)
    except Exception:
        pass
    return browser, page, mon


async def fetch_raw_server_html(page) -> str:
    """In-page fetch of the current URL -> raw server HTML (pre-JS)."""
    try:
        return await page.evaluate(
            "fetch(location.href, {credentials:'include'}).then(r => r.text())",
            await_promise=True,
        ) or ""
    except Exception as e:
        return f"__FETCH_FAILED__ {e}"


async def run():
    print("=" * 64)
    print("EXPERIMENT: are organic links in the server HTML with JS blocked?")
    print("proxy:", os.environ.get("PROXY_PORT", "(none / direct)"))
    print("=" * 64)

    browser, page, mon = await launch(JS_BLOCKED)
    verdicts = []
    try:
        for q in QUERIES:
            url = f"https://www.google.com/search?q={quote_plus(q)}&num=10&hl=en&gl=uk"
            mon.reset()
            page = await browser.get(url)          # full navigation, JS blocked
            await asyncio.sleep(3)

            per_search_kb = mon.bytes_total / 1024  # the number that matters
            rendered = await page.get_content()
            raw = await fetch_raw_server_html(page)  # inspection only (extra req)

            dom_links = extract_organic(rendered)
            srv_links = extract_organic(raw) if not raw.startswith("__FETCH") else []

            print(f"\n--- {q}")
            print(mon.report())
            print(f"  >> per-search on-wire (JS blocked): {per_search_kb:.1f} KB")
            print(f"  links in rendered DOM : {len(dom_links)}")
            print(f"  links in server HTML  : {len(srv_links)}  "
                  f"(raw {len(raw)} bytes)")
            for u in srv_links[:5]:
                print(f"      {u}")
            verdicts.append((len(srv_links), per_search_kb))
            await asyncio.sleep(1.5)
    finally:
        try:
            browser.stop()
        except Exception:
            pass

    print("\n" + "=" * 64)
    good = [v for v in verdicts if v[0] >= 8]
    if good:
        avg_kb = sum(k for _, k in good) / len(good)
        print("VERDICT: organic links ARE in the server HTML with JS blocked.")
        print(f"  -> block all JS, parse the document, skip rendering entirely.")
        print(f"  -> projected per-search on-wire ~{avg_kb:.0f} KB "
              f"(confirm on DataImpulse).")
    else:
        print("VERDICT: links NOT reliably in server HTML when JS is blocked.")
        print("  -> rendering is required; use run_with_mitm.py (cache gstatic),")
        print("     and note <100KB likely needs MITMing google.com /xjs/ too.")
    print("=" * 64)


if __name__ == "__main__":
    uc.loop().run_until_complete(run())
