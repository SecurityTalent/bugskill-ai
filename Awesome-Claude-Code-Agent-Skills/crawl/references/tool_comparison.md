# Hakrawler vs Gospider: Detailed Comparison

This document provides a comprehensive comparison of hakrawler and gospider to help determine which tool to use for specific crawling scenarios.

## Overview

Both hakrawler and gospider are Go-based web crawlers designed for security testing and reconnaissance. They discover URLs, extract endpoints, and analyze web applications, but differ in their approach and feature sets.

## Feature Comparison

| Feature | hakrawler | gospider |
|---------|-----------|----------|
| **Speed** | Very fast | Moderate |
| **Depth Control** | Yes | Yes |
| **Subdomain Discovery** | Yes | Yes |
| **JavaScript Parsing** | Basic | Advanced |
| **JSON Output** | No | Yes |
| **Concurrent Requests** | High | Configurable |
| **Form Extraction** | No | Yes |
| **AWS Bucket Detection** | No | Yes |
| **Sitemap Parsing** | No | Yes |
| **Robots.txt Parsing** | No | Yes |
| **Link Types** | URLs only | Multiple types |
| **Output Format** | Plain text | JSON & Plain text |

## Tool Details

### hakrawler

**GitHub:** https://github.com/hakluke/hakrawler

**Strengths:**
- Extremely fast crawling
- Simple to use with minimal configuration
- Low resource usage
- Great for quick enumeration
- Pipes well with other tools

**Weaknesses:**
- Less comprehensive than gospider
- No JSON output for structured parsing
- Limited JavaScript analysis
- No form or sitemap parsing

**Best Use Cases:**
- Quick reconnaissance
- Initial enumeration
- Large-scale scanning with many targets
- Pipeline integration with grep/sed/awk
- Resource-constrained environments

**Installation:**
```bash
go install github.com/hakluke/hakrawler@latest
```

**Basic Usage:**
```bash
# Simple crawl
hakrawler -url https://example.com

# With depth
hakrawler -url https://example.com -depth 3

# Include subdomains
hakrawler -url https://example.com -subs

# From stdin (for piping)
echo "https://example.com" | hakrawler
```

**Output Format:**
Plain text URLs, one per line:
```
https://example.com/page1
https://example.com/api/endpoint
https://sub.example.com/resource
```

### gospider

**GitHub:** https://github.com/jaeles-project/gospider

**Strengths:**
- More comprehensive crawling
- JSON output for structured parsing
- Better JavaScript analysis
- Extracts forms, AWS buckets, subdomains
- Sitemap and robots.txt parsing
- Multiple output types (urls, forms, etc.)

**Weaknesses:**
- Slower than hakrawler
- More resource-intensive
- More complex configuration
- Can be overkill for simple tasks

**Best Use Cases:**
- Deep application mapping
- Comprehensive reconnaissance
- When JSON output is needed
- Finding forms and AWS buckets
- Detailed JavaScript analysis
- Bug bounty deep dives

**Installation:**
```bash
go install github.com/jaeles-project/gospider@latest
```

**Basic Usage:**
```bash
# Simple crawl
gospider -s https://example.com

# With depth and concurrent requests
gospider -s https://example.com -d 3 -c 10

# Include subdomains
gospider -s https://example.com --subs

# JSON output
gospider -s https://example.com --json

# Only JavaScript files
gospider -s https://example.com --js
```

**Output Format:**
Can output plain text or JSON:

Plain text:
```
[url] - https://example.com/page1
[javascript] - https://example.com/app.js
[form] - https://example.com/login (method: POST)
```

JSON:
```json
{"type":"url","output":"https://example.com/page1"}
{"type":"javascript","output":"https://example.com/app.js"}
{"type":"form","output":"https://example.com/login","method":"POST"}
```

## Performance Comparison

### Speed

**hakrawler:**
- ~500-1000 URLs/minute
- Minimal memory footprint
- CPU-efficient

**gospider:**
- ~200-500 URLs/minute (configurable)
- Higher memory usage
- More CPU-intensive due to advanced parsing

### Resource Usage

**hakrawler:**
- Memory: ~10-50 MB
- CPU: Low
- Network: High concurrent requests

**gospider:**
- Memory: ~50-200 MB
- CPU: Medium-High
- Network: Configurable concurrent requests (default: 5)

## Comparison by Use Case

### 1. Quick Reconnaissance

**Winner: hakrawler**

For rapid enumeration of a target:
```bash
hakrawler -url https://example.com -depth 2
```

Reasons:
- Faster execution
- Simpler output
- Lower resource usage
- Quick to filter with grep/awk

### 2. Deep Application Mapping

**Winner: gospider**

For comprehensive mapping:
```bash
gospider -s https://example.com -d 3 --json --subs
```

