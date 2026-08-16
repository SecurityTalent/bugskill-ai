# JSA - JavaScript Security Analyzer

You are conducting a comprehensive JavaScript security analysis on the provided domain.

## Domain to Analyze
{{DOMAIN}}

## Your Task

Perform a complete JavaScript security analysis following these steps:

### Phase 1: Setup and Navigation
1. Create project directory: `/tmp/jsa-analysis/{{DOMAIN_CLEAN}}/`
2. Create subdirectories: `js/`, `jsluice/`
3. Check if jsluice is installed, if not install it:
   ```bash
   which jsluice || go install github.com/BishopFox/jsluice/cmd/jsluice@latest
   ```
4. Navigate to the domain using Chrome DevTools MCP
5. Wait 8-10 seconds for page to fully load

### Phase 2: JavaScript Discovery and Download
1. Use `mcp__chrome-devtools__list_network_requests` with resourceTypes=["script"] to get all JS files
2. Download the top 10-15 most relevant JavaScript files to `js/` directory
   - Prioritize: main.js, app.js, bundle.js, chunk files, api.js, vendor.js
   - Skip: analytics, ads, tracking pixels unless relevant
3. Also extract inline JavaScript from the page using `evaluate_script`

### Phase 3: jsluice Analysis
For each downloaded JS file, run jsluice with these commands:

```bash
# IMPORTANT: jsluice requires the filename as an argument, not stdin
# Run in a loop over all JS files in the js/ directory

cd /tmp/jsa-analysis/{{DOMAIN_CLEAN}}/js
for file in *.js; do
  basename=$(basename "$file" .js)

  # Extract URLs/endpoints (save as JSON for better parsing)
  jsluice urls "$file" > ../jsluice/"${basename}_urls.json" 2>&1

  # Extract secrets/keys
  jsluice secrets "$file" > ../jsluice/"${basename}_secrets.json" 2>&1
done
```

### Phase 4: Manual JavaScript Analysis
Analyze each JavaScript file for:

1. **Dangerous Functions (with file:line citations)**:
   - innerHTML usage: `grep -n "innerHTML" file.js`
   - eval() calls: `grep -n "eval\(" file.js`
   - document.write: `grep -n "document\.write" file.js`
   - setTimeout/setInterval with strings: `grep -n "setTimeout\|setInterval" file.js`
   - window.location manipulation: `grep -n "window\.location" file.js`
   - jQuery .html(): `grep -n "\.html\(" file.js`
   - dangerouslySetInnerHTML: `grep -n "dangerouslySetInnerHTML" file.js`

2. **Frameworks and Libraries**:
   - Look for: React, Vue, Angular, jQuery, Next.js, Webpack patterns
   - Check for version info in comments or variable names

3. **API Endpoints**:
   - Extract all URLs matching: `https?://[domain].*` or `/api/.*` or `/v\d+/.*`
   - Look for baseURL, apiUrl, endpoint configuration objects

4. **Authentication Patterns**:
   - Search for: "auth", "token", "jwt", "session", "Bearer", "Authorization"
   - Identify cookie management code
   - Look for localStorage/sessionStorage usage

### Phase 5: Generate Comprehensive Report

Create `/tmp/jsa-analysis/{{DOMAIN_CLEAN}}/report.md` with these sections:

#### 1. APPLICATION OVERVIEW
- Technology stack (CMS, frameworks, libraries)
- Build system (webpack, rollup, etc.)
- Hosting/infrastructure clues
- Key third-party integrations

#### 2. API ARCHITECTURE & ROUTES
- Base API domains discovered
- All endpoints found (categorized)
- API versioning patterns
- GraphQL vs REST analysis

#### 3. CODE OBFUSCATION ANALYSIS
- Minification level
- Obfuscation techniques detected
- Variable/function name mangling
- String encoding
- De-obfuscation recommendations

#### 4. AUTHENTICATION & AUTHORIZATION
- Authentication methods detected (OAuth, JWT, cookies, etc.)
- Token handling patterns
- Session management
- Cookie analysis (names, flags, expiration)
- LocalStorage/SessionStorage usage
- Which endpoints require auth vs public

#### 5. XSS & DOM VULNERABILITY ANALYSIS
**CRITICAL: Include file:line citations for ALL findings**

Create a table:
| File | Line | Sink Type | Risk Level | Code Snippet | Context |
|------|------|-----------|------------|--------------|---------|

For each dangerous function found, include:
- Exact file path
- Line number
- Type of sink (innerHTML, eval, etc.)
- Risk level (CRITICAL, HIGH, MEDIUM, LOW)
- Actual code snippet
- Attack vector explanation
- Remediation recommendation

#### 6. ENDPOINT DOCUMENTATION & cURL COMMANDS
For each discovered endpoint, provide:
- Endpoint URL
- HTTP method (inferred or detected)
- Description
- Working cURL command example
- Expected authentication requirements

#### 7. COMPLETE ENDPOINT LIST
Bulleted list of ALL URLs/routes found:
- Categorize by type (API, static, auth, etc.)
- Include both full URLs and relative paths
- Mark which require authentication

#### 8. SECURITY FINDINGS & RECOMMENDATIONS
- Prioritized vulnerability list
- Information disclosure issues
- Recommended security tests
- Remediation priority (IMMEDIATE, HIGH, MEDIUM, LOW)

#### 9. JSLUICE FINDINGS SUMMARY
- Key secrets/tokens discovered
- Interesting URL patterns
- Suspicious code patterns

#### 10. SUMMARY
- Total files analyzed
- Total endpoints discovered
- Vulnerability count by severity
- Overall security posture assessment
- Top 3 recommendations

### Phase 6: Create Endpoints List
Create `/tmp/jsa-analysis/{{DOMAIN_CLEAN}}/endpoints.txt` with clean list of all endpoints (one per line)

### Phase 7: Final Output
At the end, tell the user:
1. Where the report is located
2. Number of JS files analyzed
3. Number of endpoints discovered
4. Critical/High vulnerability count
5. Command to view the report: `cat /tmp/jsa-analysis/{{DOMAIN_CLEAN}}/report.md`

## Important Guidelines

- **Always cite file and line numbers** for dangerous functions
- **Include code snippets** for all security findings
- **Be thorough but concise** in explanations
- **Prioritize security findings** by actual risk
- **Provide actionable cURL commands** that could actually work
- **Don't hallucinate endpoints** - only include what you actually found
- **Cross-reference jsluice output** with your manual findings
- **Mark uncertainty** when you're not sure about something

## Error Handling

If you encounter issues:
- Chrome fails to load: Report and suggest checking headless Chrome
- jsluice not found: Install it automatically
- JS file download fails: Try alternative files
- Domain unreachable: Report clearly and exit gracefully

## Example Output Format

```markdown
# JavaScript Security Analysis Report
**Domain**: example.com
**Date**: 2025-12-05
**Files Analyzed**: 12
**Endpoints Discovered**: 87
**Critical Issues**: 2

## 1. APPLICATION OVERVIEW
...

## 5. XSS & DOM VULNERABILITY ANALYSIS

### CRITICAL FINDINGS

#### 1. innerHTML Usage - HIGH RISK
**File**: `/tmp/jsa-analysis/example.com/js/main.bundle.js`
**Line**: 1247
**Code**:
\`\`\`javascript
element.innerHTML = userInput;
\`\`\`
**Risk Level**: HIGH
**Attack Vector**: Direct user input to innerHTML allows XSS
**Recommendation**: Use textContent or DOMPurify
...
```

Begin your analysis now.
