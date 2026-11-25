import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';

type PageRequest = {
    readonly mode: string;
    readonly headers: { get(name: string): string | null };
};

// The fixed part of the photo route, before its :instantPhotoId.
const INSTANT_PHOTO_PATH_PREFIX = WebRouterEnum.INSTANT_PHOTO_FILE.slice(
    0,
    WebRouterEnum.INSTANT_PHOTO_FILE.indexOf(':'),
);

// A page or its RSC payload carries the couple's data read for the session: always from the network (decision 0036).
export function isPageRequest(
    request: PageRequest,
    sameOrigin: boolean,
): boolean {
    if (!sameOrigin) return false;
    return request.mode === 'navigate' || request.headers.get('RSC') === '1';
}

// A photo of the feed is the couple's data too: never kept by the service worker, so none survives a sign-out.
export function isInstantPhotoRequest(
    pathname: string,
    sameOrigin: boolean,
): boolean {
    return sameOrigin && pathname.startsWith(INSTANT_PHOTO_PATH_PREFIX);
}
