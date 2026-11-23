import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';

export abstract class AuthenticationCommandGateway {
    abstract signIn(form: SignInForm): Promise<Result<null, ApiError>>;
    abstract signOut(): Promise<Result<null, ApiError>>;
}
