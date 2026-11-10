---
title: People
description: Manage seats and developer access.
url: https://www.hacktron.ai/docs/review/people
---

# People

**People** controls which developers can use Review. Formant reviews a developer's pull requests or merge requests only when that developer has a Review seat.

## Requirements

- an active free trial or paid Formant subscription
- a connected [Git provider integration](/docs/platform/repositories)

## Auto-assign seats on pull requests

With auto-assignment, Formant assigns Review seats as developers open pull requests. It is the default assignment mode for new organisations. While it is on:

- Formant assigns a seat when a developer opens a pull request in a covered repository.
- Auto-assignment stops when the organisation reaches its configured [auto-assignment seat limit](#configure-the-seat-limit).

To turn it off, use **People** > **Auto-assign on PR**.

:::note
Bots count as developers too. If a bot such as Devin (`devin-ai-integration[bot]`) or Claude (`claude[bot]`) opens a pull request while auto-assignment is on, it gets a seat and is billed like anyone else. To keep bots out of review and billing, add their usernames to [`exclude.authors`](/docs/review/config#exclude-scans) or the organisation-wide author filter. Formant skips excluded authors before it assigns a seat. You can also remove a bot's seat from **People** at any time.
:::

A user who receives an automatically assigned seat starts with the **Unassigned** role. You can change it to Viewer, Member, Admin, or Owner.

![Auto-filled GitHub users in People, each with the Unassigned role](https://www.hacktron.ai/shots/review/people/auto_filled_seats/light.c8b1446b.webp)

When the user signs in to Formant and links their GitHub or GitLab account, Formant reconciles their account with the auto-assigned seat.

## Configure the seat limit

You can limit how many Review seats Formant assigns automatically. The default limit is 50 seats.

::::steps

### Open People

Go to **People**.

### Open the auto-assignment settings

Click the cog icon next to **Auto-assign on PR** to open **Auto assignment settings**.

### Save the maximum seat count

Enter the maximum number of Review seats that can be assigned automatically, and save.

![Auto assignment settings, with the maximum number of seats allowed](https://www.hacktron.ai/shots/review/people/auto_assignment_settings/light.5a58a116.webp)

::::

## Assign seats manually

Use manual assignment when you want admins to choose exactly who is covered.

::::steps

### Open People

Go to **People** in the Formant Platform.

### Find the developer

Find the organisation member with search, the role filters, or the seat-type filter.

### Assign the Review seat

Turn on the **Code Review seat** toggle for that developer.

::::

In manual assignment mode, Formant doesn't review a pull request opened by a developer without a seat. Instead, the pull request gets a comment explaining that the developer needs a Review seat.

## Inactive reassignment

When auto-assignment is on and the organisation is at its configured capacity, Formant can reassign an inactive Review seat to the developer who opened the pull request. The default inactivity threshold is 30 days.

If no inactive seat is available, Formant blocks the review and asks the organisation to raise the seat limit or remove an existing seat.

## Remove a seat

Remove a Review seat when a developer no longer needs pull request or merge request review coverage. To remove it, click the red trash icon at the right of the developer's row.

The removed seat still counts towards the current billing period's seat count, but you can reassign it to another developer.
