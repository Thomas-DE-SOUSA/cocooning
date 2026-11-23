import type { JoinCoupleForm } from '@cocooning/couple-client-business-logic/pairing';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';

export abstract class PairingCommandGateway {
    abstract createCouple(): Promise<Result<null, ApiError>>;
    abstract joinCouple(form: JoinCoupleForm): Promise<Result<null, ApiError>>;
    abstract renewInvitationCode(): Promise<Result<null, ApiError>>;
}
