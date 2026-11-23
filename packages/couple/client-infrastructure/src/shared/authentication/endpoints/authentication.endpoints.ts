import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type AuthenticationEndpoints = {
    readonly signIn: string;
};

export function resolveAuthenticationEndpoints(
    apiBaseUrl: string,
): AuthenticationEndpoints {
    return {
        signIn: resolveRoute(apiBaseUrl, ApiRouterEnum.ACCOUNT_SESSION_OPEN),
    };
}
