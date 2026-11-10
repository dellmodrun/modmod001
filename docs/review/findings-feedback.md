---
title: Findings and feedback
description: Read findings and give feedback.
url: https://www.hacktron.ai/docs/review/findings-feedback
---

# Findings and feedback

By default, Formant posts Review findings where developers already work. Admins can turn this off in [Source control](/docs/platform/organization-settings#source-control).

## Inline findings

When Formant detects a vulnerability in a code change, it posts the finding inline on the GitHub pull request or GitLab merge request.

![Formant posts a finding inline on a GitHub pull request](https://www.hacktron.ai/shots/review/findings-feedback/github_findings/light.bbbd8c72.h264.mp4)

:::tip
A finding can involve code outside the diff, for example when Formant finds a vulnerability in a function that code in the diff calls. Formant then reports the finding in the affected file, if the pull or merge request changes that file, or in an expandable **Findings outside diff** section.
:::

## Public repositories

When a repository is public, Formant keeps sensitive details of findings outside the diff out of the public pull request thread. For findings outside your changes, the public comment shows the severity counts and links back to Formant, but hides titles, descriptions, proof-of-concept details, and affected file locations. Open the finding in Formant to see the full details.

![A pull request comment on a public repository, with the details of a finding outside the changes hidden](https://www.hacktron.ai/shots/review/findings-feedback/public_repository_redacted_findings/light.d4c5876a.webp)

Inline findings on the diff itself stay visible, because they are attached to the changed code.

![An inline finding on the changed code of a pull request](https://www.hacktron.ai/shots/review/findings-feedback/inline_finding/light.76b11254.webp)

## Triage comments

Leave triage comments on findings to tell Formant whether each one is a false positive, an accepted risk, or a true positive. Every triage comment your team leaves becomes training signal. Over time, Review builds an understanding of your application's attack surface and threat model, so reviews report fewer false positives and more of the bugs that matter to your application.

::::tabs

:::tab[GitHub or GitLab]

Reply to the finding in GitHub or GitLab with one of these commands:

- `!fp <reason>` marks the finding as a false positive.
- `!accepted_risk <reason>` marks the finding as an accepted risk.
- `!valid <reason>` marks the finding as a true positive.
- `!fixed <reason>` marks the finding as resolved.

![A developer replying with !fp and a reason to a finding on a GitHub pull request](https://www.hacktron.ai/shots/review/findings-feedback/triage_commands/light.845202eb.webp)

:::

:::tab[Web platform]

On the finding page in the web platform, you can change the finding's severity and its state: Open, True Positive, False Positive, Accepted Risk, or Resolved.

When you change the severity or state, you can add a reason. Formant records it and uses it to improve future reviews. Setting a finding back to **Open**, as shown here, asks for no reason.

![Setting a finding's status back to Open](https://www.hacktron.ai/shots/review/findings-feedback/triage_comment/light.0f4772cd.h264.mp4)

:::

:::tab[Slack]

When Formant's Slack app posts a finding in your configured channel, you can leave a triage comment that marks the finding as a false positive or an accepted risk, or you can mark the finding as valid. Open the finding card and click **Mark Valid** or **Triage Comment**.

![A Triage Comment dialog in Slack, with a status and a comment for the finding](https://www.hacktron.ai/shots/review/findings-feedback/slack_triage_comment/light.eaa7ce42.webp)

:::

::::

## Duplicate findings

When Formant posts a new finding, it checks whether the finding duplicates one it posted before. For example, if a pull request containing a vulnerability is merged, Formant may automatically mark a new finding from a later pull request as a duplicate.

![A finding marked as a duplicate of an earlier finding](https://www.hacktron.ai/shots/review/findings-feedback/duplicate_finding/light.dde613eb.webp)

:::tip
To mark a finding as a duplicate yourself, click **Mark as duplicate** on the finding page and select a **canonical (original) finding** in the same repository as the new finding.
:::

![Mark as duplicate, with a canonical finding to select from the same repository](https://www.hacktron.ai/shots/review/findings-feedback/mark_as_duplicate/light.e9ebcfd3.webp)

## Checks update on triage

If a [fail-on gate](/docs/review/config#fail-the-check-on-findings) is configured, triaging a finding updates the GitHub check, or the GitLab commit status, right away.

For example, with the gate set to fail on high severity findings, triaging a high severity finding as a false positive or an accepted risk updates the GitHub check, or the GitLab commit status, to pass. Reopening the finding makes the check fail again.

## Remediate a finding

Formant can also fix a finding for you. Select **Remediate** on a finding in the web platform, and a Formant agent writes a fix and opens a pull or merge request with it. You can also remediate qualifying findings automatically with [Automations](/docs/platform/automations).

[Remediation](/docs/platform/automations/remediation) covers how runs work, where the fix lands, and billing.

## Feedback loop

Triage feedback helps Formant adapt to your codebase. Comments and project rules tell Formant what is urgent, trusted, irrelevant, or intentionally ignored in a specific repository.

When a later commit fixes a finding, Formant can recognise the remediation and close stale alerts automatically.

![Formant closes a finding after a later commit fixes it](https://www.hacktron.ai/shots/review/findings-feedback/auto_resolve/light.fb5b84e9.h264.mp4)

## Related setup

Project rules give Review repository-specific context, and project management apps send approved findings to Jira or Linear.

:::tiles
- [Project rules](/docs/review/rules): Give reviews context in rules.md.
- [Project management](/docs/platform/project-management): Send findings to Jira or Linear.
:::
