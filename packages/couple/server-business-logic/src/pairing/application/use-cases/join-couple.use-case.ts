import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { CoupleRepository } from '../../domain/ports/couple.repository';
import type { PairingPreconditionService } from '../../domain/services/pairing-precondition.service';
import { InvitationCode } from '../../domain/value-objects/invitation-code.vo';
import { type CoupleView, toCoupleView } from '../mappers/couple-view.mapper';

export type JoinCoupleCommand = {
    readonly invitationCode: string;
};

export class JoinCoupleUseCase {
    constructor(
        private readonly coupleRepository: CoupleRepository,
        private readonly pairingPreconditionService: PairingPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: PartnerContext,
        command: JoinCoupleCommand,
    ): Promise<CoupleView> {
        await this.pairingPreconditionService.ensurePartnerHasNoCouple(
            context.userId,
        );
        const code = InvitationCode.normalize(command.invitationCode);
        const couple =
            await this.pairingPreconditionService.loadCoupleByInvitationCode(
                code,
            );
        couple.join(context.userId, code, this.dateTimeProvider.now());
        await this.coupleRepository.save(couple);
        await this.eventPublishingService.publishAndClear([couple]);
        return toCoupleView(couple);
    }
}
