import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { AccountId } from '../../domain/value-objects/account-id.vo';
import {
    AuthenticationTestContext,
    EMAIL_ADDRESS,
    MILLISECONDS_PER_DAY,
    NOW,
    PASSWORD,
    SESSION_LIFETIME_IN_DAYS,
} from '../../__tests__/fixtures/authentication-test.context';
import { FakePasswordHasher } from '../../__tests__/secondary/adapters/fake-password-hasher';

const EXPIRES_AT = new Date(
    NOW.getTime() + SESSION_LIFETIME_IN_DAYS * MILLISECONDS_PER_DAY,
);

describe('Feature: sign in', () => {
    let ctx: AuthenticationTestContext;

    beforeEach(() => {
        ctx = new AuthenticationTestContext();
    });
    afterEach(() => AccountId.resetForTests());

    const signIn = (emailAddress: string, password: string) =>
        ctx.signInUseCase().execute({ emailAddress, password });

    const expectCredentialsInvalid = async (
        emailAddress: string,
        password: string,
    ): Promise<void> => {
        await expect(signIn(emailAddress, password)).rejects.toMatchObject({
            code: AuthenticationExceptionCodeEnum.AUTHENTICATION_CREDENTIALS_INVALID,
        });
    };

    describe('Scenario: R4, the right address and password', () => {
        it('opens a session of 90 days for the account', async () => {
            const account = ctx.givenAccount();
            await expect(signIn(EMAIL_ADDRESS, PASSWORD)).resolves.toEqual({
                userId: account.id.getValue(),
                sessionToken: 'session-token-1',
                sessionExpiresAt: EXPIRES_AT,
            });
        });

        it('signs the partner and the current session version', async () => {
            const account = ctx.givenAccount();
            const { sessionToken } = await signIn(EMAIL_ADDRESS, PASSWORD);
            await expect(
                ctx.sessionTokenSigner.verify(sessionToken, NOW),
            ).resolves.toEqual({
                userId: account.id.getValue(),
                sessionVersion: 1,
                expiresAt: EXPIRES_AT,
            });
        });

        it('reads the address as it was typed, with spaces and capitals', async () => {
            ctx.givenAccount();
            await expect(
                signIn(' Thomas@EXAMPLE.com ', PASSWORD),
            ).resolves.toMatchObject({ sessionToken: 'session-token-1' });
        });

        it('changes nothing on the account', async () => {
            ctx.givenAccount();
            const before = ctx.accountRepository.storedSnapshots;
            await signIn(EMAIL_ADDRESS, PASSWORD);
            expect(ctx.accountRepository.storedSnapshots).toEqual(before);
        });
    });

    describe('Scenario: R3, a wrong password', () => {
        it('refuses with AUTHENTICATION_CREDENTIALS_INVALID', async () => {
            ctx.givenAccount();
            await expectCredentialsInvalid(EMAIL_ADDRESS, 'wrong password!');
        });
    });

    describe('Scenario: R3, an unknown address', () => {
        it('refuses with the same code as a wrong password', async () => {
            ctx.givenAccount();
            await expectCredentialsInvalid('nobody@example.com', PASSWORD);
        });

        it('still checks a password, so the answer takes the same time', async () => {
            await expectCredentialsInvalid('nobody@example.com', PASSWORD);
            expect(ctx.passwordHasher.checkedHashes).toEqual([null]);
        });
    });

    describe('Scenario: R3, a known password checked against its own hash', () => {
        it('checks exactly the stored hash', async () => {
            ctx.givenAccount();
            await signIn(EMAIL_ADDRESS, PASSWORD);
            expect(ctx.passwordHasher.checkedHashes).toEqual([
                FakePasswordHasher.hashOf(PASSWORD),
            ]);
        });
    });
});
