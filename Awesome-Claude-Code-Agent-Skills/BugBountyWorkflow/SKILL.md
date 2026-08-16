---
name: BugBountyWorkflow
version: 1.1.0
last_updated: 2025-12-11
author: xssdoctor
description: Bug bounty hunting workflow and report writing expertise. USE WHEN user mentions bug bounty, vulnerability report, HackerOne, Bugcrowd, PoC creation, severity assessment, CVSS scoring, responsible disclosure, or needs help writing security reports. Provides templates and workflow guidance.
agent: opus
hooks:
  - event: Stop
    script: hooks/bug-bounty-session-capture.ts
---

# Bug Bounty Workflow Skill

Complete workflow for bug bounty hunting, from reconnaissance to report submission.

## When to Activate

- "bug bounty" → Full skill context
- "write report" / "vulnerability report" → Report Writing section
- "HackerOne" / "Bugcrowd" → Platform-Specific section
- "PoC" / "proof of concept" → PoC Standards section
- "severity" / "CVSS" → Severity Assessment section
- "responsible disclosure" → Disclosure Workflow section
- "recon" / "reconnaissance" → Reconnaissance section

---

## Reconnaissance Workflow

### 1. Scope Analysis

```bash
# First: READ THE SCOPE CAREFULLY
# - What domains are in scope?
# - What's explicitly out of scope?
# - Any rate limiting requirements?
# - Specific vulnerability types excluded?
```

### 2. Apex and Subdomain Enumeration

Run the apexDiscovery skill to pull out other apexes for the main domain we find for the client.  Then do subdomain discovery for ALL of them:

```bash
# Passive enumeration
subfinder -d target.com -o subdomains.txt
amass enum -passive -d target.com >> subdomains.txt

# Certificate transparency
curl "https://crt.sh/?q=%.target.com&output=json" | jq -r '.[].name_value' | sort -u

# Combine and dedupe
cat subdomains.txt | sort -u > unique-subdomains.txt
```

### 3. Live Host Detection

```bash
# Check which subdomains are alive
cat unique-subdomains.txt | httpx -o alive.txt -status-code -title -tech-detect

# With ports
cat unique-subdomains.txt | httpx -ports 80,443,8080,8443 -o alive-with-ports.txt
```

### 4. Technology Fingerprinting

```bash
# Identify frameworks
httpx -l alive.txt -tech-detect -json -o tech.json

# Manual checks
# - Look for X-Powered-By headers
# - Check /_next/, /static/, /api/ paths for Next.js
# - Check /wp-content/ for WordPress
# - Check /rails/ patterns for Ruby on Rails
```

### 5. Content Discovery

```bash
# Directory fuzzing with ffuf (ALWAYS use -ac)
ffuf -w /path/to/wordlist.txt -u https://target.com/FUZZ -ac -o results.json

# API endpoint discovery
ffuf -w api-wordlist.txt -u https://api.target.com/v1/FUZZ -ac -mc 200,201,401,403

# Parameter discovery
arjun -u https://target.com/page -o params.json
```

### 6. JavaScript Analysis

```bash
# Extract JS files
cat alive.txt | getJS -complete -output js-files.txt

# Find endpoints in JS
cat js-files.txt | xargs -I@ sh -c 'curl -s @ | grep -oP "[\"\x27]/api/[^\"\x27]+"' | sort -u

# Look for secrets
cat js-files.txt | xargs -I@ sh -c 'curl -s @' | grep -iE "(api[_-]?key|secret|token|password|aws)"
```

---

## Target Notes Template

Save in `${PAI_DIR}/history/research/targets/[target-name]/`

