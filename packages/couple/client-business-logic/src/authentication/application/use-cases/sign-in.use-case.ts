import type { SignInResponse } from '@cocooning/couple-contract/authentication';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type {
    AuthenticationGateway,
    SignInClientContext,
} from '../../domain/ports/authentication.gateway';
import type { SignInForm } from '../schemas/sign-in-form.zod';

// Run by the sign-in server action only: the session token it returns never reaches client code (decision 0034).
export class SignInUseCase {
    constructor(
        private readonly authenticationGateway: AuthenticationGateway,
    ) {}

    execute(
        form: SignInForm,
        client: SignInClientContext,
    ): Promise<Result<SignInResponse, ApiError>> {
        return this.authenticationGateway.signIn(
            { emailAddress: form.emailAddress, password: form.password },
            client,
        );
    }
}
