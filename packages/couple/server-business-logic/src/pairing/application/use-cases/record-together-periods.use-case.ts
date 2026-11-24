import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { CoupleRepository } from '../../domain/ports/couple.repository';
import type { PairingPreconditionService } from '../../domain/services/pairing-precondition.service';
import { TogetherPeriods } from '../../domain/value-objects/together-periods.vo';
import { type CoupleView, toCoupleView } from '../mappers/couple-view.mapper';

export type RecordTogetherPeriodsCommand = {
    readonly periods: ReadonlyArray<{
        readonly startedOn: string;
        readonly endedOn: string | null;
    }>;
};

// R9: run by the owner's command on the VM, never by an endpoint (decision 0045).
export class RecordTogetherPeriodsUseCase {
    constructor(
        private readonly coupleRepository: CoupleRepository,
        private readonly pairingPreconditionService: PairingPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: PartnerContext,
        command: RecordTogetherPeriodsCommand,
    ): Promise<CoupleView> {
        const couple =
            await this.pairingPreconditionService.loadCoupleOfPartner(
                context.userId,
            );
        const now = this.dateTimeProvider.now();
        const togetherPeriods = TogetherPeriods.create(command.periods, now);
        couple.recordTogetherPeriods(context.userId, togetherPeriods, now);
        await this.coupleRepository.save(couple);
        await this.eventPublishingService.publishAndClear([couple]);
        return toCoupleView(couple);
    }
}
