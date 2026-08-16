# JSA - JavaScript Security Analyzer

Comprehensive JavaScript security analysis tool that uses Chrome DevTools MCP to analyze web applications.

## Purpose

Automatically analyze a website's JavaScript for security vulnerabilities, API endpoints, authentication methods, and potential XSS sinks. Creates a detailed security report with file and line number citations.

## Usage

```
/jsa <domain>
```

Example:
```
/jsa example.com
/jsa https://app.example.com
```

## What it does

1. **Navigates to domain** using Chrome DevTools MCP
2. **Captures all JavaScript files** loaded by the page
3. **Downloads JavaScript files** for analysis
4. **Runs jsluice** on all files to extract endpoints, secrets, and patterns
5. **Analyzes code** for:
   - XSS sinks (innerHTML, eval, document.write, etc.)
   - API endpoints and routes
   - Authentication methods
   - Obfuscation techniques
   - Frameworks and libraries
6. **Generates comprehensive Markdown report** with:
   - File:line citations for all dangerous functions
   - Complete endpoint list with cURL commands
   - Security vulnerability analysis
   - Remediation recommendations

## Output

Creates a project folder structure:
```
/tmp/jsa-analysis/<domain>/
├── js/                    # Downloaded JavaScript files
├── jsluice/              # jsluice output files
├── report.md             # Main security analysis report
└── endpoints.txt         # Extracted endpoints list
```

## Requirements

- Chrome DevTools MCP (installed)
- jsluice (will check and install if needed)
- Headless Chrome running on port 9222

## Parameters

- `<domain>` - Target domain to analyze (required)
  - Can be domain only: `example.com`
  - Or full URL: `https://example.com`
  - Or subdomain: `app.example.com`
