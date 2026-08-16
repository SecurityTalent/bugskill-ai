# BugBountyWorkflow Installation Guide

**Version:** 1.1.0
**Type:** Skill (Workflow Orchestrator)
**Dependencies:** Multiple security skills, Caido MCP, external tools

---

## Overview

BugBountyWorkflow is a comprehensive bug bounty hunting workflow skill that orchestrates reconnaissance, testing, exploitation, and report writing. It integrates with multiple specialized security skills and coordinates the full vulnerability research lifecycle.

---

## Prerequisites

### 1. Core Requirements
- ✅ PAI Core installed
- ✅ Hook system functional
- ✅ History system configured (`${PAI_DIR}/history/research/`)
- ✅ Caido proxy running with MCP integration

### 2. Skill Dependencies
This skill coordinates and invokes other specialized skills:
- **ClientSideAttacks** - XSS, DOM-based vulnerabilities, prototype pollution
- **OAuthOIDC** - OAuth/OIDC flow testing and exploitation
- **ReactNextSecurity** - React/Next.js specific vulnerabilities
- **VulnChaining** - Escalating low-severity bugs to critical impact
- **PostMessageAttacks** - Cross-window messaging vulnerabilities
- **CSPT** - Client-side path traversal exploitation
- **JsAnalyzer** - JavaScript static analysis for reconnaissance
- **Ffuf** - Web fuzzing guidance for content discovery

**Installation:** These skills should already be in `${PAI_DIR}/skills/`

### 3. Agent Dependencies
The workflow uses specialized agents for different tasks:
- `BugBountyReporter` - Professional report writing
- `VulnChainAnalyst` - Identifying escalation paths
- `Pentester` - General offensive security testing
- `OAuthExpert` - OAuth/OIDC exploitation
- Subdomain agents: `SubdomainOrchestrator`, `SubdomainPassive`, `SubdomainBrute`, `SubdomainPermutation`, `SubdomainProber`

**Installation:** These agents are in `${PAI_DIR}/agents/` and are auto-loaded

### 4. External Tool Requirements
The workflow requires these command-line tools for full functionality:

**Required (Core Workflow):**
- `subfinder` - Subdomain enumeration
- `amass` - Asset discovery
- `httpx` - HTTP probe and fingerprinting
- `ffuf` - Web fuzzing
- `curl` - HTTP client
- `jq` - JSON processing

**Optional (Enhanced Capabilities):**
- `arjun` - Parameter discovery
- `getJS` - JavaScript file extraction
- `nuclei` - Vulnerability scanning
- `caido` - Proxy (with MCP integration)

---

## Installation Steps

### Step 1: Verify Skill Structure
```bash
ls -la ${PAI_DIR}/skills/BugBountyWorkflow/
```

**Expected output:**
```
SKILL.md
INSTALL.md (this file)
VERIFY.md
```

### Step 2: Install External Tools

**Using Go (for Go-based tools):**
```bash
# Install subfinder
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# Install httpx
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

# Install nuclei (optional)
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
```

**Using package manager:**
```bash
# Install amass (macOS)
brew install amass

# Install jq (macOS)
brew install jq

# Install ffuf (macOS)
brew install ffuf
```

**Verify tool installation:**
```bash
command -v subfinder && echo "✅ subfinder installed"
command -v amass && echo "✅ amass installed"
command -v httpx && echo "✅ httpx installed"
command -v ffuf && echo "✅ ffuf installed"
command -v jq && echo "✅ jq installed"
command -v curl && echo "✅ curl installed"
```

### Step 3: Configure Caido MCP Integration

Caido proxy integration is critical for the workflow. Verify configuration:

```bash
# Check Caido auth in secrets
cat ${PAI_DIR}/config/secrets.json | jq '.caido'
```

**Expected output:**
```json
{
  "instance_url": "http://localhost:8080",
  "auth_token": "your-token-here"
}
```

**If not configured:**
1. Start Caido proxy
2. Generate API token in Caido settings
3. Add to `${PAI_DIR}/config/secrets.json`:
```json
{
  "caido": {
    "instance_url": "http://localhost:8080",
    "auth_token": "your-caido-api-token"
  }
}
```

