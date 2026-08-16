# BugBountyWorkflow Verification Checklist

**Version:** 1.1.0
**Purpose:** Verify BugBountyWorkflow skill is correctly installed and functional

---

## Pre-Flight Checks

### Core Components
- [ ] `${PAI_DIR}/skills/BugBountyWorkflow/SKILL.md` exists
- [ ] `${PAI_DIR}/history/research/` directory exists with subdirectories
- [ ] `${PAI_DIR}/config/secrets.json` contains Caido configuration
- [ ] Caido proxy is running (test: `curl http://localhost:8080/graphql`)

### Skill Dependencies
- [ ] ClientSideAttacks skill exists: `${PAI_DIR}/skills/ClientSideAttacks/`
- [ ] OAuthOIDC skill exists: `${PAI_DIR}/skills/OAuthOIDC/`
- [ ] ReactNextSecurity skill exists: `${PAI_DIR}/skills/ReactNextSecurity/`
- [ ] VulnChaining skill exists: `${PAI_DIR}/skills/VulnChaining/`
- [ ] PostMessageAttacks skill exists: `${PAI_DIR}/skills/PostMessageAttacks/`
- [ ] CSPT skill exists: `${PAI_DIR}/skills/CSPT/`
- [ ] JsAnalyzer skill exists: `${PAI_DIR}/skills/JsAnalyzer/`
- [ ] Ffuf skill exists: `${PAI_DIR}/skills/Ffuf/`

### Agent Dependencies
- [ ] BugBountyReporter agent exists: `${PAI_DIR}/agents/BugBountyReporter.md`
- [ ] VulnChainAnalyst agent exists: `${PAI_DIR}/agents/VulnChainAnalyst.md`
- [ ] Pentester agent exists: `${PAI_DIR}/agents/Pentester.md`
- [ ] OAuthExpert agent exists: `${PAI_DIR}/agents/OAuthExpert.md`

### External Tools
- [ ] subfinder installed: `command -v subfinder`
- [ ] amass installed: `command -v amass`
- [ ] httpx installed: `command -v httpx`
- [ ] ffuf installed: `command -v ffuf`
- [ ] jq installed: `command -v jq`
- [ ] curl installed: `command -v curl`

---

## Functional Tests

### Test 1: Skill Activation with Bug Bounty Keyword
```bash
# In Claude Code:
"I need help with bug bounty hunting"
```

**Expected:**
- ✅ BugBountyWorkflow skill activates
- ✅ Full skill context loaded
- ✅ Provides workflow overview
- ✅ No activation errors

**Status:** [ ] Pass [ ] Fail

---

### Test 2: Report Writing Activation
```bash
# In Claude Code:
"Write a vulnerability report for reflected XSS"
```

**Expected:**
- ✅ Report Writing section activates
- ✅ XSS report template loaded
- ✅ Requests necessary details (endpoint, payload, steps)
- ✅ Generates structured report with Summary, Steps, Impact, Remediation

**Status:** [ ] Pass [ ] Fail

---

### Test 3: CVSS Severity Assessment
```bash
# In Claude Code:
"What's the CVSS severity for an authenticated IDOR that exposes email addresses?"
```

**Expected:**
- ✅ Severity Assessment section loads
- ✅ Provides CVSS score breakdown
- ✅ Explains Attack Vector (Network), Privileges (Low), Impact (Low Confidentiality)
- ✅ Suggests severity: Medium (4.0-6.9)
- ✅ Mentions potential for chaining

**Status:** [ ] Pass [ ] Fail

---

### Test 4: Target Directory Creation
```bash
# Create new target structure
bash ${PAI_DIR}/scripts/new-target.sh test-target "https://hackerone.com/program"

# Verify structure
ls -R ${PAI_DIR}/history/research/targets/test-target/
```

**Expected structure:**
```
test-target/
├── README.md
├── recon/
├── vulns/
├── pocs/
└── reports/
```

