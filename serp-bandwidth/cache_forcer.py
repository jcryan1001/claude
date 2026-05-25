"""
mitmproxy addon: make Chrome cache Google's JS so it stops re-downloading it
through the residential proxy every search.

Mechanism: rewrite the response headers on cacheable JS so Chrome stores it as
immutable. On later searches Chrome serves from its own disk cache -> those
bytes never touch the upstream (DataImpulse) proxy.

By default only gstatic.com is rewritten. gstatic is a separate origin from
google.com, so when this runs behind `--ignore-hosts google\.(com|co\.uk)`
(see run_with_mitm.py) Google's own TLS is tunneled untouched and only gstatic
is intercepted -> Chrome's TLS fingerprint to Google is preserved.

Set MITM_CACHE_XJS=1 to ALSO rewrite www.google.com/xjs/ bundles. That requires
MITMing google.com (drop it from --ignore-hosts), which changes the TLS
fingerprint Google sees. Only do this if the experiment shows you must render
AND gstatic-only caching isn't enough. Test the block rate carefully.

Load:  mitmdump -s cache_forcer.py ...
"""
import os

from mitmproxy import http

CACHE_XJS = os.environ.get("MITM_CACHE_XJS") == "1"

_count = 0
_bytes_cacheable = 0


def _is_cacheable_js(host: str, path: str) -> bool:
    if "gstatic.com" in host:
        return path.endswith(".js") or "/js/" in path or "/_/" in path
    if CACHE_XJS and host.endswith("google.com"):
        return "/xjs/" in path or path.startswith("/xjs")
    return False


def response(flow: http.HTTPFlow) -> None:
    global _count, _bytes_cacheable

    if flow.response is None:
        return
    # only cache full, successful bodies (not 206 ranges / redirects / errors)
    if flow.response.status_code != 200:
        return

    host = flow.request.pretty_host
    path = flow.request.path
    if not _is_cacheable_js(host, path):
        return

    h = flow.response.headers
    h["Cache-Control"] = "public, max-age=31536000, immutable"
    for stale in ("Pragma", "Expires", "Age", "Vary"):
        h.pop(stale, None)
    # a Set-Cookie or no-store anywhere would defeat caching; strip defensively
    h.pop("Set-Cookie", None)

    size = len(flow.response.content) if flow.response.content else 0
    if size > 1000:
        _count += 1
        _bytes_cacheable += size
        print(f"  [cache] {size/1024:6.0f} KB  {host}{path[:70]}")


def done():
    print(f"  [cache_forcer] rewrote {_count} JS responses, "
          f"{_bytes_cacheable/1024/1024:.2f} MB now cacheable by Chrome")
