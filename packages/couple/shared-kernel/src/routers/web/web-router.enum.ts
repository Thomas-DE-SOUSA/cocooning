import type { RouteGroup } from '../route-group';
import { HomeRouteEnum } from './home.route';

export const WEB_ROUTE_GROUPS = [
    HomeRouteEnum,
] as const satisfies readonly RouteGroup[];

export const WebRouterEnum = {
    ...HomeRouteEnum,
} as const satisfies RouteGroup;
