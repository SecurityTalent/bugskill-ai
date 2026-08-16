/**
 * SubdomainEnum Agent Coordination
 * Patterns and utilities for coordinating specialized subdomain enumeration agents
 */

import type { AgentTask, AgentType, ModelType } from '../types';

/**
 * Agent definitions with their capabilities and recommended models
 */
export const AGENTS = {
  orchestrator: {
    type: 'subdomain-orchestrator' as AgentType,
    model: 'sonnet' as ModelType,
    description: 'Coordinates full enumeration workflow',
    capabilities: ['coordination', 'planning', 'reporting'],
  },
  passive: {
    type: 'subdomain-passive' as AgentType,
    model: 'haiku' as ModelType,
    description: 'Passive subdomain collection',
    capabilities: ['subfinder', 'github-subdomains', 'shosubgo'],
  },
  brute: {
    type: 'subdomain-brute' as AgentType,
    model: 'haiku' as ModelType,
    description: 'DNS brute force',
    capabilities: ['puredns-bruteforce', 'wordlist-management'],
  },
  permutation: {
    type: 'subdomain-permutation' as AgentType,
    model: 'haiku' as ModelType,
    description: 'Permutation generation and resolution',
    capabilities: ['dnsgen', 'alterx', 'puredns-resolve'],
  },
  prober: {
    type: 'subdomain-prober' as AgentType,
    model: 'haiku' as ModelType,
    description: 'HTTP probing and live host detection',
    capabilities: ['httpx', 'technology-detection'],
  },
};

/**
 * Agent coordination patterns
 */
export class AgentCoordinator {
  /**
   * Create task for passive enumeration
   */
  static passiveTask(target: string, outputDir: string): AgentTask {
    return {
      agentType: 'subdomain-passive',
      model: 'haiku',
      prompt: `Target: ${target}
Output directory: ${outputDir}

Run passive subdomain enumeration:
1. Subfinder with all sources
2. GitHub-subdomains
3. Shosubgo
4. Merge results to ${outputDir}/${target}-passive-all.txt`,
    };
  }

  /**
   * Create task for DNS brute force
   */
  static bruteTask(
    target: string,
    wordlistPath: string,
    outputDir: string
  ): AgentTask {
    return {
      agentType: 'subdomain-brute',
      model: 'haiku',
      prompt: `Target: ${target}
Wordlist: ${wordlistPath}
Output directory: ${outputDir}

Run DNS brute force:
1. Download fresh resolvers
2. Run puredns bruteforce
3. Output to ${outputDir}/${target}-brute.txt`,
    };
  }

  /**
   * Create task for permutation scanning
   */
  static permutationTask(
    target: string,
    inputFile: string,
    outputDir: string
  ): AgentTask {
    return {
      agentType: 'subdomain-permutation',
      model: 'haiku',
      prompt: `Target: ${target}
Input file: ${inputFile}
Output directory: ${outputDir}

Run permutation enumeration:
1. Generate permutations with dnsgen/alterx
2. Resolve with puredns
3. Output to ${outputDir}/${target}-permutations.txt`,
    };
  }

  /**
   * Create task for HTTP probing
   */
  static proberTask(
    target: string,
    inputFile: string,
    outputDir: string
  ): AgentTask {
    return {
      agentType: 'subdomain-prober',
      model: 'haiku',
      prompt: `Target: ${target}
Input file: ${inputFile}
Output directory: ${outputDir}

Run HTTP probing:
1. Probe with httpx (basic + detailed)
2. Extract live hosts
3. Output to ${outputDir}/${target}-live.txt and ${outputDir}/${target}-live-detailed.txt`,
    };
  }

  /**
   * Launch parallel brute force and permutation
   */
  static parallelBruteAndPermutation(
    target: string,
    wordlistPath: string,
    passiveFile: string,
    outputDir: string
  ): AgentTask[] {
    return [
      {
        ...this.bruteTask(target, wordlistPath, outputDir),
        runInBackground: true,
      },
      {
        ...this.permutationTask(target, passiveFile, outputDir),
        runInBackground: true,
      },
    ];
  }

  /**
   * Quick enumeration workflow (passive + probe)
   */
  static quickEnumWorkflow(target: string, outputDir: string): AgentTask[] {
    return [
      this.passiveTask(target, outputDir),
      this.proberTask(target, `${outputDir}/${target}-passive-all.txt`, outputDir),
    ];
  }

