---
title: Repositories
description: Choose the repositories to review.
url: https://www.hacktron.ai/docs/platform/repositories
---

# Repositories

**Repositories** is where you choose which codebases Hacktron can review once a Git integration is connected.

## Prerequisites

You need to be a Hacktron organisation admin to connect and configure repositories.

## Configure repositories

::::steps

### Connect a Git provider

Install Hacktron through GitHub, GitHub Enterprise Server, GitLab, Azure DevOps, or Bitbucket. During installation, choose the organisations and repositories Hacktron can access.

Each provider has its own guide. The GitHub guide covers GitHub Free, GitHub Team, and GitHub Enterprise Cloud. The GitHub Enterprise Server guide covers a self-hosted instance, the GitLab guide covers GitLab.com and self-hosted GitLab, the Azure DevOps guide covers Azure DevOps Services and Azure DevOps Server, and the Bitbucket guide covers Bitbucket Cloud.

:::tiles
- [GitHub](/docs/platform/repositories/github): Repository access for GitHub.com.
- [GitHub Enterprise Server](/docs/platform/repositories/github-enterprise-server): Connect a self-hosted GitHub server.
- [GitLab](/docs/platform/repositories/gitlab): Connect GitLab.com or self-hosted GitLab.
- [Azure DevOps](/docs/platform/repositories/azure-devops): Connect Azure DevOps Services or Server.
- [Bitbucket](/docs/platform/repositories/bitbucket): Connect Bitbucket Cloud.
:::

### Sync repositories

Hacktron pulls in every repository the integration has access to. If one is missing, update the provider installation first, then come back to Hacktron and sync again.

### Enable review coverage

Choose which repositories get pull request or merge request reviews, and on which branches.

::::

## Common checks

- If a repository does not appear, confirm that the Git provider installation includes it.
- If reviews are not running, confirm that the repository is enabled in Hacktron and that a trial or paid plan is active.
- If you recently added a private repository, open the **Repositories** page and click **Sync** to refresh the list.
