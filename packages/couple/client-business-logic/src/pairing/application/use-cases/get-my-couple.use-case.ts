import {
    type CoupleResponse,
    PairingExceptionCodeEnum,
} from '@cocooning/couple-contract/pairing';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { PairingGateway } from '../../domain/ports/pairing.gateway';

// A partner without a couple is a normal state, not a failure: the PWA shows the invitation screen.
export class GetMyCoupleUseCase {
    constructor(private readonly pairingGateway: PairingGateway) {}

    async execute(): Promise<Result<CoupleResponse | null, ApiError>> {
        const couple = await this.pairingGateway.getMyCouple();
        if (couple.success) return couple;
        if (
            couple.error.backendCode ===
            PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND
        ) {
            return ok(null);
        }
        return couple;
    }
}
