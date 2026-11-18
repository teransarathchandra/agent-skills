---
name: payments-safety
description: Payment and store safety checklist - test keys only, webhook signatures, idempotency, no card data on our servers.
disable-model-invocation: true
---
1. Only test-mode keys (sk_test_, Shopify dev store) in this repo and session; live keys exist only in the host's secret store.
2. Webhooks: verify signatures (stripe.webhooks.constructEvent / Shopify HMAC), handle retries idempotently (store event IDs), return 2xx fast.
3. Card data never touches our servers: Checkout, Payment Element or Shopify checkout only.
4. Test with `stripe listen --forward-to localhost:<port>/webhooks` and `stripe trigger <event>` for each path in SPEC.md.
5. Amounts in the smallest currency unit; currency explicit; refunds and disputes handled.
