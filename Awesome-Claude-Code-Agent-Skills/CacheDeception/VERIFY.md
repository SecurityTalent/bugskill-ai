# CacheDeception Verification Checklist

**Version:** 1.0.0
**Purpose:** Verify CacheDeception skill is correctly installed and functional

---

## Pre-Flight Checks

### ✅ Core Components
- [ ] `${PAI_DIR}/skills/CacheDeception/SKILL.md` exists
- [ ] `${PAI_DIR}/skills/CacheDeception/INSTALL.md` exists
- [ ] Caido Desktop is installed and running
- [ ] Caido MCP configured in `${PAI_DIR}/config/secrets.json`

### ✅ MCP Integration
- [ ] Caido GraphQL endpoint accessible: `curl http://localhost:8080/graphql`
- [ ] Caido API key configured in secrets.json
- [ ] Browser MCP available (optional): Test with "open browser tab"

---

## Functional Tests

### Test 1: Skill Activation

```bash
# In Claude Code, trigger the skill:
"test for cache deception vulnerabilities"
```

**Expected:**
- ✅ Skill activates (logs show "CacheDeception skill activated")
- ✅ Technique section displayed
- ✅ No immediate errors

**Status:** [ ] Pass [ ] Fail

---

### Test 2: Caido MCP Integration

```bash
# Test Caido connection
"query Caido for requests with cache headers"
```

**Expected:**
- ✅ Caido MCP responds
- ✅ Returns requests with X-Cache or Cache-Control headers
- ✅ No authentication errors

**Status:** [ ] Pass [ ] Fail

---

### Test 3: CDN Detection

```bash
# Create test request in Caido to a CDN-backed site (e.g., cloudflare.com)
# Then in Claude Code:
"identify CDN technology from Caido history for cloudflare.com"
```

**Expected:**
- ✅ CDN identified (CloudFlare, CloudFront, Fastly, etc.)
- ✅ Technology stack analysis provided
- ✅ Relevant delimiter/normalization behavior noted

**Status:** [ ] Pass [ ] Fail

---

### Test 4: Static Extension Payload Generation

```bash
# In Claude Code:
"generate static extension cache deception payloads for /api/user"
```

**Expected output:**
```
/api/user;random.css
/api/user%23random.js
/api/user%00random.png
/api/user;random.ico
...
```

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Delimiter Discovery Methodology

```bash
# In Claude Code:
"how do I detect origin delimiters for cache deception?"
```

