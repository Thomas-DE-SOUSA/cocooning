import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import type {
    ExecutionContext,
    PartnerContext,
} from '@cocooning/shared-kernel/domain';
import { AgendaException } from '../../domain/exceptions/agenda.exception';
import type { PairedCoupleProvider } from '../../domain/ports/paired-couple.provider';

// Decision 0041: the API turns the partner of the session into the context of the agenda, read from pairing (decision 0006).
export class AgendaCoupleGuardService {
    constructor(private readonly pairedCoupleProvider: PairedCoupleProvider) {}

    // R4: without a formed couple there is no agenda.
    async resolveExecutionContext(
        partner: PartnerContext,
    ): Promise<ExecutionContext> {
        const coupleId = await this.pairedCoupleProvider.findPairedCoupleIdOf(
            partner.userId,
        );
        if (coupleId !== null) return { coupleId, userId: partner.userId };
        throw new AgendaException({
            code: AgendaExceptionCodeEnum.CALENDAR_EVENT_COUPLE_NOT_PAIRED,
            message: 'The agenda needs a formed couple',
        });
    }
}
