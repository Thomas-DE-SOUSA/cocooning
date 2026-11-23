import type {
    SignInRequest,
    SignInResponse,
} from '@cocooning/couple-contract/authentication';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

export abstract class AuthenticationGateway {
    abstract signIn(
        request: SignInRequest,
    ): Promise<Result<SignInResponse, ApiError>>;

    // Acts for the signed-in partner: the adapter forwards the session (decision 0036).
    abstract signOut(): Promise<Result<null, ApiError>>;
}
