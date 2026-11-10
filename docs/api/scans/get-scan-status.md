---
title: Get scan status
description: Poll a scan until it completes.
url: https://www.hacktron.ai/docs/api/scans/get-scan-status
---

# Get scan status

Returns a minimal payload with the scan's current status. Use it for polling, since the response leaves out the findings summary that [`GET /scans/{id}`](/docs/api/scans/get-scan) computes.

## Recommended polling

A poll interval of 10 to 30 seconds is enough. Pentests take minutes to complete, so tighter polling tells you nothing new and uses up your [rate limit](/docs/api/rate-limits) quota.

Stop polling when `status` reaches a terminal value: `completed`, `failed`, `stopped`, `cancelled`, or `skipped`.

## Request

`GET /scans/{id}/status`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/scans/<id>/status" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "id": "string",
  "task_id": "string",
  "status": "pending",
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
| `status` | string, required | One of `pending`, `running`, `completed`, `failed`, `stopped`, `cancelled`, `skipped`, `pending_verification`, `pending_triage`, `draft`, `estimating`, or `estimated`. |
| `created_at` | string, required | |
| `updated_at` | string, required | |
