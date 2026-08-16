/**
 * FullScan Orchestrator
 * Orchestrates complete JS security analysis with all 5 phases
 */

import {
	PHASE_1_3_AGENTS,
	PHASE_3_5_AGENT,
	PHASE_4_AGENTS,
} from "../configs/agents.ts";
import { OUTPUT_DIRECTORIES } from "../configs/outputs.ts";
import type { AgentPromptParams, AnalysisTarget } from "../types/index.ts";

/**
 * Generate Phase 1-3 agent prompts
 * Returns prompt strings for parallel agent spawn
 */
export function generatePhase1_3Prompts(
	target: AnalysisTarget,
): Record<string, string> {
	const { targetDir, outputDir } = target;

	return {
		"js-grep-analyzer": `Analyze JavaScript files in ${targetDir}

OUTPUT DIRECTORY: ${outputDir}

Create these files:
- backend/api-paths.md (deduplicated API endpoints)
- frontend/sources-sinks-raw.md (initial sources/sinks inventory)

NOTE: Do NOT create client-paths.md - a specialized agent handles that.

Run parallel greps for: API endpoints, sources, sinks, secrets.
Deduplicate and categorize results.`,

		"js-tool-runner": `Run doctorswzl on JavaScript files in ${targetDir}

OUTPUT DIRECTORY: ${outputDir}

Create these files:
- raw/*.json (per-file tool output)
- raw/combined-tool-results.json (merged)
- frontend/sources-sinks.md (enhanced inventory)

Tool location: \${PAI_DIR}/doctorswzl/
Usage: cd \${PAI_DIR}/doctorswzl && bun run src/index.ts <file> -o <output.json> -b`,

		"js-architecture-analyzer": `Analyze JavaScript architecture in ${targetDir}

OUTPUT DIRECTORY: ${outputDir}

Create these files:
- frontend/frontend-architecture.md
- backend/api-architecture.md

Identify: framework, build system, routing, state management, auth patterns.
Document security-relevant design decisions.`,
	};
}

/**
 * Generate Phase 3.5 client path extractor prompt
 */
export function generatePhase3_5Prompt(target: AnalysisTarget): string {
	const { targetDir, outputDir } = target;

	return `Extract EVERY SINGLE client-side path from ${targetDir}

OUTPUT DIRECTORY: ${outputDir}
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

Be EXHAUSTIVE. Miss NOTHING. Deduplicate and alphabetize.`;
}

/**
 * Generate Phase 4 agent prompts (dynamic based on findings)
 */
export interface Phase4Targets {
	sourceSinkFlows: Array<{ source: string; sink: string; file: string }>;
	postMessageHandlers: Array<{ file: string; line: number }>;
	apiEndpoints: Array<{ method: string; path: string; file: string }>;
	secretsFound: boolean;
}

export function generatePhase4Prompts(
	target: AnalysisTarget,
	findings: Phase4Targets,
): Array<{ agentType: string; prompt: string }> {
	const { outputDir } = target;
	const prompts: Array<{ agentType: string; prompt: string }> = [];

	// Source→Sink Tracer prompts
	for (const flow of findings.sourceSinkFlows) {
		prompts.push({
			agentType: "source-sink-tracer",
			prompt: `Trace data flow: ${flow.source} → ${flow.sink} in ${flow.file}

Read the source file, trace how user input flows to the sink.
Check for sanitization, encoding, validation.
Determine exploitability and create PoC if exploitable.

Append findings to: ${outputDir}/frontend/frontend-analysis.md`,
		});
	}

	// PostMessage Analyzer prompts
	for (const handler of findings.postMessageHandlers) {
		prompts.push({
			agentType: "postmessage-analyzer",
			prompt: `Analyze postMessage handler in ${handler.file}:${handler.line}

Check origin validation, trace event.data usage.
Identify exploitable patterns.

Append findings to: ${outputDir}/frontend/frontend-analysis.md`,
		});
	}

	// API Investigator prompts
	for (const endpoint of findings.apiEndpoints) {
		prompts.push({
			agentType: "api-investigator",
			prompt: `Investigate API endpoint: ${endpoint.method} ${endpoint.path}

Find usage in code, document parameters, assess IDOR/CSRF risk.

Append findings to: ${outputDir}/backend/api-analysis.md`,
		});
	}

	// Secrets Analyzer (single agent for all secrets)
	if (findings.secretsFound) {
		prompts.push({
			agentType: "secrets-analyzer",
			prompt: `Analyze secrets found in ${target.targetDir}

Read raw/combined-tool-results.json for secrets.
Classify each: API key, JWT, AWS creds, etc.
Assess risk and impact of each.

Write to: ${outputDir}/backend/secrets.md`,
		});
	}

	return prompts;
}

/**
 * Setup output directories
 */
export function generateSetupScript(outputDir: string): string {
	return `
mkdir -p "${outputDir}/frontend"
mkdir -p "${outputDir}/backend"
mkdir -p "${outputDir}/raw"
`.trim();
}

/**
 * Performance expectations by phase
 */
export const PHASE_PERFORMANCE = {
	"1-3": {
		agents: 3,
		parallel: true,
		expectedTime: "30-60 sec",
	},
	"3.5": {
		agents: 1,
		parallel: false,
		expectedTime: "30-90 sec",
	},
	"4": {
		agents: "N (dynamic)",
		parallel: true,
		expectedTime: "1-3 min",
	},
	"5": {
		agents: 0,
		parallel: false,
		expectedTime: "10-20 sec",
	},
} as const;

/**
 * Critical orchestrator rules
 */
export const ORCHESTRATOR_RULES = [
	"Primary context = orchestrator only - Never run greps or parse JSON directly",
	"All analysis in agents - Spawn agents for any heavy processing",
	"Parallel whenever possible - Launch independent agents in single message",
	"opus for reasoning - Architecture, source-sink tracing, security analysis",
	"haiku for enumeration - Grep patterns, tool execution, file listing",
	"client-path-extractor is EXHAUSTIVE - It reads everything to find every path",
] as const;
