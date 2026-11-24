import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    type AgendaPage,
    AgendaStepEnum,
} from '../view-models/agenda-screen.view-model';

export const presentAgendaRedirect = (route: string): AgendaPage => ({
    redirectTo: route,
    viewModel: null,
});

// Decision 0036: a refused session goes back to sign-in; without a formed couple there is no agenda (R4).
export function presentAgendaRefusal(error: ApiError): AgendaPage {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return presentAgendaRedirect(WebRouterEnum.ACCOUNT_SIGN_IN);
    }
    if (
        error.backendCode ===
        AgendaExceptionCodeEnum.CALENDAR_EVENT_COUPLE_NOT_PAIRED
    ) {
        return presentAgendaRedirect(WebRouterEnum.COUPLE_PAIRING);
    }
    return {
        redirectTo: null,
        viewModel: { step: AgendaStepEnum.UNAVAILABLE, error },
    };
}
