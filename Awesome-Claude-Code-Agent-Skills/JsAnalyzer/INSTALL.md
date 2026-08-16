# JsAnalyzer Installation Guide

**Version:** 2.0.0
**Type:** Skill (Orchestrator-based)
**Dependencies:** doctorswzl, specialized agents

---

## Overview

JsAnalyzer is an orchestrator-based JavaScript security analysis skill that delegates heavy work to specialized agents for performance and scalability.

---

## Prerequisites

### 1. Core Requirements
- ✅ PAI Core installed
- ✅ Hook system functional
- ✅ Bun runtime (for doctorswzl tool)

### 2. Agent Dependencies
This skill requires the following specialized agents:
- `js-grep-analyzer` (haiku) - Fast grep extraction
- `js-tool-runner` (haiku) - Tool execution
- `js-architecture-analyzer` (opus) - Deep architecture analysis
- `source-sink-tracer` (opus) - Flow tracing
- `postmessage-analyzer` (opus) - postMessage security
- `api-investigator` (opus) - API endpoint analysis
- `secrets-analyzer` (opus) - Credential assessment
- `client-path-extractor` (opus) - Exhaustive client-side path extraction

**Installation:** These agents are in `${PAI_DIR}/agents/` and are auto-loaded

### 3. Tool Requirements
- `doctorswzl` - JavaScript static analysis tool
  - Location: `${PAI_DIR}/doctorswzl/`
  - Requires: Bun runtime

---

## Installation Steps

### Step 1: Verify doctorswzl
```bash
cd ${PAI_DIR}/doctorswzl
bun install
bun run src/index.ts --help
```

**Expected output:**
```
Usage: doctorswzl [options] <files...>
...
```

### Step 2: Verify Agents
```bash
ls -1 ${PAI_DIR}/agents/ | grep -E "(JsGrepAnalyzer|JsToolRunner|SourceSinkTracer)"
```

**Expected output:**
```
JsGrepAnalyzer.md
JsToolRunner.md
SourceSinkTracer.md
...
```

### Step 3: Verify Skill Structure
```bash
ls -la ${PAI_DIR}/skills/JsAnalyzer/
```

**Expected output:**
```
SKILL.md
INSTALL.md (this file)
VERIFY.md
workflows/
  ├── FullScan.md
  ├── Analyze.md
  └── Review.md
```

### Step 4: Test Skill Activation
```bash
# In Claude Code, trigger the skill:
/js-analyze ./test-files/
```

**Expected behavior:**
- Skill activates and reads FullScan.md workflow
- Spawns 3 agents in parallel (Phase 1-3)
- Creates `./js-analysis/` directory structure
- Completes without errors

---

## Configuration

### Optional: Customize Output Directory
Edit workflow files to change output location:
```bash
# In workflows/FullScan.md, change:
OUTPUT_DIR="./js-analysis"
# To:
OUTPUT_DIR="${PAI_DIR}/security-analysis/js"
```

### Optional: Adjust Agent Models
For cost optimization, you can adjust agent models:
- haiku: Fast, cheap ($0.25/MTok)
- sonnet: Balanced ($3/MTok)
- opus: Deep reasoning ($15/MTok)

Edit workflow to change model selection:
```javascript
Task(
  subagent_type: "js-architecture-analyzer",
  model: "sonnet",  // Changed from "opus" for cost savings
  prompt: "..."
)
```

---

## Directory Structure After Installation

```
skills/JsAnalyzer/
├── SKILL.md          # Skill definition
├── INSTALL.md        # This file
├── VERIFY.md         # Verification checklist
└── workflows/
    ├── FullScan.md   # Complete 5-phase analysis
    ├── Analyze.md    # Phases 1-3 only
    └── Review.md     # Phases 4-5 only
```

---

## Troubleshooting

### Issue: doctorswzl command not found
**Solution:**
```bash
cd ${PAI_DIR}/doctorswzl
bun install
# Verify installation
bun run src/index.ts --version
```

### Issue: Agents not spawning
**Check:**
1. Verify agent files exist in `${PAI_DIR}/agents/`
2. Check Claude Code has Task tool permissions
3. Review agent error logs in `${PAI_DIR}/debug/`

### Issue: Output directory not created
**Solution:**
```bash
# Manually create structure
mkdir -p ./js-analysis/{frontend,backend,raw}
# Re-run analysis
```

### Issue: Token limit exceeded
**Solution:**
- Use haiku model for more agents
- Reduce number of files analyzed
- Process files in batches

---

## Integration

### With SecurityAudit Workflow
JsAnalyzer is Phase 1 of `/audit` command:
```
/audit target.com
  ├── Phase 1: JsAnalyzer (this skill)
  ├── Phase 2: Browser testing
  └── Phase 3: Report generation
```

### With Other Skills
- **ClientSideAttacks:** Uses JsAnalyzer findings for targeted testing
- **VulnChaining:** Builds chains from JsAnalyzer vulnerabilities
- **BugBountyWorkflow:** Integrates into recon phase

---

## Uninstallation

To remove JsAnalyzer skill:
```bash
# Remove skill directory
rm -rf ${PAI_DIR}/skills/JsAnalyzer/

# Note: Keep agents - they're used by other skills
# Note: Keep doctorswzl - it's a core tool
```

---

## Next Steps

After installation:
1. Run verification: See `VERIFY.md`
2. Test on sample JS files
3. Review output structure in `./js-analysis/`
4. Customize workflows if needed

---

**Installation Complete!**
Proceed to `VERIFY.md` to validate the installation.
