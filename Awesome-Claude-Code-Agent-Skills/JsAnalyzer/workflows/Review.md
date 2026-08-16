# Review Workflow

**Purpose:** Spawn parallel subagents to perform deep analysis on findings from Analyze workflow. Subagents trace source→sink flows and investigate API endpoints.

---

## Prerequisites

- Analyze workflow has been completed
- Results exist in `./js-analysis/` directory
- Files exist:
  - `frontend/client-paths.md`
  - `frontend/frontend-architecture.md`
  - `frontend/sources-sinks.md`
  - `backend/api-paths.md`
  - `backend/api-architecture.md`
  - `backend/secrets.md`

---

## Execution Steps

### Step 1: Load Analysis Results

**Read all findings files:**

```bash
cat ./js-analysis/frontend/client-paths.md
cat ./js-analysis/frontend/frontend-architecture.md
cat ./js-analysis/frontend/sources-sinks.md
cat ./js-analysis/backend/api-paths.md
cat ./js-analysis/backend/api-architecture.md
cat ./js-analysis/backend/secrets.md
cat ./js-analysis/raw/combined-tool-results.json
```

**Parse into structured data for agent distribution.**

---

## PHASE 4: Spawn Parallel Subagents

**CRITICAL: Launch ALL agents in a SINGLE message with multiple Task tool calls.**

### Step 2: Source→Sink Analysis Agents

**For each potential source→sink flow identified, spawn an agent:**

```
Task tool call #1:
  subagent_type: "source-sink-tracer"
  model: "sonnet"
  prompt: |
    ## Source→Sink Flow Analysis

    **Source:** location.hash (router.js:23)
    **Sink:** innerHTML (render.js:45)

    ### Your Task
    1. Read both files to understand the code context
    2. Trace the data flow from source to sink
    3. Determine if user input reaches the sink unsanitized
    4. Identify any sanitization/encoding in between
    5. Assess exploitability (can we inject arbitrary HTML/JS?)

    ### Files to Analyze
    - [SOURCE_FILE]
    - [SINK_FILE]
    - Any intermediate files in the flow

    ### Output Format
    Return your analysis in this structure:

    ## Flow: [SOURCE] → [SINK]

    ### Verdict: [EXPLOITABLE / NOT EXPLOITABLE / NEEDS MANUAL TESTING]

    ### Data Flow
    1. User input enters at: [location]
    2. Passes through: [functions/transformations]
    3. Reaches sink at: [location]

    ### Sanitization Present
    - [ ] HTML encoding
    - [ ] URL encoding
    - [ ] DOMPurify/sanitizer
    - [ ] None found

    ### Exploitation Notes
    [If exploitable, describe how. If not, explain why.]

    ### Recommended PoC
    [Payload to test]
```

**Spawn one agent per source→sink pair. Use model: "sonnet" for these.**

---

### Step 3: API Endpoint Analysis Agents

**For each API endpoint discovered, spawn an agent:**

```
Task tool call #2:
  subagent_type: "api-investigator"
  model: "haiku"  # Faster for enumeration tasks
  prompt: |
    ## API Endpoint Analysis

    **Endpoint:** POST /api/users
    **Found in:** api.js:34

    ### Your Task
    1. Read the file where this endpoint is called
    2. Find ALL places this endpoint is used
    3. Document request structure (headers, body, params)
    4. Identify what authentication is used
    5. Note any interesting parameters for testing

    ### Output Format
    Return your analysis in this structure:

    ## Endpoint: [METHOD] [PATH]

    ### Request Structure
    - **Method:** POST
    - **Headers:**
      - Authorization: Bearer [token]
      - Content-Type: application/json
    - **Body:**
      ```json
      {
        "userId": "...",
        "data": "..."
      }
      ```

    ### Authentication
    - Type: [JWT / Cookie / API Key / None]
    - Required: [Yes / No / Sometimes]

    ### Parameters of Interest
    | Param | Type | Notes |
    |-------|------|-------|
    | userId | string | Potential IDOR |
    | role | string | Potential privilege escalation |

    ### Testing Recommendations
    1. [Specific test to run]
    2. [Specific test to run]
```

**Spawn one agent per unique endpoint. Use model: "haiku" for speed.**

---

### Step 4: PostMessage Handler Analysis (if any)

**For each postMessage handler found:**

