import {
    EMAIL_ADDRESS_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { SignInRequestSchema } from './sign-in.request';

const PASSWORD = 'correct horse battery';

describe('Feature: the credentials sent to sign in', () => {
    describe('Scenario: an address typed with surrounding spaces', () => {
        it('accepts it without them, the domain normalizing the rest', () => {
            expect(
                SignInRequestSchema.parse({
                    emailAddress: '  Thomas@Example.com ',
                    password: PASSWORD,
                }),
            ).toEqual({
                emailAddress: 'Thomas@Example.com',
                password: PASSWORD,
            });
        });
    });

    describe('Scenario: a short password', () => {
        it('accepts it, the policy applying only when the account is created', () => {
            expect(
                SignInRequestSchema.safeParse({
                    emailAddress: 'thomas@example.com',
                    password: 'short',
                }).success,
            ).toBe(true);
        });
    });

    describe('Scenario: a password with surrounding spaces', () => {
        it('keeps them, they belong to the password', () => {
            expect(
                SignInRequestSchema.parse({
                    emailAddress: 'thomas@example.com',
                    password: ` ${PASSWORD} `,
                }).password,
            ).toBe(` ${PASSWORD} `);
        });
    });

    describe('Scenario: unusable credentials', () => {
        it.each([
            ['a missing address', { password: PASSWORD }],
            [
                'an address made of spaces',
                { emailAddress: '   ', password: PASSWORD },
            ],
            [
                'an address longer than the bound',
                {
                    emailAddress: 'a'.repeat(EMAIL_ADDRESS_MAX_LENGTH + 1),
                    password: PASSWORD,
                },
            ],
            ['a missing password', { emailAddress: 'thomas@example.com' }],
            [
                'an empty password',
                { emailAddress: 'thomas@example.com', password: '' },
            ],
            [
                'a password longer than the bound',
                {
                    emailAddress: 'thomas@example.com',
                    password: 'a'.repeat(PASSWORD_MAX_LENGTH + 1),
                },
            ],
        ])('rejects %s', (_label, body) => {
            expect(SignInRequestSchema.safeParse(body).success).toBe(false);
        });
    });
});
