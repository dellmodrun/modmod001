---
title: Add finding comment
description: Append to a finding's triage thread.
url: https://www.hacktron.ai/docs/api/findings/add-finding-comment
---

# Add finding comment

Appends a comment to a finding's triage thread. Comments appear in the dashboard alongside comments from GitHub, Slack, and other integrations.

## Request

`POST /findings/{id}/comments`

Send an [API key](/docs/api/authentication) with the `write` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl -X POST "https://api.hacktron.ai/v1/findings/<id>/comments" \
  -H "X-Api-Key: $HACKTRON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "comment": "string"
}'
```

```json title="Response 201 Created" showLineNumbers=false wrap=false
{
  "comment_id": "string"
}
```

:::

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | string, required | Finding UUID or display id (KEY-FD-NUMBER, e.g. HAC-FD-1104). |

### Body

A required `application/json` body.

| Field | Type | Description |
| --- | --- | --- |
| `comment` | string, required | Comment text. At most 4000 characters. |

## Responses

### 201 Created

| Field | Type | Description |
| --- | --- | --- |
| `comment_id` | string, required | |
