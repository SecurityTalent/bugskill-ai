/**
 * Workflow Configurations
 * Define the three main JsAnalyzer workflows with their phases
 */

import type { PhaseConfig, WorkflowConfig } from "../types/index.ts";
import { PHASE_1_3_AGENTS, PHASE_3_5_AGENT, PHASE_4_AGENTS } from "./agents.ts";
import { ALL_OUTPUTS } from "./outputs.ts";

/**
 * FullScan Workflow Configuration
 * Complete JS security analysis with all phases
 */
export const FULL_SCAN_WORKFLOW: WorkflowConfig = {
	name: "FullScan",
	version: "2.0.0",
	description:
		"Complete JS security analysis using parallel subagents for all phases",
	phases: [
		{
			name: "Setup",
			agents: [],
			parallel: false,
			description: "Create output directories and identify JS files",
		},
		{
			name: "Phase 1-3: Initial Analysis",
			agents: PHASE_1_3_AGENTS,
			parallel: true,
			description:
				"Parallel grep analysis, tool execution, architecture analysis",
		},
		{
			name: "Phase 3.5: Client Path Extraction",
			agents: [PHASE_3_5_AGENT],
			parallel: false,
			description: "EXHAUSTIVE client-side path discovery from all sources",
		},
		{
			name: "Phase 4: Deep-Dive Analysis",
			agents: Object.values(PHASE_4_AGENTS),
			parallel: true,
			description: "Parallel security analysis with dynamic agent count",
		},
		{
			name: "Phase 5: Synthesis",
			agents: [],
			parallel: false,
			description: "Create summary reports and vulnerability documentation",
		},
	],
	outputFiles: ALL_OUTPUTS,
};

/**
 * Analyze Workflow Configuration
 * Phases 1-3 only, no deep-dive agents
 */
export const ANALYZE_WORKFLOW: WorkflowConfig = {
	name: "Analyze",
	version: "2.0.0",
	description:
		"Phases 1-3 only: Independent analysis, tool scanning, file organization",
	phases: [
		{
			name: "Setup",
			agents: [],
			parallel: false,
			description: "Create output directories and identify JS files",
		},
		{
			name: "Phase 1: Independent Claude Analysis",
			agents: [],
			parallel: false,
			description: "Direct grep analysis by primary context (no agents)",
		},
		{
			name: "Phase 2: Tool Execution",
			agents: [],
			parallel: false,
			description: "Run doctorswzl on all files, generate JSON output",
		},
		{
			name: "Phase 3: Merge & Organize",
			agents: [],
			parallel: false,
			description: "Combine findings, create architecture documentation",
		},
	],
	outputFiles: ALL_OUTPUTS.filter(
		(out) =>
			!out.path.includes("frontend-analysis.md") &&
			!out.path.includes("frontend-vulnerabilities.md") &&
			!out.path.includes("api-analysis.md") &&
			!out.path.includes("full-scan-report.md"),
	),
};

/**
 * Review Workflow Configuration
 * Phases 4-5 only, assumes Analyze has been run
 */
export const REVIEW_WORKFLOW: WorkflowConfig = {
	name: "Review",
	version: "2.0.0",
	description:
		"Spawn parallel subagents for deep analysis on existing findings",
	phases: [
		{
			name: "Load Analysis Results",
			agents: [],
			parallel: false,
			description: "Read all findings files from previous Analyze workflow",
		},
		{
			name: "Phase 4: Deep-Dive Agents",
			agents: Object.values(PHASE_4_AGENTS),
			parallel: true,
			description: "Spawn agents based on findings (dynamic count)",
		},
		{
			name: "Phase 5: Synthesis",
			agents: [],
			parallel: false,
			description: "Generate analysis files and vulnerability summaries",
		},
	],
	outputFiles: ALL_OUTPUTS.filter(
		(out) =>
			out.path.includes("frontend-analysis.md") ||
			out.path.includes("frontend-vulnerabilities.md") ||
			out.path.includes("api-analysis.md") ||
			out.path.includes("secrets.md"),
	),
};

/**
 * All workflows
 */
export const ALL_WORKFLOWS = {
	fullscan: FULL_SCAN_WORKFLOW,
	analyze: ANALYZE_WORKFLOW,
	review: REVIEW_WORKFLOW,
} as const;

/**
 * Get workflow by name
 */
export function getWorkflow(
	name: "fullscan" | "analyze" | "review",
): WorkflowConfig {
	return ALL_WORKFLOWS[name];
}

/**
 * Workflow routing based on trigger
 */
export interface WorkflowTrigger {
	patterns: string[];
	workflow: keyof typeof ALL_WORKFLOWS;
	description: string;
}

export const WORKFLOW_ROUTING: WorkflowTrigger[] = [
	{
		patterns: ["/js-analyze", "full js security scan", "analyze all js files"],
		workflow: "fullscan",
		description: "Complete analysis with all 5 phases",
	},
	{
		patterns: ["analyze js files", "scan javascript", "js analysis"],
		workflow: "analyze",
		description: "Phases 1-3 only (faster, no agents)",
	},
	{
		patterns: ["review findings", "deep analysis", "do deep dive"],
		workflow: "review",
		description: "Phases 4-5 only (requires existing findings)",
	},
];

/**
 * Determine workflow from user input
 */
export function determineWorkflow(
	userInput: string,
): keyof typeof ALL_WORKFLOWS {
	const input = userInput.toLowerCase();

	for (const trigger of WORKFLOW_ROUTING) {
		for (const pattern of trigger.patterns) {
			if (input.includes(pattern.toLowerCase())) {
				return trigger.workflow;
			}
		}
	}

	// Default to fullscan
	return "fullscan";
}
