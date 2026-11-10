---
title: Project management
description: Send findings to Jira or Linear.
url: https://www.hacktron.ai/docs/platform/project-management
---

# Project management

Formant sends security findings into the issue tracker your engineering team already uses, Jira or Linear.

Set this up after you [connect a Git provider](/docs/platform/repositories) and enable repositories. Jira and Linear connections are managed from **Integrations** and are available to organisation admins.

## Prerequisites

You need to be a Formant organisation admin to manage the project management app integration.

You also need permission to authorise apps in the project management app you want Formant to use.

## Configure project management apps

::::steps

### Set up repositories and enable reviews

Set up repositories in [Repositories](/docs/platform/repositories) and enable reviews in [Review](/docs/review).

### Connect Jira or Linear

In Formant, go to **Integrations** and find the **Issue tracking** section. Each app's page has the detailed steps:

:::tiles
- [Jira](/docs/platform/project-management/jira): Create Jira tickets for findings.
- [Linear](/docs/platform/project-management/linear): Create Linear issues for findings.
:::

### Choose ticket defaults

Save the default destination for the tickets Formant creates. Jira uses a project and an issue type. Linear uses a team and an optional project.

### Create tickets from findings

Once the app is connected, you can send an approved finding to it from the finding detail view. With auto-create on, Formant creates tickets for approved findings automatically.

::::

## Common checks

- If the **Connect** button is disabled, check that you are an organisation admin in Formant.
- If ticket creation is unavailable, check that Jira or Linear is connected and configured.
- If auto-created tickets don't appear, check that auto-create is on and the required default destination is saved.
