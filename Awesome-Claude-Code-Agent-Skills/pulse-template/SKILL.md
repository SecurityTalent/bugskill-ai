# Pulse - Daily Curated News Digest

A personalized daily news digest skill with **resilient multi-tier fetching**. Goes out, reads the internet for you, picks the best stuff, and emails you a curated digest.

## Features

- **Multiple pulses** — Separate digests for different topics
- **Multi-source** — Twitter/X, RSS/Atom blogs, Reddit, arXiv, YouTube/conferences
- **Topic search** — Searches Reddit and YouTube by topic (not just specific channels/subreddits)
- **Resilient fetch chain** — 5-tier fallback so nothing blocks you
- **AI curation** — Round-robin source diversity + engagement ranking
- **Email delivery** — Dark-themed HTML emails

## Resilient Fetch Chain

Every source tries multiple methods in order. If one fails, it automatically tries the next:

```
Tier 1: Native tool (bird CLI, RSS parser, Reddit API, arXiv API)
  ↓ fails
Tier 2: Web search (Brave Search API → DuckDuckGo HTML scrape)
  ↓ fails
Tier 3: curl / urllib with rotating user agents
  ↓ fails
Tier 4: Playwright headless browser (handles JS-heavy sites)
  ↓ fails
Tier 5: Chrome DevTools Protocol (connects to running Chrome instance)
```

### Per-source fallback chains:

| Source | Tier 1 | Tier 2 | Tier 3 |
|--------|--------|--------|--------|
| **Twitter** | `bird` CLI | Brave/DDG `site:x.com` search | fxtwitter API |
| **Blogs** | RSS/Atom fetch | curl with rotating UA | Playwright → CDP |
| **Reddit** | Reddit JSON API (hot + search) | Brave/DDG `site:reddit.com` | — |
| **YouTube** | Channel RSS feeds | Brave/DDG `site:youtube.com` | — |
| **arXiv** | arXiv API | curl fallback | Playwright |

### Search fallback:
```
Brave Search API (needs free API key)
  ↓ no key or fails
DuckDuckGo HTML scrape (no key needed, always available)
```

## Quick Start

1. Edit `config.json` — your topics, sources, and delivery
2. Optional: Set `BRAVE_API_KEY` env var for better search (free at brave.com/search/api)
3. Optional: `pip install playwright && playwright install chromium` for Tier 4
4. Test: `python3 fetch_pulse.py my-digest --test`
5. Schedule via cron

## Configuration

### What to Edit

Open `config.json` and customize:

**Global (fetch_chain section):**
- `brave_api_key` — Free Brave Search API key (recommended, massively improves fallbacks)
- `cdp_url` — Chrome DevTools URL if you run Chrome with `--remote-debugging-port=9222`

**Per-pulse:**
- `id` — Unique identifier (used in CLI: `python3 fetch_pulse.py <id>`)
- `name` — Display name in email header
- `recipient` — Email address to deliver to
- `itemCount` — How many items per digest (default 15)
- `topics` — Keywords that filter ALL sources for relevance
- `sources` — Enable/disable and configure each source type

### Source Details

#### Twitter/X
```json
"twitter": {
  "enabled": true,
  "accounts": ["person1", "person2"],
  "searches": ["search phrase"]
}
```
If `bird` CLI isn't installed, automatically falls back to web search for `site:x.com` queries, then tries fxtwitter API.

#### Blogs/RSS
```json
"blogs": {
  "feeds": [
    {"name": "Display Name", "url": "https://example.com/feed.xml"}
  ]
}
```
Supports both RSS and Atom feeds. Uses full fetch chain for resilience.

#### Reddit
```json
"reddit": {
  "subreddits": ["sub1", "sub2"]
}
```
**Now does BOTH:**
1. Monitors your listed subreddits (filtered by topic keywords)
2. Searches ALL of Reddit for your topics via the search API

#### YouTube/Conferences
```json
"conferences": {
  "youtube_channels": [
    {"name": "Channel", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=XXX"}
  ],
  "keywords": ["filter", "terms"]
}
```
**Now does BOTH:**
1. Monitors listed channels via RSS
2. If few results, searches YouTube broadly via web search

#### arXiv
```json
"arxiv": {
  "categories": ["cs.AI"],
  "keywords": ["your keywords"]
}
```

### Priority System

| Priority | Source | Reasoning |
|----------|--------|-----------|
| 10 | Twitter/X | Real-time, practitioner signal |
| 9 | Blogs/RSS | In-depth analysis |
| 8 | YouTube | Conference talks, tutorials |
| 6 | Reddit | Community discussion |
| 3 | arXiv | Academic (dense, lower signal) |

## Curation Algorithm

1. **Fetch** — Hit all enabled sources with fallback chain
2. **Bucket** — Group items by source type
3. **Sort** — Each bucket sorted by priority × engagement
4. **Round-robin** — Take 1-2 from each bucket (ensures diversity)
5. **Fill** — Remaining slots filled by best items across all buckets
6. **Dedupe** — No duplicate URLs

## Email Delivery

Edit the `send_email()` function in `fetch_pulse.py` for your email provider:
- Default: `himalaya` CLI (IMAP/SMTP)
- Alternatives: SendGrid, Mailgun, Gmail API, Python smtplib

## Requirements

- Python 3.6+ (no pip dependencies for basic usage)
- Optional: `pip install playwright && playwright install chromium` (Tier 4 headless browser)
- Optional: `pip install websocket-client` (Tier 5 Chrome DevTools)
- Optional: Brave Search API key (free, improves search fallbacks significantly)
- Optional: `bird` CLI (Twitter native access)

## Scheduling

```bash
# OpenClaw cron
cron add --schedule "0 7 * * *" --text "python3 /path/to/fetch_pulse.py my-digest"

# System crontab
0 7 * * * cd /path/to/pulse && python3 fetch_pulse.py my-digest
```
