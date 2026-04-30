/**
 * Stable identifiers for the size_chart metaobject + product metafield.
 *
 * These constants are the contract between every EBGW app that touches
 * size charts. Bumping them here is a breaking change — bump SCHEMA_VERSION
 * and provide a migration path on the consumer side.
 */
export declare const SIZE_CHART_TYPE = "size_chart";
export declare const PRODUCT_METAFIELD_NAMESPACE = "custom";
export declare const PRODUCT_METAFIELD_KEY = "size_chart";
export declare const PRODUCT_METAFIELD_TYPE = "metaobject_reference";
/**
 * Increment when the structure of `SizeChartFields` (or any sub-shape) changes
 * in a way that requires a parser-side migration. Consumers MUST handle older
 * versions for at least one release after a bump (read-time migration).
 */
export declare const SCHEMA_VERSION = 2;
//# sourceMappingURL=constants.d.ts.map