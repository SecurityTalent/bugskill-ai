/**
 * SubdomainEnum API Key Configurations
 * API key management and configuration for passive enumeration sources
 */

import type { APIKeyConfig } from '../types';

/**
 * API key sources with priority and cost
 */
export const API_KEY_SOURCES: APIKeyConfig[] = [
  {
    service: 'Chaos',
    priority: 'critical',
    cost: 'free',
    signupUrl: 'https://chaos.projectdiscovery.io/',
  },
  {
    service: 'SecurityTrails',
    priority: 'high',
    cost: 'free',
    signupUrl: 'https://securitytrails.com/app/signup',
  },
  {
    service: 'Shodan',
    priority: 'high',
    cost: 'free',
    signupUrl: 'https://account.shodan.io/register',
  },
  {
    service: 'GitHub',
    priority: 'high',
    cost: 'free',
    signupUrl: 'https://github.com/settings/tokens',
  },
  {
    service: 'Censys',
    priority: 'high',
    cost: 'free',
    signupUrl: 'https://search.censys.io/register',
  },
  {
    service: 'VirusTotal',
    priority: 'medium',
    cost: 'free',
    signupUrl: 'https://www.virustotal.com/gui/join-us',
  },
  {
    service: 'PassiveTotal',
    priority: 'medium',
    cost: 'free',
    signupUrl: 'https://community.riskiq.com/',
  },
  {
    service: 'URLScan',
    priority: 'medium',
    cost: 'free',
    signupUrl: 'https://urlscan.io/user/signup',
  },
];

/**
 * Subfinder provider-config.yaml template
 */
export const SUBFINDER_CONFIG_TEMPLATE = `# Subfinder API Configuration
# Place at: ~/.config/subfinder/provider-config.yaml

# Critical - Get these first (FREE)
chaos:
  - YOUR_CHAOS_KEY_HERE

securitytrails:
  - YOUR_SECURITYTRAILS_KEY_HERE

# High Priority (FREE)
shodan:
  - YOUR_SHODAN_KEY_HERE

github:
  - YOUR_GITHUB_TOKEN_HERE

censys:
  - YOUR_CENSYS_ID:YOUR_CENSYS_SECRET

# Medium Priority (FREE)
virustotal:
  - YOUR_VIRUSTOTAL_KEY_HERE

passivetotal:
  - YOUR_PASSIVETOTAL_KEY_HERE

urlscan:
  - YOUR_URLSCAN_KEY_HERE

# Additional sources (optional)
binaryedge:
  - YOUR_BINARYEDGE_KEY_HERE

c99:
  - YOUR_C99_KEY_HERE

certspotter:
  - YOUR_CERTSPOTTER_KEY_HERE

chinaz:
  - YOUR_CHINAZ_KEY_HERE

dnsdb:
  - YOUR_DNSDB_KEY_HERE

fofa:
  - YOUR_FOFA_EMAIL:YOUR_FOFA_KEY

fullhunt:
  - YOUR_FULLHUNT_KEY_HERE

hunter:
  - YOUR_HUNTER_KEY_HERE

intelx:
  - YOUR_INTELX_KEY_HERE

netlas:
  - YOUR_NETLAS_KEY_HERE

quake:
  - YOUR_QUAKE_KEY_HERE

redhuntlabs:
  - YOUR_REDHUNTLABS_KEY_HERE

shodan:
  - YOUR_SHODAN_KEY_HERE

whoisxmlapi:
  - YOUR_WHOISXMLAPI_KEY_HERE

zoomeye:
  - YOUR_ZOOMEYE_KEY_HERE
`;

/**
 * Get API keys from secrets.json
 */
export function getSecretsPath(): string {
  const paiDir = process.env.PAI_DIR || '~/.claude';
  return `${paiDir}/config/secrets.json`;
}

/**
 * Subfinder API key configuration script
 */
export const CONFIGURE_SUBFINDER_SCRIPT = `#!/bin/bash
# Configure Subfinder API keys

CONFIG_DIR="$HOME/.config/subfinder"
CONFIG_FILE="$CONFIG_DIR/provider-config.yaml"

# Create config directory
mkdir -p "$CONFIG_DIR"

# Check if config exists
if [ -f "$CONFIG_FILE" ]; then
    echo "[WARNING] Config file already exists at $CONFIG_FILE"
    echo "Backup existing config? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
        echo "[OK] Backed up to $CONFIG_FILE.backup"
    fi
fi

# Check PAI secrets.json for keys
SECRETS_FILE="$HOME/.claude/config/secrets.json"
if [ -f "$SECRETS_FILE" ]; then
    echo "[OK] Found PAI secrets.json"
    echo "Extracting API keys from PAI config..."

    # Extract keys from secrets.json (requires jq)
    if command -v jq &> /dev/null; then
        # Read keys from subdomain_enum section
        chaos=$(jq -r '.subdomain_enum.chaos // empty' "$SECRETS_FILE")
        securitytrails=$(jq -r '.subdomain_enum.securitytrails // empty' "$SECRETS_FILE")
        shodan=$(jq -r '.subdomain_enum.shodan // empty' "$SECRETS_FILE")
        github=$(jq -r '.subdomain_enum.github // empty' "$SECRETS_FILE")

        echo "[INFO] Found keys in PAI config"
    else
        echo "[WARNING] jq not installed. Cannot parse secrets.json"
        echo "Install jq: brew install jq"
    fi
else
    echo "[INFO] No PAI secrets.json found. Using template."
fi

echo "Configuration complete!"
echo "Edit $CONFIG_FILE to add your API keys"
echo "Get free keys from:"
echo "  - Chaos: https://chaos.projectdiscovery.io/"
echo "  - SecurityTrails: https://securitytrails.com/app/signup"
echo "  - Shodan: https://account.shodan.io/register"
echo "  - GitHub: https://github.com/settings/tokens"
`;

/**
 * Verify subfinder API configuration
 */
export const VERIFY_SUBFINDER_KEYS_SCRIPT = `#!/bin/bash
# Verify Subfinder API key configuration

echo "Checking Subfinder configuration..."

CONFIG_FILE="$HOME/.config/subfinder/provider-config.yaml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "[ERROR] Subfinder config not found at $CONFIG_FILE"
    echo "Run: subfinder -ls"
    exit 1
fi

echo "[OK] Config file exists"

# List enabled sources
echo ""
echo "Enabled sources:"
subfinder -ls 2>&1 | grep -v "^\\["

# Count sources
source_count=$(subfinder -ls 2>&1 | grep -v "^\\[" | wc -l)
echo ""
echo "Total enabled sources: $source_count"

if [ "$source_count" -lt 5 ]; then
    echo "[WARNING] Only $source_count sources enabled. Recommended: 10+"
    echo "Add more free API keys to improve results"
else
    echo "[OK] Good source coverage"
fi

# Test with a domain
echo ""
echo "Testing with a domain (this may take a moment)..."
test_count=$(subfinder -d example.com -all -silent | wc -l)
echo "Test enumeration found: $test_count subdomains"

if [ "$test_count" -gt 0 ]; then
    echo "[OK] Subfinder is working correctly"
else
    echo "[WARNING] No results returned. Check API keys"
fi
`;
