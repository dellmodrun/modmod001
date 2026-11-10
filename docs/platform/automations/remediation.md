---
title: Remediation
description: Receive fixes as pull requests.
url: https://www.hacktron.ai/docs/platform/automations/remediation
---

# Remediation

Remediation is the part of [Automations](/docs/platform/automations) that fixes findings rather than only reporting them. A Hacktron agent analyses the vulnerability, writes a fix, and opens a pull or merge request with the change. You review and merge it like any other pull request.

Remediation runs use [automation credits](/docs/platform/automations/credits). You can start a run yourself from a finding, or let an [automation](/docs/platform/automations)'s **Remediation** action start it.

## How a run tests the patch

A remediation run works the way an engineer would:

1. It checks that the finding is real, by testing whether the reported issue is exploitable in this code. If the finding is wrong, for example because the code is unreachable, Hacktron reports it as a false positive. Hacktron never tries to fix code that is already sound.
2. It makes the minimal correct fix that addresses the root cause of the vulnerability.
3. It tests the fix. It runs the repository's existing test suite, if there is one, and adds relevant regression tests, to make sure the fix addresses the issue without breaking anything else.

## Remediate a finding

::::steps

### Open a finding

Open the finding in the Hacktron dashboard, in the finding detail panel or on the full finding page.

### Select Remediate

Open **More actions** in the toolbar and select **Remediate**. Hacktron starts a remediation run for the finding.

![A finding from a pull request scan, with Remediate in its More actions menu](https://www.hacktron.ai/shots/platform/automations/remediation/remediate_finding/light.533a245b.webp)

### Review the fix

When the agent produces a fix, Hacktron commits it to a dedicated fix branch and opens a pull or merge request in the finding's repository. Review and merge it as usual.

![A fix pull request opened by Hacktron, describing the vulnerability, the fix, and how it was verified](https://www.hacktron.ai/shots/platform/automations/remediation/remediation_pull_request/light.7013bee3.webp)

::::

Starting a remediation needs the **Member** role or above. Each finding gets only one run. If you select **Remediate** again while a run is active, Hacktron returns that run instead of starting a second one.

:::note
To push fix branches, Hacktron's GitHub App needs the **Contents: Read and write** permission. If your installation predates remediation, GitHub asks an organisation admin to approve the updated permission before fixes can be pushed.
:::

## Where the fix lands

Hacktron picks the target branch for the fix automatically:

- When the finding comes from a pull or merge request that is still open, and its branch is in the same repository, the fix is opened against that branch. The fix becomes part of the change that introduced the issue.
- In every other case, the fix is opened against the repository's default branch. That covers merged or closed source pull requests, branches from forks, and findings from Whitebox pentests.

If the source pull request merges while the agent is still working, the fix is retargeted to the default branch.

## Outcomes

A remediation run ends in one of four states:

| Outcome | Meaning |
| --- | --- |
| **Success** | A fix was generated and a pull or merge request was opened. |
| **No fix needed** | The agent completed the run and concluded no code change is required. |
| **False positive** | The agent concluded the finding is not a real issue. |
| **Failed** | The run could not complete. The failure reason is recorded. |

Runs started by an automation appear in that automation's [run history](/docs/platform/automations#run-history), with the credits each run used.

## Run remediation automatically

An [automation](/docs/platform/automations) can remediate qualifying findings across repositories and applications on its own, and notify your team in Slack and by email.
