---
title: List repositories
description: Repositories from every provider.
url: https://www.hacktron.ai/docs/api/repos/list-repos
---

# List repositories

Returns every repository from all of your connected providers (GitHub, GitLab, Azure DevOps, and Bitbucket), and for each one whether automatic pull request reviews are on.

Use it to find the repositories available to your organisation before you start a pentest with [`POST /scans`](/docs/api/scans/create-scan) or a cost estimation with [`POST /cost-estimations`](/docs/api/cost-estimations/create-cost-estimation), and to confirm which repositories have pull request reviews turned on.

## Request

`GET /repos`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/repos" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "repos": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "provider": "github",
      "name": "octocat/Hello-World",
      "providerKey": "octocat/Hello-World",
      "enabled": true,
      "threatModelUpdatedAt": "2026-06-22T12:00:00.000Z",
      "openFindingsCount": 3,
      "lastScanAt": "2026-09-15T12:00:00.000Z",
      "ossApproved": true,
      "prScansEnabled": true,
      "prScanBranches": [
        "main",
        "**/release/**"
      ],
      "installationId": 12345678,
      "baseUrl": "https://ghe.example.com",
      "defaultBranch": "main",
      "visibility": "private",
      "webhookRegistered": true,
      "isPrivate": true
    }
  ],
  "errors": []
}
```

:::

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `repos` | array of object, required | Unified list of repositories from all providers. |
| `repos[].id` | string, required | Internal UUID. |
| `repos[].provider` | string, required | Source provider. One of `github`, `gitlab`, `bitbucket`, or `azure`. |
| `repos[].name` | string, required | Display name (owner/repo for GitHub, namespace/project for GitLab, workspace/slug for Bitbucket, project/repository for Azure DevOps). |
| `repos[].providerKey` | string, required | Provider-native identifier for mutation endpoints. GitHub: owner/repo, GitLab: numeric projectId (as string), Bitbucket: repository UUID, Azure DevOps: repository UUID. |
| `repos[].enabled` | boolean, required | Whether the repository is enabled for scanning. |
| `repos[].threatModelUpdatedAt` | string, required, nullable | ISO timestamp of the repo's most recent threat_model.md update, or null if it has none. Repos are returned ordered by this (most recent first; repos without a threat model last). |
| `repos[].openFindingsCount` | number, required | Number of approved, visible findings that remain open for this repository. |
| `repos[].lastScanAt` | string, required, nullable | ISO timestamp of the most recent completed scan containing this repository, or null if it has not been scanned. |
| `repos[].ossApproved` | boolean | Whether this github.com repository is approved for free OSS PR reviews. Independent of whether PR scans are enabled. |
| `repos[].prScansEnabled` | boolean | Whether PR/MR scans are enabled (GitHub and GitLab). |
| `repos[].prScanBranches` | array of string | Target branch patterns for PR/MR scans (GitHub and GitLab). |
| `repos[].installationId` | number | GitHub App installation ID (GitHub only). |
| `repos[].baseUrl` | string, nullable | GitHub Enterprise base URL for self-hosted (PAT) installations (null/absent for github.com), the GitLab installation URL, or the Azure DevOps organization URL. Clients should build clone/display URLs from this host instead of assuming the public provider host. |
| `repos[].defaultBranch` | string | Default branch (GitLab only). |
| `repos[].visibility` | string | Project visibility (GitLab only). |
| `repos[].webhookRegistered` | boolean | Whether a webhook is registered for this project (GitLab only). |
| `repos[].isPrivate` | boolean | Whether the repository is private (Bitbucket only). |
| `errors` | array of string, required | Providers that failed to respond. |
