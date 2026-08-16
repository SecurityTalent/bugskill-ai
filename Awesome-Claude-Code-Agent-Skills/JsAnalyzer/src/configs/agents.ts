/**
 * Agent Configurations for JsAnalyzer
 * Centralized agent definitions used across workflows
 */

import type { AgentConfig } from "../types/index.ts";

/**
 * Phase 1-3 Analysis Agents (Parallel)
 * Fast enumeration and initial analysis
 */
export const PHASE_1_3_AGENTS: AgentConfig[] = [
	{
		type: "js-grep-analyzer",
		model: "haiku",
		purpose: "Fast grep extraction of API paths and sources/sinks",
		expectedTime: "20-30 sec",
	},
	{
		type: "js-tool-runner",
		model: "haiku",
		purpose: "Execute doctorswzl tool and generate raw JSON output",
		expectedTime: "30-45 sec",
	},
	{
		type: "js-architecture-analyzer",
		model: "opus",
		purpose: "Deep architecture analysis and design pattern identification",
		expectedTime: "30-60 sec",
	},
];

/**
 * Phase 3.5 Client Path Extraction Agent (EXHAUSTIVE)
 * Dedicated agent for comprehensive client-side path discovery
 */
export const PHASE_3_5_AGENT: AgentConfig = {
	type: "client-path-extractor",
	model: "opus",
	purpose: "Exhaustive extraction of EVERY client-side path from all sources",
	expectedTime: "30-90 sec",
};

/**
 * Phase 4 Deep-Dive Agents (Parallel, Dynamic Count)
 * Security analysis and vulnerability confirmation
 */
export const PHASE_4_AGENTS: Record<string, AgentConfig> = {
	sourceSinkTracer: {
		type: "source-sink-tracer",
		model: "opus",
		purpose: "Trace data flows from sources to sinks, assess exploitability",
		expectedTime: "45-90 sec per flow",
	},
	postMessageAnalyzer: {
		type: "postmessage-analyzer",
		model: "opus",
		purpose: "Analyze postMessage handlers for origin validation bypasses",
		expectedTime: "30-60 sec per handler",
	},
	apiInvestigator: {
		type: "api-investigator",
		model: "opus",
		purpose: "Investigate API endpoints for IDOR, CSRF, and injection risks",
		expectedTime: "30-45 sec per endpoint",
	},
	secretsAnalyzer: {
		type: "secrets-analyzer",
		model: "opus",
		purpose: "Classify and assess impact of exposed secrets",
		expectedTime: "20-40 sec total",
	},
};

/**
 * All agent types used in JsAnalyzer
 */
export const ALL_AGENT_TYPES = [
	...PHASE_1_3_AGENTS.map((a) => a.type),
	PHASE_3_5_AGENT.type,
	...Object.values(PHASE_4_AGENTS).map((a) => a.type),
];

/**
 * Agent configuration lookup by type
 */
export function getAgentConfig(type: string): AgentConfig | undefined {
	const allAgents = [
		...PHASE_1_3_AGENTS,
		PHASE_3_5_AGENT,
		...Object.values(PHASE_4_AGENTS),
	];
	return allAgents.find((agent) => agent.type === type);
}

/**
 * Get agents for specific phase
 */
export function getPhaseAgents(phase: "1-3" | "3.5" | "4"): AgentConfig[] {
	switch (phase) {
		case "1-3":
			return PHASE_1_3_AGENTS;
		case "3.5":
			return [PHASE_3_5_AGENT];
		case "4":
			return Object.values(PHASE_4_AGENTS);
		default:
			return [];
	}
}
