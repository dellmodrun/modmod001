---
title: Errors
description: Status codes and error shapes.
url: https://www.hacktron.ai/docs/api/errors
---

# Errors

The Hacktron REST API reports success and failure with standard HTTP status codes.

## Status codes

| Status | Meaning |
| --- | --- |
| `200` | A `GET` or `PATCH` succeeded. |
| `201` | A `POST` succeeded and created a resource. |
| `204` | The request succeeded and the response has no body, for example when revoking a key. |
| `400` | Bad request, usually a failed validation. `message` names the field that failed. |
| `401` | The API key is missing, malformed, revoked, or expired. |
| `402` | Payment required. [`POST /scans`](/docs/api/scans/create-scan) returns it when the organisation doesn't have enough Whitebox credits. |
| `403` | The API key doesn't have the required scope. |
| `404` | The resource doesn't exist, or your organisation can't see it. |
| `409` | Conflict, for example creating a key when the organisation already has the maximum number of active API keys. |
| `429` | Rate limit exceeded. See [Rate limits](/docs/api/rate-limits). |
| `500` | Unexpected server error. It is safe to retry with backoff. Contact support if it keeps happening. |

## Error body shape

Every error is JSON with the same shape:

```json
{
  "statusCode": 400,
  "message": "At least one repository is required",
  "error": "Bad Request"
}
```

A validation error can return `message` as an array, with one entry per field that failed:

```json
{
  "statusCode": 400,
  "message": [
    "repos must contain at least 1 elements",
    "cost_estimation_id must be a UUID"
  ],
  "error": "Bad Request"
}
```

## Common failure modes

### "This endpoint requires API key authentication (X-Api-Key header)"

The request reached a REST endpoint with a dashboard session token instead of an API key. REST endpoints under `/v1/*` need the `X-Api-Key` header.

### "API key authentication is only supported on /api/v1/rest/ endpoints"

You see this only when you call the backend route directly instead of the public API host. Use the public base URL from the [API overview](/docs/api) and call the `/v1/*` endpoints with `X-Api-Key`. Dashboard endpoints use session authentication and aren't part of this API reference.

### "API key missing required scope: write"

The key was created with only the `read` scope, and the request goes to a write endpoint. Create a new key that includes the `write` scope and retry.

### "Insufficient credits to start this scan"

The organisation doesn't have enough Whitebox credits for the requested scan. Top up in the dashboard, as [Credits and billing](/docs/whitebox/billing) describes, or submit a smaller cost estimation.

### "cost_estimation_id is required for pentest scans"

Inputs that only Whitebox pentests use, such as `target_urls`, `auth_instructions`, `custom_context`, or `context_document_ids`, need a cost estimation so that Hacktron deducts the right number of credits. Create a cost estimation first, then pass its `id` as `cost_estimation_id`.

### "Cost estimation is not ready"

The estimation is still `pending` or `running`. Poll [`GET /cost-estimations/{id}`](/docs/api/cost-estimations/get-cost-estimation) until its status is `completed` or `partial`, then start the scan.

### "Repository or archive ... was not included in the cost estimation"

The scan request doesn't match the repositories or uploaded archive that were estimated. Create a new estimate for the exact scope you want to scan.

### "Branch ... does not match the cost estimation branch"

The repository URL matches the estimate but the branch doesn't. Start the scan on the branch you estimated, or create a new estimate for the new branch.

### "Finding not found"

The finding doesn't exist, hasn't reached the approved verification state yet, or belongs to another organisation. Hacktron returns the same response in all three cases, so it doesn't leak information across tenants.
