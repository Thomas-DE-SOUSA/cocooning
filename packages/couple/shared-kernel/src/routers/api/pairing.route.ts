import type { RouteGroup } from '../route-group';

// Create and read share one path: the HTTP verb tells them apart.
export const PairingRouteEnum = {
    COUPLE_CREATE: '/pairing/couple',
    COUPLE_GET_MINE: '/pairing/couple',
    COUPLE_JOIN: '/pairing/couple/join',
    COUPLE_INVITATION_CODE_RENEW: '/pairing/couple/invitation-code',
} as const satisfies RouteGroup;
