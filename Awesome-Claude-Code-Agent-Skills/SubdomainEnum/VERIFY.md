# SubdomainEnum Verification Checklist

**Version:** 1.0.0
**Purpose:** Verify SubdomainEnum skill is correctly installed and functional
**Methodology:** Jason Haddix's TBHM

---

## Pre-Flight Checks

### ✅ Core Components
- [ ] `${PAI_DIR}/skills/SubdomainEnum/SKILL.md` exists
- [ ] `${PAI_DIR}/skills/SubdomainEnum/workflows/QuickEnum.md` exists
- [ ] `${PAI_DIR}/skills/SubdomainEnum/workflows/FullEnum.md` exists
- [ ] `${PAI_DIR}/skills/SubdomainEnum/workflows/CloudEnum.md` exists
- [ ] `${PAI_DIR}/skills/SubdomainEnum/workflows/PermutationEnum.md` exists

### ✅ Tool Dependencies
- [ ] subfinder installed: `subfinder -version`
- [ ] httpx installed: `httpx -version`
- [ ] puredns installed: `puredns version`
- [ ] github-subdomains installed: `github-subdomains -h`
- [ ] shosubgo installed: `shosubgo -h`
- [ ] dnsgen installed: `dnsgen -h`

### ✅ Agent Dependencies
- [ ] SubdomainOrchestrator agent exists: `${PAI_DIR}/agents/SubdomainOrchestrator.md`
- [ ] SubdomainPassive agent exists: `${PAI_DIR}/agents/SubdomainPassive.md`
- [ ] SubdomainBrute agent exists: `${PAI_DIR}/agents/SubdomainBrute.md`
- [ ] SubdomainPermutation agent exists: `${PAI_DIR}/agents/SubdomainPermutation.md`
- [ ] SubdomainProber agent exists: `${PAI_DIR}/agents/SubdomainProber.md`

### ✅ Configuration Files
- [ ] Resolvers list exists: `${PAI_DIR}/config/wordlists/resolvers.txt`
- [ ] Wordlist exists: `${PAI_DIR}/config/wordlists/best-dns-wordlist.txt`
- [ ] Subfinder config exists: `${HOME}/.config/subfinder/provider-config.yaml`
- [ ] API keys configured: `${PAI_DIR}/config/secrets.json` has `subdomain_enum` section

---

## Functional Tests

### Test 1: Basic Skill Activation
```bash
# In Claude Code:
"Find subdomains for example.com quickly"
```

**Expected:**
- ✅ Skill activates (logs show "SubdomainEnum skill activated")
- ✅ QuickEnum workflow loaded
- ✅ No immediate errors

**Status:** [ ] Pass [ ] Fail

---

### Test 2: subfinder Passive Collection
```bash
# Test subfinder with API sources
subfinder -d hackerone.com -all -silent | head -10
```

**Expected output:**
```
www.hackerone.com
api.hackerone.com
support.hackerone.com
mta-sts.hackerone.com
...
```

**Expected:**
- ✅ Returns 10+ subdomains
- ✅ No API errors (if keys configured)
- ✅ Completes in < 30 seconds

**Status:** [ ] Pass [ ] Fail

---

### Test 3: httpx Web Probing
```bash
# Create test subdomain list
echo -e "www.hackerone.com\napi.hackerone.com\ninvalid.hackerone.com" > test-subs.txt

# Probe with httpx
httpx -l test-subs.txt -silent -status-code
```

**Expected output:**
```
https://www.hackerone.com [200]
https://api.hackerone.com [200]
```

**Expected:**
- ✅ Only live hosts returned
- ✅ Status codes shown
- ✅ HTTPS preferred over HTTP

**Status:** [ ] Pass [ ] Fail

---

### Test 4: puredns DNS Resolution
```bash
# Create test subdomain list
echo -e "www.example.com\nmail.example.com\nnonexistent12345.example.com" > test-dns.txt

# Resolve with puredns
puredns resolve test-dns.txt -r <(head -100 ${PAI_DIR}/config/wordlists/resolvers.txt) --skip-wildcard-filter
```

