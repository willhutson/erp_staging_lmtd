# Skill Development Sandbox & Knowledge Onboarding

**Purpose:** Enable skill creation from Day 1, seeded by real business expertise
**Parallel Track:** Runs alongside all infrastructure phases, not after them

---

## Philosophy

> "The infrastructure exists to serve the skills. The skills exist to encode 15+ years of agency expertise."

Skills are NOT:
- ❌ Something we build "later"
- ❌ Generic AI capabilities
- ❌ Tech-first solutions looking for problems

Skills ARE:
- ✅ Codified expertise from running world-class agencies
- ✅ Decision patterns you've developed over 15 years
- ✅ The "how we do things here" that makes great agencies great
- ✅ Lessons from scaling Disney's social presence

---

## The Sandbox: Phase 1 Infrastructure

### What Gets Built in Phase 1

```
/src/modules/content-engine/
├── /sandbox/                        # SKILL DEVELOPMENT SANDBOX
│   ├── SkillPlayground.tsx         # Interactive skill testing UI
│   ├── SkillTemplateWizard.tsx     # Guided skill creation
│   ├── KnowledgeCapture.tsx        # Interview-style knowledge extraction
│   └── ValidationChecklist.tsx     # Check-in questions for each skill
│
├── /seeds/                          # INITIAL SKILL SEEDS
│   ├── README.md                   # How to add skills
│   ├── /from-user-stories/         # Skills derived from existing user stories
│   ├── /from-workflows/            # Skills derived from existing workflows
│   └── /from-expertise/            # Skills captured from founder interviews
```

### Sandbox Capabilities (Available Day 1)

| Capability | Purpose |
|------------|---------|
| **Skill Template Wizard** | Guided creation of skill documents |
| **Knowledge Capture Mode** | Interview-style prompts to extract expertise |
| **Dry Run Testing** | Test skill logic without database writes |
| **Validation Checkpoints** | Verify skill matches real business needs |
| **Skill Graph Viewer** | See skill dependencies and relationships |

---

## Knowledge Capture Process

### The Interview Framework

Instead of "write a skill spec," we use **structured interviews** that draw out your expertise:

```
┌─────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE CAPTURE SESSION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SCENARIO PROMPT                                                │
│  "A client calls at 4pm Friday saying they need a video         │
│   for a Monday morning launch. Walk me through what happens."   │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  YOUR RESPONSE → Captured as:                                   │
│    • Decision points (skill triggers)                           │
│    • Questions you'd ask (required inputs)                      │
│    • What you'd check (context needs)                           │
│    • Likely outcomes (skill outputs)                            │
│    • Edge cases you've seen (error handling)                    │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  VALIDATION QUESTIONS                                           │
│  "What's the biggest mistake a junior PM would make here?"      │
│  "What did Disney teach you about this that most agencies       │
│   never learn?"                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Skill Seeding: User Stories → Skills

### Existing User Stories as Skill Seeds

From your `docs/07_User_Stories.md` and business context, we extract skills:

| User Story | Implied Skill | Your Validation Needed |
|------------|---------------|------------------------|
| "As a PM, I want to create briefs quickly" | `brief-creator` | What makes a brief "good enough" to submit? What do juniors always forget? |
| "As a team lead, I want to see capacity" | `resource-scanner` | How do you ACTUALLY assess if someone can take on more work? |
| "As leadership, I want RFP win tracking" | `rfp-analyzer` | What patterns predict wins? What's the real reason you lose? |
| "As a client, I want to request work" | `intake-processor` | What client requests should trigger alarm bells? |

### The Extraction Template

For each user story, we capture:

```markdown
## Skill Seed: [Name]

### Origin
- User Story: [Reference]
- Business Context: [Why this matters]

### The Real Question
[Not the technical "what" but the business "why"]

Example: For brief creation, the real question isn't "how do we make a form"
but "how do we ensure every brief has enough information that the creative
team doesn't waste 2 hours asking clarifying questions?"