```markdown
# Target: [Program Name]

## Program Info
- **Platform:** HackerOne / Bugcrowd / Private
- **Program URL:** [link]
- **Scope:** [domains/apps]
- **Out of Scope:** [exclusions]
- **Response Time:** [typical response SLA]

## Domains

### In Scope
| Domain | Tech Stack | Notes |
|--------|------------|-------|
| example.com | Next.js 14 | Main app |
| api.example.com | Node/Express | REST API |
| admin.example.com | React | Admin panel |

### Interesting Findings
- [finding 1]
- [finding 2]

## Attack Surface Map

### Authentication
- [ ] OAuth providers: [list]
- [ ] Session management: [cookie/JWT]
- [ ] MFA: [yes/no/type]

### API Endpoints
| Endpoint | Method | Auth Required | Notes |
|----------|--------|---------------|-------|
| /api/users | GET | Yes | User listing |
| /api/profile | POST | Yes | Profile update |

### Client-Side
- [ ] CSP: [present/policy]
- [ ] JS frameworks: [React/Vue/Angular]
- [ ] postMessage handlers: [yes/no]
- [ ] localStorage tokens: [yes/no]

## Vulnerabilities Found

### [Date] - [Vuln Type]
- **Status:** Reported / Triaged / Resolved
- **Severity:** Critical / High / Medium / Low
- **Report ID:** [H1-XXXX]
- **Bounty:** $XXX
- **Notes:** [brief description]

## Testing Log
- [date] - [what was tested]
- [date] - [what was tested]
```

---

## PoC Standards

### Minimal Reproducible PoC

Every PoC must be:
1. **Minimal** - Smallest payload that demonstrates the bug
2. **Reproducible** - Works consistently
3. **Self-contained** - Single HTML file or clear steps
4. **Safe** - alert(document.domain), not actual exploitation

### PoC File Template

```html
<!DOCTYPE html>
<html>
<head>
  <title>[Vuln Type] PoC - [Target]</title>
  <meta charset="UTF-8">
</head>
<body>
  <h1>[Vulnerability Type]</h1>
  <h2>Target: [target.com]</h2>

  <h3>Description</h3>
  <p>[Brief description of the vulnerability]</p>

  <h3>Impact</h3>
  <p>[What an attacker can achieve]</p>

  <h3>Proof of Concept</h3>

  <!-- PoC Code Here -->
  <script>
    // Exploit code
  </script>

  <h3>Steps to Reproduce</h3>
  <ol>
    <li>Host this file on attacker.com</li>
    <li>Visit as authenticated user on target.com</li>
    <li>Click the button / wait for execution</li>
    <li>Observe [result]</li>
  </ol>

  <h3>Environment</h3>
  <ul>
    <li>Browser: Chrome 120</li>
    <li>OS: macOS 14.0</li>
    <li>Target Version: [if applicable]</li>
  </ul>
</body>
</html>
```

### Video PoC Requirements

When to include video:
- Complex multi-step exploits
- Race conditions
- Time-sensitive issues
- UI-based vulnerabilities

Video should show:
1. Starting state (logged in as user X)
2. Attack execution
3. Result verification
4. Impact demonstration

---

## Severity Assessment

### CVSS 3.1 Quick Reference

**Attack Vector (AV)**
- Network (N): Remotely exploitable
- Adjacent (A): Same network segment
- Local (L): Local access required
- Physical (P): Physical access required

**Attack Complexity (AC)**
- Low (L): No special conditions
- High (H): Specific conditions required

**Privileges Required (PR)**
- None (N): No authentication
- Low (L): Basic user access
- High (H): Admin/privileged access

**User Interaction (UI)**
- None (N): No user action needed
- Required (R): User must perform action

**Impact (C/I/A)**
- High (H): Total compromise
- Low (L): Limited impact
- None (N): No impact

### Bug Bounty Severity Mapping

| Severity | CVSS | Typical Bounty | Examples |
|----------|------|----------------|----------|
| Critical | 9.0-10.0 | $10,000+ | RCE, Auth bypass, SQLi on critical data |
| High | 7.0-8.9 | $3,000-10,000 | Stored XSS admin, IDOR PII, Account takeover |
| Medium | 4.0-6.9 | $500-3,000 | Reflected XSS, CSRF, Info disclosure |
| Low | 0.1-3.9 | $100-500 | Self-XSS, Missing headers, Minor leaks |

### Impact Escalation

Always think: **Can this be chained?**

