---
title: Rate limits
description: Quotas, 429 responses, and backoff.
url: https://www.hacktron.ai/docs/api/rate-limits
---

# Rate limits

The Formant REST API limits the number of requests each API key can make.

## Limit

Each API key can make 100 requests per 60 seconds, counted across all REST endpoints.

The window rolls, with no fixed start or end time. After 100 requests at `t=0`, the API accepts the next request at about `t=60s`.

Requests authenticated with a dashboard session, not an API key, don't count against this limit.

## 429 responses

A key that goes over the limit gets `429 Too Many Requests`:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

The API rejects the request before it reaches the application, so the request body isn't consumed.

## Backing off

When a client gets a `429`, it should:

1. Stop sending requests with that key.
2. Retry with exponential backoff, for example after 1s, 2s, 4s, and 8s.
3. If it hits the limit consistently, spread the work over a longer window or ask Formant support for a higher quota.

For work that needs more sustained throughput, such as backfilling findings into an external system, email support at [founders@hacktron.ai](mailto:founders@hacktron.ai) with the use case.

## Concurrency and long-running scans

[`POST /scans`](/docs/api/scans/create-scan) queues the scan and returns straight away, so you don't hold a connection open while the scan runs. To follow a scan:

1. Call `POST /scans` to start it, and keep the `id` it returns.
2. Call [`GET /scans/{id}/status`](/docs/api/scans/get-scan-status) every 10 to 30 seconds to check progress.
3. Once `status` is `completed`, fetch the findings with [`GET /scans/{id}/findings`](/docs/api/scans/list-scan-findings) or [`GET /scans/{id}/findings/export`](/docs/api/scans/export-scan-findings).

Polling counts toward the rate limit, so poll no more often than every 10 seconds.
