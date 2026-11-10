---
title: Get a scan
description: A scan with its findings summary.
url: https://www.hacktron.ai/docs/api/scans/get-scan
---

# Get a scan

Returns the full record of one scan, including its findings summary.

## Request

`GET /scans/{id}`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/scans/<id>" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "id": "string",
  "task_id": "string",
  "scan_type": "pr",
  "status": "string",
  "name": "string",
  "repo_url": "string",
  "branch": "string",
  "pr_number": 0,
  "target_urls": [
    "string"
  ],
  "findings_summary": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "info": 0
  },
  "created_at": "string",
  "updated_at": "string"
}
```

:::

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | string, required | |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `id` | string, required | |
| `task_id` | string, required | |
| `scan_type` | string, required | One of `pr` or `full`. |
| `status` | string, required | |
| `name` | string, required, nullable | |
| `repo_url` | string, required, nullable | |
| `branch` | string, required, nullable | |
| `pr_number` | number, required, nullable | |
| `target_urls` | array of string, required, nullable | |
| `findings_summary` | object, required | |
| `findings_summary.critical` | number, required | |
| `findings_summary.high` | number, required | |
| `findings_summary.medium` | number, required | |
| `findings_summary.low` | number, required | |
| `findings_summary.info` | number, required | |
| `created_at` | string, required | |
| `updated_at` | string, required | |
