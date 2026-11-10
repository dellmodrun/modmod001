---
title: Request archive upload
description: Get an upload URL for a code archive.
url: https://www.hacktron.ai/docs/api/archives/request-archive-upload
---

# Request archive upload

Returns a signed URL for uploading a `.zip`, `.7z`, or `.tar.gz` source archive, for code that isn't in a connected repository. You need the member role or above.

1. Call this endpoint with the archive's `file_name`.
2. `PUT` the file to `upload_url`, with the `Content-Type` header set to the returned `content_type`.
3. Add `{ "source": "upload", "archive_id": "<id>" }` to `repos` when you create a pentest draft with [`POST /pentests`](/docs/api/pentests/create-pentest).

To pentest part of the archive, set `include_paths` or `exclude_paths` on its entry in `repos`. You can use the same uploaded archive.

:::note
Some self-hosted deployments return `400` because they don't support API uploads. In that case, upload the archive through the Hacktron web app.
:::

## Request

`POST /archives/uploads`

Send an [API key](/docs/api/authentication) with the `write` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl -X POST "https://api.hacktron.ai/v1/archives/uploads" \
  -H "X-Api-Key: $HACKTRON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "file_name": "my-project.zip"
}'
```

```json title="Response 201 Created" showLineNumbers=false wrap=false
{
  "id": "string",
  "upload_url": "string",
  "content_type": "application/zip"
}
```

:::

### Body

A required `application/json` body.

| Field | Type | Description |
| --- | --- | --- |
| `file_name` | string, required | Original filename (e.g. &quot;my-project.zip&quot;). |
| `name` | string | Display name (defaults to filename). |

## Responses

### 201 Created

| Field | Type | Description |
| --- | --- | --- |
| `id` | string, required | Archive ID. |
| `upload_url` | string, required | Signed GCS upload URL (PUT). |
| `content_type` | string, required | Content-Type to use in the PUT request. |
