# 🛡️ HackerOne Bug Bounty Intelligence & AI Agent Skills

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HackerOne API](https://img.shields.io/badge/HackerOne-API%20v1-red.svg)](https://api.hackerone.com/)
[![Disclosed Reports](https://img.shields.io/badge/Disclosed%20Reports-9%2C950-brightgreen.svg)](#-dataset-overview)
[![Total Bounty Paid](https://img.shields.io/badge/Total%20Bounties-%243.26M%2B-gold.svg)](#-dataset-overview)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20External%20(Stdlib)-brightgreen.svg)](#-zero-external-dependencies)
[![AI Skills Ready](https://img.shields.io/badge/AI%20Skills-Claude%20Code%20%7C%20Gemini%20%7C%20Codex%20%7C%20Antigravity-brightgreen.svg)](#-how-to-use-skills-in-ai-agents-using-it)

An enterprise-grade repository combining **9,950+ real-world disclosed HackerOne bug bounty reports** ($3.26M+ in bounties paid) with a modular library of high-precision, manually crafted **AI Agent Skills** (`SKILL.md` + standalone tools) designed for next-generation AI coding assistants: **Claude Code**, **Gemini CLI**, **Google Antigravity**, **ChatGPT / Codex CLI**, and **Cursor**.

---

## 📑 Table of Contents

- [📊 Dataset Overview](#-dataset-overview)
- [🧠 Modular Manual Skill Engineering](#-modular-manual-skill-engineering)
- [📁 Repository Architecture](#-repository-architecture)
- [⚡ Zero External Dependencies](#-zero-external-dependencies)
- [🤖 How to Use Skills in AI Agents ("Using It")](#-how-to-use-skills-in-ai-agents-using-it)
  - [1. Cross-Agent Compatibility & Installation Matrix](#1-cross-agent-compatibility--installation-matrix)
  - [2. Using with Claude Code](#2-using-with-claude-code)
  - [3. Using with Gemini CLI & Antigravity](#3-using-with-gemini-cli--antigravity)
  - [4. Using with ChatGPT / Codex CLI](#4-using-with-chatgpt--codex-cli)
  - [5. Using with Cursor / VS Code](#5-using-with-cursor--vs-code)
- [📦 Skills Library Structure](#-skills-library-structure)
- [🔎 Offline Report Search & Intelligence CLI (`search_reports.py`)](#-offline-report-search--intelligence-cli-search_reportspy)
- [⚡ HackerOne Hacktivity Downloader (`hackerone_public.py`)](#-hackerone-hacktivity-downloader-hackerone_publicpy)
- [✍️ Contributor Guide: Adding New Skills](#️-contributor-guide-adding-new-skills)
- [📜 License & Responsible Disclosure](#-license--responsible-disclosure)

---

## 📊 Dataset Overview

The repository contains an offline intelligence dataset of **`9,950` disclosed vulnerability reports** fetched directly from the official HackerOne Hacktivity REST API.

| Metric | Details |
| :--- | :--- |
| **Total Disclosed Reports** | **9,950** vulnerabilities |
| **Total Bounty Value Paid** | **$3,264,576.00+** |
| **Bounty Rewarded Reports** | **1,832** reports (Average: **$1,781.97** per rewarded bug) |
| **Top Rewarded Vulnerability** | **$50,000.00** (Shopify GitHub access token exposure) |
| **Dataset File** | [`hackerone_public_reports.json`](hackerone_public_reports.json) (13.7 MB JSON) |
| **Key Categories** | IDOR, SSRF, OTP/2FA Bypass, Rate Limiting, RCE, OAuth Flaws, ATO |

---

## 🧠 Modular Manual Skill Engineering

Automated LLM skill generators fail to capture the subtle mechanics of real-world bug bounties. High-impact security research requires specialized, handcrafted skill packages tailored for each vulnerability class:

1. **Modular Architecture:** Each vulnerability technique is packaged inside its own directory under [`Claude Code Agent Skills/<skill-name>/`](Claude%20Code%20Agent%20Skills/) containing its `SKILL.md` methodology, standalone helper scripts, and test references.
2. **Deterministic Response Oracles:** Capturing micro-signals (e.g. content-length outlier buckets, specific error headers, or HTTP status anomalies).
3. **Context-Aware Verification:** Defensive token handling, single-use replay awareness, exponential backoff, and 429/403 rate-limiting resilience.
4. **Impact Chaining:** Structured instructions guiding AI agents on how to capture original requests, replay verified payloads, and document complete Account Takeover (ATO) or privilege escalation chains.

---

## 📁 Repository Architecture

```text
.
├── README.md                          # Repository documentation & multi-agent guide
├── requirements.txt                   # Dependency and architecture notes
├── search_reports.py                  # Multi-dimensional search & analytics CLI (stdlib)
├── hackerone_public.py                # HackerOne API report downloader (stdlib)
├── hackerone_public_reports.json      # Offline dataset (9,950 disclosed reports)
│
├── Claude Code Agent Skills/          # 📦 Modular Master Library for Agent Skills
│   ├── Note.md                        # Tracking converted HackerOne report IDs
│   │
│   └── <skill-name>/                  # Individual Skill Package
│       ├── SKILL.md                   # Portable skill methodology (YAML frontmatter)
│       ├── scripts/                   # Standalone Python/Bash automation tools
│       └── references/                # (Optional) Checklists, payloads, CVE/CWE data
│
└── .agents/skills/                    # Workspace agent runtime directory (Antigravity/Codex)
    ├── hackerone-bug-bounty/          # General intelligence reference
    └── otp-bruteforce-testing/        # Synced verification skill
```

---

## ⚡ Zero External Dependencies

All core utilities and skill automation tools in this repository are written natively using the **Python 3 Standard Library** (Python 3.8+):

- [`search_reports.py`](file:///C:/Users/user/Desktop/Desktop/search_reports.py) (`json`, `argparse`, `pathlib`, `collections`)
- [`hackerone_public.py`](file:///C:/Users/user/Desktop/Desktop/hackerone_public.py) (`urllib.request`, `base64`, `json`, `argparse`)
- Skill automation scripts (e.g., `scripts/otp_bruteforce.py`) (`urllib.request`, `threading`, `json`, `argparse`)

No third-party packages or `pip install` steps are required to run any tool or Agent Skill in this repository.

---

## 🤖 How to Use Skills in AI Agents ("Using It")

Every skill in [`Claude Code Agent Skills/`](Claude%20Code%20Agent%20Skills/) follows an open, cross-compatible standard readable by **Claude Code**, **Gemini CLI**, **Google Antigravity**, **ChatGPT / Codex CLI**, and **Cursor**.

### 1. Cross-Agent Compatibility & Installation Matrix

| AI Agent | Global / Personal Scope | Project / Repository Scope |
| :--- | :--- | :--- |
| **Claude Code** | `~/.claude/skills/<skill-name>/` | `.claude/skills/<skill-name>/` |
| **Gemini CLI** | `~/.gemini/skills/` or `~/.agents/skills/` | `.gemini/skills/` or `.agents/skills/` |
| **Google Antigravity** | `~/.agents/skills/<skill-name>/` | `.agents/skills/<skill-name>/` |
| **ChatGPT / Codex CLI** | `~/.codex/skills/` or `~/.agents/skills/` | `.agents/skills/<skill-name>/` |

#### Generic Installation Commands (Replace `<skill-name>` with any skill):

```bash
# Example: Install a skill to Claude Code (Project Scope)
mkdir -p .claude/skills/<skill-name>
cp -r "Claude Code Agent Skills/<skill-name>/"* .claude/skills/<skill-name>/

# Example: Install a skill globally for Claude Code (All projects)
mkdir -p ~/.claude/skills/<skill-name>
cp -r "Claude Code Agent Skills/<skill-name>/"* ~/.claude/skills/<skill-name>/

# Example: Install for Gemini CLI, Antigravity, and OpenAI Codex
mkdir -p ~/.agents/skills/<skill-name>
cp -r "Claude Code Agent Skills/<skill-name>/"* ~/.agents/skills/<skill-name>/
```

---

### 2. Using with Claude Code

After installing a skill into `~/.claude/skills/<skill-name>` or `.claude/skills/<skill-name>`:

#### Method 1: Slash Command
Trigger the skill explicitly using its name:
```text
/<skill-name>
```

#### Method 2: Natural Prompting (Auto-Invocation)
Claude Code automatically indexes the `description` in `SKILL.md` and invokes the appropriate skill when your prompt describes a matching workflow:

> **Example Prompt:**
> *"Audit our authentication endpoints for OTP brute-force vulnerabilities using our security skill rules. Request payload is `{"phone":"+15551234567","otp":"{{OTP}}"}` with Burp proxy at `http://127.0.0.1:8080`."*

---

### 3. Using with Gemini CLI & Antigravity

- **Auto-Discovery:** Antigravity and Gemini CLI automatically load any skill placed under `.agents/skills/` or `~/.agents/skills/`.
- **Manual Import Command:**
  ```bash
  gemini skills install "./Claude Code Agent Skills/<skill-name>"
  ```
- **Prompt Execution:** The agent autonomously applies the methodology and tools specified in `SKILL.md`.

---

### 4. Using with ChatGPT / Codex CLI

- Codex CLI reads from `.agents/skills/` or `~/.codex/skills/`.
- View loaded skills:
  ```text
  codex /skills
  ```
- Prompt Codex directly with target parameters and workflow requirements.

---

### 5. Using with Cursor / VS Code

- Add a pointer inside `.cursorrules`:
  ```text
  Reference skills from Claude Code Agent Skills/<skill-name>/SKILL.md when auditing security workflows.
  ```
- Or `@mention` any `SKILL.md` directly in Cursor Composer/Chat.

---

## 📦 Skills Library Structure

Each skill inside [`Claude Code Agent Skills/`](Claude%20Code%20Agent%20Skills/) is self-contained:

```text
Claude Code Agent Skills/<skill-name>/
├── SKILL.md                  # Main prompt rules, attack phases, CVSS scoring, and remediation
├── scripts/                  # Standalone CLI tools (Python 3 stdlib only, proxy-aware)
│   └── <tool_name>.py
└── references/               # (Optional) Payloads, cheat sheets, and checklists
```

### Current Available Skills:
- **`otp-bruteforce-testing`**: Complete OTP verification testing methodology (HackerOne [#3265780](https://hackerone.com/reports/3265780)) with response oracle detection, multi-threading, proxy support, and replay confirmation.
- *(Additional manual skills for IDOR, SSRF, Race Conditions, and OAuth vulnerabilities are actively added to this directory).*

---

## 🔎 Offline Report Search & Intelligence CLI (`search_reports.py`)

Search and analyze the **9,950+ disclosed reports** dataset offline with sub-second execution:

```bash
# 1. Global keyword search
python search_reports.py "OTP"
python search_reports.py "IDOR"
python search_reports.py "SSRF"

# 2. Filter by severity and minimum bounty
python search_reports.py "bypass" --severity critical --min-bounty 2500

# 3. Filter by CWE category
python search_reports.py --cwe "CWE-307"
python search_reports.py --cwe "CWE-79" --limit 10

# 4. Filter by target company/program
python search_reports.py --program "shopify" --severity high

# 5. Inspect deep report details by ID
python search_reports.py --id 3265780

# 6. Display high-level dataset statistics
python search_reports.py --stats

# 7. Output structured JSON for scripts and CI/CD pipelines
python search_reports.py "RCE" --severity critical --json
```

---

## ⚡ HackerOne Hacktivity Downloader (`hackerone_public.py`)

To refresh or append newly disclosed reports directly from the HackerOne REST API:

1. Obtain your API Identifier and Token from [HackerOne Settings -> API](https://hackerone.com/settings/api).
2. Set your environment variables:

```bash
# Linux / macOS
export H1_API_IDENTIFIER="YOUR_IDENTIFIER"
export H1_API_TOKEN="YOUR_TOKEN"

# Windows (PowerShell)
$env:H1_API_IDENTIFIER="YOUR_IDENTIFIER"
$env:H1_API_TOKEN="YOUR_TOKEN"
```

3. Run the downloader:

```bash
# Download latest 10 pages (500 reports)
python hackerone_public.py --max-pages 10

# Download all disclosed reports (0 = unlimited)
python hackerone_public.py --max-pages 0 --output hackerone_public_reports.json
```

---

## ✍️ Contributor Guide: Adding New Skills

When adding a new manual skill from a HackerOne report:

1. **Select a Target Report:** Use `python search_reports.py` to identify an impactful disclosed report.
2. **Create the Skill Directory:**
   ```text
   Claude Code Agent Skills/<skill-name>/
   ├── SKILL.md
   └── scripts/
       └── <tool_name>.py
   ```
3. **Draft `SKILL.md`:**
   - Include valid YAML frontmatter (`name`, `description`).
   - Define actionable phases (`Phase 0: Recon`, `Phase 1: Baseline`, `Phase 2: Probing`, `Phase 3: Automation`, `Phase 4: Impact Chaining`).
   - Include CVSS 3.1 scoring, CWE mapping, and remediation checklists.
4. **Develop Standalone Tool:** Use Python 3 Standard Library only, proxy-aware, with defensive rate-limiting and timeouts.
5. **Log Progress:** Append the HackerOne report ID in [`Claude Code Agent Skills/Note.md`](Claude%20Code%20Agent%20Skills/Note.md).

---

## 📜 License & Responsible Disclosure

- **License:** Distributed under the [MIT License](LICENSE).
- **Responsible Disclosure & Ethics:** All disclosed vulnerability reports in this dataset are public data published by HackerOne under mutual agreement with respective security teams. This toolkit is intended solely for authorized security assessments, defensive hardening, and educational research. Always obtain explicit authorization before testing any third-party infrastructure.
