import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import type { Namespace } from '@/i18n/resources';

export const PAIRING_NAMESPACE = 'pairing/couple' satisfies Namespace;

// Decision 0037: the contract codes the pairing screen can receive, each with its apiErrors key.
export const PAIRING_SCREEN_ERROR_CODES = [
    PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
    PairingExceptionCodeEnum.PAIRING_COUPLE_ALREADY_PAIRED,
    PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
    PairingExceptionCodeEnum.PAIRING_COUPLE_VERSION_CONFLICT,
    PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_CONFLICT,
    PairingExceptionCodeEnum.PAIRING_COUPLE_DATA_CORRUPTED,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
    AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID,
] as const;
