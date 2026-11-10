---
title: Changelog
description: Features, improvements, and fixes.
url: https://www.hacktron.ai/docs/changelog
---

# Changelog

## October 27, 2026

**The Whitebox pentest wizard has a Scope step.** Pick the folders to include or exclude in a checkbox file tree. Every file is selected by default, so you only touch the tree to narrow the pentest or skip specific paths.

**You can close a single finding from its status menu.** **Closed** is in the same places as **False Positive**: the status menu, the keyboard shortcut, and the command palette. Closing one finding no longer needs the bulk-only workaround.

**Attestation letters have their own page.** Your organisation's **Attestation Letters** page lists the letters Formant issues, each with a unique shareable link and a PDF download. A customer or auditor with the link can view or download the letter without logging in.

**Review accepts pull requests with up to 500 changed files.** The limit was 200, so large refactors and wide migrations fit.

**Organisation admins can turn off automated review comments for the whole organisation.** The control is in **Settings**. OSS organisations get 50 free pull request reviews a month, a higher limit than before.

**The People page has separate Members and Invitations tabs.** Pending invitations are on **Invitations**, so you don't scroll past your full member list to reach them. The **Invitations** tab has an empty state, and revoked invitations stay listed with a **Delete** option instead of disappearing.

**Auto-assignment says that bot authors take billable seats.** Tooltips and prompts at every auto-assignment opt-in point say that bot pull request authors take billable seats. The note on the excluded-authors filter says that excluded authors never consume a seat.

**The trial activation modal can enable every repository at once.** Its enable-all button turns on pull request reviews for every connected repository without a visit to the **Repositories** page.

**A GitLab connection can be saved before setup is complete.** Connecting a GitLab installation no longer requires every step before you save. The connection page detects your current access level and shows only the actions available to you.

**The last step of the Whitebox wizard is a structured summary.** The review step before launch is a summary panel with **Source**, **Target**, **Access**, and **Context** sections. Each section has an **Edit** button that jumps back to its step, and the verification status of every account is visible on the panel.

See the [Whitebox quickstart](/docs/whitebox/quickstart), [Whitebox billing](/docs/whitebox/billing), [GitLab](/docs/platform/repositories/gitlab), and [People](/docs/review/people).

## October 21, 2026

**Every finding has a short, stable, human-readable ID.** It appears at the top of the row, in the panel, on the full page, and in the URL. Click the ID to copy it.

**The finding panel has an activity timeline.** Its **Activity** tab shows a finding's full history: when the engine detected it, which scans sighted it (consecutive sightings collapse into "Detected again in N scans"), and every status or severity edit by a team member, with the actor and the changed fields on each entry. The **Comments** view shows only the thread.

**The command palette leads with actions for the open finding.** With a finding open, the palette starts with a group of actions for it: change status, change severity, mark or unmark as duplicate, create a ticket, start Remediation, copy its ID, copy its link, and open it on the full page.

**The findings list has more filters and searches several IDs at once.** The **Source**, **Reopened**, and **Date range** filters are each saved in the URL. Paste two or more finding IDs into the search box to filter to exactly those findings.

**The CWE badge shows the weakness name on hover.** The tooltip gives the full name, so you can tell what the weakness is without leaving the page.

**You can request a retest of a completed Whitebox pentest.** Start the retest wizard from the scans list or the scan detail page. The retest covers every reported finding except false positives and accepted risk, and the scan detail shows the retest status and its results once it completes.

**Whitebox reports show coverage by area.** The **Methodology** section of the report shows how many functions each area selected, instead of an arbitrary list of five names. **Coverage Detail** caps the table of unselected entry points at 50 rows instead of listing every one.

**Browser-auth instructions are inline in the wizard.** In the target step of the Whitebox wizard, the browser-auth pentest instructions appear on the page with live verification status, instead of in a separate modal.

**The Repositories page warns when PR Review has no plan behind it.** When **PR Review** is on for a repository but no active trial or subscription backs it, the page shows a notice, with a direct link for owners to start a trial.

