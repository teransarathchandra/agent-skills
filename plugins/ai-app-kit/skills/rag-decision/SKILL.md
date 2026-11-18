---
name: rag-decision
description: Decide between long-context caching, agentic search and RAG for a knowledge feature, with the reasons.
disable-model-invocation: true
---
Measure the corpus (tokens, number of documents, update frequency) and choose:
- Under ~200k tokens and slowly changing: put it all in the prompt with prompt caching. No retrieval system.
- Code or files that change often: agentic search (grep/glob/read tools) instead of an index.
- Large multi-document corpus: hybrid retrieval - contextual chunk embeddings + BM25 + reranking (Anthropic reports 67% fewer retrieval failures with all three), pgvector first, managed vector DB only if scale demands.
Write the decision, numbers and trade-offs into SPEC.md, and add retrieval cases to the eval set.