**Expected:**
- ✅ Step-by-step methodology provided
- ✅ Test characters list included (;, #, %00, etc.)
- ✅ Caido replay integration suggested
- ✅ Response comparison logic explained

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Normalization Testing Guidance

```bash
# In Claude Code:
"explain how to test path normalization for cache deception"
```

**Expected:**
- ✅ Origin normalization test provided
- ✅ Cache normalization test provided
- ✅ Encoded traversal payloads (..%2f, ..%5c) mentioned
- ✅ X-Cache header analysis included

**Status:** [ ] Pass [ ] Fail

---

### Test 7: Cache Poisoning Payload Generation

```bash
# In Claude Code:
"generate cache poisoning payloads to poison /home with content from /payload"
```

**Expected output:**
```
# Backend delimiter exploitation:
/payload;/../home
/payload%00/../home
/payload$/../home

# Frontend delimiter exploitation:
/home#/../payload
/home%23/../payload

# Key normalization:
/payload/../../home
```

**Status:** [ ] Pass [ ] Fail

---

### Test 8: Vulnerable Combination Lookup

```bash
# In Claude Code:
"what cache deception techniques work on CloudFlare + Spring?"
```

**Expected:**
- ✅ Semicolon delimiter technique mentioned
- ✅ Payload example: `/user;x.css`
- ✅ Explanation of why it works (Spring truncates at `;`)
- ✅ Impact assessment provided

**Status:** [ ] Pass [ ] Fail

---

### Test 9: Caido Findings Creation

```bash
# After testing on authorized target with cache deception finding:
"create Caido finding for cache deception via semicolon delimiter on /api/user"
```

**Expected:**
- ✅ Caido finding created via MCP
- ✅ Title includes technique
- ✅ Description includes PoC URL
- ✅ Severity set to HIGH
- ✅ Tags include "cache-deception"

**Status:** [ ] Pass [ ] Fail

---

### Test 10: Cache-What-Where Integration

```bash
# In Claude Code:
"how can I weaponize an open redirect via X-Forwarded-Host using cache poisoning?"
```

**Expected:**
- ✅ Cache-what-where concept explained
- ✅ Payload example with path confusion
- ✅ Key normalization exploitation mentioned
- ✅ Impact escalation demonstrated (redirect → mass XSS)

**Status:** [ ] Pass [ ] Fail

---

## Integration Tests

### Test 11: Caido Request Replay

```bash
# Create a test request in Caido
# In Claude Code:
"replay Caido request to /api/user with cache deception payload /api/user;test.css"
```

**Expected:**
- ✅ Request replayed via Caido MCP
- ✅ Path modified correctly
- ✅ Response analyzed for caching behavior
- ✅ X-Cache header interpretation provided

**Status:** [ ] Pass [ ] Fail

---

### Test 12: Browser Testing Integration

```bash
# In Claude Code (with Browser MCP):
"test cache deception payload /account;x.css in browser at target.com"
```

**Expected:**
- ✅ Browser tab opens to target
- ✅ Payload URL loaded
- ✅ Response analyzed
- ✅ Cache behavior confirmed

**Status:** [ ] Pass [ ] Fail

---

### Test 13: VulnChaining Integration

```bash
# In Claude Code:
"how can I chain cache deception with CSRF for account takeover?"
```

**Expected:**
- ✅ Chain pattern explained
- ✅ Step-by-step exploitation flow
- ✅ PoC structure provided
- ✅ References VulnChaining skill if available

**Status:** [ ] Pass [ ] Fail

---

## Knowledge Verification

### Test 14: Delimiter Behavior Recall

```bash
# In Claude Code:
"does CloudFlare use # as a delimiter?"
```

**Expected answer:**
- ✅ NO - CloudFlare does not use # as delimiter
- ✅ Reference to delimiter table provided
- ✅ Exploitable combinations suggested

**Status:** [ ] Pass [ ] Fail

---

### Test 15: Normalization Behavior Recall

```bash
# In Claude Code:
"how does Nginx handle /hello/..%2fworld?"
```

**Expected answer:**
- ✅ Nginx normalizes to `/world`
- ✅ Encoded traversal decoded and processed
- ✅ Exploitable when cache doesn't normalize (CloudFlare, GCP, Fastly)

**Status:** [ ] Pass [ ] Fail

---

### Test 16: Static Extensions Recall

```bash
# In Claude Code:
"what file extensions are commonly cached by CDNs?"
```

**Expected answer:**
```
.js .css .png .jpg .jpeg .gif .ico .svg .woff .woff2
.ttf .eot .otf .pdf .zip .gz .tar .mp4 .mp3 .webp
```

**Status:** [ ] Pass [ ] Fail

---

### Test 17: Static Directories Recall

```bash
# In Claude Code:
"what directories are typically considered static by caches?"
```

**Expected answer:**
```
/static /assets /wp-content /media /templates
/public /shared /dist /build /resources
```

**Status:** [ ] Pass [ ] Fail

---

### Test 18: IIS Backslash Technique

```bash
# In Claude Code:
"explain the IIS backslash cache deception technique"
```

**Expected:**
- ✅ IIS converts %5C to \ which it treats as /
- ✅ Payload example: `/static/..%5CmyAccount`
- ✅ Cache sees encoded, origin normalizes
- ✅ Impact: Dynamic response cached as static

**Status:** [ ] Pass [ ] Fail

---

## Practical Application Tests

### Test 19: Full Workflow - Deception

```bash
# In Claude Code, run complete cache deception workflow:
"test target.com for cache deception on /api/user endpoint"
```

**Expected flow:**
1. ✅ Identify CDN from headers
2. ✅ Test origin delimiters
3. ✅ Generate payloads
4. ✅ Test with Caido replay
5. ✅ Verify caching behavior
6. ✅ Create finding if vulnerable

**Status:** [ ] Pass [ ] Fail

---

### Test 20: Full Workflow - Poisoning

```bash
# In Claude Code, run complete cache poisoning workflow:
"test target.com for cache poisoning to inject XSS into /main.js"
```

**Expected flow:**
1. ✅ Find reflected XSS or controllable content
2. ✅ Identify cache key normalization
3. ✅ Generate key confusion payloads
4. ✅ Test poisoning
5. ✅ Verify persistence
6. ✅ Assess impact (mass XSS)

**Status:** [ ] Pass [ ] Fail

---

## Verification Summary

**Date:** _______________
**Verified By:** _______________

**Results:**
- Core Components: [ ] Pass [ ] Fail
- MCP Integration: [ ] Pass [ ] Fail
- Functional Tests (1-10): ___ / 10 passed
- Integration Tests (11-13): ___ / 3 passed
- Knowledge Tests (14-18): ___ / 5 passed
- Practical Tests (19-20): ___ / 2 passed

**Overall Status:** [ ] ✅ Verified [ ] ❌ Issues Found

---

## Troubleshooting Failed Tests

### If Test 2 (Caido MCP) fails:
```bash
# Check Caido is running
ps aux | grep -i caido

# Verify GraphQL endpoint
curl http://localhost:8080/graphql -H "Content-Type: application/json" -d '{"query": "{ version }"}'

# Check API key
cat ${PAI_DIR}/config/secrets.json | grep -A 5 caido
```

### If Test 3 (CDN Detection) fails:
- Verify Caido intercepted HTTPS traffic
- Check response headers in Caido UI
- Ensure request was to CDN-backed site
- Try well-known CDN site (cloudflare.com, aws.amazon.com)

### If Tests 4-8 (Payload Generation) fail:
- Verify skill SKILL.md loaded correctly
- Check delimiter tables present
- Review error logs in ${PAI_DIR}/debug/latest

### If Test 9 (Caido Findings) fails:
- Verify Caido MCP has create_findings_from_requests function
- Check Caido version (requires 1.0+)
- Manually test finding creation in Caido UI

### If Tests 11-12 (Integration) fail:
- Ensure target site is accessible
- Check Caido scope includes target
- Verify Browser MCP installed (Test 12)
- Review MCP permissions

### If Tests 14-18 (Knowledge) fail:
- Re-read SKILL.md delimiter and normalization tables
- Skill context may not be loaded - try reactivating
- Check for SKILL.md parsing errors

### If Tests 19-20 (Practical) fail:
- Ensure all previous tests pass first
- Use authorized test target
- Verify Caido has proxied traffic from target
- Check for false positives (not all sites vulnerable)

---

## Next Steps After Verification

1. **If All Tests Pass:**
   - ✅ CacheDeception skill is ready for production use
   - Test on authorized bug bounty targets
   - Integrate with SecurityAudit workflow
   - Build custom payload lists for common stacks

2. **If Some Tests Fail:**
   - Review troubleshooting steps above
   - Check `${PAI_DIR}/debug/latest` for errors
   - Consult INSTALL.md for missing dependencies
   - Test Caido MCP separately

3. **Practice Recommendations:**
   - Start with CDN identification
   - Master delimiter discovery
   - Practice on safe test targets
   - Document findings in Caido
   - Build exploit templates

4. **Advanced Usage:**
   - Create custom payload wordlists
   - Integrate with ffuf for automation
   - Build Caido workflows for fuzzing
   - Chain with other skills (VulnChaining, ClientSideAttacks)

---

## Reference Scenarios

### Scenario 1: CloudFlare + Spring (Semicolon)
```
Target: target.com (CloudFlare + Spring Boot)
Endpoint: /api/user (returns {"user": "alice", "token": "secret"})
Test: /api/user;x.css
Result: Cache stores dynamic response as static
Impact: Token theft via cache deception
```

### Scenario 2: CloudFront + Any (Hash Delimiter)
```
Target: target.com (CloudFront + Nginx)
Poisoning: /main.js#/../xss-payload
Result: Cache key = /main.js, origin serves /xss-payload
Impact: Mass XSS on all users loading main.js
```

### Scenario 3: IIS Backslash Normalization
```
Target: target.com (Azure + IIS)
Endpoint: /account (authenticated user data)
Test: /static/..%5Caccount
Result: Cache sees /static/..%5Caccount, IIS serves /account
Impact: Authenticated response cached as static resource
```

---

**Verification Complete!**
CacheDeception skill is [ ] ready / [ ] needs fixes
