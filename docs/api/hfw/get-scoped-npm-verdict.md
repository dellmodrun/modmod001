---
title: Get scoped npm package verdict
description: A verdict for a scoped npm package.
url: https://www.hacktron.ai/docs/api/hfw/get-scoped-npm-verdict
---

# Get scoped npm package verdict

Returns a fast dependency verdict for a scoped npm package, such as `@scope/name`. GitHub Action scans use it to flag known-malicious dependencies. `scope` and `packageName` are separate path segments, and the package `version` is a required query parameter.

For unscoped packages, use [`GET /hfw/verdict/{ecosystem}/{packageName}`](/docs/api/hfw/get-package-verdict).

This is a public, fast-mode endpoint. It covers feed-backed verdicts only and normally returns straight away. To wait briefly for an upstream verdict, set `wait_seconds`.

## Request

`GET /hfw/verdict/{ecosystem}/{scope}/{packageName}`

This endpoint takes no API key.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/hfw/verdict/<ecosystem>/<scope>/<packageName>?version=<version>"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
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
```

:::

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `ecosystem` | string, required | |
| `scope` | string, required | |
| `packageName` | string, required | |

### Query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `version` | string, required | Package version to check. |
| `wait_seconds` | number | Seconds to wait for an upstream verdict. Fast mode normally returns immediately. Default `0`. At least 0. At most 60. |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `status` | string, required | One of `ready`, `pending`, or `scanning`. |
| `ecosystem` | string, required | One of `npm` or `pypi`. |
| `package` | string, required | |
| `version` | string, required | |
| `level` | string, required | One of `clean`, `suspicious`, `malicious`, or `unknown`. |
| `confidence` | string, required | |
| `summary` | string, required | |
| `findings` | array of object, required | |
| `source` | string | |
| `osv_id` | string | |
