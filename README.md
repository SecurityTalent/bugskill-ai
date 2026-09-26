<p align="center">
  <img src="Assets/BugSkill-AI-Logo.png" alt="BugSkill AI Logo" width="650" />
</p>

<h1 align="center"> BugSkill AI: HackerOne Bug Bounty Intelligence & Awesome AI Agent Skills</h1>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/python-3.8%2B-blue.svg" alt="Python Version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://api.hackerone.com/"><img src="https://img.shields.io/badge/HackerOne-API%20v1-red.svg" alt="HackerOne API"></a>
  <a href="#-dataset-overview"><img src="https://img.shields.io/badge/Disclosed%20Reports-9%2C950-brightgreen.svg" alt="Disclosed Reports"></a>
  <a href="#-dataset-overview"><img src="https://img.shields.io/badge/Total%20Bounties-%243.26M%2B-gold.svg" alt="Total Bounty Paid"></a>
  <a href="#-curated-agent-skills-collections"><img src="https://img.shields.io/badge/AI%20Skills-162%20Active%20Skills-brightgreen.svg" alt="Curated Skills"></a>
  <a href="#-zero-external-dependencies"><img src="https://img.shields.io/badge/Dependencies-0%20External%20(Stdlib)-brightgreen.svg" alt="Zero Dependencies"></a>
</p>

An enterprise-grade repository combining **9,950+ real-world disclosed HackerOne bug bounty reports** ($3.26M+ in bounties paid) with two curated, modular collections comprising **162 Universal AI Agent Skills** (`Awesome-Claude-Code-Agent-Skills/` [159 skills across 10 specialized domains] & `Personal-Claude-Code-Agent-Skills/` [3 deep HackerOne vulnerability intelligence skills]) built for next-generation AI coding assistants: **Claude Code**, **Gemini CLI**, **Google Antigravity**, **ChatGPT / Codex CLI**, and **Cursor**.

---

## 📑 Table of Contents

