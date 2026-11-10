---
title: List cost estimations
description: List your cost estimations.
url: https://www.hacktron.ai/docs/api/cost-estimations/list-cost-estimations
---

# List cost estimations

Returns your organisation's cost estimations, most recent first. Page through them with offset-based pagination.

:::note
Unlike most list endpoints, cost estimations use offset-based pagination (`limit` and `offset`) instead of `page` and `limit`. [Pagination, filtering, and sorting](/docs/api/pagination-filtering) covers the general conventions.
:::

## Request

`GET /cost-estimations`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/cost-estimations" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "data": [
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
  ],
  "total": 0
}
```

:::

### Query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `limit` | number | |
| `offset` | number | |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `data` | array of object, required | |
| `data[].id` | string, required | Estimation UUID. |
| `data[].organization_id` | string, required | Organization UUID. |
| `data[].user_id` | string, required | User UUID. |
| `data[].name` | string | Friendly name for this estimation. |
| `data[].task_id` | string, required | Task identifier. |
| `data[].status` | string, required | Estimation status. One of `pending`, `running`, `completed`, `partial`, or `failed`. |
| `data[].repos` | array of object, required | Input repositories. |
| `data[].repos[].source` | string | Source type. One of `connected`, `public`, or `upload`. |
| `data[].repos[].repo_url` | string | Repository URL. |
| `data[].repos[].branch` | string | Branch name. |
| `data[].repos[].commit_sha` | string | Resolved commit SHA. |
| `data[].repos[].archive_id` | string | Archive ID (for upload sources). |
| `data[].total_credits` | number | Total estimated credits across all repos. |
| `data[].repo_results` | array of object | Per-repo estimation results. |
| `data[].repo_results[].repo_url` | string, required | Repository URL. |
| `data[].repo_results[].branch` | string | Branch name. |
| `data[].repo_results[].commit_sha` | string | Commit SHA. |
| `data[].repo_results[].status` | string, required | Result status. One of `completed` or `failed`. |
| `data[].repo_results[].from_cache` | boolean, required | Whether result was served from cache. |
| `data[].repo_results[].applications` | array of object | Detected applications. |
| `data[].repo_results[].applications[].app_name` | string, required | Application name. |
| `data[].repo_results[].applications[].app_root_path` | string, required | Application root path. |
| `data[].repo_results[].applications[].architecture` | string | Architecture description. |
| `data[].repo_results[].credits` | number | Estimated credits for this repo. |
| `data[].repo_results[].error` | string | Error message (when status is failed). |
| `data[].repo_results[].failure_reason` | string | Structured failure reason. One of `unsupported_language` or `scope_no_match`. |
| `data[].repo_results[].unsupported_languages` | array of string | Detected unsupported languages among the top languages. |
| `data[].repo_results[].scoped_file_count` | number | Files that matched the repository's whitebox scope rules, counted on disk before analysis. Absent for unscoped repositories. |
| `data[].error` | string | Error message. |
| `data[].triage_required` | boolean, required | Whether human triage is mandatory for a scan of this estimation (large app, above the predicted-cost threshold). The customer cannot opt out when true. |
| `data[].triage_fee_credits` | number, required | Triage fee in credits (a percentage of the scan base credits) added when triage is enabled. |
| `data[].created_at` | string (date-time), required | Timestamp when estimation was created. |
| `data[].updated_at` | string (date-time), required | Timestamp when estimation was last updated. |
| `total` | number, required | |
