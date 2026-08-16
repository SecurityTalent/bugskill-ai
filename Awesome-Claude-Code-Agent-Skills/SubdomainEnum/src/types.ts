/**
 * SubdomainEnum Type Definitions
 * Core types for subdomain enumeration workflows
 */

export type EnumMode = 'quick' | 'full' | 'cloud' | 'permutation';

export type AgentType =
  | 'subdomain-orchestrator'
  | 'subdomain-passive'
  | 'subdomain-brute'
  | 'subdomain-permutation'
  | 'subdomain-prober';

export type ModelType = 'opus' | 'sonnet' | 'haiku';

export interface EnumConfig {
  target: string;
  mode: EnumMode;
  outputDir: string;
  wordlistPath?: string;
  wordlistFolder?: string;
}

export interface WorkflowResult {
  success: boolean;
  subdomainCount: number;
  liveCount: number;
  outputFiles: OutputFiles;
  duration?: number;
  errors?: string[];
}

export interface OutputFiles {
  allSubdomains: string;
  liveHosts: string;
  liveDetailed: string;
  passive?: string;
  brute?: string;
  permutations?: string;
  github?: string;
  shodan?: string;
}

export interface ToolConfig {
  name: string;
  command: string;
  flags: string[];
  description: string;
}

export interface PhaseResult {
  phase: string;
  count: number;
  outputFile: string;
  duration: number;
  errors?: string[];
}

export interface AgentTask {
  agentType: AgentType;
  model: ModelType;
  prompt: string;
  runInBackground?: boolean;
}

export interface ResolverConfig {
  url: string;
  localPath: string;
  updateFrequency: 'daily' | 'weekly';
}

export interface WordlistConfig {
  name: string;
  size: number;
  useCase: 'quick' | 'standard' | 'comprehensive' | 'maximum';
  path?: string;
}

export interface APIKeyConfig {
  service: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  cost: 'free' | 'paid';
  signupUrl: string;
}
