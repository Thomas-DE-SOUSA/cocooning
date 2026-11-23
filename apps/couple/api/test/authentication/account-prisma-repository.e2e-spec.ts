import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { createTestAccount } from '@cocooning/couple-e2e-shared/fixtures';
import {
    Account,
    AccountRepository,
    EmailAddress,
} from '@cocooning/couple-server-business-logic/authentication';
import { AuthenticationTestApp } from './authentication-test-app';
import {
    EMAIL_ADDRESS_A,
    EMAIL_ADDRESS_B,
    NOW,
    PARTNER_A,
    PARTNER_B,
} from './authentication-test-data';

const HASH = 'stored-hash';

describe('Feature: the Prisma adapter of AccountRepository', () => {
    const auth = new AuthenticationTestApp();
    let repository: AccountRepository;

    beforeAll(async () => {
        await auth.start();
        repository = auth.nestApp.get(AccountRepository);
    });
    afterAll(() => auth.stop());
    beforeEach(async () => {
        await auth.reset();
        await auth.givenAccount(PARTNER_A, EMAIL_ADDRESS_A);
        await createTestAccount(auth.prisma, {
            accountId: PARTNER_B,
            emailAddress: EMAIL_ADDRESS_B,
            passwordHash: HASH,
            sessionVersion: 1,
            createdAt: NOW,
            deletedAt: NOW,
        });
    });

    const newAccount = (emailAddress: string): Account =>
        Account.create(
            {
                emailAddress: EmailAddress.create(emailAddress),
                passwordHash: HASH,
            },
            NOW,
        );

    const load = async (accountId: string): Promise<Account> => {
        const account = await repository.findById(accountId);
        if (account === null) throw new Error('Expected a stored account');
        return account;
    };

    const storedRow = (id: string) =>
        auth.prisma.includingDeleted.account.findFirst({
            where: { id },
            select: { sessionVersion: true, version: true },
        });

    describe('Scenario: lookups of a live account', () => {
        it('finds it by id and by address', async () => {
            const byId = await repository.findById(PARTNER_A);
            const byAddress =
                await repository.findByEmailAddress(EMAIL_ADDRESS_A);
            expect(byId?.emailAddress.value).toBe(EMAIL_ADDRESS_A);
            expect(byAddress?.id.getValue()).toBe(PARTNER_A);
        });
    });

    describe('Scenario: a deleted account', () => {
        it('is found by neither lookup', async () => {
            await expect(repository.findById(PARTNER_B)).resolves.toBeNull();
            await expect(
                repository.findByEmailAddress(EMAIL_ADDRESS_B),
            ).resolves.toBeNull();
        });

        it('frees its address for a new account (partial unique index)', async () => {
            const account = newAccount(EMAIL_ADDRESS_B);
            await repository.save(account);
            await expect(
                repository.findByEmailAddress(EMAIL_ADDRESS_B),
            ).resolves.toMatchObject({ id: account.id });
        });
    });

    describe('Scenario: R5, a sign-out is saved', () => {
        it('raises the session version and the version of the row', async () => {
            const account = await load(PARTNER_A);
            account.revokeSessions(NOW);
            await repository.save(account);
            await expect(storedRow(PARTNER_A)).resolves.toEqual({
                sessionVersion: 2,
                version: 2,
            });
        });
    });

    describe('Scenario: two saves of the same read', () => {
        it('refuses the second with a version conflict', async () => {
            const first = await load(PARTNER_A);
            const second = await load(PARTNER_A);
            first.revokeSessions(NOW);
            second.revokeSessions(NOW);
            await repository.save(first);
            await expect(repository.save(second)).rejects.toMatchObject({
                code: AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_VERSION_CONFLICT,
            });
        });
    });

    describe('Scenario: R1, a new account with an address already taken', () => {
        it('maps the unique index to its domain code', async () => {
            await expect(
                repository.save(newAccount(EMAIL_ADDRESS_A)),
            ).rejects.toMatchObject({
                code: AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS,
            });
        });
    });
});
