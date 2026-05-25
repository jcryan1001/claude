"""
Fallback for when rendering is required: cache gstatic JS in Chrome's disk cache
via a per-browser mitmproxy, so it stops re-downloading through DataImpulse.

Chain:  Chrome --proxy--> 127.0.0.1:LOCAL (mitmdump) --upstream--> DataImpulse --> Google

Per-browser sticky IP: the hot-standby model gives each browser its own
DataImpulse port (= its own residential IP). A single global mitmdump would pin
ONE upstream port = ONE IP and break that, so we spawn ONE mitmdump per browser,
each with its own --listen-port and its own --mode upstream:...:<dataimpulse_port>.

Selective MITM: --ignore-hosts tunnels google.com untouched (preserving Chrome's
TLS fingerprint to Google) and intercepts only gstatic. See cache_forcer.py.

Requires Linux (mitmproxy installs cleanly here, unlike the Windows attempt):
    pip install mitmproxy nodriver
Run:
    PROXY_PORT=10001 python run_with_mitm.py
"""
import asyncio
import os
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import quote_plus

import nodriver as uc

from bandwidth_monitor import BandwidthMonitor
from serp_parse import extract_organic

PROXY_HOST = "gw.dataimpulse.com"
ADDON = str(Path(__file__).with_name("cache_forcer.py"))

# tunnel (do NOT MITM) google.* to preserve Chrome's TLS to Google.
# gstatic.com is a different origin and is still intercepted/cached.
IGNORE_HOSTS = r"(?:^|\.)google\.(?:com|co\.uk)(?::443)?$"

CHROME_FLAGS = [
    "--ignore-certificate-errors",  # accept mitmproxy's cert for gstatic only
    "--disable-background-networking", "--disable-client-side-phishing-detection",
    "--disable-default-apps", "--disable-extensions", "--disable-sync",
    "--disable-translate", "--disable-component-update",
    "--disable-domain-reliability", "--no-first-run",
    "--no-default-browser-check", "--metrics-recording-only",
    "--safebrowsing-disable-auto-update", "--window-size=800,600",
]

CDP_BLOCKED = [
    "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.ico", "*.svg",
    "*.woff", "*.woff2", "*.ttf", "*.eot", "*.css",
    "*googletagmanager.com*", "*google-analytics.com*", "*googlesyndication.com*",
    "*doubleclick.net*", "*googleadservices.com*", "*youtube.com*",
    "*play.google.com*", "*consent.google.com*", "*adservice.google.com*",
]

QUERIES = ["Tesco UK careers", "Barclays UK careers", "Microsoft UK careers",
           "HSBC UK careers", "Vodafone UK careers", "BP UK careers"]


def _free_port() -> int:
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def _wait_port(port: int, timeout: float = 20.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return True
        except OSError:
            time.sleep(0.25)
    return False


def start_mitm(local_port: int, dataimpulse_port: int) -> subprocess.Popen:
    mitmdump = shutil.which("mitmdump") or "mitmdump"  # console script from pip install
    cmd = [
        mitmdump,
        "-s", ADDON,
        "--listen-host", "127.0.0.1",
        "--listen-port", str(local_port),
        "--mode", f"upstream:http://{PROXY_HOST}:{dataimpulse_port}",
        "--ignore-hosts", IGNORE_HOSTS,
        "--set", "ssl_insecure=true",
        "--set", "stream_large_bodies=5m",
        "-q",
    ]
    proc = subprocess.Popen(cmd, stdout=sys.stdout, stderr=sys.stderr)
    if not _wait_port(local_port):
        proc.terminate()
        raise RuntimeError(f"mitmdump did not open port {local_port}")
    return proc


async def launch_browser(dataimpulse_port: int):
    local_port = _free_port()
    mitm = start_mitm(local_port, dataimpulse_port)
    args = [f"--proxy-server=http://127.0.0.1:{local_port}"] + CHROME_FLAGS
    browser = await uc.start(browser_args=args)
    page = await browser.get("about:blank")
    await page.send(uc.cdp.network.enable())
    await page.send(uc.cdp.network.set_blocked_ur_ls(urls=CDP_BLOCKED))
    mon = BandwidthMonitor()
    await mon.attach(page)
    page = await browser.get("https://www.google.com")
    await asyncio.sleep(3)
    try:
        btn = await page.find("Accept all", best_match=True)
        if btn:
            await btn.click()
            await asyncio.sleep(2)
    except Exception:
        pass
    return browser, page, mon, mitm


async def search(browser, query: str):
    # type + Enter (the proven method)
    page = browser.main_tab
    box = await page.find("textarea", best_match=True)
    if not box:
        box = await page.select("input[name=q]")
    await box.click()
    await asyncio.sleep(0.3)
    await box.apply("function(e){e.select();}")
    await box.send_keys(query)
    await asyncio.sleep(0.4)
    for ev in ("keyDown", "keyUp"):
        await page.send(uc.cdp.input_.dispatch_key_event(
            type_=ev, key="Enter", code="Enter",
            windows_virtual_key_code=13, native_virtual_key_code=13))
        await asyncio.sleep(0.1)
    await asyncio.sleep(3)
    return await page.get_content()


async def run():
    dport = int(os.environ.get("PROXY_PORT", "10001"))
    print(f"upstream DataImpulse port {dport}; caching gstatic via per-browser mitmdump")
    browser, page, mon, mitm = await launch_browser(dport)
    try:
        for i, q in enumerate(QUERIES, 1):
            mon.reset()
            html = await search(browser, q)
            links = extract_organic(html)
            print(f"\n#{i} {q}")
            print(mon.report())
            print(f"  >> on-wire {mon.bytes_total/1024:.1f} KB, "
                  f"{len(links)} organic links "
                  f"(gstatic should be ~0 KB after search #1)")
            await asyncio.sleep(1.5)
    finally:
        try:
            browser.stop()
        finally:
            mitm.terminate()


if __name__ == "__main__":
    uc.loop().run_until_complete(run())
