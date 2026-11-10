---
title: Whitebox
description: Scoped pentests on shared credits.
url: https://www.hacktron.ai/docs/whitebox
---

# Whitebox

A Whitebox pentest is a deep, scoped assessment that goes beyond day-to-day pull request review. It uses repository context, target URLs, and access instructions to assess a defined application or codebase, and spends Whitebox Scan credits shared across the organisation.

Pentests run on a slower cadence than Review: some teams run one during the initial rollout, and others run them monthly, quarterly, or ahead of compliance audits.

## Getting started

:::tiles
- [Quickstart](/docs/whitebox/quickstart): Scope, estimate, and start a pentest.
:::

## During the pentest

:::tiles
- [Pentest logs](/docs/whitebox/logs): Follow a pentest as it runs.
:::

## After the pentest

:::tiles
- [Findings and reports](/docs/whitebox/findings-and-reports): Export findings or download a report.
- [Retests](/docs/whitebox/retests): Verify fixes with a free retest.
- [Attestation letters](/docs/whitebox/attestation-letters): A letter for auditors or customers.
:::

## Billing

:::tiles
- [Credits and billing](/docs/whitebox/billing): Credits, estimates, and refunds.
:::

## When to use it

Whitebox fits when you need:

- a deep, scoped assessment of a service or application
- coverage of both the source code and live target URLs
- an assessment for SOC 2, ISO 27001, a vendor security review, or an internal release gate
- a broader review than continuous pull or merge request comments

## Verify your fixes

Each pentest includes one free retest. [Request a retest](/docs/whitebox/retests) after you fix the findings to get an updated report.

## Run status

| Status | Meaning |
| --- | --- |
| **Draft** | The scope is being prepared and hasn't been estimated or started. |
| **Estimating** | Formant is calculating the credit estimate. |
| **Ready to Start** | The estimate is complete and the pentest is waiting for checkout and start. |
| **Running** | Formant is assessing the selected repository and targets. |
| **Completed** | The pentest finished and its findings are available. |
| **Failed** | The pentest couldn't complete. Check the run details or contact support. |
| **Cancelled** | The pentest was stopped before it completed. |

## Whitebox and Review

Use [Review](/docs/review) for ongoing pull request coverage of connected repositories. Use Whitebox for a broader assessment, with shared credits and an explicit scope review before the run starts.

Both read your source through GitHub, GitHub Enterprise Server, GitLab, Azure DevOps, or Bitbucket. [Repositories](/docs/platform/repositories) covers each connection.
