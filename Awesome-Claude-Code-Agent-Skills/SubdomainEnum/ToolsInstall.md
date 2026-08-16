# SubdomainEnum Tools Installation

Complete installation guide for all subdomain enumeration tools.

## Quick Install (All Tools)

```bash
# Install all Go-based tools via go install
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
```

## Tool-by-Tool Installation

### 1. Subfinder (Critical - Passive Scraping)

```bash
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```

**Configure API keys** at `~/.config/subfinder/provider-config.yaml`:

```yaml
securitytrails:
  - YOUR_SECURITYTRAILS_KEY
shodan:
  - YOUR_SHODAN_KEY
github:
  - YOUR_GITHUB_TOKEN
# Add more keys as you get them:
# chaos:
#   - YOUR_CHAOS_KEY
# censys:
#   - YOUR_CENSYS_ID:YOUR_CENSYS_SECRET
# virustotal:
#   - YOUR_VT_KEY
```

**Verify sources:**
```bash
subfinder -ls  # List all sources
subfinder -ls 2>&1 | grep -v "^\[" | wc -l  # Count enabled sources
```

### 2. HTTPX (Critical - Web Probing)

**Repo:** https://github.com/projectdiscovery/httpx

Fast multi-purpose HTTP toolkit with 30+ probing capabilities.

```bash
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
```

**Preferred usage (comprehensive output):**
```bash
cat subdomains.txt | httpx -ip -server -title -td -location -sc -o live.txt
```

**Key flags explained:**

| Flag | Long Form | Purpose |
|------|-----------|---------|
| `-sc` | `-status-code` | HTTP status code |
| `-title` | | Page title |
| `-td` | `-tech-detect` | Technology detection (Wappalyzer) |
| `-server` | | Web server software |
| `-ip` | | Resolved IP address |
| `-location` | | Redirect location header |
| `-ct` | `-content-type` | Content-Type header |
| `-cname` | | DNS CNAME record |
| `-asn` | | ASN information |

**Additional useful flags:**
```bash
# Threading and rate limiting
-t 50              # Threads (default 50)
-rl 150            # Rate limit requests/sec

# Output formats
-o output.txt      # Save to file
-json              # JSON output
-csv               # CSV output

# Behavior
-fr                # Follow redirects
-nc                # No color
-silent            # Silent mode
```

**Example commands:**
```bash
# Basic probe
cat subdomains.txt | httpx -o live.txt

# Full details (recommended)
cat subdomains.txt | httpx -ip -server -title -td -location -sc -o live.txt

# JSON for parsing
cat subdomains.txt | httpx -ip -server -title -td -location -sc -json -o live.json

# High-speed mode
cat subdomains.txt | httpx -t 100 -rl 200 -silent -o live.txt
```

### 3. Puredns (DNS Brute Force)

```bash
go install -v github.com/d3mondev/puredns/v2@latest
```

**Get fresh resolvers (critical for accuracy):**
```bash
curl -s https://raw.githubusercontent.com/trickest/resolvers/main/resolvers.txt -o resolvers.txt
```

**Usage:**
```bash
# Brute force
puredns bruteforce wordlist.txt target.com -r resolvers.txt -o brute-results.txt

# Resolve existing list
puredns resolve subdomains.txt -r resolvers.txt -o resolved.txt
```

### 4. GitHub-Subdomains

```bash
go install -v github.com/gwen001/github-subdomains@latest
```

**Usage:**
```bash
github-subdomains -t YOUR_GITHUB_TOKEN -d target.com -o github-subs.txt
```

**Pro tip from TBHM:** This tool often finds 3-10% more subdomains than Amass's GitHub module due to its focused approach.

### 5. Shosubgo (Shodan Subdomains)

```bash
go install -v github.com/incogbyte/shosubgo@latest
```

**Usage:**
```bash
shosubgo -d target.com -s hxYf7NjvxPVoIM3NcNJjoWIaxkjR1Ciq
```

### 6. Dnsgen (Permutation Generation)

```bash
pip3 install dnsgen
```

**Usage:**
```bash
cat subdomains.txt | dnsgen - | puredns resolve -r resolvers.txt -o permutations.txt
```

### 7. Alterx (ProjectDiscovery Alternative to Dnsgen)

```bash
go install -v github.com/projectdiscovery/alterx/cmd/alterx@latest
```

**Usage:**
```bash
cat subdomains.txt | alterx | puredns resolve -r resolvers.txt -o permutations.txt
```

### 8. Katana (Web Crawler/Spider)

```bash
go install -v github.com/projectdiscovery/katana/cmd/katana@latest
```

**Usage for linked discovery:**
```bash
katana -u https://target.com -d 3 -jc -o crawled.txt
```

## Verification Script

Run this to check all tools are installed:

```bash
#!/bin/bash
echo "Checking SubdomainEnum tools..."

tools=("subfinder" "httpx" "puredns" "github-subdomains" "shosubgo" "dnsgen" "alterx" "katana")

for tool in "${tools[@]}"; do
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
```

## Priority API Keys to Add

These FREE API keys significantly improve passive enumeration:

| Service | Value | Get Key |
|---------|-------|---------|
| **Chaos** | Highest | https://chaos.projectdiscovery.io/ |
| Censys | High | https://search.censys.io/register |
| VirusTotal | Medium | https://www.virustotal.com/gui/join-us |
| PassiveTotal | Medium | https://community.riskiq.com/ |
| URLScan | Medium | https://urlscan.io/user/signup |

## Troubleshooting

### Subfinder returns few results
- Check API keys are configured: `subfinder -ls`
- Use `-all` flag for maximum sources
- Some sources are rate-limited; wait and retry

### Puredns is slow
- Use more threads: `-t 100`
- Ensure resolvers are fresh (update weekly)
- Use `--skip-validation` for speed (less accurate)

### GitHub-subdomains rate limited
- Create multiple GitHub tokens
- Use `-k` flag for multiple keys
- Wait 1 hour for rate limit reset
