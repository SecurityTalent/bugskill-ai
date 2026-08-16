#!/bin/bash
#
# analyze.sh - Main entry point for BAC Analyzer
# Analyzes traffic captures for IDOR/BAC vulnerabilities
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
TEMP_DIR=$(mktemp -d)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Cleanup on exit
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Print banner
banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║     BAC Analyzer - IDOR/BAC Detection      ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Usage
usage() {
    echo "Usage: $0 [OPTIONS] <input_file>"
    echo ""
    echo "Analyze traffic captures for IDOR/BAC vulnerabilities."
    echo ""
    echo "Input formats:"
    echo "  .har       HAR (HTTP Archive) file"
    echo "  .json      Caido JSON export"
    echo "  .xml       Burp Suite XML export"
    echo ""
    echo "Options:"
    echo "  --caido        Fetch from Caido API instead of file"
    echo "  -o, --output   Output report file (HTML or JSON)"
    echo "  --json         Output JSON instead of HTML"
    echo "  --tests-only   Generate test cases only, no report"
    echo "  --curl         Include curl commands in output"
    echo "  --min-risk     Minimum risk level (low/medium/high/critical)"
    echo "  -v, --verbose  Verbose output"
    echo "  -h, --help     Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 traffic.har"
    echo "  $0 traffic.har -o report.html"
    echo "  $0 --caido -o report.html"
    echo "  $0 burp-export.xml --tests-only -o tests.json"
    exit 1
}

# Detect input type
detect_type() {
    local file="$1"
    local ext="${file##*.}"
    
    case "$ext" in
        har)
            echo "har"
            ;;
        json)
            # Could be HAR or Caido
            if grep -q '"log"' "$file" 2>/dev/null || grep -q '"entries"' "$file" 2>/dev/null; then
                echo "har"
            else
                echo "caido"
            fi
            ;;
        xml)
            echo "burp"
            ;;
        *)
            # Try to detect from content
            if head -c 100 "$file" | grep -q '<?xml'; then
                echo "burp"
            elif head -c 100 "$file" | grep -q '"log"'; then
                echo "har"
            else
                echo "caido"
            fi
            ;;
    esac
}

# Parse arguments
INPUT_FILE=""
OUTPUT_FILE=""
FROM_CAIDO=false
OUTPUT_JSON=false
TESTS_ONLY=false
INCLUDE_CURL=false
MIN_RISK="medium"
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --caido)
            FROM_CAIDO=true
            shift
            ;;
        --json)
            OUTPUT_JSON=true
            shift
            ;;
        --tests-only)
            TESTS_ONLY=true
            shift
            ;;
        --curl)
            INCLUDE_CURL=true
            shift
            ;;
        --min-risk)
            MIN_RISK="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            INPUT_FILE="$1"
            shift
            ;;
    esac
done

# Validate inputs
if [[ -z "$INPUT_FILE" && "$FROM_CAIDO" == false ]]; then
    usage
fi

if [[ -n "$INPUT_FILE" && ! -f "$INPUT_FILE" ]]; then
    echo -e "${RED}[!] File not found: $INPUT_FILE${NC}"
    exit 1
fi

# Start
banner

VERBOSE_FLAG=""
if [[ "$VERBOSE" == true ]]; then
    VERBOSE_FLAG="-v"
fi

# Step 1: Parse traffic
echo -e "${BLUE}[1/4]${NC} Parsing traffic..."

PARSED_FILE="$TEMP_DIR/parsed.json"

if [[ "$FROM_CAIDO" == true ]]; then
    echo -e "      Fetching from Caido API..."
    python3 "$SCRIPT_DIR/parse-caido.py" --api $VERBOSE_FLAG -o "$PARSED_FILE"
else
    INPUT_TYPE=$(detect_type "$INPUT_FILE")
    echo -e "      Detected format: ${CYAN}$INPUT_TYPE${NC}"
    
    case "$INPUT_TYPE" in
        har)
            python3 "$SCRIPT_DIR/parse-har.py" "$INPUT_FILE" $VERBOSE_FLAG -o "$PARSED_FILE"
            ;;
        caido)
            python3 "$SCRIPT_DIR/parse-caido.py" "$INPUT_FILE" $VERBOSE_FLAG -o "$PARSED_FILE"
            ;;
        burp)
            python3 "$SCRIPT_DIR/parse-burp.py" "$INPUT_FILE" $VERBOSE_FLAG -o "$PARSED_FILE"
            ;;
    esac
fi

TOTAL_REQUESTS=$(python3 -c "import json; print(json.load(open('$PARSED_FILE'))['meta']['total_requests'])")
echo -e "      ${GREEN}✓${NC} Parsed ${CYAN}$TOTAL_REQUESTS${NC} requests"

