import type { RouteGroup } from '../route-group';

// Sign-in opens a session and sign-out closes them all: the HTTP verb tells them apart.
export const AuthenticationRouteEnum = {
    ACCOUNT_SESSION_OPEN: '/authentication/session',
    ACCOUNT_SESSION_CLOSE: '/authentication/session',
} as const satisfies RouteGroup;
