#!/bin/bash
#
# apex-discover.sh - Automated apex domain discovery
#
# Usage: apex-discover.sh <seed-domain> [org-name]
#

set -euo pipefail

SEED_DOMAIN="${1:-}"
ORG_NAME="${2:-}"

if [ -z "$SEED_DOMAIN" ]; then
    echo "Usage: apex-discover.sh <seed-domain> [org-name]"
    echo "Example: apex-discover.sh tesla.com 'Tesla Inc'"
    exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTDIR="apex_${SEED_DOMAIN}_${TIMESTAMP}"
mkdir -p "$OUTDIR"
cd "$OUTDIR"

echo "════════════════════════════════════════════════════════"
echo "🔍 APEX DOMAIN DISCOVERY"
echo "════════════════════════════════════════════════════════"
echo "Seed: $SEED_DOMAIN"
echo "Output: $OUTDIR"
echo ""

# Track discovered organization names for recursive searching
touch discovered-orgs.txt

# Phase 1: Extract WHOIS info if org name not provided
if [ -z "$ORG_NAME" ]; then
    echo "[1/8] Extracting WHOIS information..."
    whois "$SEED_DOMAIN" > whois-raw.txt 2>/dev/null || true
    ORG_NAME=$(grep -iE "^(Registrant Organization|Organization|Org Name)" whois-raw.txt | head -1 | cut -d: -f2- | xargs || echo "")
    REG_EMAIL=$(grep -iE "^(Registrant Email|Admin Email)" whois-raw.txt | head -1 | cut -d: -f2- | xargs || echo "")
    echo "   Organization: ${ORG_NAME:-'Not found'}"
    echo "   Email: ${REG_EMAIL:-'Not found'}"
    
    # Collect all org names from WHOIS
    grep -iE "^(Registrant Organization|Organization|Org Name|Tech Organization|Admin Organization)" whois-raw.txt 2>/dev/null | \
        cut -d: -f2- | xargs -I{} echo "{}" >> discovered-orgs.txt || true
else
    echo "[1/8] Using provided org name: $ORG_NAME"
    echo "$ORG_NAME" >> discovered-orgs.txt
fi

# Phase 2: Reverse WHOIS with knockknock + DomLink
echo ""
echo "[2/6] Reverse WHOIS lookup..."
if command -v knockknock &> /dev/null; then
    if [ -n "$ORG_NAME" ]; then
        knockknock -n "$ORG_NAME" -o domains-whois-org.txt 2>/dev/null || true
    fi
    knockknock -n "$SEED_DOMAIN" -o domains-whois-domain.txt 2>/dev/null || true
    echo "   ✓ knockknock complete"
else
    echo "   ⚠ knockknock not installed (go install github.com/harleo/knockknock@latest)"
fi

# DomLink (WHOXY API) - more comprehensive reverse WHOIS
if ssh -o ConnectTimeout=5 root@207.244.244.11 'test -f ~/tools/DomLink/domLink.py' 2>/dev/null; then
    ssh root@207.244.244.11 "cd ~/tools/DomLink && python3 domLink.py -D $SEED_DOMAIN -o /tmp/domlink-$$.txt 2>/dev/null && cat /tmp/domlink-$$.txt" > domains-domlink.txt 2>/dev/null || true
    echo "   ✓ DomLink (WHOXY) complete"
fi

# Phase 3: Microsoft Tenant Discovery
echo ""
echo "[3/6] Microsoft tenant discovery..."
if [ -f ~/tools/tenn.sh ]; then
    bash ~/tools/tenn.sh -d "$SEED_DOMAIN" -s > domains-tenant.txt 2>/dev/null || true
    echo "   ✓ tenn.sh complete"
elif ssh -o ConnectTimeout=5 root@207.244.244.11 'test -f ~/tools/tenn.sh' 2>/dev/null; then
    ssh root@207.244.244.11 "bash ~/tools/tenn.sh -d $SEED_DOMAIN -s" > domains-tenant.txt 2>/dev/null || true
    echo "   ✓ tenn.sh (via VPS) complete"
else
    echo "   ⚠ tenn.sh not available locally or on VPS"
fi

# Phase 4-5: ASN Discovery (calls AsnRecon skill)
echo ""
echo "[4-5/8] ASN discovery (AsnRecon skill)..."
echo "   ⚠ NOTE: For full ASN recon, invoke AsnRecon skill separately:"
echo "   → AsnRecon will search bgp.he.net for \"$ORG_NAME\""
echo "   → Outputs: asns.txt, ipv4-ranges.txt, domains-asn.txt"
echo "   → Check for additional org names in ASN data"
echo ""
echo "   Running basic amass intel as fallback..."
if [ -n "$ORG_NAME" ] && command -v amass &> /dev/null; then
    timeout 120 amass intel -org "$ORG_NAME" 2>/dev/null | sort -u > domains-asn.txt || true
    echo "   ✓ amass intel complete ($(wc -l < domains-asn.txt 2>/dev/null | xargs || echo 0) domains)"
else
    echo "   ⚠ Skipped (no org name or amass not installed)"
fi