**Expected output:**
```
www.example.com
mail.example.com
```

**Expected:**
- ✅ Only valid subdomains returned
- ✅ Nonexistent subdomain filtered out
- ✅ Completes without errors

**Status:** [ ] Pass [ ] Fail

---

### Test 5: QuickEnum Workflow
```bash
# In Claude Code, run:
/subdomain-enum hackerone.com

# Or use natural language:
"Do a quick subdomain scan on hackerone.com"
```

**Expected:**
- ✅ QuickEnum workflow executes
- ✅ Runs subfinder with all sources
- ✅ Probes results with httpx
- ✅ Creates output files:
  - `hackerone.com-subdomains.txt` (all discovered)
  - `hackerone.com-live.txt` (live web servers)
- ✅ Completes in < 5 minutes

**Status:** [ ] Pass [ ] Fail

---

### Test 6: API Key Configuration
```bash
# Test that API keys are loaded
subfinder -d example.com -sources
```

**Expected output:**
```
Running subfinder with sources:
[chaos securitytrails shodan github censys virustotal ...]
```

**Expected:**
- ✅ Shows all configured API sources as active
- ✅ No "API key not configured" warnings
- ✅ At least 3+ sources active

**Status:** [ ] Pass [ ] Fail

---

### Test 7: Agent Spawning
```bash
# Run full enumeration to test agent orchestration
# In Claude Code:
/subdomain-enum example.com --full

# Check debug logs for agent spawning
ls -lt ${PAI_DIR}/debug/*.txt | head -5
```

**Expected:**
- ✅ Multiple agent session files created
- ✅ Agent IDs logged (a1b2c3d format)
- ✅ Agents for passive, brute, permutation, prober spawned
- ✅ No spawn failures in logs

**Status:** [ ] Pass [ ] Fail

---

### Test 8: Output File Structure
```bash
# After running subdomain-enum
ls -lh *hackerone.com*.txt
```

**Expected output:**
```
hackerone.com-subdomains.txt       # All discovered subdomains
hackerone.com-live.txt             # Live webservers
hackerone.com-live-detailed.txt    # httpx detailed output
```

**Expected:**
- ✅ All expected files created
- ✅ Files contain data (not empty)
- ✅ Proper formatting (one subdomain per line)

**Status:** [ ] Pass [ ] Fail

---

### Test 9: FullEnum Workflow (Optional - Takes 30+ minutes)
```bash
# In Claude Code:
"Do a full comprehensive subdomain enumeration on example.com"

# This will:
# - Run passive collection (subfinder, github, shodan)
# - Run DNS brute force (puredns with wordlist)
# - Run permutation scan (dnsgen + puredns)
# - Probe all results (httpx)
```

**Expected:**
- ✅ All 4 phases execute in sequence
- ✅ Brute force and permutation run in parallel
- ✅ Final output includes subdomains from all phases
- ✅ Deduplicated final list
- ✅ Creates comprehensive output files

**Status:** [ ] Pass [ ] Fail [ ] Skipped

---

### Test 10: Permutation Generation
```bash
# Create test subdomain list
echo -e "api.example.com\nwww.example.com" > base-subs.txt

# Generate permutations
dnsgen base-subs.txt
```

**Expected output:**
```
api-dev.example.com
api-staging.example.com
www-dev.example.com
www-test.example.com
admin-api.example.com
...
```

**Expected:**
- ✅ Generates 20+ permutations
- ✅ Patterns include: dev, staging, test, admin, etc.
- ✅ No duplicates

**Status:** [ ] Pass [ ] Fail

---

## Performance Validation

### Test 11: Parallel Agent Execution
```bash
# Run full enumeration and verify parallel execution
time /subdomain-enum example.com --full

# Check agent timestamps
ls -lt ${PAI_DIR}/debug/*.txt | head -10
```

