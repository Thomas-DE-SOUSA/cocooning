import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
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

// The call rejects when the phone is offline or the page predates a deployment (unknown action id): the hook gets a Result either way.
async function runAction(
    action: () => Promise<Result<null, ApiError>>,
): Promise<Result<null, ApiError>> {
    try {
        return await action();
    } catch {
        return fail(UNREACHABLE);
    }
}

export class ServerActionAuthenticationCommandGateway extends AuthenticationCommandGateway {
    constructor(private readonly actions: AuthenticationCommandActions) {
        super();
    }

    override signIn(form: SignInForm): Promise<Result<null, ApiError>> {
        return runAction(() => this.actions.signIn(form));
    }

    override signOut(): Promise<Result<null, ApiError>> {
        return runAction(this.actions.signOut);
    }
}
