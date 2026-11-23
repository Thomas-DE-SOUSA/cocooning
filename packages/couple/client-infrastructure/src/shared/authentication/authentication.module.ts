import { SignInUseCase } from '@cocooning/couple-client-business-logic/authentication';
import { createCoupleHttpConfig } from '../couple-http-config';
import { resolveAuthenticationEndpoints } from './endpoints/authentication.endpoints';
import { ApiAuthenticationGateway } from './gateways/api-authentication.gateway';

export type AuthenticationModule = {
    readonly signIn: SignInUseCase;
};

// The gateway stays inside: the web app receives use cases only.
export function createAuthenticationModule(
    apiBaseUrl: string,
    timeoutMs: number,
): AuthenticationModule {
    const gateway = new ApiAuthenticationGateway(
        resolveAuthenticationEndpoints(apiBaseUrl),
        createCoupleHttpConfig(timeoutMs),
    );
    return { signIn: new SignInUseCase(gateway) };
}
