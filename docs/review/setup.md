---
title: Setup
description: Enable repositories and branches.
url: https://www.hacktron.ai/docs/review/setup
---

# Setup

Set up Review after you create a Hacktron organisation and connect your Git provider. Two things control which repositories Hacktron can review: first the Git provider installation, then the repositories and branches you enable in Hacktron.

## Prerequisites

You need to be a Hacktron organisation admin to configure repositories. You also need permission to connect your Git provider. Each provider's page, linked in the first step, has the details.

## Configure Review

::::steps

### Connect a Git provider

Open **Integrations** and connect GitHub, GitHub Enterprise Server, GitLab, Azure DevOps, or Bitbucket. GitHub.com repositories use the Hacktron GitHub App. GitLab connects through a service account and a personal access token. Azure DevOps works with both Azure DevOps Services and Azure DevOps Server, and Bitbucket Cloud connects through a repository administrator account.

:::tiles
- [GitHub](/docs/platform/repositories/github): Repository access for GitHub.com.
- [GitHub Enterprise Server](/docs/platform/repositories/github-enterprise-server): Connect a self-hosted GitHub server.
- [GitLab](/docs/platform/repositories/gitlab): Connect GitLab.com or self-hosted GitLab.
- [Azure DevOps](/docs/platform/repositories/azure-devops): Connect Azure DevOps Services or Server.
- [Bitbucket](/docs/platform/repositories/bitbucket): Connect Bitbucket Cloud.
:::

### Enable repository coverage

Open **Repositories** and choose which repositories receive pull request or merge request reviews.

![Repositories, with a PR Scans toggle for each repository](https://www.hacktron.ai/shots/review/setup/repositories_pr_scans/light.0c7a7c64.webp)

### Choose covered branches

Hacktron reviews all branches by default. To restrict this for the whole organisation, use [Organization settings](/docs/platform/organization-settings#scan-filters). To restrict it for one repository, set `exclude.branches` or `include.branches` in `.hacktron/config.yaml`. [Repository configuration](/docs/review/config) has the syntax.

### Trigger your first review

This step is optional. On an existing pull request or merge request, comment `@hacktronai review`. Hacktron starts a security review of that pull request or merge request immediately.

:::tip
From now on, Hacktron reviews every configured repository and branch automatically, whether or not you trigger a first review.
:::

::::

You don't need to invite every developer before reviews can start. Hacktron discovers developers from repository activity as reviews run.

## Billing and usage

Review needs an active trial or paid subscription before reviews can run. Every organisation gets a 14-day free trial. [Billing](/docs/review/billing) covers starting the trial and managing the subscription, and [Usage](/docs/review/usage) covers pooled review limits and overage.

:::tiles
- [Billing](/docs/review/billing): Trial, seats, overage, and plans.
- [Usage](/docs/review/usage): Pooled limits and overage billing.
:::

## Common checks

- If setup was skipped during onboarding, connect the Git provider before you expect reviews to run.
- If a repository doesn't appear, confirm that the Git provider installation includes it.
- If a pull request isn't reviewed, confirm that the repository is enabled and the target branch is covered.
- If review capacity is unavailable, check **Billing** and **Usage**.
