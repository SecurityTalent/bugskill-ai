# Analyze Workflow

**Purpose:** Phases 1-3 of JsAnalyzer - Independent Claude analysis, tool scanning, and initial file organization. NO deep-dive agents yet.

---

## When to Use

- "Analyze these JS files" (without "deep" or "full scan")
- User wants initial findings without agent deep-dives
- Faster scan when subagent analysis not needed yet

---

## Output File Structure

```
./js-analysis/
├── frontend/
│   ├── client-paths.md           # JUST paths (/redeem, /wholebrain, etc.)
│   ├── frontend-architecture.md  # Framework analysis, design patterns
│   └── sources-sinks.md          # All sources and sinks found
├── backend/
│   ├── api-paths.md              # JUST paths (/api/v2/sso, etc.)
│   ├── api-architecture.md       # API design, auth patterns, philosophy
│   └── secrets.md                # ALL secrets found (API keys, tokens)
├── raw/
│   ├── [file].json               # Per-file tool output
│   └── combined-tool-results.json
└── scan-summary.md               # Statistics only
```

**NOTE:** This workflow does NOT create:
- `frontend-analysis.md` (needs subagent findings)
- `frontend-vulnerabilities.md` (needs subagent confirmation)
- `api-analysis.md` (needs subagent investigation)
- `full-scan-report.md` (only in FullScan workflow)

---

## Execution Steps

### PHASE 1: Independent Claude Analysis

**Step 1: Setup directories**
```bash
TARGET_DIR=$(pwd)
TARGET_NAME=$(basename "$TARGET_DIR")
OUTPUT_DIR="./js-analysis"

mkdir -p "${OUTPUT_DIR}/frontend"
mkdir -p "${OUTPUT_DIR}/backend"
mkdir -p "${OUTPUT_DIR}/raw"
```

**Step 2: Find all JS files**
```bash
find . -type f -name "*.js" \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/vendor/*" \
  ! -path "*/dist/*"
```

**Step 3: Run parallel greps**

Run these in parallel (multiple Grep tool calls in single message):

1. **Client-side paths:**
   - `path=["']/[^"']+["']` - Route definitions
   - `router\.(push|replace)` - Navigation calls
   - `history\.(push|replace)State` - History API
   - `#/[a-zA-Z0-9/_-]+` - Hash routes

2. **API endpoints:**
   - `fetch\(["'\`][^"'\`]*` - Fetch calls
   - `axios\.[a-z]+\(["'\`][^"'\`]*` - Axios calls
   - `['"]/api/[a-zA-Z0-9/_-]+` - API path strings
   - `['"]/v[0-9]+/` - Versioned paths

3. **Sources:**
   - `location\.(hash|search|href|pathname)` - URL sources
   - `postMessage|addEventListener.*message` - postMessage
   - `localStorage|sessionStorage` - Storage sources

4. **Sinks:**
   - `\.html\(` - jQuery .html()
   - `\.innerHTML\s*=` - Direct innerHTML
   - `eval\(` - eval calls
   - `new Function\(` - Function constructor

5. **Secrets:**
   - `['"]\w+[_-]?api[_-]?key["']:\s*["']\w+["']` - API keys
   - `eyJ[a-zA-Z0-9_-]+\.eyJ` - JWT tokens
   - `AKIA[A-Z0-9]{16}` - AWS keys

**Step 4: Create initial files**

`frontend/client-paths.md`:
```markdown
# Client-Side Paths

## Backbone.js Routes
- /redeem
- /activate-code
- /wholebrain
- /wholebrain/:id

## Hash Routes
- #/v4/training
- #/profile
```

`backend/api-paths.md`:
```markdown
# API Endpoints

## Authentication
- POST /api/v2/sso
- POST /api/v2/idplogin
- GET /api/v2/checkpw

## User Management
- GET /api/v2/thealth/{user_id}
- POST /api/v2/set_pw/{user_id}
```

`frontend/sources-sinks.md`:
```markdown
# Sources & Sinks Inventory

## User-Controlled Sources

### URL-Based Sources
| Source | Files | Count | Risk |
|--------|-------|-------|------|
| `window.location.hash` | progperf.js, dash-neu.js | 15 | High |

## Dangerous Sinks

### DOM XSS Sinks
| Sink | Files | Count | Risk |
|------|-------|-------|------|
| `.html()` (jQuery) | All bundles | 150+ | Critical |
```

---

### PHASE 2: Run doctorswzl Tool

**Step 5: Scan each file**
```bash
for file in $(find . -name "*.js" ! -path "*/node_modules/*"); do
  cd ${PAI_DIR}/doctorswzl && \
  bun run src/index.ts "$file" -o "${OUTPUT_DIR}/raw/$(basename $file .js)-$(echo $file | md5).json" -b
done
```

