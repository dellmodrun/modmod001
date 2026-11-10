---
title: Security settings
description: Enforce MFA and set up SAML SSO.
url: https://www.hacktron.ai/docs/platform/security-settings
---

# Security settings

**Security settings** holds the authentication controls for your Hacktron organisation. They apply to every member of the organisation, not only to your own account.

:::tip
To set up MFA for your own account, use [Personal settings](/docs/platform/account-settings#multi-factor-authentication-mfa).
:::

## Require MFA for members

Organisation admins and owners can require MFA for every member of a Hacktron organisation. Once it is required, a member who has not set up MFA must complete setup before they can keep using that organisation.

::::steps

### Open organisation settings

Select the organisation, then go to **Settings**.

### Find the Security section

In **Security**, find **Require MFA for members**.

### Turn on required MFA

Turn on **Require MFA for members**. Hacktron applies the requirement to the current organisation.

:::note
Members who have not set up MFA are asked to complete setup the next time they open the organisation.
:::

::::

## Enterprise SSO

Hacktron supports Enterprise SSO through SAML.

:::warning
The first time you set up SAML SSO, contact Hacktron at [hello@hacktron.ai](mailto:hello@hacktron.ai).
:::

Once Hacktron has set up SSO for your organisation, you can sign in through your identity provider.

::::steps

### Start SSO sign-in

On the login page, select **Single sign-on (SSO)**.

### Enter your work email

Enter your work email address on the domain connected to your SAML identity provider.

### Authenticate with your IdP

Hacktron redirects you to the SAML identity provider configured for that email domain.

### Return to Hacktron

After you authenticate, you return to Hacktron and continue to the page you were signing in to.

::::
