---
title: Count findings
description: Count findings by severity and state.
url: https://www.hacktron.ai/docs/api/findings/count-findings
---

# Count findings

Counts findings with the same filters as [`GET /findings`](/docs/api/findings/list-findings), so you don't have to fetch every page. The response has the total and counts by severity, state, and repository. Severity and state counts include zero values. Repositories are ordered by finding count, highest first.

## Request

`GET /findings/counts`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/findings/counts" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "total": 0,
  "by_severity": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "info": 0
  },
  "by_state": {
    "open": 0,
    "true_positive": 0,
    "false_positive": 0,
    "accepted_risk": 0,
    "resolved": 0,
    "closed": 0
  },
  "by_repository": [
    {
      "repository": "string",
      "total": 0,
      "by_severity": {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0
      }
    }
  ]
}
```

:::

### Query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `severity` | string | One of `critical`, `high`, `medium`, `low`, or `info`. |
| `state` | string | One of `open`, `true_positive`, `false_positive`, `accepted_risk`, `resolved`, or `closed`. |
| `scan_id` | string | |
| `scan_type` | string | Filter by scan type across all scans associated with the finding. One of `pr` or `full`. |
| `repo_url` | string | Filter by repository URL. Case-insensitive; a trailing slash or .git suffix is ignored. |
| `found_since` | string | Only include findings discovered on/after this ISO 8601 timestamp. |
| `found_until` | string | Only include findings discovered before this ISO 8601 timestamp. |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `total` | number, required | |
| `by_severity` | object, required | |
| `by_severity.critical` | number, required | |
| `by_severity.high` | number, required | |
| `by_severity.medium` | number, required | |
| `by_severity.low` | number, required | |
| `by_severity.info` | number, required | |
| `by_state` | object, required | |
| `by_state.open` | number, required | |
| `by_state.true_positive` | number, required | |
| `by_state.false_positive` | number, required | |
| `by_state.accepted_risk` | number, required | |
| `by_state.resolved` | number, required | |
| `by_state.closed` | number, required | |
| `by_repository` | array of object, required | Most findings first. |
| `by_repository[].repository` | string, required, nullable | Repository URL, or null for findings with no repository. |
| `by_repository[].total` | number, required | |
| `by_repository[].by_severity` | object, required | |
| `by_repository[].by_severity.critical` | number, required | |
| `by_repository[].by_severity.high` | number, required | |
| `by_repository[].by_severity.medium` | number, required | |
| `by_repository[].by_severity.low` | number, required | |
| `by_repository[].by_severity.info` | number, required | |
