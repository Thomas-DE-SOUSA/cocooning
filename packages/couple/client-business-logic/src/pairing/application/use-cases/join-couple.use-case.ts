import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { PairingGateway } from '../../domain/ports/pairing.gateway';
import type { JoinCoupleForm } from '../schemas/join-couple-form.zod';

export class JoinCoupleUseCase {
    constructor(private readonly pairingGateway: PairingGateway) {}

    execute(form: JoinCoupleForm): Promise<Result<CoupleResponse, ApiError>> {
        return this.pairingGateway.joinCouple({
            invitationCode: form.invitationCode,
        });
    }
}
