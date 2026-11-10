---
title: Troubleshooting
description: Why a pull request wasn't reviewed.
url: https://www.hacktron.ai/docs/review/troubleshooting
---

# Troubleshooting

Use this page when Hacktron didn't review a pull request or merge request, or when Review coverage doesn't behave as you expect.

## If a review doesn't run

Check these first:

- The Git provider is connected in **Integrations**.
- The repository appears in **Repositories**.
- The repository is enabled for Review.
- The pull request or merge request targets a covered branch.
- The pull request or merge request changes no more than 500 files.
- The organisation has trial or paid review capacity available.
- The organisation hasn't reached its pooled review limit, or overage billing is on for a paid plan.
- For GitHub, the GitHub App installation includes the repository.
- For GitLab, the service account still has access and its token hasn't expired.
- For GitLab with Developer access, the [deploy token and manual webhook setup](/docs/platform/repositories/gitlab#developer-access-setup) are complete.

## Repository is missing

If a repository doesn't appear in Hacktron:

- Confirm that the Git provider installation includes the repository.
- If you added the repository recently, go to **Repositories** and sync again.
- For a private repository, confirm that the installation or service account has access to it.

## Branch is not covered

If Hacktron reviews only some pull requests or merge requests:

- Confirm that the target branch is covered in the repository settings.
- If coverage is limited to specific branches, Hacktron skips pull requests that target other branches.

## Developer is not covered

If a developer has no Review seat, Hacktron marks the check as skipped. If [comments to source control](/docs/platform/organization-settings#post-comments-to-source-control) are on, Hacktron also leaves a comment on the pull request explaining that no seat is assigned.

Check **Billing** to confirm that the organisation has trial or paid review capacity available.

If auto-assigned seats are on and a new developer didn't get a seat, you may need to [raise the auto-assignment seat limit](/docs/review/people#configure-the-seat-limit).

## Pull request or merge request is too large

Hacktron skips pull requests and merge requests with more than 500 changed files.

[Enable reviews on every pull and merge request](/docs/review/setup#configure-review) so smaller changes are reviewed before they reach a large deployment pull request.

## Review limit is reached

Review uses a pooled organisation review limit for each billing period. When the organisation reaches it:

- On a trial, new reviews stop until the period changes or an owner starts the paid plan.
- On a paid plan with overage billing off, new reviews stop until the next billing period or until an owner turns on overage billing.
- On a paid plan with overage billing on, reviews continue and are billed as overage.

[Usage](/docs/review/usage) explains how the pooled limit and overage billing work.

## Still stuck?

Email `hello@hacktron.ai` with your organisation name and the details of the issue.
