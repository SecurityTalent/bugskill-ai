/**
 * SubdomainEnum DNS Resolver Configurations
 * Resolver management and update utilities
 */

import type { ResolverConfig } from '../types';

/**
 * Resolver sources with update frequency
 */
export const RESOLVER_SOURCES: ResolverConfig[] = [
  {
    url: 'https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt',
    localPath: '~/.config/puredns/resolvers.txt',
    updateFrequency: 'weekly',
  },
  {
    url: 'https://raw.githubusercontent.com/trickest/resolvers/main/resolvers-trusted.txt',
    localPath: '~/.config/puredns/resolvers-trusted.txt',
    updateFrequency: 'weekly',
  },
];

/**
 * Default resolver paths
 */
export const DEFAULT_RESOLVER_PATHS = {
  puredns: '~/.config/puredns/resolvers.txt',
  temp: '/tmp/resolvers.txt',
  trusted: '~/.config/puredns/resolvers-trusted.txt',
};

/**
 * Commands to download and update resolvers
 */
export class ResolverManager {
  /**
   * Download fresh resolvers to default location
   */
  static downloadDefault(): string {
    return `curl -s ${RESOLVER_SOURCES[0].url} -o ~/.config/puredns/resolvers.txt`;
  }

  /**
   * Download trusted resolvers
   */
  static downloadTrusted(): string {
    return `curl -s ${RESOLVER_SOURCES[1].url} -o ~/.config/puredns/resolvers-trusted.txt`;
  }

  /**
   * Download to temporary location
   */
  static downloadTemp(): string {
    return `curl -s ${RESOLVER_SOURCES[0].url} -o /tmp/resolvers.txt`;
  }

  /**
   * Setup resolver directories
   */
  static setup(): string {
    return `mkdir -p ~/.config/puredns && ${this.downloadDefault()}`;
  }

  /**
   * Check if resolvers exist and count
   */
  static check(): string {
    return `if [ -f ~/.config/puredns/resolvers.txt ]; then wc -l < ~/.config/puredns/resolvers.txt; else echo "0"; fi`;
  }

  /**
   * Get last update time of resolvers
   */
  static lastUpdated(): string {
    return `stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" ~/.config/puredns/resolvers.txt`;
  }

  /**
   * Full setup and verification script
   */
  static fullSetup(): string {
    return `#!/bin/bash
# Setup DNS resolvers for SubdomainEnum

# Create config directory
mkdir -p ~/.config/puredns

# Download main resolvers
echo "Downloading main resolvers..."
curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt -o ~/.config/puredns/resolvers.txt

# Download trusted resolvers
echo "Downloading trusted resolvers..."
curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers-trusted.txt -o ~/.config/puredns/resolvers-trusted.txt

# Verify
if [ -f ~/.config/puredns/resolvers.txt ]; then
    count=$(wc -l < ~/.config/puredns/resolvers.txt)
    echo "[OK] Main resolvers: $count entries"
else
    echo "[ERROR] Failed to download main resolvers"
    exit 1
fi

if [ -f ~/.config/puredns/resolvers-trusted.txt ]; then
    count=$(wc -l < ~/.config/puredns/resolvers-trusted.txt)
    echo "[OK] Trusted resolvers: $count entries"
else
    echo "[WARNING] Trusted resolvers not downloaded"
fi

echo "Resolver setup complete!"
`;
  }
}

/**
 * Resolver update schedule helper
 */
export function shouldUpdateResolvers(lastUpdateTime: Date): boolean {
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate >= 7; // Update weekly
}

/**
 * Get recommended resolver path based on use case
 */
export function getResolverPath(useCase: 'standard' | 'trusted' | 'temp' = 'standard'): string {
  switch (useCase) {
    case 'trusted':
      return DEFAULT_RESOLVER_PATHS.trusted;
    case 'temp':
      return DEFAULT_RESOLVER_PATHS.temp;
    default:
      return DEFAULT_RESOLVER_PATHS.puredns;
  }
}
