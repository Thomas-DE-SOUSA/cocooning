import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import type { Namespace } from '@/i18n/resources';

export const NOTES_NAMESPACE = 'notes/list' satisfies Namespace;

// Decision 0037: the contract codes the notes screen can receive, each with its apiErrors key.
export const NOTES_SCREEN_ERROR_CODES = [
    ...Object.values(NoteExceptionCodeEnum),
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
] as const;
