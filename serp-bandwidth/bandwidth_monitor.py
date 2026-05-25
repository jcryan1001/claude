"""
Real on-wire byte accounting via CDP.

page.get_content() returns the post-JS DOM, which is NOT what crosses the
proxy. This measures the actual compressed bytes received per response using
Network.loadingFinished.encodedDataLength, grouped by host. A cache hit fires
Network.requestServedFromCache and contributes ~0 bytes, so this proves caching
works without ever opening the DataImpulse dashboard.

Caveat: encodedDataLength is the compressed transfer size Chrome sees, which
tracks proxy bandwidth closely but is not byte-identical to the DataImpulse
meter (TLS/connection overhead differs). Use it for relative iteration; confirm
the final number against the dashboard.
"""
from collections import defaultdict
from urllib.parse import urlparse

import nodriver as uc


class BandwidthMonitor:
    def __init__(self):
        self._url_by_req: dict = {}
        self.by_host: dict = defaultdict(int)
        self.bytes_total = 0
        self.requests = 0
        self.cache_hits = 0

    async def attach(self, page):
        # Network.enable must already be on (the launch code does this).
        page.add_handler(uc.cdp.network.RequestWillBeSent, self._on_request)
        page.add_handler(uc.cdp.network.RequestServedFromCache, self._on_cache)
        page.add_handler(uc.cdp.network.LoadingFinished, self._on_finished)

    def reset(self):
        self._url_by_req.clear()
        self.by_host.clear()
        self.bytes_total = 0
        self.requests = 0
        self.cache_hits = 0

    async def _on_request(self, event):
        self._url_by_req[event.request_id] = event.request.url

    async def _on_cache(self, event):
        self.cache_hits += 1

    async def _on_finished(self, event):
        url = self._url_by_req.get(event.request_id, "")
        host = urlparse(url).netloc or "(unknown)"
        n = int(getattr(event, "encoded_data_length", 0) or 0)
        self.by_host[host] += n
        self.bytes_total += n
        self.requests += 1

    def report(self, top: int = 12) -> str:
        lines = [
            f"  on-wire: {self.bytes_total / 1024:7.1f} KB   "
            f"({self.requests} reqs, {self.cache_hits} cache hits)"
        ]
        for host, n in sorted(self.by_host.items(), key=lambda kv: -kv[1])[:top]:
            if n > 0:
                lines.append(f"    {n / 1024:7.1f} KB  {host}")
        return "\n".join(lines)
