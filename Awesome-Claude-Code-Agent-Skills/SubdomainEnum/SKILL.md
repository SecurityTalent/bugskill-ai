---
name: SubdomainEnum
description: Subdomain enumeration with Light and Full workflows, plus intelligent target prioritization. USE WHEN user mentions subdomain enumeration, find subdomains, subdomain recon, recon, reconnaissance, quick subdomain scan, fast recon, full recon, prioritize targets, OR wants to enumerate attack surface. Light = subfinder only (fast). Full = all tools (comprehensive). Both include optional prioritized reporting.
---

# SubdomainEnum

Subdomain enumeration following Jason Haddix's Bug Hunter's Methodology (TBHM), with intelligent target prioritization.

**Philosophy:**
> "For every subdomain you find, you 2x your chance of hacking the target.
> For every apex domain you find, you 4x your chance of hacking the target."
> — Jason Haddix

## Workflow Routing

| Workflow | Trigger | What It Does |
|----------|---------|--------------|
| **Light** | "quick subdomains", "fast enum", "light recon", "find subdomains", DEFAULT | subfinder -all → httpx probe → prioritize |
| **Full** | "full enum", "comprehensive", "all subdomains", "thorough recon", "full recon" | All tools parallel → aggregate → httpx probe → prioritize |
| **Probe** | "probe subdomains", "check live hosts" | httpx against provided list → prioritize |

**When executing, announce:**
```
Running the **Light** workflow from **SubdomainEnum**...
```

---

## Light Workflow (Default)

**When to use:** Quick reconnaissance, time-sensitive, initial target assessment.

**Time:** 1-5 minutes

**Tools:** subfinder, httpx, PrioritizeTargets

### Steps

1. **Create output directory:**
```bash
mkdir -p recon_{domain}_{timestamp}
cd recon_{domain}_{timestamp}
```

2. **Run subfinder with all sources:**
```bash
subfinder -d {domain} -all -o subdomains-raw.txt
```

3. **Deduplicate and sort:**
```bash
sort -u subdomains-raw.txt > subdomains.txt
echo "Found $(wc -l < subdomains.txt) subdomains"
```

4. **Probe with httpx (JSON for prioritization):**
```bash
httpx -l subdomains.txt -silent -status-code -title -tech-detect -json -o probe.json
httpx -l subdomains.txt -silent -o live.txt
echo "$(wc -l < live.txt) live hosts"
```

5. **Generate prioritized report:**
```bash
bun ~/clawd/skills/SubdomainEnum/tools/PrioritizeTargets.ts \
  --input probe.json --output report.md
```

6. **Report summary to user:**
```
Found X subdomains, Y are live.
🔴 CRITICAL: N targets
🟠 HIGH: N targets  
🟡 MEDIUM: N targets
⚪ LOW: N targets

Top targets:
1. admin.target.com (Score: 95) - Admin panel
2. api-staging.target.com (Score: 82) - Dev environment + API
3. jenkins.target.com (Score: 78) - CI/CD exposed
```

### Output
```
recon_{domain}_{timestamp}/
├── subdomains-raw.txt      # Raw subfinder output
├── subdomains.txt          # Deduplicated list
├── probe.json              # httpx JSON (for prioritization)
├── live.txt                # Live hosts
└── report.md               # Prioritized target report
```

---

## Full Workflow

**When to use:** Bug bounty, comprehensive audits, maximum coverage.

**Time:** 10-60 minutes (depends on target size)

**Tools:** subfinder, assetfinder, amass, github-subdomains, subbdom-cli, httpx, PrioritizeTargets (optional: puredns, dnsgen)

### Phase 0: Apex Domain Discovery (Optional)

If targeting a Microsoft 365/Azure organization, discover related apex domains first:

```bash
tenant-domains -d {domain} -o apex_domains.txt
```

If not Microsoft, create apex_domains.txt with initial domain:
```bash
echo "{domain}" > apex_domains.txt
```

