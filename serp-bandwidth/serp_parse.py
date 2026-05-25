"""
Extract organic result URLs from a Google SERP.

Heuristic regex extractor with no heavy deps. The reliable signal for an
organic result is an <a href="..."> whose anchor contains an <h3> title.
For production, swap to selectolax/bs4 for robustness against markup drift.

Usage standalone:  python serp_parse.py some_saved_serp.html
"""
import re
import sys
from urllib.parse import unquote

# hosts that are never an organic result
_SKIP_HOST = re.compile(
    r"(?:^|//|\.)(google\.[a-z.]+|gstatic\.com|googleusercontent\.com|"
    r"googleadservices\.com|googlesyndication\.com|webcache\.googleusercontent\.com)",
    re.I,
)


def extract_organic(html: str, limit: int = 10) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()

    def add(u: str):
        u = unquote(u).strip()
        if not u.startswith("http"):
            return
        if _SKIP_HOST.search(u):
            return
        if u in seen:
            return
        seen.add(u)
        out.append(u)

    # 1) modern rendered/server markup: <a ... href="REAL"> ... <h3 ...>
    #    require an <h3> within a short window after the anchor open tag.
    for m in re.finditer(
        r'<a\s[^>]*?href="(https?://[^"#]+)"[^>]*>(?:(?!</a>).){0,500}?<h3[\s>]',
        html,
        re.I | re.S,
    ):
        add(m.group(1))

    # 2) consent / js-off redirect form: href="/url?q=REAL&..."
    for m in re.finditer(r'href="/url\?q=(https?://[^&"]+)', html, re.I):
        add(m.group(1))

    return out[:limit]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python serp_parse.py <serp.html>")
        raise SystemExit(2)
    with open(sys.argv[1], "r", encoding="utf-8", errors="replace") as f:
        html = f.read()
    links = extract_organic(html)
    print(f"{len(links)} organic links in {sys.argv[1]} ({len(html)} bytes):")
    for i, u in enumerate(links, 1):
        print(f"  {i:2d}. {u}")
