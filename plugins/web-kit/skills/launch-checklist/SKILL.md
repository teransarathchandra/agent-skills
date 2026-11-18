---
name: launch-checklist
description: Pre-launch checklist for a site - SEO meta, social cards, sitemap, accessibility, performance, analytics, domain.
disable-model-invocation: true
---
Go through and report pass/fail with the fix for each failure:
1. Every page has a unique `<title>`, meta description, canonical URL, Open Graph and Twitter card image.
2. `sitemap.xml`, `robots.txt`, favicon set, 404 page exist.
3. Accessibility: run `npx @axe-core/cli <url>` (or `@axe-core/playwright` in tests); headings in order, alt text, focus visible, colour contrast.
4. Performance: `npx lighthouse <url> --only-categories=performance,accessibility,seo,best-practices --quiet --output=json` and report the scores (target 95+).
5. Analytics and contact form work; no secrets in client bundles; production env vars set on the host.
6. Custom domain, HTTPS and redirects (www/apex) on the host.