**Appliances check that they can reach GitHub.com.** An on-premises appliance that cannot reach GitHub.com disables the GitHub.com integration card and gives the reason (DNS, blocked, or TLS), instead of letting you start setup and failing at the code exchange.

See [listing findings in the API](/docs/api/findings/list-findings), the [Whitebox quickstart](/docs/whitebox/quickstart), and [GitHub](/docs/platform/repositories/github).

## October 9, 2026

**Whitebox PDF reports describe the pentest.** They include the repositories and targets in scope, the testing window, a severity rubric, limitations, and a confidentiality notice. Where scan coverage is available, the methodology and coverage detail show which code the analysis passes selected for review.

**Reports include live validation evidence.** A finding with recorded live-validation evidence has a **Live Validation** section in the PDF report, showing what the attempt established, what it did not establish, and any blocker. A successful exploit attempt can also include the observed output.

**Finding status syncs with Jira and Linear.** Status changes on a finding sync to the linked Jira or Linear issue, and supported issue status changes come back into Formant. Organisation admins enable or disable each direction separately in the integration settings. Jira updates follow the transitions available in your project's workflow.

**Integration settings are on one page.** The **Integrations** page lists providers with connection details, repository counts where they apply, and a **Connect** or **Manage** action. Connected providers show a status badge, and a connection that needs attention shows the action that resolves it. Open a provider to manage its settings or disconnect it.

**The help menu in the top navigation links to the docs.** It links to each product's documentation, the API reference, the MCP server, and the changelog.

See the [Whitebox quickstart](/docs/whitebox/quickstart), [Jira](/docs/platform/project-management/jira), [Linear](/docs/platform/project-management/linear), and [Integrations](/docs/platform/integrations).

## September 25, 2026

**Admins choose GitHub repositories inside Formant.** Organisation admins select which repositories to enable from the GitHub integration in Formant, within the access granted to the GitHub App. Repositories added back to the App installation are selected again automatically.

**Repository access and pull request reviews are separate.** A repository can stay available to Formant while you switch its automatic pull request reviews on or off. The Repositories table shows **Repository** and **Owner** separately, alongside **Open Findings**, **PR Scans**, and **Last Scan**, and its platform filter lists only the providers your organisation has connected.

**Formant replies to explicit review requests.** When you post `@hacktronai review` for a commit that already has a review, Formant replies with the completed result or tells you that the review is still in progress.

**Appliances can review GitHub.com pull requests.** Self-hosted Formant deployments can connect a customer-owned GitHub App and review GitHub.com pull requests on their own infrastructure.

See [GitHub](/docs/platform/repositories/github), [Repositories](/docs/platform/repositories), [repository configuration](/docs/review/config), and [on-premises deployments](/docs/platform/on-premises).

## September 22, 2026

**You can request a retest of specific findings.** On a completed hosted Whitebox pentest, choose **Retest findings**, select the findings to check, and give instructions about your fixes. The Formant pentest team reviews the request and records each finding's outcome and notes. Completed retests are in the scan's retest history and its PDF report.

**You can preview the login used for dynamic validation.** Where dynamic validation is enabled, add login instructions and test credentials in the Whitebox wizard, then preview the browser session before you start. Formant uses those instructions to authenticate against your deployed targets when it validates findings.

**The People list searches every member.** Search by name, email, or SCM username, filter by role or Review seat, and sort and page through the results. Search and filters cover the full member list, not only the rows already loaded.

