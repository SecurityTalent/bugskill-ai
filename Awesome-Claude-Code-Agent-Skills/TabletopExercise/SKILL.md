---
name: TabletopExercise
description: Comprehensive cybersecurity tabletop exercise design and facilitation framework. USE WHEN designing incident response scenarios, creating executive or technical tabletops, generating atomics for exercise runners, identifying missing SOPs/playbooks, or evaluating organizational preparedness. Includes threat model integration, CISA-aligned methodologies, and automated gap analysis.
---

# TabletopExercise Skill

## Purpose

Design, facilitate, and evaluate cybersecurity tabletop exercises (TTX) for technical and executive audiences. Generate realistic scenarios, technical atomics for runners, and identify organizational gaps in incident response capabilities.

## When to Use

- Designing tabletop exercise scenarios for SOC teams or executives
- Creating technical "atomics" (executable injects) for scenario runners
- Generating checklists to identify missing SOPs, playbooks, or procedures
- Evaluating incident response plan effectiveness
- Building cross-functional coordination exercises
- Post-exercise gap analysis and improvement planning

## Key Capabilities

### 1. Scenario Generation
- **Executive Scenarios**: Business impact focus, decision-making, communication strategies
- **Technical Scenarios**: Detailed detection/response, forensics, technical challenges
- **Hybrid Scenarios**: Cross-functional coordination exercises
- **AI-Enhanced**: Deepfake attacks, automated threat chains, supply chain compromise

### 2. Technical Atomics for Runners
Exercise facilitators receive **executable atomics** - specific technical actions to simulate during scenarios:

**Example Atomic Set (Ransomware Scenario):**
```
T+0min: Send initial phishing email to participant's test inbox
T+15min: Simulate EDR alert: "Suspicious PowerShell execution on DESKTOP-01"
T+30min: Inject: Backup system shows "Replication failed - destination unreachable"
T+45min: Deliver ransom note via simulated file share
T+60min: Simulate CEO email inquiry: "Why can't I access the sales database?"
```

### 3. SOP/Playbook Gap Analysis
Automatically generates checklists identifying missing procedures:

**Example Output:**
```
MISSING PLAYBOOKS IDENTIFIED:
□ Ransomware Response Playbook
  - Detected mentions of: encryption, ransom, backup restoration
  - No documented procedure found for: crypto-ransomware containment

□ Executive Communication Protocol
  - Scenario requires CEO notification
  - Missing: Executive notification checklist, approval thresholds

□ Vendor Breach Response
  - Third-party compromise scenario element present
  - Missing: Vendor incident coordination runbook
```

### 4. Threat Model Integration
Scenarios built from real-world threat models:
- OAuth 2.0 attacks (RFC 6819)
- Kubernetes cluster compromise
- Supply chain attacks (npm, CDN)
- Cloud storage misconfiguration (AWS S3, GCS)
- IoT device exploitation
- AI/ML workload threats

### 5. CISA-Aligned Framework
Follows CISA Cybersecurity Tabletop Exercise Package (CTEP) methodology:
- 100+ pre-built scenario templates
- Facilitator guides and inject cards
- After-Action Report templates
- Objective-based performance analysis

## Core Framework: Plan → Engage → Learn

### Planning Phase
1. **Define Objectives**: 1-3 measurable goals (e.g., "Validate ransomware playbook")
2. **Select Scenario**: Match to organizational risk profile and threat landscape
3. **Identify Participants**: Cross-functional teams with actual decision authority
4. **Prepare Materials**: Scenario brief, injects, facilitator script, evaluation forms

### Engaging Phase
1. **Set Ground Rules**: Psychological safety, low-pressure learning environment
2. **Present Scenario**: Realistic T0 (initial conditions)
3. **Progressive Injects**: Timed complications (ransom notes, backup failures, media inquiries)
4. **Facilitate Discussion**: Open-ended questions, cross-functional coordination
5. **Document Observations**: Real-time data collection by evaluators

### Learning Phase
1. **Hot Wash**: 20-30 min immediate debrief
2. **After-Action Report**: Strengths, gaps, recommendations
3. **Action Items**: Assigned owners, deadlines, tracking
4. **Implementation**: Update IR plans, develop missing SOPs, schedule training
5. **Follow-Up Exercise**: Test improvements in 6-12 months

