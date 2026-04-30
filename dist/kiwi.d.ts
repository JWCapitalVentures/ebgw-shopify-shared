import { type KiwiResponse } from './schemas.js';
import type { SizeChartSection } from './types.js';
export declare const KIWI_API_BASE = "https://app.kiwisizing.com/api/getSizingChart";
export type KiwiSignature = {
    /** The shop slug (myshopify-style domain) embedded in the page HTML. */
    shop: string;
    /** The Shopify product ID embedded in the page HTML. */
    productId: string;
};
/**
 * Look for Kiwi's fingerprints in HTML. Kiwi injects a small JS snippet on
 * every product page that exposes `KiwiSizing.shop = "…"` and a
 * `product: "…"` in their app config block.
 *
 * Returns null if the page doesn't have Kiwi installed (most non-fashion
 * stores, or stores using a different size-chart app).
 */
export declare function detectKiwiSignature(html: string): KiwiSignature | null;
/**
 * Build the URL to fetch a Kiwi chart. The API is GET-able from any client;
 * no auth, no token. We always use type=Default which returns the primary
 * chart for the product (Kiwi supports multiple types per product but in
 * practice 99% of stores only configure one).
 */
export declare function buildKiwiChartUrl(sig: KiwiSignature): string;
export type ParsedKiwiChart = {
    title?: string;
    sections: SizeChartSection[];
};
/**
 * Parse a raw Kiwi-API response into our internal format. Defensive: runs
 * through Zod first because Kiwi can (and has, historically) shipped fields
 * that don't match what we expect. On schema mismatch we return null, never
 * throw — callers can fall back to scraping the page HTML for tables.
 */
export declare function parseKiwiResponse(raw: unknown, shopCountryCode?: string | null): ParsedKiwiChart | null;
export declare function sanitizeKiwiHtml(html: string): string;
export type { KiwiResponse };
//# sourceMappingURL=kiwi.d.ts.map