### Phase 1: Passive Collection (Parallel)

Run all passive tools simultaneously for each apex domain:

```bash
# Terminal 1: Subfinder
subfinder -d {domain} -all -o subfinder.txt

# Terminal 2: Assetfinder  
assetfinder --subs-only {domain} > assetfinder.txt

# Terminal 3: GitHub Subdomains (requires GITHUB_TOKEN)
github-subdomains -d {domain} -e -o github.txt

# Terminal 4: Amass (passive mode, with timeout)
timeout 30m amass enum -passive -d {domain} -o amass.txt

# Terminal 5: Subbdom (requires API key in ~/.subbdom-cli.yaml)
# Linux binary on VPS - run via SSH or install locally
ssh root@207.244.244.11 "~/tools/subbdom-cli/subbdom-cli -z {domain}" > subbdom.txt
```

**For multiple apex domains:**
```bash
while read domain; do
  subfinder -d "$domain" -all >> subfinder.txt &
  assetfinder --subs-only "$domain" >> assetfinder.txt &
  github-subdomains -d "$domain" -e >> github.txt &
  timeout 30m amass enum -passive -d "$domain" >> amass.txt &
done < apex_domains.txt
wait
```

### Phase 2: Aggregation

Combine and deduplicate all results:

```bash
cat subfinder.txt assetfinder.txt github.txt amass.txt subbdom.txt 2>/dev/null | \
  sort -u > subdomains.txt

# Generate stats
echo "=== TOOL STATISTICS ==="
echo "Subfinder:   $(wc -l < subfinder.txt 2>/dev/null || echo 0)"
echo "Assetfinder: $(wc -l < assetfinder.txt 2>/dev/null || echo 0)"
echo "GitHub:      $(wc -l < github.txt 2>/dev/null || echo 0)"
echo "Amass:       $(wc -l < amass.txt 2>/dev/null || echo 0)"
echo "Subbdom:     $(wc -l < subbdom.txt 2>/dev/null || echo 0)"
echo "Total unique: $(wc -l < subdomains.txt)"
```

### Phase 3: DNS Resolution (Optional but Recommended)

Verify subdomains resolve:

```bash
cat subdomains.txt | dnsx -silent > resolved.txt
```

### Phase 4: Permutation/Brute Force (Optional)

For maximum coverage:

```bash
# Generate permutations with dnsgen
cat resolved.txt | dnsgen - > permutations.txt

# Resolve permutations
puredns resolve permutations.txt -r resolvers.txt -w permutation-resolved.txt

# Add new findings
cat resolved.txt permutation-resolved.txt | sort -u > all-resolved.txt
```

### Phase 5: HTTP Probing

```bash
httpx -l subdomains.txt -silent -status-code -title -tech-detect \
  -json -o probe.json

httpx -l subdomains.txt -silent -o live.txt
```

### Phase 6: Target Prioritization

```bash
bun ~/clawd/skills/SubdomainEnum/tools/PrioritizeTargets.ts \
  --input probe.json --output report.md
```

### Output Structure
```
recon_{domain}_{timestamp}/
├── apex_domains.txt        # All apex domains (if tenant-domains used)
├── subfinder.txt           # Subfinder results
├── assetfinder.txt         # Assetfinder results
├── github.txt              # GitHub results
├── amass.txt               # Amass results
├── subdomains.txt          # Aggregated, deduplicated
├── resolved.txt            # DNS-verified subdomains
├── probe.json              # httpx JSON output
├── live.txt                # Live HTTP/S hosts
├── report.md               # Prioritized target report
└── high-value.txt          # Quick grep of interesting targets
```

---

## Target Prioritization

The PrioritizeTargets engine scores every live host and generates a prioritized report.

### Scoring Criteria

**CRITICAL (Score 90-100):**
- Admin panels, dashboards, consoles
- Authentication servers (SSO, SAML, OAuth)
- Internal tools exposed (Jenkins, Grafana, Kibana, Prometheus)
- Cloud management consoles