  /**
   * Full enumeration workflow (all phases)
   */
  static fullEnumWorkflow(
    target: string,
    wordlistPath: string,
    outputDir: string
  ): {
    phase1: AgentTask;
    phase2: AgentTask[];
    phase3: AgentTask;
  } {
    return {
      phase1: this.passiveTask(target, outputDir),
      phase2: this.parallelBruteAndPermutation(
        target,
        wordlistPath,
        `${outputDir}/${target}-passive-all.txt`,
        outputDir
      ),
      phase3: this.proberTask(
        target,
        `${outputDir}/${target}-all-subdomains.txt`,
        outputDir
      ),
    };
  }

  /**
   * Orchestrator task for comprehensive enum
   */
  static orchestratorTask(
    target: string,
    mode: 'quick' | 'full',
    outputDir: string,
    wordlistFolder?: string
  ): AgentTask {
    return {
      agentType: 'subdomain-orchestrator',
      model: 'sonnet',
      prompt: `Target: ${target}
Mode: ${mode}
${wordlistFolder ? `Wordlist folder: ${wordlistFolder}` : ''}
Output directory: ${outputDir}

Orchestrate ${mode} subdomain enumeration using specialized agents.`,
    };
  }
}

/**
 * Agent execution helpers
 */
export class AgentExecutor {
  /**
   * Format agent prompt with standard structure
   */
  static formatPrompt(params: {
    target: string;
    inputFile?: string;
    outputDir: string;
    instructions: string[];
  }): string {
    const parts = [
      `Target: ${params.target}`,
      params.inputFile ? `Input file: ${params.inputFile}` : null,
      `Output directory: ${params.outputDir}`,
      '',
      params.instructions.join('\n'),
    ];

    return parts.filter(Boolean).join('\n');
  }

  /**
   * Parse agent output for file paths
   */
  static parseOutputFiles(output: string): string[] {
    const filePattern = /(?:^|\s)([\w\-./]+\.txt)(?:\s|$)/g;
    const matches = output.matchAll(filePattern);
    return Array.from(matches, m => m[1]);
  }

  /**
   * Wait for parallel agents to complete
   * (Pseudocode - would use actual Task/TaskOutput tools in practice)
   */
  static async waitForParallelTasks(taskIds: string[]): Promise<void> {
    // In practice, use TaskOutput tool to poll for completion
    console.log(`Waiting for ${taskIds.length} parallel tasks...`);
  }

  /**
   * Build agent coordination script
   */
  static buildCoordinationScript(workflow: 'quick' | 'full'): string {
    if (workflow === 'quick') {
      return `# Quick Enum Coordination
# 1. Launch passive agent
# 2. Wait for completion
# 3. Launch prober agent
# 4. Generate final report`;
    }

    return `# Full Enum Coordination
# Phase 1: Passive enumeration
#   - Launch subdomain-passive agent
#   - Wait for completion
#
# Phase 2: Parallel brute force and permutation
#   - Launch subdomain-brute (background)
#   - Launch subdomain-permutation (background)
#   - Wait for both to complete
#
# Phase 3: Merge results
#   - Combine passive + brute + permutations
#   - Deduplicate with sort -u
#
# Phase 4: Probing
#   - Launch subdomain-prober agent
#   - Wait for completion
#
# Phase 5: Final report
#   - Count results per phase
#   - List output files
#   - Highlight interesting findings`;
  }
}

/**
 * Error handling patterns for agent coordination
 */
export class AgentErrorHandler {
  /**
   * Handle agent failure
   */
  static handleFailure(agentType: AgentType, error: string): void {
    console.error(`[${agentType}] Failed: ${error}`);
  }

  /**
   * Continue with partial results
   */
  static continueWithPartial(
    completedPhases: string[],
    failedPhases: string[]
  ): boolean {
    // If passive phase succeeded, we can continue
    return completedPhases.includes('passive');
  }

  /**
   * Generate error report
   */
  static errorReport(errors: Record<string, string>): string {
    const errorList = Object.entries(errors)
      .map(([agent, error]) => `  - ${agent}: ${error}`)
      .join('\n');

    return `Errors encountered during enumeration:\n${errorList}`;
  }
}