```
Task tool call #3:
  subagent_type: "postmessage-analyzer"
  model: "sonnet"
  prompt: |
    ## PostMessage Handler Analysis

    **Handler Location:** iframe.js:67

    ### Your Task
    1. Read the handler code completely
    2. Check for origin validation
    3. Identify what actions the handler performs
    4. Trace where event.data flows
    5. Assess cross-origin exploitability

    ### Output Format
    Return your analysis in this structure:

    ## PostMessage Handler: [FILE:LINE]

    ### Origin Validation
    - [ ] Checks event.origin
    - [ ] Origin allowlist: [list if present]
    - [ ] No validation (vulnerable)

    ### Handler Actions
    [What does this handler do when it receives a message?]

    ### Data Flow
    event.data → [where does it go?]

    ### Exploitability
    **Verdict:** [EXPLOITABLE / PARTIAL / NOT EXPLOITABLE]

    **Attack Scenario:**
    [How an attacker could abuse this]

    ### PoC Template
    ```html
    <iframe src="[TARGET]"></iframe>
    <script>
      document.querySelector('iframe').contentWindow.postMessage(
        [PAYLOAD],
        '*'
      );
    </script>
    ```
```

---

### Step 5: Secrets Analysis Agent

**If secrets were found, spawn one agent to analyze all of them:**

```
Task tool call #4:
  subagent_type: "secrets-analyzer"
  model: "haiku"
  prompt: |
    ## Secrets Analysis

    **Secrets Found:**
    1. JWT token in config.js:12
    2. API key in api.js:34

    ### Your Task
    For each secret:
    1. Identify the type (JWT, API key, AWS, etc.)
    2. Check if it's still valid/active
    3. Determine scope/permissions if possible
    4. Assess impact if leaked

    ### Output Format
    Return your analysis for each secret in this structure:

    ## Secret #1: [TYPE]

    **Location:** [FILE:LINE]
    **Value (truncated):** [first 10 chars...]

    ### Analysis
    - **Type:** JWT / API Key / AWS / etc.
    - **Format valid:** Yes/No
    - **Appears active:** Unknown/Yes/No

    ### JWT Decode (if applicable)
    ```json
    {
      "header": {...},
      "payload": {...}
    }
    ```

    ### Risk Assessment
    - **Severity:** [Critical/High/Medium/Low]
    - **Impact:** [What could attacker do with this?]

    ### Recommended Action
    [What should be done about this secret]
```

---

## PHASE 5: Collect & Synthesize Results

### Step 6: Wait for All Agents

**Use TaskOutput to collect results from all spawned agents.**

---

### Step 7: Generate Analysis Files

**Create `./js-analysis/frontend/frontend-analysis.md`:**

```markdown
# Frontend Deep Analysis

**Target:** [TARGET_NAME]
**Analyzed:** [DATE]

---

## Source→Sink Analysis Results

### Confirmed Exploitable Flows

#### Flow 1: location.hash → innerHTML

**Files Involved:**
- Source: router.js:45
- Sink: render.js:102

**Data Flow:**
1. User-controlled input enters via `window.location.hash`
2. Extracted with `hash.substring(1)` and split on `/`
3. Passed to `renderView(viewName)` function
4. Rendered directly into DOM via `el.innerHTML = template`

**Sanitization:** None found

**Exploitability:** ✅ EXPLOITABLE

**Proof of Concept:**
```
https://target.com/app#/<img src=x onerror=alert(document.domain)>
```

**Impact:** DOM XSS leading to account takeover via session token theft

---

#### Flow 2: [NEXT FLOW]

[Agent findings for each confirmed exploitable flow...]

---

### Not Exploitable (Sanitized)

| Source | Sink | File | Reason |
|--------|------|------|--------|
| location.search | innerHTML | search.js:34 | DOMPurify.sanitize() applied |
| localStorage.getItem | .html() | storage.js:12 | HTML entity encoding |

---

### Needs Manual Testing

| Source | Sink | File | Why Manual |
|--------|------|------|------------|
| postMessage event.data | eval | worker.js:89 | Complex multi-step flow |
| window.name | document.write | legacy.js:45 | Conditional sanitization |

---

## PostMessage Handlers Analysis

### Vulnerable Handlers

#### Handler: iframe-handler.js:67

**Origin Validation:** ❌ None

**Handler Code:**
```javascript
window.addEventListener('message', function(event) {
  var action = event.data.action;
  var params = event.data.params;

  if (action === 'navigate') {
    window.location = params.url; // ⚠️ Open redirect
  }
});
```

**Exploitability:** ✅ EXPLOITABLE

**Attack Scenario:**
1. Attacker hosts malicious page with iframe embedding target
2. Sends postMessage with `{action: 'navigate', params: {url: 'https://evil.com'}}`
3. Victim redirected to phishing page

**PoC:**
```html
<iframe id="target" src="https://target.com/page-with-handler"></iframe>
<script>
  document.getElementById('target').contentWindow.postMessage({
    action: 'navigate',
    params: { url: 'https://attacker.com/phish' }
  }, '*');
