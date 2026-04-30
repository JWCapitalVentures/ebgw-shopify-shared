import type { SizeChartFields } from './types.js';
export declare function newSectionId(): string;
export declare function emptySizeChart(): SizeChartFields;
/**
 * Stable content-hash of a chart's *display payload*. Used for dedupe during
 * bulk-migration (Kiwi → own app): two products that share an identical chart
 * should map to the same metaobject, not duplicates.
 *
 * Excluded from the hash: name, rules, linked_product_ids — those are
 * organisational metadata that legitimately differs between deduped charts.
 */
export declare function sizeChartContentHash(fields: SizeChartFields): string;
//# sourceMappingURL=helpers.d.ts.map