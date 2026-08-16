#!/bin/bash
# Extract endpoints from inline JavaScript, data attributes, and JSON configs
# This catches what external .js analysis misses

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <url-or-file> [output-dir]"
    echo ""
    echo "Examples:"
    echo "  $0 https://target.com/page"
    echo "  $0 page.html"
    echo "  $0 urls.txt output/"
    exit 1
fi

INPUT="$1"
OUTPUT_DIR="${2:-.}"
mkdir -p "$OUTPUT_DIR"

extract_from_html() {
    local html="$1"
    local source="$2"
    
    # Extract inline <script> content
    echo "$html" | grep -oP '<script[^>]*>\K.*?(?=</script>)' 2>/dev/null | while read -r script; do
        # Extract URLs/paths from inline JS
        echo "$script" | grep -oE '["'"'"'](/[a-zA-Z0-9/_.-]+)["'"'"']' | tr -d "\"'" 
        echo "$script" | grep -oE '["'"'"'](https?://[^"'"'"']+)["'"'"']' | tr -d "\"'"
        # API patterns
        echo "$script" | grep -oE 'api[Uu]rl["\s:=]+["'"'"']([^"'"'"']+)' | grep -oE '/[^"'"'"']+'
        echo "$script" | grep -oE 'endpoint["\s:=]+["'"'"']([^"'"'"']+)' | grep -oE '/[^"'"'"']+'
        echo "$script" | grep -oE 'baseUrl["\s:=]+["'"'"']([^"'"'"']+)' | grep -oE 'https?://[^"'"'"']+'
    done
    
    # Extract data-* attributes with URLs
    echo "$html" | grep -oE 'data-[a-z-]+="[^"]*"' 2>/dev/null | grep -oE '["'"'"'](/[a-zA-Z0-9/_.-]+|https?://[^"'"'"']+)["'"'"']' | tr -d "\"'"
    
    # Extract JSON configs (<script type="application/json">)
    echo "$html" | grep -oP '<script type="application/json"[^>]*>\K.*?(?=</script>)' 2>/dev/null | while read -r json; do
        echo "$json" | grep -oE '["'"'"'](/[a-zA-Z0-9/_.-]+)["'"'"']' | tr -d "\"'"
        echo "$json" | grep -oE '["'"'"'](https?://[^"'"'"']+)["'"'"']' | tr -d "\"'"
    done
    
    # Extract __NEXT_DATA__ (Next.js)
    echo "$html" | grep -oP '__NEXT_DATA__[^>]*>\K.*?(?=</script>)' 2>/dev/null | while read -r next; do
        echo "$next" | grep -oE '["'"'"'](/[a-zA-Z0-9/_.-]+)["'"'"']' | tr -d "\"'"
    done
    
    # Extract window.__INITIAL_STATE__ or similar
    echo "$html" | grep -oE 'window\.__[A-Z_]+__\s*=\s*{[^}]+}' 2>/dev/null | grep -oE '/[a-zA-Z0-9/_.-]+' 
    
    # Extract onclick/onsubmit handlers
    echo "$html" | grep -oE 'on(click|submit|load)="[^"]*"' 2>/dev/null | grep -oE '["'"'"'](/[a-zA-Z0-9/_.-]+)["'"'"']' | tr -d "\"'"
    
    # Extract form actions
    echo "$html" | grep -oE 'action="[^"]*"' 2>/dev/null | grep -oE '"[^"]*"' | tr -d '"' | grep -E '^/'
    
    # Extract href with API paths
    echo "$html" | grep -oE 'href="(/api[^"]*)"' 2>/dev/null | grep -oE '/api[^"]*'
}

# Process input
if [ -f "$INPUT" ]; then
    # It's a file - could be HTML or list of URLs
    if head -1 "$INPUT" | grep -qE '^https?://'; then
        # It's a URL list
        echo "Processing URL list: $INPUT"
        while read -r url; do
            echo "[*] Fetching: $url"
            html=$(curl -s -L --max-time 10 "$url" 2>/dev/null)
            extract_from_html "$html" "$url"
        done < "$INPUT" | sort -u > "$OUTPUT_DIR/inline-endpoints.txt"
    else
        # It's an HTML file
        echo "Processing HTML file: $INPUT"
        extract_from_html "$(cat "$INPUT")" "$INPUT" | sort -u > "$OUTPUT_DIR/inline-endpoints.txt"
    fi
elif [[ "$INPUT" =~ ^https?:// ]]; then
    # It's a URL
    echo "Fetching: $INPUT"
    html=$(curl -s -L --max-time 10 "$INPUT" 2>/dev/null)
    extract_from_html "$html" "$INPUT" | sort -u > "$OUTPUT_DIR/inline-endpoints.txt"
else
    echo "Error: Input must be a URL, HTML file, or file with URLs"
    exit 1
fi

# Summary
TOTAL=$(wc -l < "$OUTPUT_DIR/inline-endpoints.txt" | tr -d ' ')
echo ""
echo "=== Extracted $TOTAL endpoints ==="
echo "Output: $OUTPUT_DIR/inline-endpoints.txt"

# Show sample
if [ "$TOTAL" -gt 0 ]; then
    echo ""
    echo "Sample:"
    head -10 "$OUTPUT_DIR/inline-endpoints.txt"
fi
