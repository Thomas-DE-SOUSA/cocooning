import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { PersistenceExceptionCodeEnum } from '@cocooning/couple-prisma/errors';
import { CoupleSharedKernelExceptionCodeEnum } from '@cocooning/couple-shared-kernel/exceptions';
import { FileStorageExceptionCodeEnum } from '@cocooning/server-infrastructure/storage';
import { SharedKernelExceptionCodeEnum } from '@cocooning/shared-kernel/exceptions';
import { EXCEPTION_STATUSES } from './exception-statuses';

const EVERY_CODE_ENUM = [
    AuthenticationExceptionCodeEnum,
    PairingExceptionCodeEnum,
    NoteExceptionCodeEnum,
    AgendaExceptionCodeEnum,
    MessagingExceptionCodeEnum,
    PersistenceExceptionCodeEnum,
    CoupleSharedKernelExceptionCodeEnum,
    SharedKernelExceptionCodeEnum,
    FileStorageExceptionCodeEnum,
];

// Deliberately answered 500 without detail: corrupted data or a programming error, never the client's fault.
const INTERNAL_CODES: readonly string[] = [
    PairingExceptionCodeEnum.PAIRING_COUPLE_DATA_CORRUPTED,
    NoteExceptionCodeEnum.NOTE_DATA_CORRUPTED,
    AgendaExceptionCodeEnum.CALENDAR_EVENT_DATA_CORRUPTED,
    MessagingExceptionCodeEnum.INSTANT_PHOTO_DATA_CORRUPTED,
    PersistenceExceptionCodeEnum.PERSISTENCE_NOT_INITIALIZED,
    PersistenceExceptionCodeEnum.PERSISTENCE_LOCK_OUTSIDE_TRANSACTION,
    CoupleSharedKernelExceptionCodeEnum.EXECUTION_CONTEXT_MISSING,
    SharedKernelExceptionCodeEnum.UUID_GENERATOR_NOT_CONFIGURED,
    SharedKernelExceptionCodeEnum.UUID_GENERATOR_ALREADY_CONFIGURED,
    SharedKernelExceptionCodeEnum.ENUM_VALUE_INVALID,
    SharedKernelExceptionCodeEnum.METADATA_DATA_CORRUPTED,
    FileStorageExceptionCodeEnum.FILE_STORAGE_KEY_INVALID,
    FileStorageExceptionCodeEnum.FILE_STORAGE_DATA_CORRUPTED,
];

const everyCode: readonly string[] = EVERY_CODE_ENUM.flatMap((codes) =>
    Object.values(codes),
);
const mappedCodes = Object.keys(EXCEPTION_STATUSES);

describe('Feature: the code to status table of the API (decision 0020)', () => {
    describe('Scenario: an exception code is declared', () => {
        it('either has a status or is declared internal', () => {
            const unclassified = everyCode.filter(
                (code) =>
                    !mappedCodes.includes(code) &&
                    !INTERNAL_CODES.includes(code),
            );
            expect(unclassified).toEqual([]);
        });
    });

    describe('Scenario: an internal code', () => {
        it('never gets a status, so its message never reaches the client', () => {
            expect(
                INTERNAL_CODES.filter((code) => mappedCodes.includes(code)),
            ).toEqual([]);
        });
    });

    describe('Scenario: a code is removed from its enum', () => {
        it('leaves no stale entry in the table', () => {
            expect(
                mappedCodes.filter((code) => !everyCode.includes(code)),
            ).toEqual([]);
        });
    });
});
