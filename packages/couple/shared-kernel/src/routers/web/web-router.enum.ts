import type { RouteGroup } from '../route-group';
import { AuthenticationRouteEnum } from './authentication.route';
import { HomeRouteEnum } from './home.route';
import { OfflineRouteEnum } from './offline.route';
import { PairingRouteEnum } from './pairing.route';

export const WEB_ROUTE_GROUPS = [
    AuthenticationRouteEnum,
    HomeRouteEnum,
    OfflineRouteEnum,
    PairingRouteEnum,
] as const satisfies readonly RouteGroup[];

export const WebRouterEnum = {
    ...AuthenticationRouteEnum,
    ...HomeRouteEnum,
    ...OfflineRouteEnum,
    ...PairingRouteEnum,
} as const satisfies RouteGroup;
