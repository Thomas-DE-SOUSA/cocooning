import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import type { Namespace } from '@/i18n/resources';

export const SIGN_IN_NAMESPACE = 'authentication/sign-in' satisfies Namespace;

// Decision 0037: the contract codes the sign-in screen can receive, each with its apiErrors key.
export const SIGN_IN_SCREEN_ERROR_CODES = [
    AuthenticationExceptionCodeEnum.AUTHENTICATION_CREDENTIALS_INVALID,
] as const;

export const SIGN_OUT_NAMESPACE = 'authentication/sign-out' satisfies Namespace;

// The sign-out button only receives the generic codes: a refused session counts as closed (SignOutUseCase).
export const SIGN_OUT_SCREEN_ERROR_CODES = [] as const;
