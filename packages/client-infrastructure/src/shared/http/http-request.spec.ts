import { FakeFetch } from './__tests__/fake-fetch';
import { TEST_HTTP_CONFIG } from './__tests__/test-http-config';
import { httpRequest } from './http-request';
import { HttpMethodEnum } from './http-method.enum';
import type { HttpRequest } from './http-request-options';

const aRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
    url: 'http://api.test/pairing/couple/join',
    method: HttpMethodEnum.POST,
    headers: { Cookie: 'cocooning_session=token' },
    body: { invitationCode: 'ABCD2345' },
    ...overrides,
});

describe('Feature: send one HTTP request to the API', () => {
    const fakeFetch = new FakeFetch();

    beforeEach(() => fakeFetch.install());
    afterEach(() => {
        fakeFetch.restore();
        fakeFetch.calls.length = 0;
    });

    describe('Scenario: a request with a body', () => {
        it('sends JSON with the given headers', async () => {
            fakeFetch.givenResponse(200, '{}');

            await httpRequest(aRequest(), TEST_HTTP_CONFIG);

            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/pairing/couple/join',
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Cookie': 'cocooning_session=token',
                    },
                    body: '{"invitationCode":"ABCD2345"}',
                },
            ]);
        });
    });

    describe('Scenario: a request without a body', () => {
        it('sends no body and no content type', async () => {
            fakeFetch.givenResponse(200, '{}');

            await httpRequest(
                aRequest({
                    method: HttpMethodEnum.GET,
                    headers: {},
                    body: null,
                }),
                TEST_HTTP_CONFIG,
            );

            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/pairing/couple/join',
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    body: null,
                },
            ]);
        });
    });

    describe('Scenario: the API answers with JSON', () => {
        it('returns the parsed body', async () => {
            fakeFetch.givenResponse(200, '{"coupleId":"couple-1"}');

            expect(await httpRequest(aRequest(), TEST_HTTP_CONFIG)).toEqual({
                success: true,
                value: { coupleId: 'couple-1' },
            });
        });
    });

    describe('Scenario: the API answers with no content', () => {
        it('returns null', async () => {
            fakeFetch.givenResponse(204, '');

            expect(await httpRequest(aRequest(), TEST_HTTP_CONFIG)).toEqual({
                success: true,
                value: null,
            });
        });
    });

    describe('Scenario: the API refuses the request', () => {
        it('maps the status and the error body', async () => {
            fakeFetch.givenResponse(
                409,
                '{"code":"PAIRING_PARTNER_ALREADY_IN_COUPLE"}',
            );

            expect(await httpRequest(aRequest(), TEST_HTTP_CONFIG)).toEqual({
                success: false,
                error: {
                    kind: 'http',
                    status: 409,
                    body: { code: 'PAIRING_PARTNER_ALREADY_IN_COUPLE' },
                },
            });
        });

        it('maps a body that is not JSON to null', async () => {
            fakeFetch.givenResponse(502, 'Bad gateway');

            expect(await httpRequest(aRequest(), TEST_HTTP_CONFIG)).toEqual({
                success: false,
                error: { kind: 'http', status: 502, body: null },
            });
        });
    });

    describe('Scenario: a success whose body is not JSON', () => {
        it('reports an invalid response, not a network error', async () => {
            fakeFetch.givenResponse(200, '<html>');

            expect(await httpRequest(aRequest(), TEST_HTTP_CONFIG)).toEqual({
                success: false,
                error: {
                    kind: 'invalid-response',
                    message: 'Response body is not JSON',
                },
            });
        });
    });

    describe('Scenario: the API cannot be reached', () => {
        it('reports a network error', async () => {
            fakeFetch.givenNetworkFailure('fetch failed');

            expect(await httpRequest(aRequest(), TEST_HTTP_CONFIG)).toEqual({
                success: false,
                error: { kind: 'network', message: 'fetch failed' },
            });
        });
    });
});