**Step 6: Combine tool results**
```bash
jq -s 'add' ${OUTPUT_DIR}/raw/*.json > ${OUTPUT_DIR}/raw/combined-tool-results.json
```

---

### PHASE 3: Merge & Organize

**Step 7: Merge tool findings with Claude findings**

For each category:
1. Compare Claude grep results vs tool results
2. Add any paths/endpoints tool found that grep missed
3. Update `client-paths.md` and `api-paths.md` with complete lists
4. Update `sources-sinks.md` with additional findings

**Step 8: Extract architecture insights**

Create `frontend/frontend-architecture.md`:
```markdown
# Frontend Architecture Analysis

## Framework & Design Philosophy

### Core Framework
- **Framework:** Backbone.js 1.x
- **Template Engine:** Mustache/Handlebars
- **Build System:** Webpack with eval devtool
- **Module System:** CommonJS

### Architectural Patterns
1. **MVC Pattern** - Backbone.js Model-View-Controller
2. **Router-Based Navigation** - Hash-based routing (#/path)
3. **Event-Driven Communication** - Backbone.Events pub/sub

[Continue with observations from code...]
```

Create `backend/api-architecture.md`:
```markdown
# API Architecture & Design Philosophy

## API Design Patterns

### RESTful Structure
- **Pattern:** `/api/v2/{resource}/{id}/{action}`
- **Versioning:** v2 indicates second major API version
- **Parameter Style:** Query strings for filters, path params for IDs

### Common API Patterns

#### User-Context Pattern
```
/api/v2/{resource}/{user_id}/{action}
```
Used extensively for user-scoped operations. **Security Risk:** Relies on backend validation.

[Continue with observations from code...]
```

Create `backend/secrets.md`:
```markdown
# Secrets Analysis

## Critical Secrets

### 1. Vero Email Marketing API Key
- **File:** `custom-h1.js`
- **Value:** `182caada13016c317a4ecd7836a85892c3f4efdb`
- **Type:** API Key (Vero.io)
- **Risk Level:** 🔴 **CRITICAL**
- **Impact:**
  - Full access to Vero email marketing platform
  - Send emails as BrainHQ to all subscribers
- **Recommended Action:**
  - Rotate immediately
  - Move to environment variables

[Continue with all secrets found...]
```

**Step 9: Create scan-summary.md**

```markdown
# JS Analysis - Scan Summary

**Target:** [TARGET_NAME]
**Date:** [DATE]
**Files Analyzed:** X

## Quick Stats

| Category | Found |
|----------|-------|
| Client Routes | X |
| API Endpoints | Y |
| Sources | A |
| Sinks | B |
| Secrets | C |

## Next Steps

To perform deep analysis with subagents:
- Run "review findings" or "do deep analysis"
- This will spawn agents to trace source→sink flows
- Will investigate API endpoints for IDOR/CSRF
- Will analyze postMessage handlers

## Output Files

```
./js-analysis/
├── frontend/
│   ├── client-paths.md (paths only)
│   ├── frontend-architecture.md (framework analysis)
│   └── sources-sinks.md (inventory)
├── backend/
│   ├── api-paths.md (endpoints only)
│   ├── api-architecture.md (API philosophy)
│   └── secrets.md (credentials found)
├── raw/ (tool outputs)
└── scan-summary.md (this file)
```
```

---

## What This Workflow DOES:

✅ Independent Claude grep analysis
✅ Run doctorswzl tool on all files
✅ Merge and dedupe findings
✅ Extract architecture patterns
✅ Organize paths into simple lists
✅ Create secrets inventory
✅ Generate initial sources/sinks inventory

## What This Workflow DOES NOT DO:

❌ Spawn subagents for deep analysis
❌ Trace source→sink flows
❌ Investigate API endpoints for IDOR
❌ Analyze postMessage handlers in depth
❌ Create vulnerability summaries
❌ Generate PoCs

**For full analysis with agents, use FullScan workflow or run Review workflow next.**

---

## Output to User

Return a concise summary:

```
✅ Analyzed X JavaScript files

📁 Files Created:
  - frontend/client-paths.md - X client routes
  - backend/api-paths.md - Y API endpoints
  - frontend/sources-sinks.md - A sources, B sinks
  - frontend-architecture.md - Framework analysis
  - backend/api-architecture.md - API design patterns
  - backend/secrets.md - C secrets found

⚠️ Critical Findings:
  - [List any critical secrets]
  - [List obvious high-risk patterns]

💡 Next Steps:
  To perform deep analysis with subagents, run:
  "review findings" or "do deep analysis"

All output in: ./js-analysis/
```
