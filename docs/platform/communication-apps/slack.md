---
title: Slack
description: Choose where Slack notifications go.
url: https://www.hacktron.ai/docs/platform/communication-apps/slack
---

# Slack

## Prerequisites

You need to be a Formant organisation admin to manage the Slack integration.

You also need permission to authorise apps in the Slack workspace you want Formant to use.

## Configure Slack

::::steps

### Open Integrations

In Formant, go to **Integrations** and find **Slack** under **Notifications**.

![Slack under Notifications in Integrations, with its Connect button](https://www.hacktron.ai/shots/platform/communication-apps/slack/slack_connect/light.746cb1bc.webp)

### Connect Slack

Click **Connect**, then **Connect Slack** in the panel that opens. Your browser redirects to Slack.

### Authorise Formant

Sign in to Slack if asked, choose the workspace, and approve the requested access.

:::note
Formant uses this access to send security notifications and scan updates to the channel you configure. It also lets people work with Formant by mentioning `@Formant AI`.
:::

### Return to Formant

After you authorise it, Formant redirects you back to **Integrations**.

### Open the Slack configuration

Click **Manage** next to Slack to open its panel.

### Choose a notification channel

Select the Slack channel that should receive Formant's scan updates. The setting saves when you choose a different channel.

::::

## Change the channel

Open the Slack panel again and choose a different channel. Formant saves it as the new destination for notifications.

## Disconnect Slack

In **Integrations**, click **Manage** next to Slack, then **Disconnect Slack**. Confirm to stop notifications and alerts.

## Common checks

- If Slack doesn't connect, try again from **Integrations**.
- If a channel is missing, check that the Slack account you used for OAuth can access that channel.
- If notifications don't appear, check that the Slack integration is connected and a channel is selected.

## Use Formant in Slack

Connecting Slack installs the Formant AI app in your workspace. Add it to a channel with `/invite @Formant AI`. Each person then links their Slack and Formant accounts to use the assistant with their own permissions.

[Formant in Slack](/docs/platform/slack-assistant) covers mentioning `@Formant AI` to triage findings, set up Whitebox pentests, and manage pull request reviews.