## Scenario Types (Based on Threat Models)

### 1. Ransomware Attack
- **Initial Vector**: Phishing, RDP compromise, vulnerable service
- **Progression**: Lateral movement, backup encryption, ransom demand
- **Key Decisions**: Containment strategy, backup restoration, ransom payment consideration, law enforcement notification
- **Atomics**: EDR alerts, file encryption simulation, backup system failures, ransom note delivery

### 2. Business Email Compromise (BEC)
- **Initial Vector**: Executive account takeover (OAuth token theft, password spray)
- **Progression**: Fraudulent wire transfer request, financial approval bypass
- **Key Decisions**: Transaction verification, account suspension, fraud investigation
- **Atomics**: Spoofed email delivery, banking system access attempts, approval workflow bypass

### 3. Supply Chain Breach
- **Initial Vector**: Compromised vendor, malicious npm package, CDN compromise
- **Progression**: Backdoored dependencies, data exfiltration, customer impact
- **Key Decisions**: Vendor communication, customer notification, incident disclosure
- **Atomics**: Dependency scan alerts, network traffic to unknown IPs, customer data access logs

### 4. Kubernetes Cluster Compromise
- **Initial Vector**: Exposed API server, vulnerable container image, RBAC misconfiguration
- **Progression**: Container escape, privilege escalation, cryptomining deployment
- **Key Decisions**: Pod isolation, cluster rebuilding, service continuity
- **Atomics**: kubectl alerts, resource utilization spikes, container logs

### 5. Cloud Storage Misconfiguration
- **Initial Vector**: Public S3 bucket, misconfigured GCS permissions, leaked credentials
- **Progression**: Data discovery by attacker, exfiltration, public disclosure
- **Key Decisions**: Access revocation, data breach notification, regulatory reporting
- **Atomics**: CloudTrail anomalies, data access logs, security researcher notification

### 6. Deepfake Social Engineering (AI-Enhanced)
- **Initial Vector**: Deepfake CEO voice call, AI-generated phishing content
- **Progression**: Fraudulent authorization, sensitive data disclosure, financial fraud
- **Key Decisions**: Out-of-band verification protocols, AI detection strategies
- **Atomics**: Voice call simulation, urgent request for credentials/payments

### 7. Insider Threat
- **Initial Vector**: Disgruntled employee, compromised insider account, privilege abuse
- **Progression**: Data exfiltration, system sabotage, unauthorized access
- **Key Decisions**: Investigation protocols, legal coordination, termination procedures
- **Atomics**: DLP alerts, unusual data transfers, off-hours access logs

### 8. DDoS Attack
- **Initial Vector**: Botnet attack, amplification attack, application-layer DDoS
- **Progression**: Service degradation, customer impact, mitigation coordination
- **Key Decisions**: CDN activation, rate limiting, customer communication
- **Atomics**: Traffic spike simulation, service health dashboards, customer complaints

## Technical vs Executive Audience

### Executive Tabletop (Non-Technical)
**Duration**: 60-90 minutes
**Participants**: C-suite, Board, Executive Directors, Business Unit heads
**Focus**:
- Business impact and continuity decisions
- External communication and PR strategy
- Regulatory compliance and legal considerations
- Financial impact and insurance coordination
- Stakeholder management

**Language**: Non-technical, succinct, business-focused
**Outcomes**: Improved alignment between leadership and technical teams, clarified executive roles during crises

### Technical Tabletop (Operational)
**Duration**: 90-120 minutes
**Participants**: SOC analysts, incident responders, IT Ops, Security Engineers
**Focus**:
- Detection and containment procedures
- Forensic analysis and evidence collection
- Technical tool usage (SIEM, EDR, forensics platforms)
- System recovery and backup restoration
- Threat intelligence and IOC extraction

**Language**: Deep technical content, command-line operations, log analysis
**Outcomes**: Validated technical playbooks, identified tool gaps, improved technical coordination

## Atomics Generation Framework

When generating atomics for exercise runners, provide:

