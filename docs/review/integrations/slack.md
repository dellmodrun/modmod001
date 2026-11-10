---
title: Slack
description: Manage findings from Slack.
url: https://www.hacktron.ai/docs/review/integrations/slack
---

# Slack

## Prerequisites

Your organisation needs an active Slack integration. [Slack](/docs/platform/communication-apps/slack) covers connecting Slack and choosing the notification channel.

## Manage findings from Slack

When Hacktron's Slack app posts a finding in your configured channel, you can leave a triage comment that marks the finding as a false positive or an accepted risk, or you can mark the finding as valid. Open the finding card and click **Mark Valid** or **Triage Comment**.

![A Triage Comment dialog in Slack, with a status and a comment for the finding](https://www.hacktron.ai/shots/review/integrations/slack/slack_triage_comment/light.eaa7ce42.webp)

## Link your Slack identity

Link your Slack and Hacktron accounts so you can update findings from Slack and Hacktron can mention you in notifications.

::::steps

### Open Personal settings

In Hacktron, open **Personal settings**.

### Connect Slack

Under **Connected accounts**, click **Connect** next to **Slack**.

![Connected accounts in Personal settings, with a Connect button next to Slack](https://www.hacktron.ai/shots/review/integrations/slack/slack_connected_accounts/light.089b5897.webp)

### Authorise Hacktron

Sign in to Slack and approve the requested access, then click **Accept and continue**.

:::tip
If you are signed in to several Slack workspaces, select the right one. It must be the workspace configured in the [organisation-wide Slack integration](/docs/platform/communication-apps/slack).
:::

![Slack asking you to choose a workspace and allow Hacktron AI to use your account details](https://www.hacktron.ai/shots/review/integrations/slack/slack_authorize/light.508a353b.webp)

### Return to Hacktron

After authorisation, Hacktron sends you back to **Personal settings**.

::::

You can now give feedback on findings and update them from Slack. To ask about findings, prepare a pentest, or manage pull request reviews, [mention @Hacktron AI](/docs/platform/slack-assistant). [Findings and feedback](/docs/review/findings-feedback) explains how your feedback improves future reviews.
