# SubdomainEnum Installation Guide

**Version:** 1.0.0
**Type:** Skill (Orchestrator-based)
**Methodology:** Jason Haddix's Bug Hunter's Methodology (TBHM)
**Dependencies:** Multiple subdomain tools, specialized agents

---

## Overview

SubdomainEnum is a comprehensive subdomain enumeration skill that follows Jason Haddix's TBHM methodology. It uses specialized agents to parallelize passive collection, brute force, permutation scanning, and web probing.

---

## Prerequisites

### 1. Core Requirements
- ✅ PAI Core installed
- ✅ Hook system functional
- ✅ Bun runtime for JavaScript execution
- ✅ Go (latest version) for tool installation

### 2. Agent Dependencies
This skill requires the following specialized agents:
- `subdomain-orchestrator` (sonnet) - Coordinates full enumeration workflow
- `subdomain-passive` (haiku) - Passive collection (subfinder, github, shodan)
- `subdomain-brute` (haiku) - DNS brute force with puredns
- `subdomain-permutation` (haiku) - Pattern-based permutation generation
- `subdomain-prober` (haiku) - HTTP web probing with httpx

**Installation:** These agents are in `${PAI_DIR}/agents/` and are auto-loaded

### 3. Tool Requirements

SubdomainEnum requires multiple external tools for different enumeration phases:

#### Critical Tools (Required)
- **subfinder** - Passive subdomain discovery (all API sources)
- **httpx** - Web probing and live host detection
- **puredns** - Fast DNS resolver with wildcard filtering

#### High-Priority Tools (Recommended)
- **github-subdomains** - GitHub code search enumeration
- **shosubgo** - Shodan subdomain enumeration
- **dnsgen** - Permutation/alteration generation

#### Optional Tools (Enhanced Coverage)
- **alterx** - Alternative permutation engine
- **dnsx** - Advanced DNS resolution

---

## Installation Steps

### Step 1: Install Core Tools

#### Install subfinder
```bash
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```

**Verify:**
```bash
subfinder -version
# Expected: subfinder v2.x.x
```

#### Install httpx
```bash
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
```

**Verify:**
```bash
httpx -version
# Expected: httpx v1.x.x
```

#### Install puredns
```bash
go install github.com/d3mondev/puredns/v2@latest
```

**Verify:**
```bash
puredns version
# Expected: puredns 2.x.x
```

### Step 2: Install High-Priority Tools

#### Install github-subdomains
```bash
go install github.com/gwen001/github-subdomains@latest
```

**Verify:**
```bash
github-subdomains -h
# Expected: Usage information
```

#### Install shosubgo
```bash
go install github.com/incogbyte/shosubgo@latest
```

**Verify:**
```bash
shosubgo -h
# Expected: Usage information
```

#### Install dnsgen
```bash
# Requires Python
uv pip install dnsgen
```

**Verify:**
```bash
dnsgen -h
# Expected: Usage information
```

### Step 3: Configure API Keys

API keys dramatically improve passive enumeration results. Configure in `${PAI_DIR}/config/secrets.json`:

```json
{
  "subdomain_enum": {
    "chaos": "YOUR_CHAOS_API_KEY",
    "securitytrails": "YOUR_SECURITYTRAILS_KEY",
    "shodan": "YOUR_SHODAN_KEY",
    "github": "YOUR_GITHUB_TOKEN",
    "censys": {
      "id": "YOUR_CENSYS_ID",
      "secret": "YOUR_CENSYS_SECRET"
    },
    "virustotal": "YOUR_VT_KEY",
    "passivetotal": {
      "username": "YOUR_PT_USER",
      "key": "YOUR_PT_KEY"
    }
  }
}
```

#### API Key Priority (FREE keys with high value)

**Critical (Get These First):**
- **Chaos** (projectdiscovery.io/chaos) - FREE, excellent coverage
- **GitHub** (github.com/settings/tokens) - FREE, code search
- **SecurityTrails** (securitytrails.com) - FREE tier, cert data

**High Value:**
- **Shodan** (shodan.io) - FREE tier available
- **VirusTotal** (virustotal.com) - FREE tier
- **Censys** (censys.io) - FREE tier

**Premium (Optional):**
- **PassiveTotal** (riskiq.com) - Paid, excellent historical data

#### Configure subfinder to use API keys

Create `${HOME}/.config/subfinder/provider-config.yaml`:

```yaml
chaos:
  - YOUR_CHAOS_API_KEY
securitytrails:
  - YOUR_SECURITYTRAILS_KEY
shodan:
  - YOUR_SHODAN_KEY
github:
  - YOUR_GITHUB_TOKEN
censys:
  - YOUR_CENSYS_ID:YOUR_CENSYS_SECRET
virustotal:
  - YOUR_VT_KEY
passivetotal:
  - YOUR_PT_USER:YOUR_PT_KEY
```

**Verify API configuration:**
```bash
subfinder -d example.com -sources
# Should show all configured sources as active
```

