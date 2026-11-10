---
title: Pentest logs
description: Follow a pentest as it runs.
url: https://www.hacktron.ai/docs/whitebox/logs
---

# Pentest logs

Open a scan in **Whitebox Scans** to follow a pentest while it runs, or to read its logs afterwards.

## Timeline

Expand **Timeline** to see the phases of the pentest, their timing, and its progress. Click a phase for more detail. On a completed scan, the timeline starts collapsed.

## Agent activity

Expand **Agents** to see the findings the agents are checking. Click a finding to read its description and any reason it was dismissed.

To open an agent's log, click **View validation activity** beside it. In the log, you can follow the agent's progress and click **Show findings** to see what it checked.

![Timeline and Agents expanded on a scan, with View validation activity beside an agent](https://www.hacktron.ai/shots/whitebox/logs/whitebox_scan_logs/light.1767a0e0.webp)

### Dynamic testing actions

When a pentest includes dynamic testing, the log also records the actions taken against your deployed application:

1. Open **View validation activity** for the agent you want to inspect.
2. Expand the **steps** beneath an activity message to see the actions taken.
3. Expand an action to inspect what was recorded, such as a command and its output, or a browser interaction.

![Validation activity with a dynamic testing action expanded to show its details](https://www.hacktron.ai/shots/whitebox/logs/whitebox_validation_activity/light.55502b41.webp)

The log updates while the agent runs, and retry attempts appear in the same window.

:::note
Validation activity is available for scans that recorded activity logs.
:::

When the pentest finishes, [review and export its findings or download a report](/docs/whitebox/findings-and-reports).
