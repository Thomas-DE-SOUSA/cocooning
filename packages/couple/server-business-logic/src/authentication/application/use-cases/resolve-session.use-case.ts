import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { AuthenticationPreconditionService } from '../../domain/services/authentication-precondition.service';

export type ResolveSessionCommand = {
    readonly sessionToken: string;
};

// Called by the API session guard on every request, before any identity is known (decision 0034).
export class ResolveSessionUseCase {
    constructor(
        private readonly authenticationPreconditionService: AuthenticationPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
    ) {}

    async execute(command: ResolveSessionCommand): Promise<PartnerContext> {
        const now = this.dateTimeProvider.now();
        const account =
            await this.authenticationPreconditionService.loadAccountOfSession(
                command.sessionToken,
                now,
            );
        return { userId: account.id.getValue() };
    }
}