**README.md should contain:**
- Target name
- Creation date
- Program URL
- Scope section (empty)
- Findings table
- Testing log

**Status:** [ ] Pass [ ] Fail

---

### Test 5: PoC Generation
```bash
# Generate PoC file
bash ${PAI_DIR}/scripts/gen-poc.sh "XSS" "example.com" "alert(document.domain)"

# Verify file exists
ls -la poc-*.html
```

**Expected:**
- ✅ HTML file created with timestamp
- ✅ Contains vulnerability type and target
- ✅ Includes payload in <pre> and <script>
- ✅ Has steps to reproduce
- ✅ Valid HTML structure

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Subdomain Enumeration
```bash
# Test subdomain enumeration on a safe target
# Using example.com (safe for testing)
subfinder -d example.com -silent -o test-subs.txt

# Verify output
cat test-subs.txt | head -5
```

**Expected:**
- ✅ Subdomain list generated
- ✅ At least 1 subdomain found
- ✅ Output format: one subdomain per line
- ✅ No errors

**Status:** [ ] Pass [ ] Fail

---

### Test 7: HTTP Probing
```bash
# Test httpx on known domain
echo "example.com" | httpx -silent -status-code -title

# Verify output
```

**Expected output format:**
```
https://example.com [200] [Example Domain]
```

**Status:** [ ] Pass [ ] Fail

---

### Test 8: Caido MCP Integration
```bash
# In Claude Code, query Caido:
"Show me recent requests to example.com in Caido proxy"

# Or use direct MCP call:
mcp__caido__list_by_httpql with query: 'req.host.eq:"example.com"'
```

**Expected:**
- ✅ Caido MCP responds without auth errors
- ✅ Returns request list (may be empty if no traffic)
- ✅ Shows request IDs and basic info
- ✅ No connection errors

**Status:** [ ] Pass [ ] Fail

---

### Test 9: Vulnerability Chaining Analysis
```bash
# In Claude Code:
"I found a self-XSS and an open redirect. Can these be chained to achieve stored XSS?"
```

**Expected:**
- ✅ VulnChaining skill activates
- ✅ Analyzes both vulnerabilities
- ✅ Identifies potential chain pattern
- ✅ Provides exploitation steps
- ✅ Upgrades severity assessment
- ✅ Suggests PoC approach

**Status:** [ ] Pass [ ] Fail

---

### Test 10: OAuth Flow Analysis
```bash
# In Claude Code:
"Analyze this OAuth authorization request for security issues:
https://idp.example.com/oauth/authorize?client_id=app&redirect_uri=https://app.example.com/callback&response_type=code"
```

**Expected:**
- ✅ OAuthOIDC skill activates
- ✅ Identifies OAuth flow type (Authorization Code)
- ✅ Checks redirect_uri validation
- ✅ Checks state parameter presence
- ✅ Suggests testing approach
- ✅ Provides attack patterns

**Status:** [ ] Pass [ ] Fail

---

## Workflow Tests

### Test 11: Complete Reconnaissance Workflow
```bash
# In Claude Code:
"Run reconnaissance on example.com"

# Should execute:
# 1. Subdomain enumeration
# 2. Live host detection
# 3. Technology fingerprinting
# 4. Content discovery preparation
```

**Expected:**
- ✅ Provides structured recon workflow
- ✅ Uses appropriate tools (subfinder, httpx)
- ✅ Creates output files
- ✅ Organizes results logically
- ✅ Suggests next steps

**Status:** [ ] Pass [ ] Fail

---

### Test 12: XSS Report Generation
```bash
# In Claude Code:
"Write a HackerOne report for reflected XSS in the search parameter at https://example.com/search?q=test"

# Provide payload when asked:
"<img src=x onerror=alert(document.domain)>"
```

**Expected report sections:**
- ✅ Summary (concise description)
- ✅ Steps to Reproduce (numbered list)
- ✅ Proof of Concept (payload + screenshot request)
- ✅ Impact (realistic assessment)
- ✅ Remediation (specific recommendations)
- ✅ References (CWE, OWASP links)
- ✅ HackerOne formatting

