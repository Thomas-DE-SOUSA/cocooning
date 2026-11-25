import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { Namespace } from '@/i18n/resources';

// The card of the "Nous" tab and the sentences of the service worker (src/app/sw-push-notification.ts).
export const PUSH_NOTIFICATIONS_NAMESPACE =
    'messaging/push' satisfies Namespace;

// Decision 0037: the contract codes the notification card can receive, each with its apiErrors key.
export const PUSH_NOTIFICATIONS_ERROR_CODES = [
    MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_NOT_FOUND,
    MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_INVALID,
    MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_VERSION_CONFLICT,
    MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
] as const;
