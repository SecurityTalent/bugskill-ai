/**
 * SubdomainEnum Basic Usage Examples
 * Demonstrates how to use the SubdomainEnum workflows
 */

import {
  SubdomainEnumOrchestrator,
  WorkflowRouter,
  createConfig,
  ConfigValidator,
} from '../orchestration';
import { QuickEnumWorkflow } from '../workflows/quick-enum';
import { FullEnumWorkflow } from '../workflows/full-enum';
import { CloudEnumWorkflow } from '../workflows/cloud-enum';
import { PermutationEnumWorkflow } from '../workflows/permutation-enum';
import { AgentCoordinator } from '../agents/coordination';

/**
 * Example 1: Quick enumeration with orchestrator
 */
async function exampleQuickEnum() {
  console.log('=== Example 1: Quick Enum ===\n');

  // Create configuration
  const config = createConfig({
    target: 'example.com',
    mode: 'quick',
    outputDir: './example-quick',
  });

  // Validate configuration
  ConfigValidator.validateOrThrow(config);

  // Create orchestrator
  const orchestrator = new SubdomainEnumOrchestrator(config);

  // Execute workflow
  const result = await orchestrator.execute();

  // Generate report
  const report = orchestrator.generateReport(result);
  console.log(report);
}

/**
 * Example 2: Full enumeration with wordlist
 */
async function exampleFullEnum() {
  console.log('=== Example 2: Full Enum ===\n');

  // Create configuration
  const config = createConfig({
    target: 'example.com',
    mode: 'full',
    outputDir: './example-full',
    wordlistPath: '/path/to/wordlists/subdomains-top1million-20000.txt',
  });

  // Validate
  ConfigValidator.validateOrThrow(config);

  // Execute
  const orchestrator = new SubdomainEnumOrchestrator(config);
  const result = await orchestrator.execute();

  console.log(orchestrator.generateReport(result));
}

/**
 * Example 3: Cloud enumeration
 */
async function exampleCloudEnum() {
  console.log('=== Example 3: Cloud Enum ===\n');

  const config = createConfig({
    target: 'example.com',
    mode: 'cloud',
    outputDir: './example-cloud',
  });

  const orchestrator = new SubdomainEnumOrchestrator(config);
  const result = await orchestrator.execute();

  console.log(orchestrator.generateReport(result));
}

/**
 * Example 4: Using workflow directly
 */
async function exampleDirectWorkflow() {
  console.log('=== Example 4: Direct Workflow Usage ===\n');

  const config = createConfig({
    target: 'example.com',
    mode: 'quick',
    outputDir: './example-direct',
  });

  // Use workflow class directly
  const workflow = new QuickEnumWorkflow(config);
  const result = await workflow.execute();

  console.log('Result:', result);
}

/**
 * Example 5: Getting workflow commands
 */
function exampleGetCommands() {
  console.log('=== Example 5: Generate Commands ===\n');

  // Get commands for quick enum
  const quickCommands = QuickEnumWorkflow.getCommands('example.com');
  console.log('Quick Enum Commands:');
  console.log(quickCommands.join('\n'));
  console.log();

  // Get commands for full enum
  const fullCommands = FullEnumWorkflow.getCommands(
    'example.com',
    '/path/to/wordlists/subdomains.txt',
    './example-full'
  );
  console.log('Full Enum Commands:');
  console.log(fullCommands.join('\n'));
}

/**
 * Example 6: Using agent coordinator
 */
async function exampleAgentCoordination() {
  console.log('=== Example 6: Agent Coordination ===\n');

  const target = 'example.com';
  const outputDir = './example-agents';

  // Create passive task
  const passiveTask = AgentCoordinator.passiveTask(target, outputDir);
  console.log('Passive Task:', passiveTask);

  // Create prober task
  const proberTask = AgentCoordinator.proberTask(
    target,
    `${outputDir}/${target}-passive-all.txt`,
    outputDir
  );
  console.log('Prober Task:', proberTask);

  // Get full workflow tasks
  const fullWorkflow = AgentCoordinator.fullEnumWorkflow(
    target,
    '/path/to/wordlist.txt',
    outputDir
  );
  console.log('Full Workflow:');
  console.log('Phase 1:', fullWorkflow.phase1);
  console.log('Phase 2 (parallel):', fullWorkflow.phase2);
  console.log('Phase 3:', fullWorkflow.phase3);
}

