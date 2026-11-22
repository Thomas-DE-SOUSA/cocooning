import type { RouteGroup } from '../route-group';
import { HealthRouteEnum } from './health.route';

export const API_ROUTE_GROUPS = [
    HealthRouteEnum,
] as const satisfies readonly RouteGroup[];

export const ApiRouterEnum = {
    ...HealthRouteEnum,
} as const satisfies RouteGroup;
