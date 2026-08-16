/**
 * SubdomainEnum Tool Configurations
 * Command builders and tool configurations for all enumeration tools
 */

import type { ToolConfig } from '../types';

/**
 * Tool configurations with installation and usage details
 */
export const TOOLS: Record<string, ToolConfig> = {
  subfinder: {
    name: 'subfinder',
    command: 'subfinder',
    flags: ['-all', '-silent', '-o'],
    description: 'Passive subdomain discovery from multiple sources',
  },
  httpx: {
    name: 'httpx',
    command: 'httpx',
    flags: ['-status-code', '-title', '-tech-detect', '-no-color', '-o'],
    description: 'Fast HTTP probing with technology detection',
  },
  puredns: {
    name: 'puredns',
    command: 'puredns',
    flags: ['bruteforce', 'resolve', '-r', '-o'],
    description: 'Fast DNS brute forcing and resolution',
  },
  'github-subdomains': {
    name: 'github-subdomains',
    command: 'github-subdomains',
    flags: ['-t', '-d', '-o'],
    description: 'GitHub code search for subdomains',
  },
  shosubgo: {
    name: 'shosubgo',
    command: 'shosubgo',
    flags: ['-d', '-s'],
    description: 'Shodan subdomain enumeration',
  },
  dnsgen: {
    name: 'dnsgen',
    command: 'dnsgen',
    flags: ['-'],
    description: 'Permutation-based subdomain generation',
  },
  alterx: {
    name: 'alterx',
    command: 'alterx',
    flags: ['-p'],
    description: 'Fast permutation generation alternative',
  },
  katana: {
    name: 'katana',
    command: 'katana',
    flags: ['-u', '-d', '-jc', '-o'],
    description: 'Web crawler for linked subdomain discovery',
  },
};

/**
 * Command builders for each tool
 */
export class CommandBuilder {
  /**
   * Build subfinder command for passive enumeration
   */
  static subfinder(domain: string, outputFile: string): string {
    return `subfinder -d ${domain} -all -o ${outputFile}`;
  }

  /**
   * Build subfinder silent mode (for piping)
   */
  static subfinderSilent(domain: string): string {
    return `subfinder -d ${domain} -all -silent`;
  }

  /**
   * Build httpx command for basic probing
   */
  static httpxBasic(inputFile: string, outputFile: string): string {
    return `cat ${inputFile} | httpx -o ${outputFile}`;
  }

  /**
   * Build httpx command with full details
   */
  static httpxDetailed(inputFile: string, outputFile: string): string {
    return `cat ${inputFile} | httpx -status-code -title -tech-detect -no-color -o ${outputFile}`;
  }

  /**
   * Build httpx command with comprehensive output
   */
  static httpxComprehensive(inputFile: string, outputFile: string): string {
    return `cat ${inputFile} | httpx -ip -server -title -td -location -sc -no-color -o ${outputFile}`;
  }

  /**
   * Build puredns bruteforce command
   */
  static puredns Bruteforce(
    wordlistPath: string,
    domain: string,
    resolversPath: string,
    outputFile: string
  ): string {
    return `puredns bruteforce ${wordlistPath} ${domain} -r ${resolversPath} -o ${outputFile}`;
  }

  /**
   * Build puredns resolve command
   */
  static purednsResolve(
    inputFile: string,
    resolversPath: string,
    outputFile: string
  ): string {
    return `puredns resolve ${inputFile} -r ${resolversPath} -o ${outputFile}`;
  }

  /**
   * Build github-subdomains command
   */
  static githubSubdomains(
    domain: string,
    token: string,
    outputFile: string
  ): string {
    return `github-subdomains -t ${token} -d ${domain} -o ${outputFile}`;
  }

  /**
   * Build shosubgo command
   */
  static shosubgo(domain: string, apiKey: string, outputFile: string): string {
    return `shosubgo -d ${domain} -s ${apiKey} > ${outputFile}`;
  }

  /**
   * Build dnsgen permutation command
   */
  static dnsgen(inputFile: string, outputFile: string): string {
    return `cat ${inputFile} | dnsgen - > ${outputFile}`;
  }

  /**
   * Build alterx permutation command
   */
  static alterx(inputFile: string, outputFile: string): string {
    return `cat ${inputFile} | alterx > ${outputFile}`;
  }

