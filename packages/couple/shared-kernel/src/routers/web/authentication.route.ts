import type { RouteGroup } from '../route-group';

export const AuthenticationRouteEnum = {
    ACCOUNT_SIGN_IN: '/sign-in',
} as const satisfies RouteGroup;
