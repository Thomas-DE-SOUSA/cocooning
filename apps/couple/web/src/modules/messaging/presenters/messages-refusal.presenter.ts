import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    type MessagesPage,
    MessagesStepEnum,
} from '../view-models/message-feed.view-model';

const redirectTo = (route: string): MessagesPage => ({
    redirectTo: route,
    viewModel: null,
});

// Decision 0036: a refused session goes back to sign-in; without a formed couple there are no messages (R4).
export function presentMessagesRefusal(error: ApiError): MessagesPage {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return redirectTo(WebRouterEnum.ACCOUNT_SIGN_IN);
    }
    if (
        error.backendCode ===
        MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED
    ) {
        return redirectTo(WebRouterEnum.COUPLE_PAIRING);
    }
    return {
        redirectTo: null,
        viewModel: { step: MessagesStepEnum.UNAVAILABLE, error },
    };
}
