---
title: GitLab
description: Connect GitLab.com or self-hosted GitLab.
url: https://www.hacktron.ai/docs/platform/repositories/gitlab
---

# GitLab

## Choose an access level

Hacktron supports two GitLab access levels. Choose the service account's role by who will manage webhooks and repository clone credentials.

Maintainer access is recommended and sets everything up automatically. GitLab requires Maintainer access to create project webhooks and read-only clone credentials, so with this role Hacktron manages both for the projects you select.

Developer access needs manual setup. It lets Hacktron read merge requests and post review comments. A [read-only deploy token gives Hacktron access to clone repositories](#developer-access-setup), and a GitLab Maintainer or Owner configures the webhook separately. The service account stays at Developer access while someone with permission handles the setup steps that need a higher role.

## Prerequisites

You need to be a Hacktron organisation admin to connect GitLab and manage its settings.

A GitLab group Owner creates the service account. For Developer access, you also need someone with permission to create deploy tokens and webhooks: a group Owner for group-level setup, or a project Maintainer or Owner for project-level setup. The service account itself can keep Developer access.

## Configure access

:::::steps

### Open Service Accounts

In GitLab, open the group you want to connect to Hacktron, go to **Settings**, and select **Service Accounts**.

![Service accounts in a GitLab group's settings](https://www.hacktron.ai/shots/platform/repositories/gitlab/gitlab_service_accounts/light.a42f13aa.webp)

### Create a service account

Give the service account a descriptive name, such as "Hacktron".

![Create service account in GitLab, with the name hacktron-bot](https://www.hacktron.ai/shots/platform/repositories/gitlab/gitlab_create_service_account/light.87b12ad7.webp)

Click **Create**.

### Choose the service account's access level

Grant the service account access to the group or projects you want Hacktron to scan.

::::tabs

:::tab[Maintainer (recommended)]

Grant **Maintainer** access. Hacktron creates project webhooks and repository clone credentials automatically.

![Inviting the Hacktron service account to a GitLab group with the Maintainer role](https://www.hacktron.ai/shots/platform/repositories/gitlab/gitlab_invite_maintainer/light.7f7a6571.webp)

:::

:::tab[Developer]

Grant **Developer** access. After you connect, [save a read-only deploy token and configure webhooks by hand](#developer-access-setup).

Hacktron detects the account's access level automatically.

:::

::::

### Create a personal access token

On the service accounts page, select the service account and click **Manage access tokens**.

![The menu of a GitLab service account, with Manage access tokens](https://www.hacktron.ai/shots/platform/repositories/gitlab/gitlab_manage_tokens/light.e0ca46b5.webp)

Click **Add new token** and enable `api`, `read_api`, and `read_user`, the scopes listed in Hacktron's setup instructions. Set an expiration date and click **Generate token**.

Why Hacktron needs each scope:

| Scope | What Hacktron uses it for |
| --- | --- |
| `api` | Posting review comments and, with Maintainer access, managing webhooks and clone credentials |
| `read_api` | Reading project and merge request information, diffs included |
| `read_user` | Identifying the connected service account |

:::warning
Rotate the personal access token before it expires to avoid a service interruption.
:::

### Connect GitLab

In Hacktron, go to **Integrations** and click **Connect** under **GitLab**. Paste the personal access token and click **Connect GitLab**.

![The GitLab connection panel in Hacktron, explaining Maintainer and Developer access](https://www.hacktron.ai/shots/platform/repositories/gitlab/gitlab_connect/light.6d09ac43.webp)

### Select projects

Go to **Repositories** and select the GitLab projects Hacktron can access.

With Maintainer access, webhook setup is automatic. With Developer access, complete the [Developer access setup](#developer-access-setup) before you start scans.

Connecting GitLab does not turn on merge request reviews. Once access is ready, [enable Review for the repositories and branches you want covered](/docs/review/setup#configure-review).

:::::

## Developer access setup

Follow these steps when the service account has Developer access. Hacktron shows **Needs setup** until you save a deploy token.

::::steps

### Create a read-only deploy token in GitLab

Ask a GitLab group Owner or project Maintainer to open the group or project and go to **Settings**, then **Repository**, then **Deploy tokens**. There, they select **Add token**, give it a name, enable only `read_repository`, and click **Create deploy token**.

Copy both the username and the token before you leave the page. GitLab shows the token only once.

:::note
A group deploy token covers the projects in that group. The token you save in Hacktron must cover every selected private project. A project deploy token works when you are connecting only that project.
:::

### Save the deploy token in Hacktron

Open **Integrations**, then **GitLab**, then **Manage**. Under **Webhooks and deploy tokens**, enter the **Deploy token username** and **Deploy token**, then click **Save**.

![The GitLab settings in Hacktron, with the deploy token username and token fields and the Save button](https://www.hacktron.ai/shots/platform/repositories/gitlab/gitlab_deploy_token/light.f4ea6648.webp)

### Configure the webhook in GitLab

In the same Hacktron panel, copy the webhook **URL** and **Secret token**.

In GitLab, open **Settings**, then **Webhooks**, on each selected project and click **Add new webhook**. Paste the full URL, query string included, and paste the secret into GitLab's **Secret token** field.

Enable these triggers:

- **Push events**
- **Merge request events**
- **Comments**

Keep **Enable SSL verification** selected and click **Add webhook**.

:::tip
On GitLab Premium or Ultimate, a group Owner can create one [group webhook](https://docs.gitlab.com/user/project/integrations/webhooks/#group-webhooks) instead of a webhook on each project. Configure the webhook at the group level or the project level, not both, to avoid duplicate deliveries.
:::

### Enable merge request reviews

[Enable Review](/docs/review/setup#configure-review) for the selected repositories. Open or update a merge request to trigger a review.

:::note
Saving a deploy token clears **Needs setup**, but does not check that you created the webhook. If reviews do not run, check the webhook URL, secret, and triggers in GitLab. If repository access fails, check the deploy token's scope, expiration, and project coverage.
:::

::::

## Self-hosted GitLab and GitLab Enterprise

Maintainer and Developer setup both work with self-hosted GitLab and GitLab Enterprise. Follow the steps above on your own instance.

:::note
On self-managed GitLab, service accounts require GitLab EE, and by default only an instance administrator can create them. Administrators can also allow top-level group Owners to create them. Instead of a service account, you can use a personal access token from an existing user with the chosen access level and the same scopes.
:::

When you open the **Connect GitLab** modal in Hacktron, select **Self-hosted / GitLab Enterprise** and enter your instance's base URL, such as `https://gitlab.example.com`, before you enter the token.

- Your GitLab instance must be reachable from Hacktron over HTTPS with a valid TLS certificate.
- GitLab installed under a URL subpath, such as `https://example.com/gitlab`, is not supported. Use the instance's base URL.
- For Developer access, use the webhook URL and secret that Hacktron shows for this connection.
