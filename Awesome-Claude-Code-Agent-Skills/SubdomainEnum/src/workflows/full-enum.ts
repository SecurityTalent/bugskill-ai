/**
 * SubdomainEnum Full Workflow
 * Comprehensive subdomain enumeration using all TBHM techniques
 * Deep reconnaissance for high-value targets
 */

import { CommandBuilder } from '../configs/tools';
import { ResolverManager } from '../configs/resolvers';
import type { EnumConfig, WorkflowResult, PhaseResult } from '../types';

export class FullEnumWorkflow {
  private config: EnumConfig;

  constructor(config: EnumConfig) {
    this.config = config;
  }

  /**
   * Execute full enumeration workflow
   */
  async execute(): Promise<WorkflowResult> {
    const { target, outputDir, wordlistPath } = this.config;
    const startTime = Date.now();

    if (!wordlistPath) {
      throw new Error('Wordlist path required for full enumeration');
    }

    const phaseResults: PhaseResult[] = [];

    try {
      // Setup
      await this.setup();

      // Phase 1: Passive Enumeration
      const passive = await this.phasePassive(target, outputDir);
      phaseResults.push(passive);

      // Phase 2: Brute Force (parallel)
      const brute = await this.phaseBrute(target, wordlistPath, outputDir);
      phaseResults.push(brute);

      // Phase 3: Permutation (parallel with brute)
      const permutation = await this.phasePermutation(
        target,
        passive.outputFile,
        outputDir
      );
      phaseResults.push(permutation);

      // Phase 4: Merge results
      const merged = await this.phaseMerge(target, outputDir, phaseResults);

      // Phase 5: HTTP Probing
      const probing = await this.phaseProbe(target, merged.outputFile, outputDir);
      phaseResults.push(probing);

      // Generate stats
      const stats = await this.generateStats(phaseResults, probing);

      return {
        success: true,
        subdomainCount: merged.count,
        liveCount: probing.count,
        outputFiles: {
          allSubdomains: merged.outputFile,
          liveHosts: `${outputDir}/live.txt`,
          liveDetailed: `${outputDir}/live-detailed.txt`,
          passive: passive.outputFile,
          brute: brute.outputFile,
          permutations: permutation.outputFile,
        },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        subdomainCount: 0,
        liveCount: 0,
        outputFiles: {
          allSubdomains: `${outputDir}/all-subdomains.txt`,
          liveHosts: `${outputDir}/live.txt`,
          liveDetailed: `${outputDir}/live-detailed.txt`,
        },
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Setup: Create directories and download resolvers
   */
  private async setup(): Promise<void> {
    const { target, outputDir } = this.config;

    // Create output directory
    console.log(`[SETUP] mkdir -p ${outputDir}`);

    // Download fresh resolvers
    const resolverCmd = ResolverManager.downloadTemp();
    console.log(`[SETUP] ${resolverCmd}`);
  }

  /**
   * Phase 1: Passive Enumeration
   */
  private async phasePassive(
    target: string,
    outputDir: string
  ): Promise<PhaseResult> {
    const startTime = Date.now();

    // Subfinder
    const subfinderFile = `${outputDir}/subfinder.txt`;
    console.log(`[PASSIVE] ${CommandBuilder.subfinder(target, subfinderFile)}`);

    // GitHub Subdomains
    const githubFile = `${outputDir}/github.txt`;
    console.log(`[PASSIVE] github-subdomains for ${target}`);

    // Shodan
    const shodanFile = `${outputDir}/shodan.txt`;
    console.log(`[PASSIVE] shosubgo for ${target}`);

    // Merge passive results
    const passiveFile = `${outputDir}/passive-all.txt`;
    const mergeCmd = CommandBuilder.mergeFiles(
      [subfinderFile, githubFile, shodanFile],
      passiveFile
    );
    console.log(`[PASSIVE] ${mergeCmd}`);

    return {
      phase: 'Passive Enumeration',
      count: 0, // Placeholder
      outputFile: passiveFile,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Phase 2: DNS Brute Force
   */
  private async phaseBrute(
    target: string,
    wordlistPath: string,
    outputDir: string
  ): Promise<PhaseResult> {
    const startTime = Date.now();
    const bruteFile = `${outputDir}/brute.txt`;

    const bruteCmd = CommandBuilder.puredns Bruteforce(
      wordlistPath,
      target,
      '/tmp/resolvers.txt',
      bruteFile
    );

    console.log(`[BRUTE] ${bruteCmd}`);

    return {
      phase: 'DNS Brute Force',
      count: 0, // Placeholder
      outputFile: bruteFile,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Phase 3: Permutation Scanning
   */
  private async phasePermutation(
    target: string,
    inputFile: string,
    outputDir: string
  ): Promise<PhaseResult> {
    const startTime = Date.now();

    // Generate permutations
    const permutationsRaw = `${outputDir}/permutations-raw.txt`;
    const dnsgenCmd = CommandBuilder.dnsgen(inputFile, permutationsRaw);
    console.log(`[PERMUTATION] ${dnsgenCmd}`);

    // Resolve permutations
    const permutationsFile = `${outputDir}/permutations.txt`;
    const resolveCmd = CommandBuilder.purednsResolve(
      permutationsRaw,
      '/tmp/resolvers.txt',
      permutationsFile
    );
    console.log(`[PERMUTATION] ${resolveCmd}`);

    return {
      phase: 'Permutation Scanning',
      count: 0, // Placeholder
      outputFile: permutationsFile,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Phase 4: Merge All Results
   */
  private async phaseMerge(
    target: string,
    outputDir: string,
    phases: PhaseResult[]
  ): Promise<{ outputFile: string; count: number }> {
    const allFile = `${outputDir}/all-subdomains.txt`;
    const inputFiles = phases.map(p => p.outputFile);

    const mergeCmd = CommandBuilder.mergeFiles(inputFiles, allFile);
    console.log(`[MERGE] ${mergeCmd}`);

    return {
      outputFile: allFile,
      count: 0, // Placeholder
    };
  }

  /**
   * Phase 5: HTTP Probing
   */
  private async phaseProbe(
    target: string,
    inputFile: string,
    outputDir: string
  ): Promise<PhaseResult> {
    const startTime = Date.now();

    // Detailed probing
    const liveDetailed = `${outputDir}/live-detailed.txt`;
    const detailedCmd = CommandBuilder.httpxComprehensive(inputFile, liveDetailed);
    console.log(`[PROBE] ${detailedCmd}`);

    // Basic live list
    const liveFile = `${outputDir}/live.txt`;
    const basicCmd = CommandBuilder.httpxBasic(inputFile, liveFile);
    console.log(`[PROBE] ${basicCmd}`);

    return {
      phase: 'HTTP Probing',
      count: 0, // Placeholder
      outputFile: liveFile,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Generate final statistics
   */
  private async generateStats(
    phases: PhaseResult[],
    probing: PhaseResult
  ): Promise<void> {
    console.log('=== FullEnum Complete ===');
    phases.forEach(phase => {
      console.log(`${phase.phase}: ${phase.count} subdomains`);
    });
    console.log(`Live hosts: ${probing.count}`);
  }

  /**
   * Get workflow commands as array
   */
  static getCommands(
    target: string,
    wordlistPath: string,
    outputDir: string
  ): string[] {
    return [
      `# Full Enum - ${target}`,
      ``,
      `# Setup`,
      `mkdir -p ${outputDir}`,
      ResolverManager.downloadTemp(),
      ``,
      `# Phase 1: Passive Enumeration`,
      CommandBuilder.subfinder(target, `${outputDir}/subfinder.txt`),
      `# github-subdomains and shosubgo...`,
      CommandBuilder.mergeFiles(
        [`${outputDir}/subfinder.txt`, `${outputDir}/github.txt`, `${outputDir}/shodan.txt`],
        `${outputDir}/passive-all.txt`
      ),
      ``,
      `# Phase 2: DNS Brute Force`,
      CommandBuilder.puredns Bruteforce(
        wordlistPath,
        target,
        '/tmp/resolvers.txt',
        `${outputDir}/brute.txt`
      ),
      ``,
      `# Phase 3: Permutation`,
      CommandBuilder.dnsgen(`${outputDir}/passive-all.txt`, `${outputDir}/permutations-raw.txt`),
      CommandBuilder.purednsResolve(
        `${outputDir}/permutations-raw.txt`,
        '/tmp/resolvers.txt',
        `${outputDir}/permutations.txt`
      ),
      ``,
      `# Phase 4: Merge`,
      CommandBuilder.mergeFiles(
        [
          `${outputDir}/passive-all.txt`,
          `${outputDir}/brute.txt`,
          `${outputDir}/permutations.txt`,
        ],
        `${outputDir}/all-subdomains.txt`
      ),
      ``,
      `# Phase 5: Probe`,
      CommandBuilder.httpxComprehensive(
        `${outputDir}/all-subdomains.txt`,
        `${outputDir}/live-detailed.txt`
      ),
      CommandBuilder.httpxBasic(`${outputDir}/all-subdomains.txt`, `${outputDir}/live.txt`),
    ];
  }

  /**
   * Get time estimates by target size
   */
  static getTimeEstimate(targetSize: 'small' | 'medium' | 'large'): string {
    const estimates = {
      small: '~20 minutes',
      medium: '~45 minutes',
      large: '~90 minutes',
    };
    return estimates[targetSize];
  }

  /**
   * Get prerequisites
   */
  static getPrerequisites(): string[] {
    return [
      'All tools installed (subfinder, httpx, puredns, github-subdomains, shosubgo, dnsgen)',
      'API keys configured',
      'Fresh DNS resolvers',
      'Wordlist folder location',
    ];
  }
}