```
Reflected XSS (Medium)
  ↓ + OAuth token in URL
Account Takeover (Critical)

IDOR read user email (Medium)
  ↓ + Password reset uses email
Account Takeover (Critical)

Open Redirect (Low)
  ↓ + OAuth redirect_uri bypass
Token Theft (High)
```

---

## Report Writing

### Report Structure

```markdown
## Summary
[One paragraph: What, where, impact]

## Vulnerability Details
**Type:** [CWE-XX: Name]
**Endpoint:** [URL/function]
**Parameter:** [affected parameter]

## Steps to Reproduce
1. [Login as user X]
2. [Navigate to Y]
3. [Send request Z]
4. [Observe result]

## Proof of Concept
[Code/screenshot/video]

## Impact
[What can attacker do? Data access? Account takeover?]
[Business impact if applicable]

## Remediation
[Specific fix recommendation]

## References
- [CWE link]
- [OWASP link]
- [Related research]
```

### Writing Tips

**DO:**
- Be concise and technical
- Include exact URLs and payloads
- Provide reproducible steps
- Assess realistic impact
- Suggest specific fixes

**DON'T:**
- Exaggerate severity
- Include out-of-scope testing
- Chain hypothetical issues
- Write walls of text
- Be condescending

### Platform-Specific Formatting

**HackerOne:**
```markdown
## Summary:
## Steps To Reproduce:
## Supporting Material/References:
## Impact:
```

**Bugcrowd:**
```markdown
**Vulnerability Title:**
**Description:**
**Steps to Reproduce:**
**Impact:**
**Recommendations:**
```

---

## Report Templates

### XSS Report Template

```markdown
## Summary
A stored/reflected cross-site scripting vulnerability exists in [endpoint]
that allows an attacker to execute arbitrary JavaScript in the context of
victim users' browsers.

## Vulnerability Details
**Type:** CWE-79: Improper Neutralization of Input During Web Page Generation
**Endpoint:** https://target.com/vulnerable/endpoint
**Parameter:** `comment` (POST body)
**Context:** HTML attribute / JavaScript string / HTML body

## Steps to Reproduce
1. Navigate to https://target.com/page
2. Enter the following payload in the [field]:
   ```
   <img src=x onerror=alert(document.domain)>
   ```
3. Submit the form
4. Observe JavaScript execution

## Proof of Concept
[Screenshot showing alert(document.domain)]

**PoC Payload:**
```html
<img src=x onerror=alert(document.domain)>
```

## Impact
An attacker can:
- Steal session cookies and hijack user accounts
- Perform actions on behalf of authenticated users
- Redirect users to malicious websites
- Deface the application for targeted users

**Attack Scenario:**
1. Attacker crafts malicious link/content
2. Victim clicks link/views content while authenticated
3. Attacker's JavaScript executes in victim's session
4. Session token sent to attacker's server
5. Attacker gains full access to victim's account

## Remediation
1. Implement context-aware output encoding
2. Use Content-Security-Policy to restrict inline scripts
3. Set HttpOnly flag on session cookies
4. Consider using a framework's built-in XSS protections

## References
- https://owasp.org/www-community/attacks/xss/
- https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
```

### IDOR Report Template

```markdown
## Summary
An Insecure Direct Object Reference vulnerability in [endpoint] allows
authenticated users to access/modify resources belonging to other users
by manipulating the [parameter] parameter.

## Vulnerability Details
**Type:** CWE-639: Authorization Bypass Through User-Controlled Key
**Endpoint:** https://target.com/api/users/{id}/profile
**Parameter:** `id` (URL path)
**HTTP Method:** GET/POST/DELETE

## Steps to Reproduce
1. Login as User A (ID: 123)
2. Capture request to `/api/users/123/profile`
3. Modify user ID to 456 (User B)
4. Observe access to User B's profile data

**Original Request:**
```http
GET /api/users/123/profile HTTP/1.1
Host: target.com
Authorization: Bearer [User_A_Token]
```

**Modified Request:**
```http
GET /api/users/456/profile HTTP/1.1
Host: target.com
Authorization: Bearer [User_A_Token]
```

## Proof of Concept
[Screenshot showing User B's data returned with User A's token]

## Impact
An attacker can:
- Access personal information of any user
- Modify other users' account settings
- Delete other users' data
- Enumerate all user accounts

**Data Exposed:**
- Full name
- Email address
- Phone number
- [Other PII]

## Remediation
1. Implement proper authorization checks on every request
2. Use indirect references (UUIDs) instead of sequential IDs
3. Verify the authenticated user owns the requested resource
4. Implement rate limiting to prevent enumeration

## References
- https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References
```

