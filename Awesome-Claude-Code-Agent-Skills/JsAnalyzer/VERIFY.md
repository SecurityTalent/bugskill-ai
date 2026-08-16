# JsAnalyzer Verification Checklist

**Version:** 2.0.0
**Purpose:** Verify JsAnalyzer skill is correctly installed and functional

---

## Pre-Flight Checks

### ✅ Core Components
- [ ] `${PAI_DIR}/skills/JsAnalyzer/SKILL.md` exists
- [ ] `${PAI_DIR}/skills/JsAnalyzer/workflows/FullScan.md` exists
- [ ] `${PAI_DIR}/doctorswzl/` directory exists
- [ ] doctorswzl is executable: `bun run ${PAI_DIR}/doctorswzl/src/index.ts --help`

### ✅ Agent Dependencies
- [ ] JsGrepAnalyzer agent exists: `${PAI_DIR}/agents/JsGrepAnalyzer.md`
- [ ] JsToolRunner agent exists: `${PAI_DIR}/agents/JsToolRunner.md`
- [ ] JsArchitectureAnalyzer agent exists: `${PAI_DIR}/agents/JsArchitectureAnalyzer.md`
- [ ] SourceSinkTracer agent exists: `${PAI_DIR}/agents/SourceSinkTracer.md`
- [ ] PostMessageAnalyzer agent exists: `${PAI_DIR}/agents/PostMessageAnalyzer.md`
- [ ] ApiInvestigator agent exists: `${PAI_DIR}/agents/ApiInvestigator.md`
- [ ] SecretsAnalyzer agent exists: `${PAI_DIR}/agents/SecretsAnalyzer.md`
- [ ] ClientPathExtractor agent exists: `${PAI_DIR}/agents/ClientPathExtractor.md`

---

## Functional Tests

### Test 1: Basic Skill Activation
```bash
# In Claude Code:
"analyze the javascript files in this directory"
```

**Expected:**
- ✅ Skill activates (logs show "JsAnalyzer skill activated")
- ✅ Workflow loaded (FullScan.md or Analyze.md)
- ✅ No immediate errors

**Status:** [ ] Pass [ ] Fail

---

### Test 2: doctorswzl Tool Execution
```bash
# Create test file
echo 'eval(user_input); document.innerHTML = data;' > test.js

# Run doctorswzl
cd ${PAI_DIR}/doctorswzl
bun run src/index.ts test.js
```

**Expected output:**
```
Analysis Results: test.js

Sinks (2):
  eval [js.eval] @ 1:0
  innerHTML [js.innerHTML] @ 1:18
```

**Status:** [ ] Pass [ ] Fail

---

### Test 3: Agent Spawning
```bash
# In Claude Code, run:
/js-analyze ./

# Check debug logs for agent spawning:
ls ${PAI_DIR}/debug/ | tail -5
```

**Expected:**
- ✅ Multiple agent session files created
- ✅ Agent IDs logged (a1b2c3d format)
- ✅ No spawn failures

**Status:** [ ] Pass [ ] Fail

---

### Test 4: Output Structure Creation
```bash
# After running /js-analyze
ls -R ./js-analysis/
```

**Expected structure:**
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
├── raw/
│   └── *.json
├── scan-summary.md
└── full-scan-report.md
```

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Client Path Extraction
```bash
# Create test file with routes
cat > test-routes.js << 'EOF'
const routes = [
  '/home',
  '/profile/:id',
  '#/dashboard',
  '/api/users'
];
EOF

# Run analysis
/js-analyze ./test-routes.js

# Check client-paths.md
cat ./js-analysis/frontend/client-paths.md
```

**Expected:**
- ✅ All 4 paths listed
- ✅ Deduplicated
- ✅ Categorized (client vs API)

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Secrets Detection
```bash
# Create test file with secret
cat > test-secrets.js << 'EOF'
const apiKey = 'AKIA1234567890ABCDEF';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.sig';
EOF

# Run analysis
/js-analyze ./test-secrets.js

# Check secrets.md
cat ./js-analysis/backend/secrets.md
```

**Expected:**
- ✅ AWS key detected (AKIA...)
- ✅ JWT detected (eyJ...)
- ✅ Risk assessment included

**Status:** [ ] Pass [ ] Fail

---

### Test 7: Source-Sink Tracing
```bash
# Create test file with flow
cat > test-flow.js << 'EOF'
const userInput = location.hash;
document.getElementById('output').innerHTML = userInput;
EOF

