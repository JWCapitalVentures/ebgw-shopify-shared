/**
 * Public surface of @ebgw/shopify-shared.
 *
 * This package is the single source of truth for the shape of size_chart
 * data across every EBGW Shopify app and the EBGW Hub. Drift here =
 * silent prod bugs, so update via tagged versions and bump consumers
 * deliberately.
 */
export { SIZE_CHART_TYPE, PRODUCT_METAFIELD_NAMESPACE, PRODUCT_METAFIELD_KEY, PRODUCT_METAFIELD_TYPE, SCHEMA_VERSION, } from './constants.js';
export type { Unit, TableSection, TextSection, SizeChartSection, RuleType, ProductMatchRule, SizeChartFields, SizeChartRecord, } from './types.js';
export { newSectionId, emptySizeChart, sizeChartContentHash } from './helpers.js';
export { UnitSchema, TableSectionSchema, TextSectionSchema, SizeChartSectionSchema, RuleTypeSchema, ProductMatchRuleSchema, SizeChartFieldsSchema, SizeChartRecordSchema, KiwiResponseSchema, validateSizeChartFields, } from './schemas.js';
export type { KiwiResponse, KiwiSizing } from './schemas.js';
export { KIWI_API_BASE, detectKiwiSignature, buildKiwiChartUrl, parseKiwiResponse, sanitizeKiwiHtml, } from './kiwi.js';
export type { KiwiSignature, ParsedKiwiChart } from './kiwi.js';
export { detectEbgwSignature, parseEbgwHtml } from './ebgw.js';
export type { EbgwSignature, ParsedEbgwChart } from './ebgw.js';
export { detectUnit, stripUnitSuffix } from './unit-detect.js';
export { HubDeployRequestSchema, HubDeployResponseSchema, HubDeployStatusSchema, HubStatusResponseSchema, } from './hub-api.js';
export type { HubDeployRequest, HubDeployResponse, HubDeployStatus, HubStatusResponse, } from './hub-api.js';
//# sourceMappingURL=index.d.ts.map