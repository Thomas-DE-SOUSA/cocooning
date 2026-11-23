import {
    EMAIL_ADDRESS_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { createSignInFormSchema } from './sign-in-form.zod';

const schema = createSignInFormSchema((key) => `translated:${key}`);

const aValidForm = (overrides: Record<string, string> = {}) => ({
    emailAddress: 'thomas@cocooning.test',
    password: 'correct horse battery staple',
    ...overrides,
});

const messagesOf = (form: Record<string, string>): readonly string[] => {
    const parsed = schema.safeParse(form);
    return parsed.success ? [] : parsed.error.issues.map((i) => i.message);
};

describe('Feature: the sign-in form checks what the partner typed', () => {
    describe('Scenario: R3, an address and a password', () => {
        it('accepts them, the address without surrounding spaces', () => {
            expect(
                schema.parse(
                    aValidForm({ emailAddress: '  Thomas@Cocooning.test ' }),
                ),
            ).toEqual(aValidForm({ emailAddress: 'Thomas@Cocooning.test' }));
        });

        it('accepts a short password, the policy applying only at creation (R2)', () => {
            expect(messagesOf(aValidForm({ password: 'short' }))).toEqual([]);
        });
    });

    describe('Scenario: decision 0031, a field to correct', () => {
        it.each([
            [
                'an empty address',
                { emailAddress: '  ' },
                'form.emailAddress.errors.required',
            ],
            [
                'an address longer than the bound',
                { emailAddress: 'a'.repeat(EMAIL_ADDRESS_MAX_LENGTH + 1) },
                'form.emailAddress.errors.tooLong',
            ],
            [
                'an empty password',
                { password: '' },
                'form.password.errors.required',
            ],
            [
                'a password longer than the bound',
                { password: 'a'.repeat(PASSWORD_MAX_LENGTH + 1) },
                'form.password.errors.tooLong',
            ],
        ])('shows the translated message for %s', (_label, overrides, key) => {
            expect(messagesOf(aValidForm(overrides))).toEqual([
                `translated:${key}`,
            ]);
        });
    });
});
