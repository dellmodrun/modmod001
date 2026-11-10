---
title: Context
description: Give Formant lasting context.
url: https://www.hacktron.ai/docs/platform/context
---

# Context

Context tells Formant how your codebase is organised, what matters most, and which security assumptions should carry into future reviews.

Formant combines uploaded documents, repository analysis, triage feedback, and generated threat models, so Review and Whitebox can reason about your system with more than the current diff or pentest target.

:::note
Formant can [create threat models automatically](#automatically-generated-context) from your code and review activity. It doesn't decide how to group your repositories into applications.
:::

## How context is organised

Formant keeps context at two levels, the repository and the application.

A repository is the smallest unit of context. For each connected repository you can add documents and view its generated [threat model](/docs/platform/context/threat-models#repository-threat-models).

An application is a group of related repositories that form one product boundary. You group them yourself and manage the context they share.

:::tiles
- [Applications](/docs/platform/context/applications): Group repositories into one product.
- [Threat models](/docs/platform/context/threat-models): How Formant builds threat models.
:::

## Context documents

A **context document** is a file you upload or write to help Formant understand a repository or application. Formant accepts `.md`, `.markdown`, `.txt`, and `.pdf` files.

:::tip
Good context documents include architecture notes, data-flow diagrams, security policies, threat assessments, and earlier pentest reports.
:::

## Add a document

Upload or write documents when you want to give Formant explicit context from your team.

::::steps

### Select Add Context

On the **Context** page, select **Add Context**.

### Choose a target

Select one or more repositories or applications.

Repository context is tied to those repositories. Application context is tied to an **application**, which can hold several repositories.

:::tip
You can [add an application](/docs/platform/context/applications#create-an-application) in the **Applications** tab.
:::

![The Add context document dialog, with a repository or application picker and options to upload or write a document](https://www.hacktron.ai/shots/platform/context/context_add_document/light.798101e9.webp)

### Upload or write the document

Drag in a file, or choose **Write a new document** to write Markdown directly.

### Add it

Select **Add**. Formant saves the document and queues it for the threat model.

### Sync the context

Go to the repository's or application's context page and select **Regenerate** to update the threat model with the new context.

::::

## Manage documents

Open a repository or application to see its documents in the left sidebar. From there you can view a document, download a PDF, edit Markdown inline, see earlier versions in the **History** tab, or remove a document you no longer need.

:::tip
Keep context durable. Prefer stable security assumptions, architecture, data ownership, and trust boundaries that are unlikely to change often.
:::

## Automatically generated context

Formant creates some context on its own:

- After you create an application, if every repository in it already has a threat model, Formant can generate the application threat model in the background.
- After triage, repeated signals, especially false positives and accepted risks, are folded into the repository threat model over time.
- Before a Whitebox pentest, Formant bootstraps a threat model for any application or repository in the pentest that doesn't have one yet.
- When you upload or remove context documents, you can regenerate the threat model by hand.
