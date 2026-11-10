---
title: Jira
description: Create Jira tickets for findings.
url: https://www.hacktron.ai/docs/platform/project-management/jira
---

# Jira

## Prerequisites

You need to be a Hacktron organisation admin to manage the Jira integration.

You also need permission to authorise apps in the Jira workspace you want Hacktron to use.

## Configure Jira

::::steps

### Open Integrations

In Hacktron, go to **Integrations** and find **Jira** under **Issue tracking**.

![The Jira row in Integrations, with its Connect button](https://www.hacktron.ai/shots/platform/project-management/jira/jira_card/light.9bebd61f.webp)

### Start the OAuth connection

Click **Connect**. Your browser redirects to Atlassian.

### Sign in to Atlassian if asked

If Atlassian asks you to sign in, sign in with your Atlassian account as you normally would.

### Authorise Hacktron

Hacktron asks for access to view and create Jira tickets.

![Atlassian's consent screen, where Hacktron asks to view jira-user and jira-work and to update jira-work](https://www.hacktron.ai/shots/platform/project-management/jira/jira_authorize/light.cbee31d6.webp)

Click **Accept**.

:::note
Hacktron requests:

- read access to `jira-user`
- read and write access to `jira-work`

It uses this access to create Jira tickets for security findings and to link each ticket back to its finding.
:::

### Return to Hacktron

After you authorise it, Hacktron redirects you back to **Integrations** and opens the Jira configuration panel.

### Choose auto-create behaviour

Turn on **Automatically create tickets** for Hacktron to create a Jira ticket for every security finding.

:::tip
With auto-create off, you can still create Jira tickets by hand from the finding detail view.
:::

### Choose ticket defaults

Select the default Jira project and issue type. Hacktron uses them for the Jira tickets it creates for security findings.

:::note
A default project and issue type are required when auto-create is on. You can change them later.
:::

You can also set a default label, such as "security", and a default assignee from your team. Both are optional.

![Jira configuration, with Automatically create tickets, the default project, issue type, labels, and assignee, and the severity to priority mapping](https://www.hacktron.ai/shots/platform/project-management/jira/jira_configuration/light.e664484d.webp)

:::tip
Jira priority levels run from "Highest" to "Lowest". You can map finding severities to Jira priorities in the Jira settings.
:::

### Save settings

Click **Save** to apply the Jira configuration.

::::

## Using Jira tickets

After Jira is connected, open an approved finding and choose **Create on Jira** to create a Jira issue by hand. If the finding already has a Jira issue, Hacktron shows **View on Jira** instead.

## Common checks

- If projects or issue types are missing, check that the Atlassian account you used for OAuth can access them.
- If auto-create can't be saved, select both a default project and a default issue type.
- If a finding already has a ticket, use **View on Jira** rather than creating another.
