---
title: Organization settings
description: Filters, check gate, comments, and SLAs.
url: https://www.hacktron.ai/docs/platform/organization-settings
---

# Organization settings

Organisation settings apply to every repository, unless a repository's `.hacktron/config.yaml` overrides them. Only organisation admins and owners can change them.

To open them, select your organisation, then go to **Settings**.

## Scan filters

Scan filters choose which pull and merge requests Hacktron scans by default. They come in four categories: branches, labels, authors, and keywords.

::::steps

### Find Filters

Under **Review defaults**, find **Filters**.

### Add a filter

Select **Add filter**. Choose a category and a direction, then enter one or more values.

![Review defaults, with a branch filter that includes release/*](https://www.hacktron.ai/shots/platform/organization-settings/scan_filters/light.66f056ae.webp)

::::

Each category matches in its own way:

| Category | Match style |
| --- | --- |
| Branches | Glob pattern, case-insensitive, such as `release/*` |
| Labels | Exact name, case-insensitive |
| Authors | Glob pattern, case-insensitive, such as `*-bot` |
| Keywords | Substring of the PR/MR title, case-insensitive |

:::note
You can set both **Include** and **Exclude** for the same category, and **Exclude** takes priority within that category. A filter in one category has no effect on the others.
:::

For control over a single repository, override any category in `.hacktron/config.yaml`. [Repository configuration](/docs/review/config) covers the glob syntax, the limits, and how repository configuration overrides the organisation's defaults.

## Check gate

The check gate is an organisation-wide severity. When a finding on a pull or merge request meets or exceeds it, the Hacktron check fails. To block the merge as well, make the Hacktron check required in your source control's branch protection.

::::steps

### Find Fail check at severity

Under **Review defaults**, find **Fail check at severity**.

![Review defaults, with Fail check at severity set to Off](https://www.hacktron.ai/shots/platform/organization-settings/fail_check_at_severity/light.bc98a4dc.webp)

### Choose a severity

Pick a severity: **Critical**, **High**, **Medium**, or **Low**. Select **Off** to turn the gate off for the whole organisation.

::::

[Fail the check on findings](/docs/review/config#fail-the-check-on-findings) has the full severity table and the overrides for each repository.

## Source control

These settings decide what Hacktron writes to your pull and merge requests. They apply to every repository in your organisation, and only organisation admins and owners can change them.

To change them, open **Source control** in **Settings**.

![Source control, with Update check statuses in source control, Post comments to source control and Post system comments turned on](https://www.hacktron.ai/shots/platform/organization-settings/code_review_comments/light.9c385057.webp)

To keep scans quiet, turn off both **Update check statuses in source control** and **Post comments to source control**.

### Update check statuses in source control

**Update check statuses in source control** shows scan progress and results as checks on your pull and merge requests. Turning it off leaves the checks Hacktron has already created in place.

If your branch protection requires a Hacktron check, remove that requirement before you turn this off.

### Post comments to source control

**Post comments to source control** posts review comments, finding details, notices, and bot reactions on your pull and merge requests. It is on by default.

With comments off:

- Scans run as normal.
- Check statuses follow **Update check statuses in source control**, and can still block a merge.
- Findings are available in Hacktron and in connected tools such as Slack, Jira, and Linear.
- Hacktron posts no findings, summaries, or other comments to the pull or merge request.

Turning comments off doesn't remove the comments Hacktron has already posted.

### Post system comments

**Post system comments** posts notices about skipped reviews, usage limits, and configuration problems. It is on by default.

Turn it off to silence these notices. Finding comments and check statuses are not affected.

While **Post comments to source control** is off, this option shows as off and can't be changed. Hacktron keeps your selection for when comments are turned back on.

## SLA thresholds

SLA thresholds set the resolution window and the minimum compliance target for each severity.

::::steps

### Find Resolution SLA

Under **Thresholds**, find **Resolution SLA**.

![Resolution SLA, with days and a target percentage for each severity](https://www.hacktron.ai/shots/platform/organization-settings/sla_thresholds/light.6b349bc8.webp)

### Set days and a target for each severity

For each severity, set the number of days findings have to be resolved in, and the minimum percentage of findings that should meet that window.

::::

These values drive the Resolution Health widget on the [dashboard](/docs/platform/dashboard#resolution-health), including mean time to resolution (MTTR) and SLA compliance.

## Related

Repository configuration uses `.hacktron/config.yaml` to override the scan filters and the check gate for one repository.

:::tiles
- [Setup](/docs/review/setup): Enable repositories and branches.
- [Repository configuration](/docs/review/config): Set what Review scans and blocks.
:::
