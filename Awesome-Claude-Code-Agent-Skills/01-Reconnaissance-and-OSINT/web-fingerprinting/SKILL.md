---
name: web-fingerprinting
description: >
  Identify web server type/version, framework, and application entry points via banner grabbing,
  HTTP header analysis (Server, X-Powered-By, X-Generator), cookie names (CAKEPHP, laravel_session,
  wp-settings), HTML meta generators, robots.txt, source map files (.map), JS hardcoded secrets,
  and Google dorking (site:, inurl:, filetype:, intitle:) with tools Nikto, WhatWeb, Wappalyzer,
  Nmap, Shodan, Burp Suite, OWASP ZAP, Waybackurls.
license: MIT
compatibility: Designed for Claude Code. Requires curl, nikto, nmap, or Burp Suite.
metadata:
  category: web
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-INFO-01, WSTG-INFO-02, WSTG-INFO-05, WSTG-INFO-06, WSTG-INFO-08
---

# Web Fingerprinting and Information Gathering

## What Is Broken and Why

Web applications leak technology stack details through HTTP response headers, HTML comments,
cookie names, error messages, and static file paths. Search engines and archives may index
sensitive configuration files, credentials, and internal network diagrams. Collectively this
intelligence narrows an attacker's target surface dramatically before any active exploitation
begins, enabling precise selection of known CVEs for the identified stack.

## Key Signals

- `Server:` header reveals product and version (e.g., `Apache/2.4.41`, `nginx/1.17.3`)
- `X-Powered-By:` or `X-Generator:` headers expose backend language/framework
- Framework-specific cookies: `CAKEPHP`, `laravel_session`, `wp-settings`, `fe_typo_user`
- HTML `<meta name="generator">` tags (WordPress, Joomla, Drupal)
- Accessible paths: `/wp-admin/`, `/wp-content/`, `/wp-includes/`
- HTML comments embedding SQL queries, credentials, or internal IPs
- JS files with hardcoded API keys, DB connection strings, AWS credentials
- `.map` source map files exposing full source trees and internal file paths
- `robots.txt` Disallow entries revealing hidden paths
- Error responses leaking stack traces, framework names, file paths
- `__VIEWSTATE` in forms = ASP.NET; `<!-- ZK` = ZK framework; `.cfm` = ColdFusion

## Methodology

1. **Passive recon**: Run Google dorks against the target domain using `site:`, `inurl:`,
   `filetype:`, `intitle:`, `intext:` operators. Check Internet Archive Wayback Machine and Shodan.
2. **Banner grabbing**: Send raw HTTP/HTTPS requests and record `Server:`, `X-Powered-By:`,
   `ETag`, header ordering, and error page footers.
3. **Malformed request probing**: Send invalid HTTP version strings to trigger version-revealing
   error pages.
4. **Cookie analysis**: Capture `Set-Cookie` headers across all application sections; match names
   against known framework signatures.
5. **HTML/JS source review**: Spider the application, download all `.js` files, search for
   credentials patterns, internal hostnames, API endpoints.
6. **Source map detection**: Append `.map` to discovered JS filenames; if 200 OK, parse `sources`
   array for internal paths.
7. **Entry point mapping**: Use intercepting proxy to record all GET/POST parameters, hidden
   fields, custom headers, and WebSocket frames.
8. **Dirbusting**: Request framework-specific paths identified in step 4; compare HTTP response
   codes to confirm technology.

## Payloads & Tools

```bash
# Banner grabbing over HTTP
curl -I http://TARGET/

# Banner grabbing over HTTPS
openssl s_client -connect TARGET:443 -quiet | head -20

# Malformed request to trigger error page
printf 'GET / SANTA CLAUS/1.1\r\nHost: TARGET\r\n\r\n' | nc TARGET 80

# Nikto scan
nikto -h http://TARGET/

# WhatWeb fingerprint
whatweb -a 3 http://TARGET/

# Nmap service/version detection
nmap -sV -p 80,443,8080,8443 TARGET

# Find source maps
curl -s http://TARGET/static/app.js.map | python3 -m json.tool | grep sources

# Google dork examples (replace TARGET with actual domain)
# site:TARGET filetype:env
# site:TARGET inurl:admin
# site:TARGET intitle:"index of"
# site:TARGET filetype:sql

# Check robots.txt
curl -s http://TARGET/robots.txt

# Retrieve archived URLs
waybackurls TARGET | grep -E '\.(php|asp|aspx|jsp|config|bak|sql|env)'
```

## Bypass Techniques

- Servers with header-suppression (`mod_security`, `mod_headers ServerTokens Prod`) still leak via
  header ordering, `ETag` format, and error page HTML structure.
- WAFs hiding `Server:` headers may still reveal technology in cookies or `X-AspNet-Version`.
- Source maps may be accessible even when JS is minified/obfuscated.
- Wayback Machine and Common Crawl may preserve old versions of pages that no longer exist live.

## Exploitation Scenarios

**Scenario 1 — Version to CVE**
Setup: Target running Apache/2.4.41 revealed via `Server:` header.
Trigger: Cross-reference with CVE database; identify known RCE for that minor version.
Impact: Targeted exploitation without broad scanning.

**Scenario 2 — Hardcoded AWS Key**
Setup: JS source map exposes `src/config/aws.js` with `accessKeyId` and `secretAcccessKey`.
Trigger: Extract keys, configure AWS CLI with stolen credentials.
Impact: Full cloud account takeover, data exfiltration, infrastructure control.

**Scenario 3 — Hidden Admin Panel**
Setup: `robots.txt` lists `Disallow: /admin-legacy/`. Framework cookies confirm WordPress.
Trigger: Navigate to `/admin-legacy/`; attempt default or leaked credentials.
Impact: Unauthenticated or low-effort admin access.

## False Positives

- Generic `Server: Apache` without version may indicate a well-hardened install, not a vulnerable one.
- `X-Powered-By` can be spoofed to mislead fingerprinting; corroborate with multiple signals.
- Source map `sources` paths may be Docker container paths with no direct filesystem relevance.
- `robots.txt` Disallow entries may point to already-deleted or protected paths.

## Fix Patterns

- Set `ServerTokens Prod` and `ServerSignature Off` in Apache; `server_tokens off` in Nginx.
- Remove `X-Powered-By` with `Header unset X-Powered-By` or framework-level config.
- Strip or randomize `ETag` format to avoid version inference.
- Never ship `.map` files to production; configure build pipeline to exclude them.
- Audit all JS bundles for secrets before deployment; use environment variables at runtime.
- Set framework-neutral cookie names.
- Implement `Cache-Control: no-store` on error pages to prevent caching of stack traces.

## Related Skills

Fingerprinting is the entry point that directs all further testing. Once the stack is identified, move to [[auth-bypass]] if an admin panel is exposed, or [[sql-injection]] if the framework version has a known SQLi vulnerability. If a CMS login is found, [[default-credentials]] is the immediate next step. Source maps and hardcoded secrets discovered here can feed directly into [[business-logic-flaws]] by revealing undocumented API endpoints.
