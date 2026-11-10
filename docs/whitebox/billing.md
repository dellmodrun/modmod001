---
title: Credits and billing
description: Credits, estimates, and refunds.
url: https://www.hacktron.ai/docs/whitebox/billing
---

# Credits and billing

Whitebox pentests use the organisation's shared credits. Before a scan can start, it needs a completed or partial cost estimate with credits, and the organisation needs enough credits to cover that estimate.

:::note
Whitebox Scan credits are organisation-wide. They are separate from Review seats, Automation credits, trials, and pooled pull and merge request review limits.
:::

## How credits work

::::steps

### Calculate the cost

Formant calculates the credit cost from the selected repositories and scope. Calculating the cost deducts no credits.

### Start with enough balance

Starting the scan deducts the calculated credits from the organisation's Whitebox Scan credit balance. Internal unlimited organisations show unlimited credits and are not charged.

### Track usage

**Billing** shows the current balance. The credit transaction history records purchases, scan deductions, and refunds.

::::

## Scheduled scans

[Scheduled whitebox scans](/docs/platform/automations/scheduled-whitebox-scans) use this Whitebox Scan credit balance. Each run gets a fresh estimate. If the estimate exceeds **Max whitebox credits per scan**, including any human triage, or the balance can't cover it, the scan doesn't start and its automation run shows **Needs attention** with the reason.

## Buy credits

Organisation owners can buy Whitebox Scan credits from **Billing** or from the checkout step of a Whitebox Scan when the organisation does not have enough credits. If a member reaches checkout without enough credits, Formant asks them to contact an owner to top up the balance.

Whitebox Scan credits have no auto top-up. Owners buy them manually, and the purchase does not change the organisation's Automation credit balance or its auto top-up settings.

An owner needs a saved payment method before buying credits. With no payment method on file, checkout asks the owner to add one first, then opens the credit purchase modal.

::::steps

### Open Billing

In the Formant dashboard, go to **Billing** and find the Whitebox Scan credit balance.

### Add a payment method

If the organisation has no payment method, add one before you buy credits.

### Choose an amount

Use **Buy credits** to select the number of credits and review the checkout price.

### Complete checkout

Complete any card authentication the payment requires. Formant adds the credits to the organisation's balance once checkout succeeds.

::::

Credit purchases are idempotent, and a purchase can require 3D Secure or another card authentication step. If the payment succeeds but the credits don't appear, contact support before you retry the purchase.

## Insufficient credits

If the organisation does not have enough credits, the scan cannot start. To continue:

1. For a smaller pentest, [adjust the included folders or path patterns](/docs/whitebox/quickstart#path-patterns) and run a new cost calculation.
2. Buy enough credits from **Billing**.
3. Start the scan again once the balance covers the calculation.

API callers receive `402 Payment Required` when a scan cannot start because the organisation has too few Whitebox Scan credits.

:::tip
The API does not buy credits automatically. Handle `402` by sending an organisation owner to **Billing**, then retry [`POST /scans`](/docs/api/scans/create-scan) once the balance is updated.
:::

[Trigger a scan](/docs/api/scans/create-scan) covers starting Whitebox Scans from the REST API and handling insufficient-credit errors.

## Retests

Each pentest includes one free retest, which deducts no Whitebox Scan credits. [Retests](/docs/whitebox/retests) covers how to request it.

## Refunds and cancellations

If a started scan cannot launch after its credits are deducted, Formant tries to refund those credits automatically. Failed and stopped scans can show refunded credits in the scan details and the transaction history.
