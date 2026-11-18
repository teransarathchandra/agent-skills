---
name: scrape-safely
description: Build a scraper or automation responsibly - terms check, rate limits, fixtures, retries, no personal data hoarding.
disable-model-invocation: true
---
1. Check the site's terms and robots.txt; tell me if scraping is disallowed or needs login before writing code. Prefer an official API when one exists.
2. Save 2-3 real pages as fixtures in `tests/fixtures/` and write parser tests against them first.
3. Rate limit (concurrency 1-2, delays), identify with a clear User-Agent, retry with backoff, stop on 4xx bursts.
4. Store only fields the spec needs; no personal data unless the client has a lawful basis.
5. Selector drift: parsers fail loudly with the URL and the missing selector.
