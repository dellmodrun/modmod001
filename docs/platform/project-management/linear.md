---
title: Linear
description: Create Linear issues for findings.
url: https://www.hacktron.ai/docs/platform/project-management/linear
---

# Linear

## Prerequisites

You need to be a Hacktron organisation admin to manage the Linear integration.

You also need permission to authorise apps in the Linear workspace you want Hacktron to use.

## Configure Linear

::::steps

### Open Integrations

In Hacktron, go to **Integrations** and find **Linear** under **Issue tracking**.

![The Linear row in Integrations, with its Connect button](https://www.hacktron.ai/shots/platform/project-management/linear/linear_card/light.ec45344f.webp)

### Start the OAuth connection

Click **Connect**. Your browser redirects to Linear.

### Authorise Hacktron

Sign in to Linear if asked, and approve the requested access.

![Linear's consent screen, where Hacktron asks for read and write access to the workspace](https://www.hacktron.ai/shots/platform/project-management/linear/linear_authorize/light.8f87617c.webp)

:::note
Hacktron requests read and write access so it can create Linear issues automatically whenever it finds a security issue in your repositories.
:::

### Return to Hacktron

After you authorise it, Hacktron redirects you back to **Integrations**.

### Open the Linear configuration

Click the settings icon on the Linear card.

### Choose a default destination

Select the default Linear team. You can also choose a default Linear project.

:::warning
Linear shows **Setup required** until a default team is saved.
:::

Turn on **Automatically create tickets** for Hacktron to create a Linear issue for every security finding. With it off, you can still create Linear issues by hand from the finding detail view.

![Linear configuration, with the default team and project, Automatically create tickets, and Backfill existing findings](https://www.hacktron.ai/shots/platform/project-management/linear/linear_configuration/light.b652a728.webp)

### Backfill existing findings

This step is optional. **Backfill existing findings** creates Linear tickets for the approved findings that were created before you configured the integration. Click **Backfill now** to start it.

### Save settings

Click **Save** to apply the Linear configuration.

::::

## Using Linear tickets

After Linear is connected and configured, open an approved finding and choose **Create on Linear** to create a Linear issue by hand. If the finding already has a Linear issue, Hacktron shows **View on Linear** instead.

## Common checks

- If Linear shows **Setup required**, open its settings and save a default team.
- If backfill is unavailable, check that a default team is saved.
- If a finding already has a ticket, use **View on Linear** rather than creating another.
