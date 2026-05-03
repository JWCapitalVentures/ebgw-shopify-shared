/**
 * EBGW Size Chart App detection + extraction.
 *
 * Tegenhanger van kiwi.ts maar voor competitor-stores die ONZE eigen
 * Size Chart App gebruiken. Deze stores renderen via de theme-extension
 * een specifiek HTML-fragment dat de chart-data inline in een
 * <script type="application/json"> tag bevat.
 *
 * Voordeel boven Kiwi: geen API-call nodig — alle data staat al in de
 * HTML van de productpagina. Schema is per-definitie identiek aan ons
 * interne SizeChartFields format.
 *
 * Used by:
 *   • ebgw-hub: research scrape (auto-extract chart van EBGW-using stores)
 *   • ebgw-hub: bulk-migration wizard
 *
 * Pure / stateless. Geen I/O — caller geeft HTML door.
 */
import { newSectionId } from './helpers.js';
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
export function detectEbgwSignature(html: string): EbgwSignature | null {
  const modalMatches = html.match(/<size-chart-modal\b/gi);
  if (!modalMatches || modalMatches.length === 0) return null;
  // Tweede check zodat we niet matchen op een page die alleen het custom
  // element gebruikt zonder data (server-side rendered theme zonder chart).
  if (!/class=["'][^"']*\bsize-chart-data\b[^"']*["']/i.test(html)) {
    return null;
  }

  const unitMatch = html.match(/data-default-unit=["'](cm|in)["']/i);
  return {
    defaultUnit: (unitMatch?.[1] as 'cm' | 'in' | undefined) ?? undefined,
    matches: modalMatches.length,
  };
}

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
export function parseEbgwHtml(html: string): ParsedEbgwChart | null {
  // Greedy match tot de sluitende `</script>` — JSON kan multilijn zijn.
  // Wij zoeken specifiek naar de `class="size-chart-data"` om niet andere
  // application/json scripts op de pagina mee te pakken.
  const scriptMatch = html.match(
    /<script\b[^>]*class=["'][^"']*\bsize-chart-data\b[^"']*["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!scriptMatch) return null;
  const rawJson = decodeHtmlEntities(scriptMatch[1].trim());
  if (!rawJson) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;

  const title = typeof obj.title === 'string' ? obj.title : undefined;
  const defaultUnit: 'cm' | 'in' = obj.default_unit === 'in' ? 'in' : 'cm';

  const rawSections = Array.isArray(obj.sections) ? obj.sections : [];
  const sections: SizeChartSection[] = [];

  for (const raw of rawSections) {
    if (!raw || typeof raw !== 'object') continue;
    const s = raw as Record<string, unknown>;
    const sectionType = s.type;
    if (sectionType === 'table') {
      const headers = Array.isArray(s.headers)
        ? s.headers.filter((h): h is string => typeof h === 'string')
        : [];
      const rows = Array.isArray(s.rows)
        ? s.rows
            .map((r) =>
              Array.isArray(r)
                ? r.map((cell) =>
                    typeof cell === 'number' || typeof cell === 'string' ? cell : String(cell ?? ''),
                  )
                : null,
            )
            .filter((r): r is Array<string | number> => r !== null)
        : [];
      const unit: 'cm' | 'in' = s.unit === 'in' ? 'in' : 'cm';
      const tableTitle = typeof s.title === 'string' ? s.title : undefined;
      sections.push({
        id: typeof s.id === 'string' && s.id ? s.id : newSectionId(),
        type: 'table',
        title: tableTitle,
        unit,
        headers,
        rows,
      });
    } else if (sectionType === 'text') {
      // De Liquid render gebruikt 'content' (HTML); historische sections
      // kunnen 'body' hebben — accepteer beide.
      const content =
        typeof s.content === 'string'
          ? s.content
          : typeof s.body === 'string'
            ? s.body
            : '';
      if (!content) continue;
      sections.push({
        id: typeof s.id === 'string' && s.id ? s.id : newSectionId(),
        type: 'text',
        content,
      });
    }
  }

  if (sections.length === 0) return null;

  return { title, defaultUnit, sections };
}

/**
 * Minimal HTML-entity decoder voor de JSON-blob. Liquid kan strings
 * escapen in `| json` filter, dus &quot; en consorten kunnen voorkomen.
 */
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
