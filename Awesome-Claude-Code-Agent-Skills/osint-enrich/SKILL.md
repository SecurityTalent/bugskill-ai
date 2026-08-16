# OSINT Enrich

OSINT enrichment and target dossier generation using publicly available information.

## Description

Generate comprehensive intelligence dossiers on individuals or organizations using only public sources. Creates detailed profiles including identity information, professional history, social media presence, network connections, and notable activities.

## Usage

```
osint-enrich <target_name>
```

**Examples:**
```
osint-enrich "Dave Kennedy"
osint-enrich "Jane Smith CISO Acme Corp"
osint-enrich "@username"
```

## Output

Generates a markdown dossier in `reports/` with:

- **Identity Summary** — Name, aliases, roles, location, contact info
- **Professional Profile** — Current roles, career timeline, key positions
- **Social Media Presence** — Platforms, follower counts, activity patterns
- **Network & Connections** — Key colleagues, organizations, affiliations
- **Public Activities** — Speaking engagements, publications, media appearances
- **Technical Contributions** — Open source projects, tools, research

## Sources

All information gathered from PUBLIC sources only:
- LinkedIn, Twitter/X, GitHub profiles
- Company websites and press releases
- Conference talks and publications
- News articles and interviews
- Public records and filings

## Guidelines

1. **Authorization** — Only use for legitimate security research, recruitment, or authorized assessments
2. **Public Only** — Never attempt to access private or protected information
3. **Accuracy** — Verify information across multiple sources when possible
4. **Classification** — Mark all reports as "PUBLIC INFORMATION ONLY"
5. **Ethics** — Do not use for harassment, stalking, or malicious purposes

## Report Format

Reports are saved as: `reports/<target>-<date>.md`

Example: `reports/kennedy-dave-2025-12-08.md`
