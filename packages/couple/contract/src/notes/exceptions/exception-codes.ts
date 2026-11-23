export const NoteExceptionCodeEnum = {
    NOTE_NOT_FOUND: 'NOTE_NOT_FOUND',
    NOTE_RESERVED_TO_OWNER: 'NOTE_RESERVED_TO_OWNER',
    NOTE_TITLE_INVALID: 'NOTE_TITLE_INVALID',
    NOTE_COUPLE_NOT_PAIRED: 'NOTE_COUPLE_NOT_PAIRED',
    NOTE_VERSION_CONFLICT: 'NOTE_VERSION_CONFLICT',
    NOTE_DATA_CORRUPTED: 'NOTE_DATA_CORRUPTED',
} as const;

export type NoteExceptionCode =
    (typeof NoteExceptionCodeEnum)[keyof typeof NoteExceptionCodeEnum];
