# LiveSite Workflow

**Purpose:** Acquire JavaScript files from a live website, then run full analysis.

**Origin:** Merged from legacy `jsa` skill - adds live browser acquisition to JsAnalyzer.

---

## When to Use

- `/js-analyze <domain>` or `/jsa <domain>`
- "Analyze JS on example.com"
- "Scan this site's JavaScript"
- Any time you have a URL/domain instead of local files

---

## Architecture

```
PRIMARY CONTEXT (Orchestrator)
│
├── PHASE 0: Acquisition (this workflow)
│   ├── Navigate to site via Chrome DevTools MCP
│   ├── Wait for page load
│   ├── Discover all loaded JS files
│   ├── Download JS files to target directory
│   └── Run jsluice for initial extraction
│
└── PHASE 1-5: Delegate to FullScan.md
    └── (Standard orchestrator analysis)
```

---

## Workflow Execution

### Input Parsing

```bash
# Parse domain from input
DOMAIN="${1}"
DOMAIN_CLEAN=$(echo "$DOMAIN" | sed 's|https\?://||' | sed 's|/.*||')
TARGET_DIR="/tmp/jsa-analysis/${DOMAIN_CLEAN}"

# Setup directories
mkdir -p "${TARGET_DIR}/js"
mkdir -p "${TARGET_DIR}/jsluice"
mkdir -p "${TARGET_DIR}/raw"
```

---

### PHASE 0.1: Tool Check

```bash
# Check jsluice
which jsluice || go install github.com/BishopFox/jsluice/cmd/jsluice@latest

# Check doctorswzl
ls ${PAI_DIR}/doctorswzl/src/index.ts || echo "Warning: doctorswzl not found"
```

---

### PHASE 0.2: Navigate to Site

Use Chrome DevTools MCP to navigate:

```javascript
// Navigate to target
mcp__chrome-devtools__navigate({ url: "https://${DOMAIN}" })

// Wait for page load (8-10 seconds for full render)
await sleep(10000)
```

---

### PHASE 0.3: Discover JavaScript Files

```javascript
// Get all network requests, filter for scripts
const requests = mcp__chrome-devtools__list_network_requests({
  resourceTypes: ["script"]
})

// Prioritize main application JS:
// - main.js, app.js, bundle.js, chunk-*.js
// - vendor.js, runtime.js
// - Files from same origin
// Skip: analytics, ads, tracking, third-party widgets
```

---

### PHASE 0.4: Download JavaScript Files

For each discovered JS file (top 15-20 most relevant):

```bash
# Download with curl, preserve filename
curl -sL "${JS_URL}" -o "${TARGET_DIR}/js/${FILENAME}"
```

**Prioritization:**
1. Same-origin scripts (highest priority)
2. Main bundles (main, app, bundle, chunk)
3. API/auth related (api.js, auth.js)
4. Vendor bundles (if from same domain)

**Skip:**
- Google Analytics, Tag Manager
- Facebook SDK, Twitter widgets
- Ad networks, tracking pixels
- CDN-hosted common libraries (jQuery CDN, etc.)

---

### PHASE 0.5: Run jsluice Extraction

```bash
cd "${TARGET_DIR}/js"

for file in *.js; do
  basename=$(basename "$file" .js)
  
  # Extract URLs/endpoints
  jsluice urls "$file" > "../jsluice/${basename}_urls.json" 2>&1
  
  # Extract secrets
  jsluice secrets "$file" > "../jsluice/${basename}_secrets.json" 2>&1
done

# Combine jsluice output
cat ../jsluice/*_urls.json | jq -s 'add' > "../raw/jsluice-combined.json" 2>/dev/null
```

---

### PHASE 0.6: Extract Inline Scripts

```javascript
// Use Chrome DevTools to get inline scripts
const inlineScripts = mcp__chrome-devtools__evaluate_script({
  script: `
    Array.from(document.querySelectorAll('script:not([src])'))
      .map((s, i) => ({ index: i, content: s.textContent }))
      .filter(s => s.content.length > 100)
  `
})

// Save inline scripts for analysis
for (const script of inlineScripts) {
  writeFile("${TARGET_DIR}/js/inline-${script.index}.js", script.content)
}
```

---

### PHASE 0.7: Create Acquisition Report

Create `${TARGET_DIR}/acquisition.md`:

```markdown
# JavaScript Acquisition Report

**Domain:** ${DOMAIN}
**Date:** ${DATE}
**Files Downloaded:** ${COUNT}

## Downloaded Files
| File | Size | Source |
|------|------|--------|
| main.bundle.js | 245KB | Same-origin |
| vendor.chunk.js | 180KB | Same-origin |
| ... | ... | ... |

## Skipped Files
- analytics.js (tracking)
- gtm.js (Google Tag Manager)
- ...

## jsluice Summary
- Endpoints found: X
- Secrets found: Y
- Patterns found: Z

## Next Steps
Run full analysis with: FullScan.md
```

---

### PHASE 1-5: Delegate to FullScan

After acquisition, hand off to standard FullScan workflow:

```javascript
// Now run full analysis on downloaded files
// Set TARGET_DIR for FullScan
exec("FullScan.md with TARGET_DIR=${TARGET_DIR}/js")
```

The FullScan workflow will:
1. Run parallel analysis agents (Phase 1-3)
2. Extract client paths (Phase 3.5)
3. Deep-dive analysis (Phase 4)
4. Synthesize reports (Phase 5)

---

## Output Structure

After full workflow completes:

```
/tmp/jsa-analysis/${DOMAIN_CLEAN}/
├── js/                           # Downloaded JavaScript files
├── jsluice/                      # jsluice per-file output
├── raw/
│   ├── jsluice-combined.json     # Combined jsluice output
│   └── *.json                    # doctorswzl output
├── acquisition.md                # Acquisition report
├── js-analysis/                  # Standard FullScan output
│   ├── frontend/
│   ├── backend/
│   ├── scan-summary.md
│   └── full-scan-report.md
└── report.md                     # Legacy-style combined report
```

---

## Legacy Compatibility

For users familiar with old `/jsa` command, also generate legacy report format:

Create `${TARGET_DIR}/report.md` with sections:
1. APPLICATION OVERVIEW
2. API ARCHITECTURE & ROUTES
3. CODE OBFUSCATION ANALYSIS
4. AUTHENTICATION & AUTHORIZATION
5. XSS & DOM VULNERABILITY ANALYSIS (with file:line citations)
6. ENDPOINT DOCUMENTATION & cURL COMMANDS
7. COMPLETE ENDPOINT LIST
8. SECURITY FINDINGS & RECOMMENDATIONS
9. JSLUICE FINDINGS SUMMARY
10. SUMMARY

---

## cURL Command Generation

For each discovered API endpoint, generate working cURL commands:

```bash
# GET endpoint
curl -X GET "https://${DOMAIN}/api/users" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# POST endpoint
curl -X POST "https://${DOMAIN}/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

Include auth headers based on detected auth patterns (Bearer, Cookie, API key).

---

## Error Handling

| Issue | Action |
|-------|--------|
| Chrome not running | Report error, suggest starting Chrome with remote debugging |
| Domain unreachable | Report clearly, exit gracefully |
| No JS files found | Check for SPA, try waiting longer |
| jsluice not installed | Auto-install via go install |
| Download fails | Try alternative URL, report partial results |

---

## Integration

This workflow integrates the best of both approaches:
- **jsa legacy**: Live site acquisition, jsluice, cURL generation
- **JsAnalyzer modern**: Orchestrator pattern, parallel agents, deep analysis

Use `/jsa <domain>` or `/js-analyze <domain>` interchangeably.
