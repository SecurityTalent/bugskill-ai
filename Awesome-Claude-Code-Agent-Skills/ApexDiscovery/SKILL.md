---
name: ApexDiscovery
description: Comprehensive apex/root domain discovery using multiple techniques. USE WHEN user mentions find related domains, apex domains, root domains, company domains, acquisitions, subsidiary domains, reverse whois, domain footprint, OR wants to discover all domains owned by an organization before subdomain enumeration.
---

# ApexDiscovery

Discover all apex/root domains owned by a target organization using multiple techniques.

**Philosophy:**
> "For every apex domain you find, you 4x your chance of hacking the target."
> — Jason Haddix

**Why this matters:** Companies own many domains — acquisitions, regional sites, product brands, internal tools. Subdomain enumeration only works on domains you know about. This skill finds the domains you don't.

## Important: Organization Name Discovery

During recon, you'll often discover **additional organization names** that should be searched:

- WHOIS shows "Tesla Motors Inc" but ASN shows "Tesla Energy"
- ASN data reveals acquired company "SolarCity"
- Cert org field shows "Acme Holdings LLC" (parent company)

**The workflow should be ITERATIVE:**
1. Search initial org name
2. Collect any NEW org names discovered
3. **Present to user:** "Found these related orgs: X, Y, Z. Search them too?"
4. If yes → recursive search on new orgs
5. Repeat until no new orgs found

**Where new orgs appear:**
| Source | Field to Check |
|--------|----------------|
| WHOIS | Registrant Organization |
| ASN (bgp.he.net) | AS Organization Name |
| Certificates | O= (Organization) field |
| DomLink | Company Names section |

## Workflow Routing

| Workflow | Trigger | What It Does |
|----------|---------|--------------|
| **Quick** | "find related domains", "apex discovery", DEFAULT | Reverse WHOIS + crt.sh org search |
| **Full** | "full apex discovery", "all company domains", "complete domain footprint" | All techniques in parallel |
| **Microsoft** | "Microsoft tenant", "M365 domains", "Azure domains" | tenant-domains only |

---

## Techniques Overview

| # | Technique | Tool | API Key Required | Coverage |
|---|-----------|------|------------------|----------|
| 1 | Reverse WHOIS | knockknock + DomLink | Yes (whoxy) | Excellent |
| 2 | Microsoft Tenant | tenn.sh | No | M365/Azure orgs |
| 3 | ASN Discovery | **AsnRecon skill** | No | IP-based infra |
| 4 | ASN → Reverse DNS | **AsnRecon skill** | No | Domains on IP space |
| 5 | Cert Transparency (Org) | crt.sh | No | Good |
| 6 | Amass Intel | amass intel -whois | Optional | Good |
| 7 | Google Dorking | Manual/Script | No | Variable |
| 8 | Acquisitions Research | Crunchbase/Wikipedia | No | Manual |

---

## Quick Workflow

**Time:** 2-5 minutes
**Best for:** Fast initial discovery

### Step 1: Reverse WHOIS (knockknock)

```bash
# Install if needed
go install github.com/harleo/knockknock@latest

# Run with registrant name
knockknock -n "Acme Corporation" -o acme-whois.txt

# Or with email
knockknock -n "admin@target.com" -o acme-whois.txt

# Or with seed domain (extracts registrant automatically)
knockknock -n "target.com" -o acme-whois.txt
```

### Step 2: Certificate Transparency (Org Search)

```bash
# Search crt.sh by organization name
curl -s "https://crt.sh/?O=Acme+Corporation&output=json" | \
  jq -r '.[].common_name' | \
  sed 's/\*\.//g' | \
  rev | cut -d. -f1-2 | rev | \
  sort -u > acme-crt-domains.txt
```

### Step 3: Aggregate

```bash
cat acme-whois.txt acme-crt-domains.txt | sort -u > apex_domains.txt
echo "Found $(wc -l < apex_domains.txt) apex domains"
```

---

## Full Workflow

**Time:** 10-30 minutes
**Best for:** Comprehensive discovery, bug bounty, red team

### Phase 1: Gather Seed Information

