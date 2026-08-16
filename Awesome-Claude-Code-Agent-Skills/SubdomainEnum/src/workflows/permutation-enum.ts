/**
 * SubdomainEnum Permutation Workflow
 * Generate and resolve subdomain permutations from existing discoveries
 * Exploits naming pattern predictability
 */

import { CommandBuilder } from '../configs/tools';
import { CUSTOM_PATTERNS } from '../configs/wordlists';
import type { EnumConfig, WorkflowResult } from '../types';

export class PermutationEnumWorkflow {
  private config: EnumConfig;

  constructor(config: EnumConfig) {
    this.config = config;
  }

  /**
   * Execute permutation enumeration workflow
   */
  async execute(inputFile: string): Promise<WorkflowResult> {
    const { target, outputDir } = this.config;
    const startTime = Date.now();

    try {
      // Step 1: Get fresh resolvers
      await this.downloadResolvers();

      // Step 2: Generate permutations
      const permutationsRaw = await this.generatePermutations(inputFile, outputDir);

      // Step 3: Resolve permutations
      const permutationsResolved = await this.resolvePermutations(
        permutationsRaw,
        outputDir
      );

      // Step 4: Find new discoveries
      const newDiscoveries = await this.findNewDiscoveries(
        inputFile,
        permutationsResolved,
        outputDir
      );

      // Step 5: Probe new discoveries
      const liveFile = await this.probeNew(newDiscoveries, outputDir);

      const stats = await this.getStats(newDiscoveries, liveFile);

      return {
        success: true,
        subdomainCount: stats.new,
        liveCount: stats.live,
        outputFiles: {
          allSubdomains: permutationsResolved,
          liveHosts: liveFile,
          liveDetailed: liveFile,
          permutations: newDiscoveries,
        },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        subdomainCount: 0,
        liveCount: 0,
        outputFiles: {
          allSubdomains: `${outputDir}/${target}-permutations.txt`,
          liveHosts: `${outputDir}/${target}-new-live.txt`,
          liveDetailed: `${outputDir}/${target}-new-live.txt`,
        },
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Download fresh resolvers
   */
  private async downloadResolvers(): Promise<void> {
    const cmd = CommandBuilder.downloadResolvers('/tmp/resolvers.txt');
    console.log(`[PERMUTATION] ${cmd}`);
  }

  /**
   * Generate permutations with dnsgen
   */
  private async generatePermutations(
    inputFile: string,
    outputDir: string
  ): Promise<string> {
    const { target } = this.config;
    const outputFile = `${outputDir}/${target}-permutations-raw.txt`;

    const cmd = CommandBuilder.dnsgen(inputFile, outputFile);
    console.log(`[PERMUTATION] ${cmd}`);

    // Check size
    const sizeCmd = `wc -l ${outputFile}`;
    console.log(`[PERMUTATION] ${sizeCmd}`);

    return outputFile;
  }

  /**
   * Resolve permutations with puredns
   */
  private async resolvePermutations(
    inputFile: string,
    outputDir: string
  ): Promise<string> {
    const { target } = this.config;
    const outputFile = `${outputDir}/${target}-permutations.txt`;

    const cmd = CommandBuilder.purednsResolve(
      inputFile,
      '/tmp/resolvers.txt',
      outputFile
    );
    console.log(`[PERMUTATION] ${cmd}`);

    return outputFile;
  }

  /**
   * Find new discoveries (not in original list)
   */
  private async findNewDiscoveries(
    originalFile: string,
    permutationsFile: string,
    outputDir: string
  ): Promise<string> {
    const { target } = this.config;
    const outputFile = `${outputDir}/${target}-new-from-permutations.txt`;

    const cmd = CommandBuilder.findNew(originalFile, permutationsFile, outputFile);
    console.log(`[PERMUTATION] ${cmd}`);

    const countCmd = `echo "New subdomains from permutations: $(wc -l < ${outputFile})"`;
    console.log(`[PERMUTATION] ${countCmd}`);

    return outputFile;
  }

  /**
   * Probe new discoveries
   */
  private async probeNew(inputFile: string, outputDir: string): Promise<string> {
    const { target } = this.config;
    const outputFile = `${outputDir}/${target}-new-live.txt`;

    const cmd = CommandBuilder.httpxDetailed(inputFile, outputFile);
    console.log(`[PERMUTATION] ${cmd}`);

    return outputFile;
  }

  /**
   * Get statistics
   */
  private async getStats(
    newFile: string,
    liveFile: string
  ): Promise<{ new: number; live: number }> {
    // Placeholder
    return { new: 0, live: 0 };
  }

  /**
   * Alternative: Use alterx instead of dnsgen
   */
  static getAlterxCommands(target: string): string[] {
    return [
      `# Alterx Alternative (faster)`,
      ``,
      `# Generate and resolve in one pipeline`,
      `cat ${target}-subdomains.txt | alterx | puredns resolve -r /tmp/resolvers.txt -o ${target}-alterx-results.txt`,
    ];
  }

  /**
   * Generate custom pattern file
   */
  static generateCustomPatterns(
    patterns: keyof typeof CUSTOM_PATTERNS
  ): string {
    return CUSTOM_PATTERNS[patterns];
  }

  /**
   * Get commands with custom patterns
   */
  static getCustomPatternCommands(
    target: string,
    patternType: keyof typeof CUSTOM_PATTERNS
  ): string[] {
    const patterns = CUSTOM_PATTERNS[patternType];

    return [
      `# Custom Pattern Permutation - ${patternType}`,
      ``,
      `# Create pattern file`,
      `cat > patterns.txt << 'EOF'`,
      patterns,
      `EOF`,
      ``,
      `# Use with alterx`,
      `cat ${target}-subdomains.txt | alterx -p patterns.txt | puredns resolve -r /tmp/resolvers.txt -o ${target}-custom-permutations.txt`,
    ];
  }

  /**
   * Get workflow commands as array
   */
  static getCommands(target: string, inputFile: string): string[] {
    return [
      `# Permutation Enum - ${target}`,
      ``,
      `# Step 1: Get fresh resolvers`,
      CommandBuilder.downloadResolvers('/tmp/resolvers.txt'),
      ``,
      `# Step 2: Generate permutations`,
      CommandBuilder.dnsgen(inputFile, `${target}-permutations-raw.txt`),
      `wc -l ${target}-permutations-raw.txt`,
      ``,
      `# Step 3: Resolve permutations`,
      CommandBuilder.purednsResolve(
        `${target}-permutations-raw.txt`,
        '/tmp/resolvers.txt',
        `${target}-permutations.txt`
      ),
      ``,
      `# Step 4: Find new discoveries`,
      CommandBuilder.findNew(
        inputFile,
        `${target}-permutations.txt`,
        `${target}-new-from-permutations.txt`
      ),
      `echo "New subdomains: $(wc -l < ${target}-new-from-permutations.txt)"`,
      ``,
      `# Step 5: Probe new discoveries`,
      CommandBuilder.httpxDetailed(
        `${target}-new-from-permutations.txt`,
        `${target}-new-live.txt`
      ),
    ];
  }

  /**
   * Get concept explanation
   */
  static getConcept(): string {
    return `Admins often name subdomains with patterns:

dev.company.com  ->  dev1.company.com
                     dev2.company.com
                     dev-1.company.com
                     dev.1.company.com
                     staging-dev.company.com

Tools like dnsgen and alterx recognize these patterns and generate variations.`;
  }

  /**
   * Get performance tips
   */
  static getPerformanceTips(): string[] {
    return [
      'Limit input - Large subdomain lists = billions of permutations',
      'Use alterx - Generally faster than dnsgen',
      'Increase threads - puredns resolve -t 100 for speed',
      'Fresh resolvers - Critical for accuracy',
    ];
  }

  /**
   * Get when to use guidance
   */
  static getUsageGuidance(): string[] {
    return [
      'After passive enumeration reveals naming patterns',
      'Targets with predictable naming (dev1, dev2, staging-api, etc.)',
      'When brute force wordlists miss custom patterns',
    ];
  }

  /**
   * Get prerequisites
   */
  static getPrerequisites(): string[] {
    return [
      'Existing subdomain list (from passive enum)',
      'dnsgen or alterx installed',
      'puredns with fresh resolvers',
    ];
  }
}
