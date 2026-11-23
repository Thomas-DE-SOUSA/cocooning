type PageRequest = {
    readonly mode: string;
    readonly headers: { get(name: string): string | null };
};

// A page or its RSC payload carries the couple's data read for the session: always from the network (decision 0036).
export function isPageRequest(
    request: PageRequest,
    sameOrigin: boolean,
): boolean {
    if (!sameOrigin) return false;
    return request.mode === 'navigate' || request.headers.get('RSC') === '1';
}
