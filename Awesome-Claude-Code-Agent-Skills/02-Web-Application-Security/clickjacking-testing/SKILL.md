---
name: clickjacking-testing
description: >
  Clickjacking overlays a target page in a transparent or hidden iframe, tricking victims into clicking UI elements they cannot see. Detect by attempting to load the target in an iframe and checking for `X-Frame-Options` (DENY/SAMEORIGIN) or `Content-Security-Policy: frame-ancestors` headers. Frame-busting JavaScript can be bypassed via double-framing, `sandbox` attribute, `onBeforeUnload` exploitation, and IE `location` variable redefinition. Tools: Burp Suite (Clickjacking PoC generation).
license: MIT
compatibility: Designed for Claude Code. Requires Burp Suite or a browser for iframe PoC testing.
metadata:
  category: client-side
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-CLNT-09
---

# Clickjacking

## What Is Broken and Why
Clickjacking (UI redressing) works by embedding a target application inside a transparent or partially-visible iframe on an attacker-controlled page. Victims see decoy UI elements but are actually interacting with the hidden target page underneath. Single-click, single-step actions are the most exploitable (fund transfers, account deletions, permission grants, one-click purchases). The vulnerability exists when a page can be framed, either because framing protection headers are absent or because deployed JavaScript frame-busting code is bypassable.

## Key Signals
- Missing `X-Frame-Options` header (`DENY` or `SAMEORIGIN`)
- Missing `Content-Security-Policy: frame-ancestors 'none'` or `frame-ancestors 'self'`
- Target page loads successfully in a test iframe
- Frame-busting JavaScript present (`top.location === self.location`) but bypassable
- State-changing one-click actions (confirm, approve, authorize, delete) on authenticated pages
- Browser developer tools: Network tab shows page loaded as iframe sub-resource

## Methodology
1. Attempt to load the target page in an iframe using the PoC HTML below.
2. Check response headers for `X-Frame-Options` and `Content-Security-Policy: frame-ancestors`.
3. If the page loads in the iframe, confirm it is the authenticated/functional version.
4. Identify high-impact one-click actions on the framed page.
5. Construct a PoC with overlaid decoy buttons positioned over target action buttons.
6. Test frame-busting bypass techniques if JavaScript protection is detected.
7. Verify across browsers (Chrome, Firefox, Safari) as behavior differs.

## Payloads & Tools
```html
<!-- Basic detection PoC -->
<html>
  <head><title>Clickjacking detection</title></head>
  <body>
    <iframe src="TARGET/" width="800" height="600"></iframe>
  </body>
</html>

<!-- Full attack PoC — transparent overlay -->
<html>
<head>
<style>
  iframe {
    position: absolute;
    width: 800px;
    height: 600px;
    opacity: 0.0;  /* Set to 0.5 for testing, 0.0 for actual attack */
    z-index: 2;
  }
  .decoy {
    position: absolute;
    top: 340px;   /* Adjust to align with target button */
    left: 200px;
    z-index: 1;
    background: #ff0000;
    padding: 10px 20px;
    cursor: pointer;
  }
</style>
</head>
<body>
  <div class="decoy">Click here to win a prize!</div>
  <iframe src="TARGET/account/delete" scrolling="no"></iframe>
</body>
</html>

<!-- Double-framing to bypass parent.location frame-busting -->
<html>
<body>
  <iframe src="attacker-inner.html">
    <!-- attacker-inner.html contains iframe of TARGET/ -->
  </iframe>
</body>
</html>
<!-- attacker-inner.html: -->
<iframe src="TARGET/"></iframe>

<!-- Sandbox attribute to disable frame-busting JS -->
<iframe src="TARGET/" sandbox="allow-forms allow-scripts allow-same-origin"></iframe>
<!-- Note: omit allow-top-navigation to prevent frame-busting -->

<!-- Disable JS entirely (IE restricted zone) -->
<iframe src="TARGET/" security="restricted"></iframe>

<!-- Browser header check -->
curl -s -I TARGET/ | grep -i "x-frame-options\|frame-ancestors"

<!-- Burp Suite: identify clickjacking -->
<!-- Proxy -> HTTP History -> right-click response -> 'Check Clickjacking' (via extension) -->
<!-- Or: manually check Response headers for X-Frame-Options -->
```

