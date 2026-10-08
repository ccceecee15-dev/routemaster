---
name: Route Master V2 layout
description: Responsive layout constraint for wide frontend-only master-data pages in this workspace.
---

Wide table content inside the app's Radix scroll container can cause a page feature to resolve against the layout's desktop max width instead of the visible preview width. The feature root should be width-constrained at desktop breakpoints, while wide tables keep their own nested horizontal scroll areas.

**Why:** The V2 rule header and KPI grid initially overflowed the 1280px preview even though the inner tables were intentionally wide.

**How to apply:** Constrain the page-specific root rather than changing the shared MainLayout, and preserve horizontal scrolling only around the table content.

For Route Master changes, modify Route Master V2 only; do not edit the original Route Master. Keep the existing V2 overview and edit experience intact unless the user explicitly changes that scope.

**Why:** The user set this as the project boundary while refining the separate route-rule creation flow.

**How to apply:** Keep new creation behavior inside V2 and avoid changing shared layout or original Route Master behavior as part of V2 work.