import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';

// The home page belongs to a formed couple: anyone else is sent where they can act. null keeps the home page.
export function resolveHomeDestination(
    couple: Result<CoupleResponse | null, ApiError>,
): string | null {
    if (!couple.success) {
        return couple.error.code === ApiErrorCodeEnum.UNAUTHORIZED
            ? WebRouterEnum.ACCOUNT_SIGN_IN
            : WebRouterEnum.COUPLE_PAIRING;
    }
    if (couple.value?.pairingStatus === CouplePairingStatusEnum.PAIRED) {
        return null;
    }
    return WebRouterEnum.COUPLE_PAIRING;
}
