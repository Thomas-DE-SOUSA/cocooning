import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import type {
    ExecutionContext,
    PartnerContext,
} from '@cocooning/shared-kernel/domain';
import { NoteException } from '../../domain/exceptions/note.exception';
import type { PairedCoupleProvider } from '../../domain/ports/paired-couple.provider';

// Decision 0041: the API turns the partner of the session into the context of the notes, read from pairing (decision 0006).
export class NoteCoupleGuardService {
    constructor(private readonly pairedCoupleProvider: PairedCoupleProvider) {}

    // R3: without a formed couple there are no notes.
    async resolveExecutionContext(
        partner: PartnerContext,
    ): Promise<ExecutionContext> {
        const coupleId = await this.pairedCoupleProvider.findPairedCoupleIdOf(
            partner.userId,
        );
        if (coupleId !== null) return { coupleId, userId: partner.userId };
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED,
            message: 'Notes need a formed couple',
        });
    }
}
