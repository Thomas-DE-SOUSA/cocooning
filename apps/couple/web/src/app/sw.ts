import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { defaultCache, PAGES_CACHE_NAME } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { NetworkOnly, Serwist } from 'serwist';
import { isInstantPhotoRequest, isPageRequest } from './sw-page-request';

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

serwist.addEventListeners();