**Status:** [ ] Pass [ ] Fail

---

### Test 13: IDOR Report Generation
```bash
# In Claude Code:
"Write a Bugcrowd report for IDOR vulnerability allowing access to other users' profiles"

# Provide details:
"Endpoint: GET /api/users/{id}/profile
Authenticated as user 123, can access user 456's data"
```

**Expected report sections:**
- ✅ Vulnerability Title
- ✅ Description (IDOR explanation)
- ✅ Steps to Reproduce (with HTTP requests)
- ✅ Impact (PII exposure)
- ✅ Recommendations (authorization checks, UUIDs)
- ✅ Bugcrowd formatting

**Status:** [ ] Pass [ ] Fail

---

### Test 14: PoC Standards Compliance
```bash
# In Claude Code:
"Create a PoC for DOM XSS using location.hash"
```

**Expected PoC characteristics:**
- ✅ Self-contained HTML file
- ✅ Includes title and description
- ✅ Contains minimal payload
- ✅ Uses safe payload (alert/console.log)
- ✅ Has clear reproduction steps
- ✅ Documents environment
- ✅ Reproducible

**Status:** [ ] Pass [ ] Fail

---

### Test 15: Impact Escalation Analysis
```bash
# In Claude Code:
"I found an IDOR that exposes user emails. How can I escalate the impact?"
```

**Expected:**
- ✅ Analyzes current impact (Medium - info disclosure)
- ✅ Suggests chaining opportunities:
  - Password reset flow abuse
  - Account enumeration
  - Email-based attacks
- ✅ Provides escalation path
- ✅ Updates severity assessment
- ✅ Suggests testing approach

**Status:** [ ] Pass [ ] Fail

---

## Integration Tests

### Test 16: SecurityAudit Integration
```bash
# In Claude Code:
"Run security audit on example.com"

# Verify BugBountyWorkflow components activate:
# - Reconnaissance phase
# - JS analysis phase
# - Vulnerability testing
# - Report generation
```

**Expected:**
- ✅ BugBountyWorkflow methodology used
- ✅ Coordinates with JsAnalyzer skill
- ✅ Uses Caido for request analysis
- ✅ Generates structured findings
- ✅ Creates final report

**Status:** [ ] Pass [ ] Fail

---

### Test 17: Slash Command Integration
```bash
# Test workflow slash commands
/hunt example.com     # Should start hunting session
/recon example.com    # Should run reconnaissance
/report xss          # Should generate report
```

**Expected:**
- ✅ Commands recognized
- ✅ Activates appropriate workflow sections
- ✅ Coordinates with other skills
- ✅ Produces expected outputs

**Status:** [ ] Pass [ ] Fail

---

## Platform-Specific Tests

### Test 18: HackerOne Report Format
```bash
# In Claude Code:
"Write a HackerOne report template"
```

**Expected format:**
```markdown
## Summary:
## Steps To Reproduce:
## Supporting Material/References:
## Impact:
```

**Status:** [ ] Pass [ ] Fail

---

### Test 19: Bugcrowd Report Format
```bash
# In Claude Code:
"Write a Bugcrowd report template"
```

**Expected format:**
```markdown
**Vulnerability Title:**
**Description:**
**Steps to Reproduce:**
**Impact:**
**Recommendations:**
```

**Status:** [ ] Pass [ ] Fail

---

## Advanced Workflow Tests

### Test 20: Target Notes Organization
```bash
# Verify target notes template is applied correctly
cat ${PAI_DIR}/history/research/targets/test-target/README.md
```

**Expected sections:**
- ✅ Target name and program info
- ✅ Scope (in/out)
- ✅ Domains table with tech stack
- ✅ Attack surface map (auth, API, client-side)
- ✅ Vulnerabilities found log
- ✅ Testing log with dates

