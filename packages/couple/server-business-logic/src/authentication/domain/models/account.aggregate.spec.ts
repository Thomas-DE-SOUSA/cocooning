import { AuthenticationTestContext } from '../../__tests__/fixtures/authentication-test.context';
import { AccountId } from '../value-objects/account-id.vo';
import { Account } from './account.aggregate';
import type { AccountSnapshot } from './account.aggregate.type';

const SNAPSHOT: AccountSnapshot = {
    id: '00000000-0000-7000-8000-000000000001',
    emailAddress: 'thomas@example.com',
    passwordHash: 'stored-hash',
    sessionVersion: 3,
    version: 7,
    metadata: {
        createdAt: '2026-11-23T10:00:00.000Z',
        updatedAt: '2026-11-24T10:00:00.000Z',
        deletedAt: null,
    },
};

describe('Feature: the account aggregate', () => {
    beforeEach(() => new AuthenticationTestContext());
    afterEach(() => AccountId.resetForTests());

    describe('Scenario: an account read from the database', () => {
        it('gives back the same snapshot', () => {
            expect(Account.fromSnapshot(SNAPSHOT).toSnapshot()).toEqual(
                SNAPSHOT,
            );
        });
    });

    describe('Scenario: R5, a session of another account with the same version', () => {
        it('is not accepted', () => {
            const account = Account.fromSnapshot(SNAPSHOT);
            expect(
                account.acceptsSession({
                    userId: '00000000-0000-7000-8000-000000000002',
                    sessionVersion: 3,
                    expiresAt: new Date('2027-01-01T00:00:00.000Z'),
                }),
            ).toBe(false);
        });
    });
});
