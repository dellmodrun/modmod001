---
title: Export scan findings
description: A scan's findings as JSON, CSV, or SARIF.
url: https://www.hacktron.ai/docs/api/scans/export-scan-findings
---

# Export scan findings

Returns every approved finding for a scan in one of three formats. Unlike [`GET /scans/{id}/findings`](/docs/api/scans/list-scan-findings), this endpoint isn't paginated, so every finding comes back in one response.

## `format=json`

```http
Content-Type: application/json; charset=utf-8
```

Returns a JSON array of finding objects, each matching the schema in [`GET /findings`](/docs/api/findings/list-findings#200-ok).

## `format=csv`

```http
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="findings-<scanId>.csv"
```

Returns a CSV document with a header row and one row per finding, for spreadsheets, BI tools, and ad hoc review.

## `format=sarif`

```http
Content-Type: application/sarif+json; charset=utf-8
Content-Disposition: attachment; filename="findings-<scanId>.sarif"
```

Returns a [SARIF 2.1.0](https://sarifweb.azurewebsites.net/) document. GitHub code scanning, Azure DevOps, and most IDE security plugins read SARIF, so use this format to bring Formant findings into the security tooling you already use.

## Request

`GET /scans/{id}/findings/export`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/scans/<id>/findings/export?format=json" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

:::

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | string, required | |

### Query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `format` | string, required | Export format. One of `json`, `csv`, or `sarif`. |

## Responses

### 200 OK
