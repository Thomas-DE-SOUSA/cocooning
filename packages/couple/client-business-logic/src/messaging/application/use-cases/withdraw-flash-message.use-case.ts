import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { FlashMessageGateway } from '../../domain/ports/flash-message.gateway';

// R6: only the author withdraws their word, for both partners.
export class WithdrawFlashMessageUseCase {
    constructor(private readonly flashMessageGateway: FlashMessageGateway) {}

    execute(flashMessageId: string): Promise<Result<null, ApiError>> {
        return this.flashMessageGateway.withdrawFlashMessage(flashMessageId);
    }
}