### Step 4: Initialize Directory Structure

Create the research directory structure:
```bash
mkdir -p ${PAI_DIR}/history/research/{targets,findings,pocs,reports}
mkdir -p ${PAI_DIR}/history/learnings/$(date +%Y-%m)
```

**Expected structure:**
```
history/
├── research/
│   ├── targets/        # Target-specific research
│   ├── findings/       # Vulnerability discoveries
│   ├── pocs/          # Proof of concepts
│   └── reports/       # Bug bounty reports
└── learnings/
    └── YYYY-MM/       # Monthly technique learnings
```

### Step 5: Verify Dependent Skills

Check that related security skills are installed:
```bash
ls -1 ${PAI_DIR}/skills/ | grep -E "(ClientSideAttacks|OAuthOIDC|ReactNextSecurity|VulnChaining)"
```

**Expected output:**
```
ClientSideAttacks
CSPT
OAuthOIDC
PostMessageAttacks
ReactNextSecurity
VulnChaining
```

### Step 6: Verify Agents

Check that bug bounty agents are available:
```bash
ls -1 ${PAI_DIR}/agents/ | grep -E "(BugBountyReporter|VulnChainAnalyst|OAuthExpert|Pentester)"
```

**Expected output:**
```
BugBountyReporter.md
OAuthExpert.md
Pentester.md
VulnChainAnalyst.md
```

### Step 7: Test Skill Activation

Test skill activation with common triggers:
```bash
# In Claude Code:
"I need help with bug bounty hunting"
# OR
"Write a vulnerability report"
# OR
"How do I assess CVSS severity?"
```

**Expected behavior:**
- ✅ Skill activates and loads full context
- ✅ Provides relevant workflow section
- ✅ No activation errors

---

## Configuration

### Optional: Custom Wordlists

Configure wordlist paths for content discovery:
```bash
# Create wordlists directory
mkdir -p ${PAI_DIR}/wordlists

# Download common wordlists
curl -o ${PAI_DIR}/wordlists/common.txt https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt
```

Update ffuf commands in your workflow to use these paths.

### Optional: Platform API Integration

Configure bug bounty platform API credentials:

**HackerOne:**
```json
{
  "hackerone": {
    "api_token": "your-h1-token",
    "username": "your-username"
  }
}
```

**Bugcrowd:**
```json
{
  "bugcrowd": {
    "api_token": "your-bc-token",
    "email": "your-email"
  }
}
```

Add these to `${PAI_DIR}/config/secrets.json`.

### Optional: Quick Command Aliases

Add to your shell configuration (~/.zshrc or ~/.bashrc):
```bash
# Bug bounty workflow aliases
export PAI_DIR="${HOME}/.claude"

# Quick PoC server
alias pocserver='python3 -m http.server 8080'

# Generate report ID
alias reportid='echo "$(date +%Y%m%d)-$(openssl rand -hex 4)"'

# New target setup
alias newtarget='bash ${PAI_DIR}/scripts/new-target.sh'

# Save finding
alias savefinding='cp -r . ${PAI_DIR}/history/research/findings/$(date +%Y-%m-%d)_'
```

---

## Workflow Scripts

### Create New Target Script

Create `${PAI_DIR}/scripts/new-target.sh`:
```bash
#!/bin/bash
# new-target.sh [target-name] [program-url]

TARGET=$1
PROGRAM_URL=$2
BASE="${PAI_DIR}/history/research/targets"

mkdir -p "$BASE/$TARGET"/{recon,vulns,pocs,reports}

cat > "$BASE/$TARGET/README.md" << EOF
# Target: $TARGET

**Created:** $(date +%Y-%m-%d)
**Program:** $PROGRAM_URL

## Scope
[Add scope here]

## Domains

| Domain | Tech Stack | Notes |
|--------|------------|-------|
|        |            |       |

## Findings

| Date | Type | Severity | Status | Report ID |
|------|------|----------|--------|-----------|

## Testing Log
- $(date +%Y-%m-%d) - Initial reconnaissance

EOF

echo "✅ Created target directory: $BASE/$TARGET"
```

