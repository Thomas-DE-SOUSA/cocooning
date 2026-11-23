import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { AccountRepository } from '../../domain/ports/account.repository';
import type { AuthenticationPreconditionService } from '../../domain/services/authentication-precondition.service';

export class SignOutUseCase {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly authenticationPreconditionService: AuthenticationPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
    ) {}

    async execute(context: PartnerContext): Promise<void> {
        const account =
            await this.authenticationPreconditionService.loadAccount(
                context.userId,
            );
        account.revokeSessions(this.dateTimeProvider.now());
        await this.accountRepository.save(account);
    }
}
