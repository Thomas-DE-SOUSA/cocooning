import type { RouteGroup } from '../route-group';
import { AuthenticationRouteEnum } from './authentication.route';
import { HealthRouteEnum } from './health.route';
import { PairingRouteEnum } from './pairing.route';

export const API_ROUTE_GROUPS = [
    HealthRouteEnum,
    AuthenticationRouteEnum,
    PairingRouteEnum,
] as const satisfies readonly RouteGroup[];

export const ApiRouterEnum = {
    ...HealthRouteEnum,
    ...AuthenticationRouteEnum,
    ...PairingRouteEnum,
} as const satisfies RouteGroup;
