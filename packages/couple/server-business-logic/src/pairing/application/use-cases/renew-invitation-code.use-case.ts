import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import type {
    DateTimeProvider,
    SecureRandomGenerator,
} from '@cocooning/shared-kernel/ports';
import type { CoupleRepository } from '../../domain/ports/couple.repository';
import type { PairingPreconditionService } from '../../domain/services/pairing-precondition.service';
import { InvitationCode } from '../../domain/value-objects/invitation-code.vo';
import { type CoupleView, toCoupleView } from '../mappers/couple-view.mapper';

export class RenewInvitationCodeUseCase {
    constructor(
        private readonly coupleRepository: CoupleRepository,
        private readonly pairingPreconditionService: PairingPreconditionService,
        private readonly secureRandomGenerator: SecureRandomGenerator,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
        private readonly invitationCodeLifetimeInHours: number,
    ) {}

    async execute(context: PartnerContext): Promise<CoupleView> {
        const couple =
            await this.pairingPreconditionService.loadCoupleOfPartner(
                context.userId,
            );
        const now = this.dateTimeProvider.now();
        const invitationCode = InvitationCode.generate(
            this.secureRandomGenerator,
            now,
            this.invitationCodeLifetimeInHours,
        );
        couple.renewInvitationCode(context.userId, invitationCode, now);
        await this.coupleRepository.save(couple);
        await this.eventPublishingService.publishAndClear([couple]);
        return toCoupleView(couple);
    }
}
