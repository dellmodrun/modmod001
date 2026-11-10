---
title: Bitbucket
description: Connect Bitbucket Cloud.
url: https://www.hacktron.ai/docs/platform/repositories/bitbucket
---

# Bitbucket

## Prerequisites

The Bitbucket account that connects Formant must:

- have access to the repository you want Formant to review
- have **Admin** permission on each selected repository, so Formant can create and update repository webhooks
- be able to sign in to Bitbucket and approve the OAuth request

:::note
Formant recommends a dedicated Bitbucket account for the integration rather than an employee's personal account. It keeps repository access and automated pull request comments tied to a separate integration identity.

A dedicated account is optional. An existing Bitbucket repository administrator can also connect Formant.
:::

:::warning
Bitbucket Cloud has no native service or bot accounts. A dedicated Bitbucket account is a normal Bitbucket user that can sign in, created for the integration.
:::

## Configure access

::::steps

### Create a dedicated Bitbucket account

This step is recommended. Skip it if you will connect Formant with an existing Bitbucket repository administrator.

### Grant repository access

In Bitbucket, open **Repository settings**, then **Repository permissions**, and select **Add users or groups**.

Add the account that will connect Formant, assign the **Admin** permission, and click **Confirm**.

:::note
For several repositories, you can manage access through a Bitbucket group, or grant the account **Admin** permission at the project level.
:::

![Add users or groups in Bitbucket repository permissions, with the Admin permission](https://www.hacktron.ai/shots/platform/repositories/bitbucket/bitbucket_repository_permissions/light.055d4a60.webp)

### Sign in to Bitbucket

Sign in with the dedicated Bitbucket account you created in the first step. If you chose an existing repository administrator, sign in with that account instead.

### Open Integrations

In Formant, go to **Integrations** and click **Connect** under **Bitbucket**.

![The Bitbucket row in Formant's Integrations](https://www.hacktron.ai/shots/platform/repositories/bitbucket/bitbucket_integration/light.569147cd.webp)

### Authorise Formant

Review the permissions Formant requests and click **Accept**. Bitbucket redirects you to Formant once authorisation is complete.

![The Atlassian page that lists the access Formant requests, with the Accept button](https://www.hacktron.ai/shots/platform/repositories/bitbucket/bitbucket_authorize/light.753af3d4.webp)

### Select repositories

Select the repositories you want Formant to review and click **Done**. Formant creates the required webhook for each enabled repository, so you do not configure it by hand.

![Select Bitbucket repositories in Formant](https://www.hacktron.ai/shots/platform/repositories/bitbucket/bitbucket_select_repositories/light.9ec116bd.webp)

To check the webhook, open the repository in Bitbucket and go to **Repository settings**, then **Webhooks**. An active webhook named **Formant Security Scan** points to `https://iva.hacktron.ai/api/v1/webhooks/bitbucket`.

![The Formant Security Scan webhook in a Bitbucket repository's settings](https://www.hacktron.ai/shots/platform/repositories/bitbucket/bitbucket_webhook/light.1997ba5c.webp)

::::

Formant then reviews every pull request in the selected repositories.

## Supported Bitbucket deployments

Formant supports Bitbucket Cloud. Bitbucket Data Center and other self-hosted Bitbucket deployments are not currently supported.