### OAuth Report Template

```markdown
## Summary
A vulnerability in the OAuth implementation allows attackers to [steal tokens /
bypass authentication / link accounts] due to [missing validation / weak checks].

## Vulnerability Details
**Type:** CWE-287: Improper Authentication
**OAuth Flow:** Authorization Code / Implicit / Device
**Vulnerable Parameter:** redirect_uri / state / code

## OAuth Flow Analysis
```
1. Client → AS: /authorize?client_id=X&redirect_uri=VULNERABLE&state=Y
2. User authenticates
3. AS → Client: redirect_uri?code=ABC&state=Y  ← Attack point
4. Client → AS: /token (code exchange)
```

## Steps to Reproduce
1. Initiate OAuth flow with manipulated redirect_uri:
   ```
   https://idp.target.com/oauth/authorize?
     client_id=legitimate_client&
     redirect_uri=https://attacker.com&
     response_type=code&
     state=random
   ```
2. Complete authentication as victim
3. Observe authorization code sent to attacker.com

## Proof of Concept
**Attacker's Server Logs:**
```
[timestamp] GET /?code=ABC123&state=random HTTP/1.1
```

[Screenshot of code/token received at attacker domain]

## Impact
An attacker can:
- Steal OAuth authorization codes
- Exchange codes for access tokens
- Access victim's account on the target application
- Perform actions as the victim

**Attack Scenario:**
1. Attacker sends victim malicious OAuth link
2. Victim authenticates (may be automatic if already logged in)
3. Authorization code redirected to attacker
4. Attacker exchanges code for access token
5. Full account access achieved

## Remediation
1. Implement strict redirect_uri validation (exact match)
2. Use state parameter with cryptographic binding
3. Implement PKCE for public clients
4. Validate code was issued for the requesting client

## References
- https://oauth.net/2/
- https://datatracker.ietf.org/doc/html/rfc6819
- https://portswigger.net/web-security/oauth
```

---

## Workflow Automation

### New Target Setup

```bash
#!/bin/bash
# new-target.sh [target-name]

TARGET=$1
BASE="${PAI_DIR}/history/research/targets"

mkdir -p "$BASE/$TARGET"/{recon,vulns,pocs,reports}

cat > "$BASE/$TARGET/README.md" << EOF
# Target: $TARGET
Created: $(date +%Y-%m-%d)

## Scope
[Add scope here]

## Findings
| Date | Type | Severity | Status |
|------|------|----------|--------|

## Notes

EOF

echo "Created target directory: $BASE/$TARGET"
```

### Quick PoC Generator

```bash
#!/bin/bash
# gen-poc.sh [vuln-type] [target] [payload]

VULN_TYPE=$1
TARGET=$2
PAYLOAD=$3

cat > poc.html << EOF
<!DOCTYPE html>
<html>
<head><title>$VULN_TYPE PoC - $TARGET</title></head>
<body>
<h1>$VULN_TYPE Proof of Concept</h1>
<h2>Target: $TARGET</h2>
<pre>$PAYLOAD</pre>
<script>
$PAYLOAD
</script>
</body>
</html>
EOF

echo "Generated poc.html"
```

---

## Disclosure Workflow

### Timeline

```
Day 0:   Report submitted
Day 7:   Follow up if no response
Day 14:  Second follow up
Day 30:  Request status update
Day 90:  Standard disclosure deadline
Day 120: Extended deadline (if vendor responsive)
```

### Communication Templates