### 1. Pre-Exercise Setup Atomics
```bash
# Example: Ransomware scenario setup
# T-60min: Prepare test environment
- Create isolated test VM (VICTIM-01)
- Deploy test file share with sample data
- Configure email server for phishing simulation
- Prepare EDR console access for runner
- Stage ransom note template in runner directory
```

### 2. Timed Inject Atomics
```markdown
## T+0 (Initial Compromise)
**Atomic ID**: PHISH-001
**Action**: Send phishing email to participant John Doe
**Email Template**: /exercises/ransomware-2024/templates/phish.eml
**Expected Response**: Participant reports email to security team within 15 minutes
**If No Response**: Proceed to T+15 inject regardless

## T+15 (EDR Alert)
**Atomic ID**: EDR-ALERT-001
**Action**: Display EDR alert on SOC dashboard
**Alert Details**:
  - Host: DESKTOP-01
  - User: jdoe
  - Process: powershell.exe -enc <base64>
  - Severity: HIGH
**Expected Response**: SOC analyst triages alert, escalates to IR team
**Facilitator Note**: If asked about base64 content, provide: "Downloads and executes secondary payload"

## T+30 (Backup Failure)
**Atomic ID**: BACKUP-FAIL-001
**Action**: Update backup system dashboard
**Status Change**: Replication status → "Failed - destination unreachable"
**Error Message**: "Cannot connect to backup-server-02.internal"
**Expected Response**: IT team investigates backup system, discovers encrypted files on backup target
```

### 3. Variable Response Atomics
```markdown
## Conditional Inject: If Participants Ask to Check Logs
**Atomic ID**: LOG-RESPONSE-001
**Trigger**: Participant requests "Check firewall logs for outbound connections"
**Response**: Provide log excerpt showing:
  - Multiple connections to 203.0.113.42:8443 (C2 server)
  - Data exfiltration: 2.3 GB transferred over 4 hours
  - TLS encrypted traffic, no payload inspection available
**Facilitator Script**: "Your firewall logs show persistent connections to this IP over the last 4 hours. WHOIS shows it's registered in [Country]. What's your next step?"
```

### 4. Escalation Atomics
```markdown
## T+60 (Executive Pressure)
**Atomic ID**: EXEC-EMAIL-001
**Action**: Simulate email from CEO to CTO (delivered via runner to participant)
**Subject**: "RE: Sales Database Access Issue - URGENT"
**Body**:
"I'm getting reports from the sales team that they can't access Salesforce. This is costing us deals. What's the status? Do we need to involve the board?"
**Expected Response**: CTO briefs CEO on incident status, provides estimated recovery timeline
**Facilitator Note**: If participants haven't identified ransomware yet, this pressure should accelerate investigation
```

## SOP/Playbook Gap Analysis Checklist Generator

The skill automatically generates gap analysis checklists by:

1. **Scenario Decomposition**: Identifies all decision points and required actions
2. **Playbook Mapping**: Checks for documented procedures covering each action
3. **Gap Identification**: Flags missing or inadequate procedures
4. **Priority Scoring**: Ranks gaps by criticality and likelihood

### Example Gap Analysis Output

