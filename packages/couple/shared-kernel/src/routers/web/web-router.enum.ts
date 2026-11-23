import type { RouteGroup } from '../route-group';
import { HomeRouteEnum } from './home.route';
import { OfflineRouteEnum } from './offline.route';

export const WEB_ROUTE_GROUPS = [
    HomeRouteEnum,
    OfflineRouteEnum,
] as const satisfies readonly RouteGroup[];

export const WebRouterEnum = {
    ...HomeRouteEnum,
    ...OfflineRouteEnum,
} as const satisfies RouteGroup;
