---
name: routedesk-release-review
description: Use when reviewing a RouteDesk release for Northwind Freight before it goes to Brightline Pharmacy.
metadata:
  author: dana.whitfield
---

# RouteDesk release review

Dana Whitfield wrote this after NWF-4412 on 2026-03-14, when 1,284 Brightline Pharmacy deliveries were
rescheduled to the wrong depot. Contact: dana.whitfield@northwind.example.org.

## Steps

1. Open the release ticket at https://northwind.atlassian.net/browse/NWF-4412 and read Dana's notes.
2. Pull the build logs from /Users/dana.w/routedesk/logs and check the depot mapping step.
3. Compare the depot table with the one in https://wiki.northwind.internal/routedesk/depots.
4. If a depot id changed, ask Marco in the Leeds dispatch team to confirm before release.

## What went wrong last time

The pharmacy's ops lead wrote: "Half our Tuesday routes went to Wakefield, we lost a full day."
The depot mapping job read a cached table that was six hours old.

## Mistakes to avoid

- Trusting a cached depot table during a release.
- Releasing on a Monday night when the dispatch team is off.
