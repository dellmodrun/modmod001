---
title: Get finding
description: A finding with full triage context.
url: https://www.hacktron.ai/docs/api/findings/get-finding
---

# Get finding

Returns a single finding with its triage thread, occurrence count, repository URL, scan type, and a Mermaid diagram of the vulnerability trace when Hacktron produced one.

## Request

`GET /findings/{id}`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/findings/<id>" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
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
  "resolved_at": "string",
  "triage_thread": [
    {
      "id": "string",
      "reaction": "string",
      "comment": "string",
      "user_id": "string",
      "username": "string",
      "source": "string",
      "timestamp": "string"
    }
  ],
  "taint_path": [
    {
      "type": "source",
      "file": "string",
      "line": 0,
      "end_line": 0,
      "symbol": "string",
      "description": "string",
      "detail": "string",
      "taint_sources": [
        "string"
      ],
      "code": "string",
      "code_start_line": 0,
      "code_end_line": 0
    }
  ],
  "occurrence_count": 0,
  "repo_url": "string",
  "scan_type": "string"
}
```

:::

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | string, required | Finding UUID or display id (KEY-FD-NUMBER, e.g. HAC-FD-1104). |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `id` | string, required | Finding UUID. |
| `display_id` | string, required | Human-readable id (KEY-FD-NUMBER). |
| `number` | integer, required | Per-organization sequence number behind display_id. |
| `title` | string, required | |
| `category` | string, required | |
| `severity` | string, required | One of `critical`, `high`, `medium`, `low`, or `info`. |
| `state` | string, required | One of `open`, `true_positive`, `false_positive`, `accepted_risk`, `resolved`, or `closed`. |
| `description` | string, required | |
| `affected_file` | string, required | |
| `affected_code` | string, required | |
| `proof_of_concept` | string, required, nullable | |
| `tags` | array of string, required | |
| `scan_id` | string, required, nullable | |
| `found_at` | string, required | |
| `updated_at` | string, required | |
| `resolved_at` | string, required, nullable | Timestamp of the most recent transition to resolved (ISO 8601). Null if never resolved. |
| `triage_thread` | array of object, required | |
| `triage_thread[].id` | string, required | |
| `triage_thread[].reaction` | string, required, nullable | |
| `triage_thread[].comment` | string, required, nullable | |
| `triage_thread[].user_id` | string, required | |
| `triage_thread[].username` | string | |
| `triage_thread[].source` | string, required | |
| `triage_thread[].timestamp` | string, required | |
| `taint_path` | array of object, required | |
| `taint_path[].type` | string, required | One of `source`, `propagation`, or `sink`. |
| `taint_path[].file` | string, required | |
| `taint_path[].line` | number, required | |
| `taint_path[].end_line` | number, required | |
| `taint_path[].symbol` | string, required | |
| `taint_path[].description` | string, required | |
| `taint_path[].detail` | string | Raw symbol docstring; supplemental context for the stepped taint flow. |
| `taint_path[].taint_sources` | array of string, required | |
| `taint_path[].code` | string | Source code lines for this step's symbol, pre-sliced by the worker. |
| `taint_path[].code_start_line` | number | 1-based start line number of the `code` slice in the source file. Used by the frontend as the anchor for chevron-expand requests to GET /findings/:uuid/source. |
| `taint_path[].code_end_line` | number | 1-based end line number of the `code` slice in the source file. Used by the frontend as the anchor for chevron-expand requests to GET /findings/:uuid/source. |
| `occurrence_count` | number, required | |
| `repo_url` | string, required, nullable | |
| `scan_type` | string, required, nullable | |
