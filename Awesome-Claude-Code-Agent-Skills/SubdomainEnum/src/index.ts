/**
 * SubdomainEnum - Entry Point
 * Comprehensive subdomain enumeration following TBHM methodology
 */

// Types
export * from './types';

// Orchestration
export {
  SubdomainEnumOrchestrator,
  WorkflowRouter,
  createConfig,
  ConfigValidator,
} from './orchestration';

// Workflows
export { QuickEnumWorkflow } from './workflows/quick-enum';
export { FullEnumWorkflow } from './workflows/full-enum';
export { CloudEnumWorkflow } from './workflows/cloud-enum';
export { PermutationEnumWorkflow } from './workflows/permutation-enum';

// Agents
export { AgentCoordinator, AgentExecutor, AgentErrorHandler } from './agents/coordination';

// Configs
export { CommandBuilder, TOOLS, INSTALL_COMMANDS } from './configs/tools';
export { WORDLISTS, getRecommendedWordlist, generatePatternFile } from './configs/wordlists';
export { ResolverManager, getResolverPath } from './configs/resolvers';
export { API_KEY_SOURCES, getSecretsPath } from './configs/api-keys';

/**
 * Quick usage example
 */
export const USAGE_EXAMPLE = `
// Import the orchestrator
import { SubdomainEnumOrchestrator, createConfig } from './src';

// Create config
const config = createConfig({
  target: 'example.com',
  mode: 'quick',
  outputDir: './example-enum',
});

// Execute
const orchestrator = new SubdomainEnumOrchestrator(config);
const result = await orchestrator.execute();

// Generate report
const report = orchestrator.generateReport(result);
console.log(report);
`;

/**
 * Version info
 */
export const VERSION = '1.0.0';
export const AUTHOR = 'xssdoctor';
export const SOURCE = 'TBHM (The Bug Hunter\'s Methodology) by Jason Haddix';
