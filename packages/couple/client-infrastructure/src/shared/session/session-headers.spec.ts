import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    AuthenticationExceptionCodeEnum,
    SESSION_COOKIE_NAME,
} from '@cocooning/couple-contract/authentication';
import { ok } from '@cocooning/shared-kernel/utils';
import { sessionHeaders } from './session-headers';

describe('Feature: the Next server forwards the session of the partner', () => {
    describe('Scenario: the browser sent its session cookie', () => {
        it('sends it back to the API as the cookie its guard reads', async () => {
            await expect(
                sessionHeaders(() => Promise.resolve('session-token-1')),
            ).resolves.toEqual(
                ok({ Cookie: `${SESSION_COOKIE_NAME}=session-token-1` }),
            );
        });
    });

    describe('Scenario: no session cookie', () => {
        it.each([null, ''])(
            'refuses as the API would, without calling it (%p)',
            async (token) => {
                const result = await sessionHeaders(() =>
                    Promise.resolve(token),
                );
                expect(result).toEqual({
                    success: false,
                    error: expect.objectContaining({
                        code: ApiErrorCodeEnum.UNAUTHORIZED,
                        backendCode:
                            AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
                    }),
                });
            },
        );
    });
});
