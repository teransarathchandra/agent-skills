---
name: cost-guard
description: Audit an LLM feature for token cost - model choice, prompt caching, max_tokens, batching and usage logging.
disable-model-invocation: true
---
Check and fix: model per task (Haiku for routing/classification, Sonnet by default, Opus only where evals prove it is needed); prompt caching on the stable prefix (system prompt, tools, documents) and cache hits visible in usage; `max_tokens` set on every call; Batch API for offline jobs; usage (input, output, cache read/write) logged per request; a per-user or per-day spend limit. Report estimated cost per 1,000 requests before and after.
