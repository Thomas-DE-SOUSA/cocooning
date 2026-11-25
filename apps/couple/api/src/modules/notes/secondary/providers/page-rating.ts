// The customer rating a page declares in its schema.org data (JSON-LD), which htmlToText drops with the scripts:
// many restaurant sites draw their stars by JavaScript, but keep the rating there for search engines.
const JSON_LD_BLOCKS =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi;

type Rating = {
    readonly value: number;
    readonly best: number;
    readonly count: number | null;
};

const numberOf = (raw: unknown): number | null => {
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
    if (typeof raw !== 'string') return null;
    const value = Number.parseFloat(raw.replace(',', '.'));
    return Number.isFinite(value) ? value : null;
};

type DeclaredRating = {
    readonly ratingValue?: unknown;
    readonly bestRating?: unknown;
    readonly reviewCount?: unknown;
    readonly ratingCount?: unknown;
};

const ratingOf = (node: unknown): Rating | null => {
    if (typeof node !== 'object' || node === null) return null;
    const rating = (node as { aggregateRating?: DeclaredRating | null })
        .aggregateRating;
    if (typeof rating === 'object' && rating !== null) {
        const value = numberOf(rating.ratingValue);
        if (value !== null) {
            return {
                value,
                best: numberOf(rating.bestRating) ?? 5,
                count: numberOf(rating.reviewCount ?? rating.ratingCount),
            };
        }
    }
    const children = Array.isArray(node) ? node : Object.values(node);
    for (const child of children) {
        const found = ratingOf(child);
        if (found !== null) return found;
    }
    return null;
};

const parsed = (json: string): unknown => {
    try {
        return JSON.parse(json);
    } catch {
        // A malformed block is a page without rating: the card goes on with its visible text.
        return null;
    }
};

const formatted = (number: number): string =>
    String(Math.round(number * 10) / 10).replace('.', ',');

// One labelled line for the writer, such as « Note des clients sur cette page : 4,6/5 (320 avis) », or null.
export const pageRatingLine = (html: string): string | null => {
    for (const [, json] of html.matchAll(JSON_LD_BLOCKS)) {
        const rating = ratingOf(parsed(json ?? ''));
        if (rating === null) continue;
        const reviews = rating.count === null ? '' : ` (${rating.count} avis)`;
        return `Note des clients sur cette page : ${formatted(rating.value)}/${formatted(rating.best)}${reviews}`;
    }
    return null;
};
