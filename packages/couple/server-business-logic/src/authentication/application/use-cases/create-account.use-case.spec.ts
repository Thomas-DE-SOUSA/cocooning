import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { Account } from '../../domain/models/account.aggregate';
import { AccountId } from '../../domain/value-objects/account-id.vo';
import { EmailAddress } from '../../domain/value-objects/email-address.vo';
import {
    AuthenticationTestContext,
    EMAIL_ADDRESS,
    NOW,
    PASSWORD,
} from '../../__tests__/fixtures/authentication-test.context';
import { FakePasswordHasher } from '../../__tests__/secondary/adapters/fake-password-hasher';

const FIRST_ACCOUNT_ID = '00000000-0000-7000-8000-000000000001';

describe('Feature: create an account', () => {
    let ctx: AuthenticationTestContext;

    beforeEach(() => {
        ctx = new AuthenticationTestContext();
    });
    afterEach(() => AccountId.resetForTests());

    const create = (emailAddress: string, password: string = PASSWORD) =>
        ctx.createAccountUseCase().execute({ emailAddress, password });

    const expectRefusal = async (
        emailAddress: string,
        password: string,
        code: string,
    ): Promise<void> => {
        await expect(create(emailAddress, password)).rejects.toMatchObject({
            code,
        });
    };

    describe('Scenario: R1, a well-formed address and an acceptable password', () => {
        it('returns the new account, its address trimmed and lower-cased', async () => {
            await expect(create('  Thomas@Example.COM ')).resolves.toEqual({
                userId: FIRST_ACCOUNT_ID,
                emailAddress: EMAIL_ADDRESS,
            });
        });

        it('stores only the hash of the password, at the first session version', async () => {
            await create(EMAIL_ADDRESS);
            expect(ctx.accountRepository.storedSnapshots).toEqual([
                {
                    id: FIRST_ACCOUNT_ID,
                    emailAddress: EMAIL_ADDRESS,
                    passwordHash: FakePasswordHasher.hashOf(PASSWORD),
                    sessionVersion: 1,
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });
    });

    describe('Scenario: R1, the address is already taken', () => {
        it('refuses with AUTHENTICATION_ACCOUNT_ALREADY_EXISTS and keeps one account', async () => {
            ctx.givenAccount();
            await expectRefusal(
                'THOMAS@example.com',
                PASSWORD,
                AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS,
            );
            expect(ctx.accountRepository.storedSnapshots).toHaveLength(1);
        });
    });

    describe('Scenario: R1, two creations race for the same address', () => {
        it('lets the unique address refuse the second one', async () => {
            const rival = Account.create(
                {
                    emailAddress: EmailAddress.create(EMAIL_ADDRESS),
                    passwordHash: FakePasswordHasher.hashOf(PASSWORD),
                },
                NOW,
            );
            ctx.accountRepository.simulateConcurrentSave(rival);
            await expectRefusal(
                EMAIL_ADDRESS,
                PASSWORD,
                AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS,
            );
            expect(ctx.accountRepository.storedSnapshots).toEqual([
                rival.toSnapshot(),
            ]);
        });
    });

    describe('Scenario: R1, a malformed address', () => {
        it.each([
            ['no at sign', 'thomas.example.com'],
            ['no domain dot', 'thomas@example'],
            ['a space inside', 'tho mas@example.com'],
            ['longer than 254 characters', `${'a'.repeat(243)}@example.com`],
        ])(
            'refuses %s with AUTHENTICATION_EMAIL_ADDRESS_INVALID',
            async (_, address) => {
                await expectRefusal(
                    address,
                    PASSWORD,
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_EMAIL_ADDRESS_INVALID,
                );
                expect(ctx.accountRepository.storedSnapshots).toEqual([]);
            },
        );
    });

    describe('Scenario: R2, the password length', () => {
        it.each([
            ['11 characters', 'a'.repeat(11)],
            ['129 characters', 'a'.repeat(129)],
        ])(
            'refuses %s with AUTHENTICATION_PASSWORD_TOO_WEAK',
            async (_, password) => {
                await expectRefusal(
                    EMAIL_ADDRESS,
                    password,
                    AuthenticationExceptionCodeEnum.AUTHENTICATION_PASSWORD_TOO_WEAK,
                );
                expect(ctx.accountRepository.storedSnapshots).toEqual([]);
            },
        );

        it.each([
            ['12 characters', 'a'.repeat(12)],
            ['128 characters', 'a'.repeat(128)],
        ])('accepts %s', async (_, password) => {
            await expect(
                create(EMAIL_ADDRESS, password),
            ).resolves.toMatchObject({
                emailAddress: EMAIL_ADDRESS,
            });
        });
    });
});
