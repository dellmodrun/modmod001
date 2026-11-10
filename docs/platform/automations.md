---
title: Automations
description: Run actions on triggers.
url: https://www.hacktron.ai/docs/platform/automations
---

# Automations

An automation acts for you. It has one trigger: **New vulnerability found**, for new findings that match the rules you set, or [**On a schedule**](/docs/platform/automations/scheduled-whitebox-scans), for the times you set. When the trigger fires, Hacktron runs the automation's **action**.

:::tip
Each trigger has its own action. **New vulnerability found** runs **Apply Remediation**, which starts a [remediation](/docs/platform/automations/remediation) run that fixes the finding. **On a schedule** runs [**Start whitebox scan**](/docs/platform/automations/scheduled-whitebox-scans), which scans each environment.
:::

Automations are under **Automations** in the dashboard sidebar. Organisation **Admins** create and manage them, and other members can view them.

## Create an automation

::::steps

### Create

On the **Automations** page, select **New automation** and give it a name.

![The New Automation dialog, asking for the automation's name](https://www.hacktron.ai/shots/platform/automations/new_automation/light.8c886c34.webp)

### Pick environments

Choose the repositories and [applications](/docs/platform/context/applications) the automation covers. You can limit each entry to specific branches, up to two, or leave the branch selection empty to cover all branches. A scheduled automation takes its branches from each environment's [scan settings](/docs/platform/automations/scheduled-whitebox-scans#create-a-scheduled-scan) instead.

![The Environments tab, with the branch picker for one repository open and filtered to release branches](https://www.hacktron.ai/shots/platform/automations/automation_environments/light.18686a33.webp)

### Configure settings

On the **Settings** tab, set:

| Setting | What it sets |
| --- | --- |
| **Triggers** | When the automation runs, added from **Add Trigger**. An automation has one trigger. **New vulnerability found** fires on a new finding, and **Add rule** limits it to the severity levels that qualify. [**On a schedule**](/docs/platform/automations/scheduled-whitebox-scans) fires at the times you set. |
| **Actions** | What the automation does, added from **Add Action**. **Apply Remediation** starts a [remediation](/docs/platform/automations/remediation) run for the matching finding. [**Start whitebox scan**](/docs/platform/automations/scheduled-whitebox-scans) is only available with **On a schedule**, and **Apply Remediation** isn't available with it. |
| **Notifiers** | Who hears about a run: a Slack channel, email recipients from your organisation's members, or both. |

![The Settings tab with a trigger for Critical and High findings, an action, and a Slack notifier](https://www.hacktron.ai/shots/platform/automations/automation_settings/light.b4efacef.webp)

### Save

Select **Save changes**. An automation needs at least one environment, one trigger, and one action to run, and a scheduled automation also needs [scan settings for every environment](/docs/platform/automations/scheduled-whitebox-scans#create-a-scheduled-scan). An incomplete automation shows an **Incomplete** badge and can't be enabled. A save that removes required configuration disables the automation until it is complete again.

::::

## When an automation fires

An automation with **New vulnerability found** fires when a new finding matches its severity rule and environment, including any branch limits, and the automation is enabled. **Apply Remediation** then starts a remediation run, which uses [automation credits](/docs/platform/automations/credits). After the action, Hacktron sends a notification.

Each finding is fixed at most once. A finding that already has a remediation run doesn't fire automations again.

### Notifications

In Slack, Hacktron posts a message to your channel with a link to the finding. The Hacktron bot joins public channels on its own. For a private channel, invite the bot first.

By email, Hacktron writes to the recipients you chose from your organisation's members.

Notifications are best-effort. If one fails to send, the remediation run goes ahead.

## Scheduled whitebox scans

Use **On a schedule** to repeat a whitebox scan of each configured environment. The [scheduled whitebox scans guide](/docs/platform/automations/scheduled-whitebox-scans) covers the schedule, saved scan settings, login checks, and per-scan credit limits.

## Run history

The **Run history** tab lists every run the automation has fired, with its status, the environment it matched, and the credits it used. A run matched through an application is attributed to that application.

Run statuses follow the [remediation outcomes](/docs/platform/automations/remediation#outcomes): **Running**, **Success**, **No fix needed**, **False positive**, **Fail**, and **Stopped**. You can filter the history by status and search it.

[Scheduled scan runs](/docs/platform/automations/scheduled-whitebox-scans#run-history) show scan progress, skipped scans, and any reason a scan needs attention.

![The Run history tab, with one running run and its trigger, environment, and credits spent](https://www.hacktron.ai/shots/platform/automations/automation_run_history/light.81177b8b.webp)

## Related docs

:::tiles
- [Remediation](/docs/platform/automations/remediation): Receive fixes as pull requests.
- [Scheduled whitebox scans](/docs/platform/automations/scheduled-whitebox-scans): Repeat scans on a schedule.
- [Automation credits](/docs/platform/automations/credits): Buy and spend automation credits.
:::
