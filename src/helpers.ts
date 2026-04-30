/**
 * Pure helpers — no I/O, safe everywhere.
 */
import { SCHEMA_VERSION } from './constants.js';
import type { SizeChartFields, SizeChartSection } from './types.js';

export function newSectionId(): string {
  return `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptySizeChart(): SizeChartFields {
  return {
    name: '',
    default_unit: 'cm',
    sections: [],
    rules: [],
    linked_product_ids: [],
    schema_version: SCHEMA_VERSION,
  };
}

/**
 * Stable content-hash of a chart's *display payload*. Used for dedupe during
 * bulk-migration (Kiwi → own app): two products that share an identical chart
 * should map to the same metaobject, not duplicates.
 *
 * Excluded from the hash: name, rules, linked_product_ids — those are
 * organisational metadata that legitimately differs between deduped charts.
 */
export function sizeChartContentHash(fields: SizeChartFields): string {
  const normalized = {
    default_unit: fields.default_unit,
    sections: fields.sections.map((s) => normalizeSection(s)),
  };
  return cheapHash(JSON.stringify(normalized));
}

function normalizeSection(s: SizeChartSection): unknown {
  if (s.type === 'table') {
    return {
      type: 'table',
      title: s.title?.trim() ?? '',
      unit: s.unit,
      headers: s.headers.map((h) => h.trim()),
      rows: s.rows.map((row) => row.map((c) => (typeof c === 'string' ? c.trim() : c))),
    };
  }
  return { type: 'text', content: s.content.trim() };
}

/**
 * Tiny non-cryptographic 32-bit hash (FNV-1a). Adequate for content-dedupe;
 * NOT adequate for security or trust boundaries.
 */
function cheapHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
