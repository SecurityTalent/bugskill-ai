# CloudEnum Workflow

Cloud-focused subdomain enumeration via SSL certificate scanning.

## When to Use

- Target uses cloud infrastructure (AWS, Azure, GCP)
- Traditional methods miss cloud-hosted assets
- Finding shadow IT and forgotten cloud resources

## Concept (from TBHM)

SSL certificates contain domain information in:
- Common Name (CN)
- Subject Alternative Name (SAN)
- Organization (O)

By scanning cloud IP ranges for SSL certs and grepping for target domains, we discover cloud-hosted subdomains that passive sources miss.

## Workflow Steps

### Step 1: Download Pre-scanned Cloud Cert Data

The kaeferjaeger collective scans all major cloud providers weekly:

```bash
TARGET="{target}"
OUTPUT_DIR="./${TARGET}-cloud"
mkdir -p $OUTPUT_DIR

# Download latest cert data (large files)
curl -O http://kaeferjaeger.gay/sni-ip-ranges/amazon/ipv4_merged_sni.txt
curl -O http://kaeferjaeger.gay/sni-ip-ranges/google/ipv4_merged_sni.txt
curl -O http://kaeferjaeger.gay/sni-ip-ranges/microsoft/ipv4_merged_sni.txt
curl -O http://kaeferjaeger.gay/sni-ip-ranges/digitalocean/ipv4_merged_sni.txt
curl -O http://kaeferjaeger.gay/sni-ip-ranges/oracle/ipv4_merged_sni.txt
```

### Step 2: Search for Target Domains

```bash
# Search all cloud providers for target
cat *.txt | grep -F ".$TARGET" | awk -F'-- ' '{print $2}' | tr ' ' '\n' | tr '[' ' ' | sed 's/ //' | sed 's/\]//' | grep -F ".$TARGET" | sort -u > $OUTPUT_DIR/cloud-subdomains.txt
```

### Step 3: Probe Results

```bash
cat $OUTPUT_DIR/cloud-subdomains.txt | httpx -status-code -title -tech-detect -o $OUTPUT_DIR/cloud-live.txt
```

### Step 4: Identify Cloud Provider

```bash
# Check which cloud each subdomain is on
cat $OUTPUT_DIR/cloud-live.txt | httpx -cdn -o $OUTPUT_DIR/cloud-providers.txt
```

## Alternative: Active Scanning with Caduceus

For targets with known ASNs, you can actively scan their IP ranges:

```bash
# Install caduceus
go install github.com/Cgboal/SonarSearch/cmd/crobat@latest

# Scan ASN IP ranges for certs
# (Requires ASN enumeration first - see recon skill)
```

## Output Files

| File | Contents |
|------|----------|
| `cloud-subdomains.txt` | Subdomains found in cloud certs |
| `cloud-live.txt` | Live cloud-hosted servers |
| `cloud-providers.txt` | Which cloud each host is on |

## Cloud Provider IP Sources

For active scanning, get cloud IP ranges from:

```bash
# All major providers merged
curl -O https://raw.githubusercontent.com/lord-alfred/ipranges/main/all/ipv4_merged.txt
```

Individual providers:
- AWS: https://ip-ranges.amazonaws.com/ip-ranges.json
- Azure: https://www.microsoft.com/en-us/download/details.aspx?id=56519
- GCP: https://www.gstatic.com/ipranges/cloud.json

## Pro Tips

1. **Weekly updates** - kaeferjaeger data updates weekly; redownload regularly
2. **Internal domains** - Cloud certs often leak internal domain names
3. **Staging/Dev** - Cloud often hosts staging environments
4. **Combine with ASN** - Cross-reference with ASN enumeration results
