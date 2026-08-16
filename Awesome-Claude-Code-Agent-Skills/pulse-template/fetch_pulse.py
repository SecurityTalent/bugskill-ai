#!/usr/bin/env python3
"""
Pulse - Fetch and curate daily news digest
Sources: Twitter/X, Blogs (RSS), Reddit, arXiv, YouTube/Conferences

Resilient fetch chain per source:
  1. Native tool (bird, RSS, API)
  2. Web search (Brave API)
  3. curl / urllib with rotating UA
  4. Headless browser (Playwright)
  5. Chrome DevTools Protocol (CDP)

Usage:
  python3 fetch_pulse.py <pulse-id>
  python3 fetch_pulse.py <pulse-id> --test
"""

import json
import sys
import os
import subprocess
import shutil
from datetime import datetime, timedelta
from pathlib import Path
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import re
import time
import random

SCRIPT_DIR = Path(__file__).parent
CONFIG_FILE = SCRIPT_DIR / "config.json"

# Rotating user agents for urllib fallback
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
]


def load_config():
    with open(CONFIG_FILE) as f:
        return json.load(f)


def is_english(text):
    if not text:
        return False
    ascii_letters = sum(1 for c in text if c.isascii() and c.isalpha())
    non_ascii = sum(1 for c in text if not c.isascii())
    total = ascii_letters + non_ascii
    if total == 0:
        return True
    return (non_ascii / total) < 0.2


# ─────────────────────────────────────────────
# RESILIENT FETCH CHAIN
# Tier 1: Native tool / direct API
# Tier 2: Brave Search API (web_search)
# Tier 3: curl / urllib with rotating UA
# Tier 4: Playwright headless browser
# Tier 5: Chrome DevTools Protocol (CDP)
# ─────────────────────────────────────────────