**HIGH (Score 70-89):**
- Development/staging environments
- API endpoints (GraphQL, REST, Swagger, OpenAPI)
- File upload/storage endpoints
- Database interfaces (phpMyAdmin, Adminer)

**MEDIUM (Score 50-69):**
- Partner/vendor portals
- Mobile backends
- Legacy systems
- Sites with interesting technologies

**LOW (Score <50):**
- Static marketing sites
- CDN nodes
- Redirects to main domain
- 404 responses

### Technology Scoring

| Technology | Score Modifier |
|------------|----------------|
| WordPress | +15 |
| GraphQL | +10 |
| Swagger/OpenAPI | +10 |
| Express/Node.js | +10 |
| Flask | +8 |
| Cloudflare | -10 |
| Gatsby/Hugo/Jekyll | -15 |

### Status Code Scoring

| Code | Score | Reason |
|------|-------|--------|
| 401 | +15 | Auth required - test bypass |
| 403 | +12 | Forbidden - test bypass |
| 500 | +10 | Server error - misconfiguration |
| 502/503 | +8 | Gateway issues - backend exposure |

---

## Tool Installation

```bash
# All tools via Go
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install -v github.com/tomnomnom/assetfinder@latest
go install -v github.com/owasp-amass/amass/v4/...@master
go install -v github.com/gwen001/github-subdomains@latest
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
go install -v github.com/projectdiscovery/dnsx/cmd/dnsx@latest
go install -v github.com/d3mondev/puredns/v2@latest

# Prioritization script requires bun
curl -fsSL https://bun.sh/install | bash
```

---

## API Keys Configuration

API keys dramatically improve coverage. Configure in `~/.config/subfinder/provider-config.yaml`:

```yaml
securitytrails: [YOUR_API_KEY]
shodan: [YOUR_API_KEY]  
censys: [YOUR_API_KEY:YOUR_SECRET]
virustotal: [YOUR_API_KEY]
chaos: [YOUR_API_KEY]
github: [YOUR_TOKEN]
```

---

## Quick Reference

| Need | Command |
|------|---------|
| Fast subdomains | `subfinder -d target.com -all -o subs.txt` |
| Add CT logs | `assetfinder --subs-only target.com >> subs.txt` |
| GitHub search | `github-subdomains -d target.com -e >> subs.txt` |
| Deep enum | `amass enum -passive -d target.com >> subs.txt` |
| Subbdom DB | `ssh VPS "~/tools/subbdom-cli/subbdom-cli -z target.com"` |
| Verify DNS | `cat subs.txt \| dnsx -silent > resolved.txt` |
| Find live | `httpx -l resolved.txt -json -o probe.json` |
| Prioritize | `bun tools/PrioritizeTargets.ts --input probe.json --output report.md` |

---

## Examples

**Example 1: Light enumeration (default)**
```
User: "Find subdomains for target.com"
→ Light workflow
→ subfinder -all → httpx → prioritize
→ "Found 234 subdomains, 156 live.
   🔴 CRITICAL: 3 | 🟠 HIGH: 12 | 🟡 MEDIUM: 45 | ⚪ LOW: 96
   Top: admin.target.com (95), api-dev.target.com (82)"
```

**Example 2: Full enumeration**
```
User: "Do full subdomain enumeration on example.org"
→ Full workflow
→ All tools parallel → aggregate → httpx → prioritize
→ "Found 1,547 unique subdomains. 892 live.
   🔴 CRITICAL: 8 | 🟠 HIGH: 34 | 🟡 MEDIUM: 156 | ⚪ LOW: 694
   Tool breakdown: subfinder 789, assetfinder 456, github 523, amass 1203"
```

**Example 3: Quick recon with report**
```
User: "Quick recon on target.com, prioritize targets"
→ Light workflow (prioritization always included)
→ Outputs report.md with CRITICAL→LOW targets and attack surface notes
```
