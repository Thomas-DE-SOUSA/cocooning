export type LocaleEntry = { readonly key: string; readonly text: string };

export function flattenLocale(node: object, prefix = ''): LocaleEntry[] {
    return Object.entries(node).flatMap(([key, value]: [string, unknown]) => {
        const path = prefix === '' ? key : `${prefix}.${key}`;
        if (typeof value === 'string') return [{ key: path, text: value }];
        if (typeof value === 'object' && value !== null)
            return flattenLocale(value, path);
        throw new Error(`Locale value at ${path} is neither text nor a group`);
    });
}