class FetchChain:
    """Resilient multi-tier fetcher. Tries each method in order until one works."""

    def __init__(self, config=None):
        self.config = config or {}
        self.brave_api_key = os.environ.get("BRAVE_API_KEY", self.config.get("brave_api_key", ""))
        self.cdp_url = self.config.get("cdp_url", "http://localhost:9222")
        self._playwright_available = None
        self._cdp_available = None

    # ── Tier 2: Brave Search ──

    def brave_search(self, query, count=10):
        """Search via Brave Search API. Needs BRAVE_API_KEY env var."""
        if not self.brave_api_key:
            return None
        try:
            url = f"https://api.search.brave.com/res/v1/web/search?q={urllib.parse.quote(query)}&count={count}"
            req = urllib.request.Request(url, headers={
                "Accept": "application/json",
                "Accept-Encoding": "gzip",
                "X-Subscription-Token": self.brave_api_key,
            })
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            results = []
            for r in data.get("web", {}).get("results", []):
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "description": r.get("description", ""),
                })
            return results
        except Exception as e:
            print(f"    [Brave] Error: {e}", file=sys.stderr)
            return None

    # ── Tier 3: curl / urllib ──

    def fetch_url(self, url, timeout=15):
        """Fetch a URL with rotating user agent. Falls back to curl."""
        # Try urllib first
        ua = random.choice(USER_AGENTS)
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": ua,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            })
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read().decode("utf-8", errors="ignore")
        except Exception as e:
            print(f"    [urllib] Failed for {url[:60]}: {e}", file=sys.stderr)

        # Fallback: curl
        if shutil.which("curl"):
            try:
                result = subprocess.run(
                    ["curl", "-sL", "-A", ua, "--connect-timeout", "10", "--max-time", str(timeout), url],
                    capture_output=True, text=True, timeout=timeout + 5
                )
                if result.returncode == 0 and result.stdout.strip():
                    return result.stdout
            except Exception as e:
                print(f"    [curl] Failed for {url[:60]}: {e}", file=sys.stderr)

        return None

    # ── Tier 4: Playwright headless ──

    def _check_playwright(self):
        if self._playwright_available is None:
            try:
                import playwright
                self._playwright_available = True
            except ImportError:
                self._playwright_available = False
        return self._playwright_available

    def fetch_with_playwright(self, url, timeout=30000):
        """Fetch page content using Playwright headless Chromium."""
        if not self._check_playwright():
            return None
        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page(user_agent=random.choice(USER_AGENTS))
                page.goto(url, timeout=timeout, wait_until="domcontentloaded")
                content = page.content()
                browser.close()
                return content
        except Exception as e:
            print(f"    [Playwright] Failed for {url[:60]}: {e}", file=sys.stderr)
            return None

    # ── Tier 5: Chrome DevTools Protocol ──

    def fetch_with_cdp(self, url, timeout=15):
        """Fetch via Chrome DevTools Protocol (requires Chrome running with --remote-debugging-port)."""
        if self._cdp_available is False:
            return None
        try:
            # Get available targets
            targets_url = f"{self.cdp_url}/json/new?{urllib.parse.quote(url)}"
            req = urllib.request.Request(targets_url)
            with urllib.request.urlopen(req, timeout=5) as resp:
                target = json.loads(resp.read().decode("utf-8"))

            target_id = target.get("id")
            if not target_id:
                self._cdp_available = False
                return None

            self._cdp_available = True

            # Wait for page to load
            time.sleep(3)

            # Get page content via CDP evaluate
            import websocket  # optional dep
            ws_url = target.get("webSocketDebuggerUrl", "")
            if not ws_url:
                return None

            ws = websocket.create_connection(ws_url, timeout=timeout)
            ws.send(json.dumps({
                "id": 1,
                "method": "Runtime.evaluate",
                "params": {"expression": "document.documentElement.outerHTML"}
            }))
            result = json.loads(ws.recv())
            ws.close()

            # Clean up tab
            close_url = f"{self.cdp_url}/json/close/{target_id}"
            urllib.request.urlopen(close_url, timeout=3)

            return result.get("result", {}).get("result", {}).get("value", "")

        except ImportError:
            print("    [CDP] websocket-client not installed, skipping", file=sys.stderr)
            self._cdp_available = False
            return None
        except Exception as e:
            print(f"    [CDP] Failed for {url[:60]}: {e}", file=sys.stderr)
            self._cdp_available = False
            return None

    # ── Combined: try all tiers ──

    def resilient_fetch(self, url, timeout=15):
        """Try all fetch tiers in order until one returns content."""
        # Tier 3: urllib + curl
        content = self.fetch_url(url, timeout)
        if content:
            return content

        # Tier 4: Playwright
        content = self.fetch_with_playwright(url)
        if content:
            return content

        # Tier 5: CDP
        content = self.fetch_with_cdp(url, timeout)
        if content:
            return content

        print(f"    [ALL TIERS FAILED] {url[:80]}", file=sys.stderr)
        return None

    def search(self, query, count=10):
        """Search with fallback: Brave API → web scrape Google/DuckDuckGo."""
        # Tier 2: Brave
        results = self.brave_search(query, count)
        if results:
            return results

        # Fallback: scrape DuckDuckGo HTML (no API key needed)
        try:
            ddg_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
            html = self.fetch_url(ddg_url, timeout=15)
            if html:
                results = []
                # Parse DDG HTML results
                links = re.findall(r'<a rel="nofollow" class="result__a" href="([^"]+)"[^>]*>(.*?)</a>', html)
                snippets = re.findall(r'<a class="result__snippet"[^>]*>(.*?)</a>', html)
                for i, (href, title) in enumerate(links[:count]):
                    title = re.sub(r'<[^>]+>', '', title).strip()
                    desc = re.sub(r'<[^>]+>', '', snippets[i]).strip() if i < len(snippets) else ""
                    # DDG wraps URLs in a redirect, extract actual URL
                    actual_url = urllib.parse.unquote(re.sub(r'.*uddg=', '', href).split('&')[0]) if 'uddg=' in href else href
                    results.append({"title": title, "url": actual_url, "description": desc})
                if results:
                    return results
        except Exception as e:
            print(f"    [DDG scrape] Error: {e}", file=sys.stderr)

        return []


# ─────────────────────────────────────────────
# Source Fetchers (using FetchChain)
# ─────────────────────────────────────────────

