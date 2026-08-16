# Professional PDF Generator for Tabletop Exercises

**High-quality, client-ready PDF documents with excellent design**

---

## Overview

This PDF generator transforms tabletop exercise data into professionally designed PDF documents suitable for client delivery. Features include:

✨ **Professional Design**
- Clean typography with Inter font family
- Color-coded sections by severity
- Visual hierarchy with icons and badges
- Print-optimized layout with proper page breaks

📄 **Complete Document Structure**
- Cover page with metadata and branding
- Table of contents with page numbers
- Executive summary with key points grid
- Attack chain timeline visualization
- Inject cards with syntax-highlighted code
- Technical atomics runbook
- SOP/playbook gap analysis with priority badges
- Evaluation forms and AAR templates

🎨 **Design Features**
- Gradient cover page backgrounds
- Color-coded severity indicators (Critical/High/Medium/Low)
- Professional tables and forms
- Code blocks with syntax highlighting
- Timeline visualizations
- Stat cards and info boxes
- Print-friendly headers and footers

---

## Installation

### Prerequisites

- **Bun** (JavaScript runtime) - Already installed in your PAI system
- **Playwright** (Browser automation for PDF generation)

### Setup

```bash
cd /root/.claude/skills/TabletopExercise/pdf-generator

# Install dependencies
bun install

# Install Playwright Chromium browser
bunx playwright install chromium
```

---

## Usage

### Quick Start - Generate Example PDF

```bash
cd /root/.claude/skills/TabletopExercise/pdf-generator

# Generate PDF using built-in example data
bun run generate-pdf.ts --example --output example-tabletop.pdf

# View the generated PDF
open example-tabletop.pdf  # macOS
xdg-open example-tabletop.pdf  # Linux
```

### Generate PDF from JSON Data

```bash
# Create your exercise data in JSON format
# (See "Data Format" section below)

bun run generate-pdf.ts \
  --data my-exercise-data.json \
  --output client-ready-tabletop.pdf
```

### Using npm Scripts

```bash
# Generate example
bun run example

# Custom generation
bun run generate -- --data exercise.json --output output.pdf
```

---

## Data Format

The PDF generator accepts JSON data in the following structure:

```json
{
  "title": "SSRF to AWS Credential Compromise",
  "subtitle": "Server-Side Request Forgery exploitation...",
  "scenarioType": "Technical - Cloud Security",
  "targetAudience": "SOC Analysts, Incident Response, DevOps",
  "duration": "90-120 minutes",
  "difficulty": "Intermediate",
  "severity": "CRITICAL",
  "preparedBy": "Security Operations Team",
  "date": "February 6, 2026",
  "version": "1.0",

  "executiveSummary": "This tabletop exercise simulates...",
  "attackVector": "SSRF vulnerability in image processing API",
  "potentialImpact": "Customer data breach (500K+ records)",
  "testingGoals": "Validate SSRF response procedures...",
  "criticalGaps": "SSRF incident response playbook...",

  "scenarioOverview": "Your organization operates...",

  "timelineEvents": [
    {
      "time": "T+0",
      "title": "SSRF Vulnerability Discovery",
      "description": "WAF alerts on suspicious requests...",
      "severity": "high",
      "impact": "Optional impact description"
    }
  ],

  "objectives": [
    {
      "number": 1,
      "title": "Test SSRF Detection and Response",
      "description": "Evaluate team's ability to detect...",
      "successCriteria": [
        "SSRF vulnerability identified within 30 minutes",
        "Containment decision made with clear rationale"
      ]
    }
  ],

  "injects": [
    {
      "id": "SSRF-DISCOVER-001",
      "time": "T+0",
      "title": "WAF Alert - Suspicious URL Pattern",
      "severity": "high",
      "scenario": "AWS WAF detects requests with...",
      "artifact": "Code/log snippet to display (optional)",
      "expectedResponse": "Security team recognizes SSRF attempt...",
      "discussionQuestions": [
        "What is 169.254.169.254 and why is it significant?",
        "Should WAF be in block mode?"
      ],
      "conditionalResponses": [
        {
          "trigger": "What logs should we check?",
          "response": "Application logs show 15 similar requests..."
        }
      ]
    }
  ],

  "atomics": [
    {
      "id": "SSRF-DISCOVER-001",
      "time": "T+0",
      "title": "Display WAF Alert",
      "action": "Show AWS WAF console alert for suspicious request",
      "commands": "# Optional commands/scripts to run",
      "commandLanguage": "bash",
      "expectedResponse": "Security team investigates WAF alert",
      "fallback": "If no response after 10 minutes...",
      "verification": [
        "Alert displayed to participants",
        "Runner ready for next inject"
      ]
    }
  ],

  "gapStats": {
    "critical": 2,
    "high": 2,
    "medium": 3,
    "low": 1
  },

  "gaps": [
    {
      "priority": "critical",
      "title": "SSRF Vulnerability Response Playbook",
      "status": "MISSING",
      "trigger": "WAF alert for AWS metadata service access",
      "requiredProcedures": [
        "SSRF identification and validation procedures",
        "Application containment decision tree"
      ],
      "impact": "Delayed containment, continued credential abuse",
      "recommendation": "Develop comprehensive SSRF incident response..."
    }
  ]
}
```

