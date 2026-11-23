import type {
    SignInRequest,
    SignInResponse,
} from '@cocooning/couple-contract/authentication';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// core-frontend.md rule 13: a sign-in forwards the browser's address and User-Agent, or the API sees the Next server.
export type SignInClientContext = {
    readonly ipAddress: string | null;
    readonly userAgent: string | null;
};

export abstract class AuthenticationGateway {
    abstract signIn(
        request: SignInRequest,
        client: SignInClientContext,
    ): Promise<Result<SignInResponse, ApiError>>;

    // Acts for the signed-in partner: the adapter forwards the session (decision 0036).
    abstract signOut(): Promise<Result<null, ApiError>>;
}