# Step 2: Detect IDs
echo -e "${BLUE}[2/4]${NC} Detecting ID patterns..."

IDS_FILE="$TEMP_DIR/ids.json"
python3 "$SCRIPT_DIR/detect-ids.py" "$PARSED_FILE" $VERBOSE_FLAG --min-risk "$MIN_RISK" -o "$IDS_FILE"

TOTAL_IDS=$(python3 -c "import json; print(json.load(open('$IDS_FILE'))['meta']['total_endpoints_with_ids'])")
echo -e "      ${GREEN}✓${NC} Found ${CYAN}$TOTAL_IDS${NC} endpoints with IDs"

# Step 3: Extract auth contexts
echo -e "${BLUE}[3/4]${NC} Extracting auth contexts..."

AUTH_FILE="$TEMP_DIR/auth.json"
python3 "$SCRIPT_DIR/extract-auth.py" "$PARSED_FILE" $VERBOSE_FLAG -o "$AUTH_FILE"

TOTAL_CONTEXTS=$(python3 -c "import json; print(json.load(open('$AUTH_FILE'))['meta']['total_contexts'])")
echo -e "      ${GREEN}✓${NC} Found ${CYAN}$TOTAL_CONTEXTS${NC} auth contexts"

# Step 4: Generate tests
echo -e "${BLUE}[4/4]${NC} Generating test cases..."

TESTS_FILE="$TEMP_DIR/tests.json"
CURL_FLAG=""
if [[ "$INCLUDE_CURL" == true ]]; then
    CURL_FLAG="--curl"
fi

python3 "$SCRIPT_DIR/generate-tests.py" "$IDS_FILE" "$AUTH_FILE" $VERBOSE_FLAG $CURL_FLAG --min-risk "$MIN_RISK" -o "$TESTS_FILE"

TOTAL_TESTS=$(python3 -c "import json; print(json.load(open('$TESTS_FILE'))['meta']['total_test_cases'])")
echo -e "      ${GREEN}✓${NC} Generated ${CYAN}$TOTAL_TESTS${NC} test cases"

# Output
echo ""

if [[ "$TESTS_ONLY" == true ]]; then
    # Just output tests
    if [[ -n "$OUTPUT_FILE" ]]; then
        cp "$TESTS_FILE" "$OUTPUT_FILE"
        echo -e "${GREEN}[✓]${NC} Test cases written to: ${CYAN}$OUTPUT_FILE${NC}"
    else
        cat "$TESTS_FILE"
    fi
elif [[ "$OUTPUT_JSON" == true ]]; then
    # Output combined JSON
    COMBINED_FILE="$TEMP_DIR/combined.json"
    python3 -c "
import json
parsed = json.load(open('$PARSED_FILE'))
ids = json.load(open('$IDS_FILE'))
auth = json.load(open('$AUTH_FILE'))
tests = json.load(open('$TESTS_FILE'))
combined = {
    'meta': tests['meta'],
    'parsed_requests': parsed['meta']['total_requests'],
    'endpoints_with_ids': ids['meta']['total_endpoints_with_ids'],
    'auth_contexts': auth['meta']['total_contexts'],
    'test_groups': tests['test_groups']
}
json.dump(combined, open('$COMBINED_FILE', 'w'), indent=2)
"
    if [[ -n "$OUTPUT_FILE" ]]; then
        cp "$COMBINED_FILE" "$OUTPUT_FILE"
        echo -e "${GREEN}[✓]${NC} Results written to: ${CYAN}$OUTPUT_FILE${NC}"
    else
        cat "$COMBINED_FILE"
    fi
else
    # Generate HTML report
    if [[ -n "$OUTPUT_FILE" ]]; then
        python3 "$SCRIPT_DIR/report.py" "$TESTS_FILE" $VERBOSE_FLAG -o "$OUTPUT_FILE"
        echo -e "${GREEN}[✓]${NC} Report written to: ${CYAN}$OUTPUT_FILE${NC}"
    else
        python3 "$SCRIPT_DIR/report.py" "$TESTS_FILE" $VERBOSE_FLAG
    fi
fi

# Print summary
echo ""
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo -e "              ${GREEN}Analysis Complete${NC}"
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo -e "  Requests analyzed:   ${CYAN}$TOTAL_REQUESTS${NC}"
echo -e "  Endpoints with IDs:  ${CYAN}$TOTAL_IDS${NC}"
echo -e "  Auth contexts:       ${CYAN}$TOTAL_CONTEXTS${NC}"
echo -e "  Test cases:          ${CYAN}$TOTAL_TESTS${NC}"
echo -e "${CYAN}════════════════════════════════════════════${NC}"
