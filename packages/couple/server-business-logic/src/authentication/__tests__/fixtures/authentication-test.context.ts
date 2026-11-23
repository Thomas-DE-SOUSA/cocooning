import {
    DeterministicDateTimeProvider,
    FakeUuidV7GeneratorProvider,
} from '@cocooning/shared-kernel/testing';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { ResolveSessionUseCase } from '../../application/use-cases/resolve-session.use-case';
import { SignInUseCase } from '../../application/use-cases/sign-in.use-case';
import { SignOutUseCase } from '../../application/use-cases/sign-out.use-case';
import { Account } from '../../domain/models/account.aggregate';
import { AuthenticationPreconditionService } from '../../domain/services/authentication-precondition.service';
import { AccountId } from '../../domain/value-objects/account-id.vo';
import { EmailAddress } from '../../domain/value-objects/email-address.vo';
import { AccountInMemoryRepository } from '../secondary/adapters/account-in-memory.repository';
import { FakePasswordHasher } from '../secondary/adapters/fake-password-hasher';
import { FakeSessionTokenSigner } from '../secondary/adapters/fake-session-token-signer';

export const NOW = new Date('2026-11-23T10:00:00.000Z');
export const SESSION_LIFETIME_IN_DAYS = 90;
export const MILLISECONDS_PER_DAY = 86_400_000;
export const EMAIL_ADDRESS = 'thomas@example.com';
export const PASSWORD = 'correct horse battery';

// Configures the process-wide UUID generator: call `AccountId.resetForTests()` in afterEach.
export class AuthenticationTestContext {
    readonly dateTimeProvider = new DeterministicDateTimeProvider(NOW);
    readonly accountRepository = new AccountInMemoryRepository();
    readonly passwordHasher = new FakePasswordHasher();
    readonly sessionTokenSigner = new FakeSessionTokenSigner();
    private readonly preconditions = new AuthenticationPreconditionService(
        this.accountRepository,
        this.passwordHasher,
        this.sessionTokenSigner,
    );

    constructor() {
        AccountId.configure(new FakeUuidV7GeneratorProvider());
    }

    createAccountUseCase(): CreateAccountUseCase {
        return new CreateAccountUseCase(
            this.accountRepository,
            this.preconditions,
            this.passwordHasher,
            this.dateTimeProvider,
        );
    }

    signInUseCase(): SignInUseCase {
        return new SignInUseCase(
            this.preconditions,
            this.sessionTokenSigner,
            this.dateTimeProvider,
            SESSION_LIFETIME_IN_DAYS,
        );
    }

    resolveSessionUseCase(): ResolveSessionUseCase {
        return new ResolveSessionUseCase(
            this.preconditions,
            this.dateTimeProvider,
        );
    }

    signOutUseCase(): SignOutUseCase {
        return new SignOutUseCase(
            this.accountRepository,
            this.preconditions,
            this.dateTimeProvider,
        );
    }

    // Builds an account as if it were already in the database.
    givenAccount(emailAddress: string = EMAIL_ADDRESS): Account {
        const account = Account.create(
            {
                emailAddress: EmailAddress.create(emailAddress),
                passwordHash: FakePasswordHasher.hashOf(PASSWORD),
            },
            this.dateTimeProvider.now(),
        );
        this.accountRepository.seed(account);
        return account;
    }

    async givenSessionOf(
        emailAddress: string = EMAIL_ADDRESS,
    ): Promise<string> {
        const session = await this.signInUseCase().execute({
            emailAddress,
            password: PASSWORD,
        });
        return session.sessionToken;
    }

    advanceDays(days: number): void {
        this.dateTimeProvider.advanceBy(days * MILLISECONDS_PER_DAY);
    }
}
