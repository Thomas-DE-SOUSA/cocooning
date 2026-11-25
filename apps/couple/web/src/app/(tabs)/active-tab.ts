// A route with a parameter matches every address under its fixed head: '/spaces/:space' matches '/spaces/SHARED'.
export function matchesRoute(pathname: string, route: string): boolean {
    const parameterAt = route.indexOf(':');
    if (parameterAt === -1) return pathname === route;
    return pathname.startsWith(route.slice(0, parameterAt));
}

// Decision 0053: a tab stays active on every screen reached from it.
export const isActiveTab = (
    pathname: string,
    routes: readonly string[],
): boolean => routes.some((route) => matchesRoute(pathname, route));
