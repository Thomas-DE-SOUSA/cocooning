import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionAuthenticationCommandGateway } from './server-action-authentication-command.gateway';

const FORM = {
    emailAddress: 'thomas@cocooning.test',
    password: 'correct horse battery',
};

describe('Feature: signing in through the server action', () => {
    describe('Scenario: the action answers', () => {
        it('gives its result and sends it the form', async () => {
            const sent: unknown[] = [];
            const gateway = new ServerActionAuthenticationCommandGateway(
                (form) => {
                    sent.push(form);
                    return Promise.resolve(ok(null));
                },
            );

            expect(await gateway.signIn(FORM)).toEqual(ok(null));
            expect(sent).toEqual([FORM]);
        });
    });

    describe('Scenario: the action cannot be reached', () => {
        it('gives a network error instead of rejecting', async () => {
            const gateway = new ServerActionAuthenticationCommandGateway(() =>
                Promise.reject(new TypeError('Failed to fetch')),
            );

            expect(await gateway.signIn(FORM)).toEqual({
                success: false,
                error: expect.objectContaining({
                    code: ApiErrorCodeEnum.NETWORK_ERROR,
                    backendCode: null,
                }),
            });
        });
    });
});
