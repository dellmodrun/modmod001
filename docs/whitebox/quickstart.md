---
title: Quickstart
description: Scope, estimate, and start a pentest.
url: https://www.hacktron.ai/docs/whitebox/quickstart
---

# Quickstart

This guide prepares the scope of a Whitebox pentest and starts it from the Formant dashboard.

## Prerequisites

Before you start, make sure the organisation has:

- a connected repository or an uploaded archive to test
- the branch or commit Formant should use
- for dynamic testing, the domain or URL of each application to test and instructions for reaching it, even when no sign-in is required
- enough Whitebox Scan credits, or an organisation owner who can add a payment method and buy credits

Connect GitHub, GitHub Enterprise Server, GitLab, Azure DevOps, or Bitbucket before you create a pentest. [Repositories](/docs/platform/repositories) covers each provider.

On-premises deployments can select an enabled GitHub Enterprise Server repository from **Connected sources**, or upload a `.zip`, `.7z`, `.tar.gz`, or `.tgz` source archive of up to 2 GiB from **Upload archive**.

## Create the pentest

::::steps

### Open Whitebox Scans

In the Formant dashboard, open **Whitebox Scans** and create a new scan.

![A new scan opened from Whitebox Scans in the dashboard](https://www.hacktron.ai/shots/whitebox/quickstart/whitebox_open_scan/light.14f2d7ff.webp)

### Choose the primary repository

Select the main repository and the branch to test. If the application spans several services, add the related repositories too.

For an on-premises GitHub Enterprise Server repository, connect and enable the repository before you open the wizard, then select it from **Connected sources**. To pentest an archive instead, open **Upload archive** and add the source file.

![The primary repository and branch selected for the pentest](https://www.hacktron.ai/shots/whitebox/quickstart/whitebox_select_repository/light.96d55d8b.webp)

### Set the scope

:::note
Scope selection is optional. Leave the defaults to test the whole repository. On-premises deployments skip this step.
:::

In **Set scan scope**, choose which parts of each repository to test:

1. Click **Choose folders** next to a repository.
2. Keep the folders to test checked, and uncheck the ones to skip.
3. Click **Apply**. Repeat for each related repository.

![Choose folders, where checked folders are included in the pentest](https://www.hacktron.ai/shots/whitebox/quickstart/whitebox_scope_folders/light.c6425c26.webp)

For more control, choose **Edit as patterns** in the folder picker to set [**Include paths** and **Exclude paths**](#path-patterns). If **Choose folders** isn't available for your source, use **Edit patterns** on the repository card.

![Set scan scope with Include paths and Exclude paths for each repository](https://www.hacktron.ai/shots/whitebox/quickstart/whitebox_scan_scope/light.e4298fb6.webp)

### Configure dynamic testing

:::note
Dynamic testing is optional. Choose **Skip adding targets** to continue with a pentest of the source code alone, without testing a deployed application.
:::

In **Define targets**, add each application Formant should test:

1. Enter its **Domain**, such as `https://staging.example.com`.
2. Fill in **Auth instructions** with the login steps, dedicated test credentials, and how to confirm that access worked. For a public site, say that no login is required and describe the page that should load.
3. Click **Verify access** and watch the attempt in the live browser preview. Wait until the target shows **Verified** before you continue.

Use **Add target** for another application. Each target needs its own domain and instructions. With several targets, **Verify all** checks the ones that still need verification.

![Define targets with a domain, auth instructions for a public site, Verify access, Add target, and Skip adding targets](https://www.hacktron.ai/shots/whitebox/quickstart/whitebox_dynamic_testing/light.dee60b77.webp)

If verification fails, check the domain, credentials, and instructions, then try again. Verification lasts one hour. If you edit a verified target's domain or instructions, verify it again or choose **Revert to last success**.

### Add context and review the details

In **Context documents**, add architecture notes, threat models, API specs, or other material that explains the application. Then check the repositories, selected paths, targets, and access instructions in **Review details**.

### Estimate the cost

Click **Calculate cost** in **Cost calculation** and wait for it to finish. Formant estimates the credit cost from the selected repositories and scope before the pentest can start.

Check the number of matching files for each repository. If none match, click **Edit scope** to change the paths. Any change to the scope resets the estimate, so calculate it again before you start.

![The credit cost estimate for the pentest](https://www.hacktron.ai/shots/whitebox/quickstart/whitebox_cost_estimate/light.a1474b69.webp)

### Review and start

Review the scope and the estimated credit cost. When the pentest starts, Formant deducts the estimated credits from the organisation's Whitebox Scan credit balance. If the balance is too low, an owner can buy credits during checkout.

![The credit summary before the pentest starts](https://www.hacktron.ai/shots/whitebox/quickstart/whitebox_credit_summary/light.e8be8b2a.webp)

### Track progress

Follow the pentest and inspect its dynamic testing actions in the [pentest logs](/docs/whitebox/logs). When the pentest completes, [export the findings or download a report](/docs/whitebox/findings-and-reports) to work on fixes or to keep as audit evidence.

![Pentest progress and findings in the dashboard](https://www.hacktron.ai/shots/whitebox/quickstart/whitebox_track_progress/light.e8a30104.webp)

::::

## Path patterns

**Include paths** limits the pentest to matching paths. Leave it empty to include the whole repository. **Exclude paths** removes matches from that selection.

For example, include `services/gateway/**` to test one service and exclude `**/tests/**` to skip its test folders. Paths are relative to the repository root and follow `.gitignore` syntax, where `*` matches within a folder and `**` matches across folders. Use `*.md` to exclude Markdown files.

Press Enter or type a comma after each pattern. Each repository takes up to 50 include patterns and 50 exclude patterns.

## Writing auth instructions

Write each target's instructions for someone who is signing in for the first time. Include:

- the starting URL and the steps to reach the application
- the credentials of each test account, and its role or permissions
- how to get an MFA or OTP code, if one is required, and any SSO, CAPTCHA, or network access requirements
- what successful access looks like, such as a dashboard or an account page
- the areas to focus on and the actions to avoid, such as payments or deleting data

For a target that requires sign-in:

```text
1. Open https://staging.example.com/login.
2. Sign in with qa-user@example.com and [dedicated test password].
3. Confirm the dashboard loads and the account has the Member role.
4. Focus on project access and file uploads.
5. Do not make payments, delete projects, or modify other users' data.
```

For a public target:

```text
1. Open https://help.example.com.
2. No login is required.
3. Confirm the help center and search page load.
```

:::warning
Auth instructions are shared with AI agents for testing. Use a test environment and dedicated test accounts, keep personal credentials and production secrets out of the instructions, and revoke the test credentials after the pentest.
:::

## Scope checklist

| Item | What to provide |
| --- | --- |
| Repository | The primary repository URL and branch, and any related repositories. |
| Source paths | The folders or path patterns to include or exclude in each repository. |
| Application targets | The staging, production, API, admin, or tenant-specific URLs in scope. |
| Authentication | Test credentials, SSO notes, MFA bypass instructions, or invite steps. |
| Sensitive areas | Auth, billing, permissions, file upload, webhooks, AI agents, or admin paths. |
| Exclusions | Systems, data, tenants, destructive actions, or rate limits that are out of scope. |
| Context documents | Architecture notes, threat models, API specs, or earlier pentest reports. |

## Other ways to start a pentest

To repeat an assessment, [schedule whitebox scans](/docs/platform/automations/scheduled-whitebox-scans) and save the scan settings for each environment.

You can also prepare a pentest in Slack, from Claude, Cursor, or another AI assistant connected to Formant's MCP server, or through the REST API. Set the scope and review the credit estimate before you start. An organisation admin has to start the pentest. In Slack, mention `@Formant AI` with a repository or an attached archive. The API creates a pentest draft from repositories or archives, with optional live sites, or starts a code-only scan from a completed cost estimation.

:::tiles
- [Formant in Slack](/docs/platform/slack-assistant): Ask questions and triage in Slack.
- [MCP](/docs/mcp): Connect an AI assistant to Formant.
- [Create a pentest draft](/docs/api/pentests/create-pentest): Create a pentest that hasn't started.
- [Trigger a pentest](/docs/api/scans/create-scan): Start a pentest from a cost estimation.
:::

## Next steps

:::tiles
- [Credits and billing](/docs/whitebox/billing): Credits, estimates, and refunds.
- [On-premises deployment](/docs/platform/on-premises): Run Formant on your own appliance.
:::
