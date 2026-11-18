---
name: analysis-report
description: Turn a data question into a reproducible marimo notebook and a short findings report.
disable-model-invocation: true
argument-hint: <question>
---
Question: $ARGUMENTS
1. Load data with DuckDB (SQL over CSV/Parquet) or Polars; record row counts and date ranges; check nulls and duplicates first.
2. Build the analysis in `notebooks/<slug>.py` (marimo), one cell per step, charts with clear titles and units.
3. Write `reports/<slug>.md`: the answer in the first sentence, 3-5 findings with numbers, caveats (sample size, missing data), and how to re-run (`uv run marimo run notebooks/<slug>.py`).
4. Never invent numbers; every figure must come from a cell output.
