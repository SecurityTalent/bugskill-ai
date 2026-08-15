# 🛡️ HackerOne Bug Bounty Intelligence & AI Agent Skills

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HackerOne API](https://img.shields.io/badge/HackerOne-API%20v1-red.svg)](https://api.hackerone.com/)
[![Disclosed Reports](https://img.shields.io/badge/Disclosed%20Reports-9%2C950-brightgreen.svg)](#-dataset-overview)
[![Total Bounty Paid](https://img.shields.io/badge/Total%20Bounties-%243.26M%2B-gold.svg)](#-dataset-overview)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20External%20(Stdlib)-brightgreen.svg)](#-zero-external-dependencies)
[![Universal AI Skills](https://img.shields.io/badge/AI%20Skills-Claude%20Code%20%7C%20Gemini%20%7C%20Codex%20%7C%20Antigravity-brightgreen.svg)](#-universal-agent-skills-framework-using-it)

An enterprise-grade repository combining **9,950+ real-world disclosed HackerOne bug bounty reports** ($3.26M+ in bounties paid) with a modular, dynamic, plug-and-play library of **Universal AI Agent Skills** (`Claude Code Agent Skills/*`) designed for next-generation AI coding assistants: **Claude Code**, **Gemini CLI**, **Google Antigravity**, **ChatGPT / Codex CLI**, and **Cursor**.

---

## 📑 Table of Contents

- [📊 Dataset Overview](#-dataset-overview)
- [🧩 Universal Wildcard Skills Architecture (`Claude Code Agent Skills/*`)](#-universal-wildcard-skills-architecture-claude-code-agent-skills)
- [📁 Clean Repository Layout](#-clean-repository-layout)
- [⚡ Zero External Dependencies](#-zero-external-dependencies)
- [🤖 Universal Agent Skills Framework ("Using It")](#-universal-agent-skills-framework-using-it)
  - [1. Cross-Agent Compatibility Matrix](#1-cross-agent-compatibility-matrix)
  - [2. One-Command Universal Sync (Install All Skills at Once)](#2-one-command-universal-sync-install-all-skills-at-once)
  - [3. Using with Claude Code](#3-using-with-claude-code)
  - [4. Using with Gemini CLI & Google Antigravity](#4-using-with-gemini-cli--google-antigravity)
  - [5. Using with ChatGPT / Codex CLI](#5-using-with-chatgpt--codex-cli)
  - [6. Using with Cursor / VS Code](#6-using-with-cursor--vs-code)
- [📦 Inside `Claude Code Agent Skills/*`](#-inside-claude-code-agent-skills)
  - [Active Skills in the Library](#active-skills-in-the-library)
- [🔎 Offline Report Search & Intelligence CLI (`search_reports.py`)](#-offline-report-search--intelligence-cli-search_reportspy)
- [⚡ HackerOne Hacktivity Downloader (`hackerone_public.py`)](#-hackerone-hacktivity-downloader-hackerone_publicpy)
- [✍️ How to Add Any New Skill to the Library](#️-how-to-add-any-new-skill-to-the-library)
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
| **Key Vulnerability Classes** | IDOR, SSRF, OTP/2FA Bypass, Rate Limiting, RCE, OAuth Flaws, ATO, Race Conditions |

---

## 🧩 Universal Wildcard Skills Architecture (`Claude Code Agent Skills/*`)

The [`Claude Code Agent Skills/`](Claude%20Code%20Agent%20Skills/) directory is engineered as a **wildcard, self-discovering skill library**. 

> 💡 **Core Principle:** **Every single directory placed inside `Claude Code Agent Skills/*` works autonomously across ALL AI Agent ecosystems.**
> 
> No matter what folder name or directory structure you add under `Claude Code Agent Skills/<any-skill-name>/`, as long as it contains a `SKILL.md` (with standard YAML frontmatter) and any optional helper files (`scripts/`, `references/`, `payloads/`), it will immediately execute across **Claude Code**, **Gemini CLI**, **Google Antigravity**, **Codex**, and **Cursor**.

```text
Claude Code Agent Skills/
├── Note.md                            # Central ledger of converted HackerOne report IDs
│
├── otp-bruteforce-testing/            # Skill: OTP Brute-Force & Oracle Testing (H1 #3265780)
│   ├── SKILL.md                       # Structured methodology & agent instructions
│   └── scripts/otp_bruteforce.py      # Standalone Python 3 stdlib automation tool
│
├── url-parser-confusion-testing/      # Skill: URL Parser Confusion & SSRF (H1 #3923212)
│   ├── SKILL.md                       # Differential parsing methodology & vectors
│   └── scripts/url_parser_diff.py     # Standalone differential testing tool
│
└── <any-future-skill-folder>/         # 🚀 100% Wildcard & Plug-and-Play
    ├── SKILL.md                       # Required: Prompt instructions & methodology
    ├── scripts/                       # Optional: Standalone automation tools & PoCs
    └── references/                    # Optional: Checklists, payloads, and notes
```

---

## 📁 Clean Repository Layout

```text
.
├── README.md                          # Repository documentation & universal agent guide
├── requirements.txt                   # Dependency notes (Zero external dependencies)
├── search_reports.py                  # Offline multi-filter search CLI (Python stdlib)
├── hackerone_public.py                # HackerOne API Hacktivity downloader (Python stdlib)
├── hackerone_public_reports.json      # Offline dataset (9,950 disclosed reports)
│
└── Claude Code Agent Skills/          # 📦 MASTER SKILL LIBRARY (Universal & Dynamic)
    ├── Note.md                        # Master index of converted HackerOne report IDs
    ├── otp-bruteforce-testing/        # OTP Brute-Force & Oracle Testing Skill
    │   ├── SKILL.md
    │   └── scripts/otp_bruteforce.py
    ├── url-parser-confusion-testing/  # URL Parser Confusion & SSRF Filter Bypass Skill
    │   ├── SKILL.md
    │   └── scripts/url_parser_diff.py
    └── <any-skill-folder>/            # Any directory here is auto-detected & supported
```

> **Note on Local Agent Runtimes:** Local directories such as `.agents/` and `.claude/` are ignored via `.gitignore` to keep the public repository clean. All skills reside authoritatively in `Claude Code Agent Skills/*`.

---

## ⚡ Zero External Dependencies

All tools, search utilities, and skill scripts in this repository are written natively using the **Python 3 Standard Library** (Python 3.8+):

- [`search_reports.py`](search_reports.py) (`json`, `argparse`, `pathlib`, `collections`)
- [`hackerone_public.py`](hackerone_public.py) (`urllib.request`, `base64`, `json`, `argparse`)
- [`Claude Code Agent Skills/*`](Claude%20Code%20Agent%20Skills/) (`urllib.request`, `threading`, `json`, `argparse`, `ipaddress`, `subprocess`)

No third-party packages or `pip install` steps are required. Everything executes instantly out of the box.

---

## 🤖 Universal Agent Skills Framework ("Using It")

Every skill in [`Claude Code Agent Skills/`](Claude%20Code%20Agent%20Skills/) follows the portable open standard (`SKILL.md` with YAML frontmatter + optional standalone scripts), making it universally compatible across all major agent environments.

### 1. Cross-Agent Compatibility Matrix

| AI Agent Platform | Global / Personal Scope | Project / Repository Scope |
| :--- | :--- | :--- |
| **Claude Code** | `~/.claude/skills/<skill-name>/` | `.claude/skills/<skill-name>/` |
| **Gemini CLI** | `~/.gemini/skills/` or `~/.agents/skills/` | `.gemini/skills/` or `.agents/skills/` |
| **Google Antigravity** | `~/.agents/skills/<skill-name>/` | `.agents/skills/<skill-name>/` |
| **ChatGPT / Codex CLI** | `~/.codex/skills/` or `~/.agents/skills/` | `.agents/skills/<skill-name>/` |
| **Cursor / VS Code** | `@mention SKILL.md` | `.cursorrules` / `.vscode/` |

---

### 2. One-Command Universal Sync (Install All Skills at Once)

You can sync **every single skill** in `Claude Code Agent Skills/*` into your target agent environment with a single command:

#### Linux / macOS (Bash / Zsh):
```bash
# Sync ALL skills to Claude Code (Project Scope)
mkdir -p .claude/skills && cp -r "Claude Code Agent Skills/"* .claude/skills/

# Sync ALL skills to Claude Code (Global Scope - Available in all projects)
mkdir -p ~/.claude/skills && cp -r "Claude Code Agent Skills/"* ~/.claude/skills/

# Sync ALL skills to Gemini CLI, Google Antigravity & OpenAI Codex
mkdir -p ~/.agents/skills && cp -r "Claude Code Agent Skills/"* ~/.agents/skills/
```

#### Windows (PowerShell):
```powershell
# Sync ALL skills to Claude Code (Project Scope)
New-Item -ItemType Directory -Force -Path ".claude\skills"; Copy-Item -Recurse -Force "Claude Code Agent Skills\*" ".claude\skills\"

# Sync ALL skills to Claude Code (Global Scope)
New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills"; Copy-Item -Recurse -Force "Claude Code Agent Skills\*" "$HOME\.claude\skills\"

# Sync ALL skills to Gemini CLI, Google Antigravity & Codex
New-Item -ItemType Directory -Force -Path "$HOME\.agents\skills"; Copy-Item -Recurse -Force "Claude Code Agent Skills\*" "$HOME\.agents\skills\"
```

---

### 3. Using with Claude Code

Once installed or synced into `.claude/skills/` or `~/.claude/skills/`:

#### Method 1: Direct Slash Command
Invoke any skill directly by typing its folder name:
```text
/<skill-name>

# Examples:
/otp-bruteforce-testing
/url-parser-confusion-testing
```

#### Method 2: Natural Prompting (Auto-Invocation)
Claude Code automatically indexes the `description` in every `SKILL.md` and activates the appropriate skill whenever you describe a relevant task:

> **Example Prompt:**
> *"Audit our authentication APIs for OTP brute-force vulnerabilities. The endpoint is `https://target.com/api/verify-phone` with payload `{"phone":"+15551234567","otp":"{{OTP}}"}` and Burp proxy at `http://127.0.0.1:8080`."*

Claude Code will automatically:
1. Load the corresponding `SKILL.md`.
2. Follow the multi-phase audit methodology (Recon → Baseline → Probing → Automation → Replay).
3. Execute bundled Python helper scripts.
4. Provide CVSS scoring, CWE mapping, and remediation steps.

---

### 4. Using with Gemini CLI & Google Antigravity

- **Auto-Discovery:** Antigravity and Gemini CLI automatically load and execute any skill located in `.agents/skills/` or `~/.agents/skills/`.
- **Manual Import Single Skill:**
  ```bash
  gemini skills install "./Claude Code Agent Skills/<skill-name>"
  ```
- **Execution:** Simply describe the security testing or code review scenario in your prompt; the agent autonomously plans and executes the phases.

---

### 5. Using with ChatGPT / Codex CLI

- Codex CLI automatically reads skills from `.agents/skills/` or `~/.codex/skills/`.
- List active skills:
  ```text
  codex /skills
  ```
- Prompt Codex with endpoint URLs, parameters, and testing requirements.

---

### 6. Using with Cursor / VS Code

- Add a reference in `.cursorrules`:
  ```text
  When conducting security testing or code reviews, adhere to the methodologies in:
  Claude Code Agent Skills/<skill-name>/SKILL.md
  ```
- Or `@mention` any `SKILL.md` file directly in Cursor Composer/Chat.

---

## 📦 Inside `Claude Code Agent Skills/*`

Every skill directory in `Claude Code Agent Skills/*` is self-contained:

```text
Claude Code Agent Skills/<skill-name>/
├── SKILL.md                  # Main prompt rules, attack phases, CVSS scoring, and remediation
├── scripts/                  # Standalone CLI tools (Python 3 stdlib only, proxy-aware)
│   └── <tool_name>.py
└── references/               # (Optional) Payloads, cheat sheets, and checklists
```

### Active Skills in the Library:

| Skill Directory | Target Vulnerability Class | Reference Report | Included Tooling |
| :--- | :--- | :--- | :--- |
| [`otp-bruteforce-testing`](Claude%20Code%20Agent%20Skills/otp-bruteforce-testing/) | OTP Brute-Force, Rate Limiting Bypass & Response Oracle Detection | HackerOne [#3265780](https://hackerone.com/reports/3265780) | [`scripts/otp_bruteforce.py`](Claude%20Code%20Agent%20Skills/otp-bruteforce-testing/scripts/otp_bruteforce.py) (Multi-threaded, proxy support, response oracle detection) |
| [`url-parser-confusion-testing`](Claude%20Code%20Agent%20Skills/url-parser-confusion-testing/) | URL Parser Inconsistencies & SSRF Filter Bypass (Triple-Slash, Delimiters, Numeric IPs) | HackerOne [#3923212](https://hackerone.com/reports/3923212) | [`scripts/url_parser_diff.py`](Claude%20Code%20Agent%20Skills/url-parser-confusion-testing/scripts/url_parser_diff.py) (Differential parser testing across Python, cURL, and Node.js) |

*(Additional skills covering IDOR, Blind SSRF, Race Conditions, OAuth Flaws, and Account Takeover are continuously added).*

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
python search_reports.py --id 3923212

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

## ✍️ How to Add Any New Skill to the Library

To add any new skill to the collection:

1. **Pick a Disclosed Report:** Search `hackerone_public_reports.json` using `python search_reports.py`.
2. **Create New Folder:** Create `Claude Code Agent Skills/<your-skill-name>/`.
3. **Write `SKILL.md`:**
   ```markdown
   ---
   name: <your-skill-name>
   description: <Clear, keyword-rich summary of what this skill tests and when agents should activate it>
   ---

   # Skill Title

   ## When to use
   ...
   ## Core attack pattern (Reference: HackerOne #ID)
   ...
   ## Phase 0: Recon & Target Mapping
   ## Phase 1: Baseline Discovery
   ## Phase 2: Probing & Bypasses
   ## Phase 3: Automation Tooling
   ## Phase 4: Impact Chaining & Replay
   ## Reporting & CVSS 3.1
   ## Remediation Checklist
   ```
4. **Add Helper Script (Optional):** Put standalone Python tools in `Claude Code Agent Skills/<your-skill-name>/scripts/` (Python 3 stdlib only, proxy-supported).
5. **Record in Note.md:** Add the HackerOne report ID to [`Claude Code Agent Skills/Note.md`](Claude%20Code%20Agent%20Skills/Note.md).

Any agent will immediately pick up and execute the new skill!

---

## 📜 License & Responsible Disclosure

- **License:** Distributed under the [MIT License](LICENSE).
- **Responsible Disclosure & Ethics:** All disclosed vulnerability reports in this dataset are public data published by HackerOne under mutual agreement with respective security teams. This toolkit is intended solely for authorized security assessments, defensive hardening, and educational research. Always obtain explicit authorization before testing any third-party infrastructure.
