# Rainbow Six: Siege - Distributed DDoS Attack Tabletop Exercise

**Created:** February 6, 2026
**Version:** 1.0
**Severity:** HIGH
**Duration:** 90-120 minutes

---

## Scenario Overview

Multi-vector DDoS attack targeting Rainbow Six: Siege game infrastructure during peak gaming hours (Friday 8 PM EST). Attack combines volumetric network floods (500+ Gbps UDP amplification) with application-layer HTTP floods targeting matchmaking and authentication services. Includes ransom extortion element with data leak threats.

**Player Impact:** 200,000+ concurrent players affected, complete service outage, #RainbowSixDown trending globally

---

## Target Audience

- **SOC Analysts** - DDoS detection, attack analysis, threat intelligence
- **DevOps Engineers** - Application scaling, service recovery, deployment
- **Infrastructure Team** - Network mitigation, CDN management, ISP coordination
- **Game Operations** - Player impact assessment, service prioritization
- **Network Security** - Firewall rules, WAF configuration, rate limiting
- **Community Management** - Player communication, social media monitoring

---

## Learning Objectives

1. **DDoS Detection & Response** - Test multi-vector attack detection (volumetric + Layer 7), coordinate cross-team mitigation, validate incident command structure
2. **Ransom Decision Framework** - Evaluate ransom payment policy, executive communication, law enforcement coordination
3. **Player Communication** - Assess customer communication during outages, service recovery procedures, reputation management

---

## Key Features

✅ **Comprehensive Facilitator Guidance** - Detailed facilitator notes in EVERY section:
- Facilitator guide with preparation checklist, opening/closing scripts, ground rules
- Timeline events with discussion prompts and teaching points
- Objectives with focus areas and common mistakes
- Injects with setup/delivery guidance, red flags, and success indicators
- Atomics with preparation and execution tips
- Gap analysis with evaluation guidance and probe questions

✅ **Realistic Gaming Scenario** - Based on actual DDoS attacks against gaming companies (Blizzard, Riot Games, Epic)

✅ **Multi-Vector Attack** - Tests both network-layer (volumetric) and application-layer (HTTP flood) mitigation

✅ **Ransom Extortion Element** - Includes ethical decision-making, legal coordination, law enforcement notification

✅ **Player Experience Focus** - Gaming-specific considerations (social media monitoring, community management, player compensation)

---

## Exercise Timeline

| Time | Event | Severity |
|------|-------|----------|
| T+0 | Network traffic spike (500+ Gbps), player login failures | HIGH |
| T+15 | UDP amplification attack identified, ISP mitigation partial | HIGH |
| T+30 | Layer 7 HTTP flood detected targeting matchmaking API | CRITICAL |
| T+60 | Ransom demand received (5 BTC), old breach data leaked as proof | CRITICAL |
| T+90 | CDN provider threatens account suspension, failover required | HIGH |
| T+120 | Attack subsides spontaneously, post-incident analysis begins | MEDIUM |

---

## Gap Analysis Coverage

**8 Critical/High Priority Gaps Identified:**
- ❌ DDoS Response Playbook for Gaming Infrastructure (CRITICAL)
- ❌ Ransom DDoS Payment Decision Framework (CRITICAL)
- ⚠️ CDN Failover and Disaster Recovery Procedures (HIGH)
- ⚠️ Player Communication During Service Outages (HIGH)
- ⚠️ Application-Layer DDoS Detection and Mitigation (HIGH)
- ❌ Law Enforcement Coordination for Cyber Extortion (MEDIUM)
- ⚠️ Post-DDoS Forensics and Hardening Procedures (MEDIUM)
- ❌ DDoS Attack Cost Tracking and Insurance Claims (LOW)

---

## Files in This Exercise

- **exercise-data.json** - Structured JSON data for PDF generation and programmatic access
- **Rainbow-Six-DDoS-Attack-Tabletop.html** - Interactive HTML version (213 KB) with facilitator notes
- **README.md** - This file

---

## How to Use This Exercise

### For Facilitators

1. **2-3 weeks before**: Review facilitator guide, book conference room, send calendar invites
2. **1 week before**: Prepare digital inject materials (fake monitoring dashboards, Twitter screenshots)
3. **Day before**: Test projector, print evaluation forms, review facilitator notes
4. **Day of**: Arrive 30 minutes early, set up room, test equipment
5. **During exercise**: Follow facilitator guide, deliver injects at appropriate times, facilitate discussion
6. **After exercise**: Hot wash debrief, gap analysis, assign action items with owners and deadlines

### For Participants

1. **Read scenario overview** (5 minutes) to understand context
2. **Stay in character** - respond as you would in real incident
3. **Ask questions** - facilitator has additional information and conditional responses
4. **Discuss openly** - this is learning environment, not performance evaluation
5. **Document gaps** - note where playbooks are missing or inadequate
6. **Commit to action items** - this exercise is only valuable if we implement findings

### For Observers/Evaluators

1. **Note coordination** - how well do teams communicate across silos?
2. **Identify gaps** - what playbooks/procedures are missing or inadequate?
3. **Time responses** - how long does each decision take?
4. **Record quotes** - capture specific statements for debrief examples
5. **Assess leadership** - who emerges as incident commander, how effective?

---

## Regenerating PDF (If Needed)

```bash
cd /root/.claude/skills/TabletopExercise/pdf-generator

bun run generate-pdf.ts \
  --data ../exercises/rainbow-six-ddos-attack/exercise-data.json \
  --output ../exercises/rainbow-six-ddos-attack/Rainbow-Six-DDoS-Attack-Tabletop.pdf
```

---

## Customization

To adapt this exercise for your organization:

1. **Edit exercise-data.json** - update company name, architecture details, team names
2. **Adjust timing** - compress or expand timeline based on available exercise time
3. **Modify gaps** - add/remove gap analysis items based on your existing procedures
4. **Customize injects** - add organization-specific details (actual monitoring tools, vendor names)
5. **Regenerate HTML/PDF** - run generator scripts to create updated deliverables

---

## Related Scenarios

Consider running these complementary exercises:

- **Ransomware Attack** - tests backup restoration, ransom payment decisions
- **Data Breach** - tests incident disclosure, customer notification, regulatory compliance
- **Supply Chain Compromise** - tests vendor coordination, customer impact assessment
- **Insider Threat** - tests investigation procedures, legal coordination, HR involvement

---

## Success Metrics

After implementing findings from this exercise, you should see:

- ✅ Documented DDoS response playbook tested and validated
- ✅ Incident command structure clearly defined with assigned roles
- ✅ DDoS mitigation activation time reduced (target: <15 minutes)
- ✅ Player communication templates prepared and approved
- ✅ CDN failover tested and validated (target: <15 minute cutover)
- ✅ Law enforcement relationships established (FBI Cyber Division contact)
- ✅ Ransom payment policy documented and approved by leadership

---

**Questions or feedback?** Contact the Security Operations Team

**Next scheduled exercise:** TBD (recommended: 6 months after implementing findings)