### Step 4: Download DNS Resolvers

Puredns requires a list of public DNS resolvers:

```bash
# Download Trickest's public resolvers (recommended)
mkdir -p ${PAI_DIR}/config/wordlists
curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt \
  -o ${PAI_DIR}/config/wordlists/resolvers.txt
```

**Verify:**
```bash
wc -l ${PAI_DIR}/config/wordlists/resolvers.txt
# Expected: ~5000+ resolvers
```

### Step 5: Download Subdomain Wordlists

Essential wordlists for brute force enumeration:

```bash
cd ${PAI_DIR}/config/wordlists

# Best general-purpose wordlist (Assetnote)
curl -s https://wordlists-cdn.assetnote.io/data/manual/best-dns-wordlist.txt \
  -o best-dns-wordlist.txt

# Comprehensive wordlist (n0kovo)
curl -s https://raw.githubusercontent.com/n0kovo/n0kovo_subdomains/main/n0kovo_subdomains_huge.txt \
  -o n0kovo-subdomains-huge.txt

# Smaller targeted wordlist (Jason Haddix)
curl -s https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/DNS/subdomains-top1million-110000.txt \
  -o subdomains-top1m-110k.txt
```

**Verify:**
```bash
ls -lh ${PAI_DIR}/config/wordlists/*.txt
# Should show 3 wordlist files
```

### Step 6: Verify Agents

```bash
ls -1 ${PAI_DIR}/agents/ | grep -E "Subdomain"
```

**Expected output:**
```
SubdomainOrchestrator.md
SubdomainPassive.md
SubdomainBrute.md
SubdomainPermutation.md
SubdomainProber.md
```

### Step 7: Verify Skill Structure

```bash
ls -la ${PAI_DIR}/skills/SubdomainEnum/
```

**Expected output:**
```
SKILL.md
INSTALL.md (this file)
VERIFY.md
workflows/
  ├── QuickEnum.md
  ├── FullEnum.md
  ├── CloudEnum.md
  └── PermutationEnum.md
```

### Step 8: Test Skill Activation

```bash
# In Claude Code, trigger the skill:
/subdomain-enum example.com
```

**Expected behavior:**
- ✅ Skill activates and loads QuickEnum.md workflow
- ✅ Runs subfinder with all configured API sources
- ✅ Probes results with httpx
- ✅ Creates output files: example.com-subdomains.txt, example.com-live.txt
- ✅ Completes without errors

---

## Configuration

### Optional: Customize Output Directory

Edit workflow files to change output location:
```bash
# In workflows/QuickEnum.md, change:
OUTPUT_DIR="."
# To:
OUTPUT_DIR="${PAI_DIR}/recon/subdomains"
```

### Optional: Adjust Wordlist for Brute Force

Edit `workflows/FullEnum.md` to customize wordlist selection:
```bash
# Change from:
WORDLIST="${PAI_DIR}/config/wordlists/best-dns-wordlist.txt"
# To:
WORDLIST="${PAI_DIR}/config/wordlists/n0kovo-subdomains-huge.txt"
```

### Optional: Adjust Agent Models

For cost optimization, you can adjust agent models:
- **haiku**: Fast, cheap ($0.25/MTok) - default for all subdomain agents
- **sonnet**: Balanced ($3/MTok) - default for orchestrator
- **opus**: Deep reasoning ($15/MTok) - not typically needed

Edit workflow to change model selection:
```javascript
Task(
  subagent_type: "subdomain-brute",
  model: "haiku",  // Optimal for tool execution
  prompt: "..."
)
```

### Optional: Configure Wildcard Filtering

Puredns handles wildcard domains automatically, but you can tune sensitivity:

```bash
# In workflows/FullEnum.md, adjust puredns flags:
puredns resolve subdomains.txt -r resolvers.txt --wildcard-tests 10
# Increase --wildcard-tests for more aggressive filtering
```

---

## Directory Structure After Installation

```
skills/SubdomainEnum/
├── SKILL.md              # Skill definition
├── INSTALL.md            # This file
├── VERIFY.md             # Verification checklist
└── workflows/
    ├── QuickEnum.md      # Fast passive-only enum
    ├── FullEnum.md       # Comprehensive 4-phase enum
    ├── CloudEnum.md      # Cloud-focused cert scanning
    └── PermutationEnum.md # Permutation-only workflow

agents/
├── SubdomainOrchestrator.md  # Coordinates full enumeration
├── SubdomainPassive.md       # Passive collection
├── SubdomainBrute.md         # DNS brute force
├── SubdomainPermutation.md   # Permutation generation
└── SubdomainProber.md        # HTTP probing

config/wordlists/
├── resolvers.txt             # Public DNS resolvers
├── best-dns-wordlist.txt     # Primary brute force list
├── n0kovo-subdomains-huge.txt # Comprehensive list
└── subdomains-top1m-110k.txt # Smaller targeted list
```

---

## Troubleshooting

