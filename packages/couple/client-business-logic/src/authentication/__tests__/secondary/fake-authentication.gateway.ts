import type {
    SignInRequest,
    SignInResponse,
} from '@cocooning/couple-contract/authentication';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import {
    AuthenticationGateway,
    type SignInClientContext,
} from '../../domain/ports/authentication.gateway';

export type AuthenticationGatewayCall = {
    readonly operation: 'signIn';
    readonly request: SignInRequest;
    readonly client: SignInClientContext;
};

export const A_SESSION: SignInResponse = {
    userId: '01936b2e-7c4a-7000-8000-0000000000a1',
    sessionToken: 'session-token-1',
    sessionExpiresAt: '2027-02-21T08:00:00.000Z',
};

export class FakeAuthenticationGateway extends AuthenticationGateway {
    readonly calls: AuthenticationGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override signIn(
        request: SignInRequest,
        client: SignInClientContext,
    ): Promise<Result<SignInResponse, ApiError>> {
        this.calls.push({ operation: 'signIn', request, client });
        return Promise.resolve(
            this.refusal === null ? ok(A_SESSION) : fail(this.refusal),
        );
    }
}