**Status:** [ ] Pass [ ] Fail

---

### Test 21: Disclosure Workflow
```bash
# In Claude Code:
"What's the responsible disclosure timeline for a critical vulnerability?"
```

**Expected:**
- ✅ Day 0: Report submitted
- ✅ Day 7: First follow-up
- ✅ Day 14: Second follow-up
- ✅ Day 30: Status update request
- ✅ Day 90: Standard disclosure
- ✅ Day 120: Extended deadline option
- ✅ Communication templates provided

**Status:** [ ] Pass [ ] Fail

---

### Test 22: JavaScript Analysis for Recon
```bash
# In Claude Code:
"Analyze JavaScript files for API endpoints and secrets on example.com"

# Should coordinate with JsAnalyzer skill
```

**Expected:**
- ✅ Activates JsAnalyzer skill
- ✅ Extracts API endpoints from JS
- ✅ Identifies potential secrets
- ✅ Maps client-side routes
- ✅ Provides exploitation guidance

**Status:** [ ] Pass [ ] Fail

---

### Test 23: HTTPQL Query Generation
```bash
# In Claude Code:
"Show me all API endpoints in Caido history"
```

**Expected:**
- ✅ Generates HTTPQL query: `req.path.cont:"/api/"`
- ✅ Executes query against Caido
- ✅ Returns results
- ✅ Suggests next steps for testing

**Status:** [ ] Pass [ ] Fail

---

### Test 24: Multi-Skill Coordination
```bash
# In Claude Code:
"I'm testing a React app with OAuth. Help me find vulnerabilities."

# Should activate multiple skills:
# - ReactNextSecurity for React-specific issues
# - OAuthOIDC for OAuth testing
# - ClientSideAttacks for client-side vulnerabilities
```

**Expected:**
- ✅ Identifies React app context
- ✅ Activates ReactNextSecurity skill
- ✅ Identifies OAuth context
- ✅ Activates OAuthOIDC skill
- ✅ Provides coordinated testing approach
- ✅ Suggests attack vectors for both

**Status:** [ ] Pass [ ] Fail

---

### Test 25: Finding Documentation in Caido
```bash
# In Claude Code:
"Document this XSS vulnerability in Caido:
Endpoint: https://example.com/search?q=<payload>
Severity: High"

# Should use Caido MCP to create finding
```

**Expected:**
- ✅ Uses create_findings_from_requests
- ✅ Includes full description
- ✅ Sets correct severity
- ✅ Links to request ID
- ✅ Confirms creation

**Status:** [ ] Pass [ ] Fail

---

## Performance Validation

### Test 26: Agent Delegation
```bash
# Verify workflow delegates to appropriate agents
# Check debug logs after running workflow
ls -lt ${PAI_DIR}/debug/*.txt | head -3

# Should show agent sessions for:
# - BugBountyReporter (report writing)
# - VulnChainAnalyst (chaining analysis)
```

**Expected:**
- ✅ Agents spawn for specialized tasks
- ✅ Agent sessions logged
- ✅ Results returned to primary context
- ✅ No agent spawn failures

**Status:** [ ] Pass [ ] Fail

---

### Test 27: Token Efficiency
```bash
# BugBountyWorkflow should delegate heavy tasks to agents
# Primary context should remain under token limits
# After running complex workflow, check token usage
```

**Expected:**
- ✅ Primary context uses < 50k tokens
- ✅ Report generation delegated to BugBountyReporter
- ✅ Complex analysis delegated to specialized agents
- ✅ No token limit errors

**Status:** [ ] Pass [ ] Fail

---

## Verification Summary

**Date:** _______________
**Verified By:** _______________

**Results:**

**Core Components:** [ ] Pass [ ] Fail
- Skill files exist
- Directory structure created
- Caido configured

**Dependencies:** [ ] Pass [ ] Fail
- Skills available: ___ / 8
- Agents available: ___ / 4
- External tools: ___ / 6

