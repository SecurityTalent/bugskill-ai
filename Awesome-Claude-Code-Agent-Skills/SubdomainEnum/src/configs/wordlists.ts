/**
 * SubdomainEnum Wordlist Configurations
 * Recommended wordlists for DNS brute forcing
 */

import type { WordlistConfig } from '../types';

/**
 * Recommended wordlists with size and use case
 */
export const WORDLISTS: WordlistConfig[] = [
  {
    name: 'subdomains-top1million-5000.txt',
    size: 5000,
    useCase: 'quick',
  },
  {
    name: 'subdomains-top1million-20000.txt',
    size: 20000,
    useCase: 'standard',
  },
  {
    name: 'jhaddix-all.txt',
    size: 2000000,
    useCase: 'comprehensive',
  },
  {
    name: 'n0kovo-subdomains.txt',
    size: 3000000,
    useCase: 'maximum',
  },
];

/**
 * Wordlist recommendations by target size
 */
export const WORDLIST_BY_TARGET_SIZE = {
  small: {
    wordlist: 'subdomains-top1million-5000.txt',
    estimatedTime: '5-10 minutes',
  },
  medium: {
    wordlist: 'subdomains-top1million-20000.txt',
    estimatedTime: '10-20 minutes',
  },
  large: {
    wordlist: 'jhaddix-all.txt',
    estimatedTime: '20-40 minutes',
  },
  enterprise: {
    wordlist: 'n0kovo-subdomains.txt',
    estimatedTime: '40-90 minutes',
  },
};

/**
 * Wordlist download sources
 */
export const WORDLIST_SOURCES = {
  secLists: 'https://github.com/danielmiessler/SecLists/tree/master/Discovery/DNS',
  assetnote: 'https://wordlists.assetnote.io/',
  jhaddix: 'https://gist.github.com/jhaddix/86a06c5dc309d08580a018c66354a056',
  n0kovo: 'https://github.com/n0kovo/n0kovo_subdomains',
};

/**
 * Custom pattern templates for alterx
 */
export const CUSTOM_PATTERNS = {
  standard: `{{word}}-{{number}}
{{word}}{{number}}
{{word}}.{{number}}
staging-{{word}}
dev-{{word}}
{{word}}-prod
{{word}}-api`,

  development: `dev-{{word}}
dev{{number}}-{{word}}
{{word}}-dev
{{word}}-dev{{number}}
staging-{{word}}
{{word}}-staging
test-{{word}}
{{word}}-test`,

  environments: `{{word}}-prod
{{word}}-production
{{word}}-staging
{{word}}-dev
{{word}}-test
{{word}}-qa
{{word}}-uat
{{word}}-demo`,

  regions: `{{word}}-us
{{word}}-eu
{{word}}-ap
{{word}}-east
{{word}}-west
{{word}}-north
{{word}}-south
{{word}}-1
{{word}}-2`,

  api: `api-{{word}}
{{word}}-api
api{{number}}-{{word}}
{{word}}-api{{number}}
{{word}}.api
api.{{word}}`,
};

/**
 * Get wordlist recommendation based on mode
 */
export function getRecommendedWordlist(mode: 'quick' | 'standard' | 'comprehensive'): WordlistConfig {
  return WORDLISTS.find(w => w.useCase === mode) || WORDLISTS[1];
}

/**
 * Generate custom pattern file content
 */
export function generatePatternFile(patterns: keyof typeof CUSTOM_PATTERNS): string {
  return CUSTOM_PATTERNS[patterns];
}

/**
 * Build wordlist path from folder and mode
 */
export function buildWordlistPath(folder: string, mode: 'quick' | 'standard' | 'comprehensive'): string {
  const wordlist = getRecommendedWordlist(mode);
  return `${folder}/${wordlist.name}`;
}
