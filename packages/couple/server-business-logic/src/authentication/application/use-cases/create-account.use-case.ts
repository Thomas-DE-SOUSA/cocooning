import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { Account } from '../../domain/models/account.aggregate';
import type { AccountRepository } from '../../domain/ports/account.repository';
import type { PasswordHasher } from '../../domain/ports/password-hasher';
import type { AuthenticationPreconditionService } from '../../domain/services/authentication-precondition.service';
import { PasswordPolicyValidator } from '../../domain/services/password-policy.validator';
import { EmailAddress } from '../../domain/value-objects/email-address.vo';
import {
    type AccountView,
    toAccountView,
} from '../mappers/account-view.mapper';

export type CreateAccountCommand = {
    readonly emailAddress: string;
    readonly password: string;
};

// R6: run by the owner's command on the VM, never by an endpoint; no context (decision 0033).
export class CreateAccountUseCase {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly authenticationPreconditionService: AuthenticationPreconditionService,
        private readonly passwordHasher: PasswordHasher,
        private readonly dateTimeProvider: DateTimeProvider,
    ) {}

    async execute(command: CreateAccountCommand): Promise<AccountView> {
        const emailAddress = EmailAddress.create(command.emailAddress);
        PasswordPolicyValidator.ensureAcceptable(command.password);
        await this.authenticationPreconditionService.ensureEmailAddressAvailable(
            emailAddress,
        );
        const passwordHash = await this.passwordHasher.hash(command.password);
        const account = Account.create(
            { emailAddress, passwordHash },
            this.dateTimeProvider.now(),
        );
        await this.accountRepository.save(account);
        return toAccountView(account);
    }
}
