---
name: safe-plan
description: Make an infrastructure change safely - plan only, read-only credentials, human-approved apply.
disable-model-invocation: true
argument-hint: <change>
---
Change: $ARGUMENTS
1. Use a read-only cloud profile for exploration. Never run `terraform apply`, `pulumi up`, `kubectl apply/delete` or cloud delete commands; I run those.
2. Edit the code, then `terraform plan -out=plan.tfplan` and summarise: resources added / changed / destroyed, anything replaced, cost and downtime risk.
3. Flag destroys and replacements of stateful resources (databases, buckets, volumes) in bold.
4. Secrets come from the cloud's secret manager or CI secrets, never committed or in state outputs.
