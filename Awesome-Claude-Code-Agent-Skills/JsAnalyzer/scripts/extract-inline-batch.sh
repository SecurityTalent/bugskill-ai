#!/bin/bash
# Batch inline JS extraction with parallelization

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <urls-file> [threads] [output-dir]"
    exit 1
fi

URLS_FILE="$1"
THREADS="${2:-20}"
OUTPUT_DIR="${3:-inline-js-results}"
SCRIPT_DIR="$(dirname "$0")"

mkdir -p "$OUTPUT_DIR"

TOTAL=$(wc -l < "$URLS_FILE" | tr -d ' ')
echo "=== Batch Inline JS Extraction ==="
echo "URLs: $TOTAL"
echo "Threads: $THREADS"
echo "Output: $OUTPUT_DIR/"
echo ""

# Process in parallel
cat "$URLS_FILE" | xargs -P "$THREADS" -I {} bash -c '
    url="{}"
    hash=$(echo "$url" | md5sum | cut -c1-10)
    outfile="'"$OUTPUT_DIR"'/${hash}.txt"
    
    # Skip if done
    [ -f "$outfile" ] && exit 0
    
    # Fetch and extract
    html=$(curl -s -L --max-time 10 "$url" 2>/dev/null)
    
    # Extract all endpoint patterns
    {
        # Inline scripts
        echo "$html" | grep -oP "<script[^>]*>\K.*?(?=</script>)" 2>/dev/null | \
            grep -oE "[\x27\x22](/[a-zA-Z0-9/_.-]+)[\x27\x22]" | tr -d "\x27\x22"
        
        # data-* attributes
        echo "$html" | grep -oE "data-[a-z-]+=\"[^\"]*\"" 2>/dev/null | \
            grep -oE "/[a-zA-Z0-9/_.-]+"
        
        # JSON configs
        echo "$html" | grep -oE "\"/[a-zA-Z0-9/_.-]+\"" | tr -d "\""
        
        # API patterns in any context
        echo "$html" | grep -oE "/api/[a-zA-Z0-9/_.-]+" 
        echo "$html" | grep -oE "/v[0-9]+/[a-zA-Z0-9/_.-]+"
        
    } | sort -u > "$outfile" 2>/dev/null
    
    count=$(wc -l < "$outfile" 2>/dev/null || echo 0)
    [ "$count" -gt 0 ] && echo "[+] $url: $count endpoints"
'

# Aggregate
echo ""
echo "Aggregating results..."
cat "$OUTPUT_DIR"/*.txt 2>/dev/null | sort -u > "$OUTPUT_DIR/all-inline-endpoints.txt"

TOTAL_FOUND=$(wc -l < "$OUTPUT_DIR/all-inline-endpoints.txt" | tr -d ' ')
echo ""
echo "=== Complete ==="
echo "Total unique endpoints: $TOTAL_FOUND"
echo "Output: $OUTPUT_DIR/all-inline-endpoints.txt"
