# Changelog

All notable changes to `@ebgw/shopify-shared` are documented here. Format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning
follows [SemVer](https://semver.org/spec/v2.0.0.html).

Bump-procedure: see
[`docs/sop-schema-bump.md`](https://github.com/JWCapitalVentures/ebgw-hub/blob/main/docs/sop-schema-bump.md)
in the Hub repo. Both consumers (`ebgw-hub` and `Size-chart-app`) pin against
a tag — coordinate merges to avoid drift.

## [0.3.0] — 2026-05-04

### Added

- New module `hub-api` (exported from package root): Zod schemas + inferred
  TypeScript types for the **Hub-Integration API** pattern (Kanaal 2 from
  `ECOSYSTEM.md` §3).
  - `HubDeployRequestSchema` / `HubDeployResponseSchema` — single-product
    chart deploy contract used by `POST /api/hub/deploy`.
  - `HubDeployStatusSchema` — enum (`created` / `reused` / `failed` /
    `skipped`) for chart-deploy outcomes.
  - `HubStatusResponseSchema` — health/capacity probe contract used by
    `GET /api/hub/status`.

### Notes

- **Non-breaking.** Existing exports unchanged. Consumers that don't use
  the new module require no code change.
- Both consumers should bump in coordination once they wire up the
  Hub-Integration API endpoints (Hub) and route handlers (Size-chart-app).
- First implementation lives in `Size-chart-app` for the size_chart deploy
  flow; pattern is the blueprint for future apps (Reviews, FAQ, etc.).

## [0.2.0] — 2026-05-01

### Added

- EBGW Size Chart App detection (`detectEbgwSignature`, `parseEbgwHtml`)
  for concurrent stores running our own app.

## [0.1.0] — 2026-04-29

### Added

- Initial release: SizeChartFields + Zod schemas + content-hash + Kiwi
  detector/parser.
