---
name: hackerone-bug-bounty
description: Comprehensive security knowledge base and vulnerability pattern reference derived from 9,950 real-world HackerOne disclosed bug bounty reports.
---

# HackerOne Bug Bounty Security AI Skill

This AI Skill equips AI Agents (Antigravity, Cursor, Claude, GPT-4) with real-world security vulnerability patterns, exploit vectors, code auditing workflows, and mitigation strategies learned from **9,950 disclosed HackerOne bug bounty reports**.

## Overview & Intelligence Stats

- **Total Analyzed Disclosed Reports:** 9,950
- **Top Vulnerability Categories (CWE):**
  - **Uncategorized**: 948 reports
  - **Information Disclosure**: 881 reports
  - **Improper Access Control - Generic**: 673 reports
  - **Cross-site Scripting (XSS) - Reflected**: 516 reports
  - **Cross-site Scripting (XSS) - Stored**: 467 reports
  - **Uncontrolled Resource Consumption**: 377 reports
  - **Violation of Secure Design Principles**: 370 reports
  - **Improper Authentication - Generic**: 367 reports
  - **Business Logic Errors**: 346 reports
  - **Cross-site Scripting (XSS) - Generic**: 296 reports

- **Severity Breakdown:**
  - **Medium**: 3,425 reports
  - **Low**: 2,129 reports
  - **High**: 1,859 reports
  - **Unknown**: 1,084 reports
  - **Critical**: 968 reports
  - **None**: 485 reports

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
