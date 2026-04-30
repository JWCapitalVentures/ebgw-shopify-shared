/**
 * Kiwi Sizing detection + extraction.
 *
 * Most Shopify stores in our target market use the Kiwi Sizing app for their
 * size charts. Their API is publicly readable (no auth needed) which means
 * we can extract a competitor's chart by:
 *
 *   1. Fetching their product page HTML
 *   2. Detecting the Kiwi-installed signature (KiwiSizing.shop + product ID)
 *   3. Calling https://app.kiwisizing.com/api/getSizingChart?shop=…&product=…
 *   4. Parsing the response into our SizeChartSection[] format
 *
 * Used by:
 *   • size-chart-app: admin UI's "Import from URL" feature
 *   • ebgw-hub: research scrape (auto-extract chart alongside product data)
 *   • ebgw-hub: bulk-migration wizard (own stores still on Kiwi)
 *
 * All functions are pure / stateless. No I/O wrappers — callers fetch and
 * pass HTML / JSON in. Keeps the package edge-runtime safe.
 */
import { newSectionId } from './helpers.js';
import { KiwiResponseSchema } from './schemas.js';
import { detectUnit, stripUnitSuffix } from './unit-detect.js';
export const KIWI_API_BASE = 'https://app.kiwisizing.com/api/getSizingChart';
/**
 * Look for Kiwi's fingerprints in HTML. Kiwi injects a small JS snippet on
 * every product page that exposes `KiwiSizing.shop = "…"` and a
 * `product: "…"` in their app config block.
 *
 * Returns null if the page doesn't have Kiwi installed (most non-fashion
 * stores, or stores using a different size-chart app).
 */
export function detectKiwiSignature(html) {
    const shopMatch = html.match(/KiwiSizing\.shop\s*=\s*"([^"]+)"/);
    const productMatch = html.match(/\bproduct:\s*"(\d+)"/);
    if (!shopMatch || !productMatch)
        return null;
    return { shop: shopMatch[1], productId: productMatch[1] };
}
/**
 * Build the URL to fetch a Kiwi chart. The API is GET-able from any client;
 * no auth, no token. We always use type=Default which returns the primary
 * chart for the product (Kiwi supports multiple types per product but in
 * practice 99% of stores only configure one).
 */
export function buildKiwiChartUrl(sig) {
    const params = new URLSearchParams({
        shop: sig.shop,
        product: sig.productId,
        type: 'Default',
    });
    return `${KIWI_API_BASE}?${params.toString()}`;
}
/**
 * Parse a raw Kiwi-API response into our internal format. Defensive: runs
 * through Zod first because Kiwi can (and has, historically) shipped fields
 * that don't match what we expect. On schema mismatch we return null, never
 * throw — callers can fall back to scraping the page HTML for tables.
 */
export function parseKiwiResponse(raw, shopCountryCode = null) {
    const parsed = KiwiResponseSchema.safeParse(raw);
    if (!parsed.success)
        return null;
    const sizing = parsed.data.sizings?.[0];
    if (!sizing)
        return null;
    return {
        title: sizing.name,
        sections: sizingToSections(sizing, shopCountryCode),
    };
}
function sizingToSections(sizing, shopCountryCode) {
    const sections = [];
    const layout = sizing.layout?.data ?? [];
    const tables = sizing.tables ?? {};
    for (const entry of layout) {
        if (entry.type === 0 && typeof entry.value === 'string') {
            // Text/HTML content — keep allowed formatting tags.
            const html = sanitizeKiwiHtml(entry.value);
            if (html.replace(/<[^>]+>/g, '').trim().length > 0) {
                const textSection = {
                    type: 'text',
                    id: newSectionId(),
                    content: html,
                };
                sections.push(textSection);
            }
        }
        else if (entry.type === 1 && typeof entry.value === 'string') {
            // Table reference (entry.value is the table key in `tables`)
            const table = tables[entry.value];
            if (!table?.data || table.data.length < 2)
                continue;
            const headerRow = table.data[0];
            const rawHeaders = headerRow.map((c) => (c.value ?? '').trim());
            const rows = [];
            for (let i = 1; i < table.data.length; i++) {
                const sourceRow = table.data[i];
                const row = sourceRow.map((cell, idx) => {
                    const v = (cell.value ?? '').trim();
                    if (idx === 0 || v === '')
                        return v;
                    const n = Number(v);
                    return Number.isFinite(n) ? n : v;
                });
                // Pad/truncate to header width — Kiwi occasionally ships ragged rows.
                while (row.length < rawHeaders.length)
                    row.push('');
                if (row.length > rawHeaders.length)
                    row.length = rawHeaders.length;
                rows.push(row);
            }
            const unit = detectUnit(rawHeaders, rows, shopCountryCode);
            const headers = rawHeaders.map(stripUnitSuffix);
            const tableSection = {
                type: 'table',
                id: newSectionId(),
                title: '',
                unit,
                headers,
                rows,
            };
            sections.push(tableSection);
        }
    }
    return sections;
}
// ─── HTML sanitizer for Kiwi text-blocks ────────────────────────────────────
/**
 * Server-side HTML sanitizer. Strips script/style entirely, then keeps only
 * a whitelist of basic formatting tags. Removes all attributes except a safe
 * href on <a>.
 *
 * Crude but adequate for the scope (admin-controlled content from
 * competitor pages we paste in). NOT a general-purpose XSS sanitizer —
 * don't reuse outside this context.
 */
const ALLOWED_TAGS = new Set([
    'b',
    'strong',
    'i',
    'em',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'p',
    'br',
    'span',
    'div',
]);
export function sanitizeKiwiHtml(html) {
    let out = html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '');
    out = out.replace(/<\/?([a-z][a-z0-9-]*)\b([^>]*)>/gi, (match, tag, attrs) => {
        const lc = tag.toLowerCase();
        if (!ALLOWED_TAGS.has(lc))
            return '';
        if (lc === 'a') {
            const hrefMatch = attrs.match(/\bhref\s*=\s*"([^"]*)"|\bhref\s*=\s*'([^']*)'/i);
            const href = hrefMatch ? (hrefMatch[1] ?? hrefMatch[2] ?? '') : '';
            const safe = /^https?:\/\//i.test(href) ? href : '';
            const isClose = match.startsWith('</');
            if (isClose)
                return '</a>';
            return safe ? `<a href="${safe}" rel="noopener noreferrer" target="_blank">` : '<a>';
        }
        const isClose = match.startsWith('</');
        return isClose ? `</${lc}>` : `<${lc}>`;
    });
    return out.trim();
}
//# sourceMappingURL=kiwi.js.map