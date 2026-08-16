# FullScan Workflow

**Purpose:** Complete JS security analysis using parallel subagents for all phases.

**Key Change:** Primary context is now an ORCHESTRATOR only. All heavy analysis is delegated to specialized agents.

---

## When to Use

- `/js-analyze` command
- "Analyze all the JS files"
- "Do a full JS security scan"
- Starting fresh investigation on a new target

---

## Architecture: Orchestrator Pattern

```
PRIMARY CONTEXT (Orchestrator - Light)
│
├── PHASE 1-3: Spawn analysis agents IN PARALLEL
│   ├── js-grep-analyzer (haiku)  → api-paths.md, sources-sinks-raw.md
│   ├── js-tool-runner (haiku)    → raw/*.json, sources-sinks.md
│   └── js-architecture-analyzer (opus) → *-architecture.md
│
├── Wait for Phase 1-3 agents (TaskOutput)
│
├── PHASE 3.5: Client Path Extraction (EXHAUSTIVE)
│   └── client-path-extractor (opus) → client-paths.md
│       (reads JS files, tool output, grep output - finds EVERY path)
│
├── Wait for client-path-extractor (TaskOutput)
│
├── PHASE 4: Spawn deep-dive agents IN PARALLEL
│   ├── source-sink-tracer (opus) × N flows
│   ├── postmessage-analyzer (opus) × N handlers
│   ├── api-investigator (opus) × N endpoints
│   └── secrets-analyzer (opus) × 1
│
├── Wait for Phase 4 agents (TaskOutput)
│
└── PHASE 5: Synthesize reports (light - just reading summaries)
```

---

## Output File Structure

```
./js-analysis/
├── frontend/
│   ├── client-paths.md           # From client-path-extractor (EXHAUSTIVE)
│   ├── sources-sinks.md          # From js-tool-runner
│   ├── frontend-architecture.md  # From js-architecture-analyzer
│   ├── frontend-analysis.md      # From Phase 4 agents
│   └── frontend-vulnerabilities.md # From Phase 5 synthesis
├── backend/
│   ├── api-paths.md              # From js-grep-analyzer
│   ├── api-architecture.md       # From js-architecture-analyzer
│   ├── api-analysis.md           # From Phase 4 agents
│   └── secrets.md                # From secrets-analyzer
├── raw/
│   ├── *.json                    # From js-tool-runner
│   └── combined-tool-results.json
├── scan-summary.md               # Statistics only
└── full-scan-report.md           # Executive summary
```

---

## Workflow Execution

### SETUP

```bash
TARGET_DIR="${1:-.}"
OUTPUT_DIR="./js-analysis"

mkdir -p "${OUTPUT_DIR}/frontend"
mkdir -p "${OUTPUT_DIR}/backend"
mkdir -p "${OUTPUT_DIR}/raw"
```

---

### PHASE 1-3: Parallel Analysis Agents

**Launch ALL THREE agents in a SINGLE message:**

