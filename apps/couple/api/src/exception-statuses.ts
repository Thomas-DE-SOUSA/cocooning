import { HttpStatus } from '@nestjs/common';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
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
    [AuthenticationExceptionCodeEnum.AUTHENTICATION_CREDENTIALS_INVALID]:
        HttpStatus.UNAUTHORIZED,
    [AuthenticationExceptionCodeEnum.AUTHENTICATION_EMAIL_ADDRESS_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [AuthenticationExceptionCodeEnum.AUTHENTICATION_PASSWORD_TOO_WEAK]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS]:
        HttpStatus.CONFLICT,
    [AuthenticationExceptionCodeEnum.AUTHENTICATION_ACCOUNT_VERSION_CONFLICT]:
        HttpStatus.CONFLICT,
    [PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE]:
        HttpStatus.CONFLICT,
    [PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_CONFLICT]:
        HttpStatus.CONFLICT,
    [PairingExceptionCodeEnum.PAIRING_COUPLE_ALREADY_PAIRED]:
        HttpStatus.CONFLICT,
    [PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_PAIRED]: HttpStatus.CONFLICT,
    [PairingExceptionCodeEnum.PAIRING_TOGETHER_PERIODS_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [PairingExceptionCodeEnum.PAIRING_COUPLE_VERSION_CONFLICT]:
        HttpStatus.CONFLICT,
    [NoteExceptionCodeEnum.NOTE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED]: HttpStatus.NOT_FOUND,
    [NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER]: HttpStatus.FORBIDDEN,
    [NoteExceptionCodeEnum.NOTE_TITLE_INVALID]: HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.NOTE_VERSION_CONFLICT]: HttpStatus.CONFLICT,
    [NoteExceptionCodeEnum.FOLDER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [NoteExceptionCodeEnum.FOLDER_NAME_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.FOLDER_MOVE_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.FOLDER_VERSION_CONFLICT]: HttpStatus.CONFLICT,
    [NoteExceptionCodeEnum.FOLDER_NOT_SMART]: HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.FOLDER_SUBJECT_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.FOLDER_TEMPLATE_INHERITED]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.NOTE_CARD_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [NoteExceptionCodeEnum.NOTE_CARD_STATUS_INVALID]: HttpStatus.CONFLICT,
    [NoteExceptionCodeEnum.NOTE_CARD_CANDIDATE_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.NOTE_CARD_FIELD_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.NOTE_CARD_QUERY_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [NoteExceptionCodeEnum.NOTE_CARD_VERSION_CONFLICT]: HttpStatus.CONFLICT,
    // core.md rule 26: the search engine or the AI failed; the body says no more than the code.
    [NoteExceptionCodeEnum.NOTE_CARD_SEARCH_UNAVAILABLE]:
        HttpStatus.SERVICE_UNAVAILABLE,
    [NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE]:
        HttpStatus.SERVICE_UNAVAILABLE,
    [AgendaExceptionCodeEnum.CALENDAR_EVENT_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [AgendaExceptionCodeEnum.CALENDAR_EVENT_COUPLE_NOT_PAIRED]:
        HttpStatus.NOT_FOUND,
    [AgendaExceptionCodeEnum.CALENDAR_EVENT_RESERVED_TO_OWNER]:
        HttpStatus.FORBIDDEN,
    [AgendaExceptionCodeEnum.CALENDAR_EVENT_TITLE_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [AgendaExceptionCodeEnum.CALENDAR_EVENT_DESCRIPTION_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [AgendaExceptionCodeEnum.CALENDAR_EVENT_MOMENT_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [AgendaExceptionCodeEnum.CALENDAR_EVENT_RANGE_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [AgendaExceptionCodeEnum.CALENDAR_EVENT_VERSION_CONFLICT]:
        HttpStatus.CONFLICT,
    [AgendaExceptionCodeEnum.CALENDAR_EVENT_AUDIENCE_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [AgendaExceptionCodeEnum.CALENDAR_LABEL_NAME_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [AgendaExceptionCodeEnum.CALENDAR_LABEL_LIMIT_REACHED]: HttpStatus.CONFLICT,
    [AgendaExceptionCodeEnum.CALENDAR_LABEL_VERSION_CONFLICT]:
        HttpStatus.CONFLICT,
    [MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED]:
        HttpStatus.NOT_FOUND,
    [MessagingExceptionCodeEnum.FLASH_MESSAGE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [MessagingExceptionCodeEnum.FLASH_MESSAGE_RESERVED_TO_OWNER]:
        HttpStatus.FORBIDDEN,
    [MessagingExceptionCodeEnum.FLASH_MESSAGE_TEXT_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [MessagingExceptionCodeEnum.FLASH_MESSAGE_VERSION_CONFLICT]:
        HttpStatus.CONFLICT,
    [MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [MessagingExceptionCodeEnum.INSTANT_PHOTO_RESERVED_TO_OWNER]:
        HttpStatus.FORBIDDEN,
    [MessagingExceptionCodeEnum.INSTANT_PHOTO_CONTENT_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [MessagingExceptionCodeEnum.INSTANT_PHOTO_VERSION_CONFLICT]:
        HttpStatus.CONFLICT,
    [MessagingExceptionCodeEnum.PHOTO_PROMPT_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [MessagingExceptionCodeEnum.PHOTO_PROMPT_EXPIRED]: HttpStatus.CONFLICT,
    [MessagingExceptionCodeEnum.PHOTO_PROMPT_ALREADY_ANSWERED]:
        HttpStatus.CONFLICT,
    [MessagingExceptionCodeEnum.PHOTO_PROMPT_VERSION_CONFLICT]:
        HttpStatus.CONFLICT,
    [MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_NOT_FOUND]:
        HttpStatus.NOT_FOUND,
    [MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
    [MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_VERSION_CONFLICT]:
        HttpStatus.CONFLICT,
    [PersistenceExceptionCodeEnum.PERSISTENCE_LOCK_BUSY]: HttpStatus.CONFLICT,
    [SharedKernelExceptionCodeEnum.UUID_INVALID]:
        HttpStatus.UNPROCESSABLE_ENTITY,
};
