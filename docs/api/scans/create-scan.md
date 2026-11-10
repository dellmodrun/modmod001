---
title: Trigger a pentest
description: Start a pentest from a cost estimation.
url: https://www.hacktron.ai/docs/api/scans/create-scan
---

# Trigger a pentest

Starts a pentest of the repositories attached to a completed or partial cost estimation. Pentests run asynchronously: the endpoint returns straight away with a scan `id` to poll.

## Prerequisites

1. Create a cost estimation with [`POST /cost-estimations`](/docs/api/cost-estimations/create-cost-estimation).
2. Wait until the estimation reaches `completed` or `partial` status and has a positive `total_credits` value.
3. Submit the same repositories, branches, and path scope that the estimation included, and keep each repository's `include_paths` and `exclude_paths` the same. Formant rejects a pentest whose repository, archive, branch, or path scope doesn't match the estimate.
4. Make sure your organisation has enough Whitebox credits. The dashboard shows them, as [Credits and billing](/docs/whitebox/billing) describes. Insufficient credits return `402 Payment Required`.

:::warning
Only one started pentest can claim a cost estimation. To change repositories, archives, branches, or path scope, create a new estimate first.
:::

## Request

`POST /scans`

Send an [API key](/docs/api/authentication) with the `write` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl -X POST "https://api.hacktron.ai/v1/scans" \
  -H "X-Api-Key: $HACKTRON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "cost_estimation_id": "string",
  "repos": [
    {
      "url": "string",
      "branch": "string"
    }
  ]
}'
```

```json title="Response 201 Created" showLineNumbers=false wrap=false
{
  "id": "string",
  "task_id": "string",
  "status": "string",
  "message": "string"
}
```

:::

### Body

A required `application/json` body.

| Field | Type | Description |
| --- | --- | --- |
| `cost_estimation_id` | string, required | Completed cost estimation UUID. |
| `repos` | array of object, required | Repositories to scan. |
| `repos[].url` | string, required | Repository URL. |
| `repos[].branch` | string, required | Branch name. |
| `repos[].source` | string | Repository source. One of `connected`, `public`, or `upload`. Default `connected`. |
| `target_urls` | array of string | Target URLs for pentest. |
| `auth_instructions` | string | Target websites and browser login instructions, including URLs and credentials. At most 2000 characters. |
| `custom_context` | string | Custom context for the pentest. At most 2000 characters. |
| `context_document_ids` | array of string | Context document UUIDs to include. |

## Responses

### 201 Created

| Field | Type | Description |
| --- | --- | --- |
| `id` | string, required | |
| `task_id` | string, required | |
| `status` | string, required | |
| `message` | string, required | |

### 402 Payment Required

Insufficient credits.

## Next steps

Poll `GET /scans/{id}/status` until the status is `completed`. Then fetch the findings with `GET /scans/{id}/findings` or export them with `GET /scans/{id}/findings/export`.

:::tiles
- [Get scan status](/docs/api/scans/get-scan-status): Poll a scan until it completes.
- [List scan findings](/docs/api/scans/list-scan-findings): Page through a scan's findings.
- [Export scan findings](/docs/api/scans/export-scan-findings): A scan's findings as JSON, CSV, or SARIF.
:::
