import { readSignInClientContext } from './sign-in-client-context.service';

describe('Feature: the browser behind a sign-in', () => {
    describe('Scenario: the request went through proxies', () => {
        it('keeps the first forwarded address and the User-Agent', () => {
            const headers = new Headers({
                'x-forwarded-for': ' 100.64.0.7 , 127.0.0.1',
                'user-agent': 'Mozilla/5.0 (iPhone)',
            });

            expect(readSignInClientContext(headers)).toEqual({
                ipAddress: '100.64.0.7',
                userAgent: 'Mozilla/5.0 (iPhone)',
            });
        });
    });

    describe('Scenario: Next does not know the browser', () => {
        it.each([
            ['no header', new Headers()],
            ['an empty header', new Headers({ 'x-forwarded-for': '' })],
        ])('gives null for %s', (_, headers) => {
            expect(readSignInClientContext(headers)).toEqual({
                ipAddress: null,
                userAgent: null,
            });
        });
    });
});
