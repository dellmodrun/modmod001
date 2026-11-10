---
title: MCP
description: Connect an AI assistant to Hacktron.
url: https://www.hacktron.ai/docs/mcp
---

# MCP

Hacktron's MCP server is at `https://mcp.hacktron.ai/mcp`. Choose your client and copy its configuration. You sign in to Hacktron in the browser, so no API key is required.

## Connect your client

::::::tabs

:::::tab[Claude Code]

Run this in a terminal:

```bash
claude mcp add --transport http hacktron https://mcp.hacktron.ai/mcp
```

Then authenticate the connection:

1. Start Claude Code in your project.
2. Type `/mcp`, select `hacktron`, and choose **Authenticate**.
3. Complete the Hacktron sign-in in the browser.

To use an API key instead, create an organisation API key with the [authentication guide](/docs/api/authentication#creating-an-api-key). Grant `read` and `write` access if your assistant should triage findings.

Run this in a terminal:

```bash
claude mcp add --transport http hacktron https://mcp.hacktron.ai/mcp --header "Authorization: Bearer hacktron_your_key_here"
```

:::warning
An API key is a long-lived secret. Store it in your client's secret settings, never commit it to source control, and grant the narrowest scope your workflow needs.
:::

:::::

:::::tab[Claude Desktop]

Add the server to Claude Desktop's configuration:

```json title="~/Library/Application Support/Claude/claude_desktop_config.json"
{
  "mcpServers": {
    "hacktron": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.hacktron.ai/mcp"]
    }
  }
}
```

Restart Claude Desktop to apply the change.

The first time Claude Desktop connects to Hacktron, complete the Hacktron sign-in in the browser. If the prompt doesn't appear, open Claude Desktop's MCP server settings and reconnect `hacktron`.

To use an API key instead, create an organisation API key with the [authentication guide](/docs/api/authentication#creating-an-api-key). Grant `read` and `write` access if your assistant should triage findings.

```json title="~/Library/Application Support/Claude/claude_desktop_config.json"
{
  "mcpServers": {
    "hacktron": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.hacktron.ai/mcp", "--header", "Authorization: Bearer hacktron_your_key_here"]
    }
  }
}
```

:::warning
An API key is a long-lived secret. Store it in your client's secret settings, never commit it to source control, and grant the narrowest scope your workflow needs.
:::

:::::

:::::tab[Cursor]

Add the server to Cursor's configuration:

```json title="~/.cursor/mcp.json"
{
  "mcpServers": {
    "hacktron": {
      "url": "https://mcp.hacktron.ai/mcp"
    }
  }
}
```

After saving, reload Cursor: press `Cmd+Shift+P` and choose **Reload Window**.

When Cursor asks you to authenticate `hacktron`, complete the Hacktron sign-in in the browser. You can also open Cursor's MCP settings, select `hacktron`, and start authentication from there.

To use an API key instead, create an organisation API key with the [authentication guide](/docs/api/authentication#creating-an-api-key). Grant `read` and `write` access if your assistant should triage findings.

```json title="~/.cursor/mcp.json"
{
  "mcpServers": {
    "hacktron": {
      "url": "https://mcp.hacktron.ai/mcp",
      "headers": {
        "Authorization": "Bearer hacktron_your_key_here"
      }
    }
  }
}
```

:::warning
An API key is a long-lived secret. Store it in your client's secret settings, never commit it to source control, and grant the narrowest scope your workflow needs.
:::

:::::

:::::tab[Codex]

Run this in a terminal:

```bash
codex mcp add hacktron --url https://mcp.hacktron.ai/mcp
```

Then authenticate the connection:

```bash
codex mcp login hacktron
```

Complete the Hacktron sign-in in the browser. In an interactive Codex session, type `/mcp` to check the server's connection and authentication status.

To use an API key instead, create an organisation API key with the [authentication guide](/docs/api/authentication#creating-an-api-key). Grant `read` and `write` access if your assistant should triage findings.

Add the key to your shell profile, `~/.zshrc` or `~/.bashrc`:

```bash
export HACKTRON_API_KEY=hacktron_your_key_here
```

Then register the server:

```bash
codex mcp add hacktron --url https://mcp.hacktron.ai/mcp --bearer-token-env-var HACKTRON_API_KEY
```

:::warning
An API key is a long-lived secret. Store it in your client's secret settings, never commit it to source control, and grant the narrowest scope your workflow needs.
:::

:::::

:::::tab[Antigravity]

Add the server to Antigravity's configuration:

```json title="~/.gemini/config/mcp_config.json"
{
  "mcpServers": {
    "hacktron": {
      "serverUrl": "https://mcp.hacktron.ai/mcp"
    }
  }
}
```

Click **Refresh** in the **MCP Servers** panel to apply the change.

Select `hacktron` in the **MCP Servers** panel and complete the Hacktron sign-in in the browser when asked.

:::::

::::::

## Tools

These tools let your AI assistant work with Hacktron. Each one has a [REST API](/docs/api) endpoint with the same operation and the same permission requirements.

Viewers can read scans and findings. Members can update findings and prepare pentests. Starting a pentest or changing the Review settings needs an organisation admin.

### Scans and findings

| Tool | Description |
| --- | --- |
| `list_scans`<br>[`GET /scans`](/docs/api/scans/list-scans) | List scans with their finding counts by severity |
| `get_scan`<br>[`GET /scans/{id}`](/docs/api/scans/get-scan) | Get the details of a scan |
| `export_findings`<br>[`GET /scans/{id}/findings/export`](/docs/api/scans/export-scan-findings) | Export a scan's findings as JSON, CSV, or SARIF |
| `stop_scan`<br>[`POST /scans/{id}/stop`](/docs/api/scans/stop-scan) | Stop a running scan or pentest |
| `list_findings`<br>[`GET /findings`](/docs/api/findings/list-findings) | List findings across your organisation |
| `count_findings`<br>[`GET /findings/counts`](/docs/api/findings/count-findings) | Count findings by severity, state, and repository |
| `get_finding`<br>[`GET /findings/{id}`](/docs/api/findings/get-finding) | Get the details of a finding |
| `update_finding`<br>[`PATCH /findings/{id}`](/docs/api/findings/update-finding) | Change a finding's state or severity |
| `add_finding_comment`<br>[`POST /findings/{id}/comments`](/docs/api/findings/add-finding-comment) | Post a comment on a finding |

### Whitebox

| Tool | Description |
| --- | --- |
| `list_repositories`<br>[`GET /repos`](/docs/api/repos/list-repos) | List the connected repositories |
| `request_archive_upload`<br>[`POST /archives/uploads`](/docs/api/archives/request-archive-upload) | Get a URL to upload a code archive to |
| `create_pentest_draft`<br>[`POST /pentests`](/docs/api/pentests/create-pentest) | Create a draft with code and optional live sites |
| `update_pentest_draft`<br>[`PATCH /pentests/{id}`](/docs/api/pentests/update-pentest) | Change a pentest that hasn't started |
| `verify_pentest_login`<br>[`POST /pentests/{id}/login-checks`](/docs/api/pentests/check-pentest-logins) | Check that Hacktron can sign in to each site |
| `estimate_pentest`<br>[`POST /pentests/{id}/estimate`](/docs/api/pentests/estimate-pentest) | Estimate a draft pentest's credit cost |
| `get_cost_estimation`<br>[`GET /cost-estimations/{id}`](/docs/api/cost-estimations/get-cost-estimation) | Get a pentest's cost estimate |
| `get_credit_balance`<br>[`GET /credits`](/docs/api/credits/get-credit-balance) | Read your organisation's Whitebox credit balance |
| `start_pentest`<br>[`POST /pentests/{id}/start`](/docs/api/pentests/start-pentest) | Start a pentest and spend its credits (admins only) |
| `discard_pentest_draft`<br>[`DELETE /pentests/{id}`](/docs/api/pentests/discard-pentest) | Delete a pentest that hasn't started |

### Review

| Tool | Description |
| --- | --- |
| `get_pr_review_settings`<br>[`GET /pr-review-settings`](/docs/api/repos/get-pr-review-settings) | Read your organisation's PR review settings |
| `update_pr_review_settings`<br>[`PATCH /pr-review-settings`](/docs/api/repos/update-pr-review-settings) | Change the review comments, the check's severity threshold, and the filters (admins only) |
| `set_pr_reviews`<br>[`POST /repos/pr-reviews`](/docs/api/repos/set-pr-reviews) | Turn PR reviews on or off for repositories (admins only) |

:::warning
For signed-in testing, your assistant sends the login details to Hacktron, which stores them encrypted. Anything you type in the conversation also goes to your assistant's model provider. Use dedicated test credentials.
:::

## Related

When you create an API key, you choose its access scopes. The REST API offers these operations to your own scripts and applications too.

:::tiles
- [Authentication](/docs/api/authentication): API keys and authenticated requests.
- [API overview](/docs/api): Programmatic access to Hacktron.
:::
