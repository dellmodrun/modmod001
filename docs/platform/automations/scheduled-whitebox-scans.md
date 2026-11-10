---
title: Scheduled whitebox scans
description: Repeat scans on a schedule.
url: https://www.hacktron.ai/docs/platform/automations/scheduled-whitebox-scans
---

# Scheduled whitebox scans

[Automations](/docs/platform/automations) can run whitebox scans on a schedule. Each environment has saved scan settings for its repositories, scope, targets, and credit limit.

Organisation **Admins** create and manage scheduled scans. Runs spend the organisation's [Whitebox Scan credits](/docs/whitebox/billing).

## Create a scheduled scan

On **Automations**, select **New automation**, give it a name, and add the repositories or [applications](/docs/platform/context/applications) to scan on the **Environments** tab.

Choose **On a schedule** to run a whitebox scan of each environment at the times you set. Formant adds **Start whitebox scan** automatically. Removing the schedule also removes that scan action.

::::steps

### Set the schedule

On the **Settings** tab, select **Add Trigger**, then **On a schedule**. A new schedule repeats weekly on Monday at 02:00, in your browser's timezone. Change it with these fields:

| Field | What it sets |
| --- | --- |
| **Repeat** | **Daily**, **Weekly**, **Monthly**, or **Custom cron**. |
| **Time** | The time of day the scan starts. With **Custom cron**, the expression sets the time instead. |
| **Timezone** | The timezone the schedule follows, such as `UTC` or `Europe/London`. |
| **Days of the week** | With **Weekly**, the days to scan. |
| **Day of the month** | With **Monthly**, a day from 1 to 31. Months without that date are skipped. |
| **Cron expression** | With **Custom cron**, five fields: minute, hour, day of month, month, and day of week, in the selected timezone. |

**Next three runs** lists the next three scan times, so you can check the schedule before you save it. A cron expression needs five fields and at least one future run. For quarterly scans at 02:00 on 1 January, 1 April, 1 July, and 1 October, use `0 2 1 1,4,7,10 *`.

![A weekly schedule at 02\:00 UTC on the Settings tab, with its next three runs and the whitebox scan action](https://www.hacktron.ai/shots/platform/automations/automation_schedule/light.77f081e6.webp)

Select **Save changes**.

### Set up the scan for each environment

On the **Environments** tab, each environment now has **Set up scan** in place of the branch picker. Select it to open the environment's scan settings. Configure the scan using these steps. The [Whitebox quickstart](/docs/whitebox/quickstart) explains source selection, scope, and dynamic testing.

| Step | What it sets |
| --- | --- |
| **Select source** | The repositories to scan and the revision of each. For an application, these are its repositories. A branch uses its latest revision on each run. |
| **Scope** | Optional. The [paths to include and exclude](/docs/whitebox/quickstart#path-patterns) in each repository. |
| **Define targets** | Optional. The applications to test dynamically, with the login instructions for each. |
| **Context documents** | Optional. Documents that explain the application, and **Additional scan instructions**. |
| **Scan options** | **Model tier** (**Default** or **Legacy**) and **Max whitebox credits per scan**, a whole number from 1 to 1,000,000. |
| **Review details** | A summary of the other steps. |

Select **Save scan settings**. Changes apply to future scans, and scans that have already started keep their settings. The environment's button then reads **Edit scan settings**. Only organisation **Admins** can edit scan settings and login instructions.

### Turn the automation on

A scheduled automation can't be turned on until every environment has scan settings, and saving the schedule doesn't turn it on. Use the switch next to the automation's name. Once it's on, the automation's page shows the date and timezone of the next scan.

Adding an environment without scan settings turns the automation off until you set up that environment's scan.

::::

## Login checks

Saved login instructions are checked before every scan. If the login fails, that scan doesn't start. To check them straight away, select **Save and check login** on the last step of the scan settings. The result shows on the **Define targets** and **Review details** steps, and the check appears in the [run history](#run-history) as **Login check**.

If authenticated testing isn't enabled for your organisation, Formant keeps the login instructions, but scans that need them can't start until it's enabled.

## Credits and skipped scans

Scheduled scans spend the organisation's [Whitebox Scan credits](/docs/whitebox/billing). Each scan gets a fresh cost estimate. **Max whitebox credits per scan** includes the scan and any human triage it needs. A scan above that limit, or one the balance can't cover, doesn't start, and its run shows **Needs attention** with the reason. If the previous scan for an environment is still in progress when the next one is due, the next one is skipped. Missed scans are skipped too.

## Run history

Open the automation's **Run history** tab to see its runs, matched environments, status, and credits used. A scheduled scan's run opens the scan it started.

While the scan is running, its row shows the stage: **Queued**, **Checking login**, **Estimating scope**, **Starting scan**, or **Scanning**. Scheduled runs can also end as **Needs attention** or **Skipped**. When a run records a reason, it shows under the status.

## Related docs

:::tiles
- [Automations](/docs/platform/automations): Configure triggers, actions, and environments.
- [Credits and billing](/docs/whitebox/billing): Check the Whitebox Scan balance and buy credits.
:::