### Field Descriptions

**Cover Page Fields:**
- `title` - Main scenario title
- `subtitle` - Detailed subtitle/description
- `scenarioType` - e.g., "Technical - Cloud Security"
- `targetAudience` - Who should participate
- `duration` - Expected exercise length
- `difficulty` - Beginner/Intermediate/Advanced
- `severity` - CRITICAL/HIGH/MEDIUM/LOW (affects color coding)
- `preparedBy` - Author/team name
- `date` - Preparation date
- `version` - Document version

**Severity Options:**
- `CRITICAL` - Red color scheme
- `HIGH` - Orange color scheme
- `MEDIUM` - Blue color scheme
- `LOW` - Gray color scheme

---

## Customization

### Branding/Logo

To add your company logo to the cover page:

1. Edit `templates/tabletop-exercise.html`
2. Replace the SVG in `.company-logo` with your logo
3. Or use an `<img>` tag:

```html
<div class="company-logo">
    <img src="path/to/logo.png" alt="Company Logo" style="width: 60pt;">
</div>
```

### Color Scheme

To customize colors, edit `styles/print.css`:

```css
:root {
    --primary: #1e40af;        /* Main brand color */
    --primary-dark: #1e3a8a;   /* Darker variant */
    --accent: #0ea5e9;         /* Accent color */
    --danger: #dc2626;         /* Critical severity */
    --warning: #f59e0b;        /* High severity */
    --success: #10b981;        /* Success indicators */
}
```

### Typography

Default fonts:
- **Body text**: Inter (via Google Fonts)
- **Code blocks**: JetBrains Mono

To change fonts, update the `@import` in `templates/tabletop-exercise.html`:

```html
<style>
    @import url('https://fonts.googleapis.com/css2?family=Your+Font');
</style>
```

### Page Margins

Adjust margins in `styles/print.css`:

```css
@page {
    margin: 0.75in 0.75in 1in 0.75in; /* top right bottom left */
}
```

---

## Integration with TabletopExercise Skill

### Automatic PDF Generation

When you generate a tabletop exercise using the PAI skill, it will automatically:

1. Create the exercise content (injects, atomics, gap analysis)
2. Export data as JSON
3. Run the PDF generator
4. Save the professional PDF to your specified location

### Manual Workflow

```bash
# 1. Generate tabletop exercise using PAI skill
# (This creates markdown output)

# 2. Convert to JSON format (helper script)
cd /root/.claude/skills/TabletopExercise/pdf-generator
bun run convert-md-to-json.ts --input ../output/exercise.md --output exercise.json

# 3. Generate PDF
bun run generate-pdf.ts --data exercise.json --output client-ready.pdf
```

---

## Design Features Explained

### Cover Page
- **Gradient background** - Professional blue gradient
- **Metadata grid** - 2x2 grid with key information
- **Severity badge** - Color-coded by scenario severity
- **Confidential notice** - With lock icon

### Table of Contents
- **Hierarchical structure** - Numbered sections and subsections
- **Page numbers** - Right-aligned (requires additional processing)
- **Clickable links** - Navigate within PDF

### Timeline Visualization
- **Vertical timeline** - With color-coded markers
- **Event cards** - Severity-based background colors
- **Impact callouts** - Highlighted impact statements