def fetch_twitter(config, topics, chain):
    """Fetch Twitter/X content.
    Tier 1: bird CLI
    Tier 2: Brave search for site:x.com
    Tier 3: fxtwitter API
    """
    items = []
    accounts = config.get("accounts", [])
    searches = config.get("searches", [])
    topic_keywords = [t.lower() for t in topics]
    has_bird = shutil.which("bird")

    # ── Tier 1: bird CLI ──
    if has_bird:
        for account in accounts[:10]:
            try:
                cmd = ["bird", "user-tweets", account, "-n", "5", "--json"]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                if result.returncode == 0 and result.stdout.strip():
                    tweets = json.loads(result.stdout)
                    for tweet in tweets:
                        text_lower = tweet.get("text", "").lower()
                        if any(kw in text_lower for kw in topic_keywords):
                            items.append({
                                "source": f"𝕏 @{account}",
                                "title": tweet.get("text", "")[:150],
                                "summary": tweet.get("text", ""),
                                "url": f"https://x.com/{account}/status/{tweet.get('id', '')}",
                                "date": tweet.get("created_at", "")[:10] or datetime.now().strftime("%Y-%m-%d"),
                                "priority": config.get("priority", 10),
                                "engagement": tweet.get("likes", 0) + tweet.get("retweets", 0) * 2,
                            })
            except Exception as e:
                print(f"    [bird/@{account}] {e}", file=sys.stderr)

        for query in searches[:10]:
            try:
                cmd = ["bird", "search", query, "-n", "25", "--json"]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                if result.returncode == 0 and result.stdout.strip():
                    tweets = json.loads(result.stdout)
                    for tweet in tweets:
                        text = tweet.get("text", "")
                        if not is_english(text):
                            continue
                        author = tweet.get("author", {})
                        username = author.get("username", "unknown")
                        items.append({
                            "source": f"𝕏 search:{query[:20]}",
                            "title": text[:150],
                            "summary": text,
                            "url": f"https://x.com/{username}/status/{tweet.get('id', '')}",
                            "date": tweet.get("createdAt", "")[:16] or datetime.now().strftime("%Y-%m-%d"),
                            "priority": config.get("priority", 10),
                            "engagement": tweet.get("likeCount", 0) + tweet.get("retweetCount", 0) * 2,
                        })
            except Exception as e:
                print(f"    [bird/search:{query}] {e}", file=sys.stderr)

    # ── Tier 2: Brave search for Twitter content ──
    if not items:
        print("    [Twitter] bird not available or returned nothing, falling back to web search...")
        all_queries = searches + [f"from:{a}" for a in accounts[:5]]
        for query in all_queries[:8]:
            search_results = chain.search(f"site:x.com {query}", count=5)
            for r in search_results:
                url = r.get("url", "")
                if "x.com" in url or "twitter.com" in url:
                    items.append({
                        "source": f"𝕏 web:{query[:20]}",
                        "title": r.get("title", "")[:150],
                        "summary": r.get("description", ""),
                        "url": url,
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "priority": config.get("priority", 10),
                        "engagement": 0,
                    })

    # ── Tier 3: fxtwitter API for specific accounts ──
    if not items and accounts:
        print("    [Twitter] Web search failed too, trying fxtwitter API...")
        for account in accounts[:5]:
            try:
                api_url = f"https://api.fxtwitter.com/{account}"
                content = chain.fetch_url(api_url, timeout=10)
                if content:
                    data = json.loads(content)
                    for tweet in data.get("tweets", [])[:3]:
                        text = tweet.get("text", "")
                        if any(kw in text.lower() for kw in topic_keywords):
                            items.append({
                                "source": f"𝕏 @{account}",
                                "title": text[:150],
                                "summary": text,
                                "url": tweet.get("url", f"https://x.com/{account}"),
                                "date": datetime.now().strftime("%Y-%m-%d"),
                                "priority": config.get("priority", 10),
                                "engagement": 0,
                            })
            except Exception as e:
                print(f"    [fxtwitter/{account}] {e}", file=sys.stderr)

    # Dedupe
    items.sort(key=lambda x: x.get("engagement", 0), reverse=True)
    seen = set()
    return [i for i in items if not (i["url"] in seen or seen.add(i["url"]))][:15]


