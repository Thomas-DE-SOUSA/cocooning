import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type {
    ExecutionContext,
    PartnerContext,
} from '@cocooning/shared-kernel/domain';
import { MessagingException } from '../../domain/exceptions/messaging.exception';
import type { PairedCoupleProvider } from '../../domain/ports/paired-couple.provider';

// Decision 0041: the API turns the partner of the session into the context of the messages, read from pairing (decision 0006).
export class MessagingCoupleGuardService {
    constructor(private readonly pairedCoupleProvider: PairedCoupleProvider) {}

    // R4: without a formed couple there are no messages.
    async resolveExecutionContext(
        partner: PartnerContext,
    ): Promise<ExecutionContext> {
        const coupleId = await this.pairedCoupleProvider.findPairedCoupleIdOf(
            partner.userId,
        );
        if (coupleId !== null) return { coupleId, userId: partner.userId };
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED,
            message: 'The messages need a formed couple',
        });
    }
}
