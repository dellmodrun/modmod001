---
title: Export findings
description: Export findings from every scan.
url: https://www.hacktron.ai/docs/api/findings/export-findings
---

# Export findings

Exports findings from every scan in your organisation in one of three formats. It is the organisation-wide counterpart to [`GET /scans/{id}/findings/export`](/docs/api/scans/export-scan-findings), which covers a single scan. Only findings that have passed automated verification (`verification_status = approved`) are returned.

To export exactly the findings you're looking at, use the filters that [`GET /findings`](/docs/api/findings/list-findings) takes, including `severity`, `state`, `scan_type`, `found_since`, and `found_until`. To export a single repository, filter on `repo_url`.

## `format=json`

```http
Content-Type: application/json; charset=utf-8
```

Returns a JSON array of finding objects, each matching the schema in [`GET /findings`](/docs/api/findings/list-findings#200-ok).

## `format=csv`

```http
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="findings.csv"
```

Returns a CSV document with a header row and one row per finding, for spreadsheets, BI tools, and ad hoc review.

## `format=sarif`

```http
Content-Type: application/sarif+json; charset=utf-8
Content-Disposition: attachment; filename="findings.sarif"
```

Returns a [SARIF 2.1.0](https://sarifweb.azurewebsites.net/) document. GitHub code scanning, Azure DevOps, and most IDE security plugins read SARIF, so use this format to bring Hacktron findings into the security tooling you already use.

## Request

`GET /findings/export`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/findings/export?format=json" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

:::

### Query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `page` | number | The page number to retrieve. Default `1`. |
| `limit` | number | The number of items to retrieve per page. Default `100`. |
| `severity` | string | One of `critical`, `high`, `medium`, `low`, or `info`. |
| `state` | string | One of `open`, `true_positive`, `false_positive`, `accepted_risk`, `resolved`, or `closed`. |
| `scan_id` | string | |
| `scan_type` | string | Filter by scan type across all scans associated with the finding. One of `pr` or `full`. |
| `repo_url` | string | Filter by repository URL. Case-insensitive; a trailing slash or .git suffix is ignored. |
| `found_since` | string | Only include findings discovered on/after this ISO 8601 timestamp. |
| `found_until` | string | Only include findings discovered before this ISO 8601 timestamp. |
| `sort_by` | string | One of `found_at`, `updated_at`, or `severity`. |
| `sort_order` | string | One of `ASC` or `DESC`. Default `DESC`. |
| `format` | string, required | Export format. One of `json`, `csv`, or `sarif`. |

## Responses

### 200 OK
