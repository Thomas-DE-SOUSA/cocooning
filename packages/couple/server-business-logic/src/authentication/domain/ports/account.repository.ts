import type { Account } from '../models/account.aggregate';

// An account exists before any couple: no coupleId (decision 0033). Each lookup rests on a unique key.
export abstract class AccountRepository {
    abstract save(account: Account): Promise<void>;
    abstract findById(accountId: string): Promise<Account | null>;
    abstract findByEmailAddress(emailAddress: string): Promise<Account | null>;
}