```bash
# Get WHOIS info from seed domain
whois target.com | grep -iE "(Registrant|Organization|Email)" > seed-info.txt

# Extract org name and email for later phases
ORG_NAME=$(grep -i "Organization" seed-info.txt | head -1 | cut -d: -f2 | xargs)
REG_EMAIL=$(grep -i "Email" seed-info.txt | head -1 | cut -d: -f2 | xargs)

echo "Organization: $ORG_NAME"
echo "Email: $REG_EMAIL"
```

### Phase 2: Reverse WHOIS (Multiple Sources)

**Option A: knockknock (free, uses ViewDNS)**
```bash
knockknock -n "$ORG_NAME" -o domains-org.txt
knockknock -n "$REG_EMAIL" -o domains-email.txt
```

**Option B: DomLink (WHOXY API configured on VPS)**
```bash
# DomLink is installed on VPS at ~/tools/DomLink/
# WHOXY API key already configured
ssh root@207.244.244.11 'cd ~/tools/DomLink && python3 domLink.py -D target.com -o domains-domlink.txt'
scp root@207.244.244.11:~/tools/DomLink/domains-domlink.txt .
```

**Option C: revwhois (requires WhoisXMLAPI)**
```bash
revwhois -q "$ORG_NAME" -o domains-revwhois.txt
```

### Phase 3: Microsoft Tenant Discovery

```bash
# Only if target uses Microsoft 365/Azure
# tenn.sh is on VPS at ~/tools/tenn.sh (uses Micah Van Deusen's tenant-domains API)

# Run remotely on VPS
ssh root@207.244.244.11 'bash ~/tools/tenn.sh -d target.com -s' > domains-tenant.txt

# Or copy script locally and run
bash tenn.sh -d target.com -o domains-tenant.txt
```

### Phase 4-5: ASN Discovery + Reverse DNS

**Invoke the AsnRecon skill** to find ASNs and IP ranges, then extract domains:

```
→ Call AsnRecon skill with org name
→ AsnRecon searches bgp.he.net
→ Returns: asns.txt, ipv4-ranges.txt
→ Reverse DNS on IP ranges → domains-asn.txt
```

The AsnRecon skill handles:
- Searching bgp.he.net by organization name
- Extracting ASN numbers
- Getting IPv4 prefixes for each ASN
- Reverse DNS to discover domains on that IP space

**Important:** Check AsnRecon output for additional organization names that may warrant recursive searching.

### Phase 5: Certificate Transparency (Organization)

```bash
# Search by organization name (URL encode spaces)
ORG_ENCODED=$(echo "$ORG_NAME" | sed 's/ /+/g')
curl -s "https://crt.sh/?O=$ORG_ENCODED&output=json" | \
  jq -r '.[].common_name' 2>/dev/null | \
  sed 's/\*\.//g' | \
  rev | cut -d. -f1-2 | rev | \
  sort -u > domains-crt.txt
```

### Phase 6: Amass Intel (Comprehensive)

```bash
# Domain discovery using multiple sources
amass intel -d target.com -whois -o domains-amass.txt

# Include related by certificate
amass intel -d target.com -src -o domains-amass-full.txt
```

### Phase 7: Google Dorking (Manual Assist)

Provide user with dorks to run:

```
"© Acme Corporation" -site:target.com
"Acme Corporation" inurl:about
intitle:"Acme" inurl:login
"target.com" site:crunchbase.com
```

### Phase 8: Acquisitions Research

```bash
# Search Crunchbase (manual or API)
echo "Check: https://www.crunchbase.com/organization/acme-corporation/acquisitions"

# Wikipedia acquisitions
echo "Check: https://en.wikipedia.org/wiki/Acme_Corporation (Acquisitions section)"
```

### Phase 9: Aggregate All Results

