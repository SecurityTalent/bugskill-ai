---
name: bac-analyzer
description: Passive traffic analyzer that examines captured HTTP traffic (HAR, Caido JSON, Burp XML) to identify potential Broken Access Control (BAC) and Insecure Direct Object Reference (IDOR) vulnerabilities. USE WHEN user mentions analyze traffic, check for IDOR, BAC analysis, analyze HAR, analyze Caido, broken access control, or IDOR scan.
---

# BAC Analyzer - Passive Traffic Analysis for IDOR/BAC Vulnerabilities

## Triggers
- "analyze traffic"
- "check for IDOR"
- "BAC analysis"
- "analyze HAR"
- "analyze Caido"
- "broken access control"
- "IDOR scan"

## Description
Passive traffic analyzer that examines captured HTTP traffic (HAR, Caido JSON, Burp XML) to identify potential Broken Access Control (BAC) and Insecure Direct Object Reference (IDOR) vulnerabilities. Generates test cases and reports.

## Input Formats
- **HAR** - HTTP Archive format (browser DevTools, Caido export)
- **Caido JSON** - Native Caido export format
- **Burp XML** - Burp Suite proxy history export
- **Caido API** - Direct pull from running Caido instance

## Installation
```bash
# No external dependencies required - uses Python stdlib
chmod +x ~/.openclaw/workspace/skills/bac-analyzer/scripts/*.sh
chmod +x ~/.openclaw/workspace/skills/bac-analyzer/scripts/*.py

# Optional: Add to PATH
export PATH="$PATH:~/.openclaw/workspace/skills/bac-analyzer/scripts"
```

## Usage

### Basic Analysis
```bash
# Analyze HAR file
./analyze.sh traffic.har

# Analyze Caido export
./analyze.sh caido-export.json

# Analyze Burp XML
./analyze.sh burp-history.xml
```

### Options
```bash
# Generate HTML report
./analyze.sh traffic.har -o report.html

# Tests only (no full report)
./analyze.sh traffic.har --tests-only

# JSON output
./analyze.sh traffic.har --json -o results.json

# Pull from Caido API (requires CAIDO_URL env var)
./analyze.sh --caido

# Verbose output
./analyze.sh traffic.har -v
```

### Direct Script Usage
```bash
# Parse specific format
python3 parse-har.py input.har -o parsed.json

# Detect IDs in parsed traffic
python3 detect-ids.py parsed.json -o ids.json

# Extract auth contexts
python3 extract-auth.py parsed.json -o auth.json

# Generate test cases
python3 generate-tests.py ids.json auth.json -o tests.json

# Generate HTML report
python3 report.py results.json -o report.html
```

## What It Detects

### ID Patterns
- **Integer IDs**: `/users/123`, `?user_id=456`
- **UUIDs**: `/docs/550e8400-e29b-41d4-a716-446655440000`
- **MongoDB ObjectIds**: `/items/507f1f77bcf86cd799439011`
- **Base64 Encoded**: `/api/dXNlcl8xMjM=` (decodes to `user_123`)
- **Short Hashes**: `/files/a1b2c3d4`
- **Composite IDs**: `/org/123/user/456`

### High-Value Parameters
Automatically flags these sensitive parameters:
- user_id, userId, uid, account_id, accountId
- order_id, orderId, transaction_id
- document_id, file_id, invoice_id
- customer_id, member_id, profile_id
- ssn, tin, dob (PII fields)

### Auth Context
Extracts and groups requests by:
- Bearer tokens (Authorization header)
- Session cookies (JSESSIONID, PHPSESSID, etc.)
- API keys (X-API-Key, api_key parameter)
- Custom auth headers

## Test Cases Generated

### 1. Auth-Switch Tests
Replace auth context A with context B on sensitive endpoints:
```
Original: GET /users/123 [Token: user_a_token]
Test:     GET /users/123 [Token: user_b_token]
```

### 2. Method Switching
Test alternate HTTP methods:
```
Original: GET /api/users/123
Tests:    POST /api/users/123
          PUT /api/users/123
          DELETE /api/users/123
          PATCH /api/users/123
```

### 3. Parameter Pollution
Duplicate parameters with different values:
```
Original: ?user_id=123
Tests:    ?user_id=123&user_id=456
          ?user_id[]=123&user_id[]=456
```

### 4. 403 Bypass
When endpoint returns 403, generate bypass payloads:
```
/admin        -> /admin/
/admin        -> /admin%20
/admin        -> /admin%00
/admin        -> /ADMIN
/admin        -> /admin/.
/admin        -> //admin//
... (77+ bypass patterns)
```

### 5. Actuator Checks
If Spring Boot detected, probe for actuator endpoints:
```
/actuator/health
/actuator/env
/actuator/heapdump
/actuator/loggers
...
```

## Output

### Console Output
```
[*] Parsed 1,234 requests from traffic.har
[*] Detected 45 unique ID patterns
[*] Found 3 auth contexts
[*] Identified 89 high-risk endpoints

=== HIGH RISK ENDPOINTS ===
[CRITICAL] GET /api/users/{id}/profile
  - Integer ID in path
  - Contains PII fields in response
  - 3 different auth contexts observed

[HIGH] POST /api/orders/{id}/cancel
  - UUID in path
  - State-changing operation
  - No apparent auth check

=== GENERATED TEST CASES ===
Total: 234 test cases
- Auth-switch: 89
- Method switching: 67
- Parameter pollution: 45
- 403 bypass: 23
- Actuator checks: 10
```

### HTML Report
Interactive report with:
- Summary dashboard
- Risk-categorized endpoint list
- Copy-paste curl commands
- Filterable test cases
- Export to JSON/CSV

## Integration with Research

Loads techniques from `~/.openclaw/workspace/data/idor-research/`:
- `practitioner-techniques.json` - Expert IDOR hunting patterns
- `403-bypass-research.json` - Bypass methodology research
- `403bypass.md` - URL manipulation payloads
- `actuators.md` - Spring Boot actuator wordlist

## Environment Variables
```bash
# Caido API (optional)
export CAIDO_URL="http://localhost:8080"
export CAIDO_API_KEY="your-api-key"

# Report output directory
export BAC_OUTPUT_DIR="/path/to/reports"
```

## Example Workflow

```bash
# 1. Export traffic from Caido/Burp/Browser
# 2. Run analysis
./analyze.sh traffic.har -o report.html

# 3. Review high-risk endpoints
# 4. Execute generated test cases
# 5. Verify findings manually
```

## Notes
- This is PASSIVE analysis - no requests sent to target
- Always verify findings manually before reporting
- Test cases are suggestions, not confirmed vulnerabilities
- Some patterns may produce false positives
