import type {
    CoupleResponse,
    JoinCoupleRequest,
} from '@cocooning/couple-contract/pairing';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// Every call acts for the signed-in partner: the adapter forwards the session (decision 0036).
export abstract class PairingGateway {
    abstract getMyCouple(): Promise<Result<CoupleResponse, ApiError>>;
    abstract createCouple(): Promise<Result<CoupleResponse, ApiError>>;
    abstract joinCouple(
        request: JoinCoupleRequest,
    ): Promise<Result<CoupleResponse, ApiError>>;
    abstract renewInvitationCode(): Promise<Result<CoupleResponse, ApiError>>;
    abstract cancelCouple(): Promise<Result<null, ApiError>>;
}
