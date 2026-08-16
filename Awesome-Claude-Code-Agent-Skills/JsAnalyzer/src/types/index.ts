/**
 * JsAnalyzer Type Definitions
 * Shared types for orchestrators and configurations
 */

export type ModelType = "opus" | "sonnet" | "haiku";

export type WorkflowPhase =
	| "setup"
	| "phase-1-3"
	| "phase-3.5"
	| "phase-4"
	| "phase-5";

export interface AgentConfig {
	type: string;
	model: ModelType;
	purpose: string;
	expectedTime?: string;
}

export interface OutputFile {
	path: string;
	description: string;
	createdBy: string;
}

export interface PhaseConfig {
	name: string;
	agents: AgentConfig[];
	parallel: boolean;
	description: string;
}

export interface WorkflowConfig {
	name: string;
	version: string;
	description: string;
	phases: PhaseConfig[];
	outputFiles: OutputFile[];
}

export interface AnalysisTarget {
	targetDir: string;
	outputDir: string;
	includePatterns?: string[];
	excludePatterns?: string[];
}

export interface AgentPromptParams {
	targetDir: string;
	outputDir: string;
	outputFiles?: string[];
	additionalContext?: string;
}

export interface ScanStatistics {
	filesScanned: number;
	clientPaths: number;
	apiEndpoints: number;
	sources: number;
	sinks: number;
	vulnerabilities: {
		critical: number;
		high: number;
		medium: number;
		low: number;
	};
	agentsSpawned: number;
}

export interface FindingsSummary {
	confirmedExploitable: number;
	needsManualTesting: number;
	notExploitable: number;
	postMessageHandlers: {
		vulnerable: number;
		safe: number;
	};
}
