---
name: eval-first
description: Write the golden evaluation set and promptfoo config before building an LLM feature.
disable-model-invocation: true
argument-hint: <feature>
---
Feature: $ARGUMENTS
1. Interview me: what a correct answer is, what a harmful or wrong answer is, which inputs are tricky.
2. Write 20-50 cases in `evals/cases.yaml` (input, expected facts or rubric, must-not-say) covering easy, edge and adversarial inputs.
3. Write `evals/promptfooconfig.yaml` with deterministic assertions first (contains, JSON schema, regex) and an LLM-rubric judge using a different model than the app uses.
4. Record the pass threshold in SPEC.md. Only then build the feature; `scripts/verify.sh` runs the first 10 cases locally.