def fetch_blogs(config, chain):
    """Fetch from RSS/Atom feeds with resilient fetching."""
    items = []
    for feed_info in config.get("feeds", []):
        name = feed_info.get("name", "Unknown")
        url = feed_info.get("url", "")

        # Use resilient fetch chain instead of plain urllib
        data = chain.resilient_fetch(url, timeout=15)
        if not data:
            continue

        try:
            root = ET.fromstring(data)

            # RSS
            for item in root.findall(".//item")[:5]:
                title = item.find("title")
                link = item.find("link")
                desc = item.find("description")
                pub = item.find("pubDate")
                if title is not None and link is not None:
                    summary = re.sub(r"<[^>]+>", "", (desc.text[:300] if desc is not None and desc.text else ""))
                    items.append({
                        "source": f"📝 {name}",
                        "title": (title.text or "")[:200],
                        "summary": summary,
                        "url": link.text or "",
                        "date": (pub.text[:16] if pub is not None and pub.text else datetime.now().strftime("%Y-%m-%d")),
                        "priority": config.get("priority", 9),
                    })

            # Atom
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            for entry in root.findall("atom:entry", ns)[:5]:
                title = entry.find("atom:title", ns)
                link = entry.find("atom:link", ns)
                summary = entry.find("atom:summary", ns) or entry.find("atom:content", ns)
                published = entry.find("atom:published", ns) or entry.find("atom:updated", ns)
                if title is not None:
                    items.append({
                        "source": f"📝 {name}",
                        "title": (title.text or "")[:200],
                        "summary": (summary.text[:300] if summary is not None and summary.text else ""),
                        "url": link.get("href") if link is not None else "",
                        "date": (published.text[:10] if published is not None and published.text else datetime.now().strftime("%Y-%m-%d")),
                        "priority": config.get("priority", 9),
                    })
        except ET.ParseError as e:
            print(f"    [Blog/{name}] XML parse error: {e}", file=sys.stderr)
        except Exception as e:
            print(f"    [Blog/{name}] Error: {e}", file=sys.stderr)
    return items


def fetch_reddit(config, topics, chain):
    """Fetch Reddit posts.
    Tier 1: Reddit JSON API (subreddit hot)
    Tier 2: Reddit search API (topic search across all of Reddit)
    Tier 3: Web search for site:reddit.com
    """
    items = []
    topic_keywords = [t.lower() for t in topics]
    subreddits = config.get("subreddits", [])

    # ── Tier 1: Subreddit hot posts (filtered by topic) ──
    for i, sub in enumerate(subreddits):
        if i > 0:
            time.sleep(1)
        url = f"https://www.reddit.com/r/{sub}/hot.json?limit=15"
        try:
            content = chain.fetch_url(url, timeout=15)
            if content:
                data = json.loads(content)
                for post in data.get("data", {}).get("children", []):
                    p = post.get("data", {})
                    title_lower = p.get("title", "").lower()
                    if any(kw in title_lower for kw in topic_keywords):
                        items.append({
                            "source": f"🔗 r/{sub}",
                            "title": p.get("title", "")[:200],
                            "summary": p.get("selftext", "")[:300] or f"Link: {p.get('url', '')}",
                            "url": f"https://reddit.com{p.get('permalink', '')}",
                            "date": datetime.fromtimestamp(p.get("created_utc", 0)).strftime("%Y-%m-%d"),
                            "priority": config.get("priority", 6),
                            "engagement": p.get("score", 0),
                        })
        except Exception as e:
            print(f"    [Reddit/r/{sub}] {e}", file=sys.stderr)

    # ── Tier 2: Reddit search API (search ALL of Reddit by topic) ──
    for topic in topics[:3]:
        try:
            search_url = f"https://www.reddit.com/search.json?q={urllib.parse.quote(topic)}&sort=new&limit=10&t=day"
            content = chain.fetch_url(search_url, timeout=15)
            if content:
                data = json.loads(content)
                for post in data.get("data", {}).get("children", []):
                    p = post.get("data", {})
                    post_url = f"https://reddit.com{p.get('permalink', '')}"
                    if post_url not in {i["url"] for i in items}:  # Dedupe
                        items.append({
                            "source": f"🔗 reddit search",
                            "title": p.get("title", "")[:200],
                            "summary": p.get("selftext", "")[:300] or f"Link: {p.get('url', '')}",
                            "url": post_url,
                            "date": datetime.fromtimestamp(p.get("created_utc", 0)).strftime("%Y-%m-%d"),
                            "priority": config.get("priority", 6),
                            "engagement": p.get("score", 0),
                        })
            time.sleep(1)
        except Exception as e:
            print(f"    [Reddit/search:{topic}] {e}", file=sys.stderr)

    # ── Tier 3: Web search fallback ──
    if not items:
        print("    [Reddit] API failed, falling back to web search...")
        for topic in topics[:3]:
            results = chain.search(f"site:reddit.com {topic}", count=5)
            for r in results:
                if "reddit.com" in r.get("url", ""):
                    items.append({
                        "source": "🔗 reddit (web)",
                        "title": r.get("title", "")[:200],
                        "summary": r.get("description", ""),
                        "url": r.get("url", ""),
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "priority": config.get("priority", 6),
                        "engagement": 0,
                    })

    items.sort(key=lambda x: x.get("engagement", 0), reverse=True)
    return items[:15]


