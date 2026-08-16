#!/bin/bash
# Batch 403 Bypass Tester
# Processes multiple URLs in parallel

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <urls-file> [threads]"
    echo "Example: $0 403-urls.txt 5"
    exit 1
fi

URLS_FILE="$1"
THREADS="${2:-3}"
SCRIPT_DIR="$(dirname "$0")"
OUTPUT_DIR="bypass-results-$(date +%Y%m%d-%H%M%S)"

mkdir -p "$OUTPUT_DIR"

echo "=== Batch 403 Bypass Tester ==="
echo "Input: $URLS_FILE"
echo "Threads: $THREADS"
echo "Output: $OUTPUT_DIR/"
echo ""

# Count URLs
TOTAL=$(wc -l < "$URLS_FILE")
echo "Testing $TOTAL URLs..."
echo ""

# Process with xargs for parallelism
cat "$URLS_FILE" | xargs -P "$THREADS" -I {} bash -c '
    url="{}"
    sanitized=$(echo "$url" | sed "s|https\?://||" | tr "/:." "-")
    output_file="'"$OUTPUT_DIR"'/${sanitized}.txt"
    
    echo "[*] Testing: $url"
    '"$SCRIPT_DIR"'/bypass403.sh "$url" > "$output_file" 2>&1
    
    # Check if any bypasses found
    bypasses=$(grep -c "^\[" "$output_file" 2>/dev/null || echo 0)
    if [ "$bypasses" -gt 0 ]; then
        echo "[+] FOUND $bypasses potential bypasses: $url"
    fi
'

echo ""
echo "=== Summary ==="
echo "Results saved to: $OUTPUT_DIR/"

# Aggregate findings
echo ""
echo "URLs with potential bypasses:"
grep -l "\[200\]\|\[301\]\|\[302\]\|\[401\]\|\[500\]" "$OUTPUT_DIR"/*.txt 2>/dev/null | while read f; do
    basename "$f" .txt | tr "-" "."
done

echo ""
echo "Done!"
