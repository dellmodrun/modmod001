---
title: List scan findings
description: Page through a scan's findings.
url: https://www.hacktron.ai/docs/api/scans/list-scan-findings
---

# List scan findings

Returns the findings of one scan, a page at a time, with the same filtering and sorting as [`GET /findings`](/docs/api/findings/list-findings).

Only findings that have passed automated verification (`verification_status = approved`) are returned.

## Request

`GET /scans/{id}/findings`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/scans/<id>/findings" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "data": [
    {
      "id": "string",
      "display_id": "HAC-FD-1104",
      "number": 1104,
      "title": "string",
      "category": "string",
      "severity": "critical",
      "state": "open",
      "description": "string",
      "affected_file": "string",
      "affected_code": "string",
      "proof_of_concept": "string",
      "tags": [
        "string"
      ],
      "scan_id": "string",
      "found_at": "string",
      "updated_at": "string",
      "resolved_at": "string"
    }
  ],
  "total": 0,
  "page": 0,
  "limit": 0
}
```

:::

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | string, required | |

### Query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `page` | number | The page number to retrieve. Default `1`. |
| `limit` | number | The number of items to retrieve per page. Default `100`. |
| `severity` | string | One of `critical`, `high`, `medium`, `low`, or `info`. |
| `state` | string | One of `open`, `true_positive`, `false_positive`, `accepted_risk`, `resolved`, or `closed`. |
| `scan_id` | string | |
| `scan_type` | string | Filter by scan type across all scans associated with the finding. One of `pr` or `full`. |
| `repo_url` | string | Filter by repository URL. Case-insensitive; a trailing slash or .git suffix is ignored. |
| `found_since` | string | Only include findings discovered on/after this ISO 8601 timestamp. |
| `found_until` | string | Only include findings discovered before this ISO 8601 timestamp. |
| `sort_by` | string | One of `found_at`, `updated_at`, or `severity`. |
| `sort_order` | string | One of `ASC` or `DESC`. Default `DESC`. |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `data` | array of object, required | |
| `data[].id` | string, required | Finding UUID. |
| `data[].display_id` | string, required | Human-readable id (KEY-FD-NUMBER). |
| `data[].number` | integer, required | Per-organization sequence number behind display_id. |
| `data[].title` | string, required | |
| `data[].category` | string, required | |
| `data[].severity` | string, required | One of `critical`, `high`, `medium`, `low`, or `info`. |
| `data[].state` | string, required | One of `open`, `true_positive`, `false_positive`, `accepted_risk`, `resolved`, or `closed`. |
| `data[].description` | string, required | |
| `data[].affected_file` | string, required | |
| `data[].affected_code` | string, required | |
| `data[].proof_of_concept` | string, required, nullable | |
| `data[].tags` | array of string, required | |
| `data[].scan_id` | string, required, nullable | |
| `data[].found_at` | string, required | |
| `data[].updated_at` | string, required | |
| `data[].resolved_at` | string, required, nullable | Timestamp of the most recent transition to resolved (ISO 8601). Null if never resolved. |
| `total` | number, required | |
| `page` | number, required | |
| `limit` | number, required | |
