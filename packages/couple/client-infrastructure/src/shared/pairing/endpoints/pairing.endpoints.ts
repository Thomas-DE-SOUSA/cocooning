import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type PairingEndpoints = {
    readonly myCouple: string;
    readonly createCouple: string;
    readonly joinCouple: string;
    readonly renewInvitationCode: string;
};

export function resolvePairingEndpoints(apiBaseUrl: string): PairingEndpoints {
    return {
        myCouple: resolveRoute(apiBaseUrl, ApiRouterEnum.COUPLE_GET_MINE),
        createCouple: resolveRoute(apiBaseUrl, ApiRouterEnum.COUPLE_CREATE),
        joinCouple: resolveRoute(apiBaseUrl, ApiRouterEnum.COUPLE_JOIN),
        renewInvitationCode: resolveRoute(
            apiBaseUrl,
            ApiRouterEnum.COUPLE_INVITATION_CODE_RENEW,
        ),
    };
}
