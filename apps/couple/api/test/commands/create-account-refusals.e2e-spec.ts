import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { AuthenticationTestApp } from '../authentication/authentication-test-app';
import {
    EMAIL_ADDRESS_A,
    PARTNER_A,
    PASSWORD,
} from '../authentication/authentication-test-data';
import { refused, runCreateAccount } from './create-account-test-data';

describe('Feature: the command refuses to create an account (R1, R2)', () => {
    const auth = new AuthenticationTestApp();

    beforeAll(() => auth.start());
    afterAll(() => auth.stop());
    beforeEach(() => auth.reset());

    describe('Scenario: R1, R2, the domain refuses', () => {
        it('refuses a malformed address with exit 65', async () => {
            await expect(
                runCreateAccount(['not-an-address'], [PASSWORD, PASSWORD]),
            ).resolves.toMatchObject({
                exitCode: 65,
                errorOutput: refused(
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_EMAIL_ADDRESS_INVALID,
                    'Invalid email address',
                ),
            });
        });

        it('refuses a password of 11 characters with exit 65', async () => {
            await expect(
                runCreateAccount(
                    [EMAIL_ADDRESS_A],
                    ['short-11-ch', 'short-11-ch'],
                ),
            ).resolves.toMatchObject({
                exitCode: 65,
                errorOutput: refused(
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_PASSWORD_TOO_WEAK,
                    'Password does not meet the policy',
                ),
            });
        });

        it('refuses an address already taken with exit 65', async () => {
            await auth.givenAccount(PARTNER_A, EMAIL_ADDRESS_A);
            await expect(
                runCreateAccount([EMAIL_ADDRESS_A], [PASSWORD, PASSWORD]),
            ).resolves.toMatchObject({
                exitCode: 65,
                errorOutput: refused(
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS,
                    'Account already exists',
                ),
            });
        });
    });

    describe('Scenario: a mistake on the command line or the terminal', () => {
        it('exits 64 without an address', async () => {
            await expect(runCreateAccount([], [])).resolves.toEqual({
                exitCode: 64,
                output: '',
                errorOutput: 'Usage: create-account <email address>\n',
            });
        });

        it('exits 64 when the two passwords differ, and creates nothing', async () => {
            const run = await runCreateAccount(
                [EMAIL_ADDRESS_A],
                [PASSWORD, `${PASSWORD}!`],
            );
            expect(run).toMatchObject({
                exitCode: 64,
                errorOutput: 'The two passwords differ\n',
            });
            await expect(auth.signIn(EMAIL_ADDRESS_A)).resolves.toMatchObject({
                status: 401,
            });
        });

        it('exits 64 when the input closes before the confirmation', async () => {
            await expect(
                runCreateAccount([EMAIL_ADDRESS_A], [PASSWORD]),
            ).resolves.toMatchObject({
                exitCode: 64,
                errorOutput: 'Password input closed\n',
            });
        });
    });
});
