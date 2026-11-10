---
title: Applications
description: Group repositories into one product.
url: https://www.hacktron.ai/docs/platform/context/applications
---

# Applications

An **application** is a group of related repositories that form one product boundary, for example a web frontend, backend microservices, and infrastructure repositories that interact as parts of the same product.

When you create an application, Hacktron can build a threat model for the whole application and use it to reason about the application's repositories when it reviews code or runs a Whitebox pentest.

## Prerequisites

- At least one connected repository.
- You must be an organisation admin to create, edit, or delete applications.

## Create an application

::::steps

### Open Context

In Hacktron, go to **Context** and select the **Applications** tab.

### Create the application

Click **New application**, enter a name, and select the repositories that belong to the application.

A repository can belong to one application at a time.

![The New application dialog, with a name and the repositories to include](https://www.hacktron.ai/shots/platform/context/applications/new_application/light.1e4b56d6.webp)

### Add application context

Open the application and click **Add Context** to upload shared, product-level documents.

:::tip
Application documents stay attached to the application. Documents about one repository can be [attached to that repository](/docs/platform/context#add-a-document).
:::

### Generate the application threat model

Click **Generate** to create the application threat model.

[Threat models](/docs/platform/context/threat-models#application-threat-models) covers how application threat models are generated and refreshed, and [editing and history](/docs/platform/context/threat-models#editing-and-history) covers how to edit one and view its history.

::::

## What belongs in an application

Group repositories that form one product boundary or security boundary. Good examples:

- a web frontend, API server, background worker, and infrastructure repository that ship together
- several services that share authentication, authorisation, tenant isolation, or sensitive data flows
- a monorepo split into deployable components that should be reviewed as one application

Don't use one application as a catch-all for unrelated products. Broad groupings make the generated context less precise.

## Manage repositories

In **Context**, select the **Applications** tab and open an application to see its member repositories. Use **Edit Application** to rename it or change which repositories belong to it.

A repository you remove from an application stays connected to Hacktron. You can still manage it from **Repositories** and from the **Repositories** tab in **Context**.

To delete the application, select **Edit Application**, then **Delete application**.

## Best practices

Application context suits information that applies across the application:

- trust boundaries between services
- shared authentication or authorisation assumptions
- tenant or workspace isolation rules

For details that apply to one repository only, attach the document to that repository instead.

## Next steps

Connect and enable repositories before you group them into applications.

:::tiles
- [Threat models](/docs/platform/context/threat-models): How Hacktron builds threat models.
- [Repositories](/docs/platform/repositories): Choose the repositories to review.
:::
