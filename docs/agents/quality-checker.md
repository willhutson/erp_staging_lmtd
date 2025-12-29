---
title: Quality Checker
slug: quality-checker
version: 1.0.0
status: DRAFT
category: QUALITY_ASSURANCE
description: Validates deliverable quality against brief requirements and past performance benchmarks
---

# Quality Checker

## Purpose

Reviews deliverables before client submission, ensuring they meet brief requirements, brand standards, and quality benchmarks established by comparable past work.

## Triggers

```yaml
triggers:
  - type: EVENT
    eventType: "deliverable.status.internal_review"
  - type: MANUAL
  - type: EVENT
    eventType: "brief.status.client_review"  # Pre-flight check
```

## Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
| deliverableId | string | Yes | Deliverable to review |
| briefId | string | No | Brief context (auto-resolved if not provided) |
| reviewType | string | No | QUICK, STANDARD, THOROUGH (default: STANDARD) |
| includeComps | boolean | No | Include comparable work analysis (default: true) |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| qualityScore | number | 0-100 composite quality score |
| passesReview | boolean | Ready for next stage? |
| issues | array | Problems that need fixing |
| warnings | array | Potential concerns to flag |
| comparisonToComps | object | How this stacks up against past similar work |
| founderNotes | string | What Would Will Say (WWWS) |

## Founder Knowledge

### What Makes Work "Good Enough" vs "World Class"

**Good Enough:**
- Meets the brief requirements
- On brand
- No obvious errors
- Technically functional

**World Class:**
- Exceeds brief expectations
- Tells a story
- Has a clear point of view
- Would work as a portfolio piece
- Client would share unprompted

### The Comp Problem

> "The biggest junior mistake is delivering work without reference to what worked before."

Every deliverable should be contextualized:
- What similar work have we done for this client?
- What similar work have we done in this category?
- What performed well? What didn't?
- Why is this deliverable better/different/appropriate?

### Quality Dimensions by Brief Type

**VIDEO_SHOOT:**
- Shot composition and lighting
- Audio quality
- B-roll coverage
- Interview setup and framing
- Brand moment inclusion

**VIDEO_EDIT:**
- Pacing and rhythm
- Music/sound design fit
- Graphics consistency
- Platform optimization (aspect ratio, duration)
- Hook strength (first 3 seconds)

**DESIGN:**
- Brand alignment
- Hierarchy and readability
- Platform specifications
- Asset versatility
- Print vs digital considerations

**COPYWRITING:**
- Tone match
- Key message clarity
- CTA effectiveness
- Localization quality (AR)
- SEO considerations where applicable

**PAID_MEDIA:**
- Asset specifications per platform
- Copy length compliance
- CTA clarity
- Landing page alignment
- A/B variant differentiation

### Time Pressure Quality Thresholds

Under time pressure, know what to protect and what to flex:

**Never Skip:**
- Spell check / grammar
- Brand colors and fonts
- Key message accuracy
- Client logo usage
- Platform specs compliance

**Can Flex:**
- Advanced animations
- Custom illustrations (use stock)
- Multiple format variations
- Extensive A/B variants

**Must Communicate:**
- Any quality trade-offs made
- What would be done differently with more time
- Post-launch improvement opportunities

## Validation Questions

1. Does this deliverable answer the brief's actual ask?
2. Is there comparable past work? How does this stack up?
3. Would this work as a portfolio piece?
4. What would make the client share this unprompted?
5. If we had one more hour, what would we improve?

## Dependencies

- `brief-creator` for understanding requirements
- Access to deliverable files/links
- Historical deliverable quality data

## Quality Scoring Rubric

```yaml
scoring:
  brief_alignment:
    weight: 30
    criteria:
      - Answers primary objective
      - Includes all required elements
      - Matches specified format/duration

  technical_quality:
    weight: 25
    criteria:
      - Resolution/quality specs met
      - No technical errors
      - Platform-optimized

  brand_compliance:
    weight: 20
    criteria:
      - Logo usage correct
      - Colors accurate
      - Typography consistent
      - Tone appropriate

  creative_excellence:
    weight: 15
    criteria:
      - Original thinking
      - Engaging execution
      - Portfolio worthy

  comparative_performance:
    weight: 10
    criteria:
      - Matches or exceeds past similar work
      - Addresses previous feedback
      - Shows evolution
```

## Example Invocation

```json
{
  "skillSlug": "quality-checker",
  "input": {
    "deliverableId": "deliv_xyz789",
    "reviewType": "STANDARD",
    "includeComps": true
  }
}
```

## Expected Output

```json
{
  "qualityScore": 84,
  "passesReview": true,
  "issues": [],
  "warnings": [
    {
      "type": "DURATION",
      "severity": "LOW",
      "detail": "Video runs 47 seconds, brief specified 45 max. Platform allows up to 60.",
      "recommendation": "Acceptable but note for client that we can trim if needed"
    }
  ],
  "comparisonToComps": {
    "similarDeliverables": [
      {
        "id": "deliv_abc123",
        "title": "CCAD Product Launch Video",
        "qualityScore": 81,
        "clientFeedback": "Loved the pacing"
      }
    ],
    "comparison": "Current deliverable has stronger hook (first 3 sec) but similar pacing. Should perform equal or better.",
    "differentiators": ["Better opening hook", "Updated brand elements"]
  },
  "founderNotes": "Solid work. The hook is strong - good instinct. Only concern is we're relying on similar music choice as last video. Consider varying for Q2 to keep it fresh. Would use in portfolio."
}
```
