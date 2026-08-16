/**
 * Analyze Orchestrator
 * Orchestrates Phases 1-3: Independent analysis, no subagents
 */

import { ALL_PATTERNS, type GrepPattern } from "../configs/grep-patterns.ts";
import type { AnalysisTarget } from "../types/index.ts";

/**
 * Get file finding command
 */
export function generateFileFindCommand(targetDir: string): string {
	return `find ${targetDir} -type f -name "*.js" \\
  ! -path "*/node_modules/*" \\
  ! -path "*/.git/*" \\
  ! -path "*/vendor/*" \\
  ! -path "*/dist/*"`;
}

/**
 * Get grep commands for parallel execution
 * Returns Grep tool configurations
 */
export interface GrepConfig {
	pattern: string;
	description: string;
	outputContext: string;
}

export function generateGrepConfigs(): Record<string, GrepConfig[]> {
	return {
		clientPaths: ALL_PATTERNS.paths.map((p) => ({
			pattern: p.pattern,
			description: p.description,
			outputContext: "frontend/client-paths.md",
		})),
		apiEndpoints: ALL_PATTERNS.endpoints.map((p) => ({
			pattern: p.pattern,
			description: p.description,
			outputContext: "backend/api-paths.md",
		})),
		sources: ALL_PATTERNS.sources.map((p) => ({
			pattern: p.pattern,
			description: p.description,
			outputContext: "frontend/sources-sinks-raw.md (sources section)",
		})),
		sinks: ALL_PATTERNS.sinks.map((p) => ({
			pattern: p.pattern,
			description: p.description,
			outputContext: "frontend/sources-sinks-raw.md (sinks section)",
		})),
		secrets: ALL_PATTERNS.secrets.map((p) => ({
			pattern: p.pattern,
			description: p.description,
			outputContext: "backend/secrets.md",
		})),
	};
}

/**
 * Tool execution configuration
 */
export interface ToolConfig {
	toolPath: string;
	command: (file: string, outputFile: string) => string;
	combineCommand: (outputDir: string) => string;
}

export function getDoctorswzlConfig(): ToolConfig {
	return {
		toolPath: "${PAI_DIR}/doctorswzl",
		command: (file: string, outputFile: string) =>
			`cd \${PAI_DIR}/doctorswzl && bun run src/index.ts "${file}" -o "${outputFile}" -b`,
		combineCommand: (outputDir: string) =>
			`jq -s 'add' ${outputDir}/raw/*.json > ${outputDir}/raw/combined-tool-results.json`,
	};
}

/**
 * Generate tool execution script
 */
export function generateToolScript(
	targetDir: string,
	outputDir: string,
): string {
	const config = getDoctorswzlConfig();

	return `
# Find all JS files
JS_FILES=$(find ${targetDir} -name "*.js" ! -path "*/node_modules/*")

# Process each file
for file in $JS_FILES; do
  BASENAME=$(basename "$file" .js)
  HASH=$(echo "$file" | md5sum | cut -d' ' -f1)
  OUTPUT="${outputDir}/raw/\${BASENAME}-\${HASH}.json"

  ${config.command("$file", "$OUTPUT")}
done

# Combine results
${config.combineCommand(outputDir)}
`.trim();
}

/**
 * Output file templates
 */
export const OUTPUT_TEMPLATES = {
	clientPaths: `# Client-Side Paths

## Static Routes
[List all static routes alphabetically]

## Dynamic Routes
[List routes with parameters]

## Hash Routes
[List hash-based routes]

## Programmatic Navigation
[List routes from history.push, router.navigate, etc.]
`,

	apiPaths: `# API Endpoints

## Authentication
[Auth-related endpoints]

## User Management
[User-related endpoints]

## Resource Operations
[CRUD endpoints by resource]
`,

	sourcesSinks: `# Sources & Sinks Inventory

## User-Controlled Sources

### URL-Based Sources
| Source | Files | Count | Risk |
|--------|-------|-------|------|
[Populate from grep results]

## Dangerous Sinks

### DOM XSS Sinks
| Sink | Files | Count | Risk |
|------|-------|-------|------|
[Populate from grep results]
`,

	frontendArchitecture: `# Frontend Architecture Analysis

## Framework & Design Philosophy

### Core Framework
- **Framework:** [Identified framework]
- **Template Engine:** [Template system]
- **Build System:** [Build tool]
- **Module System:** [Module format]

### Architectural Patterns
[List patterns observed]

### Security-Relevant Design
[Security implications of architecture choices]
`,

	apiArchitecture: `# API Architecture & Design Philosophy

## API Design Patterns

### RESTful Structure
- **Pattern:** [URL pattern]
- **Versioning:** [Version strategy]
- **Parameter Style:** [Parameter conventions]

### Common API Patterns
[Document recurring patterns]

### Security Implications
[Security concerns from API design]
`,

	secrets: `# Secrets Analysis

## Critical Secrets

[For each secret found:]
### N. [Secret Type]
- **File:** [file path]
- **Value:** [truncated value]
- **Type:** [API Key / JWT / AWS / etc.]
- **Risk Level:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM
- **Impact:** [What attacker could do]
- **Recommended Action:** [Rotate, move to env vars, etc.]
`,

	scanSummary: `# JS Analysis - Scan Summary

**Target:** [TARGET_NAME]
**Date:** [DATE]
**Files Analyzed:** [COUNT]

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

\`\`\`
./js-analysis/
├── frontend/ (paths, architecture, sources/sinks)
├── backend/ (api paths, architecture, secrets)
├── raw/ (tool outputs)
└── scan-summary.md (this file)
\`\`\`
`,
};

/**
 * What Analyze workflow does and does NOT do
 */
export const ANALYZE_CAPABILITIES = {
	does: [
		"Independent Claude grep analysis",
		"Run doctorswzl tool on all files",
		"Merge and dedupe findings",
		"Extract architecture patterns",
		"Organize paths into simple lists",
		"Create secrets inventory",
		"Generate initial sources/sinks inventory",
	],
	doesNot: [
		"Spawn subagents for deep analysis",
		"Trace source→sink flows",
		"Investigate API endpoints for IDOR",
		"Analyze postMessage handlers in depth",
		"Create vulnerability summaries",
		"Generate PoCs",
	],
} as const;
