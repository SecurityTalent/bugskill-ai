# FindAsn Workflow

Discover ASN numbers associated with a company using bgp.he.net free-form search.

## Input

- **Company name** - Organization to search for
- **Output file** (optional) - Where to save ASN list

## Procedure

### Step 1: Search bgp.he.net

Use WebFetch to search:

```
URL: https://bgp.he.net/search?search[search]={company_name}
Prompt: Extract all ASN numbers and their organization names from this search results page.
For each ASN, provide:
- ASN number (e.g., AS12345)
- Organization name
- Country code if visible

Return as a structured list. Only include ASNs that appear to be directly owned by or related to {company_name}.
```

### Step 2: Parse Results

Look for patterns in the search results:
- Direct matches: ASN org name contains company name
- Subsidiaries: Different name but owned by parent company
- Regional entities: "Company EU", "Company Asia", etc.

### Step 3: Output

**Console output:**
```
Found 3 ASNs for "Example Corp":

AS12345 - Example Corp (US)
AS67890 - Example Corp Europe (DE)
AS11111 - Example Technologies Ltd (GB)
```

**File output ({company}-asns.txt):**
```
AS12345
AS67890
AS11111
```

## Search Tips

**Try multiple search variations:**
- Exact company name: "Netflix"
- With legal suffix: "Netflix Inc"
- Parent company: "Meta" for Facebook infrastructure
- Partial match: "cloud" + "flare" for Cloudflare

**Common patterns:**
- Large companies have multiple ASNs (regional, acquisition, purpose-specific)
- Look for ASNs with similar naming patterns
- Check if acquired companies retained their ASNs

## Example

```
User: "Find ASNs for Shopify"

Search: https://bgp.he.net/search?search[search]=Shopify

Results:
- AS36086 - Shopify Inc. (CA)
- AS394633 - Shopify Inc. (CA)

Output: shopify-asns.txt
AS36086
AS394633
```
