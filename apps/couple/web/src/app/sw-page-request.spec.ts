import { isPageRequest } from './sw-page-request';

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