/**
 * Example 7: Workflow routing
 */
function exampleWorkflowRouting() {
  console.log('=== Example 7: Workflow Routing ===\n');

  const inputs = [
    'quick subdomain scan',
    'full comprehensive enum',
    'cloud cert scanning',
    'permutation scan',
    'fast passive enum',
  ];

  inputs.forEach(input => {
    const mode = WorkflowRouter.route(input);
    const notification = WorkflowRouter.getNotification(mode);
    console.log(`Input: "${input}"`);
    console.log(`Mode: ${mode}`);
    console.log(`Notification: ${notification}`);
    console.log();
  });
}

/**
 * Example 8: Configuration validation
 */
function exampleValidation() {
  console.log('=== Example 8: Configuration Validation ===\n');

  // Valid config
  const validConfig = createConfig({
    target: 'example.com',
    mode: 'quick',
  });
  const validResult = ConfigValidator.validate(validConfig);
  console.log('Valid config:', validResult);

  // Invalid config - bad domain
  const invalidConfig1 = createConfig({
    target: 'not-a-domain',
    mode: 'quick',
  });
  const invalidResult1 = ConfigValidator.validate(invalidConfig1);
  console.log('Invalid domain:', invalidResult1);

  // Invalid config - full mode without wordlist
  const invalidConfig2 = createConfig({
    target: 'example.com',
    mode: 'full',
  });
  const invalidResult2 = ConfigValidator.validate(invalidConfig2);
  console.log('Full without wordlist:', invalidResult2);
}

/**
 * Example 9: Getting workflow metadata
 */
function exampleWorkflowMetadata() {
  console.log('=== Example 9: Workflow Metadata ===\n');

  // Quick enum metadata
  console.log('QuickEnum:');
  console.log('Description:', QuickEnumWorkflow.getDescription());
  console.log('Time estimate:', QuickEnumWorkflow.getTimeEstimate());
  console.log('Prerequisites:', QuickEnumWorkflow.getPrerequisites());
  console.log('Usage:', QuickEnumWorkflow.getUsageGuidance());
  console.log();

  // Cloud enum metadata
  console.log('CloudEnum:');
  console.log('Concept:', CloudEnumWorkflow.getConcept());
  console.log('Pro tips:', CloudEnumWorkflow.getProTips());
  console.log('Update frequency:', CloudEnumWorkflow.getUpdateFrequency());
  console.log();

  // Permutation enum metadata
  console.log('PermutationEnum:');
  console.log('Concept:', PermutationEnumWorkflow.getConcept());
  console.log('Performance tips:', PermutationEnumWorkflow.getPerformanceTips());
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('SubdomainEnum Usage Examples\n');
  console.log('=' .repeat(60));
  console.log();

  // Run examples
  // exampleGetCommands();
  // exampleWorkflowRouting();
  // exampleValidation();
  // exampleWorkflowMetadata();
  // await exampleAgentCoordination();

  // Uncomment to run actual workflows:
  // await exampleQuickEnum();
  // await exampleFullEnum();
  // await exampleCloudEnum();
  // await exampleDirectWorkflow();

  console.log('\nAll examples complete!');
}

// Uncomment to run:
// main().catch(console.error);

export {
  exampleQuickEnum,
  exampleFullEnum,
  exampleCloudEnum,
  exampleDirectWorkflow,
  exampleGetCommands,
  exampleAgentCoordination,
  exampleWorkflowRouting,
  exampleValidation,
  exampleWorkflowMetadata,
};
