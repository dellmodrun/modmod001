---
title: Retests
description: Verify fixes with a free retest.
url: https://www.hacktron.ai/docs/whitebox/retests
---

# Retests

Once you have fixed the findings of a pentest, ask the Hacktron team to verify the fixes.

:::warning
Each scan includes one free retest. You can request it once per scan, so wait until your fixes are ready.
:::

## Before you request a retest

Retests are available on the hosted platform for completed Whitebox pentests that have finished triage and reported at least one finding. Requesting a retest needs the **Member** role or higher. Viewers can read the results.

## Request a retest

::::steps

### Open the completed scan

In **Whitebox Scans**, open the scan and click **Request retest**.

### Add the details

:::note
Commit SHAs, deployment URLs, and a summary of fixes are optional.
:::

For each repository, choose the branch that contains your fixes. To add commit SHAs under **Commits**, press Enter after each one.

Add **Deployment URLs** and a **Summary of fixes** to help the team check your changes. For uploaded code, describe the changes in the summary, because replacement archives aren't supported.

### Review the findings

Findings marked **False positive** or **Accepted risk** are left out of the retest. Check the list and update any statuses before you submit.

### Confirm the request

Click **Request retest**. The scan shows **Retest pending** while the team checks your fixes.

::::

### Request limits

| Field | Limit |
| --- | --- |
| Commit SHAs | 50 per repository |
| Deployment URLs | 20 |
| Summary of fixes | 10,000 characters |

## Read the results

When the scan shows **Retested**, open **Retest result** for the verification notes and the outcome of each finding:

| Outcome | Meaning |
| --- | --- |
| **Verified fixed** | Open findings are marked **Resolved**. |
| **Not fixed** | The issue remains. The notes give the details. |

If notifications are enabled, you also get an email.

![Retest result with a finding marked Verified fixed and the team's verification note](https://www.hacktron.ai/shots/whitebox/retests/whitebox_retest_result/light.32892a3a.webp)

## Download the updated report

On the scan page, open **Download report**. Under **After retest**, choose **Full Whitebox Report** or **Executive Report** to download the updated PDF.

In the full report, each finding verified as fixed has a **Fix Note** alongside its original technical details. The retest summary shows which findings were fixed, which remain unfixed, and which were not retested. The retest covers the fixes you submitted.

For the report from before the retest, choose a report under **Original scan** instead. [Reports after a retest](/docs/whitebox/findings-and-reports#reports-after-a-retest) covers the report options and when each is available.
