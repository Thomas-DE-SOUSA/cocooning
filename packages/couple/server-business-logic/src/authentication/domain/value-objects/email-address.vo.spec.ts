import { EmailAddress } from './email-address.vo';

describe('Feature: the email address of an account', () => {
    describe('Scenario: R1, an address of exactly 254 characters', () => {
        it('is accepted', () => {
            const address = `${'a'.repeat(242)}@example.com`;
            expect(EmailAddress.create(address).value).toBe(address);
        });
    });

    describe('Scenario: an address read from the database', () => {
        it('is kept as stored, without validation', () => {
            expect(EmailAddress.from('legacy').value).toBe('legacy');
        });
    });

    describe('Scenario: two addresses typed differently', () => {
        it('are equal once created', () => {
            expect(
                EmailAddress.create(' A@B.fr').equals(
                    EmailAddress.create('a@b.fr'),
                ),
            ).toBe(true);
        });
    });
});