### Founder Check-In
- [ ] Does this match how you actually think about this?
- [ ] What would you add that a junior PM wouldn't know?
- [ ] What did you learn at Disney that applies here?
- [ ] What's the "if this then DEFINITELY that" rule?
- [ ] What's the mistake you've seen 100 times?

### Decision Tree (Your Logic)
[Captured from interview, validated by you]

### Edge Cases (Your Experience)
[The "yeah but what if..." scenarios you've seen]
```

---

## Validation Checkpoints

### Embedded Check-In Questions

Every skill document includes validation questions. These aren't optional - they're how we ensure the skill actually encodes YOUR expertise, not generic assumptions.

```markdown
---
id: skill_resource_optimizer
type: skill
status: draft
---

# Resource Optimizer Skill

## Validation Checkpoint 1: The Core Logic

> **FOUNDER CHECK-IN:**
>
> 1. When you mentally assess if someone can take on a project, what's
>    the FIRST thing you check? (Not capacity - that's obvious. What's
>    the thing that junior managers miss?)
>
> 2. You've managed teams at Disney scale and agency scale. What's
>    different about resource allocation at each? What transfers?
>
> 3. Describe a time you assigned someone to a project and it was a
>    disaster. What should the system have caught?
>
> 4. What's your "golden rule" for resource allocation that you've
>    developed over 15 years?

## [Skill content continues...]

## Validation Checkpoint 2: Edge Cases

> **FOUNDER CHECK-IN:**
>
> 1. Client calls with "emergency" - how do you distinguish real
>    emergencies from client drama? What signals do you look for?
>
> 2. Two projects need the same person. Walk me through your actual
>    decision process, not the theoretical one.
>
> 3. What's the political/relationship factor that spreadsheets
>    never capture but you always consider?

## Validation Checkpoint 3: Success Criteria

> **FOUNDER CHECK-IN:**
>
> 1. How would you know this skill is working? What would change?
>
> 2. What would make you override this skill's recommendation?
>
> 3. What should this skill NEVER do, even if the data suggests it?
```

---

## Onboarding Document: Creating Your First Skills

### Week 1: Foundation Skills (Parallel to Phase 12.1)

While infrastructure is being built, YOU are creating skill seeds:

#### Day 1-2: Brief Creation Intelligence

**Your Task:** Answer these questions (I'll turn them into skill specs)

```
BRIEF CREATION - KNOWLEDGE CAPTURE

1. THE NAMING QUESTION
   You have a naming convention: "Shoot: [Client] – [Topic]"

   - Why this format specifically? What problem did it solve?
   - What naming mistakes did you see before this convention?
   - Are there exceptions? When do you break the rule?

2. THE QUALITY QUESTION
   You have a "quality score" concept for briefs.

   - What's the minimum viable brief? What MUST be there?
   - What separates a 60% brief from a 90% brief?
   - Which field, if poorly filled, causes the most downstream pain?
   - What did you learn at Disney about brief quality that most
     agencies never figure out?

3. THE ASSIGNMENT QUESTION
   - How do you match creatives to briefs beyond "who's available"?
   - What's the chemistry factor? The growth opportunity factor?
   - When do you deliberately stretch someone vs. play it safe?

4. THE CLIENT CONTEXT QUESTION
   - What client signals should influence how a brief is structured?
   - Which clients need extra hand-holding in brief creation?
   - What's the "this client again" pattern recognition?

5. THE TIMELINE QUESTION
   - How do you estimate turnaround beyond simple formulas?
   - What's the "add 30% for this client" rule?
   - What's the "this always takes longer than expected" list?
```

#### Day 3-4: Resource Intelligence

```
RESOURCE OPTIMIZATION - KNOWLEDGE CAPTURE

1. THE CAPACITY MYTH
   "40 hours available" rarely means 40 hours of capacity.

   - What's your real capacity calculation?
   - What hidden work never shows up in timesheets?
   - How do you factor in creative energy vs. admin energy?

2. THE ASSIGNMENT MATRIX
   - Beyond skills, what makes someone right for a project?
   - How do you balance growth opportunities vs. safe bets?
   - What's the Disney lesson on team composition?

3. THE CONFLICT RESOLUTION
   - Two projects, one critical resource. Decision framework?
   - When do you negotiate with clients vs. find alternatives?
   - What's the escalation path when there's no good answer?

4. THE EARLY WARNING SYSTEM
   - What signals tell you someone is overloaded before they say it?
   - What patterns predict burnout or quality drops?
   - How do you spot the "I'm fine" that isn't fine?

5. THE FREELANCER EQUATION
   - When do you bring in external help vs. stretch internal?
   - What's the true cost of freelance beyond day rate?
   - What freelancer patterns have you seen work/fail?
```

#### Day 5: Client Intelligence

```
CLIENT MANAGEMENT - KNOWLEDGE CAPTURE

1. THE REQUEST TRANSLATION
   - What do clients say vs. what they actually need?
   - What questions do you always ask that juniors skip?
   - What's the "decoding" skill you've developed?

2. THE RELATIONSHIP THERMOMETER
   - How do you know a client relationship is cooling?
   - What are the early warning signs before they say anything?
   - What recovery patterns work when things go sideways?

3. THE ESCALATION JUDGMENT
   - What client issues need founder involvement?
   - What can be handled at PM level that often gets escalated unnecessarily?
   - What's the Disney protocol for client escalations?

4. THE EXPECTATION CALIBRATION
   - How do you reset unrealistic expectations without damaging relationships?
   - What's the "under-promise, over-deliver" implementation?
   - When do you push back vs. find a way?

5. THE PRICING PSYCHOLOGY
   - How do you know when to hold the line on pricing?
   - What signals tell you there's budget flexibility?
   - What's the "value conversation" vs. the "cost conversation"?
```

### Week 2: Workflow Skills (Parallel to Phase 12.2)

```
WORKFLOW INTELLIGENCE - KNOWLEDGE CAPTURE

1. THE APPROVAL FLOW
   - What's the real approval process vs. the official one?
   - Where do things get stuck and why?
   - What "parallel paths" speed things up?

2. THE QUALITY GATES
   - What checks actually matter vs. checkbox exercises?
   - What's the "good enough" vs. "needs more work" line?
   - Who's the real quality authority at each stage?

3. THE HANDOFF PROBLEM
   - What information gets lost between stages?
   - What handoff rituals actually work?
   - What's the Disney solution to handoff chaos?

4. THE BOTTLENECK PATTERNS
   - Where does work pile up and why?
   - What's the early warning that a bottleneck is forming?
   - What interventions work when things are stuck?

5. THE REVISION LOOP
   - How do you break the infinite revision cycle?
   - What's the "this is the final, final version" protocol?
   - When do you absorb revision costs vs. push back?
```

---

## Skill Development Workflow

### Continuous Parallel Track

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         PARALLEL DEVELOPMENT TRACKS                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INFRASTRUCTURE TRACK                 SKILL DEVELOPMENT TRACK               │
│  (Engineering)                        (Founder + Engineering)               │
│                                                                             │
│  Phase 12.1: Knowledge Schema    ←→   Skill Seeds from User Stories        │
│  - Document models                    - Brief Creator seed                  │
│  - Version control                    - Resource Scanner seed               │
│  - Basic editor                       - Intake Processor seed               │
│                                       - [Founder interviews happening]      │
│                                                                             │
│  Phase 12.2: Agent Infrastructure ←→  First Skills Go Live                 │
│  - Skill registry                     - Brief Creator v0.1                  │
│  - Invocation system                  - Test with real briefs               │
│  - Context injection                  - Validate with founder               │
│                                                                             │
│  Phase 12.3: Deliverables        ←→   Delivery Skills                       │
│  - Workflow engine                    - Quality Scorer                      │
│  - Review system                      - Revision Predictor                  │
│  - Client portal                      - Client Communicator                 │
│                                                                             │
│  [Continues...]                  ←→   [Skills grow with infrastructure]    │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### The Feedback Loop

```
YOUR EXPERTISE                    SKILL SPEC                    LIVE SKILL
     │                                │                              │
     │ Knowledge capture              │ Engineering                  │
     │ interview                      │ implementation               │
     ▼                                ▼                              ▼
┌─────────────┐               ┌─────────────┐               ┌─────────────┐
│  Anecdotes  │──────────────▶│  Skill Doc  │──────────────▶│  Running    │
│  Decisions  │               │  w/ Logic   │               │  System     │
│  Patterns   │               │  + Checks   │               │             │
└─────────────┘               └─────────────┘               └─────────────┘
     ▲                                │                              │
     │                                │                              │
     │         Validation             │        Real usage            │
     │         questions              │        feedback              │
     │                                ▼                              │
     │                        ┌─────────────┐                        │
     └────────────────────────│  YOUR       │◀───────────────────────┘
                              │  REVIEW     │
                              │  "That's    │
                              │  not quite  │
                              │  right..."  │
                              └─────────────┘
```

---

## Skill Priority Matrix

### Tier 1: Foundation Skills (Week 1-2)

| Skill | Business Value | Your Input Needed |
|-------|---------------|-------------------|
| `brief-creator` | Every project starts here | What makes a brief "complete"? |
| `resource-scanner` | Prevents overload disasters | Your capacity intuition |
| `intake-processor` | First client touchpoint | Request red flags |
| `timeline-estimator` | Sets expectations | Your estimation heuristics |

### Tier 2: Quality Skills (Week 3-4)

| Skill | Business Value | Your Input Needed |
|-------|---------------|-------------------|
| `quality-scorer` | Reduces revision cycles | What's "good enough"? |
| `brief-validator` | Catches gaps before work starts | Common missing pieces |
| `scope-detector` | Flags scope creep | Warning signs you've learned |
| `handoff-checker` | Ensures clean transitions | What info gets lost? |

### Tier 3: Intelligence Skills (Week 5-6)

| Skill | Business Value | Your Input Needed |
|-------|---------------|-------------------|
| `client-health-monitor` | Early warning system | Relationship signals |
| `resource-predictor` | Proactive planning | Seasonal patterns |
| `rfp-analyzer` | Win rate improvement | What predicts success? |
| `risk-flagger` | Project risk detection | Your gut check heuristics |

### Tier 4: Automation Skills (Week 7-8)

| Skill | Business Value | Your Input Needed |
|-------|---------------|-------------------|
| `status-updater` | Reduces manual updates | Update triggers |
| `reminder-generator` | Keeps things moving | What needs nudging? |
| `report-builder` | Client visibility | What do clients actually want? |
| `escalation-router` | Right people, right time | Escalation rules |

---

## Validation Question Bank

### For Every Skill, Ask:

**Origin Validation**
- [ ] Does this skill solve a real problem you've faced?
- [ ] How often does this situation come up?
- [ ] What's the cost when this goes wrong?

**Logic Validation**
- [ ] Does the decision tree match how you actually think?
- [ ] What nuance is missing?
- [ ] What would you add that only comes from experience?

**Disney Lens**
- [ ] What did Disney-scale operations teach you about this?
- [ ] What works at scale that doesn't work at agency scale? Vice versa?
- [ ] What would your Disney colleagues think of this approach?

**Edge Case Validation**
- [ ] What's the weird scenario this needs to handle?
- [ ] What's the "yeah but..." that breaks the simple logic?
- [ ] What's the exception that proves the rule?

**Override Validation**
- [ ] When would you override this skill's recommendation?
- [ ] What human judgment can't be automated here?
- [ ] What should always require human approval?

**Success Validation**
- [ ] How will you know this skill is working?
- [ ] What metric would prove value?
- [ ] What would make you turn this skill off?

---

## Getting Started: Your First Session

### Session 1 Agenda (60-90 minutes)

1. **Brief Creation Deep Dive** (30 min)
   - Walk through your ideal brief creation process
   - What questions do you always ask?
   - What do junior PMs always forget?

2. **Resource Allocation Reality** (30 min)
   - How do you actually assess capacity?
   - What's the Disney-scale lesson here?
   - Walk through a recent allocation decision

3. **Client Intake Patterns** (30 min)
   - How do you decode client requests?
   - What red flags have you learned?
   - What separates good clients from difficult ones?

### Output
After this session, we'll have:
- 3 skill seeds with your actual logic
- Validation questions specific to your experience
- Edge cases from your real history
- Priority ranking based on business impact

---

## The Sandbox UI

### Skill Playground (Phase 1 Deliverable)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SKILL DEVELOPMENT SANDBOX                                    [Environment] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐
│  │  SKILL: brief-creator                              [Draft] [v0.1]       │
│  ├─────────────────────────────────────────────────────────────────────────┤
│  │                                                                         │
│  │  TEST INPUT                          │  OUTPUT PREVIEW                  │
│  │  ─────────────────────────           │  ─────────────────────           │
│  │  Client: CCAD                        │  Title: Shoot: CCAD – Annual     │
│  │  Request: "Annual report video,      │  Type: VIDEO_SHOOT               │
│  │  2 min, need in 3 weeks"             │  Quality Score: 72               │
│  │                                      │  Suggested Assignee: Sara        │
│  │  [Run Skill]                         │  Timeline: 15 business days      │
│  │                                      │                                  │
│  │                                      │  ⚠️ Warnings:                    │
│  │                                      │  - No objective specified        │
│  │                                      │  - Location TBD                  │
│  │                                      │                                  │
│  └─────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐
│  │  VALIDATION CHECKPOINT                                                  │
│  ├─────────────────────────────────────────────────────────────────────────┤
│  │                                                                         │
│  │  Based on this output, founder check-in:                                │
│  │                                                                         │
│  │  □ Is "72" the right quality score for this input?                      │
│  │  □ Would YOU have assigned Sara, or someone else? Why?                  │
│  │  □ Are these the right warnings to surface?                             │
│  │  □ What's missing from this output that you'd want to know?             │
│  │                                                                         │
│  │  [Add Feedback] [Approve Logic] [Request Changes]                       │
│  │                                                                         │
│  └─────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐
│  │  SKILL LOGIC (Editable)                                                 │
│  ├─────────────────────────────────────────────────────────────────────────┤
│  │  ```                                                                    │
│  │  # Decision: Assignee Selection                                         │
│  │                                                                         │
│  │  1. Filter by skill: video_production                                   │
│  │  2. Filter by availability: next 15 days                                │
│  │  3. Rank by:                                                            │
│  │     - Client history (worked with this client before?)                  │
│  │     - Current workload (< 80% capacity)                                 │
│  │     - Project type experience                                           │
│  │                                                                         │
│  │  [FOUNDER INPUT NEEDED]                                                 │
│  │  What else should factor into assignee selection?                       │
│  │  - Growth opportunity for team member?                                  │
│  │  - Client relationship/preference?                                      │
│  │  - Project visibility/importance?                                       │
│  │  ```                                                                    │
│  └─────────────────────────────────────────────────────────────────────────┘
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary: The New Approach

### Before
```
Phase 1-7: Build infrastructure
Phase 8: "Add skills" (someday, maybe)
```

### After
```
Week 1, Day 1: Start capturing expertise → skill seeds
Week 1, Day 1: Build sandbox alongside infrastructure
Every Phase: Skills grow with the platform
Continuous: Founder validation at every step
```

### The Key Insight

The most valuable thing isn't the code - it's YOUR 15 years of expertise plus Disney-scale experience. The infrastructure exists to:
1. Capture that expertise in queryable form
2. Let agents act on that expertise
3. Scale your decision-making without scaling your time

The sandbox makes skill development a **Day 1 activity**, not a Phase 8 afterthought.

---

## Next Steps

1. **Schedule Session 1** - 90 min knowledge capture on Brief Creation + Resource Allocation
2. **Review this doc** - Add your own validation questions
3. **Identify your "if-then" rules** - The decision shortcuts you've developed
4. **List your "never again" lessons** - The mistakes that taught you the most

Ready to start capturing?
