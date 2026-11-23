export function resolveRoute(apiBaseUrl: string, route: string): string {
    return `${apiBaseUrl.replace(/\/+$/, '')}${route}`;
}
