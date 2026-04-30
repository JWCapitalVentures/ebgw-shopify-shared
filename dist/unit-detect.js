const IMPERIAL_COUNTRIES = new Set([
    'US',
    'LR', // Liberia
    'MM', // Myanmar
]);
export function detectUnit(headers, rows, shopCountryCode) {
    const text = headers.join(' ').toLowerCase();
    // 1. Explicit in header.
    if (/\binches?\b|\(\s*in(?:ch|ches)?\s*\)/i.test(text))
        return 'in';
    if (/\bcentimet(?:er|re)s?\b|\bcm\b|\(\s*cm\s*\)/i.test(text))
        return 'cm';
    // 2. Numeric range on body cells (first column = labels, excluded).
    if (rows && rows.length > 0) {
        const numbers = [];
        for (const row of rows.slice(0, 12)) {
            for (let i = 1; i < row.length; i++) {
                const cell = row[i];
                const n = typeof cell === 'number' ? cell : Number(cell);
                if (Number.isFinite(n) && n > 0)
                    numbers.push(n);
            }
        }
        if (numbers.length >= 4) {
            const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
            return avg < 55 ? 'in' : 'cm';
        }
    }
    // 3. Shop-locale fallback.
    if (shopCountryCode && IMPERIAL_COUNTRIES.has(shopCountryCode.toUpperCase())) {
        return 'in';
    }
    // 4. Default.
    return 'cm';
}
export function stripUnitSuffix(header) {
    return header.replace(/\s*\(\s*(inches?|cm|centimet(?:er|re)s?)\s*\)\s*$/i, '').trim();
}
//# sourceMappingURL=unit-detect.js.map