### Inject Cards
- **Color-coded borders** - By severity level
- **Code artifacts** - Syntax-highlighted code blocks
- **Conditional responses** - Blue info boxes
- **Discussion questions** - Bulleted lists

### Atomic Cards
- **Timed sequences** - Large time display (T+0, T+15, etc.)
- **Code blocks** - With language indicators and copy buttons
- **Verification checklists** - Checkboxes for runners
- **Fallback guidance** - What to do if no response

### Gap Analysis
- **Priority badges** - Critical/High/Medium/Low color coding
- **Stat cards** - Visual summary of gap counts
- **Assignment fields** - Owner and due date inputs
- **Checklists** - Required procedures with checkboxes

---

## Troubleshooting

### Playwright Installation Issues

If Chromium fails to install:

```bash
# Manual installation
bunx playwright install --with-deps chromium

# Or use system Chromium (if available)
export PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium
```

### Font Loading Issues

If fonts don't render:

1. **Use local fonts** instead of Google Fonts
2. Download font files and reference locally:

```css
@font-face {
    font-family: 'Inter';
    src: url('../assets/fonts/Inter-Regular.woff2');
}
```

### PDF Generation Slow

PDF generation typically takes 10-30 seconds. For faster generation:

```typescript
// In generate-pdf.ts, reduce wait time:
await page.setContent(htmlWithCSS, {
    waitUntil: 'domcontentloaded', // Instead of 'networkidle'
});
```

### Large PDFs

If PDF file size is too large:

1. **Optimize images** - Use compressed logos/graphics
2. **Reduce font embedding** - Use system fonts
3. **Compress PDF** - Use `gs` (Ghostscript):

```bash
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=compressed.pdf input.pdf
```

---

## Advanced Usage

### Programmatic PDF Generation

Use the TypeScript module in your own scripts:

```typescript
import { generatePDF, type TabletopExerciseData } from './generate-pdf';

const exerciseData: TabletopExerciseData = {
    title: 'My Custom Exercise',
    // ... rest of data
};

await generatePDF(exerciseData, 'output.pdf');
```

### Batch Generation

Generate multiple PDFs:

```bash
# Create batch script
for file in exercises/*.json; do
    output="pdfs/$(basename "$file" .json).pdf"
    bun run generate-pdf.ts --data "$file" --output "$output"
done
```

### CI/CD Integration

Add PDF generation to your CI pipeline:

```yaml
# .github/workflows/generate-pdfs.yml
name: Generate Tabletop PDFs

on: [push]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx playwright install --with-deps chromium
      - run: bun run generate-pdf.ts --example --output exercise.pdf
      - uses: actions/upload-artifact@v3
        with:
          name: tabletop-pdf
          path: exercise.pdf
```

---

## Quality Checklist

Before delivering PDFs to clients, verify:

- [ ] **Cover page** - Logo, title, metadata all correct
- [ ] **Table of contents** - All sections present
- [ ] **Typography** - No font rendering issues
- [ ] **Code blocks** - Syntax highlighting applied
- [ ] **Colors** - Severity indicators properly color-coded
- [ ] **Page breaks** - No awkward breaks mid-section
- [ ] **Headers/footers** - Present on all pages
- [ ] **Spacing** - Proper white space throughout
- [ ] **Forms** - Input fields and checkboxes visible
- [ ] **File size** - Reasonable size (<10MB typically)

---

## Examples

Example PDFs are generated automatically:

```bash
# Generate SSRF scenario example
bun run example

# Output: example-tabletop.pdf with full SSRF scenario
```

**What's included in the example:**
- Cover page with CRITICAL severity
- Executive summary with key points
- Attack chain timeline (6 events)
- 3 exercise objectives
- 2 inject cards with discussion questions
- 2 technical atomics
- Gap analysis (2 critical, 2 high priority gaps)
- Evaluation forms

---

## Support

For issues or questions:
- Check `/root/.claude/skills/TabletopExercise/README.md` for main skill documentation
- Review `templates/tabletop-exercise.html` for HTML structure
- Review `styles/print.css` for design customization
- Test with `--example` flag to ensure environment is working

---

**Version:** 1.0
**Created:** 2026-02-06
**Maintained by:** Skylar (xssdoctor)
**Part of:** TabletopExercise PAI Skill
