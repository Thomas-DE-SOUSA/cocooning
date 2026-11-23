import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import { AuthenticationCommandGateway } from '../ports/authentication-command.gateway';

export type SignInAction = (
    form: SignInForm,
) => Promise<Result<null, ApiError>>;

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Sign-in server action unreachable',
    backendCode: null,
};

export class ServerActionAuthenticationCommandGateway extends AuthenticationCommandGateway {
    constructor(private readonly signInAction: SignInAction) {
        super();
    }

    // The call rejects when the phone is offline or the page predates a deployment (unknown action id): the hook gets a Result either way.
    override async signIn(form: SignInForm): Promise<Result<null, ApiError>> {
        try {
            return await this.signInAction(form);
        } catch {
            return fail(UNREACHABLE);
        }
    }
}
