---
title: Turn PR reviews on or off
description: Switch automatic reviews on or off.
url: https://www.hacktron.ai/docs/api/repos/set-pr-reviews
---

# Turn PR reviews on or off

Turns automatic pull and merge request reviews on for the repositories in `enable` and off for the repositories in `disable`. Use repository IDs from [`GET /repos`](/docs/api/repos/list-repos), for any supported provider. Each list holds up to 100 IDs per request. Only organisation admins can call it.

- Before you turn reviews on for a repository, give Formant access to it from **Repositories** in Formant.
- If one repository fails, Formant carries on with the others. The response counts the repositories that changed in `processed` and lists each failure with its reason in `failedRepositories`.
- `webhookPending` lists the enabled repositories whose provider webhook is still waiting to be registered. Reviews begin once the webhook is registered.

## Request

`POST /repos/pr-reviews`

Send an [API key](/docs/api/authentication) with the `write` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl -X POST "https://api.hacktron.ai/v1/repos/pr-reviews" \
  -H "X-Api-Key: $HACKTRON_API_KEY" \
  -H "X-Organization-Id: <X-Organization-Id>" \
  -H "Content-Type: application/json" \
  -d '{
  "enable": [
    "123e4567-e89b-12d3-a456-426614174000"
  ],
  "disable": []
}'
```

```json title="Response 201 Created" showLineNumbers=false wrap=false
{
  "processed": 2,
  "failed": 0,
  "failedRepositories": [
    {
      "repo": "acme/api",
      "reason": "Repository acme/api not found"
    }
  ],
  "webhookPending": []
}
```

:::

### Headers

| Parameter | Type | Description |
| --- | --- | --- |
| `X-Organization-Id` | string, required | Organization ID. |

### Body

A required `application/json` body.

| Field | Type | Description |
| --- | --- | --- |
| `enable` | array of string (uuid), required | Ids from the repository list of the repositories to turn on. |
| `disable` | array of string (uuid), required | Ids from the repository list of the repositories to turn off. |

## Responses

### 201 Created

| Field | Type | Description |
| --- | --- | --- |
| `processed` | number, required | Keys applied. |
| `failed` | number, required | Keys that failed. |
| `failedRepositories` | array of object, required | Keys that failed, with the reason. |
| `failedRepositories[].repo` | string, required | The key the request named. |
| `failedRepositories[].reason` | string, required | Why the key was not applied. |
| `webhookPending` | array of string, required | Keys turned on whose provider webhook could not be registered. |
