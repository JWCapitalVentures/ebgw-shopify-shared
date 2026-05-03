import type { SizeChartSection } from './types.js';
export type EbgwSignature = {
    /**
     * De `data-default-unit` waarde uit de root `<size-chart-modal>` tag,
     * indien aanwezig. Pure indicator — wordt door de parser overschreven
     * met de default_unit uit de JSON-payload als die er is.
     */
    defaultUnit?: 'cm' | 'in';
    /** Aantal `<size-chart-modal>` tags gevonden — meestal 1, soms meer (bv. variant-specific). */
    matches: number;
};
export type ParsedEbgwChart = {
    title?: string;
    defaultUnit: 'cm' | 'in';
    sections: SizeChartSection[];
};
/**
 * Detect of de pagina een EBGW Size Chart App-render bevat.
 *
 * Twee fingerprints — beide moeten matchen om vals positieven te
 * voorkomen op pagina's die gewoon een `size-chart` CSS-class hebben:
 *   1. `<size-chart-modal>` custom-element tag (van onze Web Component)
 *   2. `<script class="size-chart-data" type="application/json">` met
 *      de data-payload binnenin
 */
export declare function detectEbgwSignature(html: string): EbgwSignature | null;
/**
 * Extract de chart-data uit de inline JSON-script in een EBGW-rendered
 * pagina. Pakt de eerste matchende `<script class="size-chart-data">`.
 *
 * De Liquid-template injecteert een blob in deze vorm:
 *   {
 *     "title": "Dress Size Guide",
 *     "default_unit": "cm",
 *     "sections": [{ "type": "table", "headers": [...], "rows": [...] }, ...]
 *   }
 *
 * Returns null bij parse-failure of als de HTML geen valid blob bevat.
 */
export declare function parseEbgwHtml(html: string): ParsedEbgwChart | null;
//# sourceMappingURL=ebgw.d.ts.map