---
title: Get PR review settings
description: Read your review settings.
url: https://www.hacktron.ai/docs/api/repos/get-pr-review-settings
---

# Get PR review settings

Returns the pull request review settings configured for your organisation under **Settings** in Formant:

- `scm_comments_enabled` says whether reviews post comments and finding details on pull and merge requests.
- `scm_system_comments_enabled` says whether reviews also post system comments, such as skipped reviews, usage limits, and configuration warnings.
- `fail_on_severity` is the severity at or above which a finding fails the pull request check, or `null` when the check never fails.
- `scan_include_*` and `scan_exclude_*` choose which pull requests are reviewed, by target branch, label, author, and title keyword. `null` means no filter.

A repository's [`.hacktron/config.yaml`](/docs/review/config) takes precedence over these defaults. To check whether reviews are on for a repository, read its `prScansEnabled` value from [`GET /repos`](/docs/api/repos/list-repos).

## Request

`GET /pr-review-settings`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/pr-review-settings" \
  -H "X-Api-Key: $HACKTRON_API_KEY" \
  -H "X-Organization-Id: <X-Organization-Id>"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "scm_comments_enabled": true,
  "scm_system_comments_enabled": true,
  "fail_on_severity": "critical",
  "scan_include_branches": [
    "main",
    "**/release/**"
  ],
  "scan_exclude_branches": [
    "**/release/legacy/**"
  ],
  "scan_include_labels": [
    "feature",
    "bugfix"
  ],
  "scan_exclude_labels": [
    "wip",
    "no-scan"
  ],
  "scan_include_authors": [
    "alice",
    "bob"
  ],
  "scan_exclude_authors": [
    "dependabot[bot]",
    "renovate[bot]",
    "*-bot"
  ],
  "scan_include_keywords": [
    "release",
    "security"
  ],
  "scan_exclude_keywords": [
    "[exclude hacktron]",
    "wip"
  ]
}
```

:::

### Headers

| Parameter | Type | Description |
| --- | --- | --- |
| `X-Organization-Id` | string, required | Organization ID. |

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `scm_comments_enabled` | boolean | Whether Formant publishes comments and finding details to connected source control pull and merge requests. |
| `scm_system_comments_enabled` | boolean | Whether Formant posts system comments such as skipped reviews, usage limits, and configuration warnings. Defaults to true. Requires scm_comments_enabled. |
| `fail_on_severity` | string, nullable | Org-wide default fail_on severity threshold for PR/MR checks. A repo's .hacktron/config.yaml fail_on.severity overrides this. Send null to disable. One of `critical`, `high`, `medium`, `low`, or `info`. |
| `scan_include_branches` | array of string, nullable | Org-wide default target branch patterns to scan PRs/MRs for (null = all branches). Glob patterns (`*`, `**`, `?`, `{a,b}`), case-insensitive. A repo's .hacktron/config.yaml include.branches overrides this. |
| `scan_exclude_branches` | array of string, nullable | Org-wide default target branch patterns to exclude from PR/MR scans (null = none). Takes precedence over scan_include_branches. A repo's .hacktron/config.yaml exclude.branches overrides this. |
| `scan_include_labels` | array of string, nullable | Org-wide default labels to require on PRs/MRs for scanning (null = any). A repo's .hacktron/config.yaml include.labels overrides this. |
| `scan_exclude_labels` | array of string, nullable | Org-wide default labels to exclude PR/MR scans for (null = none). Takes precedence over scan_include_labels. A repo's .hacktron/config.yaml exclude.labels overrides this. |
| `scan_include_authors` | array of string, nullable | Org-wide default author patterns to require on PRs/MRs for scanning (null = any). Glob patterns (`*`, `**`, `?`, `{a,b}`), case-insensitive. A repo's .hacktron/config.yaml include.authors overrides this. |
| `scan_exclude_authors` | array of string, nullable | Org-wide default author patterns to exclude PR/MR scans for (null = none). Glob patterns (`*`, `**`, `?`, `{a,b}`), case-insensitive. Takes precedence over scan_include_authors. A repo's .hacktron/config.yaml exclude.authors overrides this. |
| `scan_include_keywords` | array of string, nullable | Org-wide default title keywords to require on PRs/MRs for scanning (null = any). Case-insensitive substring match. A repo's .hacktron/config.yaml include.keywords overrides this. |
| `scan_exclude_keywords` | array of string, nullable | Org-wide default title keywords to exclude PR/MR scans for (null = none). Case-insensitive substring match. A repo's .hacktron/config.yaml exclude.keywords overrides this. |
