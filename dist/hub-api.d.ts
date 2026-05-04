/**
 * Shared shapes for Kanaal 2 — Hub-Integration API per app.
 *
 * Single contract used by both sides of the wire:
 *   - The Hub's typed client (`ebgw-hub`) — sender + response-validator
 *   - Each app's `POST /api/hub/*` route handlers — receiver + responder
 *
 * Trust-boundary parsing rule:
 *   - The Hub `.parse()`s its outgoing body before fetch
 *     (catches programmer error early as FatalError)
 *   - The Hub `.parse()`s the incoming response (catches schema drift as
 *     RetryableError — kan transient zijn tijdens een mismatched-deploy window)
 *   - The app-side route handler `.safeParse()`s the incoming body and
 *     400's on failure with a readable error
 *
 * Version-pin discipline: any change to a request/response shape requires
 * a coordinated bump in consumers. See `docs/sop-schema-bump.md` in the
 * Hub repo for the procedure.
 */
import { z } from 'zod';
export declare const HubDeployRequestSchema: z.ZodObject<{
    shop_domain: z.ZodString;
    product_id: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    chart: z.ZodObject<{
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
    options: z.ZodOptional<z.ZodObject<{
        unit_override: z.ZodOptional<z.ZodEnum<{
            cm: "cm";
            in: "in";
            auto: "auto";
        }>>;
        correlation_id: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const HubDeployStatusSchema: z.ZodEnum<{
    created: "created";
    reused: "reused";
    failed: "failed";
    skipped: "skipped";
}>;
export declare const HubDeployResponseSchema: z.ZodObject<{
    status: z.ZodEnum<{
        created: "created";
        reused: "reused";
        failed: "failed";
        skipped: "skipped";
    }>;
    metaobject_gid: z.ZodOptional<z.ZodString>;
    chart_handle: z.ZodOptional<z.ZodString>;
    content_hash: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    correlation_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const HubStatusResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    version: z.ZodString;
    configured_shops: z.ZodArray<z.ZodString>;
    schema_versions: z.ZodObject<{
        size_chart: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type HubDeployRequest = z.infer<typeof HubDeployRequestSchema>;
export type HubDeployResponse = z.infer<typeof HubDeployResponseSchema>;
export type HubDeployStatus = z.infer<typeof HubDeployStatusSchema>;
export type HubStatusResponse = z.infer<typeof HubStatusResponseSchema>;
//# sourceMappingURL=hub-api.d.ts.map