</script>
```

---

### Safe Handlers

| File | Line | Why Safe |
|------|------|----------|
| secure-handler.js | 23 | Strict origin check: `event.origin === 'https://trusted.com'` |
| api-handler.js | 45 | Allowlist validation + sanitization |

---

## Frontend Summary

**Total Flows Analyzed:** [X]
**Confirmed Exploitable:** [Y]
**Not Exploitable:** [Z]
**Needs Manual Testing:** [A]

**PostMessage Handlers:**
- Vulnerable: [B]
- Safe: [C]

---

## Prioritized Testing Checklist

### Critical (Test Immediately)
- [ ] DOM XSS via location.hash in router.js:45 → render.js:102
- [ ] PostMessage open redirect in iframe-handler.js:67
- [ ] [Additional critical findings...]

### High Priority
- [ ] [High severity findings...]

### Medium Priority
- [ ] [Medium severity findings...]

### Manual Testing Required
- [ ] Complex flow: postMessage → eval (worker.js:89)
- [ ] [Other manual test items...]
```

---

**Create `./js-analysis/frontend/frontend-vulnerabilities.md`:**

```markdown
# Frontend Vulnerabilities Summary

**Target:** [TARGET_NAME]
**Date:** [DATE]

---

## Executive Summary

Found **X** confirmed vulnerabilities in the frontend codebase:
- **Critical:** [count] - DOM XSS, account takeover vectors
- **High:** [count] - PostMessage abuse, open redirects
- **Medium:** [count] - Information disclosure, CSRF

---

## Critical Vulnerabilities

### VULN-001: DOM XSS via location.hash

**Severity:** 🔴 Critical

**Location:** router.js:45 → render.js:102

**Description:**
User-controlled input from `window.location.hash` flows directly into `innerHTML` without sanitization, allowing arbitrary JavaScript execution.

**Proof of Concept:**
```
https://target.com/app#/<img src=x onerror=alert(document.domain)>
```

**Impact:**
- Session token theft → Account takeover
- Keylogging
- Defacement
- Phishing

**Recommendation:**
1. Use `textContent` instead of `innerHTML` for untrusted data
2. If HTML rendering required, use DOMPurify.sanitize()
3. Implement Content Security Policy (CSP)

**CVSS:** 9.6 (Critical)

---

### VULN-002: [NEXT CRITICAL VULN]

[Continue with all critical vulnerabilities...]

---

## High Severity Vulnerabilities

### VULN-005: PostMessage Handler Missing Origin Validation

**Severity:** 🟠 High

**Location:** iframe-handler.js:67

[Full details...]

---

## Medium Severity Vulnerabilities

[List medium severity findings...]

---

## Vulnerability Statistics

| Severity | Count | Confirmed | Needs Testing |
|----------|-------|-----------|---------------|
| Critical | X | Y | Z |
| High | A | B | C |
| Medium | D | E | F |
| **Total** | **G** | **H** | **I** |

---

## Attack Chain Opportunities

### Chain 1: XSS → Session Theft → IDOR Escalation

**Steps:**
1. Exploit DOM XSS (VULN-001)
2. Steal session token from localStorage
3. Use stolen token with IDOR endpoint (VULN-008)
4. Access other users' data

**Impact:** Mass account takeover

---

## Next Steps

1. Manually test all "Needs Manual Testing" items
2. Confirm PoCs in live environment
3. Check for similar patterns in other files
4. Use `/chain` skill to develop full attack chains
5. Generate bug bounty reports with `/report` skill
```

---

**Create `./js-analysis/backend/api-analysis.md`:**

```markdown
# API Endpoints Deep Analysis

**Target:** [TARGET_NAME]
**Analyzed:** [DATE]

---

## High-Value Endpoints

### Endpoint: POST /api/v2/set_pw/{user_id}

**Request Structure:**
- **Method:** POST
- **Path:** `/api/v2/set_pw/{user_id}`
- **Headers:**
  - `Authorization: Bearer [JWT token]`
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "password": "newPassword123",
    "confirm": "newPassword123"
  }
  ```

**Authentication:**
- Type: JWT (Bearer token)
- Required: Yes
- Validated: Unknown (requires testing)

