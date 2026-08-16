# CacheDeception Installation Guide

**Version:** 1.0.0
**Type:** Skill (Technique-based)
**Dependencies:** Caido MCP, Browser MCP

---

## Overview

CacheDeception is a technique-based security skill for web cache exploitation. It provides attack patterns for cache deception (hijacking authenticated responses) and cache poisoning (storing malicious payloads) based on Martin Doyhenard's "Gotta Cache 'em all" research.

---

## Prerequisites

### 1. Core Requirements
- ✅ PAI Core installed
- ✅ Hook system functional
- ✅ Caido proxy running (for traffic analysis)

### 2. MCP Dependencies
This skill requires the following MCP integrations:
- **Caido MCP** - Proxy-based testing and traffic analysis
  - Used for: Request replay, header analysis, cache behavior testing
  - Config: `${PAI_DIR}/config/secrets.json` (Caido API key)
- **Claude in Chrome MCP** - Browser automation (optional)
  - Used for: Live cache testing, victim simulation
  - Requires: Chrome with Claude MCP extension

### 3. Tool Requirements
- **curl** - HTTP testing (built-in)
- **ffuf** (optional) - Automated fuzzing of cache payloads
  - Install: `brew install ffuf` (macOS)
- **Caido Desktop** - Must be running for MCP queries
  - Download: https://caido.io

---

## Installation Steps

### Step 1: Verify Caido MCP Integration

```bash
# Check Caido is running
curl http://localhost:8080/graphql -H "Content-Type: application/json" -d '{"query": "{ version }"}'
```

**Expected output:**
```json
{"data":{"version":"..."}}
```

### Step 2: Configure Caido Authentication

```bash
# Verify secrets.json contains Caido API key
cat ${PAI_DIR}/config/secrets.json | grep -i caido
```

**Expected:**
```json
{
  "caido": {
    "apiKey": "your-api-key-here",
    "url": "http://localhost:8080"
  }
}
```

**If missing, add manually:**
```json
{
  "caido": {
    "apiKey": "get-from-caido-settings",
    "url": "http://localhost:8080"
  }
}
```

### Step 3: Verify Skill Structure

```bash
ls -la ${PAI_DIR}/skills/CacheDeception/
```

**Expected output:**
```
SKILL.md
INSTALL.md (this file)
VERIFY.md
payloads/         (optional: payload generators)
```

### Step 4: Test Skill Activation

```bash
# In Claude Code, trigger the skill with any of these phrases:
"test for cache deception"
"check for cache poisoning"
"CDN bypass techniques"
"static extension bypass"
```

**Expected behavior:**
- Skill activates (logs show "CacheDeception skill activated")
- Displays relevant technique section
- No immediate errors

---

## Configuration

### Optional: Caido Scope Configuration

Set up target scope in Caido before testing:

```bash
# In Caido UI:
# 1. Go to Intercept > Scope
# 2. Add target domain: target.com
# 3. Enable "Include subdomains"
```

### Optional: Create Payload Collections

Create reusable payload collections in Caido:

```bash
# In Caido:
# 1. Go to Replay > Collections
# 2. Create "Cache Deception Payloads" collection
# 3. Create "Cache Poisoning Tests" collection
```

### Optional: Browser MCP Setup

For live cache testing with victim simulation:

```bash
# Install Chrome MCP extension (if not already installed)
# 1. Open Chrome
# 2. Install Claude in Chrome extension
# 3. Grant necessary permissions

# Verify in Claude Code:
"open browser tab for target.com"
```

---

## Directory Structure After Installation

```
skills/CacheDeception/
├── SKILL.md          # Skill definition with all techniques
├── INSTALL.md        # This file
└── VERIFY.md         # Verification checklist
```

**Optional additions:**
```
skills/CacheDeception/
├── payloads/
│   ├── static-extensions.txt
│   ├── delimiters.txt
│   └── normalization.txt
└── examples/
    ├── cloudflare-spring.md
    └── cloudfront-deception.md
```

---

## Integration

### With Caido MCP

The skill uses Caido for:
- Analyzing proxy history for cache headers
- Identifying CDN technology stack
- Replaying requests with modified paths
- Testing delimiter behavior
- Logging findings

**Example usage:**
```
"analyze Caido history for cache deception opportunities on target.com"
```

### With Browser MCP

Use Browser for:
- Simulating victim interactions
- Testing cache behavior in real browser
- Recording PoC demonstrations
- Validating exploits end-to-end

**Example usage:**
```
"test cache deception payload /api/user;x.css in browser"
```

### With Other Skills

- **ClientSideAttacks:** Escalate cache poisoning to XSS
- **VulnChaining:** Chain cache deception with other bugs for ATO
- **BugBountyWorkflow:** Structure testing and reporting
- **Ffuf:** Automate cache payload fuzzing

**Common integration patterns:**
```
"use cache deception to escalate self-XSS to stored XSS"
"chain cache deception with CSRF for account takeover"
"fuzz cache delimiters on target.com endpoints"
```

---

## Troubleshooting

### Issue: Caido MCP not responding

