import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { PairingGateway } from '../../domain/ports/pairing.gateway';

export class CancelCoupleUseCase {
    constructor(private readonly pairingGateway: PairingGateway) {}

    execute(): Promise<Result<null, ApiError>> {
        return this.pairingGateway.cancelCouple();
    }
}
