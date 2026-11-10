---
title: Azure DevOps
description: Connect Azure DevOps Services or Server.
url: https://www.hacktron.ai/docs/platform/repositories/azure-devops
---

# Azure DevOps

This guide covers Azure DevOps Services and [Azure DevOps Server](#azure-devops-server).

## Prerequisites

You need to be an administrator of the Azure DevOps organisation you want to connect to Formant. The role is required to create a personal access token with the scopes Formant uses to read code, post pull request statuses, and register the service hooks that trigger reviews.

## Configure access

::::steps

### Open personal access tokens

In Azure DevOps, open **User settings** (the icon next to your avatar at the top right) and select **Personal access tokens**.

![Personal access tokens in Azure DevOps user settings](https://www.hacktron.ai/shots/platform/repositories/azure-devops/azure_personal_access_tokens/light.8fd4cd47.webp)

### Create a token

Click **New Token**. Give it a descriptive name, such as "Formant", and select the organisation you want to connect.

![Create a new personal access token in Azure DevOps, named Formant](https://www.hacktron.ai/shots/platform/repositories/azure-devops/azure_new_token/light.3827ef59.webp)

:::warning
Personal access tokens have expiration dates. Set the expiration to cover the time you intend to use Formant, to avoid a service interruption.
:::

### Grant the required scopes

Switch the scope selector to **Show all scopes** and grant these:

| Scope | Permissions |
| --- | --- |
| **Code** | **Read & write** and **Status** |
| **Project and Team** | **Read** |
| **Service Connections** | **Read, query & manage** |
| **Identity** | **Read** |

:::note
The **Read & write** Code scope lets Formant clone repositories and post review comments, and **Status** lets it report pull request check results. The Service Connections scope lets Formant register the service hooks that notify it when a pull request is opened or updated, so reviews run automatically. Formant keeps no source code once each review is complete.
:::

![The Formant token in Azure DevOps with its granted scopes](https://www.hacktron.ai/shots/platform/repositories/azure-devops/azure_token_scopes/light.8e915d13.webp)

Click **Create**, then copy the generated token. Azure DevOps shows it only once.

![The new token, shown once for you to copy](https://www.hacktron.ai/shots/platform/repositories/azure-devops/azure_copy_token/light.99facdb7.webp)

### Open Integrations

In Formant, go to **Integrations** and click **Connect** under **Azure DevOps**.

![The Azure DevOps row in Formant's Integrations](https://www.hacktron.ai/shots/platform/repositories/azure-devops/azure_integration/light.8e37c327.webp)

### Enter the token

Enter your organisation URL, such as `https://dev.azure.com/acme-engineering`, and the token you created, then click **Connect Azure DevOps**.

![Connect Azure DevOps in Formant, with the organisation URL and token](https://www.hacktron.ai/shots/platform/repositories/azure-devops/azure_connect/light.6bf990d0.webp)

### Select repositories

Select the repositories Formant can access.

![Azure DevOps repositories in Formant's integration dialog, with one repository selected](https://www.hacktron.ai/shots/platform/repositories/azure-devops/azure_select_repositories/light.07eb0269.webp)

Formant then has organisation-level access to the selected repositories.

::::

## Link member accounts for pull request attribution

The organisation-level connection lets Formant access repositories and receive pull request events. Members who author Azure DevOps pull requests should also link their Microsoft account, so Formant can attribute those pull requests to the correct Review seat.

Go to **Personal settings**, find **Microsoft** under **Connected accounts**, and select **Connect**. Sign in with the Microsoft account whose email matches your Azure DevOps user principal name (UPN). [Connect Microsoft for Azure DevOps](/docs/platform/account-settings#connect-microsoft-for-azure-devops) has the account-linking steps and the email requirement.

Linking an account does not rerun completed reviews. Future activity on an existing Azure DevOps pull request can reconcile its author with the linked Formant member.

## Azure DevOps Server

Formant supports self-hosted Azure DevOps Server through the same personal access token flow, with one extra step when you connect.

Follow the steps in [Configure access](#configure-access) to create a personal access token with the same scopes on your Azure DevOps Server instance. When you open the **Connect Azure DevOps** modal in Formant, select **Azure DevOps Server** and also enter your instance's base URL and organisation, such as `https://azuredevops.example.com/DefaultCollection`.

:::note
Self-hosted prerequisites:

- Your Azure DevOps Server instance must be reachable from Formant over HTTPS with a valid TLS certificate.
- The token must carry the same scopes listed above on your Azure DevOps Server instance.
:::
