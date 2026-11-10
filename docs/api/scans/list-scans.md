---
title: List scans
description: List scans, filtered and sorted.
url: https://www.hacktron.ai/docs/api/scans/list-scans
---

# List scans

Returns the scans in your organisation, a page at a time. You can filter them by type and status and sort them.

## Request

`GET /scans`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/scans" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "data": [
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
  ],
  "total": 0,
  "page": 0,
  "limit": 0
}
```

:::

### Query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `page` | number | The page number to retrieve. Default `1`. |
| `limit` | number | The number of items to retrieve per page. Default `100`. |
| `scan_type` | string | One of `pr` or `full`. |
| `status` | string | One of `pending`, `running`, `completed`, `failed`, `stopped`, `cancelled`, `skipped`, `pending_verification`, `pending_triage`, `draft`, `estimating`, or `estimated`. |
| `sort_by` | string | One of `created_at`, `updated_at`, or `status`. |
| `sort_order` | string | One of `ASC` or `DESC`. Default `DESC`. |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `data` | array of object, required | |
| `data[].id` | string, required | |
| `data[].task_id` | string, required | |
| `data[].scan_type` | string, required | One of `pr` or `full`. |
| `data[].status` | string, required | |
| `data[].name` | string, required, nullable | |
| `data[].repo_url` | string, required, nullable | |
| `data[].branch` | string, required, nullable | |
| `data[].pr_number` | number, required, nullable | |
| `data[].target_urls` | array of string, required, nullable | |
| `data[].findings_summary` | object, required | |
| `data[].findings_summary.critical` | number, required | |
| `data[].findings_summary.high` | number, required | |
| `data[].findings_summary.medium` | number, required | |
| `data[].findings_summary.low` | number, required | |
| `data[].findings_summary.info` | number, required | |
| `data[].created_at` | string, required | |
| `data[].updated_at` | string, required | |
| `total` | number, required | |
| `page` | number, required | |
| `limit` | number, required | |
