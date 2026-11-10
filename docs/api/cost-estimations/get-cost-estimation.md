---
title: Get a cost estimation
description: Fetch a cost estimation by ID.
url: https://www.hacktron.ai/docs/api/cost-estimations/get-cost-estimation
---

# Get a cost estimation

Returns one cost estimation. While an estimation is pending, poll this endpoint until `status` reaches a terminal value (`completed`, `partial`, or `failed`).

## Request

`GET /cost-estimations/{id}`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/cost-estimations/<id>" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "organization_id": "f336d0bc-b841-465b-8045-024475c079dd",
  "user_id": "f336d0bc-b841-465b-8045-024475c079dd",
  "name": "string",
  "task_id": "cost_est_owner-repo_12345",
  "status": "completed",
  "repos": [
    {
      "source": "connected",
      "repo_url": "https://github.com/owner/repo",
      "branch": "main",
      "commit_sha": "abc123def456",
      "archive_id": "string"
    }
  ],
  "total_credits": 8000,
  "repo_results": [
    {
      "repo_url": "https://github.com/owner/repo",
      "branch": "main",
      "commit_sha": "abc123def456",
      "status": "completed",
      "from_cache": false,
      "applications": [
        {
          "app_name": "backend-api",
          "app_root_path": "apps/api",
          "architecture": "NestJS REST API with PostgreSQL"
        }
      ],
      "credits": 4000,
      "error": "string",
      "failure_reason": "unsupported_language",
      "unsupported_languages": [
        "string"
      ],
      "scoped_file_count": 42
    }
  ],
  "error": "string",
  "triage_required": false,
  "triage_fee_credits": 1600,
  "created_at": "2026-03-10T12:00:00.000Z",
  "updated_at": "2026-03-10T12:05:00.000Z"
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
| `id` | string, required | Estimation UUID. |
| `organization_id` | string, required | Organization UUID. |
| `user_id` | string, required | User UUID. |
| `name` | string | Friendly name for this estimation. |
| `task_id` | string, required | Task identifier. |
| `status` | string, required | Estimation status. One of `pending`, `running`, `completed`, `partial`, or `failed`. |
| `repos` | array of object, required | Input repositories. |
| `repos[].source` | string | Source type. One of `connected`, `public`, or `upload`. |
| `repos[].repo_url` | string | Repository URL. |
| `repos[].branch` | string | Branch name. |
| `repos[].commit_sha` | string | Resolved commit SHA. |
| `repos[].archive_id` | string | Archive ID (for upload sources). |
| `total_credits` | number | Total estimated credits across all repos. |
| `repo_results` | array of object | Per-repo estimation results. |
| `repo_results[].repo_url` | string, required | Repository URL. |
| `repo_results[].branch` | string | Branch name. |
| `repo_results[].commit_sha` | string | Commit SHA. |
| `repo_results[].status` | string, required | Result status. One of `completed` or `failed`. |
| `repo_results[].from_cache` | boolean, required | Whether result was served from cache. |
| `repo_results[].applications` | array of object | Detected applications. |
| `repo_results[].applications[].app_name` | string, required | Application name. |
| `repo_results[].applications[].app_root_path` | string, required | Application root path. |
| `repo_results[].applications[].architecture` | string | Architecture description. |
| `repo_results[].credits` | number | Estimated credits for this repo. |
| `repo_results[].error` | string | Error message (when status is failed). |
| `repo_results[].failure_reason` | string | Structured failure reason. One of `unsupported_language` or `scope_no_match`. |
| `repo_results[].unsupported_languages` | array of string | Detected unsupported languages among the top languages. |
| `repo_results[].scoped_file_count` | number | Files that matched the repository's whitebox scope rules, counted on disk before analysis. Absent for unscoped repositories. |
| `error` | string | Error message. |
| `triage_required` | boolean, required | Whether human triage is mandatory for a scan of this estimation (large app, above the predicted-cost threshold). The customer cannot opt out when true. |
| `triage_fee_credits` | number, required | Triage fee in credits (a percentage of the scan base credits) added when triage is enabled. |
| `created_at` | string (date-time), required | Timestamp when estimation was created. |
| `updated_at` | string (date-time), required | Timestamp when estimation was last updated. |
