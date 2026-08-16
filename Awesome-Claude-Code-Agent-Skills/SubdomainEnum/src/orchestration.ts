/**
 * SubdomainEnum Orchestration
 * Main orchestration logic for coordinating subdomain enumeration workflows
 */

import type { EnumConfig, EnumMode, WorkflowResult } from './types';
import { AgentCoordinator } from './agents/coordination';
import { QuickEnumWorkflow } from './workflows/quick-enum';
import { FullEnumWorkflow } from './workflows/full-enum';
import { CloudEnumWorkflow } from './workflows/cloud-enum';
import { PermutationEnumWorkflow } from './workflows/permutation-enum';

/**
 * Main orchestrator for subdomain enumeration
 */
export class SubdomainEnumOrchestrator {
  private config: EnumConfig;

  constructor(config: EnumConfig) {
    this.config = config;
  }

  /**
   * Execute workflow based on mode
   */
  async execute(): Promise<WorkflowResult> {
    const { mode } = this.config;

    switch (mode) {
      case 'quick':
        return this.executeQuick();
      case 'full':
        return this.executeFull();
      case 'cloud':
        return this.executeCloud();
      case 'permutation':
        return this.executePermutation();
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  }

  /**
   * Execute quick enumeration workflow
   */
  private async executeQuick(): Promise<WorkflowResult> {
    console.log('Running the **QuickEnum** workflow from the **SubdomainEnum** skill...');

    const workflow = new QuickEnumWorkflow(this.config);
    return workflow.execute();
  }

  /**
   * Execute full enumeration workflow
   */
  private async executeFull(): Promise<WorkflowResult> {
    console.log('Running the **FullEnum** workflow from the **SubdomainEnum** skill...');

    if (!this.config.wordlistPath && !this.config.wordlistFolder) {
      throw new Error('Wordlist path or folder required for full enumeration');
    }

    const workflow = new FullEnumWorkflow(this.config);
    return workflow.execute();
  }

  /**
   * Execute cloud enumeration workflow
   */
  private async executeCloud(): Promise<WorkflowResult> {
    console.log('Running the **CloudEnum** workflow from the **SubdomainEnum** skill...');

    const workflow = new CloudEnumWorkflow(this.config);
    return workflow.execute();
  }

  /**
   * Execute permutation enumeration workflow
   */
  private async executePermutation(): Promise<WorkflowResult> {
    console.log(
      'Running the **PermutationEnum** workflow from the **SubdomainEnum** skill...'
    );

    // Permutation needs an existing subdomain list
    const inputFile = `${this.config.outputDir}/${this.config.target}-subdomains.txt`;

    const workflow = new PermutationEnumWorkflow(this.config);
    return workflow.execute(inputFile);
  }

  /**
   * Generate final report
   */
  generateReport(result: WorkflowResult): string {
    const { target } = this.config;
    const duration = result.duration
      ? `${Math.round(result.duration / 1000)}s`
      : 'unknown';

    const report = `
=== SubdomainEnum Complete ===
Target: ${target}
Mode: ${this.config.mode}
Duration: ${duration}

Results:
  Total subdomains: ${result.subdomainCount}
  Live hosts: ${result.liveCount}

Output Files:
  All subdomains: ${result.outputFiles.allSubdomains}
  Live hosts: ${result.outputFiles.liveHosts}
  Live detailed: ${result.outputFiles.liveDetailed}
${result.outputFiles.passive ? `  Passive: ${result.outputFiles.passive}` : ''}
${result.outputFiles.brute ? `  Brute force: ${result.outputFiles.brute}` : ''}
${result.outputFiles.permutations ? `  Permutations: ${result.outputFiles.permutations}` : ''}

${result.errors && result.errors.length > 0 ? `Errors:\n${result.errors.map(e => `  - ${e}`).join('\n')}` : ''}
    `.trim();

    return report;
  }

  /**
   * Execute with agent coordination
   */
  async executeWithAgents(): Promise<WorkflowResult> {
    const { mode, target, outputDir, wordlistPath } = this.config;

    if (mode === 'quick') {
      // Quick: passive + probe
      const tasks = AgentCoordinator.quickEnumWorkflow(target, outputDir);
      console.log('Launching passive agent...');
      // In practice: use Task tool to launch agents
      console.log(`Task 1: ${tasks[0].agentType}`);
      console.log(`Task 2: ${tasks[1].agentType}`);
    } else if (mode === 'full' && wordlistPath) {
      // Full: all phases with parallel brute + permutation
      const workflow = AgentCoordinator.fullEnumWorkflow(
        target,
        wordlistPath,
        outputDir
      );

      console.log('Phase 1: Launching passive agent...');
      console.log(`Task: ${workflow.phase1.agentType}`);

      console.log('Phase 2: Launching parallel brute + permutation agents...');
      workflow.phase2.forEach(task => {
        console.log(`Task: ${task.agentType} (background: ${task.runInBackground})`);
      });

      console.log('Phase 3: Launching prober agent...');
      console.log(`Task: ${workflow.phase3.agentType}`);
    }

    // Placeholder return
    return {
      success: true,
      subdomainCount: 0,
      liveCount: 0,
      outputFiles: {
        allSubdomains: `${outputDir}/${target}-all.txt`,
        liveHosts: `${outputDir}/${target}-live.txt`,
        liveDetailed: `${outputDir}/${target}-live-detailed.txt`,
      },
    };
  }
}

/**
 * Workflow router based on triggers
 */
export class WorkflowRouter {
  /**
   * Route to appropriate workflow based on user input
   */
  static route(input: string): EnumMode {
    const lower = input.toLowerCase();

    if (
      lower.includes('quick') ||
      lower.includes('fast') ||
      lower.includes('passive only')
    ) {
      return 'quick';
    }

    if (
      lower.includes('cloud') ||
      lower.includes('cert') ||
      lower.includes('kaeferjaeger')
    ) {
      return 'cloud';
    }

    if (
      lower.includes('permutation') ||
      lower.includes('alteration') ||
      lower.includes('pattern')
    ) {
      return 'permutation';
    }

    if (
      lower.includes('full') ||
      lower.includes('comprehensive') ||
      lower.includes('complete')
    ) {
      return 'full';
    }

    // Default to quick
    return 'quick';
  }

