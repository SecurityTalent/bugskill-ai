# 🤝 Contributing to BugSkill AI / HackerOne Public Reports

Thank you for your interest in contributing to **BugSkill AI / HackerOne Public Reports Auto-Downloader & AI Skill Exporter**! 

We welcome contributions of all kinds: updating the report dataset, adding new features, improving the AI Skill prompt engineering, fixing bugs, and enhancing documentation.

---

## 📊 Current Dataset Status

- **Dataset File:** `hackerone_public_reports.json`
- **Total Disclosed Reports:** **9,950 real-world public reports**
- **AI Skill Output:** `skills/hackerone-bug-bounty/` and `.agents/skills/hackerone-bug-bounty/`

---

## 🚀 How to Contribute (Step-by-Step)

### 1. Fork the Repository
Click the **Fork** button at the top right of this GitHub page to create your own copy of the repository under your GitHub account.

### 2. Clone Your Fork Locally
```bash
git clone https://github.com/YOUR_USERNAME/bugskill-ai.git
cd bugskill-ai
```

### 3. Create a Feature Branch
Create a descriptive branch for your changes:
```bash
git checkout -b feature/add-new-reports
# or
git checkout -b fix/search-encoding-issue
```

### 4. Make Your Changes

#### Common Contribution Areas:
- 🔄 **Updating Dataset:** Fetch newly disclosed HackerOne reports:
  ```bash
  python hackerone_public.py --export-skill
  ```
- 🧠 **Improving AI Skill:** Enhance prompts or checklists in `generate_ai_skill.py`.
- 🛠️ **CLI Utilities:** Improve `scripts/search_reports.py` or add new analytical tools.

### 5. Verify & Test Your Changes
Before committing, make sure everything works without errors:
```bash
# Test AI Skill generator
python generate_ai_skill.py

# Test search CLI tool
python skills/hackerone-bug-bounty/scripts/search_reports.py "XSS"
```

### 6. Commit & Push Your Changes
```bash
git add .
git commit -m "Feat: Update report dataset with new disclosed items"
git push origin feature/add-new-reports
```

### 7. Open a Pull Request (PR)
1. Go to the original repository [`https://github.com/SecurityTalent/bugskill-ai`](https://github.com/SecurityTalent/bugskill-ai).
2. Click on **Pull Requests** -> **New Pull Request**.
3. Select your branch and provide a clear title and description of your changes.
4. Submit the PR for review!

---

## 💡 Contribution Guidelines

- **Code Style:** Keep Python code clean, readable, and compatible with Python 3.8+.
- **UTF-8 Handling:** Always ensure files and CLI outputs explicitly use `utf-8` encoding.
- **Ethical Use:** Only disclosed public reports from official HackerOne Hacktivity APIs should be added to the dataset.

Thank you for helping build a better security knowledge base for AI coding assistants! 🛡️
