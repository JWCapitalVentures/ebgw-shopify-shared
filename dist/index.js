/**
 * Public surface of @ebgw/shopify-shared.
 *
 * This package is the single source of truth for the shape of size_chart
 * data across every EBGW Shopify app and the EBGW Hub. Drift here =
 * silent prod bugs, so update via tagged versions and bump consumers
 * deliberately.
 */
// Constants — stable identifiers for the metaobject + product metafield.
export { SIZE_CHART_TYPE, PRODUCT_METAFIELD_NAMESPACE, PRODUCT_METAFIELD_KEY, PRODUCT_METAFIELD_TYPE, SCHEMA_VERSION, } from './constants.js';
// Pure helpers — section IDs, empty-state, content-hash for dedupe.
export { newSectionId, emptySizeChart, sizeChartContentHash } from './helpers.js';
// Runtime validation (Zod). Use at every trust boundary.
export { UnitSchema, TableSectionSchema, TextSectionSchema, SizeChartSectionSchema, RuleTypeSchema, ProductMatchRuleSchema, SizeChartFieldsSchema, SizeChartRecordSchema, KiwiResponseSchema, validateSizeChartFields, } from './schemas.js';
// Kiwi Sizing extraction — detect, fetch URL, parse to sections.
export { KIWI_API_BASE, detectKiwiSignature, buildKiwiChartUrl, parseKiwiResponse, sanitizeKiwiHtml, } from './kiwi.js';
// EBGW Size Chart App detection (concurrent stores die onze eigen app gebruiken).
// Geen API-call nodig — data zit inline in de HTML als JSON-blob.
export { detectEbgwSignature, parseEbgwHtml } from './ebgw.js';
// Unit detection helpers.
export { detectUnit, stripUnitSuffix } from './unit-detect.js';
//# sourceMappingURL=index.js.map