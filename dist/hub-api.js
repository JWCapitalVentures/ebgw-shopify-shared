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
import { SizeChartFieldsSchema } from './schemas.js';
// ─── /api/hub/deploy ────────────────────────────────────────────────────────
// Deploy a single chart for a single product. Idempotent on the app side
// via content-hash → handle (`auto-<hash>`). Multiple Hub-jobs deploying
// the same chart converge on one metaobject.
export const HubDeployRequestSchema = z.object({
    /** Shop the chart belongs to. e.g. "acme.myshopify.com". */
    shop_domain: z.string().min(3),
    /** Numeric product ID or full GID (`gid://shopify/Product/123`). */
    product_id: z.union([z.string(), z.number()]),
    /** Already in the canonical SizeChartFields shape — Hub does the build/normalize. */
    chart: SizeChartFieldsSchema,
    options: z
        .object({
        /** Override the store's default unit-conversion preference. */
        unit_override: z.enum(['cm', 'in', 'auto']).optional(),
        /** Caller-supplied trace id; echoed back in the response for log-stitching. */
        correlation_id: z.string().max(64).optional(),
    })
        .optional(),
});
export const HubDeployStatusSchema = z.enum(['created', 'reused', 'failed', 'skipped']);
export const HubDeployResponseSchema = z.object({
    status: HubDeployStatusSchema,
    /** Set on `created`/`reused`. The Shopify GID for the metaobject record. */
    metaobject_gid: z.string().optional(),
    /** Set on `created`/`reused`. The handle (`auto-<contentHash>`). */
    chart_handle: z.string().optional(),
    /** Set on `created`/`reused`. The hex content-hash that produced the handle. */
    content_hash: z.string().optional(),
    /** Set on `failed`. Short human-readable error message (capped at ~300 chars). */
    error: z.string().optional(),
    /** Set on `skipped` or `failed` for context (`no_chart`, `shop_not_configured`, …). */
    reason: z.string().optional(),
    /** Echoed from request.options.correlation_id when provided. */
    correlation_id: z.string().optional(),
});
// ─── /api/hub/status ────────────────────────────────────────────────────────
// Health + capacity probe. Cheap, GET-able, no side-effects. Hub uses this
// to populate its admin health-strip and to pre-flight before bulk-deploys.
export const HubStatusResponseSchema = z.object({
    ok: z.literal(true),
    /** App's package.json version — useful for pinpointing deployed code. */
    version: z.string(),
    /** Shops the app is currently configured for via SHOPIFY_APP_*_SHOP env vars. */
    configured_shops: z.array(z.string()),
    /** Schema versions the app understands; bumped via `@ebgw/shopify-shared`. */
    schema_versions: z.object({
        size_chart: z.number().int(),
    }),
});
//# sourceMappingURL=hub-api.js.map