## Bypass Techniques
- **Double framing**: Nest target within two iframes; `parent.location` assignment fails silently when attacker controls the middle frame
- **sandbox attribute**: `sandbox="allow-forms allow-scripts"` without `allow-top-navigation` disables frame-busting navigation
- **HTML5 sandbox without allow-top-navigation**: frame-busting `top.location = self.location` throws security exception, ignored
- **onBeforeUnload exploitation**: Attacker page fires repeated navigation requests; victim's browser prompts "are you sure?" canceling frame-bust
- **Location variable redefinition (IE7/8, Safari 4)**: Override `window.location` as a non-writable property, breaking frame-busting assignment
- **XSS filter abuse**: Inject the beginning of the frame-busting script into a URL parameter, inducing a false XSS positive that deactivates the script
- **designMode**: Some browsers allow setting document to designMode, preventing frame-bust navigation
- **Drag-and-drop clickjacking**: Multipart attack using browser drag-and-drop API instead of clicks

## Exploitation Scenarios
**Scenario 1 — Unauthorized Fund Transfer**
Setup: Banking transfer form is a single page with pre-filled amounts from URL parameters; no clickjacking protection.
Trigger: Attacker crafts `TARGET/transfer?amount=500&to=attacker-acct`, embeds in transparent iframe with opacity 0.0, overlaid with "Confirm your free delivery" button.
Impact: Victim clicks decoy button, unknowingly submits transfer; funds moved to attacker account.

**Scenario 2 — Social Media Permission Grant**
Setup: OAuth permission grant page can be framed; one "Authorize" button present.
Trigger: Attacker embeds transparent iframe of permission page over a "Play game" button on their site.
Impact: Victim grants application full permission to their social media account without realizing.

**Scenario 3 — Account Deletion via Double-Framing**
Setup: Account deletion page has frame-busting JavaScript (`if (top != self) top.location = self.location`).
Trigger: Attacker uses double-framing to neutralize frame-bust; positions "Delete my account" button under a decoy.
Impact: Victim's account deleted; frame-busting protection rendered ineffective.

## False Positives
- `X-Frame-Options: SAMEORIGIN` correctly deployed — page loads in iframe from same origin but not cross-origin (not exploitable from attacker site)
- `Content-Security-Policy: frame-ancestors 'self'` properly preventing cross-origin framing
- JavaScript frame-busting that actually works in the tested browser (test across all major browsers)
- Target page requires form submission or multi-step interaction (single-click requirement not met)

## Fix Patterns
- Preferred: `Content-Security-Policy: frame-ancestors 'none'` (no framing at all) or `frame-ancestors 'self'` (same-origin only)
- Legacy support: `X-Frame-Options: DENY` or `X-Frame-Options: SAMEORIGIN` (supported IE8+, Firefox 3.6.9+, Chrome 4.1+)
- `X-Frame-Options: ALLOW-FROM origin` for specific trusted origins (not supported in Chrome/Safari — use CSP instead)
- Do not rely solely on JavaScript frame-busting — all known JS techniques are bypassable
- For high-value actions: require re-authentication or CSRF tokens that change per-page-load, reducing clickjacking payoff
- Apply defense-in-depth: combine CSP frame-ancestors with SameSite=Strict cookies to require direct navigation for sensitive actions

## Related Skills

Clickjacking is a user-assisted [[csrf]] variant: rather than forging a request invisibly, it tricks the victim into clicking a UI element that triggers the sensitive action. If the target page lacks `SameSite` protections and also lacks framing protection, both clickjacking and [[csrf]] may be independently exploitable. If the page can be framed and also reflects user input, an [[xss-reflected]] payload can be delivered inside the frame to capture interactions. [[cors-misconfig]] on a parent-framed page can be combined to read responses from the framed origin.