Make executable:
```bash
chmod +x ${PAI_DIR}/scripts/new-target.sh
```

### Create Quick PoC Generator

Create `${PAI_DIR}/scripts/gen-poc.sh`:
```bash
#!/bin/bash
# gen-poc.sh [vuln-type] [target] [payload]

VULN_TYPE=$1
TARGET=$2
PAYLOAD=$3
OUTPUT="poc-$(date +%Y%m%d-%H%M%S).html"

cat > "$OUTPUT" << EOF
<!DOCTYPE html>
<html>
<head>
  <title>$VULN_TYPE PoC - $TARGET</title>
  <meta charset="UTF-8">
</head>
<body>
  <h1>$VULN_TYPE Proof of Concept</h1>
  <h2>Target: $TARGET</h2>

  <h3>Payload</h3>
  <pre>$PAYLOAD</pre>

  <script>
  // Exploit code
  $PAYLOAD
  </script>

  <h3>Steps to Reproduce</h3>
  <ol>
    <li>Host this file on attacker.com</li>
    <li>Visit as authenticated user on $TARGET</li>
    <li>Observe execution</li>
  </ol>
</body>
</html>
EOF

echo "✅ Generated PoC: $OUTPUT"
```

Make executable:
```bash
chmod +x ${PAI_DIR}/scripts/gen-poc.sh
```

---

## Integration Points

### With Caido Workflow
The skill integrates tightly with Caido proxy for testing:
1. **Reconnaissance:** Query discovered endpoints with HTTPQL
2. **Testing:** Send requests to replay for payload testing
3. **Exploitation:** Replay modified requests with exploits
4. **Documentation:** Create findings from vulnerable requests

**Example HTTPQL queries:**
```bash
# Find API endpoints
req.path.cont:"/api/"

# Find auth endpoints
req.path.cont:"/login" OR req.path.cont:"/oauth"

# Find sensitive parameters
req.raw.cont:"password" OR req.raw.cont:"token"
```

### With SecurityAudit Workflow
BugBountyWorkflow provides the methodology for `/audit` command:
- Phase 1: Reconnaissance using recon tools
- Phase 2: JS analysis with JsAnalyzer skill
- Phase 3: Browser testing with Browser skill
- Phase 4: Report generation with BugBountyReporter agent

### With Research History
All findings are saved to the history system:
```
history/research/targets/example-com/
├── README.md           # Target overview
├── recon/             # Reconnaissance data
│   ├── subdomains.txt
│   ├── alive.txt
│   └── tech.json
├── vulns/             # Vulnerability analysis
│   ├── xss-finding.md
│   └── idor-finding.md
├── pocs/              # Proof of concepts
│   └── xss-poc.html
└── reports/           # Submitted reports
    └── H1-123456.md
```

---

## Troubleshooting

### Issue: External tools not found
**Solution:**
```bash
# Verify PATH includes Go bin directory
echo $PATH | grep -o "$HOME/go/bin"

# If not found, add to ~/.zshrc or ~/.bashrc:
export PATH="$HOME/go/bin:$PATH"

# Reload shell
source ~/.zshrc
```

### Issue: Caido MCP connection fails
**Check:**
1. Caido is running: `curl http://localhost:8080/graphql`
2. Auth token is valid in `config/secrets.json`
3. SessionStart hook loaded Caido auth

**Solution:**
```bash
# Test Caido connection manually
curl -X POST http://localhost:8080/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ requests(first: 1) { edges { node { id } } } }"}'
```

### Issue: Subdomain enumeration fails
**Check:**
1. Tools are installed: `command -v subfinder amass httpx`
2. API keys configured for passive sources
3. Target domain is resolvable

**Solution:**
```bash
# Test subfinder manually
subfinder -d example.com -silent -o test-subs.txt
cat test-subs.txt
```

### Issue: Skills not activating
**Check:**
1. Skill dependencies exist: `ls ${PAI_DIR}/skills/`
2. SKILL.md has correct frontmatter with description
3. Trigger phrases match skill description

