import {
    SignInUseCase,
    SignOutUseCase,
} from '@cocooning/couple-client-business-logic/authentication';
import { createCoupleHttpConfig } from '../couple-http-config';
import type { SessionTokenProvider } from '../session/session-headers';
import { resolveAuthenticationEndpoints } from './endpoints/authentication.endpoints';
import { ApiAuthenticationGateway } from './gateways/api-authentication.gateway';

export type AuthenticationModule = {
    readonly signIn: SignInUseCase;
    readonly signOut: SignOutUseCase;
};

// The gateway stays inside: the web app receives use cases only. Sign-in ignores the session, sign-out forwards it.
export function createAuthenticationModule(
    apiBaseUrl: string,
    timeoutMs: number,
    getSessionToken: SessionTokenProvider,
): AuthenticationModule {
    const gateway = new ApiAuthenticationGateway(
        resolveAuthenticationEndpoints(apiBaseUrl),
        createCoupleHttpConfig(timeoutMs),
        getSessionToken,
    );
    return {
        signIn: new SignInUseCase(gateway),
        signOut: new SignOutUseCase(gateway),
    };
}