**Follow-up (No Response):**
```
Hi,

I submitted report #XXXX on [date] regarding [brief description].
I haven't received confirmation of receipt yet.

Could you please confirm this report is being reviewed?

Thanks,
xssdoctor
```

**Disclosure Notice:**
```
Hi,

Report #XXXX was submitted on [date] and triaged on [date].
Per standard disclosure timelines, I intend to publish details
on [date + 90 days].

Please let me know if you need additional time or have questions.

Thanks,
xssdoctor
```

---

## Quick Commands

```bash
# Save finding
alias savefinding='cp -r . ${PAI_DIR}/history/research/findings/$(date +%Y-%m-%d)_'

# Quick PoC server
alias pocserver='python3 -m http.server 8080'

# Generate report ID
alias reportid='echo "$(date +%Y%m%d)-$(openssl rand -hex 4)"'

# Check target scope
alias scope='cat ${PAI_DIR}/history/research/targets/*/README.md | grep -A10 "## Scope"'
```

---

## Caido MCP Integration

**Caido is always running during bug bounty sessions. Use Caido MCP tools proactively.**

### Workflow Integration Points

| Workflow Stage | Caido Tools | Usage |
|----------------|-------------|-------|
| **Recon** | `list_by_httpql` | Query discovered endpoints: `req.host.cont:"target.com"` |
| **Testing** | `send_to_replay` | Send interesting requests for modification |
| **Exploitation** | `start_replay_task` | Replay modified requests with payloads |
| **Documentation** | `create_findings_from_requests` | Log vulnerabilities with severity |
| **Scope** | `create_scope` | Define target scope with allowlist/denylist |

### HTTPQL Quick Reference for Bug Bounty

```bash
# Find all API endpoints
req.path.cont:"/api/"

# Find requests with specific parameters
req.raw.cont:"password" OR req.raw.cont:"token"

# Find authentication endpoints
req.path.cont:"/login" OR req.path.cont:"/auth" OR req.path.cont:"/oauth"

# Find file upload endpoints
req.raw.cont:"multipart/form-data"

# Filter by response code (interesting responses)
resp.code.eq:403 OR resp.code.eq:401 OR resp.code.eq:500

# Recent requests only
req.created_at.gt:"2024-01-01T00:00:00Z"
```

### Finding Documentation Workflow

When you discover a vulnerability:

1. **Identify the vulnerable request** in Caido history
2. **Send to replay** for PoC refinement
3. **Create finding** with proper severity:

```
mcp__caido__create_findings_from_requests:
  - title: "[Vuln Type] in [Endpoint]"
  - description: Full technical description
  - severity: critical/high/medium/low
  - request_id: ID from Caido history
```

### Scope Management

Before testing, set up scope:

```
mcp__caido__create_scope:
  - name: "Target Program Name"
  - allowlist: ["*.target.com", "api.target.com"]
  - denylist: ["*.third-party.com"]
```

**If Caido MCP tools fail with auth errors, ask xssdoctor for the current auth token.**

---

**This skill provides bug bounty workflow automation for xssdoctor. All testing must be authorized within program scope.**

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| **ClientSideAttacks** | XSS, prototype pollution, DOM attacks |
| **OAuthOIDC** | OAuth/OIDC flow testing |
| **ReactNextSecurity** | React/Next.js targets |
| **VulnChaining** | Escalate low-severity bugs |
| **PostMessageAttacks** | Cross-window attack vectors |
| **CSPT** | Client-side path traversal |

**Workflow Quick Commands:**
- `/hunt [target]` - Start hunting session
- `/recon [target]` - Run reconnaissance
- `/chain [bugs]` - Analyze chaining opportunities
- `/caido [query]` - Query proxy history
- `/xss-test [context]` - Generate XSS payloads
- `/report [vuln]` - Generate bug bounty report

**Severity Escalation Path:**
1. Find low-severity bug (Self-XSS, CSPT, info disclosure)
2. Identify chain components (VulnChaining)
3. Build full chain to high/critical impact
4. Document with full PoC
5. Report via `/report`