Reasons:
- Better JavaScript analysis
- Structured JSON output
- Form extraction
- More thorough crawling

### 3. JavaScript File Discovery

**Winner: gospider**

For finding JavaScript files:
```bash
gospider -s https://example.com --js
```

Reasons:
- Dedicated JS extraction
- Better JS parsing
- Can output only JS files

### 4. Subdomain Discovery

**Winner: Both (use both)**

Both tools support subdomain discovery:
```bash
hakrawler -url https://example.com -subs
gospider -s https://example.com --subs
```

Using both provides better coverage as they may find different subdomains.

### 5. API Endpoint Discovery

**Winner: gospider (slight edge)**

For API discovery:
```bash
gospider -s https://example.com --json | jq -r '.output' | grep -i api
```

Reasons:
- Better JavaScript parsing reveals more endpoints
- JSON output easier to filter
- Form extraction helps find POST endpoints

However, hakrawler is still effective and much faster.

### 6. Large-Scale Scanning

**Winner: hakrawler**

For scanning hundreds of targets:
```bash
cat targets.txt | hakrawler
```

Reasons:
- Much faster
- Lower resource usage
- Simpler to parallelize
- Stdin support

### 7. Bug Bounty Reconnaissance

**Winner: Both (use both)**

For comprehensive bug bounty work:
```bash
# Fast initial enum with hakrawler
hakrawler -url https://target.com -depth 2 -subs > hakrawler_urls.txt

# Deep analysis with gospider
gospider -s https://target.com -d 3 --subs --json > gospider_results.json
```

Using both provides maximum coverage.

## Output Processing

### hakrawler Output Processing

Simple text processing:
```bash
# Extract specific extensions
hakrawler -url https://example.com | grep "\.js$"

# Find admin panels
hakrawler -url https://example.com | grep -i admin

# Sort and deduplicate
hakrawler -url https://example.com | sort -u

# Extract parameters
hakrawler -url https://example.com | grep -o '?.*' | tr '&' '\n' | cut -d= -f1 | sort -u
```

### gospider Output Processing

JSON processing with jq:
```bash
# Extract only URLs
gospider -s https://example.com --json | jq -r '.output'

# Extract only JavaScript
gospider -s https://example.com --json | jq -r 'select(.type=="javascript") | .output'

# Extract forms
gospider -s https://example.com --json | jq -r 'select(.type=="form") | .output'

# Count by type
gospider -s https://example.com --json | jq -r '.type' | sort | uniq -c
```

## Integration Patterns

### Use Both for Maximum Coverage

The recommended approach is to use both tools:

```bash
# Combine results from both
(hakrawler -url https://example.com -depth 2 && \
 gospider -s https://example.com -d 2 | grep -o 'https://[^"]*') | \
 sort -u > all_urls.txt
```

Our Python wrapper (`scripts/crawl.py`) does this automatically:
```bash
python scripts/crawl.py https://example.com --tool both
```

### Pipeline Integration

**With hakrawler:**
```bash
# Direct piping
echo "https://example.com" | hakrawler | grep -i api

# Multiple targets
cat targets.txt | hakrawler | anew all_discovered.txt
```

**With gospider:**
```bash
# JSON to URLs
gospider -s https://example.com --json | jq -r '.output'

# Filter specific types
gospider -s https://example.com --json | jq -r 'select(.type=="javascript")'
```

## Recommendations

### Choose hakrawler when:
- Speed is critical
- Scanning multiple targets
- Resource-constrained environment
- Simple URL discovery is sufficient
- Piping to other tools

### Choose gospider when:
- Comprehensive mapping needed
- JSON output required
- Finding forms and specific elements
- Deep JavaScript analysis needed
- Single target deep dive

### Use both when:
- Maximum coverage required
- Bug bounty reconnaissance
- Security assessment
- Time permits thorough enumeration

## Common Issues

### hakrawler

**Issue:** Missing some endpoints
- **Solution:** Increase depth or use gospider for comprehensive scan

**Issue:** Too many concurrent requests
- **Solution:** Pipe to slower tools or rate limit externally

### gospider

**Issue:** Too slow for large scans
- **Solution:** Reduce depth, decrease concurrent requests, or use hakrawler

**Issue:** High memory usage
- **Solution:** Process output in real-time, don't store all in memory

**Issue:** Missing some URLs that hakrawler finds
- **Solution:** Use both tools for best coverage

## Conclusion

Both tools excel in different scenarios:

- **hakrawler** is best for speed and simplicity
- **gospider** is best for depth and comprehensiveness
- **Using both** provides the best overall coverage

Our unified Python wrapper (`scripts/crawl.py`) combines both tools and handles output processing, making it easy to leverage the strengths of both without manual integration.
