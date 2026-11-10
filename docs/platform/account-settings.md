---
title: Personal settings
description: Your profile, accounts, and security.
url: https://www.hacktron.ai/docs/platform/account-settings
---

# Personal settings

**Personal settings** holds your profile, your connected accounts, and the security of your Hacktron account. Open it from the account menu in the sidebar header.

## Profile

Your profile sets how you appear to the rest of your organisation.

| Field | What it is |
| --- | --- |
| **Display name** | The name shown on findings, comments, and activity. |
| **Email** | The address you sign in with and receive account notifications at. |
| **Avatar** | The picture shown next to your name across the app. |

## Connected accounts

Connect a source control account when Hacktron needs to associate your activity on that provider with your member account. Each provider appears on its own row under **Connected accounts**.

## Connect Microsoft for Azure DevOps

Linking your Microsoft account lets Hacktron associate Azure DevOps pull requests with your Review seat and member profile. The email on the Microsoft account must match the pull request author's Azure DevOps user principal name (UPN).

::::steps

### Open Personal settings

Open the account menu in the sidebar header and select **Personal settings**.

### Connect Microsoft

Under **Connected accounts**, find **Microsoft** and select **Connect**. If Hacktron asks you to verify your identity first, complete the check.

### Complete Microsoft sign-in

Sign in to the Microsoft account you use for Azure DevOps and approve the connection. Hacktron returns you to **Personal settings** and shows the linked email on the **Microsoft** row.

::::

Connecting doesn't rerun completed reviews. Once the matching Microsoft account is connected, later Azure DevOps pull request activity can reconcile an existing unlinked author entry.

To remove the connection, select **Disconnect**. Disconnecting Microsoft can stop later Azure DevOps activity from being attributed to your Hacktron member account.

## Multi-factor authentication (MFA)

Multi-factor authentication adds a second verification step to sign-in, so a password alone is not enough to access your account. Hacktron strongly recommends turning on MFA for every account.

Organisation-wide security controls are managed separately, in [Security settings](/docs/platform/security-settings).

## Enable MFA

::::steps

### Open Personal settings

Open the account menu in the sidebar header and select **Personal settings**.

![The MFA not set up prompt in Personal settings, with Enable](https://www.hacktron.ai/shots/platform/account-settings/mfa_enable/light.f1f2e649.webp)

### Start MFA setup

On the **MFA not set up** prompt, select **Enable**. Hacktron shows a QR code for your authenticator app.

### Add Hacktron to your authenticator app

Scan the QR code with an authenticator app such as 1Password, Google Authenticator, or Authy. If you can't scan it, enter the setup key by hand.

### Confirm the code

Enter the 6-digit code from your authenticator app to confirm setup. Once it is verified, MFA is required the next time you sign in.

::::

## Save your backup codes

When you enable MFA, Hacktron generates one-time backup codes. Store them in a safe place, such as a password manager.

:::warning
Backup codes are the only way to sign in if you lose access to your authenticator app. Save them somewhere secure and don't share them.
:::

## Disable or reset MFA

You can turn MFA off or run setup again from **Personal settings**. Turning MFA off weakens your account's security, so do it only when you are switching to a new device or authenticator app.
