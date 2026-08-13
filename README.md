# 🛡️ HackerOne Public Bug Bounty Reports Auto-Downloader & AI Skill Exporter

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HackerOne API](https://img.shields.io/badge/HackerOne-API%20v1-red.svg)](https://api.hackerone.com/)
[![Disclosed Reports](https://img.shields.io/badge/Disclosed%20Reports-9%2C950-brightgreen.svg)](#-dataset-overview)
[![AI Skill Ready](https://img.shields.io/badge/AI%20Skill-Antigravity%20%7C%20Cursor%20%7C%20Claude-brightgreen.svg)]()

Automatically download disclosed public bug bounty reports from **HackerOne Hacktivity**, save them into clean JSON datasets, and convert them into structured **AI Skills (`SKILL.md`)** for AI coding assistants (Antigravity, Cursor, Claude 3.5, ChatGPT, GitHub Copilot).

---

## 📊 Dataset Overview

> 🚨 **Total Disclosed Reports Included:** **`9,950` real-world vulnerability reports** in `hackerone_public_reports.json`!

- **Source:** Official HackerOne REST API (Hacktivity)
- **Dataset File:** [`hackerone_public_reports.json`](hackerone_public_reports.json) (13.7 MB)
- **Data Extracted:** Vulnerability titles, CWE classifications, bounties paid, severity ratings, program names, public URLs, and report summaries.

---

## 🚀 Features

- 🔄 **Automated Hacktivity Pagination:** Automatically iterates through pages of disclosed HackerOne reports.
- ⚡ **Rate-Limit & Error Resilience:** Handles HTTP `429 Too Many Requests`, retries automatically with `Retry-After` header parsing.
- 🧹 **Deduplication:** Prevents duplicate reports when appending new data.
- 🧠 **AI Skill Exporter:** Transforms raw JSON reports into an AI Skill directory containing:
  - `SKILL.md`: Main instructions and vulnerability audit guidelines for AI agents.
  - `references/cwe_categories.md`: Reports grouped by CWE vulnerability types (IDOR, XSS, SSRF, RCE, etc.).
  - `references/top_bounties.md`: Breakdown of highest awarded bug bounties.
  - `references/security_checklists.md`: Practical security code audit checklists.
- 🔎 **CLI Search Utility:** Instant offline search through thousands of downloaded bug bounty reports by keyword or CWE.

---

## 📁 Repository Structure

```text
.
├── README.md                          # Main repository documentation
├── hackerone_public.py                # Main HackerOne report downloader script
├── generate_ai_skill.py               # Exporter script (JSON -> AI Skill format)
├── hackerone_public_reports.json      # 9,950 Disclosed reports dataset (JSON)
└── skills/
    └── hackerone-bug-bounty/
        ├── SKILL.md                   # AI Skill Prompt & rules for AI Agents
        ├── references/
        │   ├── cwe_categories.md      # Reports categorized by CWE
        │   ├── top_bounties.md        # Top rewarded vulnerabilities
        │   └── security_checklists.md # Vulnerability audit checklist
        └── scripts/
            └── search_reports.py      # Offline report search CLI tool
```

---

## 🔑 HackerOne API Setup

To download reports using the official HackerOne REST API:

1. Log in to [HackerOne Settings -> API](https://hackerone.com/settings/api).
2. Generate a new **API Token** and note down your **API Identifier** and **API Token**.
3. Set them as environment variables:

### Linux / macOS:
```bash
export H1_API_IDENTIFIER="YOUR_API_IDENTIFIER"
export H1_API_TOKEN="YOUR_API_TOKEN"
```

### Windows (PowerShell):
```powershell
$env:H1_API_IDENTIFIER="YOUR_API_IDENTIFIER"
$env:H1_API_TOKEN="YOUR_API_TOKEN"
```

### Windows (CMD):
```cmd
set H1_API_IDENTIFIER=YOUR_API_IDENTIFIER
set H1_API_TOKEN=YOUR_API_TOKEN
```

---

## 📦 Installation & Setup

1. **Clone this repository:**
   ```bash
   git clone https://github.com/SecurityTalent/bugskill-ai.git
   cd bugskill-ai
   ```

2. **Install Python dependencies:**
   ```bash
   pip install requests
   ```

---

## ⚡ Usage

### 1. Download Public Reports

To download reports using environment variables:
```bash
python hackerone_public.py --export-skill
```

Or pass credentials via command line arguments:
```bash
python hackerone_public.py -i YOUR_IDENTIFIER -t YOUR_TOKEN --max-pages 10 --export-skill
```

#### CLI Options for `hackerone_public.py`:
| Option | Short | Description | Default |
| :--- | :--- | :--- | :--- |
| `--identifier` | `-i` | HackerOne API Identifier | `$H1_API_IDENTIFIER` |
| `--token` | `-t` | HackerOne API Token | `$H1_API_TOKEN` |
| `--max-pages` | `-m` | Max pages to fetch (`0` = unlimited) | `0` |
| `--output` | `-o` | Output JSON file path | `hackerone_public_reports.json` |
| `--export-skill`| `-s` | Automatically build AI Skill post-download | `False` |

---

### 2. Generate AI Skill from Existing JSON

If you already have `hackerone_public_reports.json` (includes **9,950** reports), run:
```bash
python generate_ai_skill.py
```
This generates the full AI Skill inside `skills/hackerone-bug-bounty/` and syncs it to `.agents/skills/hackerone-bug-bounty/`.

---

### 3. Search Downloaded Reports Offline

Search for specific vulnerability types (e.g. IDOR, SSRF, OTP, Rate Limit, XSS):
```bash
python skills/hackerone-bug-bounty/scripts/search_reports.py "XSS"
```

---

## 🤖 Using with AI Agents (Antigravity, Cursor, Claude, ChatGPT)

Once generated, copy or reference the `skills/hackerone-bug-bounty` folder in your project workspace:
- **Antigravity / Agentic IDEs:** Automatically loaded from `.agents/skills/hackerone-bug-bounty/SKILL.md`.
- **Cursor / Claude / ChatGPT:** Attach `SKILL.md` or `references/security_checklists.md` into your system prompt or custom instructions to provide AI with real-world security context.

---

## 🤝 How to Contribute

We welcome community contributions! Whether you want to add new report datasets, fix bugs, or improve AI prompts, follow these steps:

### 1. Fork the Repository
Click the **Fork** button at the top right of this GitHub page to create your own copy of the repository.

### 2. Clone Your Fork Locally
```bash
git clone https://github.com/YOUR_USERNAME/bugskill-ai.git
cd bugskill-ai
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/my-cool-feature
```

### 4. Make Your Edits & Verify
- If you fetched new reports or updated scripts, verify that everything compiles and runs cleanly:
```bash
python generate_ai_skill.py
python skills/hackerone-bug-bounty/scripts/search_reports.py "XSS"
```

### 5. Commit and Push
```bash
git add .
git commit -m "Feat: Add support for custom severity filters"
git push origin feature/my-cool-feature
```

### 6. Submit a Pull Request (PR)
Open a Pull Request on the main repository [`SecurityTalent/bugskill-ai`](https://github.com/SecurityTalent/bugskill-ai).

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

---

## ⚠️ Disclaimer

This tool is designed for educational, research, and defensive security engineering purposes. All downloaded reports are public data disclosed by HackerOne programs under mutual agreement. Always adhere to program policies and ethical disclosure practices.
