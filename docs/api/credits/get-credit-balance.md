---
title: Get credit balance
description: Read the Whitebox credit balance.
url: https://www.hacktron.ai/docs/api/credits/get-credit-balance
---

# Get credit balance

Returns the Whitebox credits available to the organisation, with the totals purchased, used, refunded, and granted. `is_unlimited` is true for organisations without a credit limit.

## Request

`GET /credits`

Send an [API key](/docs/api/authentication) with the `read` scope in the `X-Api-Key` header.

:::examples

```bash title="Request" wrap=false
curl "https://api.hacktron.ai/v1/credits" \
  -H "X-Api-Key: $HACKTRON_API_KEY"
```

```json title="Response 200 OK" showLineNumbers=false wrap=false
{
  "organization_id": "f336d0bc-b841-465b-8045-024475c079dd",
  "balance": 12000,
  "total_purchased": 16000,
  "total_used": 8000,
  "total_refunded": 4000,
  "total_granted": 2000,
  "used_this_period": 1240,
  "is_unlimited": false
}
```

:::

## Responses

### 200 OK

| Field | Type | Description |
| --- | --- | --- |
| `organization_id` | string, required | Organization UUID. |
| `balance` | number, required | Current pentest credit balance available for use. |
| `total_purchased` | number, required | Total pentest credits purchased across all time. |
| `total_used` | number, required | Total pentest credits deducted for completed/running pentests. |
| `total_refunded` | number, required | Total pentest credits refunded from cancelled pentests. |
| `total_granted` | number, required | Total pentest credits granted at no charge. |
| `used_this_period` | number, required, nullable | Credits deducted since the start of the current billing period, null when the organization has no billing period. |
| `is_unlimited` | boolean, required | Whether this organization has internal unlimited pentest entitlement. |
