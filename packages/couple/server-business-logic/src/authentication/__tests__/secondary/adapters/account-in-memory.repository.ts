import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { AuthenticationException } from '../../../domain/exceptions/authentication.exception';
import { Account } from '../../../domain/models/account.aggregate';
import type { AccountSnapshot } from '../../../domain/models/account.aggregate.type';
import { AccountRepository } from '../../../domain/ports/account.repository';

const FIRST_VERSION = 1;

const fail = (code: keyof typeof AuthenticationExceptionCodeEnum): never => {
    throw new AuthenticationException({ code, message: `In-memory ${code}` });
};

// Mimics the adapter: optimistic version, unique address among active accounts, a deleted account found by neither lookup.
export class AccountInMemoryRepository extends AccountRepository {
    private snapshots: ReadonlyMap<string, AccountSnapshot> = new Map();
    private concurrentSave: Account | null = null;

    get storedSnapshots(): ReadonlyArray<AccountSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(account: Account): void {
        this.store(account.toSnapshot());
    }

    simulateConcurrentSave(account: Account): void {
        this.concurrentSave = account;
    }

    override save(account: Account): Promise<void> {
        return Promise.resolve().then(() => this.write(account));
    }

    override findById(accountId: string): Promise<Account | null> {
        return this.findWhere(
            ({ id, metadata }) =>
                id === accountId && metadata.deletedAt === null,
        );
    }

    override findByEmailAddress(emailAddress: string): Promise<Account | null> {
        return this.findWhere(
            (snapshot) =>
                snapshot.emailAddress === emailAddress &&
                snapshot.metadata.deletedAt === null,
        );
    }

    private write(account: Account): void {
        const concurrent = this.concurrentSave;
        this.concurrentSave = null;
        if (concurrent !== null) this.store(concurrent.toSnapshot());
        this.store(account.toSnapshot());
    }

    private findWhere(
        predicate: (snapshot: AccountSnapshot) => boolean,
    ): Promise<Account | null> {
        const found = this.storedSnapshots.find(predicate);
        return Promise.resolve(
            found === undefined
                ? null
                : Account.fromSnapshot(structuredClone(found)),
        );
    }

    private store(snapshot: AccountSnapshot): void {
        const stored = this.snapshots.get(snapshot.id) ?? null;
        if (stored !== null && stored.version !== snapshot.version) {
            fail(
                AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_VERSION_CONFLICT,
            );
        }
        const sharesTheAddress = this.storedSnapshots.some(
            (other) =>
                other.id !== snapshot.id &&
                other.metadata.deletedAt === null &&
                other.emailAddress === snapshot.emailAddress,
        );
        if (sharesTheAddress) {
            fail(
                AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS,
            );
        }
        const version = stored === null ? FIRST_VERSION : stored.version + 1;
        this.snapshots = new Map([
            ...this.snapshots,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
