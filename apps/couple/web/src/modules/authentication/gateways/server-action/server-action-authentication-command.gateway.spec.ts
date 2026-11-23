import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionAuthenticationCommandGateway } from './server-action-authentication-command.gateway';

const FORM = {
    emailAddress: 'thomas@cocooning.test',
    password: 'correct horse battery',
};
const answers = () => Promise.resolve(ok(null));
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

describe('Feature: authentication through the server actions', () => {
    describe('Scenario: the actions answer', () => {
        it('gives their results and sends the form to sign in', async () => {
            const sent: unknown[] = [];
            const gateway = new ServerActionAuthenticationCommandGateway({
                signIn: (form) => {
                    sent.push(form);
                    return answers();
                },
                signOut: answers,
            });

            expect(await gateway.signIn(FORM)).toEqual(ok(null));
            expect(await gateway.signOut()).toEqual(ok(null));
            expect(sent).toEqual([FORM]);
        });
    });

    describe('Scenario: the actions cannot be reached', () => {
        it.each(['signIn', 'signOut'] as const)(
            'gives a network error instead of rejecting for %s',
            async (command) => {
                const gateway = new ServerActionAuthenticationCommandGateway({
                    signIn: rejects,
                    signOut: rejects,
                });

                expect(
                    await (command === 'signIn'
                        ? gateway.signIn(FORM)
                        : gateway.signOut()),
                ).toEqual({
                    success: false,
                    error: expect.objectContaining({
                        code: ApiErrorCodeEnum.NETWORK_ERROR,
                        backendCode: null,
                    }),
                });
            },
        );
    });
});
