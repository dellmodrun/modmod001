---
title: Get batch verdicts
description: Verdicts for many packages at once.
url: https://www.hacktron.ai/docs/api/hfw/batch-verdicts
---

# Get batch verdicts

Returns fast dependency verdicts for a list of packages in a single request. Landing page scans and GitHub Action scans use it to flag known-malicious dependencies. Put the packages to check in the `packages` array of the request body.

To look up a single package instead, use [`GET /hfw/verdict/{ecosystem}/{packageName}`](/docs/api/hfw/get-package-verdict).

This is a public, fast-mode endpoint. It covers feed-backed verdicts only and returns straight away. It may move behind the `X-Api-Key` header later.

## Request

`POST /hfw/verdicts/batch`

This endpoint takes no API key.

:::examples

```bash title="Request" wrap=false
curl -X POST "https://api.hacktron.ai/v1/hfw/verdicts/batch" \
  -H "Content-Type: application/json" \
  -d '{
  "packages": [
    {
      "ecosystem": "npm",
      "package": "string",
      "version": "string"
    }
  ]
}'
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "status": "string",
  "verdicts": [
    {
      "status": "ready",
      "ecosystem": "npm",
      "package": "string",
      "version": "string",
      "level": "clean",
      "confidence": "string",
      "summary": "string",
      "findings": [
        {}
      ],
      "source": "string",
      "osv_id": "string"
    }
  ],
  "errors": [
    {}
  ]
}
```

:::

### Body

A required `application/json` body.

| Field | Type | Description |
| --- | --- | --- |
| `packages` | array of object, required | |
| `packages[].ecosystem` | string, required | One of `npm` or `pypi`. |
| `packages[].package` | string, required | |
| `packages[].version` | string, required | |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `status` | string, required | |
| `verdicts` | array of object, required | |
| `verdicts[].status` | string, required | One of `ready`, `pending`, or `scanning`. |
| `verdicts[].ecosystem` | string, required | One of `npm` or `pypi`. |
| `verdicts[].package` | string, required | |
| `verdicts[].version` | string, required | |
| `verdicts[].level` | string, required | One of `clean`, `suspicious`, `malicious`, or `unknown`. |
| `verdicts[].confidence` | string, required | |
| `verdicts[].summary` | string, required | |
| `verdicts[].findings` | array of object, required | |
| `verdicts[].source` | string | |
| `verdicts[].osv_id` | string | |
| `errors` | array of object, required | |