```javascript
// Agent 1: Grep Analysis (haiku) - API paths and sources/sinks only
Task(
  subagent_type: "js-grep-analyzer",
  model: "haiku",
  prompt: `Analyze JavaScript files in ${TARGET_DIR}

  OUTPUT DIRECTORY: ${OUTPUT_DIR}

  Create these files:
  - backend/api-paths.md (deduplicated API endpoints)
  - frontend/sources-sinks-raw.md (initial sources/sinks inventory)

  NOTE: Do NOT create client-paths.md - a specialized agent handles that.

  Run parallel greps for: API endpoints, sources, sinks, secrets.
  Deduplicate and categorize results.`
)

// Agent 2: Tool Runner (haiku)
Task(
  subagent_type: "js-tool-runner",
  model: "haiku",
  prompt: `Run doctorswzl on JavaScript files in ${TARGET_DIR}

  OUTPUT DIRECTORY: ${OUTPUT_DIR}

  Create these files:
  - raw/*.json (per-file tool output)
  - raw/combined-tool-results.json (merged)
  - frontend/sources-sinks.md (enhanced inventory)

  Tool location: ${PAI_DIR}/doctorswzl/
  Usage: cd ${PAI_DIR}/doctorswzl && bun run src/index.ts <file> -o <output.json> -b`
)

// Agent 3: Architecture Analyzer (opus)
Task(
  subagent_type: "js-architecture-analyzer",
  model: "opus",
  prompt: `Analyze JavaScript architecture in ${TARGET_DIR}

  OUTPUT DIRECTORY: ${OUTPUT_DIR}

  Create these files:
  - frontend/frontend-architecture.md
  - backend/api-architecture.md

  Identify: framework, build system, routing, state management, auth patterns.
  Document security-relevant design decisions.`
)
```

**Wait for all three agents:**
```javascript
TaskOutput(agent1_id, block: true)
TaskOutput(agent2_id, block: true)
TaskOutput(agent3_id, block: true)
```

---

### PHASE 3.5: Exhaustive Client Path Extraction

**This is critical - spawn dedicated agent to find EVERY client-side path:**

```javascript
// Client Path Extractor (opus) - EXHAUSTIVE search
Task(
  subagent_type: "client-path-extractor",
  model: "opus",
  prompt: `Extract EVERY SINGLE client-side path from ${TARGET_DIR}

  OUTPUT DIRECTORY: ${OUTPUT_DIR}
  OUTPUT FILE: frontend/client-paths.md

  You MUST search ALL sources:
  1. Read ALL JavaScript files directly
  2. Read raw/combined-tool-results.json for tool findings
  3. Read frontend/sources-sinks-raw.md for grep findings
  4. Read frontend/frontend-architecture.md for routing info

  Find EVERY:
  - Static routes (/path, /path/subpath)
  - Dynamic routes (/:id, /[slug])
  - Hash routes (#/path)
  - Programmatic navigation (history.push, router.navigate)
  - React Router, Next.js, Vue Router, Backbone routes
  - Any path a user could navigate to

  Be EXHAUSTIVE. Miss NOTHING. Deduplicate and alphabetize.`
)
```

**Wait for client path extractor:**
```javascript
TaskOutput(client_path_agent_id, block: true)
```

---

### PHASE 4: Deep-Dive Agents

**Read the outputs from Phase 1-3.5 to identify targets:**

1. Read `frontend/sources-sinks.md` → identify high-risk source→sink flows
2. Read `frontend/client-paths.md` → identify interesting routes
3. Read `backend/api-paths.md` → identify critical API endpoints

**Launch deep-dive agents IN PARALLEL (single message):**

```javascript
// Source→Sink Tracers (opus) - One per high-risk flow
Task(
  subagent_type: "source-sink-tracer",
  model: "opus",
  prompt: `Trace data flow: [SOURCE] → [SINK] in [FILE]

  Read the source file, trace how user input flows to the sink.
  Check for sanitization, encoding, validation.
  Determine exploitability and create PoC if exploitable.

  Append findings to: ${OUTPUT_DIR}/frontend/frontend-analysis.md`
)

// PostMessage Analyzers (opus) - One per handler
Task(
  subagent_type: "postmessage-analyzer",
  model: "opus",
  prompt: `Analyze postMessage handler in [FILE]:[LINE]

  Check origin validation, trace event.data usage.
  Identify exploitable patterns.

  Append findings to: ${OUTPUT_DIR}/frontend/frontend-analysis.md`
)

// API Investigators (opus) - One per critical endpoint
Task(
  subagent_type: "api-investigator",
  model: "opus",
  prompt: `Investigate API endpoint: [METHOD] [PATH]

  Find usage in code, document parameters, assess IDOR/CSRF risk.

  Append findings to: ${OUTPUT_DIR}/backend/api-analysis.md`
)

// Secrets Analyzer (opus) - One for all secrets
Task(
  subagent_type: "secrets-analyzer",
  model: "opus",
  prompt: `Analyze secrets found in ${TARGET_DIR}

  Read raw/combined-tool-results.json for secrets.
  Classify each: API key, JWT, AWS creds, etc.
  Assess risk and impact of each.

  Write to: ${OUTPUT_DIR}/backend/secrets.md`
)
```

**Wait for all Phase 4 agents:**
```javascript
// Use TaskOutput with block: true for each agent
```

---

### PHASE 5: Synthesize Reports

**This is lightweight - just reading agent outputs and creating summaries.**

#### Create `frontend/frontend-vulnerabilities.md`

Read `frontend/frontend-analysis.md` and summarize:
- Group by severity (Critical, High, Medium, Low)
- Include PoCs for critical findings
- Add testing priority checklist

#### Create `scan-summary.md`

Statistics only:
```markdown
# Scan Summary

## Statistics
- Files scanned: X
- Client paths: Y
- API endpoints: Z
- Sources: A
- Sinks: B
- Vulnerabilities: C (X critical, Y high, Z medium)
- Agents spawned: N

## Files Created
- frontend/client-paths.md
- frontend/sources-sinks.md
- frontend/frontend-architecture.md
- frontend/frontend-analysis.md
- frontend/frontend-vulnerabilities.md
- backend/api-paths.md
- backend/api-architecture.md
- backend/api-analysis.md
- backend/secrets.md
```

#### Create `full-scan-report.md`

Executive summary:
```markdown
# Full Scan Report

## Target
[Directory analyzed]

## Critical Findings
1. [Finding 1 with PoC]
2. [Finding 2 with PoC]

## Testing Priority
1. [ ] Test critical XSS in [file]
2. [ ] Test IDOR on [endpoint]
3. [ ] Verify postMessage bypass in [file]

## Detailed Reports
- Frontend: frontend/frontend-vulnerabilities.md
- API: backend/api-analysis.md
- Secrets: backend/secrets.md
```

---

## Performance

| Phase | Agents | Model | Expected Time |
|-------|--------|-------|---------------|
| 1-3 | 3 parallel | haiku/opus | 30-60 sec |
| 3.5 | 1 (exhaustive) | opus | 30-90 sec |
| 4 | N parallel | opus | 1-3 min |
| 5 | Primary | - | 10-20 sec |

**Total:** 2-6 minutes (thorough client path extraction adds ~1 min)

---

## Critical Rules

1. **Primary context = orchestrator only** - Never run greps or parse JSON directly
2. **All analysis in agents** - Spawn agents for any heavy processing
3. **Parallel whenever possible** - Launch independent agents in single message
4. **opus for reasoning** - Architecture, source-sink tracing, security analysis
5. **haiku for enumeration** - Grep patterns, tool execution, file listing
6. **client-path-extractor is EXHAUSTIVE** - It reads everything to find every path
