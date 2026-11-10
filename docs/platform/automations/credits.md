---
title: Automation credits
description: Buy and spend automation credits.
url: https://www.hacktron.ai/docs/platform/automations/credits
---

# Automation credits

[Remediation](/docs/platform/automations/remediation) runs on a shared balance of automation credits. Every remediation run, whether you start it from a finding or an [automation](/docs/platform/automations) does, deducts credits for what the run cost when it completes. [Scheduled whitebox scans](/docs/platform/automations/scheduled-whitebox-scans) spend Whitebox Scan credits instead. Replies from the [Slack assistant](/docs/platform/slack-assistant#credits) use automation credits too.

Automation credits are organisation-wide. They are separate from Review seats and from Whitebox Scan credits.

## How credits work

::::steps

### Keep a balance

:::tip
Every organisation with an active [Review](/docs/review) subscription starts with $50 in automation credits.
:::

Organisation owners can buy credits from **Billing**, or turn on [auto top-up](#auto-top-up) to keep the balance above a threshold they set.

![The Automation credits card on Billing, with Buy credits and Manage auto top-up](https://www.hacktron.ai/shots/platform/automations/credits/billing_automation_credits/light.74ce1012.webp)

### Check out

Complete any card authentication the purchase needs, such as 3D Secure. The credits are added to the organisation's balance once the charge succeeds.

### Runs check the balance

A remediation run starts only while the organisation has credits. When the balance runs out, new runs don't start, and the **Billing** page shows that automations are paused.

### Runs deduct on completion

Each run's cost is deducted from the balance once, when the run completes. The cost varies with the size of the run.

::::

## Auto top-up

Auto top-up buys credits when the balance drops below a threshold, so your automations keep running without manual purchases.

Set it up on the **Billing** page, under your automation credit balance:

| Setting | What it sets |
| --- | --- |
| **Trigger** | The balance that starts a top-up. |
| **Target** | The balance the top-up buys back up to. It must be above the trigger. |
| **Monthly limit** | An optional cap on how many credits auto top-up may buy each month. |

Auto top-up needs a saved payment method, and charges the card on file without an interactive checkout. If a top-up charge fails, your automations stay paused until someone tops up the balance manually or the card issue is resolved.

The **Automation credits** card on **Billing** shows the current balance, the credits used in the billing period, the auto top-up status, and a link to run history. Whitebox Scan credits are in a separate account and are never used for remediation runs.

## Related docs

:::tiles
- [Remediation](/docs/platform/automations/remediation): Receive fixes as pull requests.
- [Automations](/docs/platform/automations): Run actions on triggers.
:::
