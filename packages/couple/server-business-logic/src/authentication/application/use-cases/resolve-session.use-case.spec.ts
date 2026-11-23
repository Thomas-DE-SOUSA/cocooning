import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { AccountId } from '../../domain/value-objects/account-id.vo';
import {
    AuthenticationTestContext,
    SESSION_LIFETIME_IN_DAYS,
} from '../../__tests__/fixtures/authentication-test.context';

const SESSION_INVALID = {
    code: AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
};

describe('Feature: resolve the session of a request', () => {
    let ctx: AuthenticationTestContext;

    beforeEach(() => {
        ctx = new AuthenticationTestContext();
    });
    afterEach(() => AccountId.resetForTests());

    const resolve = (sessionToken: string) =>
        ctx.resolveSessionUseCase().execute({ sessionToken });

    describe('Scenario: R4, a live session', () => {
        it('returns the partner of the account', async () => {
            const account = ctx.givenAccount();
            const token = await ctx.givenSessionOf();
            await expect(resolve(token)).resolves.toEqual({
                userId: account.id.getValue(),
            });
        });

        it('still holds on its last day', async () => {
            const token = await (ctx.givenAccount(), ctx.givenSessionOf());
            ctx.advanceDays(SESSION_LIFETIME_IN_DAYS - 1);
            await expect(resolve(token)).resolves.toMatchObject({});
        });
    });

    describe('Scenario: R4, a session past its 90 days', () => {
        it('refuses with AUTHENTICATION_SESSION_INVALID', async () => {
            ctx.givenAccount();
            const token = await ctx.givenSessionOf();
            ctx.advanceDays(SESSION_LIFETIME_IN_DAYS);
            await expect(resolve(token)).rejects.toMatchObject(SESSION_INVALID);
        });
    });

    describe('Scenario: a token the API never signed', () => {
        it('refuses with AUTHENTICATION_SESSION_INVALID', async () => {
            ctx.givenAccount();
            await expect(resolve('forged-token')).rejects.toMatchObject(
                SESSION_INVALID,
            );
        });
    });

    describe('Scenario: R5, a session opened before the partner signed out', () => {
        it('refuses with AUTHENTICATION_SESSION_INVALID', async () => {
            const account = ctx.givenAccount();
            const token = await ctx.givenSessionOf();
            await ctx
                .signOutUseCase()
                .execute({ userId: account.id.getValue() });
            await expect(resolve(token)).rejects.toMatchObject(SESSION_INVALID);
        });
    });

    describe('Scenario: the account of the session no longer exists', () => {
        it('refuses with AUTHENTICATION_SESSION_INVALID', async () => {
            const token = await ctx.sessionTokenSigner.sign({
                userId: '00000000-0000-7000-8000-0000000000ff',
                sessionVersion: 1,
                expiresAt: new Date('2030-01-01T00:00:00.000Z'),
            });
            await expect(resolve(token)).rejects.toMatchObject(SESSION_INVALID);
        });
    });
});
