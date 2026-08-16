/**
 * Review Orchestrator
 * Orchestrates Phases 4-5: Deep-dive analysis with subagents
 */

import type { AnalysisTarget, FindingsSummary } from "../types/index.ts";

/**
 * Files to load from previous Analyze workflow
 */
export const REQUIRED_FILES = [
	"frontend/client-paths.md",
	"frontend/frontend-architecture.md",
	"frontend/sources-sinks.md",
	"backend/api-paths.md",
	"backend/api-architecture.md",
	"backend/secrets.md",
	"raw/combined-tool-results.json",
] as const;

/**
 * Check if prerequisites exist
 */
export function generatePrerequisiteCheck(outputDir: string): string {
	const checks = REQUIRED_FILES.map(
		(file) => `test -f "${outputDir}/${file}"`,
	).join(" && ");

	return `if ${checks}; then
  echo "Prerequisites OK"
else
  echo "ERROR: Missing required files from Analyze workflow"
  echo "Run Analyze workflow first"
  exit 1
fi`;
}

/**
 * Generate commands to load all findings files
 */
export function generateLoadCommands(outputDir: string): string[] {
	return REQUIRED_FILES.map((file) => `cat "${outputDir}/${file}"`);
}

/**
 * Source→Sink tracer prompt template
 */
export function generateSourceSinkPrompt(params: {
	source: string;
	sink: string;
	sourceFile: string;
	sinkFile: string;
	outputDir: string;
}): string {
	return `## Source→Sink Flow Analysis

**Source:** ${params.source} (${params.sourceFile})
**Sink:** ${params.sink} (${params.sinkFile})

### Your Task
1. Read both files to understand the code context
2. Trace the data flow from source to sink
3. Determine if user input reaches the sink unsanitized
4. Identify any sanitization/encoding in between
5. Assess exploitability (can we inject arbitrary HTML/JS?)

### Files to Analyze
- ${params.sourceFile}
- ${params.sinkFile}
- Any intermediate files in the flow

### Output Format
Return your analysis in this structure:

## Flow: ${params.source} → ${params.sink}

### Verdict: [EXPLOITABLE / NOT EXPLOITABLE / NEEDS MANUAL TESTING]

### Data Flow
1. User input enters at: [location]
2. Passes through: [functions/transformations]
3. Reaches sink at: [location]

### Sanitization Present
- [ ] HTML encoding
- [ ] URL encoding
- [ ] DOMPurify/sanitizer
- [ ] None found

### Exploitation Notes
[If exploitable, describe how. If not, explain why.]

### Recommended PoC
[Payload to test]

**Append your analysis to:** ${params.outputDir}/frontend/frontend-analysis.md`;
}

/**
 * API investigator prompt template
 */
export function generateApiPrompt(params: {
	method: string;
	path: string;
	file: string;
	outputDir: string;
}): string {
	return `## API Endpoint Analysis

**Endpoint:** ${params.method} ${params.path}
**Found in:** ${params.file}

### Your Task
1. Read the file where this endpoint is called
2. Find ALL places this endpoint is used
3. Document request structure (headers, body, params)
4. Identify what authentication is used
5. Note any interesting parameters for testing

### Output Format
Return your analysis in this structure:

## Endpoint: ${params.method} ${params.path}

### Request Structure
- **Method:** ${params.method}
- **Headers:**
  [List headers]
- **Body:**
  \`\`\`json
  [Request body structure]
  \`\`\`

### Authentication
- Type: [JWT / Cookie / API Key / None]
- Required: [Yes / No / Sometimes]

### Parameters of Interest
| Param | Type | Notes |
|-------|------|-------|
[List interesting parameters]

### Testing Recommendations
1. [Specific test to run]
2. [Specific test to run]

**Append your analysis to:** ${params.outputDir}/backend/api-analysis.md`;
}

/**
 * PostMessage analyzer prompt template
 */
export function generatePostMessagePrompt(params: {
	file: string;
	line: number;
	outputDir: string;
}): string {
	return `## PostMessage Handler Analysis

**Handler Location:** ${params.file}:${params.line}

### Your Task
1. Read the handler code completely
2. Check for origin validation
3. Identify what actions the handler performs
4. Trace where event.data flows
5. Assess cross-origin exploitability

### Output Format
Return your analysis in this structure:

## PostMessage Handler: ${params.file}:${params.line}

### Origin Validation
- [ ] Checks event.origin
- [ ] Origin allowlist: [list if present]
- [ ] No validation (vulnerable)

### Handler Actions
[What does this handler do when it receives a message?]

### Data Flow
event.data → [where does it go?]

### Exploitability
**Verdict:** [EXPLOITABLE / PARTIAL / NOT EXPLOITABLE]

**Attack Scenario:**
[How an attacker could abuse this]

### PoC Template
\`\`\`html
<iframe src="${params.file.replace(/\.js$/, ".html")}"></iframe>
<script>
  document.querySelector('iframe').contentWindow.postMessage(
    [PAYLOAD],
    '*'
  );
</script>
\`\`\`

**Append your analysis to:** ${params.outputDir}/frontend/frontend-analysis.md`;
}

/**
 * Secrets analyzer prompt template
 */
