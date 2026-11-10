---
title: Authentication
description: API keys and authenticated requests.
url: https://www.hacktron.ai/docs/api/authentication
---

# Authentication

Every request to the Formant REST API carries an API key in the `X-Api-Key` header.

Each key belongs to exactly one organisation, so you never pass an organisation ID alongside it. Each key also declares one or more [scopes](#scopes) (`read`, `write`, `delete`), which decide the endpoints it can call.

:::note
To connect an AI assistant such as Claude, Cursor, or Codex instead of calling the API directly, follow the [MCP](/docs/mcp) guide. The MCP server accepts one of these API keys or signs you in with OAuth.
:::

## Creating an API key

You create API keys in the Formant dashboard, and you need the **Admin** or **Owner** role in the organisation the key is for.

1. Sign in to [app.hacktron.ai](https://app.hacktron.ai) and switch to the organisation the key should belong to.
2. Open **Settings**, then **API keys**.
3. Click **Create API key**.
4. Give the key a name that says what uses it, such as `ci-pipeline` or `backstage-integration`.
5. Choose the smallest set of [scopes](#scopes) your integration needs.
6. Set an expiration date if you want one.
7. Click **Create**.

:::warning
The dashboard shows the full key only once, right after you create it. Copy it into a secret manager straight away. If you lose it, revoke the key and create a new one.
:::

An organisation can have at most 10 active API keys at a time. If you reach the limit, revoke keys you no longer use before you create more.

### Key format

A Formant API key looks like this:

```text
hacktron_3s9K1sP7m2nXvT8YhLq0ZbW4...
```

Every key starts with `hacktron_`. Formant stores the first 12 characters (`hacktron_3s9` here) as a non-secret prefix, so you can recognise a key in your logs and in the dashboard. It never stores the full key, only its SHA-256 hash.

## Making authenticated requests

Send the key in the `X-Api-Key` header on every request:

```bash
curl https://api.hacktron.ai/v1/scans \
  -H "X-Api-Key: hacktron_3s9K1sP7m2nXvT8YhLq0ZbW4..."
```

:::tip
Keep API keys out of source control and client-side code. Load them at runtime from environment variables or a secret manager.
:::

## Scopes

A key's scopes decide what it can do. You choose them when you create the key and can't change them afterwards, so create a new key when you need different scopes.

| Scope | Grants access to |
| --- | --- |
| `read` | All `GET` endpoints: list and read scans, findings, and cost estimations. |
| `write` | Endpoints that change data: trigger scans, create cost estimations, update findings, and add comments. Includes `read` for the same resources. |
| `delete` | Reserved for future use. |

Each endpoint in this reference names the scope it requires. A key without that scope gets `403 Forbidden`.

## Revoking a key

You can revoke a key at any time in the dashboard, under **Settings** and then **API keys**. Revocation is immediate: the next request with that key fails with `401 Unauthorized`.

The dashboard's audit trail keeps revoked keys, with the time each was last used. A revoked key can never be reactivated.

## Testing your key

To check that a key works, list scans:

```bash
curl https://api.hacktron.ai/v1/scans?limit=1 \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

A working key gets HTTP `200` and a JSON body with `data`, `total`, `page`, and `limit` fields.

:::tip
You can also try endpoints in the Swagger UI at [api.hacktron.ai/docs](https://api.hacktron.ai/docs). Its **Authorize** button takes an `X-Api-Key` value and keeps it for the requests that follow.
:::

These are the usual failures:

| Status | Meaning |
| --- | --- |
| `401` | The API key is missing, malformed, revoked, or expired. |
| `403` | The key is valid but doesn't have the required scope. |
| `429` | The key has hit its rate limit. See [Rate limits](/docs/api/rate-limits). |