**Parameters of Interest:**

| Parameter | Location | Type | Security Concern |
|-----------|----------|------|------------------|
| user_id | Path | String | ⚠️ Potential IDOR - can we change other users' passwords? |
| password | Body | String | Password complexity requirements? |

**Testing Recommendations:**
1. **IDOR Test:** Try changing another user's password
   - Get valid user_id from different endpoint
   - Use own JWT with victim's user_id
   - Check if password changes
2. **Authorization Test:** Remove JWT, try with expired JWT
3. **Password Policy:** Test weak passwords, SQL injection in password field

**Exploitability:** 🔴 HIGH (if IDOR exists, critical account takeover)

---

### Endpoint: GET /api/v2/thealth/{user_id}

**Request Structure:**
- **Method:** GET
- **Path:** `/api/v2/thealth/{user_id}`
- **Headers:**
  - `Authorization: Bearer [JWT token]`

**Authentication:**
- Type: JWT (Bearer token)
- Required: Yes

**Parameters of Interest:**

| Parameter | Location | Type | Security Concern |
|-----------|----------|------|------------------|
| user_id | Path | String | ⚠️ IDOR - access other users' health data |

**Testing Recommendations:**
1. **IDOR Test:** Access other users' training health data
2. **Enumeration:** Iterate user_id values to map all users
3. **Authorization:** Test with invalid/missing JWT

**Exploitability:** 🟠 MEDIUM-HIGH (information disclosure, privacy violation)

---

### Endpoint: POST /api/v2/thealth/{user_id}/purch

**Request Structure:**
- **Method:** POST
- **Path:** `/api/v2/thealth/{user_id}/purch`
- **Body:**
  ```json
  {
    "product_id": "...",
    "payment_method": "..."
  }
  ```

**Parameters of Interest:**

| Parameter | Location | Type | Security Concern |
|-----------|----------|------|------------------|
| user_id | Path | String | ⚠️ Can we purchase on behalf of other users? |
| product_id | Body | String | Price manipulation? Negative values? |
| payment_method | Body | String | Can we specify victim's payment method? |

**Testing Recommendations:**
1. **IDOR Purchase:** Try purchasing with victim's user_id
2. **Price Manipulation:** Modify product_id to invalid/manipulated values
3. **CSRF:** Check if endpoint validates CSRF token

**Exploitability:** 🔴 CRITICAL (unauthorized purchases, financial loss)

---

## All Endpoints Summary

| Method | Path | Auth | Risk | Primary Concern |
|--------|------|------|------|-----------------|
| POST | /api/v2/sso | None | Medium | CSRF, account linking |
| POST | /api/v2/idplogin | None | Medium | Brute force, enumeration |
| POST | /api/v2/set_pw/{user_id} | JWT | Critical | IDOR password change |
| GET | /api/v2/checkpw | ? | Low | Password enumeration |
| GET | /api/v2/thealth/{user_id} | JWT | High | IDOR info disclosure |
| POST | /api/v2/thealth/{user_id}/purch | JWT | Critical | IDOR unauthorized purchase |
| POST | /api/v2/usr/{user_id}/groups/join/adm | JWT | Critical | Privilege escalation |
| POST | /api/v2/acct/upgrade | JWT | High | Price manipulation |
| POST | /api/v2/acct/unsubscribe | JWT | Medium | IDOR unsubscribe others |

---

## Authentication & Authorization Analysis

### Authentication Mechanisms

**JWT Bearer Tokens:**
- Used for most authenticated endpoints
- Token stored in: [localStorage / cookie / sessionStorage]
- Token expiration: Unknown (test with expired tokens)
- Refresh mechanism: Unknown

**Potential Issues:**
- [ ] JWT stored in localStorage (XSS → token theft)
- [ ] No token rotation on password change
- [ ] Predictable token generation
- [ ] No device binding

### Authorization Patterns

**User-Context Pattern:**
```
/api/v2/{resource}/{user_id}/{action}
```

**Security Concern:** All endpoints use `user_id` in path, relying on backend validation
- If validation missing → IDOR vulnerabilities
- If validation weak → Privilege escalation

**Recommended Tests:**
1. Change user_id to different values (sequential, random)
2. Use admin user_id with regular user JWT
3. Use negative/zero/null user_id values

---

## API Security Issues Found

### Issue 1: Pervasive IDOR Risk

**Endpoints Affected:** 15+ endpoints

**Pattern:** `/api/v2/{resource}/{user_id}/...`

**Issue:** Every endpoint trusts client-supplied user_id without apparent validation

