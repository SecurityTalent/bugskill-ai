/**
 * Output File Configurations
 * Defines the complete output structure for JsAnalyzer
 */

import type { OutputFile } from "../types/index.ts";

/**
 * Frontend output files
 */
export const FRONTEND_OUTPUTS: OutputFile[] = [
	{
		path: "frontend/client-paths.md",
		description: "Exhaustive list of ALL client-side routes and paths",
		createdBy: "client-path-extractor",
	},
	{
		path: "frontend/sources-sinks.md",
		description: "Complete inventory of sources and sinks with tool output",
		createdBy: "js-tool-runner",
	},
	{
		path: "frontend/sources-sinks-raw.md",
		description: "Initial sources/sinks from grep analysis",
		createdBy: "js-grep-analyzer",
	},
	{
		path: "frontend/frontend-architecture.md",
		description: "Framework, design patterns, security-relevant architecture",
		createdBy: "js-architecture-analyzer",
	},
	{
		path: "frontend/frontend-analysis.md",
		description: "Deep analysis findings from Phase 4 agents",
		createdBy: "phase-4-agents",
	},
	{
		path: "frontend/frontend-vulnerabilities.md",
		description: "Vulnerability summary grouped by severity with PoCs",
		createdBy: "phase-5-synthesis",
	},
];

/**
 * Backend output files
 */
export const BACKEND_OUTPUTS: OutputFile[] = [
	{
		path: "backend/api-paths.md",
		description: "Deduplicated API endpoints discovered",
		createdBy: "js-grep-analyzer",
	},
	{
		path: "backend/api-architecture.md",
		description: "API design philosophy and authentication patterns",
		createdBy: "js-architecture-analyzer",
	},
	{
		path: "backend/api-analysis.md",
		description: "API endpoint analysis with IDOR/CSRF testing recommendations",
		createdBy: "api-investigator",
	},
	{
		path: "backend/secrets.md",
		description: "Secrets analysis with impact assessment",
		createdBy: "secrets-analyzer",
	},
];

/**
 * Raw tool output files
 */
export const RAW_OUTPUTS: OutputFile[] = [
	{
		path: "raw/*.json",
		description: "Per-file doctorswzl tool output",
		createdBy: "js-tool-runner",
	},
	{
		path: "raw/combined-tool-results.json",
		description: "Combined JSON from all tool runs",
		createdBy: "js-tool-runner",
	},
];

/**
 * Summary and report files
 */
export const SUMMARY_OUTPUTS: OutputFile[] = [
	{
		path: "scan-summary.md",
		description: "Statistics and file inventory",
		createdBy: "phase-5-synthesis",
	},
	{
		path: "full-scan-report.md",
		description: "Executive summary with testing priorities",
		createdBy: "phase-5-synthesis",
	},
];

/**
 * All output files
 */
export const ALL_OUTPUTS: OutputFile[] = [
	...FRONTEND_OUTPUTS,
	...BACKEND_OUTPUTS,
	...RAW_OUTPUTS,
	...SUMMARY_OUTPUTS,
];

/**
 * Directory structure to create
 */
export const OUTPUT_DIRECTORIES = ["frontend", "backend", "raw"] as const;

/**
 * Get outputs by creator
 */
export function getOutputsByCreator(creator: string): OutputFile[] {
	return ALL_OUTPUTS.filter((output) => output.createdBy === creator);
}

/**
 * Get outputs by category
 */
export function getOutputsByCategory(
	category: "frontend" | "backend" | "raw" | "summary",
): OutputFile[] {
	switch (category) {
		case "frontend":
			return FRONTEND_OUTPUTS;
		case "backend":
			return BACKEND_OUTPUTS;
		case "raw":
			return RAW_OUTPUTS;
		case "summary":
			return SUMMARY_OUTPUTS;
		default:
			return [];
	}
}

/**
 * Output file tree for display
 */
export const OUTPUT_FILE_TREE = `
./js-analysis/
├── frontend/
│   ├── client-paths.md           # EXHAUSTIVE client routes
│   ├── sources-sinks.md          # Complete sources/sinks inventory
│   ├── frontend-architecture.md  # Framework and design analysis
│   ├── frontend-analysis.md      # Deep-dive findings
│   └── frontend-vulnerabilities.md # Grouped by severity
├── backend/
│   ├── api-paths.md              # API endpoints
│   ├── api-architecture.md       # API design philosophy
│   ├── api-analysis.md           # IDOR/CSRF testing guide
│   └── secrets.md                # Secrets impact assessment
├── raw/
│   ├── *.json                    # Per-file tool output
│   └── combined-tool-results.json
├── scan-summary.md               # Statistics
└── full-scan-report.md           # Executive summary
`.trim();
