---
title: Stop a scan
description: Stop a running scan or pentest.
url: https://www.hacktron.ai/docs/api/scans/stop-scan
---

# Stop a scan

Stops a running scan and returns its status. Members can stop their own pentests and any pull request scan. Organisation admins can stop any scan. You need the member role or above.

## Request

`POST /scans/{id}/stop`

Send an [API key](/docs/api/authentication) with the `write` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl -X POST "https://api.hacktron.ai/v1/scans/<id>/stop" \
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
