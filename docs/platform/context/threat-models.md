---
title: Threat models
description: How Hacktron builds threat models.
url: https://www.hacktron.ai/docs/platform/context/threat-models
---

# Threat models

A **threat model** is a living Markdown document that Hacktron maintains as durable security context. It records the system model, crown jewels, trust boundaries, security invariants, confirmed vulnerability patterns, accepted risks, and recurring false-positive patterns.

Hacktron uses threat models to give Review and Whitebox more context, and it updates them over time.

:::note
Hacktron can [create threat models automatically](/docs/platform/context#automatically-generated-context) from your code and review activity. It doesn't decide how to group your repositories into applications.
:::

## Custom context documents

When you add or remove context documents, Hacktron tracks whether each one has been folded into the relevant threat model. The context document list shows each document's status:

| Status | Meaning |
| --- | --- |
| **Synced** | The document is folded into the current threat model. |
| **Pending** | A sync is running for the target repository. |
| **Not synced** | The document isn't folded into the threat model yet. |

:::tip
Hacktron treats uploaded documents as a source of truth and prioritises them over its own analysis. Make sure the documents you upload are accurate and up to date.
:::

## Repository threat models

Hacktron builds and updates a repository's threat model from:

- the repository's code and the docs its maintainers wrote
- uploaded repository context documents
- triage feedback, such as false positives and accepted risks
- `.hacktron/rules.md`, when the repository has one

Hacktron creates a repository's threat model automatically the first time it reviews a pull request there, or as soon as you upload context documents for the repository. After that, it keeps learning from how you triage findings.

To view it, go to **Context**, select the **Repositories** tab, choose a repository, and select **Threat model**.

Documents you add by hand reach the threat model once it syncs, which usually happens automatically. To sync now, open the repository and select **Sync (number) pending**.

![A repository's threat model with the Sync 1 pending button](https://www.hacktron.ai/shots/platform/context/threat-models/sync_pending/light.1c24043c.webp)

## Application threat models

An application threat model covers a group of related repositories, for example a web frontend, backend microservices, and infrastructure repositories that interact as parts of the same product.

Hacktron synthesises it from:

- the application's member repositories
- each repository's existing threat model
- uploaded application-level context documents
- checks across repositories against the code, such as service-to-service calls, shared auth assumptions, and data-flow boundaries

Go to **Context**, select the **Applications** tab, choose an application, and select **Application threat model**. If the application has no threat model yet, click **Generate**.

After you add documents by hand, click **Regenerate** to update the threat model with the new context.

![An application threat model that is not generated yet, with the Generate button](https://www.hacktron.ai/shots/platform/context/threat-models/generate_application_threat_model/light.8dc3b293.webp)

## Editing and history

Threat models and context documents each have a document view and a history view. Use the history to review revisions: created, edited, auto-synced, and application synthesis.

![The History tab of a threat model, with an auto-synced first version](https://www.hacktron.ai/shots/platform/context/threat-models/threat_model_history/light.72f9d67d.webp)

When you edit a threat model by hand, Hacktron treats the lines you edited as maintainer-owned. Later syncs and regenerations don't overwrite them.

![A threat model open for editing, with Cancel and Save](https://www.hacktron.ai/shots/platform/context/threat-models/threat_model_edit/light.73a64779.webp)

If you delete one of your own edited lines, Hacktron treats the deletion as intentional and doesn't restore the line on the next sync.

:::tip
Manual edits should keep to durable security context. For a detail that is temporary or only useful for one scan, use a scan-specific note rather than changing the threat model.
:::
