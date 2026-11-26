import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import type { Namespace } from '@/i18n/resources';

// The label sheet, from the event sheet and from the "Nous" card (decision 0057).
export const CALENDAR_LABELS_NAMESPACE = 'agenda/labels' satisfies Namespace;

// Decision 0037: the contract codes the label sheet and the "Nous" card can receive, each with its apiErrors key.
export const CALENDAR_LABELS_SCREEN_ERROR_CODES = [
    AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
    AgendaExceptionCodeEnum.CALENDAR_LABEL_NAME_INVALID,
    AgendaExceptionCodeEnum.CALENDAR_LABEL_LIMIT_REACHED,
    AgendaExceptionCodeEnum.CALENDAR_LABEL_VERSION_CONFLICT,
    AgendaExceptionCodeEnum.CALENDAR_LABEL_DATA_CORRUPTED,
    AgendaExceptionCodeEnum.CALENDAR_EVENT_COUPLE_NOT_PAIRED,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
] as const;