**Testing Priority:** 🔴 CRITICAL

**Recommended Test:**
1. Get own user_id from profile endpoint
2. Register second test account
3. Use Account A JWT with Account B user_id
4. Check if data access/modification succeeds

---

### Issue 2: No Rate Limiting

**Endpoints Affected:** `/api/v2/idplogin`, `/api/v2/checkpw`

**Issue:** No apparent rate limiting on authentication endpoints

**Attack Scenario:** Brute force password guessing

**Testing Priority:** 🟠 HIGH

---

### Issue 3: CSRF Protection Unknown

**Endpoints Affected:** All POST endpoints

**Issue:** No visible CSRF token validation

**Testing Priority:** 🟠 HIGH

---

## Prioritized API Testing Checklist

### Critical (Test First)
- [ ] IDOR on `/api/v2/set_pw/{user_id}` - Password change
- [ ] IDOR on `/api/v2/thealth/{user_id}/purch` - Unauthorized purchases
- [ ] Privilege escalation on `/api/v2/usr/{user_id}/groups/join/adm`
- [ ] Price manipulation on `/api/v2/acct/upgrade`

### High Priority
- [ ] IDOR on `/api/v2/thealth/{user_id}` - Information disclosure
- [ ] IDOR enumeration - Map all users
- [ ] CSRF on all state-changing endpoints
- [ ] Rate limiting on auth endpoints

### Medium Priority
- [ ] JWT expiration testing
- [ ] Token rotation on password change
- [ ] SQL injection in all parameters
- [ ] XXE in API requests (if XML accepted)
```

---

### Step 8: Update scan-summary.md

**Append to existing `./js-analysis/scan-summary.md`:**

```markdown

---

## Deep Analysis Complete

**Subagents Spawned:** [X]
- Source→Sink tracers: [Y]
- API investigators: [Z]
- PostMessage analyzers: [A]
- Secrets analyzers: [B]

**Files Generated:**
- ✅ `frontend/frontend-analysis.md` - Detailed subagent findings
- ✅ `frontend/frontend-vulnerabilities.md` - Vulnerability summary
- ✅ `backend/api-analysis.md` - API endpoint analysis

## Vulnerability Summary

| Severity | Count |
|----------|-------|
| Critical | [X] |
| High | [Y] |
| Medium | [Z] |
| Total | [A] |

## Next Steps

To continue testing:
1. Review `frontend/frontend-vulnerabilities.md` for prioritized findings
2. Review `backend/api-analysis.md` for API test checklist
3. Use `/chain` skill to develop attack chains
4. Run `/audit` for live browser testing
5. Use `/report` to generate bug bounty reports
```

---

## Output

**Returns to user:**

```
✅ Deep analysis complete

🔍 Subagents Spawned: [X total]
  - Source→Sink tracers: [Y]
  - API investigators: [Z]
  - PostMessage analyzers: [A]
  - Secrets analyzers: [B]

📁 Analysis Files Created:
  - frontend/frontend-analysis.md - Detailed flow analysis
  - frontend/frontend-vulnerabilities.md - Vulnerability summary
  - backend/api-analysis.md - API testing guide

🔴 Critical Findings: [X]
🟠 High Findings: [Y]
✅ Confirmed Exploitable: [Z]

⚠️ Priority Issues:
  - [Critical finding 1]
  - [Critical finding 2]

💡 Next Steps:
  - Review testing checklists in analysis files
  - Run "/chain" to develop attack chains
  - Use "/report" for bug bounty submissions

All output in: ./js-analysis/
```

---

## Agent Configuration Reference

Uses specialized agents from `${PAI_DIR}/agents/`:

| Analysis Type | Agent Type | Model | Why |
|---------------|------------|-------|-----|
| Source→Sink tracing | `source-sink-tracer` | sonnet | Needs reasoning |
| API enumeration | `api-investigator` | haiku | Fast enumeration |
| PostMessage analysis | `postmessage-analyzer` | sonnet | Needs reasoning |
| Secrets analysis | `secrets-analyzer` | haiku | Fast analysis |

**Agent Definitions:**
- `agents/SourceSinkTracer.md` - Traces data flow, checks sanitization
- `agents/ApiInvestigator.md` - Documents endpoints, finds IDOR/injection points
- `agents/PostMessageAnalyzer.md` - Checks origin validation, builds PoCs
- `agents/SecretsAnalyzer.md` - Classifies secrets, assesses risk

**Always launch agents in parallel in a single message with multiple Task tool calls.**