**Solution:**
```bash
# Check Caido is running
ps aux | grep -i caido

# Verify GraphQL endpoint
curl http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ version }"}'

# Check API key in secrets.json
cat ${PAI_DIR}/config/secrets.json | grep caido
```

### Issue: No cache headers in responses

**Check:**
1. Verify target uses CDN (check response headers for cf-ray, x-amz-cf, etc.)
2. Ensure Caido is intercepting HTTPS traffic
3. Check Caido scope includes target domain
4. Test on static resources first (/.css, .js files)

### Issue: Delimiter payloads not working

**Solution:**
```bash
# Test delimiter manually first
curl "https://target.com/endpoint;test"
curl "https://target.com/endpoint%23test"
curl "https://target.com/endpoint%00test"

# Compare responses to identify which delimiters work
# Document findings in Caido findings
```

### Issue: Path normalization unclear

**Solution:**
```bash
# Test normalization behavior
curl "https://target.com/xxx/../endpoint" -v
curl "https://target.com/xxx/..%2fendpoint" -v

# Check X-Cache header and response content
# Cache hit = cache normalized path
# Different content = origin normalized differently
```

### Issue: Cache poisoning not persisting

**Check:**
1. Verify response has caching headers (Cache-Control, Age)
2. Check cache key normalization with X-Cache-Key header
3. Ensure payload actually triggers cacheable response
4. Try different cache key manipulation techniques

---

## Testing Setup

### Recommended Testing Flow

1. **Reconnaissance Phase:**
   ```
   "analyze Caido history for target.com cache headers"
   "identify CDN technology for target.com"
   ```

2. **Delimiter Discovery:**
   ```
   "test cache delimiters on target.com/api/user"
   "test origin delimiters on target.com/account"
   ```

3. **Normalization Testing:**
   ```
   "test path normalization on target.com"
   "compare cache vs origin normalization behavior"
   ```

4. **Exploitation:**
   ```
   "generate cache deception payloads for /api/user"
   "test cache poisoning on /main.js"
   ```

5. **Validation:**
   ```
   "verify cache deception works unauthenticated"
   "confirm poisoned response cached for other users"
   ```

### Sample Target Setup

For practice, test on safe targets:
```bash
# Use local setup or authorized test environment
# Example safe targets:
- Local Docker containers with nginx + cloudflare proxy
- Bug bounty programs that explicitly allow cache testing
- Personal websites with permission
```

**DO NOT test on unauthorized targets!**

---

## Advanced Configuration

### Custom Payload Lists

Create custom delimiter and extension lists:

```bash
# Create delimiters file
cat > ${PAI_DIR}/skills/CacheDeception/payloads/delimiters.txt << 'EOF'
;
%23
%3f
%00
%0a
$
#
EOF

# Create extensions file
cat > ${PAI_DIR}/skills/CacheDeception/payloads/extensions.txt << 'EOF'
.css
.js
.png
.jpg
.ico
.svg
.woff
EOF
```

### Integration with Ffuf

For automated testing:

```bash
# Fuzz delimiters on endpoint
ffuf -u "https://target.com/api/user FUZZ test.css" \
  -w ${PAI_DIR}/skills/CacheDeception/payloads/delimiters.txt \
  -H "Cookie: session=victim_token" \
  -mc all -fc 404

# Fuzz static extensions
ffuf -u "https://target.com/api/user;x FUZZ" \
  -w ${PAI_DIR}/skills/CacheDeception/payloads/extensions.txt \
  -H "Cookie: session=victim_token" \
  -mc all -fc 404
```

### Caido Automation Scripts

Create Caido workflows for automated testing:

```javascript
// In Caido > Automate > Workflows
// Create "Cache Deception Fuzzer" workflow

const endpoints = ['/api/user', '/account', '/profile'];
const delimiters = [';', '%23', '%00'];
const extensions = ['.css', '.js', '.png'];

for (const endpoint of endpoints) {
  for (const delimiter of delimiters) {
    for (const ext of extensions) {
      const path = `${endpoint}${delimiter}test${ext}`;
      // Send request
      // Check for X-Cache: hit
      // Log findings
    }
  }
}
```

---

## Security Notes

### Authorized Testing Only

**CRITICAL:** This skill provides offensive security techniques. Only use on:
- ✅ Authorized bug bounty programs
- ✅ Personal websites with permission
- ✅ Client engagements with written authorization
- ✅ Lab environments and practice targets

**NEVER use on:**
- ❌ Unauthorized websites
- ❌ Production systems without permission
- ❌ Targets outside bug bounty scope

### Responsible Disclosure

When findings are discovered:
1. Document impact and PoC
2. Follow program's disclosure policy
3. Don't store victim data (delete cached sensitive responses)
4. Report promptly through official channels

### Data Handling

Cache deception exposes sensitive data:
- Delete cached responses immediately after validation
- Don't store PII, tokens, or credentials
- Use synthetic test data when possible
- Sanitize all report artifacts

---

## Next Steps

After installation:
1. Run verification: See `VERIFY.md`
2. Test on authorized target
3. Review Caido integration
4. Study technique sections in SKILL.md
5. Practice delimiter discovery workflow

---

**Installation Complete!**
Proceed to `VERIFY.md` to validate the installation.
