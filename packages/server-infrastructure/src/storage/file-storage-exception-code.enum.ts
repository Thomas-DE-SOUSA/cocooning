export const FileStorageExceptionCodeEnum = {
    FILE_STORAGE_KEY_INVALID: 'FILE_STORAGE_KEY_INVALID',
    FILE_STORAGE_DATA_CORRUPTED: 'FILE_STORAGE_DATA_CORRUPTED',
} as const;

export type FileStorageExceptionCode =
    (typeof FileStorageExceptionCodeEnum)[keyof typeof FileStorageExceptionCodeEnum];
