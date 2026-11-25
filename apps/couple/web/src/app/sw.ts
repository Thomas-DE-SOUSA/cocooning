import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { defaultCache, PAGES_CACHE_NAME } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { NetworkOnly, Serwist } from 'serwist';
import { openAppAt } from './sw-notification-click';
import { isInstantPhotoRequest, isPageRequest } from './sw-page-request';
import {
    notificationUrlOf,
    PUSH_NOTIFICATION_ICON,
    pushNotificationOf,
} from './sw-push-notification';

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

// Pages cached by an earlier version, `others` included: removed so that nothing read for a session stays on the phone.
const EARLIER_PAGE_CACHES = [...Object.values(PAGES_CACHE_NAME), 'others'];

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            matcher: ({ request, sameOrigin }) =>
                isPageRequest(request, sameOrigin),
            handler: new NetworkOnly(),
        },
        {
            matcher: ({ url, sameOrigin }) =>
                isInstantPhotoRequest(url.pathname, sameOrigin),
            handler: new NetworkOnly(),
        },
        ...defaultCache,
    ],
    fallbacks: {
        entries: [
            {
                url: WebRouterEnum.OFFLINE,
                matcher: ({ request }) => request.destination === 'document',
            },
        ],
    },
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all(EARLIER_PAGE_CACHES.map((name) => caches.delete(name))),
    );
});

// R10: the payload names the kind alone; the notification never shows a text, a title or a photo (core.md rule 33).
self.addEventListener('push', (event) => {
    const notification = pushNotificationOf(event.data?.text() ?? null);
    event.waitUntil(
        self.registration.showNotification(notification.title, {
            body: notification.body,
            icon: PUSH_NOTIFICATION_ICON,
            tag: notification.tag,
            data: { url: notification.url },
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        openAppAt(self.clients, notificationUrlOf(event.notification.data)),
    );
});

serwist.addEventListeners();