```markdown
# SOP/Playbook Gap Analysis
**Scenario**: Ransomware Attack with Backup Failure
**Date**: 2026-02-06
**Participants**: SOC Team, IT Operations, Executive Leadership

---

## CRITICAL GAPS (Immediate Action Required)

### 1. Ransomware Containment Playbook - MISSING
**Scenario Trigger**: Multiple hosts showing file encryption behavior
**Required Decisions**:
  - [ ] Network segmentation procedures
  - [ ] Host isolation criteria and process
  - [ ] Active Directory credential reset procedures
  - [ ] Encrypted file preservation for forensics

**Impact if Missing**: Delayed containment, lateral spread to additional systems
**Recommendation**: Develop comprehensive ransomware response playbook covering:
  - Detection indicators (behavioral, file system, network)
  - Containment decision tree (isolate vs observe)
  - Credential rotation procedures
  - Backup verification and restoration process
  - Ransom payment decision framework (if organization policy allows consideration)

**Owner**: ___________ **Due Date**: ___________

---

### 2. Executive Communication During Active Incident - INADEQUATE
**Scenario Trigger**: CEO requests status update during ongoing incident
**Current Documentation**: Generic "incident notification template"
**Missing Elements**:
  - [ ] Executive briefing format and content requirements
  - [ ] Update frequency expectations during active incidents
  - [ ] Escalation thresholds requiring executive notification
  - [ ] Technical-to-business impact translation guide
  - [ ] Executive decision authority matrix (who approves what)

**Impact if Missing**: Inconsistent executive communication, business decision delays
**Recommendation**: Create executive incident communication playbook with:
  - Situation Report (SITREP) template
  - Update cadence by severity (Critical: hourly, High: every 4 hours)
  - Decision points requiring executive approval
  - Business impact assessment framework

**Owner**: ___________ **Due Date**: ___________

---

## HIGH-PRIORITY GAPS

### 3. Backup System Failure Response - PARTIAL
**Scenario Trigger**: Backup replication shows failed status
**Current Documentation**: IT runbook covers "routine backup monitoring"
**Missing Elements**:
  - [ ] Backup system compromise response procedures
  - [ ] Alternate backup verification methods (offline, immutable copies)
  - [ ] Backup restoration priority matrix (which systems first)
  - [ ] Backup integrity testing procedures

**Impact if Missing**: Extended recovery time, potential data loss
**Recommendation**: Enhance backup procedures with incident-specific guidance
**Owner**: ___________ **Due Date**: ___________

---

### 4. Third-Party Vendor Notification - MISSING
**Scenario Trigger**: Incident may impact vendor systems or data
**Required Decisions**:
  - [ ] When to notify vendors (timing, thresholds)
  - [ ] Who has authority to communicate with vendors
  - [ ] What information to share (technical details, IOCs)
  - [ ] Vendor incident coordination protocols

**Impact if Missing**: Contractual violations, delayed coordinated response
**Recommendation**: Develop vendor incident coordination framework
**Owner**: ___________ **Due Date**: ___________

---

## MEDIUM-PRIORITY GAPS

### 5. Forensic Evidence Collection - PARTIAL
**Scenario Trigger**: Need to preserve evidence for investigation/legal action
**Current Documentation**: "Incident handling basics" mentions "save logs"
**Missing Elements**:
  - [ ] Chain of custody procedures
  - [ ] Forensic image acquisition tools and methods
  - [ ] Evidence storage and retention policies
  - [ ] Legal hold procedures

**Impact if Missing**: Compromised evidence, inability to pursue legal action
**Recommendation**: Develop forensic evidence handling SOP
**Owner**: ___________ **Due Date**: ___________

---

## LOW-PRIORITY GAPS

### 6. Post-Incident Customer Communication - MISSING
**Scenario Trigger**: Ransomware impacts customer-facing services
**Missing Elements**:
  - [ ] Customer notification templates
  - [ ] Communication approval workflow
  - [ ] Regulatory notification requirements (GDPR, state breach laws)
  - [ ] Customer support escalation procedures

**Impact if Missing**: Regulatory non-compliance, customer trust damage
**Recommendation**: Create customer breach notification playbook
**Owner**: ___________ **Due Date**: ___________

---

## PROCESS GAPS

### Communication Channels
**Observed During Exercise**:
- Confusion about which Slack channel for incident coordination
- Some participants didn't have access to #incident-response
- Email used for time-sensitive updates (slow, unreliable)

**Recommendation**:
  - [ ] Establish dedicated incident communication platform
  - [ ] Pre-provision access for all IR team members
  - [ ] Document escalation procedures (when to page, when to email)
  - [ ] Test communication channels quarterly

---

## TOOL GAPS

### Detection and Response Tools
**Observed During Exercise**:
- EDR alerts not integrated with ticketing system (manual checking required)
- No automated host isolation capability (manual network changes)
- Backup monitoring dashboard not accessible to IR team

**Recommendation**:
  - [ ] Implement SOAR platform for automated response actions
  - [ ] Integrate EDR with ticketing/SIEM
  - [ ] Provide IR team access to backup monitoring
  - [ ] Evaluate automated network isolation tools

---

## TRAINING GAPS

### Identified Knowledge Deficiencies
- SOC analysts unfamiliar with ransomware behavioral indicators
- IT Ops unsure of backup restoration procedures under pressure
- Executives unclear on their roles during cyber incidents

**Recommendation**:
  - [ ] Ransomware detection training for SOC (quarterly)
  - [ ] Backup restoration drill for IT Ops (monthly)
  - [ ] Executive cyber crisis simulation (annually)

---

## SUMMARY METRICS

- **Total Gaps Identified**: 6 SOPs, 3 Process Issues, 3 Tool Gaps, 3 Training Needs
- **Critical Gaps**: 2
- **High-Priority Gaps**: 2
- **Estimated Remediation Effort**: 120 person-hours
- **Recommended Timeline**: 90 days for critical/high, 180 days for medium/low

---

## NEXT STEPS

1. **Immediate (Week 1)**:
   - Assign owners to all critical and high-priority gaps
   - Schedule working sessions to develop missing playbooks
   - Provision access to communication channels and tools

2. **Short-Term (Month 1-3)**:
   - Complete and test critical/high-priority SOPs
   - Implement recommended tool integrations
   - Conduct targeted training for identified knowledge gaps

3. **Follow-Up Exercise (Month 6)**:
   - Re-run similar ransomware scenario
   - Validate implemented improvements
   - Measure response time and coordination improvements

4. **Continuous Improvement**:
   - Quarterly review of all IR playbooks
   - Monthly mini-exercises (10-30 min rapid scenarios)
   - Annual comprehensive tabletop with executive participation
```

