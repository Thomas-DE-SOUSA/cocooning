import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type AuthenticationEndpoints = {
    readonly signIn: string;
    readonly signOut: string;
};

export function resolveAuthenticationEndpoints(
    apiBaseUrl: string,
): AuthenticationEndpoints {
    return {
        signIn: resolveRoute(apiBaseUrl, ApiRouterEnum.ACCOUNT_SESSION_OPEN),
        signOut: resolveRoute(apiBaseUrl, ApiRouterEnum.ACCOUNT_SESSION_CLOSE),
    };
}
