---
title: Communication apps
description: Send security notifications to chat.
url: https://www.hacktron.ai/docs/platform/communication-apps
---

# Communication apps

Hacktron sends security updates into the channels where your team coordinates fixes.

Set this up after you [connect a Git provider](/docs/platform/repositories) and enable repositories. Communication app connections are managed from **Integrations** and are available to organisation admins.

## Prerequisites

You need to be a Hacktron organisation admin to manage the communication app integration.

You also need permission to authorise apps in the communication app you want Hacktron to use.

## Configure communication apps

::::steps

### Set up repositories and enable reviews

Set up repositories in [Repositories](/docs/platform/repositories) and enable reviews in [Review](/docs/review).

### Connect Slack

In Hacktron, go to **Integrations** and find the **Communication Apps** section. The app's page has the detailed steps, including how to choose the notification channel:

:::tiles
- [Slack](/docs/platform/communication-apps/slack): Choose where Slack notifications go.
:::

### Authorise the workspace

Sign in to Slack if asked, and approve Hacktron for the workspace that should receive security notifications.

### Choose a notification channel

After Slack is connected, open the Slack settings panel and choose the channel Hacktron should send scan updates to.

### Receive updates

Hacktron sends notifications and alerts to the selected Slack channel.

::::

## Common checks

- If the **Connect** button is disabled, check that you are an organisation admin in Hacktron.
- If channels don't appear, check that the Slack workspace authorisation completed.
- If notifications don't appear, check that a channel is selected in the Slack settings.
