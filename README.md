# @ebgw/shopify-shared

Single source of truth for **size_chart** metaobject types, runtime
validation, and Kiwi/EBGW extraction logic. Used by:

- **size-chart-app** ([Size-chart-app](https://github.com/JWCapitalVentures/Size-chart-app)) — Shopify app (theme extension + admin UI)
- **ebgw-hub** ([ebgw-hub](https://github.com/JWCapitalVentures/ebgw-hub)) — internal research/import dashboard

> 🌐 **Onderdeel van het [EBGW app-ecosysteem][ecosystem]** — dit package is
> het schema-contract tussen alle apps. Zie de ecosystem-doc voor de bredere
> visie en wanneer een schema-bump nodig is.

[ecosystem]: https://github.com/JWCapitalVentures/ebgw-hub/blob/main/ECOSYSTEM.md

## Why this package exists

Both apps read/write the same Shopify metaobjects. Without a shared
package they'd duplicate types, constants, and parser logic — and
silently drift. On stores doing €30k+/day, schema drift = silent prod
bugs = lost revenue.

This package is the contract: change the shape here, bump the version,
update both consumers deliberately.

## Install (consumer apps)

```bash
npm install git+https://github.com/JWCapitalVentures/ebgw-shopify-shared.git#v0.1.0
```

Pin to a specific tag so a `git push` to main doesn't auto-upgrade
production. The repo is public so no auth is needed during install.

## What's exported

```ts
import {
  // Constants — the metaobject contract
  SIZE_CHART_TYPE,
  PRODUCT_METAFIELD_NAMESPACE,
  PRODUCT_METAFIELD_KEY,
  PRODUCT_METAFIELD_TYPE,
  SCHEMA_VERSION,

  // Types
  type SizeChartFields,
  type SizeChartSection,
  type SizeChartRecord,

  // Pure helpers
  emptySizeChart,
  newSectionId,
  sizeChartContentHash, // for dedupe during bulk-migration

  // Zod schemas for runtime validation at trust boundaries
  SizeChartFieldsSchema,
  KiwiResponseSchema,
  validateSizeChartFields,

  // Kiwi Sizing extraction (used in research scrape + migration)
  detectKiwiSignature,
  buildKiwiChartUrl,
  parseKiwiResponse,
} from '@ebgw/shopify-shared';
```

## Schema versioning

`SCHEMA_VERSION` is a single integer. Bump on any breaking change to
`SizeChartFields`. Consumers MUST handle older versions for at least
one release after a bump — read-time migration, not data migration.

## Contributing

```bash
npm install
npm run build       # tsc → dist/
npm run typecheck   # no-emit type check
```

Releases are tag-driven:

```bash
# After committing your changes:
npm version patch   # or minor / major
git push origin main --follow-tags
```

Then bump consumer dependencies to the new tag.