- [📊 Dataset Overview](#-dataset-overview)
- [📦 Curated Agent Skills Collections](#-curated-agent-skills-collections)
  - [1. Awesome Claude Code Skills (`Awesome-Claude-Code-Agent-Skills/`)](#1-awesome-claude-code-skills-awesome-claude-code-agent-skills)
  - [2. Personal Bug Bounty Intelligence Skills (`Personal-Claude-Code-Agent-Skills/`)](#2-personal-bug-bounty-intelligence-skills-personal-claude-code-agent-skills)
- [📁 Clean Repository Layout](#-clean-repository-layout)
- [⚡ Zero External Dependencies](#-zero-external-dependencies)
- [🤖 Universal Agent Skills Framework ("Using It")](#-universal-agent-skills-framework-using-it)
  - [1. Cross-Agent Compatibility Matrix](#1-cross-agent-compatibility-matrix)
  - [2. One-Command Universal Sync](#2-one-command-universal-sync)
  - [3. Using with Claude Code](#3-using-with-claude-code)
  - [4. Using with Gemini CLI & Google Antigravity](#4-using-with-gemini-cli--google-antigravity)
  - [5. Using with ChatGPT / Codex CLI](#5-using-with-chatgpt--codex-cli)
  - [6. Using with Cursor / VS Code](#6-using-with-cursor--vs-code)
- [🔎 Offline Report Search & Intelligence CLI (`search_reports.py`)](#-offline-report-search--intelligence-cli-search_reportspy)
- [⚡ HackerOne Hacktivity Downloader (`hackerone_public.py`)](#-hackerone-hacktivity-downloader-hackerone_publicpy)
- [📜 License & Responsible Disclosure](#-license--responsible-disclosure)

---

## 📊 Dataset Overview

The repository includes an offline intelligence dataset of **`9,950` disclosed vulnerability reports** fetched directly from the official HackerOne Hacktivity REST API.

| Metric | Details |
| :--- | :--- |
| **Total Disclosed Reports** | **9,950** vulnerabilities |
| **Total Bounty Value Paid** | **$3,264,576.00+** |
| **Bounty Rewarded Reports** | **1,832** reports (Average: **$1,781.97** per rewarded bug) |
| **Top Rewarded Vulnerability** | **$50,000.00** (Shopify GitHub access token exposure) |
| **Dataset File** | [`hackerone_public_reports.json`](hackerone_public_reports.json) (13.7 MB JSON) |
| **Key Vulnerability Classes** | IDOR, SSRF, OTP/2FA Bypass, Rate Limiting, RCE, OAuth Flaws, ATO, Race Conditions |

---

## 📦 Curated Agent Skills Collections

### 1. Awesome Claude Code Skills (`Awesome-Claude-Code-Agent-Skills/`)

A curated, production-ready collection of **159 specialized offensive security, penetration testing, reverse engineering, and AI agent skills** organized across 10 security domains:

| Domain | Skills Count | Focus Highlights |
| :--- | :--- | :--- |
| **🎯 Reconnaissance, Footprinting & OSINT** | **15 Skills** | Apex & root domain discovery, BGP/ASN mapping, Subdomain enumeration & takeover, PCAP analysis |
| **🌐 Web Application Exploitation & Injections** | **45 Skills** | SQLi, SSRF, SSTI, XSS, XXE, Command injection, Cache deception, Request smuggling, Race conditions |
| **🔑 Authentication, Authorization & Access Control** | **25 Skills** | 401/403 bypasses, BAC/IDOR, JWT & OAuth flaws, SAML SSO, business logic flaws |
| **🏢 Active Directory & Windows Exploitation** | **7 Skills** | AD ACL abuse, AD CS, Kerberos ticket attacks, NTLM relay coercion, AV evasion, lateral movement |
| **🐧 Linux, Containers & Cloud Security** | **6 Skills** | Container breakout, Kubernetes auditing, Linux privilege escalation & lateral movement, tunneling |
| **⚡ Binary Exploitation, Reverse Engineering & macOS** | **16 Skills** | Heap exploitation, format strings, kernel flaws, V8 engine, symbolic execution, macOS injection |
| **📱 Mobile & Smart Contract Security** | **12 Skills** | Android/iOS pentesting tricks, SSL pinning bypass, Smart contract & DeFi exploit patterns |
| **🔐 Cryptography & Cryptanalysis** | **6 Skills** | Classical ciphers, Hash cracking, Lattice attacks, RSA attacks, Steganography, Symmetric ciphers |
| **🧠 AI / LLM Security & Agent Orchestration** | **10 Skills** | Prompt injection, AI/ML security, Multi-agent orchestrators (`skillabc`, `hack`, `mcp-builder`) |
| **🛡️ DevSecOps, Defense & Workflow Automation** | **17 Skills** | Tabletop exercises, Bug bounty workflows, Code auditing, Dependency confusion, WAF bypasses |

<details>
<summary><b>🔍 Expand Full Directory of 159 Awesome Skills (Click to View Complete Table)</b></summary>

### Category Breakdown of Awesome Skills (159 Skills)

#### 🎯 Reconnaissance, Footprinting & OSINT (15 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`ApexDiscovery`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/ApexDiscovery/) | Comprehensive apex/root domain discovery using multiple techniques. USE WHEN user mentions find related domains, apex domains, root ... |
| [`api-recon-and-docs`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/api-recon-and-docs/) | API reconnaissance and documentation review playbook. Use when discovering endpoints, schemas, versions, OpenAPI specs, hidden docs,... |
| [`AsnRecon`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/AsnRecon/) | ASN and IPv4 range reconnaissance using bgp.he.net. USE WHEN user mentions ASN lookup, find IP ranges, company IP space, BGP reconna... |
| [`crawl`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/crawl/) | Deep web crawling using hakrawler and gospider for subdomain discovery, endpoint extraction, and JavaScript analysis. Use this skill... |
| [`jsa`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/jsa/) | Specialized offensive security skill. |
| [`JsAnalyzer`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/JsAnalyzer/) | Static analysis for JavaScript files targeting security vulnerabilities. USE WHEN user says 'analyze js', 'scan javascript', 'find s... |
| [`network-protocol-attacks`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/network-protocol-attacks/) | Network protocol attack playbook. Use when exploiting layer 2/3 protocols including ARP spoofing, LLMNR/NBT-NS/mDNS poisoning, WPAD ... |
| [`osint-enrich`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/osint-enrich/) | Specialized offensive security skill. |
| [`pulse-template`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/pulse-template/) | Specialized offensive security skill. |
| [`recon-and-methodology`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/recon-and-methodology/) | Reconnaissance and methodology playbook. Use when mapping assets, discovering endpoints, fingerprinting technology, and building a s... |
| [`recon-for-sec`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/recon-for-sec/) | Entry P1 category router for reconnaissance and methodology. Use when mapping scope, discovering assets, fingerprinting technology, ... |
| [`subdomain-takeover`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/subdomain-takeover/) | Subdomain takeover detection and exploitation playbook. Use when targets have dangling CNAME/NS/MX records pointing to deprovisioned... |
| [`SubdomainEnum`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/SubdomainEnum/) | Subdomain enumeration with Light and Full workflows, plus intelligent target prioritization. USE WHEN user mentions subdomain enumer... |
| [`traffic-analysis-pcap`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/traffic-analysis-pcap/) | Traffic analysis and PCAP forensics playbook. Use when analyzing network captures including Wireshark filters, protocol analysis (HT... |
| [`web-fingerprinting`](Awesome-Claude-Code-Agent-Skills/01-Reconnaissance-and-OSINT/web-fingerprinting/) | Identify web server type/version, framework, and application entry points via banner grabbing, HTTP header analysis (Server, ... |

#### 🌐 Web Application Exploitation & Injections (45 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`CacheDeception`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/CacheDeception/) | Web cache deception and poisoning exploitation. USE WHEN user mentions cache deception, cache poisoning, CDN bypass, URL parsing dis... |
| [`clickjacking`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/clickjacking/) | Clickjacking playbook. Use when testing whether target pages can be framed, whether X-Frame-Options or CSP frame-ancestors are prope... |
| [`clickjacking-testing`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/clickjacking-testing/) | Clickjacking overlays a target page in a transparent or hidden iframe, tricking victims into clicking UI elements they cannot see. ... |
| [`cmd-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/cmd-injection/) | OS command injection occurs when user input is passed unsanitized to a system shell via dangerous APIs: Java `Runtime.exec()`, Python ... |
| [`cmdi-command-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/cmdi-command-injection/) | Command injection playbook. Use when user input may reach shell commands, process execution, converters, import pipelines, or blind ... |
| [`cors-cross-origin-misconfiguration`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/cors-cross-origin-misconfiguration/) | CORS misconfiguration testing playbook. Use when analyzing cross-origin trust, credentialed browser reads, origin reflection, prefli... |
| [`cors-misconfig`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/cors-misconfig/) | CORS misconfiguration allows attacker-controlled origins to read sensitive cross-origin responses when servers echo the `Origin` ... |
| [`crlf-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/crlf-injection/) | CRLF injection playbook. Use when user input reaches HTTP response headers, Location redirects, Set-Cookie values, or log files wher... |
| [`cspt`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/cspt/) | Use when hunting Client-Side Path Traversal (CSPT) vulnerabilities where attacker- controlled input is unsafely concatenated into the ... |
| [`csrf`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/csrf/) | Cross-Site Request Forgery (CSRF) tricks authenticated users into submitting forged requests to a target application by exploiting ... |
| [`csrf-cross-site-request-forgery`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/csrf-cross-site-request-forgery/) | CSRF testing playbook. Use when reviewing state-changing web flows, anti-CSRF defenses, SameSite behavior, JSON CSRF, login CSRF, an... |
| [`csv-formula-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/csv-formula-injection/) | CSV/spreadsheet formula injection (DDE, Excel/LibreOffice, Google Sheets IMPORT*). Use when exports, imports, or user fields feed sp... |
| [`dangling-markup-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/dangling-markup-injection/) | Dangling markup injection playbook. Use when HTML injection is possible but JavaScript execution is blocked (CSP, sanitizer strips e... |
| [`dom-xss`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/dom-xss/) | DOM-based XSS occurs when JavaScript reads attacker-controlled sources (`location.hash`, `document.referrer`, `window.name`, ... |
| [`email-header-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/email-header-injection/) | Email header injection and spoofing playbook. Use when testing contact forms, email APIs, password reset flows, or any feature that ... |
| [`expression-language-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/expression-language-injection/) | Expression Language injection playbook. Use when Java EL, SpEL, OGNL, or MVEL expressions may evaluate attacker-controlled input in ... |
| [`file-access-vuln`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/file-access-vuln/) | Entry P1 category router for file access and upload workflows. Use when testing download endpoints, file paths, local file inclusion... |
| [`http-host-header-attacks`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/http-host-header-attacks/) | HTTP Host header injection and routing abuse playbook. Use when the application trusts the Host header for generating URLs, routing ... |
| [`http-parameter-pollution`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/http-parameter-pollution/) | HTTP Parameter Pollution (HPP): duplicate query/body keys parsed differently by servers, proxies, WAFs, and app frameworks. Use when... |
| [`http-request-smuggling`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/http-request-smuggling/) | HTTP request smuggling exploits disagreements between a front-end proxy and back-end server on where one HTTP request ends and the ... |
| [`http2-specific-attacks`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/http2-specific-attacks/) | HTTP/2 protocol-specific attack playbook. Use when the target supports HTTP/2 and you need to exploit binary framing, HPACK compress... |
| [`injection-checking`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/injection-checking/) | Entry P1 category router for injection testing. Use when routing between XSS, SQLi, SSRF, XXE, SSTI, command injection, and NoSQL in... |
| [`jndi-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/jndi-injection/) | JNDI injection playbook. Use when Java applications perform JNDI lookups with attacker-controlled names, especially via Log4j2, Spri... |
| [`open-redirect`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/open-redirect/) | Open redirect playbook. Use when URL parameters, form actions, or JavaScript sinks control navigation targets and may redirect users... |
| [`open-redirect-testing`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/open-redirect-testing/) | Use when testing redirect or return-URL parameters for open redirect vulnerabilities. Trigger on: ?redirect=, ?url=, ?next=, ... |
| [`path-traversal-lfi`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/path-traversal-lfi/) | Path traversal and LFI playbook. Use when file paths, download endpoints, include operations, archive extraction, or wrapper behavio... |
| [`prototype-pollution`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/prototype-pollution/) | Prototype pollution testing for JavaScript stacks. Use when user input is merged into objects (query parsers, JSON bodies, deep assi... |
| [`prototype-pollution-advanced`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/prototype-pollution-advanced/) | Advanced prototype pollution playbook — server-side RCE, client-side gadgets, filter bypasses, and detection techniques. Companion t... |
| [`race-condition`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/race-condition/) | Race condition and TOCTOU testing for web apps. Use when testing one-time operations, concurrent HTTP abuse, rate-limit bypass, Turb... |
| [`request-smuggling`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/request-smuggling/) | HTTP request smuggling and desynchronization testing. Use when front proxies, CDNs, or load balancers disagree with the origin on me... |
| [`sql-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/sql-injection/) | SQL injection occurs when untrusted user input is interpolated directly into database queries, allowing attackers to alter query ... |
| [`sqli-sql-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/sqli-sql-injection/) | SQL injection playbook. Use when input reaches SQL queries, authentication logic, sorting, filtering, reporting, or DB-specific blin... |
| [`ssrf`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/ssrf/) | Server-Side Request Forgery (SSRF) occurs when user-controlled input is used to construct URLs that the server fetches, enabling ... |
| [`ssrf-server-side-request-forgery`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/ssrf-server-side-request-forgery/) | SSRF playbook. Use when the server fetches URLs, resolves hostnames, imports remote content, or can be driven toward internal networ... |
| [`ssti`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/ssti/) | Server-Side Template Injection (SSTI) occurs when user input is embedded directly into a template engine (Jinja2, Twig, Freemarker, ... |
| [`ssti-server-side-template-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/ssti-server-side-template-injection/) | SSTI playbook. Use when template expressions, server-side rendering, preview features, or templating engines may evaluate attacker-c... |
| [`type-juggling`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/type-juggling/) | PHP type juggling and weak comparison (`==`) bypass. Use when authentication, HMAC/signature checks, or token validation uses loose ... |
| [`web-cache-deception`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/web-cache-deception/) | Web cache deception and poisoning playbook. Use when CDN, reverse proxy, or application caching may serve sensitive authenticated co... |
| [`websocket-security`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/websocket-security/) | WebSocket handshake, CSWSH, tooling (wsrepl, ws-harness, Burp), and common flaws. Use when apps use real-time channels, chat, notifi... |
| [`xslt-injection`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/xslt-injection/) | XSLT injection testing: processor fingerprinting, XXE and document() SSRF, EXSLT write primitives, PHP/Java/.NET extension RCE surfa... |
| [`xss-cross-site-scripting`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/xss-cross-site-scripting/) | XSS playbook. Use when user-controlled content reaches HTML, attributes, JavaScript, DOM sinks, uploads, or multi-context rendering ... |
| [`xss-reflected`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/xss-reflected/) | Reflected XSS occurs when user-supplied input is echoed in an HTTP response without sanitization, allowing script execution in the ... |
| [`xss-stored`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/xss-stored/) | Stored XSS (persistent XSS) occurs when attacker-supplied input is saved server-side and later rendered unencoded to other users. ... |
| [`xxe`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/xxe/) | XML External Entity (XXE) injection exploits XML parsers that process DTD external entity declarations, enabling local file disclosure ... |
| [`xxe-xml-external-entity`](Awesome-Claude-Code-Agent-Skills/02-Web-Application-Security/xxe-xml-external-entity/) | XXE playbook. Use when XML, SVG, OOXML, SOAP, or parser-driven imports may resolve external entities, files, or internal network res... |

#### 🔑 Authentication, Authorization & Access Control (25 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`401-403-bypass-techniques`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/401-403-bypass-techniques/) | 401/403 bypass playbook. Use when encountering access-denied responses on admin panels, API endpoints, or restricted paths. Covers p... |
| [`403Bypass`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/403Bypass/) | Automated 403 Forbidden bypass testing using Jason Haddix's techniques. USE WHEN you encounter 403 responses during recon, content d... |
| [`api-auth-and-jwt-abuse`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/api-auth-and-jwt-abuse/) | API authentication and JWT abuse playbook. Use when testing bearer tokens, API keys, claim trust, header spoofing, rate limits, and ... |
| [`api-authorization-and-bola`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/api-authorization-and-bola/) | API authorization and BOLA testing playbook. Use when APIs expose object identifiers, nested resources, hidden writable fields, or w... |
| [`api-sec`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/api-sec/) | Entry P1 category router for API security. Use when choosing between API recon, authorization, token abuse, and hidden-parameter wor... |
| [`auth-bypass`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/auth-bypass/) | Bypass authentication via forced browsing to protected URLs, parameter tampering (authenticated=yes, debug=true, fromtrustIP=true), ... |
| [`auth-sec`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/auth-sec/) | Entry P1 category router for authentication and authorization. Use when testing login flows, sessions, object authorization, JWT, OA... |
| [`authbypass-authentication-flaws`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/authbypass-authentication-flaws/) | Authentication bypass testing playbook. Use when assessing login flows, password reset logic, account recovery, MFA bypass, token pr... |
| [`authz-bypass`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/authz-bypass/) | Test horizontal and vertical authorization bypass via session ID swapping between accounts, IDOR through parameter manipulation ... |
| [`bac-analyzer`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/bac-analyzer/) | Passive traffic analyzer that examines captured HTTP traffic (HAR, Caido JSON, Burp XML) to identify potential Broken Access Control... |
| [`bola-idor`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/bola-idor/) | Use when hunting Broken Object Level Authorization (BOLA) or Insecure Direct Object Reference (IDOR) vulnerabilities in APIs or web ... |
| [`business-logic-flaws`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/business-logic-flaws/) | Business logic flaws are application vulnerabilities where valid functions are abused in unintended ways: price manipulation via ... |
| [`business-logic-vuln`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/business-logic-vuln/) | Entry P1 category router for business logic testing. Use when workflow abuse, race conditions, pricing flaws, or multi-step state at... |
| [`business-logic-vulnerabilities`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/business-logic-vulnerabilities/) | Business logic vulnerability playbook. Use when reasoning about workflows, race conditions, price manipulation, coupon abuse, state ... |
| [`cookie-attacks`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/cookie-attacks/) | Audit and attack session cookies via missing Secure/HttpOnly/SameSite attributes, overly broad Domain/Path scope, non-expiring ... |
| [`default-credentials`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/default-credentials/) | Identify and exploit default or weak credentials on web application login forms, admin panels, CMS backends (WordPress wp-admin, ... |
| [`graphql-idor-via-introspection-leak`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/graphql-idor-via-introspection-leak/) | Covers object-level authorization bypass in GraphQL APIs where introspection reveals hidden fields or mutations that accept arbitrary ... |
| [`idor-broken-object-authorization`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/idor-broken-object-authorization/) | IDOR and broken object authorization testing playbook. Use when requests expose object identifiers, tenant boundaries, writable fiel... |
| [`jwt-misconfig`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/jwt-misconfig/) | Use when testing JWT-based authentication for algorithm confusion, alg:none bypass, weak HMAC secrets, missing expiration, kid ... |
| [`jwt-oauth-token-attacks`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/jwt-oauth-token-attacks/) | JWT and OAuth token attack playbook. Use when validating token trust, signing algorithms, key handling, claim abuse, bearer flows, a... |
| [`mass-assignment`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/mass-assignment/) | Use when testing APIs and web frameworks for mass assignment vulnerabilities where user-controlled request body fields are bound ... |
| [`oauth-oidc-misconfiguration`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/oauth-oidc-misconfiguration/) | OAuth and OIDC misconfiguration testing playbook. Use when reviewing redirect URI handling, state and nonce validation, PKCE, token ... |
| [`password-reset-flaws`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/password-reset-flaws/) | Exploit weak password reset and change flows via CSRF on reset forms, cross-user password modification by swapping username ... |
| [`saml-sso-assertion-attacks`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/saml-sso-assertion-attacks/) | SAML SSO assertion attack playbook. Use when testing signature validation, assertion wrapping, audience restrictions, ACS handling, ... |
| [`session-fixation`](Awesome-Claude-Code-Agent-Skills/03-Authentication-and-Access-Control/session-fixation/) | Detect and exploit session fixation (WSTG-SESS-01, WSTG-SESS-03) and session exposure (WSTG-SESS-04) by testing whether the server ... |

#### 🏢 Active Directory & Windows Exploitation (7 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`active-directory-acl-abuse`](Awesome-Claude-Code-Agent-Skills/04-Active-Directory-and-Windows/active-directory-acl-abuse/) | Active Directory ACL abuse playbook. Use when exploiting misconfigured AD permissions including GenericAll, WriteDACL, DCSync rights... |
| [`active-directory-certificate-services`](Awesome-Claude-Code-Agent-Skills/04-Active-Directory-and-Windows/active-directory-certificate-services/) | AD Certificate Services attack playbook. Use when targeting misconfigured AD CS for privilege escalation via ESC1-ESC13 template abu... |
| [`active-directory-kerberos-attacks`](Awesome-Claude-Code-Agent-Skills/04-Active-Directory-and-Windows/active-directory-kerberos-attacks/) | Kerberos attack playbook for Active Directory. Use when targeting AD authentication via AS-REP roasting, Kerberoasting, golden/silve... |
| [`ntlm-relay-coercion`](Awesome-Claude-Code-Agent-Skills/04-Active-Directory-and-Windows/ntlm-relay-coercion/) | NTLM relay and authentication coercion playbook. Use when capturing and relaying NTLM authentication to escalate privileges via SMB,... |
| [`windows-av-evasion`](Awesome-Claude-Code-Agent-Skills/04-Active-Directory-and-Windows/windows-av-evasion/) | AV/EDR evasion playbook for Windows. Use when bypassing AMSI, ETW, .NET assembly detection, shellcode execution, process injection, ... |
| [`windows-lateral-movement`](Awesome-Claude-Code-Agent-Skills/04-Active-Directory-and-Windows/windows-lateral-movement/) | Windows lateral movement playbook. Use when pivoting between Windows hosts via PsExec, WMI, WinRM, DCOM, RDP, pass-the-hash, overpas... |
| [`windows-privilege-escalation`](Awesome-Claude-Code-Agent-Skills/04-Active-Directory-and-Windows/windows-privilege-escalation/) | Windows local privilege escalation playbook. Use when you have low-privilege shell access on Windows and need to escalate via token ... |

#### 🐧 Linux, Containers & Cloud Security (6 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`container-escape-techniques`](Awesome-Claude-Code-Agent-Skills/05-Linux-Containers-and-Cloud/container-escape-techniques/) | Container escape playbook. Use when operating inside a Docker container, LXC, or Kubernetes pod and need to escape to the host via p... |
| [`kubernetes-pentesting`](Awesome-Claude-Code-Agent-Skills/05-Linux-Containers-and-Cloud/kubernetes-pentesting/) | Kubernetes penetration testing playbook. Use when targeting Kubernetes clusters via API server, RBAC enumeration, service account ab... |
| [`linux-lateral-movement`](Awesome-Claude-Code-Agent-Skills/05-Linux-Containers-and-Cloud/linux-lateral-movement/) | Linux lateral movement playbook. Use after gaining initial access to pivot across Linux hosts via SSH hijacking, credential harvesti... |
| [`linux-privilege-escalation`](Awesome-Claude-Code-Agent-Skills/05-Linux-Containers-and-Cloud/linux-privilege-escalation/) | Linux privilege escalation playbook. Use when you have low-privilege shell access and need to escalate to root via SUID/SGID binarie... |
| [`linux-security-bypass`](Awesome-Claude-Code-Agent-Skills/05-Linux-Containers-and-Cloud/linux-security-bypass/) | Linux security mechanism bypass playbook. Use when facing restricted bash/rbash, read-only or noexec filesystems, AppArmor, SELinux,... |
| [`tunneling-and-pivoting`](Awesome-Claude-Code-Agent-Skills/05-Linux-Containers-and-Cloud/tunneling-and-pivoting/) | Tunneling and pivoting playbook. Use when establishing network tunnels through compromised hosts including SSH tunneling, Chisel, Li... |

#### ⚡ Binary Exploitation, Reverse Engineering & macOS (16 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`anti-debugging-techniques`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/anti-debugging-techniques/) | Anti-debugging detection and bypass playbook. Use when reversing protected binaries that detect debuggers via ptrace, PEB flags, tim... |
| [`arbitrary-write-to-rce`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/arbitrary-write-to-rce/) | Arbitrary write to RCE playbook. Use when you have an arbitrary write primitive (from heap exploitation, format string, or OOB write... |
| [`binary-protection-bypass`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/binary-protection-bypass/) | Binary protection bypass playbook. Use when identifying and bypassing ASLR, PIE, NX/DEP, stack canary, RELRO, FORTIFY_SOURCE, CET, a... |
| [`browser-exploitation-v8`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/browser-exploitation-v8/) | Browser and V8 exploitation playbook. Use when exploiting JavaScript engine vulnerabilities including JIT type confusion, incorrect ... |
| [`code-obfuscation-deobfuscation`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/code-obfuscation-deobfuscation/) | Code obfuscation analysis and deobfuscation playbook. Use when reversing binaries protected by junk code, opaque predicates, self-mo... |
| [`format-string-exploitation`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/format-string-exploitation/) | Format string exploitation playbook. Use when printf-family functions receive user-controlled format strings, enabling arbitrary sta... |
| [`ghost-bits-cast-attack`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/ghost-bits-cast-attack/) | Java "Ghost Bits" / Cast Attack playbook (Black Hat Asia 2026). Use when attacking Java services where 16-bit char is silently narro... |
| [`heap-exploitation`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/heap-exploitation/) | Heap exploitation playbook. Use when targeting ptmalloc2/glibc heap vulnerabilities including UAF, double free, overflow, off-by-one... |
| [`kernel-exploitation`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/kernel-exploitation/) | Linux kernel exploitation playbook. Use when exploiting kernel vulnerabilities (UAF, OOB, race condition, type confusion) for privil... |
| [`macos-process-injection`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/macos-process-injection/) | macOS process injection playbook. Use when you need to inject code into running or launching macOS processes via dylib hijacking, DY... |
| [`macos-security-bypass`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/macos-security-bypass/) | macOS security bypass playbook. Use when targeting macOS endpoints and need to bypass TCC, Gatekeeper, SIP, sandbox, code signing, o... |
| [`memory-forensics-volatility`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/memory-forensics-volatility/) | Memory forensics playbook using Volatility 2/3. Use when analyzing memory dumps for malware analysis, credential extraction, process... |
| [`sandbox-escape-techniques`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/sandbox-escape-techniques/) | Sandbox escape playbook. Use when breaking out of Python sandbox, Lua sandbox, seccomp filter, chroot jail, container/Docker, browse... |
| [`stack-overflow-and-rop`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/stack-overflow-and-rop/) | Stack overflow and ROP playbook. Use when exploiting buffer overflows to hijack control flow via return address overwrite, ROP chain... |
| [`symbolic-execution-tools`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/symbolic-execution-tools/) | Symbolic execution and constraint solving playbook. Use when solving CTF reversing challenges, recovering keys, bypassing checks, or... |
| [`vm-and-bytecode-reverse`](Awesome-Claude-Code-Agent-Skills/06-Binary-and-Reverse-Engineering/vm-and-bytecode-reverse/) | Custom VM and bytecode reverse engineering playbook. Use when CTF challenges or protected software implement custom virtual machines... |

#### 📱 Mobile & Smart Contract Security (12 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`android-pentesting-tricks`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/android-pentesting-tricks/) | Android pentesting playbook. Use when testing Android applications for SSL pinning bypass, exported component abuse, WebView vulnera... |
| [`defi-attack-patterns`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/defi-attack-patterns/) | DeFi attack pattern playbook. Use when analyzing flash loan attacks, price oracle manipulation, MEV sandwich attacks, governance exp... |
| [`ios-pentesting-tricks`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/ios-pentesting-tricks/) | iOS pentesting playbook. Use when testing iOS applications for keychain extraction, URL scheme hijacking, Universal Links exploitati... |
| [`mobile-auth-bypass`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/mobile-auth-bypass/) | Detects authentication and biometric bypass vulnerabilities in mobile apps (Android/iOS). Trigger on: BiometricPrompt, ... |
| [`mobile-code-quality`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/mobile-code-quality/) | Detects code quality vulnerabilities in mobile apps (Android/iOS). Trigger on: SQL injection in SQLite, JavaScript injection in ... |
| [`mobile-insecure-storage`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/mobile-insecure-storage/) | Detects sensitive data stored insecurely on mobile devices (Android/iOS). Trigger on: SharedPreferences, NSUserDefaults, SQLite, Room ... |
| [`mobile-network-security`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/mobile-network-security/) | Detects insecure network communication in mobile apps (Android/iOS). Trigger on: cleartext HTTP, TLS misconfiguration, certificate ... |
| [`mobile-platform-interaction`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/mobile-platform-interaction/) | Detects insecure platform interaction in mobile apps (Android/iOS). Trigger on: exported Activity, exported Service, exported ... |
| [`mobile-resilience`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/mobile-resilience/) | Detects weak reverse engineering and tampering protections in mobile apps (Android/iOS). Trigger on: root detection bypass, jailbreak ... |
| [`mobile-ssl-pinning-bypass`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/mobile-ssl-pinning-bypass/) | Mobile SSL pinning bypass playbook. Use when intercepting HTTPS traffic from mobile applications that implement certificate pinning,... |
| [`mobile-weak-crypto`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/mobile-weak-crypto/) | Detects weak or misconfigured cryptography in mobile apps (Android/iOS). Trigger on: hardcoded keys, ECB mode, DES, 3DES, RC4, MD5, ... |
| [`smart-contract-vulnerabilities`](Awesome-Claude-Code-Agent-Skills/07-Mobile-and-Smart-Contracts/smart-contract-vulnerabilities/) | Smart contract vulnerability playbook. Use when auditing Solidity/EVM contracts for reentrancy, integer overflow, access control, de... |

#### 🔐 Cryptography & Cryptanalysis (6 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`classical-cipher-analysis`](Awesome-Claude-Code-Agent-Skills/08-Cryptography-and-Cryptanalysis/classical-cipher-analysis/) | Classical cipher analysis playbook. Use when encountering substitution ciphers, Vigenere, transposition, XOR, or encoded text in CTF... |
| [`hash-attack-techniques`](Awesome-Claude-Code-Agent-Skills/08-Cryptography-and-Cryptanalysis/hash-attack-techniques/) | Hash attack playbook. Use when exploiting length extension, MD5/SHA1 collisions, HMAC timing leaks, birthday attacks, or hash-based ... |
| [`lattice-crypto-attacks`](Awesome-Claude-Code-Agent-Skills/08-Cryptography-and-Cryptanalysis/lattice-crypto-attacks/) | Lattice-based cryptanalysis playbook. Use when attacking RSA via Coppersmith small roots, recovering DSA/ECDSA nonces from bias, sol... |
| [`rsa-attack-techniques`](Awesome-Claude-Code-Agent-Skills/08-Cryptography-and-Cryptanalysis/rsa-attack-techniques/) | RSA attack playbook for CTF and real-world cryptanalysis. Use when given RSA parameters (n, e, c) and need to recover plaintext by e... |
| [`steganography-techniques`](Awesome-Claude-Code-Agent-Skills/08-Cryptography-and-Cryptanalysis/steganography-techniques/) | Steganography detection and extraction playbook. Use when analyzing images (LSB, PNG chunks, JPEG DCT, EXIF), audio (spectrogram, DT... |
| [`symmetric-cipher-attacks`](Awesome-Claude-Code-Agent-Skills/08-Cryptography-and-Cryptanalysis/symmetric-cipher-attacks/) | Symmetric cipher attack playbook. Use when exploiting block cipher mode weaknesses (CBC padding oracle, ECB cut-and-paste, bit flipp... |

#### 🧠 AI / LLM Security & Agent Orchestration (10 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`ai-ml-security`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/ai-ml-security/) | AI/ML security playbook. Use when assessing model supply chain attacks (pickle RCE, poisoned weights), adversarial examples, model p... |
| [`amend-skill`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/amend-skill/) | Inspects a skill's SKILL.md and its observations/runs.md log, identifies failure patterns, and proposes a targeted amendment to ... |
| [`artifacts-builder`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/artifacts-builder/) | Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailw... |
| [`distill-skill`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/distill-skill/) | Use when the user wants to extract reusable offensive security knowledge from any source and generate a SKILL.md file. Trigger on: ... |
| [`hack`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/hack/) | Entry P0 primary router for HackSkills. Use when the task involves web application testing, API security assessment, recon, vulnerab... |
| [`llm-prompt-injection`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/llm-prompt-injection/) | LLM prompt injection playbook. Use when testing AI/LLM applications for direct injection, indirect injection via RAG/browsing, tool ... |
| [`mcp-builder`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/mcp-builder/) | Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through wel... |
| [`observe-skill`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/observe-skill/) | Logs the outcome of a skill execution to observations/<skill-name>/runs.md. Trigger on: "log this run", "skill worked", "skill ... |
| [`skill-creator`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/skill-creator/) | Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) t... |
| [`skillabc`](Awesome-Claude-Code-Agent-Skills/09-AI-Security-and-Orchestration/skillabc/) | Intelligent orchestration layer that analyzes requests, selects the most relevant OpenCode skills, combines workflows intelligently,... |

#### 🛡️ DevSecOps, Defense & Workflow Automation (17 Skills)

| Skill Directory | Description |
| :--- | :--- |
| [`BugBountyWorkflow`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/BugBountyWorkflow/) | Bug bounty hunting workflow and report writing expertise. USE WHEN user mentions bug bounty, vulnerability report, HackerOne, Bugcro... |
| [`cicd-bot-command-injection`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/cicd-bot-command-injection/) | Use when hunting CI/CD bot comment command vulnerabilities where issue_comment or pull_request_review_comment triggers invoke ... |
| [`code-security-auditor`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/code-security-auditor/) | Perform pre-execution security audits of untrusted codebases through static analysis. Use when analyzing a codebase for potential ma... |
| [`csp-bypass-advanced`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/csp-bypass-advanced/) | Advanced Content Security Policy bypass techniques. Use when XSS or data exfiltration is blocked by CSP and you need to find policy ... |
| [`dependency-confusion`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/dependency-confusion/) | Supply-chain testing via package-manager dependency confusion: when internal package names resolve to attacker-controlled public reg... |
| [`deserialization-insecure`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/deserialization-insecure/) | Insecure deserialization playbook. Use when Java, PHP, or Python applications deserialize untrusted data via ObjectInputStream, unse... |
| [`dns-rebinding-attacks`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/dns-rebinding-attacks/) | DNS rebinding attack playbook. Use when testing applications that trust DNS resolution for origin checks, interact with internal ser... |
| [`github-actions-cache-poisoning`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/github-actions-cache-poisoning/) | Use when hunting GitHub Actions cache poisoning vulnerabilities where an attacker can inject malicious content into the CI/CD cache ... |
| [`github-actions-script-injection`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/github-actions-script-injection/) | Use when auditing GitHub Actions workflows for script injection vulnerabilities via unsanitized context expressions. Trigger on: ... |
| [`graphql-and-hidden-parameters`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/graphql-and-hidden-parameters/) | GraphQL and hidden parameter testing playbook. Use when exploring introspection, batching, undocumented fields, hidden parameters, s... |
| [`insecure-source-code-management`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/insecure-source-code-management/) | Source control and artifact exposure (.git, .svn, .hg, backups, .env). Use when recon finds VCS paths, 403 on hidden dirs, or backup... |
| [`java-backend-architect`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/java-backend-architect/) | Comprehensive skill for designing and building scalable Spring Boot backend systems with clean architecture, JWT auth, MySQL, REST A... |
| [`pwn-request`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/pwn-request/) | Use when hunting Pwn Request vulnerabilities where pull_request_target workflows checkout attacker-controlled PR code and execute it ... |
| [`self-hosted-runner-poisoning`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/self-hosted-runner-poisoning/) | Use when hunting self-hosted GitHub Actions runner vulnerabilities where fork pull requests can execute on privileged non-ephemeral ... |
| [`TabletopExercise`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/TabletopExercise/) | Comprehensive cybersecurity tabletop exercise design and facilitation framework. USE WHEN designing incident response scenarios, cre... |
| [`waf-bypass-techniques`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/waf-bypass-techniques/) | WAF bypass methodology and generic evasion techniques. Use when a web application firewall blocks injection payloads (SQLi, XSS, RCE... |
| [`webapp-testing`](Awesome-Claude-Code-Agent-Skills/10-DevSecOps-and-Defense/webapp-testing/) | Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debuggi... |

</details>

---

### 2. Personal Bug Bounty Intelligence Skills (`Personal-Claude-Code-Agent-Skills/`)

Custom, deep vulnerability analysis skills derived directly from real-world HackerOne disclosed reports:

| Skill Directory | Target Vulnerability Class | Reference Report | Included Tooling |
| :--- | :--- | :--- | :--- |
| [`otp-bruteforce-testing`](Personal-Claude-Code-Agent-Skills/otp-bruteforce-testing/) | OTP Brute-Force, Rate Limiting Bypass & Response Oracle Detection | HackerOne [#3265780](https://hackerone.com/reports/3265780) | [`scripts/otp_bruteforce.py`](Personal-Claude-Code-Agent-Skills/otp-bruteforce-testing/scripts/otp_bruteforce.py) (Multi-threaded, proxy support, response oracle detection) |
| [`stack-bounds-format-auditing`](Personal-Claude-Code-Agent-Skills/stack-bounds-format-auditing/) | Stack Buffer Overflow via String Format / Copy Bounds Arithmetic (`snprintf`, `swprintf`, `memcpy`) | HackerOne [#2551512](https://hackerone.com/reports/2551512) | [`scripts/fmt_bounds_audit.py`](Personal-Claude-Code-Agent-Skills/stack-bounds-format-auditing/scripts/fmt_bounds_audit.py) (Static bounds arithmetic scanner, PoC crash generator & validation harness) |
| [`url-parser-confusion-testing`](Personal-Claude-Code-Agent-Skills/url-parser-confusion-testing/) | URL Parser Inconsistencies & SSRF Filter Bypass (Triple-Slash, Delimiters, Numeric IPs) | HackerOne [#3923212](https://hackerone.com/reports/3923212) | [`scripts/url_parser_diff.py`](Personal-Claude-Code-Agent-Skills/url-parser-confusion-testing/scripts/url_parser_diff.py) (Differential parser testing across Python, cURL, and Node.js) |

---

## 📁 Clean Repository Layout

```text
.
├── README.md                              # Repository documentation & universal agent guide
├── Assets/                                # Media assets & project branding
│   └── BugSkill-AI-Logo.png               # Official BugSkill AI Logo
├── requirements.txt                       # Dependency notes (Zero external dependencies)
├── search_reports.py                      # Offline multi-filter search CLI (Python stdlib)
├── hackerone_public.py                    # HackerOne API Hacktivity downloader (Python stdlib)
├── hackerone_public_reports.json          # Offline dataset (9,950 disclosed reports)
│
├── Awesome-Claude-Code-Agent-Skills/      # 🌟 Curated Security Skills (159 Skills across 10 Domains)
│   ├── 01-Reconnaissance-and-OSINT/       # ApexDiscovery, AsnRecon, SubdomainEnum, crawl, jsa...
│   ├── 02-Web-Application-Security/       # SQLi, SSRF, SSTI, XSS, XXE, CMDi, CacheDeception...
│   ├── 03-Authentication-and-Access-Control/ # 401/403 bypass, BOLA/IDOR, JWT/OAuth, SAML...
│   ├── 04-Active-Directory-and-Windows/   # AD CS, Kerberos, NTLM relay, PrivEsc, AV evasion...
│   ├── 05-Linux-Containers-and-Cloud/     # Kubernetes, container escapes, Linux PrivEsc...
│   ├── 06-Binary-and-Reverse-Engineering/ # Heap, format strings, kernel, V8, macOS injection...
│   ├── 07-Mobile-and-Smart-Contracts/     # Android/iOS pentesting, SSL pinning, DeFi...
│   ├── 08-Cryptography-and-Cryptanalysis/ # RSA, Lattice, Hash attacks, Steganography...
│   ├── 09-AI-Security-and-Orchestration/  # Prompt injection, AI/ML security, skillabc, hack...
│   └── 10-DevSecOps-and-Defense/          # TabletopExercise, BugBountyWorkflow, Code auditor...
│
└── Personal-Claude-Code-Agent-Skills/     # 🛡️ HackerOne Intelligence Skills (Custom Reports)
    ├── Note.md                            # Master ledger of converted HackerOne report IDs
    ├── otp-bruteforce-testing/            # OTP Brute-Force & Oracle Testing (H1 #3265780)
    ├── stack-bounds-format-auditing/      # Stack Buffer Overflow & Bounds Auditing (H1 #2551512)
    └── url-parser-confusion-testing/      # URL Parser Inconsistencies & SSRF Bypass (H1 #3923212)
```

---

## ⚡ Zero External Dependencies

All core utilities, dataset search tools, and primary skill scripts are written natively using the **Python 3 Standard Library** (Python 3.8+):

- [`search_reports.py`](search_reports.py) (`json`, `argparse`, `pathlib`, `collections`)
- [`hackerone_public.py`](hackerone_public.py) (`urllib.request`, `base64`, `json`, `argparse`)
- [`Personal-Claude-Code-Agent-Skills/*`](Personal-Claude-Code-Agent-Skills/) (`urllib.request`, `threading`, `json`, `argparse`, `ipaddress`, `subprocess`)

No third-party packages or `pip install` steps are required for core operations.

---

## 🤖 Universal Agent Skills Framework ("Using It")

Every skill in this repository contains structured instructions and workflows making it compatible across all major agent environments.

### 1. Cross-Agent Compatibility Matrix

| AI Agent Platform | Global / Personal Scope | Project / Repository Scope |
| :--- | :--- | :--- |
| **Claude Code** | `~/.claude/skills/<skill-name>/` | `.claude/skills/<skill-name>/` |
| **Gemini CLI** | `~/.gemini/skills/` or `~/.agents/skills/` | `.gemini/skills/` or `.agents/skills/` |
| **Google Antigravity** | `~/.agents/skills/<skill-name>/` | `.agents/skills/<skill-name>/` |
| **ChatGPT / Codex CLI** | `~/.codex/skills/` or `~/.agents/skills/` | `.agents/skills/<skill-name>/` |
| **Cursor / VS Code** | `@mention SKILL.md` | `.cursorrules` / `.vscode/` |

---

### 2. One-Command Universal Sync

Install all skills into your local agent environment with a single command:

#### Linux / macOS (Bash / Zsh):
```bash
# Sync ALL skills to Claude Code (Project Scope)
mkdir -p .claude/skills
cp -r Awesome-Claude-Code-Agent-Skills/*/* .claude/skills/
cp -r "Personal-Claude-Code-Agent-Skills/"* .claude/skills/

# Sync ALL skills to Claude Code (Global Scope)
mkdir -p ~/.claude/skills
cp -r Awesome-Claude-Code-Agent-Skills/*/* ~/.claude/skills/
cp -r "Personal-Claude-Code-Agent-Skills/"* ~/.claude/skills/

# Sync ALL skills to Gemini CLI, Google Antigravity & Codex
mkdir -p ~/.agents/skills
cp -r Awesome-Claude-Code-Agent-Skills/*/* ~/.agents/skills/
cp -r "Personal-Claude-Code-Agent-Skills/"* ~/.agents/skills/
```

#### Windows (PowerShell):
```powershell
# Sync ALL skills to Claude Code (Project Scope)
New-Item -ItemType Directory -Force -Path ".claude\skills"
Get-ChildItem -Path "Awesome-Claude-Code-Agent-Skills\*\*" -Directory | Copy-Item -Destination ".claude\skills\" -Recurse -Force
Copy-Item -Recurse -Force "Personal-Claude-Code-Agent-Skills\*" ".claude\skills\"

# Sync ALL skills to Gemini CLI, Google Antigravity & Codex
New-Item -ItemType Directory -Force -Path "$HOME\.agents\skills"
Get-ChildItem -Path "Awesome-Claude-Code-Agent-Skills\*\*" -Directory | Copy-Item -Destination "$HOME\.agents\skills\" -Recurse -Force
Copy-Item -Recurse -Force "Personal-Claude-Code-Agent-Skills\*" "$HOME\.agents\skills\"
```

---

### 3. Using with Claude Code

#### Direct Slash Commands
```text
/403Bypass
/SubdomainEnum
/ApexDiscovery
/JsAnalyzer
/TabletopExercise
/otp-bruteforce-testing
/url-parser-confusion-testing
/stack-bounds-format-auditing
```

#### Natural Prompting (Auto-Invocation)
Claude Code automatically indexes skill descriptions and activates them dynamically when you describe relevant security tasks:

> *"Perform subdomain enumeration and prioritize live targets for `example.com`."*
> *"Audit our authentication API for OTP brute-force bypasses."*

---

### 4. Using with Gemini CLI & Google Antigravity

- **Auto-Discovery:** Antigravity and Gemini CLI automatically load and execute any skill located in `.agents/skills/` or `~/.agents/skills/`.
- **Natural Execution:** Prompt the agent with the target domain or source code to audit.

---

### 5. Using with ChatGPT / Codex CLI

- Codex CLI reads skills from `.agents/skills/` or `~/.codex/skills/`.
- List active skills with `codex /skills`.

---

### 6. Using with Cursor / VS Code

- Add skill references in `.cursorrules` or `@mention` any `SKILL.md` file directly in the chat panel.

---

## 🔎 Offline Report Search & Intelligence CLI (`search_reports.py`)

Search and analyze the **9,950+ disclosed reports** dataset offline with sub-second execution:

```bash
# 1. Global keyword search
python search_reports.py "OTP"
python search_reports.py "IDOR"
python search_reports.py "SSRF"

# 2. Filter by severity and minimum bounty
python search_reports.py "bypass" --severity critical --min-bounty 2500

# 3. Filter by CWE category
python search_reports.py --cwe "CWE-307"
python search_reports.py --cwe "CWE-79" --limit 10

# 4. Filter by target company/program
python search_reports.py --program "shopify" --severity high

# 5. Inspect deep report details by ID
python search_reports.py --id 3265780
python search_reports.py --id 2551512

# 6. Display high-level dataset statistics
python search_reports.py --stats

# 7. Output structured JSON for scripts and CI/CD pipelines
python search_reports.py "RCE" --severity critical --json
```

---

## ⚡ HackerOne Hacktivity Downloader (`hackerone_public.py`)

To refresh or append newly disclosed reports directly from the HackerOne REST API:

1. Obtain your API Identifier and Token from [HackerOne Settings -> API](https://hackerone.com/settings/api).
2. Set your environment variables:

```bash
# Linux / macOS
export H1_API_IDENTIFIER="YOUR_IDENTIFIER"
export H1_API_TOKEN="YOUR_TOKEN"

# Windows (PowerShell)
$env:H1_API_IDENTIFIER="YOUR_IDENTIFIER"
$env:H1_API_TOKEN="YOUR_TOKEN"
```

3. Run the downloader:

```bash
# Download latest 10 pages (500 reports)
python hackerone_public.py --max-pages 10

# Download all disclosed reports (0 = unlimited)
python hackerone_public.py --max-pages 0 --output hackerone_public_reports.json
```

---

## 📜 License & Responsible Disclosure

- **License:** Distributed under the [MIT License](LICENSE).
- **Responsible Disclosure & Ethics:** All disclosed vulnerability reports in this dataset are public data published by HackerOne under mutual agreement with respective security teams. This toolkit is intended solely for authorized security assessments, defensive hardening, and educational research. Always obtain explicit authorization before testing any third-party infrastructure.
