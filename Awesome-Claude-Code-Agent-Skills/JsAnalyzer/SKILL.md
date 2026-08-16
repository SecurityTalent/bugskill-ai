---
name: JsAnalyzer
version: 2.0.0
last_updated: 2026-01-02
author: xssdoctor
description: Static analysis for JavaScript files targeting security vulnerabilities. USE WHEN user says 'analyze js', 'scan javascript', 'find sinks', 'js security', 'analyze these js files', OR user starts Claude in a folder with JS files and wants security analysis. Extracts URLs, paths, sources, sinks, postMessage handlers, secrets, and more.
---

# JsAnalyzer

**Orchestrator-based JS security analysis.** Primary context delegates all heavy work to specialized agents.

---

## Architecture: Orchestrator Pattern

```
PRIMARY CONTEXT (Light Orchestrator)
│
├── Phase 1-3: Spawn in PARALLEL
│   ├── js-grep-analyzer (haiku)  → paths, endpoints
│   ├── js-tool-runner (haiku)    → doctorswzl output
│   └── js-architecture-analyzer (opus) → architecture docs
│
├── Phase 4: Spawn in PARALLEL
│   ├── source-sink-tracer (opus) × N
│   ├── postmessage-analyzer (opus) × N
│   ├── api-investigator (opus) × N
│   └── secrets-analyzer (opus) × 1
│
└── Phase 5: Synthesize (light)
```

**Primary context NEVER:**
- Runs greps directly
- Parses JSON output
- Reads large files for analysis

**Primary context ONLY:**
- Spawns agents
- Waits for results (TaskOutput)
- Creates final summary reports

---

## Workflow Routing

| Trigger | Workflow | Action |
|---------|----------|--------|
| `/js-analyze <domain>` or `/jsa <domain>` | LiveSite.md | Acquire from live site → FullScan |
| `/js-analyze` (in folder with .js files) | FullScan.md | All 5 phases with agents |
| "analyze js files" | Analyze.md | Phases 1-3 only |
| "review findings" | Review.md | Phases 4-5 only |

**Note:** If given a domain/URL, use LiveSite workflow. If in a folder with JS files, use FullScan.

---

## Execution

**When triggered, IMMEDIATELY:**

1. Read workflow: `${PAI_DIR}/skills/JsAnalyzer/workflows/FullScan.md`
2. Execute the orchestrator pattern as specified
3. Spawn agents in parallel where indicated
4. Wait for agents with TaskOutput
5. Create summary reports

---

## Agents Used

| Agent | Model | Purpose |
|-------|-------|---------|
| `js-grep-analyzer` | haiku | Fast grep extraction |
| `js-tool-runner` | haiku | Tool execution |
| `js-architecture-analyzer` | opus | Deep architecture analysis |
| `source-sink-tracer` | opus | Flow tracing |
| `postmessage-analyzer` | opus | postMessage security |
| `api-investigator` | opus | API endpoint analysis |
| `secrets-analyzer` | opus | Credential assessment |

---

## Output Structure

```
./js-analysis/
├── frontend/
│   ├── client-paths.md
│   ├── sources-sinks.md
│   ├── frontend-architecture.md
│   ├── frontend-analysis.md
│   └── frontend-vulnerabilities.md
├── backend/
│   ├── api-paths.md
│   ├── api-architecture.md
│   ├── api-analysis.md
│   └── secrets.md
├── raw/*.json
├── scan-summary.md
└── full-scan-report.md
```

---

## Tool Reference

**doctorswzl** location: `${PAI_DIR}/doctorswzl/`

```bash
cd ${PAI_DIR}/doctorswzl && bun run src/index.ts <file> -o <output.json> -b
```

**jsluice** (for live site acquisition):

```bash
# Install if needed
which jsluice || go install github.com/BishopFox/jsluice/cmd/jsluice@latest

# Extract URLs/endpoints
jsluice urls <file.js> > urls.json

# Extract secrets
jsluice secrets <file.js> > secrets.json
```

Both tools are used: jsluice for initial extraction during LiveSite acquisition, doctorswzl for deep static analysis.

---

## Integration

- **SecurityAudit** - Uses JsAnalyzer as first phase
- **VulnChaining** - Escalates confirmed findings
- **ClientSideAttacks** - Deep-dive on specific vectors

---

## Inline JavaScript Extraction (NEW)

External `.js` files are only part of the story. Many endpoints are hidden in:

- Inline `<script>` blocks
- `data-*` attributes
- `onclick/onsubmit` handlers
- JSON configs (`<script type="application/json">`)
- `__NEXT_DATA__` (Next.js)
- `window.__INITIAL_STATE__` (React/Redux)

### Scripts

```bash
# Single URL or HTML file
~/clawd/skills/JsAnalyzer/scripts/extract-inline-js.sh https://target.com/page

# Batch processing
~/clawd/skills/JsAnalyzer/scripts/extract-inline-batch.sh urls.txt 20 output/
```

### What It Extracts

| Source | Pattern |
|--------|---------|
| Inline `<script>` | `/api/v1/users`, `apiUrl: '/endpoint'` |
| data-* attributes | `data-api="/users"`, `data-endpoint="/fetch"` |
| JSON configs | `{"apiBase": "/v2/"}` |
| Next.js | `__NEXT_DATA__` props with routes |
| React hydration | `window.__INITIAL_STATE__` |
| Event handlers | `onclick="fetch('/api')"` |
| Form actions | `action="/submit"` |

### Integration with Pipeline

The ReconPipeline now includes inline JS extraction as a standard stage:

1. Spider pages → get HTML
2. Extract inline JS from HTML
3. Extract external .js files
4. Run jsluice on external files
5. Combine all discovered endpoints
6. Feed back into spider/ffuf loop

