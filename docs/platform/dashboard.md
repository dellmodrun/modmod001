---
title: Dashboard
description: Track Review and Whitebox activity.
url: https://www.hacktron.ai/docs/platform/dashboard
---

# Dashboard

The dashboard has three tabs: **Overview**, **PR Review**, and **Whitebox Scan**. In the top right of each tab, choose the time period the data covers, or click **Export** to download the data as a PDF report.

## Overview

The **Overview** tab shows statistics such as scan volume, finding counts, and repository coverage at a glance.

![The Overview tab, with review and pentest counts, critical findings, active repositories, and scan volume over time](https://www.hacktron.ai/shots/platform/dashboard/dashboard_overview/light.f7b176aa.webp)

### Resolution health

**Resolution health** shows your mean time to resolution (MTTR) and the percentage of findings resolved within your SLA thresholds.

![Resolution health, with the MTTR and the share of findings resolved within the SLA for each severity](https://www.hacktron.ai/shots/platform/dashboard/dashboard_resolution_health/light.535be4f7.webp)

Set the resolution window and the compliance target for each severity in [**Organization settings**](/docs/platform/organization-settings#sla-thresholds).

## PR Review

**PR health** shows the percentage of pull requests that introduced new security issues, and the percentage of issues that have been resolved.

![PR health, with the PR introduction and fix rates and their trends](https://www.hacktron.ai/shots/platform/dashboard/dashboard_pr_health/light.f58177de.webp)

The tab also tracks the number of new security issues of each severity over time, the MTTR, and the percentage of issues resolved within the SLA thresholds.

![The PR Review tab, with findings by severity, the findings trend, recent pull request reviews, and resolution health](https://www.hacktron.ai/shots/platform/dashboard/dashboard_pr_findings_and_resolution/light.526b797b.webp)

## Whitebox Scan

The **Whitebox Scan** tab breaks down the findings from Whitebox pentests and lists the top unresolved findings to act on.

![The Whitebox Scan tab, with finding totals, findings by severity, the top unresolved findings, and recent pentests](https://www.hacktron.ai/shots/platform/dashboard/dashboard_whitebox_scan/light.91fc0f3e.webp)

## Next steps

Read where findings are posted and how your triage improves later reviews, or connect your project management, communication, and other tools to Hacktron.

:::tiles
- [Findings and feedback](/docs/review/findings-feedback): Read findings and give feedback.
- [Integrations](/docs/platform/integrations): Connect Git, tickets, and chat tools.
:::