def fetch_youtube(config, topics, chain):
    """Fetch YouTube content.
    Tier 1: Channel RSS feeds (filtered by keywords)
    Tier 2: Web search for site:youtube.com + topic
    """
    items = []
    keywords = [kw.lower() for kw in config.get("keywords", topics)]

    # ── Tier 1: Channel RSS feeds ──
    for ch in config.get("youtube_channels", []):
        name = ch.get("name", "Unknown")
        url = ch.get("url", "")
        data = chain.resilient_fetch(url, timeout=15)
        if not data:
            continue
        try:
            root = ET.fromstring(data)
            ns = {"atom": "http://www.w3.org/2005/Atom", "media": "http://search.yahoo.com/mrss/"}
            for entry in root.findall("atom:entry", ns)[:10]:
                title_elem = entry.find("atom:title", ns)
                link_elem = entry.find("atom:link", ns)
                pub_elem = entry.find("atom:published", ns)
                if title_elem is not None:
                    title = title_elem.text or ""
                    if any(kw in title.lower() for kw in keywords):
                        desc = ""
                        mg = entry.find("media:group", ns)
                        if mg is not None:
                            d = mg.find("media:description", ns)
                            if d is not None and d.text:
                                desc = d.text[:300]
                        items.append({
                            "source": f"🎬 {name}",
                            "title": title[:200],
                            "summary": desc or "Video",
                            "url": link_elem.get("href") if link_elem is not None else "",
                            "date": (pub_elem.text[:10] if pub_elem is not None and pub_elem.text else datetime.now().strftime("%Y-%m-%d")),
                            "priority": config.get("priority", 8),
                        })
        except Exception as e:
            print(f"    [YouTube/{name}] {e}", file=sys.stderr)

    # ── Tier 2: Web search for YouTube videos by topic ──
    if len(items) < 3:
        print("    [YouTube] Few results from RSS, supplementing with web search...")
        for topic in topics[:3]:
            results = chain.search(f"site:youtube.com {topic}", count=5)
            for r in results:
                url = r.get("url", "")
                if "youtube.com/watch" in url and url not in {i["url"] for i in items}:
                    items.append({
                        "source": "🎬 YouTube search",
                        "title": r.get("title", "")[:200],
                        "summary": r.get("description", ""),
                        "url": url,
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "priority": config.get("priority", 8),
                    })

    return items


def fetch_arxiv(config, chain):
    """Fetch from arXiv API."""
    items = []
    keywords = config.get("keywords", [])
    categories = config.get("categories", [])
    search_terms = " OR ".join([f'all:"{kw}"' for kw in keywords])
    cat_filter = " OR ".join([f"cat:{cat}" for cat in categories])
    query = f"({search_terms}) AND ({cat_filter})"
    url = f"http://export.arxiv.org/api/query?search_query={urllib.parse.quote(query)}&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending"

    data = chain.resilient_fetch(url, timeout=30)
    if not data:
        return items

    try:
        root = ET.fromstring(data)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for entry in root.findall("atom:entry", ns):
            title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
            summary = entry.find("atom:summary", ns).text.strip()[:400]
            link = entry.find("atom:id", ns).text
            published = entry.find("atom:published", ns).text[:10]
            items.append({
                "source": "📚 arXiv",
                "title": title,
                "summary": summary,
                "url": link,
                "date": published,
                "priority": config.get("priority", 3),
            })
    except Exception as e:
        print(f"    [arXiv] {e}", file=sys.stderr)
    return items[:5]