# Run analysis
/js-analyze ./test-flow.js

# Check frontend-analysis.md for flow trace
cat ./js-analysis/frontend/frontend-analysis.md | grep -A 10 "Source→Sink"
```

**Expected:**
- ✅ Flow traced: location.hash → innerHTML
- ✅ Marked as exploitable
- ✅ PoC suggested

**Status:** [ ] Pass [ ] Fail

---

### Test 8: PostMessage Handler Detection
```bash
# Create test file with postMessage
cat > test-postmessage.js << 'EOF'
window.addEventListener('message', (e) => {
  document.body.innerHTML = e.data;
});
EOF

# Run analysis
/js-analyze ./test-postmessage.js

# Check analysis
cat ./js-analysis/frontend/frontend-analysis.md | grep -i postmessage
```

**Expected:**
- ✅ Handler detected
- ✅ No origin validation noted
- ✅ Risk assessment: HIGH

**Status:** [ ] Pass [ ] Fail

---

## Performance Validation

### Test 9: Parallel Agent Execution
```bash
# Run full scan and time it
time /js-analyze ./large-app/

# Check that agents ran in parallel
ls -lt ${PAI_DIR}/debug/*.txt | head -5
# Timestamps should be within seconds of each other
```

**Expected:**
- ✅ Phase 1-3 agents start simultaneously (±5 seconds)
- ✅ Phase 4 agents start after Phase 3 completes
- ✅ Total time < 5 minutes for ~50 JS files

**Status:** [ ] Pass [ ] Fail

---

### Test 10: Token Usage
```bash
# After analysis, check token usage in logs
# Should see ~90% reduction vs old monolithic approach

# Old way: ~50k tokens for 50 files
# New way: ~5k tokens (agents handle analysis)
```

**Expected:**
- ✅ Primary context uses < 10k tokens
- ✅ Most work delegated to agents
- ✅ No token limit exceeded errors

**Status:** [ ] Pass [ ] Fail

---

## Integration Tests

### Test 11: SecurityAudit Integration
```bash
# Run full audit (includes JsAnalyzer)
/audit target.com

# Verify JsAnalyzer phase completes
ls ./security-audit/js-analysis/
```

**Expected:**
- ✅ JsAnalyzer runs as Phase 1
- ✅ Output used by subsequent phases
- ✅ No errors in audit log

**Status:** [ ] Pass [ ] Fail

---

## Verification Summary

**Date:** _______________
**Verified By:** _______________

**Results:**
- Core Components: [ ] Pass [ ] Fail
- Agent Dependencies: [ ] Pass [ ] Fail
- Functional Tests (1-8): ___ / 8 passed
- Performance Tests (9-10): ___ / 2 passed
- Integration Test (11): [ ] Pass [ ] Fail

**Overall Status:** [ ] ✅ Verified [ ] ❌ Issues Found

---

## Troubleshooting Failed Tests

### If Test 2 (doctorswzl) fails:
```bash
cd ${PAI_DIR}/doctorswzl
bun install --force
bun run src/index.ts --version
```

### If Test 3 (Agent Spawning) fails:
- Check Task tool permissions in settings.json
- Verify agent markdown files are valid
- Review `${PAI_DIR}/debug/latest` for errors

### If Test 4 (Output Structure) fails:
- Manually create directories
- Check file permissions
- Verify current working directory

### If Tests 5-8 (Detection) fail:
- Verify test files were created correctly
- Check agent logs for errors
- Re-run with verbose logging

---

## Next Steps After Verification

1. **If All Tests Pass:**
   - ✅ JsAnalyzer is ready for production use
   - Run on real targets
   - Integrate with SecurityAudit workflow

2. **If Some Tests Fail:**
   - Review troubleshooting steps above
   - Check `${PAI_DIR}/debug/latest` for errors
   - Consult INSTALL.md for missing dependencies

3. **Optimization:**
   - Adjust agent models for cost/performance
   - Customize output structure
   - Add project-specific patterns

---

**Verification Complete!**
JsAnalyzer skill is [ ] ready / [ ] needs fixes