  /**
   * Build alterx with custom patterns
   */
  static alterxCustom(
    inputFile: string,
    patternsFile: string,
    outputFile: string
  ): string {
    return `cat ${inputFile} | alterx -p ${patternsFile} > ${outputFile}`;
  }

  /**
   * Build katana crawler command
   */
  static katana(url: string, depth: number, outputFile: string): string {
    return `katana -u ${url} -d ${depth} -jc -o ${outputFile}`;
  }

  /**
   * Merge multiple files and deduplicate
   */
  static mergeFiles(inputFiles: string[], outputFile: string): string {
    return `cat ${inputFiles.join(' ')} | sort -u > ${outputFile}`;
  }

  /**
   * Count lines in file
   */
  static countLines(file: string): string {
    return `wc -l < ${file}`;
  }

  /**
   * Find new subdomains by comparing files
   */
  static findNew(
    originalFile: string,
    newFile: string,
    outputFile: string
  ): string {
    return `comm -13 <(sort ${originalFile}) <(sort ${newFile}) > ${outputFile}`;
  }

  /**
   * Cloud enumeration - search cert data for target
   */
  static cloudSearch(target: string, outputFile: string): string {
    return `cat *.txt | grep -F ".${target}" | awk -F'-- ' '{print $2}' | tr ' ' '\\n' | tr '[' ' ' | sed 's/ //' | sed 's/\\]//' | grep -F ".${target}" | sort -u > ${outputFile}`;
  }

  /**
   * Download fresh resolvers
   */
  static downloadResolvers(outputPath: string): string {
    return `curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt -o ${outputPath}`;
  }

  /**
   * Download cloud cert data from kaeferjaeger
   */
  static downloadCloudCerts(provider: string): string {
    return `curl -O http://kaeferjaeger.gay/sni-ip-ranges/${provider}/ipv4_merged_sni.txt`;
  }
}

/**
 * Tool installation commands
 */
export const INSTALL_COMMANDS: Record<string, string> = {
  subfinder: 'go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest',
  httpx: 'go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest',
  puredns: 'go install -v github.com/d3mondev/puredns/v2@latest',
  'github-subdomains': 'go install -v github.com/gwen001/github-subdomains@latest',
  shosubgo: 'go install -v github.com/incogbyte/shosubgo@latest',
  alterx: 'go install -v github.com/projectdiscovery/alterx/cmd/alterx@latest',
  katana: 'go install -v github.com/projectdiscovery/katana/cmd/katana@latest',
  massdns: 'go install -v github.com/blechschmidt/massdns/cmd/massdns@latest',
  dnsgen: 'pip3 install dnsgen',
};

/**
 * Quick install all tools
 */
export const INSTALL_ALL_SCRIPT = `#!/bin/bash
# Install all SubdomainEnum Go tools
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
go install -v github.com/d3mondev/puredns/v2@latest
go install -v github.com/incogbyte/shosubgo@latest
go install -v github.com/gwen001/github-subdomains@latest
go install -v github.com/projectdiscovery/alterx/cmd/alterx@latest
go install -v github.com/projectdiscovery/katana/cmd/katana@latest
go install -v github.com/blechschmidt/massdns/cmd/massdns@latest

# Python tools
pip3 install dnsgen

# Get fresh resolvers
mkdir -p ~/.config/puredns
curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt -o ~/.config/puredns/resolvers.txt
`;

/**
 * Verification script to check tool installation
 */
export const VERIFY_TOOLS_SCRIPT = `#!/bin/bash
echo "Checking SubdomainEnum tools..."

tools=("subfinder" "httpx" "puredns" "github-subdomains" "shosubgo" "dnsgen" "alterx" "katana")

for tool in "\${tools[@]}"; do
    if command -v $tool &> /dev/null; then
        echo "[OK] $tool"
    else
        echo "[MISSING] $tool"
    fi
done

# Check resolvers
if [ -f ~/.config/puredns/resolvers.txt ]; then
    count=$(wc -l < ~/.config/puredns/resolvers.txt)
    echo "[OK] Resolvers: $count entries"
else
    echo "[MISSING] Resolvers file"
fi

# Check subfinder config
if [ -f ~/.config/subfinder/provider-config.yaml ]; then
    echo "[OK] Subfinder config exists"
else
    echo "[MISSING] Subfinder provider config"
fi
`;
