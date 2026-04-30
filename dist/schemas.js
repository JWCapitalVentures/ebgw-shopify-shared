/**
 * Runtime validators (Zod). The TypeScript types in `types.ts` give compile-
 * time safety; these schemas guard the boundaries where data crosses trust
 * domains:
 *
 *   • Reading metaobjects from Shopify (Shopify schema can drift)
 *   • Receiving Kiwi API responses (third-party, no contract guarantee)
 *   • Accepting user-submitted JSON in admin forms
 *
 * On €30k/day stores: a silent type drift = silent prod bug = lost revenue.
 * Always parse(), never trust.
 */
import { z } from 'zod';
import { SCHEMA_VERSION } from './constants.js';
export const UnitSchema = z.enum(['cm', 'in']);
export const TableSectionSchema = z.object({
    type: z.literal('table'),
    id: z.string().min(1),
    title: z.string().optional(),
    unit: UnitSchema,
    headers: z.array(z.string()).min(1),
    rows: z.array(z.array(z.union([z.string(), z.number()]))),
});
export const TextSectionSchema = z.object({
    type: z.literal('text'),
    id: z.string().min(1),
    content: z.string(),
});
export const SizeChartSectionSchema = z.discriminatedUnion('type', [
    TableSectionSchema,
    TextSectionSchema,
]);
export const RuleTypeSchema = z.enum(['tag', 'product', 'collection']);
export const ProductMatchRuleSchema = z.object({
    type: RuleTypeSchema,
    values: z.array(z.string()),
});
export const SizeChartFieldsSchema = z.object({
    name: z.string(),
    default_unit: UnitSchema,
    sections: z.array(SizeChartSectionSchema),
    rules: z.array(ProductMatchRuleSchema),
    linked_product_ids: z.array(z.string()),
    schema_version: z.number().int().nonnegative(),
});
export const SizeChartRecordSchema = z.object({
    id: z.string().min(1),
    handle: z.string().min(1),
    displayName: z.string(),
    updatedAt: z.string().nullable(),
    fields: SizeChartFieldsSchema,
});
/**
 * Cross-row validation: each table row must match the header count. Zod's
 * type-level shape can't express this, so we run it after parse().
 */
export function validateSizeChartFields(fields) {
    const parsed = SizeChartFieldsSchema.safeParse(fields);
    if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0]?.message ?? 'Ongeldig schema' };
    }
    for (const [i, s] of parsed.data.sections.entries()) {
        if (s.type === 'table') {
            for (const [j, row] of s.rows.entries()) {
                if (row.length !== s.headers.length) {
                    return {
                        ok: false,
                        error: `Sectie ${i + 1}, rij ${j + 1}: ${row.length} cellen, verwacht ${s.headers.length}`,
                    };
                }
            }
        }
    }
    if (parsed.data.schema_version > SCHEMA_VERSION) {
        return {
            ok: false,
            error: `Schema-versie ${parsed.data.schema_version} is nieuwer dan deze versie van de package (${SCHEMA_VERSION}). Update de consumer.`,
        };
    }
    return { ok: true };
}
// ─── Kiwi API response (third-party, defensive parsing) ─────────────────────
const KiwiCellSchema = z
    .object({
    type: z.string().optional(),
    value: z.string().optional(),
})
    .passthrough();
const KiwiTableSchema = z
    .object({
    data: z.array(z.array(KiwiCellSchema)).optional(),
})
    .passthrough();
const KiwiLayoutEntrySchema = z
    .object({
    type: z.number().optional(),
    value: z.string().optional(),
})
    .passthrough();
const KiwiSizingSchema = z
    .object({
    name: z.string().optional(),
    tables: z.record(z.string(), KiwiTableSchema).optional(),
    layout: z
        .object({
        data: z.array(KiwiLayoutEntrySchema).optional(),
    })
        .passthrough()
        .optional(),
})
    .passthrough();
export const KiwiResponseSchema = z
    .object({
    sizings: z.array(KiwiSizingSchema).optional(),
})
    .passthrough();
//# sourceMappingURL=schemas.js.map