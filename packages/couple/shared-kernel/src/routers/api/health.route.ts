import type { RouteGroup } from '../route-group';

export const HealthRouteEnum = {
    HEALTH_CHECK: '/health',
} as const satisfies RouteGroup;
