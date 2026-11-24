import type { RouteGroup } from '../route-group';

export const MessagingRouteEnum = {
    MESSAGES: '/messages',
    INSTANT_PHOTO_FILE: '/api/instant-photos/:instantPhotoId',
} as const satisfies RouteGroup;