## Best Practices (From Research)

### Critical Success Factors
1. **Clear Objectives**: Define 1-3 measurable goals before designing scenario
2. **Realistic Scenarios**: Match organizational risk profile, avoid "doomsday" plots
3. **Cross-Functional Participation**: Include all departments involved in real incidents
4. **Skilled Facilitation**: Draw solutions from participants, don't provide answers
5. **Psychological Safety**: Frame as learning, not performance evaluation
6. **Implement Findings**: Assign owners, deadlines, track completion (most critical!)

### Common Pitfalls to Avoid
❌ Not implementing lessons learned (exercise becomes useless)
❌ Unrealistic "movie-style hacking" scenarios
❌ Same participants every time (limit learning)
❌ Inadequate debriefing time (real learning happens here)
❌ Treating as performance evaluation (creates defensive behavior)
❌ Outdated contact lists (critical failure during real incidents)

### Optimal Timing
- **Duration**: 60-90 minutes for quality discussion
- **Frequency**: Quarterly or monthly depending on risk profile
- **Follow-Up**: 6-12 months to test implemented improvements

## Integration with PAI Security Tools

### Caido MCP Integration
For scenarios involving web application compromise:
```bash
# Use Caido to demonstrate attack patterns during technical tabletops
/caido req.ext.eq:"php" AND req.query.matches:"eval|cmd"
# Show participants actual malicious requests from proxy history
```

### Browser MCP Integration
For client-side attack scenarios (XSS, CSRF):
- Demonstrate exploit chains live during tabletop
- Capture screenshots/GIFs for scenario inject materials

### JS Analyzer Integration
For supply chain compromise scenarios:
```bash
# Analyze compromised npm package during tabletop
bun run /root/doctorswzl/src/index.ts malicious-package.js
# Show participants dangerous sinks and data exfiltration code
```

## Output Standards

All tabletop exercise deliverables include:

1. **Executive Scenario Brief** (1-2 pages)
   - Scenario overview, objectives, participant roles
   - Timeline and inject schedule
   - Expected outcomes

2. **Facilitator Guide** (5-10 pages)
   - Detailed scenario narrative
   - Timed inject cards with facilitator notes
   - Open-ended discussion questions
   - Expected responses and talking points

3. **Technical Atomics Runbook** (for runners)
   - Pre-exercise setup instructions
   - Timed atomic delivery schedule
   - Conditional response atomics
   - Troubleshooting guide

4. **Evaluation Forms**
   - Observer note sheets
   - Performance metrics tracking
   - Participant feedback forms

5. **After-Action Report Template**
   - Objectives assessment
   - What went well
   - Areas for improvement
   - Action items with owners and deadlines

