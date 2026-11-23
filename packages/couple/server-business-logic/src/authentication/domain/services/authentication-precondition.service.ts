import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { AuthenticationException } from '../exceptions/authentication.exception';
import type { Account } from '../models/account.aggregate';
import type { AccountRepository } from '../ports/account.repository';
import type { PasswordHasher } from '../ports/password-hasher';
import type { SessionTokenSigner } from '../ports/session-token-signer';
import { EmailAddress } from '../value-objects/email-address.vo';

const exception = (
    code: keyof typeof AuthenticationExceptionCodeEnum,
    message: string,
): AuthenticationException => new AuthenticationException({ code, message });

const sessionInvalid = (): AuthenticationException =>
    exception(
        AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
        'Session invalid',
    );

export class AuthenticationPreconditionService {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly sessionTokenSigner: SessionTokenSigner,
    ) {}

    // R1: one account per address.
    async ensureEmailAddressAvailable(
        emailAddress: EmailAddress,
    ): Promise<void> {
        const account = await this.accountRepository.findByEmailAddress(
            emailAddress.value,
        );
        if (account === null) return;
        throw exception(
            AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS,
            'Account already exists',
        );
    }

    // R3: an unknown address and a wrong password get the same answer, after the same work.
    async loadAccountByCredentials(
        rawEmailAddress: string,
        password: string,
    ): Promise<Account> {
        const account = await this.accountRepository.findByEmailAddress(
            EmailAddress.normalize(rawEmailAddress),
        );
        const hash = account === null ? null : account.passwordHash;
        const matches = await this.passwordHasher.matches(password, hash);
        if (account !== null && matches) return account;
        throw exception(
            AuthenticationExceptionCodeEnum.AUTHENTICATION_CREDENTIALS_INVALID,
            'Invalid credentials',
        );
    }

    // R5: a token issued before the last sign-out is worth nothing.
    async loadAccountOfSession(
        sessionToken: string,
        now: Date,
    ): Promise<Account> {
        const claims = await this.sessionTokenSigner.verify(sessionToken, now);
        if (claims === null) throw sessionInvalid();
        const account = await this.accountRepository.findById(claims.userId);
        if (account?.acceptsSession(claims)) return account;
        throw sessionInvalid();
    }

    async loadAccount(accountId: string): Promise<Account> {
        const account = await this.accountRepository.findById(accountId);
        if (account !== null) return account;
        throw sessionInvalid();
    }
}
