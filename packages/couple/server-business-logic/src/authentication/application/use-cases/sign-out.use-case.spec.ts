import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { AccountId } from '../../domain/value-objects/account-id.vo';
import {
    AuthenticationTestContext,
    MILLISECONDS_PER_DAY,
    NOW,
} from '../../__tests__/fixtures/authentication-test.context';

const PARTNER_B_EMAIL = 'partner-b@example.com';
const SIGNED_OUT_AT = new Date(NOW.getTime() + MILLISECONDS_PER_DAY);

describe('Feature: sign out', () => {
    let ctx: AuthenticationTestContext;

    beforeEach(() => {
        ctx = new AuthenticationTestContext();
    });
    afterEach(() => AccountId.resetForTests());

    const signOut = (userId: string) =>
        ctx.signOutUseCase().execute({ userId });
    const resolve = (sessionToken: string) =>
        ctx.resolveSessionUseCase().execute({ sessionToken });

    describe('Scenario: R5, a partner signs out', () => {
        it('closes every session of the partner, on every device', async () => {
            const account = ctx.givenAccount();
            const phone = await ctx.givenSessionOf();
            const laptop = await ctx.givenSessionOf();
            await signOut(account.id.getValue());
            await expect(resolve(phone)).rejects.toMatchObject({
                code: AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
            });
            await expect(resolve(laptop)).rejects.toMatchObject({
                code: AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
            });
        });

        it('moves the account to the next session version', async () => {
            const account = ctx.givenAccount();
            ctx.advanceDays(1);
            await signOut(account.id.getValue());
            expect(ctx.accountRepository.storedSnapshots).toEqual([
                expect.objectContaining({
                    sessionVersion: 2,
                    version: 2,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: SIGNED_OUT_AT.toISOString(),
                        deletedAt: null,
                    },
                }),
            ]);
        });

        it('keeps the sessions of the other partner', async () => {
            const partnerA = ctx.givenAccount();
            const partnerB = ctx.givenAccount(PARTNER_B_EMAIL);
            const sessionOfB = await ctx.givenSessionOf(PARTNER_B_EMAIL);
            await signOut(partnerA.id.getValue());
            await expect(resolve(sessionOfB)).resolves.toEqual({
                userId: partnerB.id.getValue(),
            });
        });

        it('lets the partner sign in again afterwards', async () => {
            const account = ctx.givenAccount();
            await signOut(account.id.getValue());
            const token = await ctx.givenSessionOf();
            await expect(resolve(token)).resolves.toEqual({
                userId: account.id.getValue(),
            });
        });
    });

    describe('Scenario: the account no longer exists', () => {
        it('refuses with AUTHENTICATION_SESSION_INVALID', async () => {
            await expect(
                signOut('00000000-0000-7000-8000-0000000000ff'),
            ).rejects.toMatchObject({
                code: AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
            });
        });
    });

    describe('Scenario: two sign-outs race on the same account', () => {
        it('refuses the stale one with AUTHENTICATION_ACCOUNT_VERSION_CONFLICT', async () => {
            const account = ctx.givenAccount();
            const rival = (await ctx.accountRepository.findById(
                account.id.getValue(),
            ))!;
            rival.revokeSessions(NOW);
            ctx.accountRepository.simulateConcurrentSave(rival);
            await expect(signOut(account.id.getValue())).rejects.toMatchObject({
                code: AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_VERSION_CONFLICT,
            });
        });
    });
});