### Issue: subfinder not finding subdomains

**Solution:**
```bash
# Check if API keys are configured
subfinder -d example.com -sources
# Should show active sources

# Test without cache
subfinder -d example.com -all -nC

# Verify provider-config.yaml exists
cat ${HOME}/.config/subfinder/provider-config.yaml
```

### Issue: puredns command not found

**Solution:**
```bash
# Verify Go bin in PATH
echo $PATH | grep go/bin

# If missing, add to shell config:
export PATH="$PATH:$(go env GOPATH)/bin"

# Reinstall puredns
go install github.com/d3mondev/puredns/v2@latest
```

### Issue: Agents not spawning

**Check:**
1. Verify agent files exist in `${PAI_DIR}/agents/`
2. Check Claude Code has Task tool permissions
3. Review agent error logs in `${PAI_DIR}/debug/`

### Issue: DNS resolution fails

**Solution:**
```bash
# Verify resolvers list exists and is valid
head ${PAI_DIR}/config/wordlists/resolvers.txt

# Test with smaller resolver list
puredns resolve subs.txt -r <(head -100 resolvers.txt)

# Update resolvers list
curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt \
  -o ${PAI_DIR}/config/wordlists/resolvers.txt
```

### Issue: Wordlist not found

**Solution:**
```bash
# Download missing wordlists
cd ${PAI_DIR}/config/wordlists
curl -s https://wordlists-cdn.assetnote.io/data/manual/best-dns-wordlist.txt \
  -o best-dns-wordlist.txt

# Or specify custom wordlist path in workflow
```

### Issue: httpx timing out

**Solution:**
```bash
# Increase timeout and threads
httpx -l subdomains.txt -timeout 10 -threads 50

# Or use faster resolution
httpx -l subdomains.txt -no-color -silent -follow-redirects
```

### Issue: GitHub API rate limit

**Solution:**
```bash
# Verify GitHub token is configured
cat ${HOME}/.config/subfinder/provider-config.yaml | grep github

# Use personal access token with higher limits
# Create at: https://github.com/settings/tokens
```

---

## Integration

### With SecurityAudit Workflow
SubdomainEnum can be integrated as recon phase:
```
/audit target.com
  ├── Phase 0: SubdomainEnum (reconnaissance)
  ├── Phase 1: JsAnalyzer (static analysis)
  ├── Phase 2: Browser testing
  └── Phase 3: Report generation
```

### With BugBountyWorkflow
SubdomainEnum is the first step in the bug bounty workflow:
```
/hunt target.com
  ├── Step 1: SubdomainEnum (this skill)
  ├── Step 2: Endpoint discovery
  ├── Step 3: Vulnerability testing
  └── Step 4: Report submission
```

### With Other Skills
- **JsAnalyzer:** Feed discovered web apps to JS analysis
- **Ffuf:** Use live subdomains as fuzzing targets
- **ClientSideAttacks:** Test discovered endpoints for client-side vulns
- **BugBountyWorkflow:** Comprehensive reconnaissance integration

---

## Optimization Tips

### For Speed (Quick Enum)
```bash
# Use QuickEnum workflow
/subdomain-enum target.com

# Only passive + probing
# Completes in 2-5 minutes
```

### For Comprehensive Coverage (Full Enum)
```bash
# Use FullEnum workflow with large wordlist
# Specify wordlist directory when prompted

# Runs passive + brute + permutation + probing
# Takes 30-60 minutes depending on target
```

### For Cloud Infrastructure
```bash
# Use CloudEnum workflow
# Focuses on cert transparency and cloud IP ranges
# Good for AWS/Azure/GCP hosted targets
```

### Cost Optimization
- All subdomain agents use **haiku** model by default (cheapest)
- Orchestrator uses **sonnet** (balanced)
- Total cost for full enum: ~$0.10 per target

---

## Uninstallation

To remove SubdomainEnum skill:
```bash
# Remove skill directory
rm -rf ${PAI_DIR}/skills/SubdomainEnum/

# Remove agents (optional - may be used by other skills)
rm ${PAI_DIR}/agents/Subdomain*.md

# Keep tools - they're useful for manual testing
# Keep wordlists - used across multiple skills
```

---

## Next Steps

After installation:
1. **Run verification:** See `VERIFY.md`
2. **Test on known target:** Start with public bug bounty program
3. **Review output files:** Understand structure and content
4. **Configure API keys:** Add free API keys for better coverage
5. **Customize workflows:** Adjust for your testing methodology

---

## Reference

**Jason Haddix's TBHM:**
- Video: youtube.com/watch?v=p4JgIu1mceI
- Slides: tbhm.io

**Tool Documentation:**
- subfinder: github.com/projectdiscovery/subfinder
- puredns: github.com/d3mondev/puredns
- httpx: github.com/projectdiscovery/httpx
- dnsgen: github.com/ProjectAnte/dnsgen

---

**Installation Complete!**
Proceed to `VERIFY.md` to validate the installation.
