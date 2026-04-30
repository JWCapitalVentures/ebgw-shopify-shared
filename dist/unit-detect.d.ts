/**
 * Unit detection for scraped/imported tables. Pure heuristics, deterministic.
 *
 * Fallback order:
 *   1. Explicit unit in headers — "(in)", "(cm)", "Bust inches", etc.
 *   2. Numeric body range — body measurements in inches ~10-50, in cm ~65-150
 *   3. Shop locale — imperial countries default to inches
 *   4. Default: cm
 */
import type { Unit } from './types.js';
export declare function detectUnit(headers: string[], rows?: Array<Array<string | number>>, shopCountryCode?: string | null): Unit;
export declare function stripUnitSuffix(header: string): string;
//# sourceMappingURL=unit-detect.d.ts.map