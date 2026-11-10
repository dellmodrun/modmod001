---
title: List malware feed
description: Known-malware feed entries.
url: https://www.hacktron.ai/docs/api/hfw/osv-feed
---

# List malware feed

Returns entries from the known-malware feed, which Formant uses to generate the package sitemap. Page through the feed with the `limit` and `offset` query parameters.

This is a public endpoint.

## Request

`GET /hfw/osv/feed`

This endpoint takes no API key.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/hfw/osv/feed"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "total": 0,
  "results": [
    {
      "ecosystem": "string",
      "package": "string",
      "versions": [
        "string"
      ]
    }
  ]
}
```

:::

### Query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `limit` | number | Default `200`. At least 1. At most 500. |
| `offset` | number | Default `0`. At least 0. |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `total` | number | |
| `results` | array of object, required | |
| `results[].ecosystem` | string, required | |
| `results[].package` | string, required | |
| `results[].versions` | array of string, required | |
