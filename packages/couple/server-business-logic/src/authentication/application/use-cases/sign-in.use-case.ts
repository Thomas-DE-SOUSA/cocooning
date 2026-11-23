import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { SessionTokenSigner } from '../../domain/ports/session-token-signer';
import type { AuthenticationPreconditionService } from '../../domain/services/authentication-precondition.service';
import {
    type SessionView,
    toSessionView,
} from '../mappers/session-view.mapper';

export type SignInCommand = {
    readonly emailAddress: string;
    readonly password: string;
};

// Runs before any identity is known: no context (decision 0033).
export class SignInUseCase {
    constructor(
        private readonly authenticationPreconditionService: AuthenticationPreconditionService,
        private readonly sessionTokenSigner: SessionTokenSigner,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly sessionLifetimeInDays: number,
    ) {}

    async execute(command: SignInCommand): Promise<SessionView> {
        const account =
            await this.authenticationPreconditionService.loadAccountByCredentials(
                command.emailAddress,
                command.password,
            );
        const now = this.dateTimeProvider.now();
        const claims = account.openSession(now, this.sessionLifetimeInDays);
        const sessionToken = await this.sessionTokenSigner.sign(claims);
        return toSessionView(claims, sessionToken);
    }
}
