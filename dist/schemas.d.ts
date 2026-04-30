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
export declare const UnitSchema: z.ZodEnum<{
    cm: "cm";
    in: "in";
}>;
export declare const TableSectionSchema: z.ZodObject<{
    type: z.ZodLiteral<"table">;
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    unit: z.ZodEnum<{
        cm: "cm";
        in: "in";
    }>;
    headers: z.ZodArray<z.ZodString>;
    rows: z.ZodArray<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
}, z.core.$strip>;
export declare const TextSectionSchema: z.ZodObject<{
    type: z.ZodLiteral<"text">;
    id: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
export declare const SizeChartSectionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"table">;
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    unit: z.ZodEnum<{
        cm: "cm";
        in: "in";
    }>;
    headers: z.ZodArray<z.ZodString>;
    rows: z.ZodArray<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"text">;
    id: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>], "type">;
export declare const RuleTypeSchema: z.ZodEnum<{
    tag: "tag";
    product: "product";
    collection: "collection";
}>;
export declare const ProductMatchRuleSchema: z.ZodObject<{
    type: z.ZodEnum<{
        tag: "tag";
        product: "product";
        collection: "collection";
    }>;
    values: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const SizeChartFieldsSchema: z.ZodObject<{
    name: z.ZodString;
    default_unit: z.ZodEnum<{
        cm: "cm";
        in: "in";
    }>;
    sections: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"table">;
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        unit: z.ZodEnum<{
            cm: "cm";
            in: "in";
        }>;
        headers: z.ZodArray<z.ZodString>;
        rows: z.ZodArray<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"text">;
        id: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>], "type">>;
    rules: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            tag: "tag";
            product: "product";
            collection: "collection";
        }>;
        values: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
    linked_product_ids: z.ZodArray<z.ZodString>;
    schema_version: z.ZodNumber;
}, z.core.$strip>;
export declare const SizeChartRecordSchema: z.ZodObject<{
    id: z.ZodString;
    handle: z.ZodString;
    displayName: z.ZodString;
    updatedAt: z.ZodNullable<z.ZodString>;
    fields: z.ZodObject<{
        name: z.ZodString;
        default_unit: z.ZodEnum<{
            cm: "cm";
            in: "in";
        }>;
        sections: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"table">;
            id: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            unit: z.ZodEnum<{
                cm: "cm";
                in: "in";
            }>;
            headers: z.ZodArray<z.ZodString>;
            rows: z.ZodArray<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"text">;
            id: z.ZodString;
            content: z.ZodString;
        }, z.core.$strip>], "type">>;
        rules: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                tag: "tag";
                product: "product";
                collection: "collection";
            }>;
            values: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        linked_product_ids: z.ZodArray<z.ZodString>;
        schema_version: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Cross-row validation: each table row must match the header count. Zod's
 * type-level shape can't express this, so we run it after parse().
 */
export declare function validateSizeChartFields(fields: unknown): {
    ok: boolean;
    error?: string;
};
declare const KiwiSizingSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    tables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodString>;
            value: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>>;
    }, z.core.$loose>>>;
    layout: z.ZodOptional<z.ZodObject<{
        data: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodNumber>;
            value: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>;
    }, z.core.$loose>>;
}, z.core.$loose>;
export declare const KiwiResponseSchema: z.ZodObject<{
    sizings: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        tables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
                type: z.ZodOptional<z.ZodString>;
                value: z.ZodOptional<z.ZodString>;
            }, z.core.$loose>>>>;
        }, z.core.$loose>>>;
        layout: z.ZodOptional<z.ZodObject<{
            data: z.ZodOptional<z.ZodArray<z.ZodObject<{
                type: z.ZodOptional<z.ZodNumber>;
                value: z.ZodOptional<z.ZodString>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export type KiwiResponse = z.infer<typeof KiwiResponseSchema>;
export type KiwiSizing = z.infer<typeof KiwiSizingSchema>;
export {};
//# sourceMappingURL=schemas.d.ts.map