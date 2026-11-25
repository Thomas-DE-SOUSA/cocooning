// The blocks a reader never shows: their content is code or decoration, never the facts of the page.
const HIDDEN_BLOCKS =
    /<(script|style|noscript|svg|template|head|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const COMMENTS = /<!--[\s\S]*?-->/g;
const BLOCK_ENDS =
    /<\/?(p|div|li|tr|h[1-6]|br|section|article|header|footer|td|th|dd|dt)\b[^>]*>/gi;
const TAGS = /<[^>]+>/g;
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    euro: '€',
};
const ENTITIES = /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi;

const decodeEntity = (whole: string, entity: string): string => {
    const lower = entity.toLowerCase();
    if (lower.startsWith('#x'))
        return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
    if (lower.startsWith('#'))
        return String.fromCodePoint(Number.parseInt(lower.slice(1), 10));
    return NAMED_ENTITIES[lower] ?? whole;
};

// The visible text of an HTML page, one line per block, without markup (decision 0054: no dependency for it).
export const htmlToText = (html: string): string =>
    html
        .replace(COMMENTS, ' ')
        .replace(HIDDEN_BLOCKS, ' ')
        .replace(BLOCK_ENDS, '\n')
        .replace(TAGS, ' ')
        .replace(ENTITIES, decodeEntity)
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter((line) => line.length > 0)
        .join('\n');
