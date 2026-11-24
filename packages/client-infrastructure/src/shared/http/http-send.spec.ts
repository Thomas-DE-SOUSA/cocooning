import { ok } from '@cocooning/shared-kernel/utils';
import { FakeFetch } from '../../testing';
import { TEST_HTTP_CONFIG } from './__tests__/test-http-config';
import { HttpMethodEnum } from './http-method.enum';
import { sendHttpRequest } from './http-send';

const readStatus = (response: Response): Promise<number> =>
    Promise.resolve(response.status);

describe('Feature: send the body of a request as the API reads it', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: a multipart body', () => {
        it('sends the FormData as is, without a JSON content type', async () => {
            const form = new FormData();
            form.append('photo', new Blob([new Uint8Array([1, 2])]), 'a.jpg');
            fakeFetch.givenResponse(201, '{}');

            const result = await sendHttpRequest(
                {
                    url: 'http://api.test/upload',
                    method: HttpMethodEnum.POST,
                    headers: { Cookie: 'session=token' },
                    body: form,
                },
                'application/json',
                readStatus,
                TEST_HTTP_CONFIG,
            );

            expect(result).toEqual(ok(201));
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/upload',
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        Cookie: 'session=token',
                    },
                    body: form,
                },
            ]);
        });
    });

    describe('Scenario: the body cannot be read to the end', () => {
        it('reports a network error', async () => {
            fakeFetch.givenResponse(200, '{}');

            const result = await sendHttpRequest(
                {
                    url: 'http://api.test/file',
                    method: HttpMethodEnum.GET,
                    headers: {},
                    body: null,
                },
                '*/*',
                () => Promise.reject(new TypeError('terminated')),
                TEST_HTTP_CONFIG,
            );

            expect(result).toEqual({
                success: false,
                error: { kind: 'network', message: 'terminated' },
            });
        });
    });
});
