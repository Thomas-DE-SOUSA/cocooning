import type { Account } from '../../domain/models/account.aggregate';

export type AccountView = {
    readonly userId: string;
    readonly emailAddress: string;
};

export const toAccountView = (account: Account): AccountView => ({
    userId: account.id.getValue(),
    emailAddress: account.emailAddress.value,
});
