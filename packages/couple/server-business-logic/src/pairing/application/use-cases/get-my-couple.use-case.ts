import type { PartnerContext } from '@cocooning/shared-kernel/domain';
import type { PairingPreconditionService } from '../../domain/services/pairing-precondition.service';
import { type CoupleView, toCoupleView } from '../mappers/couple-view.mapper';

export class GetMyCoupleUseCase {
    constructor(
        private readonly pairingPreconditionService: PairingPreconditionService,
    ) {}

    async execute(context: PartnerContext): Promise<CoupleView> {
        const couple =
            await this.pairingPreconditionService.loadCoupleOfPartner(
                context.userId,
            );
        return toCoupleView(couple);
    }
}
