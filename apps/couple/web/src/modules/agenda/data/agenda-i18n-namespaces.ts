import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import type { Namespace } from '@/i18n/resources';

export const AGENDA_NAMESPACE = 'agenda/calendar' satisfies Namespace;

// Decision 0037: the contract codes the agenda screen can receive, each with its apiErrors key.
export const AGENDA_SCREEN_ERROR_CODES = [
    ...Object.values(AgendaExceptionCodeEnum),
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
] as const;
