---
title: Repository configuration
description: Set what Review scans and blocks.
url: https://www.hacktron.ai/docs/review/config
---

# Repository configuration

A `.hacktron/config.yaml` file in your repository controls how Review treats its pull and merge requests. It can:

- exclude specific pull and merge requests, so they aren't scanned
- include only specific pull and merge requests in scanning
- fail the Formant check when a finding meets a severity threshold, so risky changes can't merge

[`.hacktron/rules.md`](/docs/review/rules) is separate: it shapes the quality of a review. `config.yaml` decides whether a pull request is scanned and whether its check passes.

:::tip
To override these rules on a single pull request, comment `@hacktronai review` to force a scan.
:::

## Configuration hierarchy

Each category (`exclude.*`, `include.*`, `fail_on.severity`) is resolved on its own, not the whole file at once:

1. `config.yaml` is used if the repository sets that category.
2. [Organization settings](/docs/platform/organization-settings#scan-filters) are used otherwise.

The [FAQ](#faq) works through examples of how repository and organisation settings combine.

## File location

Place the file in the `.hacktron` directory at the root of the repository:

```text
.hacktron/
  config.yaml
  rules.md
apps/
packages/
package.json
```

Formant accepts either `.hacktron/config.yaml` or `.hacktron/config.yml`. If both exist, it uses `.yaml`.

:::warning
Formant always reads `config.yaml` from the repository's default branch (for example `main`), never from the pull or merge request being scanned, so a pull request can't change its own scanning rules. Commit `config.yaml` to the default branch for it to take effect.
:::

## Example

```yaml title=".hacktron/config.yaml"
# Exclude a PR/MR from being scanned when any rule below matches.
exclude:
  labels:
    - hacktron-exclude
  keywords:
    - "[exclude hacktron]"
  paths:
    - "vendor/**"
    - "**/*.md"
  authors:
    - dependabot[bot]

# Fail the Formant check when a finding is at or above this severity.
fail_on:
  severity: high
```

Every key is optional. An empty or missing `config.yaml` doesn't turn filtering off, because the organisation's filters still apply (see [configuration hierarchy](#configuration-hierarchy)). With no repository or organisation filters set, Formant scans every covered pull request, and the check stays green unless the scan itself fails with an error.

## Exclude scans

The `exclude` block tells Formant not to scan a pull or merge request. A match records a skipped check and uses no developer seat.

:::note
Formant reviews changes from a bot automatically only when the provider identifies the bot as trusted for the target repository. Untrusted bots and outside contributors aren't scanned automatically. Eligible bots follow the same filters and seat rules as other authors. Add a bot's username to `exclude.authors` to skip its future changes.
:::

Formant checks the rules in this order, and the first match applies:

| Key | Matches when | Match style |
| --- | --- | --- |
| `exclude.branches` | the PR/MR targets one of these branches | case-insensitive glob |
| `exclude.labels` | the PR/MR carries one of these labels | case-insensitive exact match |
| `exclude.keywords` | the PR/MR title contains one of these strings | case-insensitive substring |
| `exclude.paths` | every changed file matches one of these patterns | case-insensitive glob |
| `exclude.authors` | the PR/MR was opened by an author matching one of these patterns | case-insensitive glob |
| any key set to `[]` | clears the organisation's default for that key ([configuration hierarchy](#configuration-hierarchy)) | |

:::note
Bitbucket pull requests have no labels, so `exclude.labels` and `include.labels` don't apply on Bitbucket. The author filters, `exclude.authors` and `include.authors`, match the author's Bitbucket nickname, not their display name, so list authors by nickname.
:::

```yaml title=".hacktron/config.yaml"
exclude:
  branches:
    - "release/legacy/**" # exclude PRs targeting a legacy release branch
  labels:
    - hacktron-exclude # label the PR "hacktron-exclude" to exclude it
  keywords:
    - "[exclude hacktron]" # put this anywhere in the PR/MR title to exclude it
  paths:
    - "docs/**" # exclude when the PR only touches these paths
    - "**/*.md"
  authors:
    - "dependabot[bot]" # exclude all PRs opened by dependabot
    - "*-bot" # glob: exclude any author ending in "-bot"
```

:::note
`exclude.paths` skips a scan only when every changed file matches one of the patterns. If even one changed file falls outside them, the pull request is scanned as usual. The patterns use the same glob syntax as `exclude.branches`, for example `vendor/**`, `**/*.md`, or `docs/**`.
:::

### Glob pattern syntax

`exclude.branches`, `exclude.paths`, `exclude.authors`, `include.authors`, and `include.branches`, and the organisation-wide equivalents of each, accept glob patterns mixed with literals. Matching is case-insensitive.

| Syntax | Meaning | Example |
| --- | --- | --- |
| `*` | Any number of characters within one path segment | `*-bot` |
| `**` | Any number of characters, including across `/` | `release/**` |
| `?` | Exactly one character | `release/?.x` |
| `{a,b}` | One of the comma-separated alternatives | `{dependabot,renovate}[bot]` |

For author names, `*` and `**` usually behave the same, because author names don't contain `/`. The characters `[`, `]`, and a leading `!` are literal. Bracket classes, negation, nested braces, and extended glob forms such as `@(a|b)` aren't supported.

The same limits apply to repository and organisation settings:

- up to 50 entries in each filter category
- up to 100 characters in each pattern
- up to five `*` characters in each pattern
- up to 10 comma-separated alternatives in one brace expression

If a repository pattern goes over these limits, Formant treats the repository's configuration as invalid and scans with the [fail-open behaviour](#how-invalid-configuration-is-handled) described below.

### Matching nested branches with `*` and `**`

`*` matches within one path segment, and `**` also crosses `/`.

| Pattern | Matches | Doesn't match |
| --- | --- | --- |
| `release/*` | `release/foo` | `release/foo/bar` |
| `release/**` | `release/foo`, `release/foo/bar` | nothing |
| `release/legacy/**` | `release/legacy/1`, `release/legacy/1/hotfix` | `release/other/1` |

Use `release/*` for one-level branches such as `release/2.4`, and `release/**` for any depth. Add a literal segment, as in `release/legacy/**`, to target only that subtree.

Combine `exclude` and `include` to leave out a subtree: `include.branches: ["release/**"]` with `exclude.branches: ["release/legacy/**"]` scans every release branch except `release/legacy/**`.

## Include scans

The `include` block scans only the pull and merge requests that match its rules. On the ones it doesn't scan, Formant records a skipped check and, if [comments to source control](/docs/platform/organization-settings#post-comments-to-source-control) are on, posts a skip comment.

```yaml title=".hacktron/config.yaml"
include:
  branches:
    - "main"
    - "release/**" # only scan PRs targeting main or a release branch
  labels:
    - security-review # only scan PRs labelled "security-review"
  authors:
    - alice # ...and were opened by Alice, Bob, or a bot account
    - bob
    - "*-bot"
  keywords:
    - "please review" # ...and title contains "please review"
```

| Key | Matches when |
| --- | --- |
| `include.branches` | the PR/MR targets one of these branches (case-insensitive glob) |
| `include.labels` | the PR/MR carries at least one of these labels (case-insensitive exact match) |
| `include.authors` | the PR/MR was opened by an author matching one of these patterns (case-insensitive glob) |
| `include.keywords` | the PR/MR title contains one of these strings (case-insensitive substring) |
| any key set to `[]` | clears the organisation's default for that key ([configuration hierarchy](#configuration-hierarchy)) |

Within a category, any value matches: `include.labels: [feature, bugfix]` matches either label. Across categories, `include` needs every category to match: `include.branches: [main]` with `include.authors: [alice]` scans only Alice's pull requests to `main`.

:::note
`exclude` and `include` can target the same category. [Glob pattern syntax](#glob-pattern-syntax) lists the supported patterns.
:::

## Fail the check on findings

By default, the Formant check is green as long as the scan completes, and findings are posted as inline comments that don't block the merge. Set a severity threshold to turn the check red when a finding is at or above that level.

![A pull request whose Formant check failed on a finding](https://www.hacktron.ai/shots/review/config/fail_on_failure_example/light.b312ebca.webp)

The threshold is inclusive: `high` fails the check on `high` and `critical` findings, while `critical` fails it only on `critical` ones.

:::note
Only open findings and findings confirmed as valid count toward the threshold. [Triaging](/docs/review/findings-feedback#triage-comments) a finding recomputes the check immediately.
:::

You can set the threshold for the whole organisation in the settings, or for one repository in `config.yaml` (see [configuration hierarchy](#configuration-hierarchy)).

::::tabs

:::tab[Organisation-wide]

Set a default for every repository in your organisation in [Organization settings](/docs/platform/organization-settings#check-gate).

:::

:::tab[Per repository]

Add a `fail_on` block to `.hacktron/config.yaml` to set or override the threshold for one repository:

```yaml title=".hacktron/config.yaml"
fail_on:
  severity: high   # fail the check on any high or critical finding
```

`severity` is one of these values, from most to least severe: `critical`, `high`, `medium`, `low`, and `info`.

:::

::::

## How invalid configuration is handled

Formant is **fail-open** about configuration:

- A missing, empty, or malformed `config.yaml` is ignored. Formant scans normally and the check stays green.
- Unknown keys are ignored, so a configuration can carry settings for future features without breaking today's scans.
- A value of the wrong type on a known key, such as `fail_on.severity: 7`, makes Formant ignore the whole file. Keep values in the shapes shown above.

## FAQ

:::details[My organisation requires a label to scan pull requests. Can one repository drop that rule?]

The organisation's default is `include.labels: [security-review]`, so only pull requests labelled `security-review` are scanned.

A repository can set its own `include.labels: [needs-review]` in `config.yaml` to require a different label, or set `include.labels: []` to remove the requirement and scan pull requests whatever their labels. Either way, the repository's setting replaces the organisation's rule rather than merging with it.

:::

:::details[Can a repository use a different threshold from the organisation?]

The organisation's default is `fail_on.severity: critical`.

A repository that handles payment code wants to fail on more than critical findings, so it sets `fail_on.severity: high` in `config.yaml`. That repository's check now turns red on `high` or `critical` findings, and every other repository keeps using `critical`.

:::

:::details[If a repository sets only one filter, does it lose the rest of the organisation's filters?]

No. Each filter category (`exclude.branches`, `exclude.labels`, `include.branches`, and so on) is inherited on its own.

The organisation's default is `exclude.labels: [wip]`. A repository adds `exclude.branches: [release/legacy/**]` but doesn't set `exclude.labels`. That repository now excludes legacy release branches and still excludes pull requests labelled `wip`. The organisation's label rule keeps applying because the repository never overrode it.

:::

## Related

:::tiles
- [Project rules](/docs/review/rules): Give reviews context in rules.md.
- [Setup](/docs/review/setup): Enable repositories and branches.
:::