See [preparing scope and access](/docs/whitebox/quickstart#configure-dynamic-testing) and [managing Review seats](/docs/review/people).

## September 18, 2026

**The findings list and its detail drawer have a new layout.** Severity, status, and the main actions (**Remediate**, **Copy markdown**, and **Mark as duplicate**) sit in one header tray, and previous and next arrows move you through findings without going back to the list. A collapse control opens the drawer as a full page.

**Findings have an OWASP Top 10:2025 category.** Set or change a finding's category from the overflow menu. The category appears in the findings table and drawer, and you can filter the list by it.

**Findings carry a CWE ID and a fix recommendation.** Where the scan engine supplies them, a finding has a CWE identifier and a plain-language fix recommendation. Both appear in the finding detail.

**You can download a scan's context documents.** A download button in the triage header gets the context the scan worked from (the threat model, architecture notes, and any files you uploaded) without leaving the findings view.

**A failed scan shows why it failed.** The scan detail page shows the reason the engine reported.

**Global search shows each finding's severity.** Findings in global search results carry their severity badge, so you can pick out the Critical and High matches without opening each one.

**Fix pull requests close when the fix lands elsewhere.** If Formant detects that a commit on your base branch fixed a finding, it closes any open fix pull request for that finding and leaves a comment saying why, so you don't clear out stale fix pull requests by hand.

**Fix pull requests retry instead of failing on a stale diff.** If a file changes on the base branch while Remediation generates a fix, the fix no longer applies cleanly. Instead of a patch error, the automation re-runs against the updated file, up to three retries per chain.

**Remediation works on Azure DevOps.** Automations open and track fix pull requests on Azure DevOps repositories, as they do on GitHub and GitLab.

**Triage status syncs to Linear.** Triage a finding anywhere (the web app, Slack, a pull request comment, or the API) and the linked Linear issue moves to the matching workflow state. Starting a Remediation fix moves it to **In Progress**. Finding status already synced to GitHub, GitLab, and Slack.

**Bot pull requests are reviewed on GitHub.** Eligible bot pull requests, such as Dependabot and Renovate, were skipped on GitHub. They are reviewed now, as on GitLab and Bitbucket. Trust rules and author filters are unchanged, so you can still exclude a bot with `exclude.authors`.

**A Whitebox pentest of a GitLab repository can target a tag or commit.** When you start the pentest, you can target a specific tag or commit SHA instead of the tip of a branch.

**The Application filter scopes the whole PR Review tab.** On the **PR Review** tab of the dashboard, the **Application** filter applies to every widget, including the security score card and the low-score banner, which stayed organisation-wide before.

**Personal settings are one page.** The separate **Account** and **Settings** pages are a single **Personal settings** page, organised into **Profile**, **Security**, **Connected accounts**, **Preferences**, **Sessions**, and **Organizations**.

**Every member can manage their own API keys.** Any organisation member can create, rotate, and revoke their own API keys from personal settings, without an owner or admin doing it for them.

**Whitebox PDF exports carry more detail on each finding.** They number findings in display order and highlight code blocks in the right language.

**Appliances show licence details and warn before expiry.** **Organization settings** on an appliance show the installed licence: who it is licensed to, the expiry date, days remaining, seat count, and covered products. A banner appears 30 days before expiry. Once the grace deadline passes, new scans are blocked, while findings, reports, and exports stay readable.

**Appliances can connect self-managed GitLab.** An appliance can connect a self-managed GitLab instance and scan merge requests. The **Reviews** link, the PR Review dashboard tabs, and the source control settings appear once the integration is configured.

**Appliances connect GitHub Enterprise Server through a GitHub App.** Appliance operators can connect GitHub Enterprise Server through a GitHub App installation instead of a personal access token, which avoids long-lived tokens.

**Appliances have their own onboarding.** First-time users on an appliance get a setup flow of their own (**Welcome**, **Connect your code**, **You're all set**), pre-filled for the configured Git host, in place of the hosted trial flow.

See [findings and feedback](/docs/review/findings-feedback), [Remediation](/docs/platform/automations/remediation), [Azure DevOps](/docs/platform/repositories/azure-devops), [Linear](/docs/platform/project-management/linear), and [on-premises deployments](/docs/platform/on-premises).

## August 19, 2026

**Billing separates Automation credits from Whitebox credits.** Billing shows separate accounts for **Automation credits** and **Whitebox Scan Credits**. Each account has its own balance, current-period usage, purchase flow, and history. Auto top-up is available for Automation credits only.

**Members can connect a Microsoft account.** From **Personal settings**, connect the Microsoft account you use for Azure DevOps. When its email matches the pull request author's Azure DevOps UPN, Formant can attribute later pull request activity to the correct member and Review seat.

**On-premises Whitebox pentests accept more sources.** When starting a Whitebox pentest, on-premises deployments can select enabled GitHub Enterprise Server repositories or upload `.zip`, `.7z`, `.tar.gz`, and `.tgz` source archives.

**Appliances support internal Git and air-gapped networks.** Appliance operators can allow specific private Git hosts, add trusted CA certificates, and collect masked support bundles without an outbound internet connection.

**Author filters accept glob patterns.** Repository and organisation author filters accept `*`, `**`, `?`, and `{a,b}` patterns as well as exact names. Pattern length, wildcard count, and brace alternatives have bounded limits.

**Automations give clearer feedback.** Deleting an automation shows a confirmation with its name. Trying to enable an incomplete automation identifies the missing configuration.

See [billing and plans](/docs/platform/billing), [connecting your Microsoft account](/docs/platform/account-settings#connect-microsoft-for-azure-devops), [on-premises deployments](/docs/platform/on-premises), and [glob pattern syntax](/docs/review/config#glob-pattern-syntax).

## August 3, 2026

**Review supports Azure DevOps.** Connect your Azure DevOps organisation with a personal access token, and Formant reviews pull requests automatically, assigns developer seats, and reports findings, as it does on GitHub and GitLab.

**You can triage findings in bulk.** Select any number of findings with checkboxes, then change their status or severity in one action. When a full page is selected, you can extend the action to every finding that matches your current filters across all pages.

**Each automation environment can have a credit cap.** Set a credit limit on an environment, and a run that hits the cap stops cleanly instead of running unbounded. Once you raise the limit, you can restart the stopped run from where it left off.

**Automation runs show a live transcript.** The run detail page shows the AI agent's reasoning, tool calls, and output in real time as the run executes, instead of only the result after it finishes.

**Manual Remediation runs appear in the run history.** Every run started from the **Remediate** button on a finding appears in the main runs list alongside scheduled automation runs, so all activity is in one place.

**A triage command resolves its review thread.** Posting a triage command (`!fp`, `!valid`, `!accepted_risk`, or `!fixed`) as a reply to a finding comment on a GitHub pull request or GitLab merge request resolves that review thread automatically.

**Fix pull requests add the original author as a reviewer.** When an automation opens a fix pull request into a developer's feature branch instead of the default branch, it adds that branch's author as a reviewer, so the right person sees the fix.

**Findings can be filtered by OWASP category.** Each finding shows its OWASP category as a badge, and you can filter the findings list by category to focus on one class of issue.

**The usage page has a tab per product.** Its **PR Reviews**, **Automations**, and **Whitebox** tabs each have their own credit and usage breakdown.

**Review covers bot pull requests on GitHub.** Formant reviews eligible bot pull requests when the source branch belongs to the same repository. Bot pull requests from forks and pull requests from outside human contributors are not scanned automatically. Use author filters to exclude specific bot accounts.

**Author filters in configuration and organisation settings accept glob patterns.** Author include and exclude filters in `.hacktron/config.yaml` and organisation scan settings accept `*`, `**`, `?`, and `{a,b}` patterns as well as exact names.

**The repository field in Whitebox setup cleans up pasted URLs.** During cost estimation, a browser URL pasted into the repository field loses its `/tree/branch` or `/commit/sha` suffix automatically. A private repository that cannot be accessed shows an error immediately instead of proceeding silently.

**A first subscription comes with 5,000 automation credits.** Organisations receive a one-time grant of 5,000 automation credits when they subscribe for the first time, applied at the point of payment.

See [Azure DevOps](/docs/platform/repositories/azure-devops), [Automations](/docs/platform/automations), the [Whitebox quickstart](/docs/whitebox/quickstart), and [seats and usage](/docs/review/people).

## July 15, 2026

**Taint findings open in a trace reader.** An annotated code view lets you step through each source, propagation, and sink in sequence. Click any step in the sidebar to jump to that line in the file.

**You can export findings.** Download your findings as CSV, JSON, or SARIF from the findings page, filtered to exactly what is visible. The export respects every active filter: severity, status, scan, and repository.

**The API exports findings.** [`GET /rest/findings/export`](/docs/api/findings/export-findings) returns findings as CSV, JSON, or SARIF, with the same filter options as the UI, including scoping by repository.

**Review scans Bitbucket pull requests.** Connect a Bitbucket workspace and Formant scans pull requests automatically, as it does for GitHub and GitLab.

**Whitebox pentests offer a choice of model tier.** When starting a pentest, choose the **Default** or **Legacy** model tier before you commit to a cost estimate.

**Repository configuration filters pull requests by author and label.** `.hacktron/config.yaml` supports `skip.authors` and `include.authors` to exclude or restrict scans by pull request author, and `include.labels` to scan only labelled pull requests.

**Findings without a line post as file-level comments on GitHub.** A finding with no specific line number posts as a file-level comment on the pull request instead of being silently dropped.

**Slack can mark a finding resolved.** The overflow menu on a finding's Work Object in Slack has a **Mark Resolved** action alongside the existing triage options.

See the [findings API](/docs/api/findings/list-findings), [GitLab](/docs/platform/repositories/gitlab), and [Slack](/docs/platform/communication-apps/slack).

## June 23, 2026

**The Context page collects what Formant knows about your code.** It has **Repositories** and **Applications** tabs. Cards are sorted by most recent threat-model update and show a badge for each model's status. Click a card to open its threat model.

**Repositories can be grouped into applications.** Formant synthesises an application-level threat model by merging the threat models of the member repositories. You can scan an application as a single target, so findings are grounded in the combined model, and context documents you upload to the application are folded into it.

**Threat models open in a reading view and can be edited.** Repository and application threat models open inline with a file tree and outline. Your edits are preserved across regenerations.

**Findings are redacted on public pull requests.** For public repositories, the pull request review comment leaves out full titles, descriptions, proof-of-concept code, and file locations for findings outside the changed lines. It shows a count and a link back to Formant, so sensitive details stay out of the public thread. Private and internal repositories are unchanged, and inline comments on the diff itself are unaffected.

**Organisations can set a default fail-on severity.** Organisation admins can set a default severity threshold for pull request and merge request checks in settings. A repository's own configuration takes precedence when set.

**Enterprise SSO is available at sign-in.** A dedicated single sign-on page and a **Single sign-on (SSO)** button on the login screen let users authenticate through your organisation's SAML or OIDC identity provider. Invite tokens survive the IdP round trip, so onboarding links still work.

**The MCP tool can mark duplicates.** The `update_finding` MCP tool accepts a `duplicate_of` field, so you can mark or unmark duplicates programmatically.

See [Context](/docs/platform/context), [applications](/docs/platform/context/applications), [threat models](/docs/platform/context/threat-models), [setting a fail-on severity](/docs/review/config#fail-the-check-on-findings), and [updating a finding through the API](/docs/api/findings/update-finding).

## June 18, 2026

**Triage updates pull request and merge request checks.** When you mark a finding as a false positive or accepted risk, the GitHub check or GitLab commit status flips back to passing right away, with no manual re-run. If you later reopen the finding, the check fails again to match.

**Findings can be closed as duplicates.** Mark a finding as a duplicate of another finding in the same repository, and unmark it if needed. When the pull request gate counts blocking issues, a duplicate inherits its canonical finding's severity.

**The scan volume widget is a stacked bar chart.** It replaces the line graph on the dashboard, and a tooltip on each bar shows the Review and Whitebox scan counts for that day.

**A pentest of an uploaded archive takes the archive's name.** A Whitebox pentest started from an uploaded archive takes the archive's filename as its name instead of a generic label.

See [GitHub and GitLab](/docs/review/integrations/github-gitlab).

## June 15, 2026

**Accounts support multi-factor authentication.** Secure your account with MFA requirements and additional verification steps. Admins can enforce MFA across their organisation.

**A remote MCP server gives access to triage.** External tools and scripts connect to Formant's finding-triage tools through a remote MCP server endpoint, with OAuth and API key authentication.

**Repository configuration can exclude scans.** Use `.hacktron/config.yaml` to exclude pull request scans by file pattern, keywords in titles, or labels.

See [MFA in account settings](/docs/platform/account-settings), [MCP](/docs/mcp), and [repository configuration](/docs/review/config).

## June 11, 2026

**GitLab merge requests are scanned automatically.** Connect a GitLab project and merge request scans turn on by themselves, as they do for GitHub. Turn them off per project whenever you want.

**Signup and trials support GitLab.** Connecting GitLab during signup or a trial follows the same guided setup as GitHub, start to finish.

See [GitLab](/docs/platform/repositories/gitlab).

## June 10, 2026

**Slack alerts carry a Fix with AI button.** Finding alerts in Slack have a **Fix with AI** button that deep-links the issue into Cursor or Claude, so you go from the alert to your editor and fix it there.

**Free trials need no credit card.** Start a free trial without a card. You enter payment details only when you decide to subscribe.

**Findings on abandoned pull requests close themselves.** Close a pull or merge request without merging and its findings move to a **Closed** state. Reopen it and they come back, and anything you already triaged keeps its triage.

**Cost estimation flags unsupported languages up front.** It tells you when a repository is mostly in a language Formant cannot scan yet, instead of failing with no explanation.

**The Connect GitLab dialog walks through Service Accounts.** It takes you through GitLab's group Service Accounts step by step and has a **GitLab.com** and **Self-hosted** toggle that matches the GitHub Enterprise setup.

See [Slack](/docs/platform/communication-apps/slack) and [starting a free trial](/docs/review/billing).

## June 7, 2026

**Formant supports self-hosted GitHub Enterprise Server.** Point Formant at GitHub Enterprise Server for Whitebox pentests and pull request reviews, and run several Enterprise hosts next to github.com at the same time.

**GitLab merge request feedback matches GitHub.** Merge request comments carry severity badges, a collapsible proof of concept, trace diagrams, and a **Fix with AI** block. Trigger a review with `@hacktronai review`. Triage shows up the same across the web app, Slack, and the merge request thread.

**A Whitebox pentest can target an exact tag or commit.** When you pick a repository, you can target a specific tag or commit, not just a branch.

**Jira ticketing handles large projects.** Search large Jira projects and assignee lists while filing a ticket. Issues you create from a finding link back to it.

See [GitHub Enterprise Server](/docs/platform/repositories/github-enterprise-server), [how reviews work](/docs/review/integrations/github-gitlab), and [Jira](/docs/platform/project-management/jira).

## June 4, 2026

**GitHub pull request comments use severity badges.** The badges replace emoji, and a **Fix with AI** prompt reproduces the issue, fixes the root cause, and adds a regression test.

See [how pull request reviews work](/docs/review/integrations/github-gitlab).

## June 3, 2026

**Review limits are pooled across the organisation.** Limits apply to your whole organisation instead of being capped per seat. You can buy developer seats on an annual prepaid plan, and an owner-only Usage page shows usage and any overage for the period.

**The sidebar navigation is redesigned.** Its sections collapse and remember what you left open, and account actions are in the sidebar header.

**You can request a review on demand.** Comment `@hacktron review` on a pull request to review it on the spot, even a draft or an external contributor's pull request.

**You can request GitHub access without being an admin.** If you don't own the GitHub organisation, clicking **Connect** sends an installation request to your admin and marks it pending. The integration appears as soon as they approve.

**Jira setup is simpler.** The Jira configuration and the per-ticket dialog are cleaner, with sensible defaults already on for new installs.

**Signup includes a Slack Connect step.** Sign up with a work email and set up notifications right away through Slack Connect.

See [billing and plans](/docs/review/billing) and [setting up Review](/docs/review/setup).

## June 1, 2026

**Findings open straight into the taint trace.** The taint-trace and call-graph views are rebuilt, open into the trace with collapse animations, and the full-page finding view has the same actions as the sidebar.

**Pentest is renamed Whitebox.** Scans formerly called "Pentest" are called "Whitebox", and **Whitebox Scans** and **PR Reviews** are separate, so it is clear which is a full code scan and which is a pull request review.

**Every finding has a history.** A finding shows a timeline of how it changed from one scan to the next.

See [Whitebox](/docs/whitebox).

## May 26, 2026

**Formant detects duplicates across findings.** When a new finding repeats one Formant already reported, it links the two, so pull request comments point back to the original instead of saying the same thing twice.

## May 19, 2026

**The dashboard has a tab per kind of work.** The **Overview**, **PR Review**, and **Whitebox Scan** tabs each show the metrics for that work.

**Vulnerabilities show a taint-trace timeline and a call graph.** The step-by-step timeline and the interactive call graph mark source, propagation, and sink, so you can follow how an issue moves through your code.

**The Linear integration does more.** Pick a default Linear project, back-fill tickets for existing findings, map finding severity to Linear priority, and mirror Linear status changes back onto the linked finding.

See [Linear](/docs/platform/project-management/linear).

## May 16, 2026

**Owners can turn on overage billing.** Organisation owners can switch on overage billing, so pull request reviews keep running past your included limit and are billed as overage instead of stopping.

See [usage and overage billing](/docs/review/usage).

## May 15, 2026

**Shared scans have a public activity page.** It shows the scan's events, its timeline, and the agents that worked on it.

## May 13, 2026

**Every developer seat includes 50 pull request reviews per billing period.** Extra reviews bill at $1 each, so they keep running instead of stopping.

**Cancelled organisations can resubscribe in one click.** A **Resubscribe** button picks their old plan back up.

**You can invite teammates from Slack.** Invite teammates to your Formant organisation from Slack.

See [usage and overage billing](/docs/review/usage) and [inviting your team on Slack](/docs/platform/communication-apps/slack).

## May 4, 2026

**You can cancel a running scan.** Stop a scan already in progress from the scan view, without waiting for it to finish.

**A setup checklist guides new teams.** A getting-started checklist walks you through connecting your repositories and turning on Review, so new teams reach their first scan sooner.

See [setting up Review](/docs/review/setup).

## April 23, 2026

**Review findings have their own page.** The **Code Review** page shows scan-scoped findings, and pull request comments link back to the finding in Formant.

**Affected code is syntax-highlighted.** Code in the finding view is syntax-highlighted, which makes vulnerable snippets easier to read.

See [Review](/docs/review).

## April 20, 2026

**Formant has a public REST API.** Reach your scans, findings, and repositories programmatically with API keys, documented in interactive API docs.

**Slack unfurls finding and scan links.** The links unfurl with live status, severity, and triage, so your team stays in sync without leaving the channel.

**You can create a Linear issue from a finding.** The issue's details are filled in for you.

**You can cancel or reactivate your subscription yourself.** Do it from the billing page, with no support ticket.

**The billing page is rebuilt.** It shows plans, credits, and subscription status more clearly.

See the [API reference](/docs/api), [Slack](/docs/platform/communication-apps/slack), [Linear](/docs/platform/project-management/linear), and [managing your subscription](/docs/review/billing).

## April 6, 2026

**Vulnerabilities include a trace diagram.** The diagram is in both the finding view and the PDF report, so you can trace how an issue moves through your code.

**Whitebox pentests start from more sources.** Start a pentest from a public repository URL or an uploaded archive, with the source shown in the cost estimate before you commit.

**You can upload context documents.** Upload notes about a repository so reviews understand your codebase and its conventions.

**Findings render Markdown.** Finding descriptions, dismiss reasons, and comments render full Markdown, with one-click copy of the report.

See the [Whitebox quickstart](/docs/whitebox/quickstart).

## March 23, 2026

**You can triage findings in the web app.** Dismiss findings with a reason and leave feedback in an activity thread, in the app.

See the [triage guide](/docs/review/findings-feedback).

## March 18, 2026

**Scans stream their progress in real time.** Findings show up as they are discovered, instead of at the end of the scan.

**You see an estimated cost before you scan.** The estimate appears before you start a scan or a Whitebox pentest.

**You can download a PDF report.** Generate a PDF report of your findings from the browser.

## March 1, 2026

**Whitebox pentests are paid for with credits.** Buy Whitebox credits and spend them on pentests when you are ready.

**Scans can be shared publicly.** Share a scan and its findings through public, read-only pages.

See [Whitebox credits](/docs/whitebox/billing).

## February 18, 2026

**Organisations are billed per seat.** The Sec Seat and Dev Seat plans have per-seat pricing.

See [billing and plans](/docs/review/billing).
