/**
 * Pure types for the size_chart metaobject. Importable from any environment
 * (browser/Node/edge) — no I/O, no Shopify SDK dependencies.
 */

export type Unit = 'cm' | 'in';

export type TableSection = {
  type: 'table';
  id: string;
  title?: string;
  unit: Unit;
  headers: string[];
  rows: Array<Array<string | number>>;
};

export type TextSection = {
  type: 'text';
  id: string;
  /** HTML allowed (sanitized server-side before write). */
  content: string;
};

export type SizeChartSection = TableSection | TextSection;

export type RuleType = 'tag' | 'product' | 'collection';

export type ProductMatchRule = {
  type: RuleType;
  values: string[];
};

/**
 * The full payload stored in a `size_chart` metaobject. Every consumer reads
 * the same shape — bumping this is a breaking change (see SCHEMA_VERSION).
 */
export type SizeChartFields = {
  name: string;
  default_unit: Unit;
  sections: SizeChartSection[];
  rules: ProductMatchRule[];
  /** Shopify GIDs of products explicitly linked (in addition to rule matches). */
  linked_product_ids: string[];
  schema_version: number;
};

/**
 * What the Shopify Admin API returns when listing/fetching size_chart
 * metaobjects. Wrapper around `fields` plus identity.
 */
export type SizeChartRecord = {
  id: string;
  handle: string;
  displayName: string;
  updatedAt: string | null;
  fields: SizeChartFields;
};
