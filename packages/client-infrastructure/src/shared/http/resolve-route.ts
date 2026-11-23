export type RouteParams = Readonly<Record<string, string>>;

// A route of ApiRouterEnum with its `:name` segments filled, each value encoded.
export function resolveRoute(
    apiBaseUrl: string,
    route: string,
    params: RouteParams = {},
): string {
    const path = Object.entries(params).reduce(
        (filled, [name, value]) =>
            filled.replace(`:${name}`, encodeURIComponent(value)),
        route,
    );
    return `${apiBaseUrl.replace(/\/+$/, '')}${path}`;
}