export function generateSecretsPrompt(params: {
	targetDir: string;
	outputDir: string;
}): string {
	return `## Secrets Analysis

### Your Task
For each secret found in ${params.outputDir}/raw/combined-tool-results.json:
1. Identify the type (JWT, API key, AWS, etc.)
2. Check if it's still valid/active
3. Determine scope/permissions if possible
4. Assess impact if leaked

### Output Format
Return your analysis for each secret in this structure:

## Secret #N: [TYPE]

**Location:** [FILE:LINE]
**Value (truncated):** [first 10 chars...]

### Analysis
- **Type:** JWT / API Key / AWS / etc.
- **Format valid:** Yes/No
- **Appears active:** Unknown/Yes/No

### JWT Decode (if applicable)
\`\`\`json
{
  "header": {...},
  "payload": {...}
}
\`\`\`

### Risk Assessment
- **Severity:** [Critical/High/Medium/Low]
- **Impact:** [What could attacker do with this?]

### Recommended Action
[What should be done about this secret]

**Write your analysis to:** ${params.outputDir}/backend/secrets.md`;
}

/**
 * Output file templates for Phase 5 synthesis
 */
export const SYNTHESIS_TEMPLATES = {
	frontendAnalysis: `# Frontend Deep Analysis

**Target:** [TARGET_NAME]
**Analyzed:** [DATE]

---

## Source→Sink Analysis Results

### Confirmed Exploitable Flows
[Agent findings for exploitable flows]

---

### Not Exploitable (Sanitized)
| Source | Sink | File | Reason |
|--------|------|------|--------|
[List sanitized flows]

---

### Needs Manual Testing
| Source | Sink | File | Why Manual |
|--------|------|------|------------|
[List complex flows]

---

## PostMessage Handlers Analysis

### Vulnerable Handlers
[Agent findings for vulnerable handlers]

---

### Safe Handlers
| File | Line | Why Safe |
|------|------|----------|
[List safe handlers]

---

## Frontend Summary

**Total Flows Analyzed:** [X]
**Confirmed Exploitable:** [Y]
**Not Exploitable:** [Z]
**Needs Manual Testing:** [A]

**PostMessage Handlers:**
- Vulnerable: [B]
- Safe: [C]

---

## Prioritized Testing Checklist

### Critical (Test Immediately)
- [ ] [Critical findings...]

### High Priority
- [ ] [High severity findings...]

### Medium Priority
- [ ] [Medium severity findings...]

### Manual Testing Required
- [ ] [Items needing manual verification...]
`,

	frontendVulnerabilities: `# Frontend Vulnerabilities Summary

**Target:** [TARGET_NAME]
**Date:** [DATE]

---

## Executive Summary

Found **X** confirmed vulnerabilities in the frontend codebase:
- **Critical:** [count] - DOM XSS, account takeover vectors
- **High:** [count] - PostMessage abuse, open redirects
- **Medium:** [count] - Information disclosure, CSRF

---

## Critical Vulnerabilities

[For each critical vulnerability:]
### VULN-NNN: [Vulnerability Name]

**Severity:** 🔴 Critical

**Location:** [file:line]

**Description:**
[Detailed description]

**Proof of Concept:**
\`\`\`
[PoC payload]
\`\`\`

**Impact:**
- [Impact 1]
- [Impact 2]

**Recommendation:**
[How to fix]

**CVSS:** [Score]

---

## High Severity Vulnerabilities
[Similar format]

---

## Medium Severity Vulnerabilities
[Similar format]

---

## Vulnerability Statistics

| Severity | Count | Confirmed | Needs Testing |
|----------|-------|-----------|---------------|
| Critical | X | Y | Z |
| High | A | B | C |
| Medium | D | E | F |
| **Total** | **G** | **H** | **I** |

---

## Attack Chain Opportunities

### Chain N: [Chain Name]

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Impact:** [Overall impact]

---

## Next Steps

1. Manually test all "Needs Manual Testing" items
2. Confirm PoCs in live environment
3. Check for similar patterns in other files
4. Use \`/chain\` skill to develop full attack chains
5. Generate bug bounty reports with \`/report\` skill
`,

	apiAnalysis: `# API Endpoints Deep Analysis

**Target:** [TARGET_NAME]
**Analyzed:** [DATE]

---

## High-Value Endpoints

[For each critical endpoint:]
### Endpoint: [METHOD] [PATH]

**Request Structure:**
[Details from agent]

**Authentication:**
[Auth details]

**Parameters of Interest:**
[Parameter table]

**Testing Recommendations:**
[Specific tests]

**Exploitability:** [Risk level]

---

## All Endpoints Summary

| Method | Path | Auth | Risk | Primary Concern |
|--------|------|------|------|-----------------|
[Complete endpoint table]

---

## Authentication & Authorization Analysis

### Authentication Mechanisms
[Details]

### Authorization Patterns
[Patterns observed]

---

## API Security Issues Found

### Issue N: [Issue Name]
[Details and testing recommendations]

---

## Prioritized API Testing Checklist

### Critical (Test First)
- [ ] [Critical endpoint tests]

### High Priority
- [ ] [High priority tests]

### Medium Priority
- [ ] [Medium priority tests]
`,
};

/**
 * Agent configurations for Review workflow
 */
export const REVIEW_AGENTS = {
	sourceSinkTracer: {
		type: "source-sink-tracer",
		model: "sonnet" as const,
	},
	apiInvestigator: {
		type: "api-investigator",
		model: "haiku" as const,
	},
	postMessageAnalyzer: {
		type: "postmessage-analyzer",
		model: "sonnet" as const,
	},
	secretsAnalyzer: {
		type: "secrets-analyzer",
		model: "haiku" as const,
	},
} as const;
