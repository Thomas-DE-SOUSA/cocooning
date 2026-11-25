import { isInstantPhotoRequest, isPageRequest } from './sw-page-request';

const aRequest = (mode: string, rsc: string | null) => ({
    mode,
    headers: { get: (name: string) => (name === 'RSC' ? rsc : null) },
});

describe('Feature: the service worker never caches a page', () => {
    it.each([
        ['a navigation', aRequest('navigate', null), true, true],
        ['an RSC payload of router.refresh', aRequest('cors', '1'), true, true],
        ['a static file of the PWA', aRequest('no-cors', null), true, false],
        [
            'a navigation to another origin',
            aRequest('navigate', null),
            false,
            false,
        ],
    ])(
        'tells whether %s is a page',
        (_label, request, sameOrigin, expected) => {
            expect(isPageRequest(request, sameOrigin)).toBe(expected);
        },
    );
});

describe('Feature: the service worker never caches a photo of the couple', () => {
    it.each([
        ['a photo of the feed', '/api/instant-photos/0193-photo', true, true],
        [
            'a photo from another origin',
            '/api/instant-photos/0193',
            false,
            false,
        ],
        ['a static image of the PWA', '/icons/icon-192.png', true, false],
        ['the messages page', '/messages', true, false],
    ])(
        'tells whether %s goes to the network only',
        (_label, pathname, sameOrigin, expected) => {
            expect(isInstantPhotoRequest(pathname, sameOrigin)).toBe(expected);
        },
    );
});
