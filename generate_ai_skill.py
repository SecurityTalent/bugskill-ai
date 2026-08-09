#!/usr/bin/env python3
"""
HackerOne Public Reports to AI Skill Exporter
=============================================
Converts downloaded HackerOne public bug bounty reports JSON into a structured
AI Skill format (SKILL.md, references, and search utilities) for AI Agents
such as Antigravity, Cursor, Claude, ChatGPT, and GitHub Copilot.
"""

import json
import os
import sys
import shutil
from pathlib import Path
from collections import Counter, defaultdict

def load_reports(json_path):
    """Load HackerOne reports JSON file."""
    path = Path(json_path)
    if not path.exists():
        print(f"[!] Error: File '{json_path}' not found.")
        sys.exit(1)
    
    print(f"[*] Loading reports from: {path.resolve()}")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    reports = data.get("reports", [])
    print(f"[+] Successfully loaded {len(reports):,} reports.")
    return reports

def generate_ai_skill(reports, output_dir="skills/hackerone-bug-bounty"):
    """Generate AI Skill directory structure and content."""
    base_dir = Path(output_dir)
    ref_dir = base_dir / "references"
    scripts_dir = base_dir / "scripts"
    
    base_dir.mkdir(parents=True, exist_ok=True)
    ref_dir.mkdir(parents=True, exist_ok=True)
    scripts_dir.mkdir(parents=True, exist_ok=True)
    
    # Categorize reports
    cwe_counts = Counter()
    severity_counts = Counter()
    program_counts = Counter()
    top_bounties = []
    cwe_reports = defaultdict(list)
    
    for r in reports:
        attrs = r.get("attributes", {})
        rels = r.get("relationships", {})
        
        cwe = attrs.get("cwe") or "Uncategorized"
        sev = attrs.get("severity_rating") or "Unknown"
        bounty = attrs.get("total_awarded_amount") or 0
        program = rels.get("program", {}).get("data", {}).get("attributes", {}).get("name", "Unknown Program")
        
        cwe_counts[cwe] += 1
        severity_counts[sev] += 1
        program_counts[program] += 1
        
        item = {
            "id": r.get("id"),
            "title": attrs.get("title"),
            "url": attrs.get("url"),
            "cwe": cwe,
            "severity": sev,
            "bounty": bounty,
            "program": program,
            "disclosed_at": attrs.get("disclosed_at"),
            "summary": rels.get("report_generated_content", {}).get("data", {}).get("attributes", {}).get("hacktivity_summary")
        }
        
        if bounty and bounty > 0:
            top_bounties.append(item)
            
        cwe_reports[cwe].append(item)

    top_bounties.sort(key=lambda x: x["bounty"], reverse=True)

    # 1. Create SKILL.md
    skill_content = f"""---
name: hackerone-bug-bounty
description: Comprehensive security knowledge base and vulnerability pattern reference derived from {len(reports):,} real-world HackerOne disclosed bug bounty reports.
---

# HackerOne Bug Bounty Security AI Skill

This AI Skill equips AI Agents (Antigravity, Cursor, Claude, GPT-4) with real-world security vulnerability patterns, exploit vectors, code auditing workflows, and mitigation strategies learned from **{len(reports):,} disclosed HackerOne bug bounty reports**.

## Overview & Intelligence Stats

- **Total Analyzed Disclosed Reports:** {len(reports):,}
- **Top Vulnerability Categories (CWE):**
{chr(10).join([f"  - **{cwe}**: {count:,} reports" for cwe, count in cwe_counts.most_common(10)])}

- **Severity Breakdown:**
{chr(10).join([f"  - **{sev.capitalize()}**: {count:,} reports" for sev, count in severity_counts.most_common()])}

---

## AI Vulnerability Audit Guidelines

When auditing code or designing features, apply the following intelligence extracted from public reports:

### 1. Authentication & Session Management (OTP & Rate Limiting)
- **Pattern:** Missing rate limiting on sensitive APIs (e.g., OTP verification, login, password reset).
- **Audit Rule:** Verify that all authentication endpoints implement strict IP/user rate limiting and exponential backoff.
- **Reference Example:** OTP brute-forcing allows phone number hijacking or account takeover.

### 2. Authorization & IDOR (Insecure Direct Object Reference)
- **Pattern:** Accessing resources via sequential or predictable IDs without server-side permission checks.
- **Audit Rule:** Never rely on frontend authorization; perform strict tenant/user ownership checks on every request.

### 3. Server-Side Request Forgery (SSRF)
- **Pattern:** User-supplied URLs fetched by backend services (webhooks, avatar importers, PDF generators).
- **Audit Rule:** Validate URLs against strict allowlists, block internal IP ranges (`127.0.0.1`, `169.254.169.254`, `10.0.0.0/8`).

### 4. Input Validation & XSS / Injection
- **Pattern:** Unsanitized user inputs reflected in response headers, DOM, or SQL queries.
- **Audit Rule:** Enforce parameterized queries, strict output encoding, and strong Content Security Policies (CSP).

---

## Reference Guides

Detailed breakdown files included in this AI Skill:

- [`references/cwe_categories.md`](references/cwe_categories.md): Grouped report directory by CWE vulnerability type.
- [`references/top_bounties.md`](references/top_bounties.md): Highest paid bug bounty reports and key takeaways.
- [`references/security_checklists.md`](references/security_checklists.md): Practical code auditing checklist for AI pair programming.

---

## How AI Agents Should Use This Skill

1. **Code Review:** Before approving code edits, cross-reference function parameters against common CWE patterns.
2. **Security Architecture:** Proactively suggest rate limiters, input sanitizers, and token verifications.
3. **Exploit Mitigation:** Recommend exact remediation steps for reported vulnerabilities.
"""

    with open(base_dir / "SKILL.md", "w", encoding="utf-8") as f:
        f.write(skill_content)

    # 2. Create references/cwe_categories.md
    cwe_md = f"# HackerOne Vulnerabilities by CWE Category\n\nTotal Categories: {len(cwe_counts)}\n\n"
    for cwe, count in cwe_counts.most_common(25):
        cwe_md += f"## {cwe} ({count:,} Reports)\n\n"
        sub_items = cwe_reports[cwe][:5]
        for item in sub_items:
            bounty_str = f" - Bounty: ${item['bounty']:,}" if item['bounty'] else ""
            cwe_md += f"- **[{item['title']}]({item['url']})** (Program: `{item['program']}` | Severity: `{item['severity']}`{bounty_str})\n"
            if item['summary']:
                summary_text = item['summary'].replace('\n', ' ')
                if len(summary_text) > 200:
                    summary_text = summary_text[:200] + "..."
                cwe_md += f"  > *Summary:* {summary_text}\n"
        cwe_md += "\n"

    with open(ref_dir / "cwe_categories.md", "w", encoding="utf-8") as f:
        f.write(cwe_md)

    # 3. Create references/top_bounties.md
    bounty_md = f"# Top Awarded HackerOne Bug Bounty Reports\n\nTotal Rewarded Reports Analyzed: {len(top_bounties):,}\n\n"
    for item in top_bounties[:30]:
        bounty_md += f"### [${item['bounty']:,}] {item['title']}\n"
        bounty_md += f"- **URL:** {item['url']}\n"
        bounty_md += f"- **Program:** `{item['program']}` | **Severity:** `{item['severity']}` | **CWE:** `{item['cwe']}`\n"
        if item['summary']:
            bounty_md += f"- **Summary:** {item['summary']}\n"
        bounty_md += "\n---\n\n"

    with open(ref_dir / "top_bounties.md", "w", encoding="utf-8") as f:
        f.write(bounty_md)

    # 4. Create references/security_checklists.md
    checklist_md = """# AI Code Security & Audit Checklist

Use this checklist during code reviews to prevent common bug bounty vulnerabilities.

## 1. Authentication & Authorization
- [ ] Are all API endpoints protected by authorization middleware?
- [ ] Are direct object references (e.g. `/api/users/:id`) checked against the current session user?
- [ ] Is rate limiting enabled on sensitive routes (login, register, reset-password, OTP verification)?

## 2. Input Validation & Data Sanitization
- [ ] Are database queries using parameterized queries / prepared statements (SQLi prevention)?
- [ ] Is HTML output properly encoded or sanitized with a security library (XSS prevention)?
- [ ] Are file uploads restricted by file extension, MIME type, and size?

## 3. Server-Side Request Forgery (SSRF)
- [ ] Are external URLs fetched by the server validated against an allowlist?
- [ ] Is access to internal cloud metadata endpoints (`169.254.169.254`) blocked?

## 4. API & Business Logic
- [ ] Are price/amount parameters verified on the server side instead of trusting client input?
- [ ] Are CSRF tokens validated for state-changing requests?
- [ ] Are CORS headers restricted to authorized origins instead of wildcard `*`?
"""
    with open(ref_dir / "security_checklists.md", "w", encoding="utf-8") as f:
        f.write(checklist_md)

    # 5. Create helper script skills/hackerone-bug-bounty/scripts/search_reports.py
    search_script = """#!/usr/bin/env python3
import json
import sys
from pathlib import Path

def search_reports(query, json_path="hackerone_public_reports.json"):
    path = Path(json_path)
    if not path.exists():
        print(f"Data file '{json_path}' not found.")
        return
        
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    query_lower = query.lower()
    matches = []
    
    for r in data.get("reports", []):
        attrs = r.get("attributes", {})
        title = attrs.get("title", "") or ""
        cwe = attrs.get("cwe", "") or ""
        url = attrs.get("url", "") or ""
        
        if query_lower in title.lower() or query_lower in cwe.lower():
            matches.append((r.get("id"), title, attrs.get("severity_rating"), attrs.get("total_awarded_amount"), url))
            
    print(f"Found {len(matches)} matching reports for '{query}':\\n")
    for r_id, title, sev, bounty, url in matches[:20]:
        bounty_str = f" [${bounty:,}]" if bounty else ""
        print(f"- [{sev}] {title}{bounty_str}\\n  {url}\\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python search_reports.py <query_keyword>")
    else:
        search_reports(sys.argv[1])
"""
    with open(scripts_dir / "search_reports.py", "w", encoding="utf-8") as f:
        f.write(search_script)

    # Sync to .agents/skills for local Antigravity runtime
    agent_skill_dir = Path(".agents/skills/hackerone-bug-bounty")
    if agent_skill_dir.exists():
        shutil.rmtree(agent_skill_dir)
    shutil.copytree(base_dir, agent_skill_dir)

    print(f"[+] AI Skill successfully created at: {base_dir.resolve()}")
    print(f"[+] Synced to local Agent workspace: {agent_skill_dir.resolve()}")

if __name__ == "__main__":
    json_file = sys.argv[1] if len(sys.argv) > 1 else "hackerone_public_reports.json"
    reports = load_reports(json_file)
    generate_ai_skill(reports)
