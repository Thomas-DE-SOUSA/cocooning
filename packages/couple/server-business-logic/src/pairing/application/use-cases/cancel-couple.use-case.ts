import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { CoupleRepository } from '../../domain/ports/couple.repository';
import type { PairingPreconditionService } from '../../domain/services/pairing-precondition.service';

export class CancelCoupleUseCase {
    constructor(
        private readonly coupleRepository: CoupleRepository,
        private readonly pairingPreconditionService: PairingPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(context: PartnerContext): Promise<void> {
        const couple =
            await this.pairingPreconditionService.loadCoupleOfPartner(
                context.userId,
            );
        couple.cancel(context.userId, this.dateTimeProvider.now());
        await this.coupleRepository.save(couple);
        await this.eventPublishingService.publishAndClear([couple]);
    }
}
