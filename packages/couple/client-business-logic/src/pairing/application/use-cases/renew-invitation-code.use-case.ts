import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { PairingGateway } from '../../domain/ports/pairing.gateway';

export class RenewInvitationCodeUseCase {
    constructor(private readonly pairingGateway: PairingGateway) {}

    execute(): Promise<Result<CoupleResponse, ApiError>> {
        return this.pairingGateway.renewInvitationCode();
    }
}
