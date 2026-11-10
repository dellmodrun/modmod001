---
title: Billing
description: Trial, seats, overage, and plans.
url: https://www.hacktron.ai/docs/review/billing
---

# Billing

Review is billed as a monthly subscription, by seat. Each developer with Review enabled counts as one seat. You can assign seats by hand, or Formant can assign them automatically when developers open pull requests in covered repositories. At the end of each billing period, the organisation is charged for the number of seats that were active during that period.

:::note
Bots count as seats too. If a bot such as Devin (`devin-ai-integration[bot]`) or Claude (`claude[bot]`) opens a pull request that gets reviewed, it occupies a seat like any other developer, including through [auto-assignment](/docs/review/people#auto-assign-seats-on-pull-requests). To avoid paying for bot seats, exclude bots with [`exclude.authors`](/docs/review/config#exclude-scans) or the organisation-wide author filter, or remove their seats from **People**.
:::

:::note
When a developer no longer needs Review, remove their seat from **People**. You can reassign the removed seat to someone else during the same billing period, but removing a seat in the middle of a billing period doesn't reduce the seat count for that period.
:::

## Start the free trial

::::steps

### Open Billing

Open **Billing** from the sidebar. Only organisation owners can see it.

![Billing in the Management section of the dashboard sidebar](https://www.hacktron.ai/shots/review/billing/billing_sidebar/light.50d0a0d0.webp)

### Start the Review trial

Read and accept the terms of service, then start the trial. The free trial doesn't need a payment method.

::::

Once the trial is active, Formant starts reviewing all covered repositories.

## End a trial early

Ending the trial early starts the paid plan immediately, which lets you turn on [overage billing](/docs/review/usage#overage-billing).

::::steps

### End the trial

In **Billing**, end the trial early to start the paid plan immediately.

![End trial early on the PR Review subscription card, beside Cancel trial](https://www.hacktron.ai/shots/review/billing/end_trial_early/light.d40614f3.webp)

### Enable overage billing

In **Usage**, enable overage billing so Formant keeps reviewing pull requests and merge requests after the organisation reaches its pooled review limit.

::::

## Cancellations and resubscriptions

If you cancel during a trial or a paid subscription, Review stays available until the end of the current trial or billing period. Once the cancellation takes effect, Formant stops reviewing new pull requests and merge requests.

If the organisation resubscribes later, Review starts as a paid subscription. The free trial doesn't restart.

[Usage](/docs/review/usage) explains pooled review limits and overage pricing.