### Issue: Directory permissions
**Solution:**
```bash
# Fix permissions on research directories
chmod -R 755 ${PAI_DIR}/history/research/
chown -R $(whoami) ${PAI_DIR}/history/research/
```

---

## Usage Examples

### Example 1: Start New Target Research
```bash
# In Claude Code:
"Start bug bounty hunting on example.com from HackerOne"

# Expected workflow:
# 1. Creates target directory structure
# 2. Begins reconnaissance phase
# 3. Runs subdomain enumeration
# 4. Probes live hosts
# 5. Identifies technologies
# 6. Analyzes JavaScript files
# 7. Creates target notes
```

### Example 2: Write Vulnerability Report
```bash
# In Claude Code:
"Write a bug bounty report for stored XSS in the comment field at example.com/posts"

# Expected workflow:
# 1. Loads report template (XSS)
# 2. Asks for necessary details
# 3. Generates structured report
# 4. Includes PoC code
# 5. Assesses CVSS severity
# 6. Suggests remediation
```

### Example 3: Chain Vulnerabilities
```bash
# In Claude Code:
"I found self-XSS and an open redirect. Can these be chained?"

# Expected workflow:
# 1. Activates VulnChaining skill
# 2. Analyzes both vulnerabilities
# 3. Identifies chaining patterns
# 4. Proposes exploitation chain
# 5. Upgrades severity assessment
# 6. Creates combined PoC
```

### Example 4: OAuth Testing
```bash
# In Claude Code:
"Test OAuth implementation on example.com for redirect_uri bypass"

# Expected workflow:
# 1. Activates OAuthOIDC skill
# 2. Analyzes OAuth flow
# 3. Tests redirect_uri validation
# 4. Tests state parameter
# 5. Documents findings
# 6. Creates exploitation PoC
```

---

## Performance Optimization

### Model Selection for Agents
For cost optimization, adjust agent models based on task complexity:
- **BugBountyReporter (sonnet)** - Report writing requires quality
- **VulnChainAnalyst (opus)** - Complex reasoning for chains
- **Pentester (sonnet)** - Balanced for testing guidance

### Parallel Reconnaissance
Use multiple tools in parallel for faster reconnaissance:
```bash
# Run subfinder, amass, and cert transparency in parallel
subfinder -d target.com -o subs1.txt &
amass enum -passive -d target.com -o subs2.txt &
curl "https://crt.sh/?q=%.target.com&output=json" | jq -r '.[].name_value' > subs3.txt &
wait
```

### Batch Processing
Process multiple targets or findings in batches to reduce context switching.

---

## Security Considerations

### Responsible Disclosure
This skill enforces responsible disclosure practices:
- Always test within scope
- Never cause damage to targets
- Follow 90-day disclosure timeline
- Document all testing activities
- Never exfiltrate real user data

### Data Protection
- Store sensitive findings in gitignored directories
- Never commit target-specific research to public repos
- Encrypt backups of research data
- Use safe payloads in PoCs (alert/console.log only)

### Testing Guidelines
- Respect rate limits and WAFs
- Use test accounts when possible
- Clean up test data after testing
- Stop if you gain unintended access
- Report critical issues immediately

---

## Uninstallation

To remove BugBountyWorkflow skill:
```bash
# Remove skill directory
rm -rf ${PAI_DIR}/skills/BugBountyWorkflow/

# Optional: Remove research data (CAREFUL!)
# rm -rf ${PAI_DIR}/history/research/

# Optional: Remove scripts
# rm ${PAI_DIR}/scripts/{new-target,gen-poc}.sh

# Note: Keep dependent skills - they're used by other workflows
# Note: Keep Caido - it's a core security tool
```

---

## Next Steps

After installation:
1. ✅ Run verification: See `VERIFY.md`
2. ✅ Set up your first target with `newtarget` alias
3. ✅ Test on a bug bounty program
4. ✅ Familiarize yourself with report templates
5. ✅ Practice vulnerability chaining techniques

---

**Installation Complete!**
Proceed to `VERIFY.md` to validate the installation.
