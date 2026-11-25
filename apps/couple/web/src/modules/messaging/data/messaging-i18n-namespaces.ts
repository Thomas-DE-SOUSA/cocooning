import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import {
    type MessagingExceptionCode,
    MessagingExceptionCodeEnum,
} from '@cocooning/couple-contract/messaging';
import type { Namespace } from '@/i18n/resources';

export const MESSAGING_NAMESPACE = 'messaging/messages' satisfies Namespace;

// The push subscription codes belong to the notification toggle, not to this screen.
const isScreenCode = (code: MessagingExceptionCode): boolean =>
    !code.startsWith('PUSH_SUBSCRIPTION_');

// Decision 0037: the contract codes the messages screen can receive, each with its apiErrors key.
export const MESSAGING_SCREEN_ERROR_CODES = [
    ...Object.values(MessagingExceptionCodeEnum).filter(isScreenCode),
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
] as const;