  /**
   * Get workflow notification message
   */
  static getNotification(mode: EnumMode): string {
    const workflows = {
      quick: 'QuickEnum',
      full: 'FullEnum',
      cloud: 'CloudEnum',
      permutation: 'PermutationEnum',
    };

    return `Running the **${workflows[mode]}** workflow from the **SubdomainEnum** skill...`;
  }
}

/**
 * Helper to create config from user input
 */
export function createConfig(params: {
  target: string;
  mode: EnumMode;
  outputDir?: string;
  wordlistPath?: string;
  wordlistFolder?: string;
}): EnumConfig {
  return {
    target: params.target,
    mode: params.mode,
    outputDir: params.outputDir || `./${params.target}-enum`,
    wordlistPath: params.wordlistPath,
    wordlistFolder: params.wordlistFolder,
  };
}

/**
 * Validation helpers
 */
export class ConfigValidator {
  /**
   * Validate configuration
   */
  static validate(config: EnumConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate target
    if (!config.target || config.target.trim().length === 0) {
      errors.push('Target domain is required');
    }

    // Validate domain format
    if (config.target && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(config.target)) {
      errors.push('Invalid domain format');
    }

    // Validate full mode requirements
    if (config.mode === 'full') {
      if (!config.wordlistPath && !config.wordlistFolder) {
        errors.push('Wordlist path or folder required for full enumeration');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate and throw if invalid
   */
  static validateOrThrow(config: EnumConfig): void {
    const { valid, errors } = this.validate(config);

    if (!valid) {
      throw new Error(`Invalid configuration:\n${errors.join('\n')}`);
    }
  }
}
