# FindIpRanges Workflow

Extract IPv4 CIDR prefixes from a known ASN using bgp.he.net's Prefixes V4 tab.

## Input

- **ASN** - The ASN number (e.g., "AS2906" or just "2906")
- **Output file** (optional) - Where to save IP ranges

## Procedure

### Step 1: Fetch Prefixes V4 Page

Navigate to the ASN's prefixes page:

```
URL: https://bgp.he.net/AS{number}#_prefixes4
Prompt: Extract all IPv4 CIDR prefixes from this ASN's Prefixes V4 section.
Return each prefix on its own line in CIDR notation (e.g., 192.0.2.0/24).
Also note the total count of prefixes.
```

### Step 2: Parse IPv4 Prefixes

The Prefixes V4 tab contains a table with:
- Prefix (CIDR notation)
- Description (may be empty)
- Origin AS (should match our ASN)

Extract all prefixes in valid CIDR format.

### Step 3: Calculate IP Count

For each prefix, calculate the number of IPs:
- /24 = 256 IPs
- /23 = 512 IPs
- /22 = 1,024 IPs
- /16 = 65,536 IPs
- /8 = 16,777,216 IPs

Formula: `2^(32 - prefix_length)`

### Step 4: Output

**Console output:**
```
AS2906 IPv4 Prefixes:

104.16.0.0/12    (1,048,576 IPs)
172.64.0.0/13    (524,288 IPs)
198.41.128.0/17  (32,768 IPs)
...

Total: 15 prefixes, ~2,500,000 IPs
```

**File output ({asn}-ipv4-ranges.txt):**
```
104.16.0.0/12
172.64.0.0/13
198.41.128.0/17
```

## Example

```
User: "Get IPv4 ranges for AS13335"

Fetch: https://bgp.he.net/AS13335#_prefixes4

Extract prefixes:
104.16.0.0/13
104.24.0.0/14
108.162.192.0/18
...

Output: AS13335-ipv4-ranges.txt
```

## Notes

- Some ASNs have hundreds of prefixes - be patient with large ASNs
- Prefixes may overlap (more specific routes)
- Empty Prefixes V4 = ASN doesn't announce IPv4 routes (might be IPv6-only or transit-only)
- Check the "Whois" tab for additional ownership info