**Expected:**
- ✅ Brute and Permutation agents start simultaneously (±5 seconds)
- ✅ Passive phase completes first
- ✅ Prober runs after brute/permutation complete
- ✅ Total time < 60 minutes for medium target

**Status:** [ ] Pass [ ] Fail

---

### Test 12: Token Usage Efficiency
```bash
# After full enumeration, check token usage
# Orchestrator should delegate most work to agents

# Expected token usage:
# - Orchestrator: ~5k tokens (coordination only)
# - Agents: ~2k tokens each (tool execution)
# - Total: ~15k tokens vs ~50k for monolithic approach
```

**Expected:**
- ✅ Primary context uses < 10k tokens
- ✅ Most work delegated to haiku agents
- ✅ No token limit exceeded errors

**Status:** [ ] Pass [ ] Fail

---

## Integration Tests

### Test 13: BugBountyWorkflow Integration
```bash
# Run bug bounty hunting workflow (includes SubdomainEnum)
/hunt example.com

# Verify SubdomainEnum runs as Step 1
ls ./recon/subdomains/
```

**Expected:**
- ✅ SubdomainEnum runs as first step
- ✅ Output used by subsequent workflow steps
- ✅ No errors in workflow log

**Status:** [ ] Pass [ ] Fail

---

### Test 14: Manual Agent Invocation
```bash
# In Claude Code, manually invoke subdomain agent:
Task(
  subagent_type: "subdomain-passive",
  model: "haiku",
  prompt: "Target: hackerone.com\nOutput: ./test-output"
)
```

**Expected:**
- ✅ Agent spawns successfully
- ✅ Runs subfinder + github-subdomains + shosubgo
- ✅ Creates output file in ./test-output/
- ✅ Returns subdomain count

**Status:** [ ] Pass [ ] Fail

---

## API Coverage Tests

### Test 15: Chaos API (FREE)
```bash
# Test Chaos API if configured
subfinder -d example.com -sources chaos -silent
```

**Expected:**
- ✅ Returns subdomains from Chaos dataset
- ✅ No authentication errors
- ✅ Fast response (< 10 seconds)

**Status:** [ ] Pass [ ] Fail [ ] API Key Not Configured

---

### Test 16: GitHub API
```bash
# Test GitHub code search
github-subdomains -d example.com -t YOUR_GITHUB_TOKEN
```

**Expected:**
- ✅ Searches GitHub repositories for subdomains
- ✅ Returns code-based findings
- ✅ No rate limit errors

**Status:** [ ] Pass [ ] Fail [ ] API Key Not Configured

---

### Test 17: SecurityTrails API
```bash
# Test SecurityTrails via subfinder
subfinder -d example.com -sources securitytrails -silent
```

**Expected:**
- ✅ Returns historical subdomain data
- ✅ No authentication errors
- ✅ Complementary results to other sources

**Status:** [ ] Pass [ ] Fail [ ] API Key Not Configured

---

## Real-World Validation

### Test 18: Known Target Test (HackerOne)
```bash
# Test on public bug bounty program
/subdomain-enum hackerone.com

# Expected to find well-known subdomains:
# - www.hackerone.com
# - api.hackerone.com
# - support.hackerone.com
# - mta-sts.hackerone.com
# - gslink.hackerone.com
# - etc.
```

**Expected results:**
- ✅ Finds 50+ subdomains
- ✅ All known subdomains discovered
- ✅ No false positives
- ✅ Live hosts correctly identified

**Status:** [ ] Pass [ ] Fail

---

## Verification Summary

**Date:** _______________
**Verified By:** _______________

**Results:**
- Core Components: [ ] Pass [ ] Fail
- Tool Dependencies: [ ] Pass [ ] Fail
- Agent Dependencies: [ ] Pass [ ] Fail
- Configuration Files: [ ] Pass [ ] Fail
- Functional Tests (1-10): ___ / 10 passed
- Performance Tests (11-12): ___ / 2 passed
- Integration Tests (13-14): ___ / 2 passed
- API Coverage Tests (15-17): ___ / 3 passed (or N/A)
- Real-World Test (18): [ ] Pass [ ] Fail

