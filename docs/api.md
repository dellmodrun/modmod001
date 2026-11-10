---
title: API overview
description: Programmatic access to Hacktron.
url: https://www.hacktron.ai/docs/api
---

# API overview

The Hacktron REST API starts Whitebox pentests, browses and triages findings, and runs cost estimations from your own tooling.

Everything a scan operator or reviewer can do in the Hacktron dashboard is available through the API, scoped to one organisation per key.

## Base URL

```text
https://api.hacktron.ai/v1
```

Every endpoint in this reference is relative to this base URL.

## Interactive reference

A Swagger UI rendered from the live OpenAPI spec is at [api.hacktron.ai/docs](https://api.hacktron.ai/docs). It covers the same endpoints with raw request and response schemas and a **Try it out** console, which helps when you check field names or compare schemas against production.

## Requirements

- a Hacktron organisation where you have the **Admin** or **Owner** role, which you need to create API keys
- an API key, created as [Authentication](/docs/api/authentication) describes
- an HTTP client that can set custom headers

## Getting started

:::tiles
- [Authentication](/docs/api/authentication): API keys and authenticated requests.
- [Rate limits](/docs/api/rate-limits): Quotas, 429 responses, and backoff.
- [Pagination, filtering, and sorting](/docs/api/pagination-filtering): Shared query conventions for lists.
- [Errors](/docs/api/errors): Status codes and error shapes.
:::

## Cost estimations

:::tiles
- [Create a cost estimation](/docs/api/cost-estimations/create-cost-estimation): Estimate credits before a pentest.
- [List cost estimations](/docs/api/cost-estimations/list-cost-estimations): List your cost estimations.
- [Get a cost estimation](/docs/api/cost-estimations/get-cost-estimation): Fetch a cost estimation by ID.
:::

## Scans

:::tiles
- [Trigger a pentest](/docs/api/scans/create-scan): Start a pentest from a cost estimation.
- [List scans](/docs/api/scans/list-scans): List scans, filtered and sorted.
- [Get a scan](/docs/api/scans/get-scan): A scan with its findings summary.
- [Get scan status](/docs/api/scans/get-scan-status): Poll a scan until it completes.
- [List scan findings](/docs/api/scans/list-scan-findings): Page through a scan's findings.
- [Export scan findings](/docs/api/scans/export-scan-findings): A scan's findings as JSON, CSV, or SARIF.
- [Stop a scan](/docs/api/scans/stop-scan): Stop a running scan or pentest.
:::

## Pentests

:::tiles
- [Create a pentest draft](/docs/api/pentests/create-pentest): Create a pentest that hasn't started.
- [Update a pentest draft](/docs/api/pentests/update-pentest): Change a pentest that hasn't started.
- [Check pentest logins](/docs/api/pentests/check-pentest-logins): Check sign-in to each login target.
- [Estimate a pentest](/docs/api/pentests/estimate-pentest): Price a pentest draft.
- [Start a pentest](/docs/api/pentests/start-pentest): Start an estimated pentest.
- [Discard a pentest draft](/docs/api/pentests/discard-pentest): Delete a pentest that hasn't started.
- [Request archive upload](/docs/api/archives/request-archive-upload): Get an upload URL for a code archive.
:::

## Credits

:::tiles
- [Get credit balance](/docs/api/credits/get-credit-balance): Read the Whitebox credit balance.
:::

## Findings

:::tiles
- [List findings](/docs/api/findings/list-findings): List findings across all scans.
- [Count findings](/docs/api/findings/count-findings): Count findings by severity and state.
- [Get finding](/docs/api/findings/get-finding): A finding with full triage context.
- [Update finding](/docs/api/findings/update-finding): Change state, severity, or duplicate.
- [Add finding comment](/docs/api/findings/add-finding-comment): Append to a finding's triage thread.
- [Export findings](/docs/api/findings/export-findings): Export findings from every scan.
:::

## Repositories

:::tiles
- [List repositories](/docs/api/repos/list-repos): Repositories from every provider.
- [Turn PR reviews on or off](/docs/api/repos/set-pr-reviews): Switch automatic reviews on or off.
- [Get PR review settings](/docs/api/repos/get-pr-review-settings): Read your review settings.
- [Update PR review settings](/docs/api/repos/update-pr-review-settings): Change your review settings.
:::

## Dependency firewall

:::tiles
- [Get package verdict](/docs/api/hfw/get-package-verdict): A dependency verdict for a package.
- [Get scoped npm package verdict](/docs/api/hfw/get-scoped-npm-verdict): A verdict for a scoped npm package.
- [Get batch verdicts](/docs/api/hfw/batch-verdicts): Verdicts for many packages at once.
- [List malware feed](/docs/api/hfw/osv-feed): Known-malware feed entries.
:::
