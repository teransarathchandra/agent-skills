---
name: bot-smoke-test
description: Run a bot locally against the real platform through a tunnel and check each command once.
disable-model-invocation: true
---
1. Tokens only from `.env` (gitignored); never print them. Use a separate dev workspace/server/bot, never production.
2. Start the bot (`pnpm tsx src/index.ts`). For webhook platforms expose it with `cloudflared tunnel --url http://localhost:<port>` and set the webhook URL in the platform console (tell me exactly where).
3. Walk me through triggering each command in SPEC.md; read logs and report pass/fail per command.
4. Verify request signatures (Slack signing secret, WhatsApp X-Hub-Signature-256) are checked in code.
