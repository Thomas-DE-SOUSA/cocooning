import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import { I18N_CONFIG } from '@/i18n/config';
import {
    type PairingPage,
    type PairingScreenViewModel,
    PairingStepEnum,
} from '../view-models/pairing-screen.view-model';

const EXPIRY_FORMAT = new Intl.DateTimeFormat(I18N_CONFIG.defaultLocale, {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: I18N_CONFIG.timeZone,
});

const screen = (viewModel: PairingScreenViewModel): PairingPage => ({
    redirectTo: null,
    viewModel,
});
const redirectTo = (route: string): PairingPage => ({
    redirectTo: route,
    viewModel: null,
});

// Decision 0036: a refused session goes back to sign-in; a formed couple has nothing left to do here.
export function presentPairingPage(
    couple: Result<CoupleResponse | null, ApiError>,
): PairingPage {
    if (!couple.success) {
        if (couple.error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
            return redirectTo(WebRouterEnum.ACCOUNT_SIGN_IN);
        }
        return screen({
            step: PairingStepEnum.UNAVAILABLE,
            error: couple.error,
        });
    }
    if (couple.value === null)
        return screen({ step: PairingStepEnum.NO_COUPLE });
    if (couple.value.pairingStatus === CouplePairingStatusEnum.PAIRED) {
        return redirectTo(WebRouterEnum.HOME);
    }
    return presentWaitingCouple(couple.value);
}

function presentWaitingCouple(couple: CoupleResponse): PairingPage {
    if (couple.invitationCode === null) {
        return screen({
            step: PairingStepEnum.UNAVAILABLE,
            error: {
                code: ApiErrorCodeEnum.INVALID_RESPONSE,
                message: 'Pending couple without invitation code',
                backendCode: null,
            },
        });
    }
    return screen({
        step: PairingStepEnum.WAITING_FOR_PARTNER,
        invitationCode: couple.invitationCode.value,
        expiresAt: EXPIRY_FORMAT.format(
            new Date(couple.invitationCode.expiresAt),
        ),
    });
}