# ─────────────────────────────────────────────
# Curation + Email
# ─────────────────────────────────────────────

def curate_items(all_items, item_count):
    """Round-robin ensuring source diversity, then fill by priority + engagement."""
    source_buckets = {}
    for item in all_items:
        src = item.get("source", "")
        if "𝕏" in src:
            bucket = "twitter"
        elif "📝" in src:
            bucket = "blogs"
        elif "🎬" in src:
            bucket = "youtube"
        elif "🔗" in src:
            bucket = "reddit"
        elif "arXiv" in src:
            bucket = "arxiv"
        else:
            bucket = "other"
        source_buckets.setdefault(bucket, []).append(item)

    for bucket in source_buckets:
        source_buckets[bucket].sort(
            key=lambda x: (x.get("priority", 5), x.get("engagement", 0)), reverse=True
        )

    curated = []
    seen = set()

    # First pass: 1-2 from each source (diversity)
    for bucket in ["twitter", "blogs", "youtube", "reddit", "arxiv", "other"]:
        for item in source_buckets.get(bucket, [])[:2]:
            if item["url"] not in seen and len(curated) < item_count:
                curated.append(item)
                seen.add(item["url"])

    # Second pass: fill by priority + engagement
    remaining = [i for b in source_buckets.values() for i in b if i["url"] not in seen]
    remaining.sort(key=lambda x: (x.get("priority", 5), x.get("engagement", 0)), reverse=True)
    for item in remaining:
        if len(curated) >= item_count:
            break
        if item["url"] not in seen:
            curated.append(item)
            seen.add(item["url"])

    return curated


def format_email(items, pulse_config):
    today = datetime.now().strftime("%B %d, %Y")
    html = f"""<!DOCTYPE html>
<html>
<head>
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #0d1117; color: #c9d1d9; }}
.header {{ background: linear-gradient(135deg, #238636 0%, #1f6feb 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }}
.header h1 {{ margin: 0; font-size: 24px; }}
.header p {{ margin: 10px 0 0 0; opacity: 0.9; }}
.item {{ background: #161b22; padding: 20px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #30363d; }}
.item h3 {{ margin: 0 0 10px 0; color: #58a6ff; font-size: 16px; }}
.item h3 a {{ color: #58a6ff; text-decoration: none; }}
.item h3 a:hover {{ text-decoration: underline; }}
.item .meta {{ font-size: 12px; color: #8b949e; margin-bottom: 10px; }}
.item .summary {{ color: #c9d1d9; font-size: 14px; line-height: 1.5; }}
.footer {{ text-align: center; color: #8b949e; font-size: 12px; margin-top: 30px; }}
.source-twitter {{ border-left: 3px solid #1da1f2; }}
.source-blog {{ border-left: 3px solid #238636; }}
.source-reddit {{ border-left: 3px solid #ff4500; }}
.source-arxiv {{ border-left: 3px solid #b31b1b; }}
.source-youtube {{ border-left: 3px solid #f59e0b; }}
</style>
</head>
<body>
<div class="header">
<h1>{pulse_config['name']}</h1>
<p>{today} · {len(items)} items curated</p>
</div>
"""
    for i, item in enumerate(items, 1):
        src = item.get("source", "")
        sc = ""
        if "𝕏" in src: sc = "source-twitter"
        elif "📝" in src: sc = "source-blog"
        elif "🔗" in src: sc = "source-reddit"
        elif "arXiv" in src: sc = "source-arxiv"
        elif "🎬" in src: sc = "source-youtube"
        summary = re.sub(r"<[^>]+>", "", item.get("summary", ""))[:300]
        html += f"""
<div class="item {sc}">
<h3><a href="{item['url']}">{i}. {item['title'][:150]}</a></h3>
<div class="meta">{item['source']} · {item.get('date', '')}</div>
<div class="summary">{summary}</div>
</div>
"""
    html += """
<div class="footer">
<p>Generated by Pulse</p>
</div>
</body>
</html>"""
    return html


