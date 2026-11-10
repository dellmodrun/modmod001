---
title: Review
description: Review every pull and merge request.
url: https://www.hacktron.ai/docs/review
---

# Review

Review checks the pull requests and merge requests in the repositories you enable. Formant reads each change with the repository's context and looks for exploitable vulnerabilities. By default, it comments on the affected code, so engineers can fix issues before merge.

Use Review for continuous security coverage of day-to-day development. For a broader, scoped assessment of a repository or application, use [Whitebox](/docs/whitebox).

Set Review up in this order: enable repositories and branches in Setup, connect [project management apps](/docs/platform/project-management) to send findings to Jira or Linear and [communication apps](/docs/platform/communication-apps) to send notifications to Slack, then improve reviews with context through findings feedback and project rules.

## Getting started

:::tiles
- [Setup](/docs/review/setup): Enable repositories and branches.
- [Billing](/docs/review/billing): Trial, seats, overage, and plans.
:::

## Management

:::tiles
- [People](/docs/review/people): Manage seats and developer access.
- [Usage](/docs/review/usage): Pooled limits and overage billing.
- [Project rules](/docs/review/rules): Give reviews context in rules.md.
- [Repository configuration](/docs/review/config): Set what Review scans and blocks.
:::

## Integrations

:::tiles
- [Slack](/docs/review/integrations/slack): Manage findings from Slack.
- [GitHub and GitLab](/docs/review/integrations/github-gitlab): Enable Review or link your seat.
:::

## Operations

:::tiles
- [Findings and feedback](/docs/review/findings-feedback): Read findings and give feedback.
- [Troubleshooting](/docs/review/troubleshooting): Why a pull request wasn't reviewed.
:::

## Scan limits

Each pull or merge request scan covers up to 500 changed files. Formant skips larger pull and merge requests.

[Enable reviews on every pull and merge request](/docs/review/setup#configure-review) so smaller changes are reviewed before they reach a large deployment pull request.
