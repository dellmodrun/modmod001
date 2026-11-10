---
title: GitHub Enterprise Server
description: Connect a self-hosted GitHub server.
url: https://www.hacktron.ai/docs/platform/repositories/github-enterprise-server
---

# GitHub Enterprise Server

This guide is for GitHub Enterprise Server customers with a custom domain. Organisations on GitHub.com use the [GitHub](/docs/platform/repositories/github) guide instead.

## Configure access

You can give Hacktron access to a GitHub Enterprise Server instance in two ways:

| Method | Used for |
| --- | --- |
| [GitHub App](#configure-github-app) (recommended) | Whitebox pentests, and Review for the repositories you select |
| [Personal access token](#configure-a-personal-access-token) | Whitebox pentests only |

The GitHub App flow registers a GitHub App on your server and redirects you to your instance to create it. A GitHub organisation owner must complete it.

A personal access token gives Hacktron access to repositories for Whitebox pentests.

:::warning
Pull request reviews are not available with a personal access token. Use the [GitHub App](#configure-github-app) for them.
:::

## Configure GitHub App

::::steps

### Open Integrations

In Hacktron, go to **Integrations** and click **Connect** under **GitHub Enterprise Server**.

![The GitHub Enterprise Server row in Hacktron's Integrations](https://www.hacktron.ai/shots/platform/repositories/github-enterprise-server/ghes_connect/light.35f08019.webp)

### Start the GitHub App installation

Enter your server's base URL, such as `https://github.example.com`, and the organisation name.

:::warning
You must be an owner of the organisation to install the GitHub App.
:::

### Sign in to your server

If GitHub asks you to sign in, enter your GitHub credentials as usual.

### Register Hacktron as a new GitHub App

GitHub asks you to create a new GitHub App. Give it a descriptive name (`hacktron-app` by default).

![Create GitHub App on the server, with the name hacktron-app](https://www.hacktron.ai/shots/platform/repositories/github-enterprise-server/ghes_create_app/light.bfbda6c2.webp)

Click **Create GitHub App**. This creates a GitHub App with the permissions Hacktron needs.

### Install the GitHub App

Your browser redirects you to install the app you registered.

![Installing hacktron-app on an organisation, with the repository choice and the permissions it requests](https://www.hacktron.ai/shots/platform/repositories/github-enterprise-server/ghes_install_app/light.0523eba7.webp)

Select the repositories to grant access to, then click **Install**.

:::note
Hacktron asks for read access to code, members, and metadata, and read and write access to checks, issues, and pull requests. It needs them for Review, issue management, and opening pull requests. Hacktron keeps no source code once each review is complete.
:::

::::

## Configure a personal access token

::::steps

### Open the personal access tokens page

Go to `http://<your-server>/settings/personal-access-tokens/new`, or click your avatar at the top right and select **Settings**, then **Developer settings**, then **Personal access tokens**.

### Create the token

Give the token a descriptive name, such as "Hacktron", and select the repositories to grant access to.

:::tip
You can change this later.
:::

Select these repository permissions:

- read-only access to contents
- read-only access to metadata (configured automatically)

:::note
Whitebox pentests need these permissions.
:::

Click **Create token**. Copy the token and save it somewhere secure.

### Add the token to Hacktron

On the **Integrations** page in Hacktron, click **Connect** under **GitHub Enterprise Server** and select the **Personal access token** option.

![The GitHub Enterprise Server dialog with the Personal access token option selected](https://www.hacktron.ai/shots/platform/repositories/github-enterprise-server/ghes_personal_access_token/light.1e4994e9.webp)

Enter the token you created and click **Connect GitHub Enterprise Server**.

::::

## Use a GHES repository in a Whitebox pentest

On-premises deployments can use enabled GitHub Enterprise Server repositories as Whitebox pentest sources. Connect the instance first with either method on this page, then make sure the repository is enabled for the organisation.

When you create a Whitebox pentest:

1. Open **Connected sources** in the repository step.
2. Select the enabled GHES repository and the branch or commit to test.
3. Add the rest of the scope, calculate the cost, and start the pentest.

If the server uses a private network address, add its hostname to the appliance's **Internal Git host(s)** setting. If it uses a private certificate authority, add that CA to **Trusted CA certificates** as well.

The on-premises guide covers first boot, internal Git access, and air-gapped support. The Whitebox quickstart covers selecting a source, defining the scope, and running the pentest.

:::tiles
- [On-premises deployment](/docs/platform/on-premises): Run Hacktron on your own appliance.
- [Quickstart](/docs/whitebox/quickstart): Scope, estimate, and start a pentest.
:::
