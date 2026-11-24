import { FakeFetch } from '../../testing';
import { TEST_HTTP_CONFIG } from './__tests__/test-http-config';
import { HttpMethodEnum } from './http-method.enum';
import { httpRequestBytes } from './http-request-bytes';
import type { HttpRequest } from './http-request-options';

const BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);

const A_FILE_REQUEST: HttpRequest = {
    url: 'http://api.test/files/file-1',
    method: HttpMethodEnum.GET,
    headers: { Cookie: 'session=token' },
    body: null,
};

describe('Feature: read a file from the API as bytes', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: the API answers the file', () => {
        it('returns its bytes and its content type', async () => {
            fakeFetch.givenBytesResponse(200, BYTES, 'image/jpeg');

            expect(
                await httpRequestBytes(A_FILE_REQUEST, TEST_HTTP_CONFIG),
            ).toEqual({
                success: true,
                value: { bytes: BYTES, contentType: 'image/jpeg' },
            });
        });

        it('accepts any type and sends no body', async () => {
            fakeFetch.givenBytesResponse(200, BYTES, 'image/jpeg');

            await httpRequestBytes(A_FILE_REQUEST, TEST_HTTP_CONFIG);

            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/files/file-1',
                    method: 'GET',
                    headers: { Accept: '*/*', Cookie: 'session=token' },
                    body: null,
                },
            ]);
        });
    });

    describe('Scenario: the file comes without a content type', () => {
        it('reports an invalid response', async () => {
            fakeFetch.givenBytesResponse(200, BYTES, null);

            expect(
                await httpRequestBytes(A_FILE_REQUEST, TEST_HTTP_CONFIG),
            ).toEqual({
                success: false,
                error: {
                    kind: 'invalid-response',
                    message: 'Response has no content type',
                },
            });
        });
    });

    describe('Scenario: the API refuses the request', () => {
        it('maps the status and the JSON error body', async () => {
            fakeFetch.givenResponse(404, '{"code":"FILE_NOT_FOUND"}');

            expect(
                await httpRequestBytes(A_FILE_REQUEST, TEST_HTTP_CONFIG),
            ).toEqual({
                success: false,
                error: {
                    kind: 'http',
                    status: 404,
                    body: { code: 'FILE_NOT_FOUND' },
                },
            });
        });

        it('maps a body that is not JSON to null', async () => {
            fakeFetch.givenResponse(502, 'Bad gateway');

            expect(
                await httpRequestBytes(A_FILE_REQUEST, TEST_HTTP_CONFIG),
            ).toEqual({
                success: false,
                error: { kind: 'http', status: 502, body: null },
            });
        });
    });

    describe('Scenario: the API cannot be reached or does not answer in time', () => {
        it('reports a network error when the network fails', async () => {
            fakeFetch.givenNetworkFailure('fetch failed');

            expect(
                await httpRequestBytes(A_FILE_REQUEST, TEST_HTTP_CONFIG),
            ).toEqual({
                success: false,
                error: { kind: 'network', message: 'fetch failed' },
            });
        });

        it('gives up after timeoutMs', async () => {
            fakeFetch.givenNoAnswer();

            const result = await httpRequestBytes(A_FILE_REQUEST, {
                ...TEST_HTTP_CONFIG,
                timeoutMs: 10,
            });

            expect(result).toEqual({
                success: false,
                error: { kind: 'network', message: expect.any(String) },
            });
        });
    });
});
