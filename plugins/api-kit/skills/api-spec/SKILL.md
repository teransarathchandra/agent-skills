---
name: api-spec
description: Turn the API requirements into an OpenAPI-first SPEC.md plus failing contract tests before implementation.
disable-model-invocation: true
---
1. From SPEC.md (or interview me briefly), define resources, endpoints, request/response schemas with Zod, error format, auth and pagination.
2. Generate `openapi.yaml` from the Zod schemas (`@hono/zod-openapi`), lint it with `npx @redocly/cli lint openapi.yaml`.
3. Write one failing Vitest contract test per endpoint using `app.request(...)` (status, shape, error cases). Name these tests in SPEC.md so the build loop runs exactly them.
4. Stop for my review before implementing.
