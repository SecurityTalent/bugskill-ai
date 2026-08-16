/**
 * JsAnalyzer - Main Entry Point
 * Orchestrator-based JavaScript security analysis
 *
 * @version 2.0.0
 * @author xssdoctor
 */

// Type exports
export type {
	ModelType,
	WorkflowPhase,
	AgentConfig,
	OutputFile,
	PhaseConfig,
	WorkflowConfig,
	AnalysisTarget,
	AgentPromptParams,
	ScanStatistics,
	FindingsSummary,
} from "./types/index.ts";

// Configuration exports
export {
	PHASE_1_3_AGENTS,
	PHASE_3_5_AGENT,
	PHASE_4_AGENTS,
	ALL_AGENT_TYPES,
	getAgentConfig,
	getPhaseAgents,
} from "./configs/agents.ts";

export {
	FRONTEND_OUTPUTS,
	BACKEND_OUTPUTS,
	RAW_OUTPUTS,
	SUMMARY_OUTPUTS,
	ALL_OUTPUTS,
	OUTPUT_DIRECTORIES,
	OUTPUT_FILE_TREE,
	getOutputsByCreator,
	getOutputsByCategory,
} from "./configs/outputs.ts";

export {
	FULL_SCAN_WORKFLOW,
	ANALYZE_WORKFLOW,
	REVIEW_WORKFLOW,
	ALL_WORKFLOWS,
	WORKFLOW_ROUTING,
	getWorkflow,
	determineWorkflow,
	type WorkflowTrigger,
} from "./configs/workflows.ts";

export {
	CLIENT_PATH_PATTERNS,
	API_ENDPOINT_PATTERNS,
	SOURCE_PATTERNS,
	SINK_PATTERNS,
	SECRET_PATTERNS,
	ALL_PATTERNS,
	getPatternsByCategory,
	getPatternsByRisk,
	getCriticalPatterns,
	type GrepPattern,
} from "./configs/grep-patterns.ts";

// Orchestrator exports
export {
	generatePhase1_3Prompts,
	generatePhase3_5Prompt,
	generatePhase4Prompts,
	generateSetupScript,
	PHASE_PERFORMANCE,
	ORCHESTRATOR_RULES,
	type Phase4Targets,
} from "./orchestrators/fullscan.ts";

export {
	generateFileFindCommand,
	generateGrepConfigs,
	getDoctorswzlConfig,
	generateToolScript,
	OUTPUT_TEMPLATES as ANALYZE_TEMPLATES,
	ANALYZE_CAPABILITIES,
	type GrepConfig,
	type ToolConfig,
} from "./orchestrators/analyze.ts";

export {
	REQUIRED_FILES,
	generatePrerequisiteCheck,
	generateLoadCommands,
	generateSourceSinkPrompt,
	generateApiPrompt,
	generatePostMessagePrompt,
	generateSecretsPrompt,
	SYNTHESIS_TEMPLATES,
	REVIEW_AGENTS,
} from "./orchestrators/review.ts";

/**
 * Main version information
 */
export const VERSION = {
	version: "2.0.0",
	lastUpdated: "2026-01-09",
	author: "xssdoctor",
} as const;

import {
	getAgentConfig as _getAgentConfig,
	getPhaseAgents as _getPhaseAgents,
} from "./configs/agents.ts";
import {
	getCriticalPatterns as _getCriticalPatterns,
	getPatternsByCategory as _getPatternsByCategory,
} from "./configs/grep-patterns.ts";
import {
	getOutputsByCategory as _getOutputsByCategory,
	getOutputsByCreator as _getOutputsByCreator,
} from "./configs/outputs.ts";
/**
 * Quick reference for common operations
 */
import {
	determineWorkflow as _determineWorkflow,
	getWorkflow,
} from "./configs/workflows.ts";
import {
	generatePhase1_3Prompts as _generatePhase1_3Prompts,
	generatePhase3_5Prompt as _generatePhase3_5Prompt,
	generatePhase4Prompts as _generatePhase4Prompts,
} from "./orchestrators/fullscan.ts";

export const QUICK_REFERENCE = {
	// Workflow selection
	determineWorkflow: _determineWorkflow,
	getWorkflow,

	// Agent configs
	getAgentConfig: _getAgentConfig,
	getPhaseAgents: _getPhaseAgents,

	// Output structure
	getOutputsByCategory: _getOutputsByCategory,
	getOutputsByCreator: _getOutputsByCreator,

	// Patterns
	getPatternsByCategory: _getPatternsByCategory,
	getCriticalPatterns: _getCriticalPatterns,

	// Prompt generation
	generatePhase1_3Prompts: _generatePhase1_3Prompts,
	generatePhase3_5Prompt: _generatePhase3_5Prompt,
	generatePhase4Prompts: _generatePhase4Prompts,
} as const;

/**
 * Documentation URLs
 */
export const DOCS = {
	skill: "${PAI_DIR}/skills/JsAnalyzer/SKILL.md",
	workflows: {
		fullscan: "${PAI_DIR}/skills/JsAnalyzer/workflows/FullScan.md",
		analyze: "${PAI_DIR}/skills/JsAnalyzer/workflows/Analyze.md",
		review: "${PAI_DIR}/skills/JsAnalyzer/workflows/Review.md",
	},
	agents: {
		jsGrepAnalyzer: "${PAI_DIR}/agents/JsGrepAnalyzer.md",
		jsToolRunner: "${PAI_DIR}/agents/JsToolRunner.md",
		jsArchitectureAnalyzer: "${PAI_DIR}/agents/JsArchitectureAnalyzer.md",
		clientPathExtractor: "${PAI_DIR}/agents/ClientPathExtractor.md",
		sourceSinkTracer: "${PAI_DIR}/agents/SourceSinkTracer.md",
		postMessageAnalyzer: "${PAI_DIR}/agents/PostMessageAnalyzer.md",
		apiInvestigator: "${PAI_DIR}/agents/ApiInvestigator.md",
		secretsAnalyzer: "${PAI_DIR}/agents/SecretsAnalyzer.md",
	},
	tool: "${PAI_DIR}/doctorswzl/",
} as const;
