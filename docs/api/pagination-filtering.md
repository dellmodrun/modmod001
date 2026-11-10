---
title: Pagination, filtering, and sorting
description: Shared query conventions for lists.
url: https://www.hacktron.ai/docs/api/pagination-filtering
---

# Pagination, filtering, and sorting

The list endpoints in the Formant REST API share one set of query parameters for pagination, sorting, and filtering.

## Pagination

Most list endpoints use page-based pagination:

| Parameter | Type | Default | Max | Description |
| --- | --- | --- | --- | --- |
| `page` | integer | `1` | | Page number, starting at 1. |
| `limit` | integer | `15` | `100` | Number of items per page. |

The response repeats the current `page` and `limit`, and adds `total`, which you can use to build pagination controls or to keep requesting pages until there are none left:

```json
{
  "data": [/* items for this page */],
  "total": 284,
  "page": 2,
  "limit": 50
}
```

To go through every page:

```bash
page=1
while : ; do
  curl -s "https://api.hacktron.ai/v1/findings?page=$page&limit=100" \
    -H "X-Api-Key: $HACKTRON_API_KEY"
  # ... extract data, break when (page * limit) >= total
  page=$((page + 1))
done
```

:::note
Cost estimations use offset-based pagination instead, with `limit` (default `50`, max `100`) and `offset` (default `0`). The [List cost estimations](/docs/api/cost-estimations/list-cost-estimations) page says so too.
:::

## Sorting

Endpoints that sort take two parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `sort_by` | enum | The field to sort by. Valid values depend on the endpoint. |
| `sort_order` | enum | `ASC` or `DESC`. Defaults to `DESC`. |

Each list endpoint documents its `sort_by` values. For example:

- [List scans](/docs/api/scans/list-scans) sorts by `created_at`, `updated_at`, or `status`.
- [List findings](/docs/api/findings/list-findings) sorts by `found_at`, `updated_at`, or `severity`.

Without `sort_by`, the endpoint uses its own default, which its page gives.

## Filtering

Filters are extra query parameters. Each list endpoint documents the filters it supports, and they follow the patterns below.

### Enum filters

An enum filter takes the canonical value in lower snake case and returns only the records that match it:

```text
# Only critical findings
GET /findings?severity=critical

# Only scans that have finished successfully
GET /scans?status=completed
```

### Scoped filters

Some filters limit the results to one related resource:

```text
# Findings for a specific scan
GET /findings?scan_id=123e4567-e89b-12d3-a456-426614174000
```

A scoped filter checks that the resource it names belongs to your organisation. If the resource doesn't exist or the key can't see it, the endpoint returns `404`.

### Combining filters

Several filters combine with AND:

```text
GET /findings?severity=high&state=open&scan_id=...
```

There is no OR operator. To get a union, call the endpoint once for each set of filters and merge the results in your client.

## Example

Fetch the 25 open high-severity findings that were updated most recently:

```bash
curl "https://api.hacktron.ai/v1/findings?severity=high&state=open&sort_by=updated_at&sort_order=DESC&page=1&limit=25" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```
