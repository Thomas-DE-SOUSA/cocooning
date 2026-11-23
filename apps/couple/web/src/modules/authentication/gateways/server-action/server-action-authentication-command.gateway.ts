import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import { AuthenticationCommandGateway } from '../ports/authentication-command.gateway';

export type AuthenticationCommandActions = {
    readonly signIn: (form: SignInForm) => Promise<Result<null, ApiError>>;
    readonly signOut: () => Promise<Result<null, ApiError>>;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Authentication server action unreachable',
    backendCode: null,
};

export class ServerActionAuthenticationCommandGateway extends AuthenticationCommandGateway {
    constructor(private readonly actions: AuthenticationCommandActions) {
        super();
    }

    override signIn(form: SignInForm): Promise<Result<null, ApiError>> {
        return runServerAction(() => this.actions.signIn(form), UNREACHABLE);
    }

    override signOut(): Promise<Result<null, ApiError>> {
        return runServerAction(this.actions.signOut, UNREACHABLE);
    }
}