def send_email(recipient, subject, html_body):
    """Send email. EDIT THIS for your email provider."""
    from_addr = "you@example.com"  # ← EDIT THIS
    mml = f"""From: {from_addr}
To: {recipient}
Subject: {subject}

<#multipart type=alternative>
(HTML email - view in HTML-capable client)
<#part type=text/html>
{html_body}
<#/multipart>"""
    cmd = ["himalaya", "template", "send"]
    result = subprocess.run(cmd, input=mml, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Email error: {result.stderr}", file=sys.stderr)
        return False
    print(f"📧 Email sent to {recipient}")
    return True


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main():
    pulse_id = sys.argv[1] if len(sys.argv) > 1 else None
    test_mode = "--test" in sys.argv

    if not pulse_id or pulse_id.startswith("--"):
        print("Usage: python3 fetch_pulse.py <pulse-id> [--test]")
        sys.exit(1)

    config = load_config()
    pulse_config = next((p for p in config.get("pulses", []) if p["id"] == pulse_id), None)

    if not pulse_config:
        available = [p["id"] for p in config.get("pulses", [])]
        print(f"Pulse '{pulse_id}' not found. Available: {available}", file=sys.stderr)
        sys.exit(1)

    # Initialize fetch chain with optional config
    chain_config = config.get("fetch_chain", {})
    chain = FetchChain(chain_config)

    print(f"🔄 Fetching pulse: {pulse_config['name']}")
    print(f"   Fetch chain: urllib → curl → {'Playwright ✓' if chain._check_playwright() else 'Playwright ✗'} → CDP")
    if chain.brave_api_key:
        print(f"   Search: Brave API ✓ → DuckDuckGo fallback")
    else:
        print(f"   Search: DuckDuckGo (set BRAVE_API_KEY for better results)")

    all_items = []
    sources = pulse_config.get("sources", {})
    topics = pulse_config.get("topics", [])

    if sources.get("twitter", {}).get("enabled"):
        print("  𝕏 Fetching Twitter...")
        items = fetch_twitter(sources["twitter"], topics, chain)
        print(f"     Found {len(items)} tweets")
        all_items.extend(items)

    if sources.get("blogs", {}).get("enabled"):
        print("  📝 Fetching Blogs/RSS...")
        items = fetch_blogs(sources["blogs"], chain)
        print(f"     Found {len(items)} posts")
        all_items.extend(items)

    if sources.get("conferences", {}).get("enabled"):
        print("  🎬 Fetching YouTube/Conferences...")
        items = fetch_youtube(sources["conferences"], topics, chain)
        print(f"     Found {len(items)} videos")
        all_items.extend(items)

    if sources.get("reddit", {}).get("enabled"):
        print("  🔗 Fetching Reddit...")
        items = fetch_reddit(sources["reddit"], topics, chain)
        print(f"     Found {len(items)} posts")
        all_items.extend(items)

    if sources.get("arxiv", {}).get("enabled"):
        print("  📚 Fetching arXiv...")
        items = fetch_arxiv(sources["arxiv"], chain)
        print(f"     Found {len(items)} papers")
        all_items.extend(items)

    print(f"  📊 Total raw items: {len(all_items)}")

    item_count = pulse_config.get("itemCount", 15)
    curated = curate_items(all_items, item_count)

    # Log source distribution
    source_counts = {}
    for item in curated:
        src = item.get("source", "")[:12]
        source_counts[src] = source_counts.get(src, 0) + 1
    print(f"  🎯 Source mix: {source_counts}")
    print(f"  🤖 Curated top {len(curated)} items")

    if test_mode:
        print("\n--- TEST MODE (not sending) ---\n")
        for i, item in enumerate(curated, 1):
            print(f"{i}. [{item['source']}] {item['title'][:80]}")
            print(f"   {item['url']}")
            print()
        return

    subject = f"{pulse_config['name']} - {datetime.now().strftime('%b %d, %Y')}"
    html = format_email(curated, pulse_config)
    print(f"  📧 Sending to {pulse_config['recipient']}...")
    success = send_email(pulse_config["recipient"], subject, html)
    print("✅ Pulse delivered!" if success else "❌ Failed to send")
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
