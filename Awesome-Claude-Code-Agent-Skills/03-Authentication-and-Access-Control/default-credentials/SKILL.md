---
name: default-credentials
description: >
  Identify and exploit default or weak credentials on web application login forms, admin panels,
  CMS backends (WordPress wp-admin, Joomla, Drupal), and embedded device management interfaces.
  Signals include framework fingerprinting (WhatWeb, Wappalyzer, Nikto), exposed admin paths
  from robots.txt/dirbusting, and weak password policy acceptance of "Password1" or "123456".
  Tools: Burp Suite Intruder, Hydra, Medusa, OWASP ZAP.
license: MIT
compatibility: Designed for Claude Code. Requires Burp Suite, Hydra, or OWASP ZAP.
metadata:
  category: web
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-ATHN-07
---

# Default and Weak Credentials

## What Is Broken and Why

Web applications, CMS platforms, and network devices ship with documented default credentials
that administrators frequently fail to change. Weak password policies that permit short, common,
or non-complex passwords compound the risk by allowing brute-force and credential-stuffing attacks
to succeed rapidly. When combined with exposed admin paths discovered through fingerprinting,
the attack chain from reconnaissance to authenticated access can be trivially short.

## Key Signals

- Admin path accessible: `/wp-admin/`, `/administrator/`, `/admin/`, `/manager/`, `/console/`
- Framework identified via cookie names, headers, or meta tags (WordPress, Joomla, Drupal, etc.)
- Login form accepts `admin/admin`, `admin/password`, `admin/<blank>`, `root/root`
- Password policy accepts "Password1" or "123456" on registration/change
- No account lockout after repeated failed attempts
- No rate limiting or CAPTCHA on login endpoint
- Error messages distinguish between invalid username and invalid password (username enumeration)
- HTTP Basic Auth realm on admin endpoints

## Methodology

1. **Fingerprint the platform**: Identify CMS/framework via headers, cookies, HTML markers,
   and path probing (see `web-fingerprinting` skill).
2. **Locate login endpoint**: Check `/robots.txt` Disallow entries; dirbust with framework-specific
   wordlist; follow redirects from root path.
3. **Check for lockout and rate limiting**: Submit 5-10 intentionally wrong credentials; observe
   whether account locks or responses slow.
4. **Username enumeration**: Test error message differentiation between unknown user and wrong
   password.
5. **Default credential test**: Try documented defaults for identified platform.
6. **Weak password spray**: Test a short list of common passwords against discovered usernames
   (low-and-slow to avoid lockout).
7. **Password policy audit**: Attempt to register or change password to weak values; document
   what is and is not accepted.

## Payloads & Tools

```bash
# Hydra HTTP POST form brute-force
hydra -l admin -P /usr/share/wordlists/rockyou.txt TARGET http-post-form \
  "/login:username=^USER^&password=^PASS^:Invalid credentials"

# Hydra HTTP Basic Auth
hydra -L users.txt -P passwords.txt TARGET http-get /admin/

# Burp Suite Intruder — set username/password fields as payload positions
# Payload list: admin, administrator, root, user, test, guest
# Password list: admin, password, 123456, Password1, <blank>

# Common default credential pairs to test manually
# admin:admin
# admin:password
# admin:1234
# admin:(blank)
# root:root
# administrator:administrator
# test:test
# guest:guest

# WordPress-specific
curl -X POST https://TARGET/wp-login.php \
  -d "log=admin&pwd=admin&wp-submit=Log+In&redirect_to=%2Fwp-admin%2F&testcookie=1" \
  -b "wordpress_test_cookie=WP+Cookie+check" -L -I | grep -E "HTTP|Location"

# Check for username enumeration via error message difference
curl -s -X POST https://TARGET/login \
  -d "user=nonexistentuser12345&pass=wrongpass" | grep -i "invalid\|not found\|wrong"
curl -s -X POST https://TARGET/login \
  -d "user=admin&pass=wrongpass" | grep -i "invalid\|not found\|wrong"

# Password policy probe
curl -X POST https://TARGET/register \
  -d "username=testpolicyuser&password=123456&confirm=123456"
```

## Bypass Techniques

- Some login forms implement lockout client-side only; bypass by sending requests directly via
  curl or Burp, skipping JavaScript lockout enforcement.
- IP-based rate limiting can be bypassed with `X-Forwarded-For` header rotation.
- CMS-specific default credentials may differ by version; cross-reference with identified version.
- "Remember me" tokens for admin accounts may persist after password changes in some platforms.

## Exploitation Scenarios

**Scenario 1 — CMS Default Admin Credentials**
Setup: WhatWeb identifies WordPress; `/wp-admin/` returns login form.
Trigger: Try `admin`/`admin`; application grants access.
Impact: Full CMS admin control — content modification, plugin installation, RCE via theme editor.

**Scenario 2 — Credential Spray on No-Lockout Login**
Setup: Login endpoint has no rate limiting or CAPTCHA; accepts unlimited attempts.
Trigger: Spray top-10 passwords against enumerated usernames.
Impact: Multiple accounts compromised; potential admin access.

**Scenario 3 — Weak Policy Allows Trivially Guessable Passwords**
Setup: Registration allows "Password1"; a user has set this.
Trigger: Username enumeration reveals `jsmith@TARGET`; spray with common passwords.
Impact: User account compromised via guessable password.

## False Positives

- A login page returning 200 for `admin/admin` with no redirect may be a honeypot or decoy form.
- Identical error messages for wrong user vs. wrong password prevent enumeration but may mask
  successful login attempts — always follow up with a session-bearing request.
- Some applications use progressive lockout (slow response, not hard lock) that may look like
  an open endpoint on first probes.

## Fix Patterns

- Force credential change on first login; remove all documented defaults before deployment.
- Enforce minimum password length (12+ chars), complexity, and common-password deny-list.
- Implement account lockout (5-10 attempts) with exponential backoff or CAPTCHA.
- Return identical error messages for wrong username and wrong password.
- Apply rate limiting per IP and per account on all authentication endpoints.
- Restrict admin panel access by IP allowlist or VPN requirement where feasible.

## Related Skills

Default credentials are a specific subset of [[auth-bypass]] — the same forced-browsing and parameter-tampering techniques apply once credentials are obtained. If the login endpoint lacks rate limiting, use [[password-reset-flaws]] to check whether the reset flow also permits credential guessing. The platform fingerprinting step that leads here is covered in [[web-fingerprinting]], which identifies the exact CMS version to cross-reference with known default credential databases.