**Functional Tests (1-15):** ___ / 15 passed
**Integration Tests (16-17):** ___ / 2 passed
**Platform Tests (18-19):** ___ / 2 passed
**Advanced Workflow Tests (20-25):** ___ / 6 passed
**Performance Tests (26-27):** ___ / 2 passed

**Overall Status:** [ ] ✅ Verified [ ] ❌ Issues Found

---

## Troubleshooting Failed Tests

### If Test 1-2 (Skill Activation) fails:
**Check:**
- Skill description in SKILL.md frontmatter includes "USE WHEN" format
- Trigger phrases match description keywords
- SKILL.md is valid markdown

### If Test 4 (Target Directory) fails:
**Solution:**
```bash
# Verify script exists and is executable
ls -la ${PAI_DIR}/scripts/new-target.sh
chmod +x ${PAI_DIR}/scripts/new-target.sh

# Run with debug
bash -x ${PAI_DIR}/scripts/new-target.sh test-target
```

### If Test 6-7 (External Tools) fail:
**Solution:**
```bash
# Reinstall missing tools
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

# Verify PATH includes go/bin
export PATH="$HOME/go/bin:$PATH"
```

### If Test 8 (Caido Integration) fails:
**Solution:**
```bash
# Verify Caido is running
curl http://localhost:8080/graphql

# Check auth token in secrets.json
cat ${PAI_DIR}/config/secrets.json | jq '.caido'

# Test GraphQL query manually
curl -X POST http://localhost:8080/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ requests(first: 1) { edges { node { id } } } }"}'
```

### If Test 9-10 (Skill Coordination) fails:
**Check:**
- Required skills are installed (VulnChaining, OAuthOIDC)
- Skill descriptions have correct trigger phrases
- Skills activate with direct mentions

### If Tests 12-13 (Report Generation) fail:
**Check:**
- BugBountyReporter agent exists
- Agent file is valid markdown
- Report templates in SKILL.md are complete

### If Test 16 (SecurityAudit Integration) fails:
**Check:**
- SecurityAudit skill is installed
- SecurityAudit workflow references BugBountyWorkflow
- All dependencies available

### If Test 26-27 (Performance) fails:
**Solution:**
- Adjust agent models (use haiku for simpler tasks)
- Verify Task tool is available
- Check agent spawn logs in debug/

---

## Next Steps After Verification

1. **If All Tests Pass:**
   - ✅ BugBountyWorkflow is production-ready
   - ✅ Set up your first bug bounty target
   - ✅ Practice report writing
   - ✅ Learn vulnerability chaining techniques

2. **If Some Tests Fail:**
   - Review troubleshooting steps above
   - Check `${PAI_DIR}/debug/latest` for detailed errors
   - Verify all dependencies in INSTALL.md
   - Test each component individually

3. **Optimization:**
   - Customize report templates for your style
   - Add program-specific workflows
   - Configure wordlists for your targets
   - Integrate with your bug bounty platforms

---

## Real-World Validation

### Final Validation: Complete Bug Bounty Cycle
```bash
# Execute a full workflow on a test target:
# 1. Initialize target
bash ${PAI_DIR}/scripts/new-target.sh example-com "https://bugcrowd.com/example"

# 2. Run reconnaissance (in Claude Code)
"Run reconnaissance on example.com for bug bounty hunting"

# 3. Analyze a test vulnerability
"Write a report for IDOR in /api/users/{id}/profile endpoint"

# 4. Generate PoC
bash ${PAI_DIR}/scripts/gen-poc.sh "IDOR" "example.com" "GET /api/users/456/profile"

# 5. Document in Caido
"Create a finding in Caido for this IDOR with Medium severity"
```

**If all 5 steps complete successfully:**
- ✅ **BugBountyWorkflow is fully functional and production-ready**

---

**Verification Complete!**
BugBountyWorkflow skill is [ ] ready / [ ] needs fixes
