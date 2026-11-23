import type { RouteGroup } from '../route-group';
import { HealthRouteEnum } from './health.route';
import { PairingRouteEnum } from './pairing.route';

export const API_ROUTE_GROUPS = [
    HealthRouteEnum,
    PairingRouteEnum,
] as const satisfies readonly RouteGroup[];

export const ApiRouterEnum = {
    ...HealthRouteEnum,
    ...PairingRouteEnum,
} as const satisfies RouteGroup;
