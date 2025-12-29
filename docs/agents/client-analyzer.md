---
title: Client Analyzer
slug: client-analyzer
version: 1.0.0
status: DRAFT
category: CLIENT_RELATIONS
description: Analyzes client health, relationship signals, and predicts risk or opportunity
---

# Client Analyzer

## Purpose

Evaluates client relationship health by analyzing behavioral signals, communication patterns, and historical data to surface risks (churn, payment issues) and opportunities (upsell, expansion).

## Triggers

```yaml
triggers:
  - type: SCHEDULE
    schedule: "0 8 * * 1"  # Every Monday at 8am
  - type: EVENT
    eventType: "client.invoice.overdue"
  - type: EVENT
    eventType: "client.approval.delayed"
  - type: MANUAL
```

## Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
| clientId | string | No | Specific client to analyze (omit for portfolio scan) |
| timeframeDays | number | No | Analysis window (default: 90) |
| includeFinancials | boolean | No | Include payment/invoice data (default: true) |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| healthScore | number | 0-100 composite health score |
| riskLevel | string | HIGH, MEDIUM, LOW |
| riskFactors | array | Specific concerns identified |
| opportunities | array | Upsell/expansion signals |
| recommendedActions | array | Next steps to improve relationship |
| comparableSituations | array | Similar past client scenarios and outcomes |

## Founder Knowledge

### Red Flags from 15 Years of Agency Experience

**Payment Signals:**
- Invoice delays > 15 days = early warning
- Invoice delays > 30 days = active risk
- Requesting payment term extensions = cash flow concern
- "Who owes who" - track the balance of deliverables vs payments

**Approval Signals:**
- Approval delays correlate with internal client politics
- Multiple approval rounds without clear feedback = unclear sign-off chain
- No unified POC = need org chart mapping
- Feedback going through unexpected channels = relationship bypass

**Communication Signals:**
- Reduced communication frequency (went from weekly to monthly calls)
- CC'ing procurement or legal suddenly
- Main contact going quiet while others speak up
- Tone shift in emails (formal where previously casual)

**Work Pattern Signals:**
- Scope creep requests without budget conversations
- Rush requests becoming the norm (poor planning upstream)
- Quality complaints increasing
- Comparisons to competitors or past agencies

### Opportunity Signals

**Expansion Ready:**
- "We have another project coming up" mentions
- Internal advocacy (client mentions you to other departments)
- Invitations to annual planning or strategy sessions
- Increased brief complexity (trust growing)

**Upsell Ready:**
- Questions about services you don't currently provide them
- "Do you guys do...?" conversations
- Complaints about other vendors in adjacent areas
- Budget conversations initiated by client

### "Devil You Know" Factor

Long-term clients have muscle memory. Even rocky relationships have value:
- They know our process
- We know their sensitivities
- Escalation paths are established
- Context switching cost is real

## Validation Questions

1. Does this analysis account for the client's internal politics and org changes?
2. Are we measuring communication quality, not just quantity?
3. Does the risk assessment consider "who owes who" balance?
4. Are we factoring in the "devil you know" relationship value?
5. What would a junior AM miss about this client's signals?

## Dependencies

- `resource-scanner` for assignment history context
- `brief-creator` for work volume trends

## Example Invocation

```json
{
  "skillSlug": "client-analyzer",
  "input": {
    "clientId": "client_abc123",
    "timeframeDays": 90,
    "includeFinancials": true
  }
}
```

## Expected Output

```json
{
  "healthScore": 72,
  "riskLevel": "MEDIUM",
  "riskFactors": [
    {
      "type": "APPROVAL_DELAYS",
      "severity": "MEDIUM",
      "detail": "Average approval time increased from 2 to 5 days over past month",
      "evidence": ["Brief #234", "Brief #256", "Brief #271"]
    },
    {
      "type": "PAYMENT_DELAY",
      "severity": "LOW",
      "detail": "Last 2 invoices paid 5-7 days late (previously same-day)",
      "evidence": ["INV-2024-089", "INV-2024-092"]
    }
  ],
  "opportunities": [
    {
      "type": "EXPANSION",
      "confidence": 0.75,
      "signal": "Client mentioned 'big Q2 campaign' in last call",
      "recommendedAction": "Schedule strategic planning session"
    }
  ],
  "recommendedActions": [
    "Schedule check-in call with main POC to understand approval delays",
    "Review internal sign-off chain - may have changed",
    "Prepare Q2 campaign proposal proactively"
  ],
  "comparableSituations": [
    {
      "clientCode": "DET",
      "year": 2023,
      "situation": "Similar approval delays preceded org restructure",
      "outcome": "Proactive outreach saved relationship",
      "lesson": "Get ahead of internal changes"
    }
  ]
}
```
