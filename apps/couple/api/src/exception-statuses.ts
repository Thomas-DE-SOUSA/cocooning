import { HttpStatus } from '@nestjs/common';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { PersistenceExceptionCodeEnum } from '@cocooning/couple-prisma/errors';
import type { ExceptionStatusTable } from '@cocooning/server-infrastructure/nest';
import { SharedKernelExceptionCodeEnum } from '@cocooning/shared-kernel/exceptions';

// A code left out answers 500 without its message: data corruption and programming errors (decision 0020).
export const EXCEPTION_STATUSES: ExceptionStatusTable = {
    [AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING]:
        HttpStatus.UNAUTHORIZED,
    [AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_INVALID]:
        HttpStatus.UNAUTHORIZED,
    [PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE]:
        HttpStatus.CONFLICT,
    [PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_CONFLICT]:
        HttpStatus.CONFLICT,
    [PairingExceptionCodeEnum.PAIRING_COUPLE_ALREADY_PAIRED]:
        HttpStatus.CONFLICT,
    [PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [PairingExceptionCodeEnum.PAIRING_COUPLE_VERSION_CONFLICT]:
        HttpStatus.CONFLICT,
    [PersistenceExceptionCodeEnum.PERSISTENCE_LOCK_BUSY]: HttpStatus.CONFLICT,
    [SharedKernelExceptionCodeEnum.UUID_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
};