**Overall Status:** [ ] ✅ Verified [ ] ❌ Issues Found

---

## Troubleshooting Failed Tests

### If Test 2 (subfinder) fails:
```bash
# Reinstall subfinder
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# Verify it's in PATH
which subfinder

# Test without API keys
subfinder -d example.com
```

### If Test 3 (httpx) fails:
```bash
# Reinstall httpx
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

# Test with simple input
echo "example.com" | httpx -silent
```

### If Test 4 (puredns) fails:
```bash
# Update resolvers list
curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt \
  -o ${PAI_DIR}/config/wordlists/resolvers.txt

# Test with fewer resolvers
puredns resolve test.txt -r <(head -50 ${PAI_DIR}/config/wordlists/resolvers.txt)
```

### If Test 5 (QuickEnum) fails:
```bash
# Check workflow file exists
cat ${PAI_DIR}/skills/SubdomainEnum/workflows/QuickEnum.md

# Manually run commands from workflow
subfinder -d example.com -all -silent
```

### If Test 6 (API Keys) fails:
```bash
# Verify provider-config.yaml exists and has keys
cat ${HOME}/.config/subfinder/provider-config.yaml

# Get free API keys:
# - Chaos: https://chaos.projectdiscovery.io/
# - GitHub: https://github.com/settings/tokens
# - SecurityTrails: https://securitytrails.com/
```

### If Test 7 (Agent Spawning) fails:
- Check Task tool permissions in settings.json
- Verify agent markdown files exist and are valid
- Review `${PAI_DIR}/debug/latest` for errors
- Ensure agents use correct YAML frontmatter

### If Test 8 (Output Files) fails:
- Check write permissions in current directory
- Verify httpx is writing to correct location
- Run workflow with verbose output
- Check if files are created but empty (indicates tool failure)

### If Test 10 (Permutations) fails:
```bash
# Install dnsgen
uv pip install dnsgen

# Or use alterx as alternative
go install github.com/projectdiscovery/alterx/cmd/alterx@latest
```

### If API Tests (15-17) fail:
- Verify API keys are valid and not expired
- Check rate limits haven't been exceeded
- Test API key manually with curl
- Review subfinder documentation for API setup

---

## Next Steps After Verification

1. **If All Tests Pass:**
   - ✅ SubdomainEnum is ready for production use
   - Run on bug bounty targets
   - Integrate with BugBountyWorkflow
   - Add more free API keys for coverage

2. **If Some Tests Fail:**
   - Review troubleshooting steps above
   - Check tool installation
   - Verify API key configuration
   - Consult INSTALL.md for missing dependencies

3. **Optimization:**
   - Add more free API keys (Chaos, VirusTotal, Censys)
   - Download larger wordlists for brute force
   - Adjust agent models for cost/performance
   - Customize workflows for specific target types

4. **Integration:**
   - Add SubdomainEnum to SecurityAudit workflow
   - Create custom workflows for specific programs
   - Automate with cron for continuous monitoring
   - Export results to other tools (Burp, Caido)

---

## Recommended Next Actions

### Immediate (Do Now)
- [ ] Get Chaos API key (FREE, highest value)
- [ ] Get GitHub personal access token (FREE)
- [ ] Download additional wordlists
- [ ] Test on 2-3 known targets

### Short-term (This Week)
- [ ] Add SecurityTrails, Censys, VirusTotal keys
- [ ] Create custom workflows for common target types
- [ ] Integrate with your existing recon pipeline
- [ ] Document target-specific configurations

### Long-term (This Month)
- [ ] Build continuous monitoring system
- [ ] Create comparison reports (track new subdomains)
- [ ] Integrate with notification system
- [ ] Contribute findings back to Chaos dataset

---

**Verification Complete!**
SubdomainEnum skill is [ ] ready / [ ] needs fixes
