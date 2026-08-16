# FullAsnRecon Workflow

Complete ASN and IPv4 range reconnaissance for a target company.

## Input

- **Company name** - The organization to search for (e.g., "Netflix", "Acme Corp", "Example Inc")
- **Output directory** - Where to save results (default: current directory)

## Procedure

### Step 1: Search bgp.he.net

Search for the company using free-form search:

```bash
# URL encode the company name and search
curl -s "https://bgp.he.net/search?search[search]={company_name}" | grep -oP 'AS\d+' | sort -u
```

Or use WebFetch to search and extract:

```
URL: https://bgp.he.net/search?search[search]={company_name}
Prompt: Extract all ASN numbers (format AS followed by digits) and their associated organization names from this page. Return as a list.
```

### Step 2: Verify ASN Ownership

For each discovered ASN, verify it belongs to the target company:

```
URL: https://bgp.he.net/AS{number}
Prompt: What organization owns this ASN? What country is it registered in? Is this ASN related to {company_name}?
```

Filter out ASNs that don't actually belong to the target.

### Step 3: Extract IPv4 Prefixes

For each confirmed ASN, fetch the Prefixes V4 tab:

```
URL: https://bgp.he.net/AS{number}#_prefixes4
Prompt: Extract all IPv4 CIDR prefixes announced by this ASN. Return as a list of CIDR ranges (e.g., 192.0.2.0/24).
```

### Step 4: Compile Results

Create output files:

**{company}-asns.txt:**
```
AS12345
AS67890
```

**{company}-ipv4-ranges.txt:**
```
192.0.2.0/24
198.51.100.0/24
203.0.113.0/24
```

**{company}-asn-report.md:**
```markdown
# ASN Reconnaissance: {Company}

**Date:** {date}
**Search Query:** {company_name}

## ASNs Found

| ASN | Organization | Country | IPv4 Prefixes |
|-----|--------------|---------|---------------|
| AS12345 | Company Inc | US | 5 |
| AS67890 | Company EU | DE | 3 |

## IPv4 Prefixes by ASN

### AS12345 - Company Inc
| Prefix | Description |
|--------|-------------|
| 192.0.2.0/24 | Production |
| 198.51.100.0/24 | CDN |

### AS67890 - Company EU
| Prefix | Description |
|--------|-------------|
| 203.0.113.0/24 | EU Datacenter |

## Summary

- **Total ASNs:** 2
- **Total IPv4 Prefixes:** 8
- **Estimated Total IPs:** ~2,048

## Next Steps

1. Run reverse DNS on these ranges to discover hostnames
2. Port scan ranges with masscan/nmap
3. Use discovered domains with SubdomainEnum skill
```

## Example Execution

```
User: "Find the IP ranges owned by Cloudflare"

1. Search bgp.he.net for "Cloudflare"
   → Found: AS13335, AS209242, AS394536, etc.

2. Verify each ASN belongs to Cloudflare
   → AS13335: Cloudflare, Inc. (US) ✓
   → AS209242: Cloudflare London (GB) ✓

3. Extract IPv4 prefixes from each ASN
   → AS13335: 104.16.0.0/12, 172.64.0.0/13, etc.

4. Generate report with all findings
   → cloudflare-asn-report.md
   → cloudflare-ipv4-ranges.txt
```

## Tips

- Search variations: Try "Company", "Company Inc", "Company LLC"
- Some companies have multiple legal entities with separate ASNs
- Regional subsidiaries often have their own ASNs
- Acquired companies may still have legacy ASNs
- Check ASN descriptions for hints about infrastructure purpose
