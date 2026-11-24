import type { RouteGroup } from '../route-group';

export const PairingRouteEnum = {
    COUPLE_PAIRING: '/pairing',
    COUPLE_OVERVIEW: '/couple',
} as const satisfies RouteGroup;
