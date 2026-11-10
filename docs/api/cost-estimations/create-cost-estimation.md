---
title: Create a cost estimation
description: Estimate credits before a pentest.
url: https://www.hacktron.ai/docs/api/cost-estimations/create-cost-estimation
---

# Create a cost estimation

A cost estimation resolves the repositories you plan to test, detects the applications in them, and returns a predicted credit cost. [`POST /scans`](/docs/api/scans/create-scan) needs a `completed` or `partial` cost estimation with a positive `total_credits` value.

Cost estimations run asynchronously. The `POST` returns a record in `pending` or `running` state. Poll [`GET /cost-estimations/{id}`](/docs/api/cost-estimations/get-cost-estimation) until `status` reaches `completed`, `partial`, or `failed`.

## Terminal statuses

| Status | Meaning |
| --- | --- |
| `completed` | Every repository was estimated. `total_credits` is populated. |
| `partial` | Some repositories completed and others failed. `repo_results[].status` has the details. |
| `failed` | The whole estimation failed. `error` holds a message. |

An estimation in a terminal state can't change. To start the pentest, pass its `id` as `cost_estimation_id` to [`POST /scans`](/docs/api/scans/create-scan). The pentest must use the same repositories, branches, and path scope as the estimate.

## Repository scope

Each repository can set `include_paths` and `exclude_paths` with [path patterns](/docs/whitebox/quickstart#path-patterns). Empty include paths select the whole repository, and exclude paths remove matches from that selection. For example:

```json
{
  "include_paths": ["services/gateway/**"],
  "exclude_paths": ["**/tests/**", "*.md"]
}
```

Pass the same path scope when you start the pentest. To change it, create a new estimate first.

## Request

`POST /cost-estimations`

Send an [API key](/docs/api/authentication) with the `write` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl -X POST "https://api.hacktron.ai/v1/cost-estimations" \
  -H "X-Api-Key: $HACKTRON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "repos": [
    {
      "source": "connected",
      "repo_url": "string",
      "branch": "string"
    }
  ]
}'
```

```json title="Response 201 Created" showLineNumbers=false wrap=false
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

### Body

A required `application/json` body.

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Friendly name for this estimation. |
| `repos` | array of object, required | Repositories to estimate. |
| When `source` is `connected` | | |
| `repos[].source` | string, required | Source type. Always `connected`. Default `connected`. |
| `repos[].repo_url` | string, required | Repository URL. |
| `repos[].branch` | string, required | Branch name. |
| `repos[].github_installation_id` | number | GitHub App installation ID. Omitted for PAT-based connections (e.g. GitHub Enterprise), where the installation is resolved from repo_url and the organization instead. |
| When `source` is `public` | | |
| `repos[].source` | string, required | Source type. Always `public`. |
| `repos[].repo_url` | string, required | Repository URL. |
| `repos[].branch` | string, required | Branch name. |
| When `source` is `upload` | | |
| `repos[].source` | string, required | Source type. Always `upload`. |
| `repos[].archive_id` | string, required | Scan archive ID. |

## Responses

### 201 Created

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