6. **SOP/Playbook Gap Analysis**
   - Missing procedures identified
   - Priority rankings (Critical/High/Medium/Low)
   - Remediation recommendations
   - Implementation timeline

## Usage Examples

### Example 1: Generate Executive Ransomware Scenario
```
User: "Design an executive tabletop for ransomware with focus on business continuity decisions"

Skill Output:
- Executive-appropriate scenario brief
- Business impact focus (not technical details)
- Decision points: insurance, ransom payment, customer notification, board communication
- Inject cards: journalist inquiry, cyber insurance adjuster call, customer complaints
- No technical atomics (not relevant for executives)
- Gap analysis: executive communication procedures, crisis management plan
```

### Example 2: Generate Technical Kubernetes Compromise Scenario with Atomics
```
User: "Create technical tabletop for Kubernetes cluster compromise with atomics for the runner"

Skill Output:
- Technical scenario brief with attack chain details
- Atomics runbook:
  * T+0: Display kubectl alert for unauthorized pod creation
  * T+15: Show container escape attempt in logs
  * T+30: Simulate cryptominer deployment (CPU spike)
  * T+45: Provide network logs showing C2 communication
- Facilitator guide with technical discussion questions
- Gap analysis: K8s incident response playbook, RBAC audit procedures, pod security policies
```

### Example 3: Gap Analysis Only
```
User: "We just completed a BEC tabletop. Generate gap analysis for missing SOPs."

Skill Output:
- Comprehensive checklist of missing procedures
- Priority rankings based on scenario decisions
- Specific recommendations for each gap
- Owner assignment template
- Follow-up exercise recommendations
```

## Resources

- **CISA CTEPs**: 100+ free scenario templates at cisa.gov/cybersecurity-tabletops
- **NIST SP 800-84**: Guide to Test, Training, and Exercise Programs
- **After-Action Report Templates**: CISA and NIST formats included
- **Threat Models**: OAuth, Kubernetes, cloud, IoT, AI/ML scenarios

---

## File Organization and Output Structure

**IMPORTANT**: Each generated tabletop exercise is automatically organized into its own dedicated folder:

```
/root/.claude/skills/TabletopExercise/exercises/[exercise-slug]/
  ├── tabletop.md              # Full exercise documentation (Markdown)
  ├── exercise-data.json       # Structured JSON for PDF generation
  ├── [Exercise-Title].pdf     # Professional client-ready PDF
  └── README.md                # Exercise metadata and quick reference
```

### Automatic Folder Creation Process:

1. **Generate Slug**: Convert exercise title to filesystem-safe slug
   - Example: "SSRF to AWS Credential Compromise" → "ssrf-aws-credential-compromise"

2. **Create Exercise Folder**: `/root/.claude/skills/TabletopExercise/exercises/[slug]/`

3. **Save All Formats**:
   - **Markdown** (`tabletop.md`): Complete exercise with all sections
   - **JSON** (`exercise-data.json`): Structured data for PDF regeneration
   - **PDF**: Professional, client-ready document with design
   - **README.md**: Quick reference with metadata and file descriptions

4. **Confirm to User**: Provide full path to exercise folder and PDF

### File Purposes:

- **tabletop.md**: Complete exercise documentation, facilitator guide, inject cards
- **exercise-data.json**: Structured data matching PDF generator interface (preserves all content for future updates)
- **PDF**: Final deliverable for client presentation or executive review
- **README.md**: Exercise overview, scenario type, target audience, generation date

### Regenerating PDFs:

If you need to update the PDF design or fix content:
```bash
cd /root/.claude/skills/TabletopExercise/pdf-generator
bun run generate-pdf.ts \
  --data ../exercises/[slug]/exercise-data.json \
  --output ../exercises/[slug]/Updated-Exercise.pdf
```

---

**Version**: 2.0 (Enhanced from original SOC Manager Table Top Designer)
**Enhancements**:
- Added technical atomics generation for exercise runners
- Integrated SOP/playbook gap analysis framework
- Incorporated CISA CTEP methodology
- Added threat model-based scenario library
- Enhanced with 2025-2026 AI threat considerations
- Integrated PAI security tool workflows

**Maintained by**: Skylar (xssdoctor)
**Original**: Arcanum-Sec redbluepurpleAI project
