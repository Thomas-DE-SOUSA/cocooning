import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_PAIRED_COUPLE,
    A_PENDING_COUPLE,
} from '@cocooning/couple-client-business-logic/testing';
import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createCoupleHttpConfig } from '../../couple-http-config';
import { resolvePairingEndpoints } from '../endpoints/pairing.endpoints';
import { ApiPairingGateway } from './api-pairing.gateway';

const SESSION_COOKIE = { Cookie: 'cocooning_session=session-token-1' };
const ACCEPT = { Accept: 'application/json' };
const JSON_BODY = { ...ACCEPT, 'Content-Type': 'application/json' };

const aGateway = (token: string | null = 'session-token-1') =>
    new ApiPairingGateway(
        resolvePairingEndpoints('http://api.test'),
        createCoupleHttpConfig(5000),
        () => Promise.resolve(token),
    );

describe('Feature: the PWA forms the couple through the API', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: each action for the signed-in partner', () => {
        it.each([
            ['reads the couple', 'getMyCouple', 'GET', '/pairing/couple'],
            ['creates the couple', 'createCouple', 'POST', '/pairing/couple'],
            [
                'renews the code',
                'renewInvitationCode',
                'POST',
                '/pairing/couple/invitation-code',
            ],
        ] as const)(
            '%s with the session cookie',
            async (_label, operation, method, path) => {
                fakeFetch.givenResponse(200, JSON.stringify(A_PENDING_COUPLE));

                await expect(aGateway()[operation]()).resolves.toEqual(
                    ok(A_PENDING_COUPLE),
                );
                expect(fakeFetch.calls).toEqual([
                    {
                        url: `http://api.test${path}`,
                        method,
                        headers: { ...ACCEPT, ...SESSION_COOKIE },
                        body: null,
                    },
                ]);
            },
        );

        it('posts the typed code to join the couple (R5)', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_PAIRED_COUPLE));

            await expect(
                aGateway().joinCouple({ invitationCode: ' k7m2 q9xr ' }),
            ).resolves.toEqual(ok(A_PAIRED_COUPLE));
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/pairing/couple/join',
                    method: 'POST',
                    headers: { ...JSON_BODY, ...SESSION_COOKIE },
                    body: JSON.stringify({ invitationCode: 'k7m2 q9xr' }),
                },
            ]);
        });
    });

    describe('Scenario: R6, the API refuses the code', () => {
        it('returns VALIDATION_ERROR with the backend code', async () => {
            fakeFetch.givenResponse(
                422,
                JSON.stringify({
                    status: 422,
                    code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
                    message: 'Invitation code invalid',
                    context: null,
                }),
            );

            await expect(
                aGateway().joinCouple({ invitationCode: 'WRONG123' }),
            ).resolves.toEqual(
                fail({
                    code: ApiErrorCodeEnum.VALIDATION_ERROR,
                    message: 'Invitation code invalid',
                    backendCode:
                        PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
                }),
            );
        });
    });

    describe('Scenario: no session to forward', () => {
        it('refuses without calling the API', async () => {
            const result = await aGateway(null).getMyCouple();

            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.UNAUTHORIZED,
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });

    describe('Scenario: a request or an answer outside the contract', () => {
        it('refuses an empty code without calling the API', async () => {
            const result = await aGateway().joinCouple({ invitationCode: ' ' });

            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.VALIDATION_ERROR,
            );
            expect(fakeFetch.calls).toEqual([]);
        });

        it('returns INVALID_RESPONSE for a couple without its status', async () => {
            fakeFetch.givenResponse(200, JSON.stringify({ coupleId: 'c-1' }));

            const result = await aGateway().getMyCouple();

            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.INVALID_RESPONSE,
            );
        });
    });
});
