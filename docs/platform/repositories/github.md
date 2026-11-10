---
title: GitHub
description: Repository access for GitHub.com.
url: https://www.hacktron.ai/docs/platform/repositories/github
---

# GitHub

This guide covers GitHub Free, GitHub Team, and GitHub Enterprise Cloud.

## Prerequisites

To install the Hacktron GitHub App, you need to be an owner of the GitHub organisation or an admin of the repositories you want to connect, or have permission from an owner or admin.

If you are neither, you can still follow the steps below. GitHub prompts you to request approval from an organisation owner, and once they approve, Hacktron is installed for the selected repositories.

## Configure access

::::steps

### Open Integrations

In Hacktron, go to **Integrations** and choose the GitHub connection.

### Start the GitHub App installation

Click **Connect**, then **Install app** in the dialog. Your browser redirects to GitHub.com.

![The GitHub dialog in Hacktron's Integrations, with the button that installs the app](https://www.hacktron.ai/shots/platform/repositories/github/github_install_app/light.7b2df2d8.webp)

### Sign in to GitHub

If GitHub asks you to sign in, enter your GitHub credentials as usual.

### Select an organisation

Choose the organisation to install Hacktron in. If you belong to several, select it from the list. For personal repositories, select your account name.

### Select repositories

Choose which repositories Hacktron can access:

- **All repositories** grants access to every current and future repository the organisation owns, public repositories included.
- **Only select repositories** limits access to the repositories you pick from the list.

:::tip
You can change this later.
:::

### Review and authorise permissions

Review the permissions, then click **Install & Authorize**.

:::note
Hacktron asks for read access to members and metadata, and read and write access to checks, code, issues, and pull requests. It needs them for Review, issue management, and opening pull requests. Hacktron keeps no source code once each review is complete.
:::

:::tip
If you are not an organisation owner or repository admin, the button says **Authorize & Request** instead. Click it to request approval from an organisation owner.
:::

::::

Hacktron then reviews every pull request in the selected repositories.
