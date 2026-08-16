/**
 * SubdomainEnum Utility Helpers
 * Common utility functions for subdomain enumeration
 */

/**
 * Extract domain from URL or subdomain
 */
export function extractDomain(input: string): string {
  // Remove protocol
  let domain = input.replace(/^https?:\/\//, '');

  // Remove path
  domain = domain.split('/')[0];

  // Remove port
  domain = domain.split(':')[0];

  return domain;
}

/**
 * Get root domain from subdomain
 */
export function getRootDomain(subdomain: string): string {
  const parts = subdomain.split('.');

  // Handle TLDs with multiple parts (e.g., co.uk)
  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    const multiPartTLDs = ['co.uk', 'com.au', 'co.jp', 'gov.uk'];

    if (multiPartTLDs.includes(lastTwo)) {
      return parts.slice(-3).join('.');
    }
  }

  return parts.slice(-2).join('.');
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(domain);
}

/**
 * Count lines in a file (async placeholder)
 */
export async function countLines(filePath: string): Promise<number> {
  // In practice, would use fs.readFile or wc -l
  console.log(`[PLACEHOLDER] Counting lines in ${filePath}`);
  return 0;
}

/**
 * Read lines from file (async placeholder)
 */
export async function readLines(filePath: string): Promise<string[]> {
  // In practice, would use fs.readFile
  console.log(`[PLACEHOLDER] Reading lines from ${filePath}`);
  return [];
}

/**
 * Write lines to file (async placeholder)
 */
export async function writeLines(
  filePath: string,
  lines: string[]
): Promise<void> {
  // In practice, would use fs.writeFile
  console.log(`[PLACEHOLDER] Writing ${lines.length} lines to ${filePath}`);
}

/**
 * Deduplicate and sort array
 */
export function deduplicateAndSort(items: string[]): string[] {
  return Array.from(new Set(items)).sort();
}

/**
 * Merge multiple file paths and deduplicate
 */
export async function mergeFiles(
  inputFiles: string[],
  outputFile: string
): Promise<number> {
  console.log(`[PLACEHOLDER] Merging ${inputFiles.length} files to ${outputFile}`);
  return 0;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Parse httpx output line
 */
export function parseHttpxLine(line: string): {
  url: string;
  statusCode?: number;
  title?: string;
  tech?: string[];
} {
  // Basic parsing - in practice would handle httpx JSON output
  const parts = line.split(' ');
  return {
    url: parts[0] || '',
  };
}

/**
 * Check if tool is installed
 */
export async function isToolInstalled(tool: string): Promise<boolean> {
  // In practice, would use `which` or `command -v`
  console.log(`[PLACEHOLDER] Checking if ${tool} is installed`);
  return true;
}

/**
 * Get PAI directory path
 */
export function getPAIDir(): string {
  return process.env.PAI_DIR || '~/.claude';
}

/**
 * Build output directory path
 */
export function buildOutputDir(target: string, baseDir?: string): string {
  const base = baseDir || './';
  return `${base}/${target}-enum`;
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Extract subdomains from various sources
 */
export function extractSubdomains(text: string, rootDomain: string): string[] {
  const subdomainRegex = new RegExp(
    `[a-zA-Z0-9][-a-zA-Z0-9]*\\.${rootDomain.replace('.', '\\.')}`,
    'gi'
  );

  const matches = text.match(subdomainRegex) || [];
  return deduplicateAndSort(matches.map(s => s.toLowerCase()));
}

/**
 * Compare two subdomain lists and find differences
 */
export function compareLists(
  original: string[],
  updated: string[]
): {
  new: string[];
  removed: string[];
  common: string[];
} {
  const originalSet = new Set(original);
  const updatedSet = new Set(updated);

  const newItems = updated.filter(item => !originalSet.has(item));
  const removed = original.filter(item => !updatedSet.has(item));
  const common = original.filter(item => updatedSet.has(item));

  return {
    new: newItems,
    removed,
    common,
  };
}

/**
 * Generate timestamp string
 */
export function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        await sleep(delayMs * Math.pow(2, i));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}
