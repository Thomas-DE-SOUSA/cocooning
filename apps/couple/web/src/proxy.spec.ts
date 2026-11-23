/**
 * @jest-environment node
 */
import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { NextRequest } from 'next/server';
import { config, proxy } from './proxy';

const ORIGIN = 'https://cocooning.test';

function aRequest(path: string, cookie: string | null): NextRequest {
    return new NextRequest(
        `${ORIGIN}${path}`,
        cookie === null ? {} : { headers: { cookie } },
    );
}

describe('Feature: pages reserved to a signed-in partner', () => {
    describe('Scenario: no session cookie', () => {
        it('sends the partner to the sign-in screen', () => {
            const response = proxy(aRequest(WebRouterEnum.HOME, null));

            expect(response.headers.get('location')).toBe(
                `${ORIGIN}${WebRouterEnum.ACCOUNT_SIGN_IN}`,
            );
        });
    });

    describe('Scenario: a session cookie', () => {
        it('lets the page through, the API checking the session', () => {
            const response = proxy(
                aRequest(WebRouterEnum.HOME, `${SESSION_COOKIE_NAME}=token`),
            );

            expect(response.headers.get('location')).toBeNull();
        });
    });

    describe('Scenario: a public page without cookie', () => {
        it.each([WebRouterEnum.ACCOUNT_SIGN_IN, WebRouterEnum.OFFLINE])(
            'lets %s through',
            (path) => {
                expect(
                    proxy(aRequest(path, null)).headers.get('location'),
                ).toBeNull();
            },
        );
    });
});

describe('Feature: files of the PWA', () => {
    it.each([
        '/sw.js',
        '/swe-worker-4f1c.js',
        '/manifest.webmanifest',
        '/icons/icon-192.png',
        '/apple-icon.png',
        '/_next/static/chunks/main.js',
    ])('never runs the proxy on %s', (url) => {
        expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
    });

    it.each([WebRouterEnum.HOME, WebRouterEnum.ACCOUNT_SIGN_IN])(
        'runs the proxy on the page %s',
        (url) => {
            expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
        },
    );
});
