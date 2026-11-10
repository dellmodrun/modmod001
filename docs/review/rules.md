---
title: Project rules
description: Give reviews context in rules.md.
url: https://www.hacktron.ai/docs/review/rules
---

# Project rules

Hacktron can use repository-specific context when it reviews pull requests. Add a `.hacktron/rules.md` file that describes the conventions that matter in your application. Rules help Hacktron adapt its reviews to your codebase and report fewer false positives, without ignoring real vulnerabilities.

## What to include

Use rules to explain:

- internal authentication and authorisation patterns
- trusted services, domains, and data sources
- context outside the code that affects exploitability, such as firewalls or network configuration that isn't in infrastructure as code
- files or types of vulnerabilities Hacktron should ignore

## File location

Place the file in the `.hacktron` directory at the root of the repository:

```text
.hacktron/
  rules.md
apps/
packages/
package.json
pnpm-lock.yaml
```

Commit `.hacktron/rules.md` to the branch Hacktron reviews, such as your default branch.

## Example

```markdown title=".hacktron/rules.md"
- Users with the `admin` role are assumed to be trusted and should be exempt from access control checks.
- Do not report XSS vulnerabilities in admin pages, but report them in user-facing pages.
- Requests from `internal-api.local` are trusted service-to-service calls.
- Payment flows under `src/billing/**` are high risk and should be reviewed strictly.
```

## Related

`.hacktron/config.yaml` is a separate file: it excludes pull requests from scanning and fails the check on findings. [Repository configuration](/docs/review/config) covers it.