```bash
# Combine all discovered domains
cat domains-*.txt 2>/dev/null | \
  tr '[:upper:]' '[:lower:]' | \
  sed 's/\*\.//g' | \
  rev | cut -d. -f1-2 | rev | \
  sort -u > apex_domains.txt

# Generate report
echo "# Apex Domain Discovery Report" > APEX-REPORT.md
echo "" >> APEX-REPORT.md
echo "**Target:** $ORG_NAME" >> APEX-REPORT.md
echo "**Seed Domain:** target.com" >> APEX-REPORT.md
echo "**Date:** $(date)" >> APEX-REPORT.md
echo "" >> APEX-REPORT.md
echo "## Domains Found ($(wc -l < apex_domains.txt))" >> APEX-REPORT.md
echo "" >> APEX-REPORT.md
cat apex_domains.txt | while read d; do echo "- $d"; done >> APEX-REPORT.md

echo ""
echo "=== DISCOVERY COMPLETE ==="
echo "Found $(wc -l < apex_domains.txt) apex domains"
echo "Results: apex_domains.txt"
echo "Report: APEX-REPORT.md"
```

---

## Tool Installation

```bash
# Reverse WHOIS
go install github.com/harleo/knockknock@latest

# DomLink (optional - needs WHOXY API)
git clone https://github.com/vysecurity/DomLink.git
cd DomLink && pip install -r requirements.txt

# revwhois (optional - needs WhoisXMLAPI)
go install github.com/c3l3si4n/revwhois@latest

# Tenant domains (Microsoft)
go install github.com/immunIT/tenant-domains@latest

# Amass (comprehensive)
go install -v github.com/owasp-amass/amass/v4/...@master
```

---

## API Keys

| Service | Purpose | Cost | Config Location |
|---------|---------|------|-----------------|
| WHOXY | Reverse WHOIS (DomLink) | $2/1000 queries | `~/.domLink.cfg` |
| WhoisXMLAPI | Reverse WHOIS (revwhois) | Free tier available | `WHOISXML_API_KEY` env |
| SecurityTrails | Reverse WHOIS | Free tier | amass config |

**Amass config:** `~/.config/amass/config.ini`

---

## Output Structure

```
apex_discovery_{target}_{timestamp}/
├── seed-info.txt           # Initial WHOIS data
├── domains-whois.txt       # Reverse WHOIS results
├── domains-tenant.txt      # Microsoft tenant domains
├── domains-asn.txt         # ASN-based discovery
├── domains-crt.txt         # Certificate transparency
├── domains-amass.txt       # Amass intel results
├── apex_domains.txt        # Final deduplicated list
└── APEX-REPORT.md          # Summary report
```

---

## Integration with SubdomainEnum

After apex discovery, enumerate all found domains:

```bash
# Feed apex domains into SubdomainEnum
while read domain; do
  echo "Enumerating: $domain"
  subfinder -d "$domain" -all >> all-subdomains.txt
done < apex_domains.txt

# Or use SubdomainEnum Full workflow
# which accepts apex_domains.txt as input
```

---

## Examples

**Example 1: Quick discovery**
```
User: "Find related domains for target.com"
→ Quick workflow
→ knockknock reverse WHOIS + crt.sh org search
→ "Found 12 apex domains owned by Acme Corp"
```

**Example 2: Full discovery for bug bounty**
```
User: "Do full apex domain discovery on tesla.com"
→ Full workflow
→ All techniques in parallel
→ "Found 47 apex domains:
   - Reverse WHOIS: 23 (tesla.com, teslamotors.com, tesla.cn...)
   - Microsoft Tenant: 8
   - ASN/Reverse DNS: 12
   - Certificate Org: 15
   - Amass Intel: 19
   After deduplication: 47 unique apex domains"
```

**Example 3: Microsoft-focused**
```
User: "Find all Microsoft 365 domains for contoso.com"
→ Microsoft workflow
→ tenant-domains only
→ "Found 6 M365 tenant domains"
```

---

## Tips

1. **Start with WHOIS** — registrant info is gold for reverse lookups
2. **Check privacy** — if privacy protected, try historical WHOIS
3. **Acquisitions matter** — check Crunchbase for M&A history
4. **Regional TLDs** — companies often register .co.uk, .de, .jp variants
5. **Product brands** — separate domains for product lines
6. **Internal tools** — look for *-internal.com, *-corp.com patterns