# Phase 5: Certificate Transparency (Organization)
echo ""
echo "[5/7] Certificate transparency (org search)..."
if [ -n "$ORG_NAME" ]; then
    ORG_ENCODED=$(echo "$ORG_NAME" | sed 's/ /+/g')
    curl -s "https://crt.sh/?O=$ORG_ENCODED&output=json" 2>/dev/null | \
        jq -r '.[].common_name' 2>/dev/null | \
        sed 's/\*\.//g' | \
        rev | cut -d. -f1-2 | rev | \
        sort -u > domains-crt.txt || true
    echo "   ✓ crt.sh org search complete"
else
    echo "   ⚠ Skipped (no org name)"
fi

# Phase 6: Amass Intel
echo ""
echo "[6/7] Amass intel..."
if command -v amass &> /dev/null; then
    timeout 300 amass intel -d "$SEED_DOMAIN" -whois 2>/dev/null | \
        rev | cut -d. -f1-2 | rev | sort -u > domains-amass.txt || true
    echo "   ✓ amass intel complete"
else
    echo "   ⚠ amass not installed"
fi

# Phase 7: Aggregate
echo ""
echo "[7/7] Aggregating results..."
cat domains-*.txt domains-domlink.txt 2>/dev/null | \
    tr '[:upper:]' '[:lower:]' | \
    sed 's/\*\.//g' | \
    grep -E '^[a-z0-9]' | \
    rev | cut -d. -f1-2 | rev | \
    sort -u > apex_domains.txt

TOTAL=$(wc -l < apex_domains.txt | xargs)

# Generate report
cat > REPORT.md << EOF
# Apex Domain Discovery Report

**Seed Domain:** $SEED_DOMAIN
**Organization:** ${ORG_NAME:-'Unknown'}
**Date:** $(date)
**Total Apex Domains Found:** $TOTAL

## Source Breakdown

| Source | Count |
|--------|-------|
| Reverse WHOIS (org) | $(wc -l < domains-whois-org.txt 2>/dev/null || echo 0) |
| Reverse WHOIS (domain) | $(wc -l < domains-whois-domain.txt 2>/dev/null || echo 0) |
| DomLink (WHOXY) | $(wc -l < domains-domlink.txt 2>/dev/null || echo 0) |
| Microsoft Tenant | $(wc -l < domains-tenant.txt 2>/dev/null || echo 0) |
| ASN Reverse DNS | $(wc -l < domains-asn.txt 2>/dev/null || echo 0) |
| Certificate Transparency | $(wc -l < domains-crt.txt 2>/dev/null || echo 0) |
| Amass Intel | $(wc -l < domains-amass.txt 2>/dev/null || echo 0) |

## ASN Data

**ASNs Found:** $(wc -l < asns.txt 2>/dev/null || echo 0)
**IPv4 Ranges:** $(wc -l < ipv4-ranges.txt 2>/dev/null || echo 0)

$(cat asns.txt 2>/dev/null | head -10 | while read asn; do echo "- $asn"; done)

## Discovered Domains

$(cat apex_domains.txt | while read d; do echo "- $d"; done)

## Next Steps

1. Run SubdomainEnum on all discovered apex domains:
   \`\`\`bash
   while read d; do subfinder -d "\$d" -all >> all-subs.txt; done < apex_domains.txt
   \`\`\`

2. Verify domains are in scope before testing

3. Check for additional acquisitions at:
   - https://www.crunchbase.com/organization/${SEED_DOMAIN%%.*}
   - Wikipedia acquisitions section
EOF

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ DISCOVERY COMPLETE"
echo "════════════════════════════════════════════════════════"
echo "Found: $TOTAL apex domains"
echo ""
echo "Files:"
echo "  - apex_domains.txt (use with SubdomainEnum)"
echo "  - asns.txt (ASN numbers)"
echo "  - ipv4-ranges.txt (CIDR ranges for scanning)"
echo "  - REPORT.md (summary)"
echo ""
cat apex_domains.txt | head -10
[ "$TOTAL" -gt 10 ] && echo "  ... and $((TOTAL - 10)) more"

# Clean and dedupe discovered org names
sort -u discovered-orgs.txt 2>/dev/null | grep -v "^$" | grep -vi "$ORG_NAME" > other-orgs.txt 2>/dev/null || true
OTHER_ORG_COUNT=$(wc -l < other-orgs.txt 2>/dev/null | xargs || echo "0")

if [ "$OTHER_ORG_COUNT" -gt 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo "🔄 ADDITIONAL ORGANIZATIONS DISCOVERED"
    echo "════════════════════════════════════════════════════════"
    echo "The following org names were found during recon:"
    echo ""
    cat -n other-orgs.txt | head -20 | while read num org; do
        printf "  [%2d] %s\n" "$num" "$org"
    done
    [ "$OTHER_ORG_COUNT" -gt 20 ] && echo "  ... and $((OTHER_ORG_COUNT - 20)) more (see other-orgs.txt)"
    echo ""
    echo "Reply with numbers to search (e.g., '1 3 5' or 'all'):"
    echo ""
fi
echo ""
