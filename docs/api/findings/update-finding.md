---
title: Update finding
description: Change state, severity, or duplicate.
url: https://www.hacktron.ai/docs/api/findings/update-finding
---

# Update finding

Updates the `state`, `severity`, or `duplicate_of` of a single finding, or any combination of them. Every change is recorded in the finding's audit trail and passed on to connected integrations (GitHub, Slack, Jira, and Linear).

## Request

`PATCH /findings/{id}`

Send an [API key](/docs/api/authentication) with the `write` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl -X PATCH "https://api.hacktron.ai/v1/findings/<id>" \
  -H "X-Api-Key: $HACKTRON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "state": "open",
  "severity": "critical",
  "state_reason": "string",
  "severity_reason": "string",
  "reason": "string",
  "duplicate_of": "string"
}'
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "id": "string",
  "state": "open",
  "severity": "critical",
  "duplicate_of": "string"
}
```

:::

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | string, required | Finding UUID or display id (KEY-FD-NUMBER, e.g. HAC-FD-1104). |

### Body

A required `application/json` body.

| Field | Type | Description |
| --- | --- | --- |
| `state` | string | New finding state. One of `open`, `true_positive`, `false_positive`, `accepted_risk`, `resolved`, or `closed`. |
| `severity` | string | New severity level. One of `critical`, `high`, `medium`, `low`, or `info`. |
| `state_reason` | string | Reason for the state change (defaults to reason if omitted). |
| `severity_reason` | string | Reason for the severity change (defaults to reason if omitted). |
| `reason` | string | Shorthand reason applied to both state and severity changes when their specific reason is not provided. |
| `duplicate_of` | string, nullable | UUID of the canonical finding to mark this finding as a duplicate of, or null to unmark. The target must be in the same repository. |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `id` | string, required | |
| `state` | string, required | One of `open`, `true_positive`, `false_positive`, `accepted_risk`, `resolved`, or `closed`. |
| `severity` | string, required | One of `critical`, `high`, `medium`, `low`, or `info`. |
| `duplicate_of` | string, required, nullable | UUID of the canonical finding this duplicates, if any. |
